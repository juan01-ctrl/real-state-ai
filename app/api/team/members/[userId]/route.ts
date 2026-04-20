import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { requireSessionContext } from "@/lib/server/auth-session";
import { db } from "@/lib/server/db";
import { getTeamMembersForAgency } from "@/lib/server/read-models/team-members";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

function normalizeRole(role?: string): UserRole {
  return role === "AGENCY_ADMIN" ? UserRole.AGENCY_ADMIN : UserRole.AGENT;
}

interface UpdateMemberPayload {
  name?: string;
  role?: string;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const [{ userId }, { agencyId, userId: sessionUserId }] = await Promise.all([params, requireSessionContext()]);
    const payload = (await request.json()) as UpdateMemberPayload;
    const name = payload.name?.trim();

    const member = await db.user.findFirst({
      where: { id: userId, agencyId },
      select: { id: true }
    });

    if (!member) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    const nextRole = payload.role ? normalizeRole(payload.role) : undefined;

    if (nextRole === UserRole.AGENT && sessionUserId === userId) {
      const adminCount = await db.user.count({
        where: { agencyId, role: UserRole.AGENCY_ADMIN }
      });

      if (adminCount <= 1) {
        return NextResponse.json({ ok: false, error: "LAST_ADMIN_PROTECTED" }, { status: 400 });
      }
    }

    await db.user.update({
      where: { id: userId },
      data: {
        ...(name ? { name } : {}),
        ...(nextRole ? { role: nextRole } : {})
      }
    });

    const model = await getTeamMembersForAgency(agencyId);
    return NextResponse.json({ ok: true, ...model });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    return NextResponse.json({ ok: false, error: "TEAM_MEMBER_UPDATE_FAILED" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const [{ userId }, { agencyId, userId: sessionUserId }] = await Promise.all([params, requireSessionContext()]);

    const member = await db.user.findFirst({
      where: { id: userId, agencyId },
      select: { id: true, role: true }
    });

    if (!member) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    if (member.id === sessionUserId) {
      return NextResponse.json({ ok: false, error: "CANNOT_DELETE_SELF" }, { status: 400 });
    }

    if (member.role === UserRole.AGENCY_ADMIN) {
      const adminCount = await db.user.count({ where: { agencyId, role: UserRole.AGENCY_ADMIN } });
      if (adminCount <= 1) {
        return NextResponse.json({ ok: false, error: "LAST_ADMIN_PROTECTED" }, { status: 400 });
      }
    }

    await db.$transaction(async (tx) => {
      await tx.lead.updateMany({
        where: { ownerUserId: member.id, agencyId },
        data: { ownerUserId: null }
      });

      await tx.user.delete({ where: { id: member.id } });
    });

    const model = await getTeamMembersForAgency(agencyId);
    return NextResponse.json({ ok: true, ...model });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    return NextResponse.json({ ok: false, error: "TEAM_MEMBER_DELETE_FAILED" }, { status: 500 });
  }
}
