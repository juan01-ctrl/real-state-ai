import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { requireSessionContext } from "@/lib/server/auth-session";
import { db } from "@/lib/server/db";
import { getTeamMembersForAgency } from "@/lib/server/read-models/team-members";

function normalizeRole(role?: string): UserRole {
  return role === "AGENCY_ADMIN" ? UserRole.AGENCY_ADMIN : UserRole.AGENT;
}

export async function GET() {
  try {
    const { agencyId } = await requireSessionContext();
    const model = await getTeamMembersForAgency(agencyId);
    return NextResponse.json({ ok: true, ...model });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    return NextResponse.json({ ok: false, error: "TEAM_MEMBERS_FETCH_FAILED" }, { status: 500 });
  }
}

interface CreateMemberPayload {
  name?: string;
  email?: string;
  role?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { agencyId } = await requireSessionContext();
    const payload = (await request.json()) as CreateMemberPayload;

    const name = payload.name?.trim();
    const email = payload.email?.trim().toLowerCase();
    const role = normalizeRole(payload.role);

    if (!name || !email) {
      return NextResponse.json({ ok: false, error: "NAME_EMAIL_REQUIRED" }, { status: 400 });
    }

    const existsInAgency = await db.user.findFirst({
      where: { agencyId, email },
      select: { id: true }
    });

    if (existsInAgency) {
      return NextResponse.json({ ok: false, error: "EMAIL_ALREADY_EXISTS" }, { status: 409 });
    }

    await db.user.create({
      data: {
        agencyId,
        name,
        email,
        role,
        emailVerified: false
      }
    });

    const model = await getTeamMembersForAgency(agencyId);
    return NextResponse.json({ ok: true, ...model }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    return NextResponse.json({ ok: false, error: "TEAM_MEMBER_CREATE_FAILED" }, { status: 500 });
  }
}
