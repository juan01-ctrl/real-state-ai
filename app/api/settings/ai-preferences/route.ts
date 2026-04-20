import { NextRequest, NextResponse } from "next/server";
import { logAuditEvent } from "@/lib/server/audit";
import { requirePermission } from "@/lib/server/auth-session";
import { db } from "@/lib/server/db";
import { getAgencyAiPreferences } from "@/lib/server/read-models/agency-settings";

type MatchingMode = "CONSERVADOR" | "AGRESIVO";
const allowedTones = [
  "Sofisticado y reservado",
  "Directo y profesional",
  "Cálido y cercano",
  "Técnico y preciso"
] as const;

type OutreachTone = (typeof allowedTones)[number];

interface UpdatePayload {
  urgencyThreshold?: number;
  matchingMode?: MatchingMode;
  outreachTone?: OutreachTone;
}

function clampUrgency(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export async function GET() {
  try {
    const { agencyId } = await requirePermission("settings.read");
    const model = await getAgencyAiPreferences(agencyId);
    return NextResponse.json({ ok: true, ...model });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }

    return NextResponse.json({ ok: false, error: "AI_PREFS_FETCH_FAILED" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { agencyId, userId } = await requirePermission("settings.write");
    const payload = (await request.json()) as UpdatePayload;

    const data: {
      aiUrgencyThreshold?: number;
      aiMatchingMode?: MatchingMode;
      aiOutreachTone?: OutreachTone;
    } = {};

    if (payload.urgencyThreshold !== undefined) {
      if (!Number.isFinite(payload.urgencyThreshold)) {
        return NextResponse.json({ ok: false, error: "INVALID_URGENCY_THRESHOLD" }, { status: 400 });
      }
      data.aiUrgencyThreshold = clampUrgency(payload.urgencyThreshold);
    }

    if (payload.matchingMode !== undefined) {
      if (payload.matchingMode !== "CONSERVADOR" && payload.matchingMode !== "AGRESIVO") {
        return NextResponse.json({ ok: false, error: "INVALID_MATCHING_MODE" }, { status: 400 });
      }
      data.aiMatchingMode = payload.matchingMode;
    }

    if (payload.outreachTone !== undefined) {
      if (!allowedTones.includes(payload.outreachTone)) {
        return NextResponse.json({ ok: false, error: "INVALID_OUTREACH_TONE" }, { status: 400 });
      }
      data.aiOutreachTone = payload.outreachTone;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: false, error: "EMPTY_PAYLOAD" }, { status: 400 });
    }

    await db.agency.update({
      where: { id: agencyId },
      data
    });

    await logAuditEvent({
      agencyId,
      userId,
      action: "settings.ai_preferences.updated",
      resource: "Agency",
      resourceId: agencyId,
      summary: "Preferencias IA actualizadas",
      metadata: data
    });

    const model = await getAgencyAiPreferences(agencyId);
    return NextResponse.json({ ok: true, ...model });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }

    return NextResponse.json({ ok: false, error: "AI_PREFS_UPDATE_FAILED" }, { status: 500 });
  }
}
