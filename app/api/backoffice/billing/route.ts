import { NextRequest, NextResponse } from "next/server";
import { logAuditEvent } from "@/lib/server/audit";
import { requirePermission } from "@/lib/server/auth-session";
import { db } from "@/lib/server/db";
import { ensureAgencySubscription } from "@/lib/server/read-models/backoffice";

interface BillingPatchPayload {
  planCode?: string;
  status?: string;
  seatLimit?: number;
  monthlyPriceUsd?: number;
  currentPeriodEnd?: string | null;
}

export async function GET() {
  try {
    const { agencyId } = await requirePermission("backoffice.read");
    const subscription = await ensureAgencySubscription(agencyId);
    return NextResponse.json({
      ok: true,
      subscription: {
        ...subscription,
        createdAt: subscription.createdAt.toISOString(),
        updatedAt: subscription.updatedAt.toISOString(),
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "BILLING_FETCH_FAILED" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { agencyId, userId } = await requirePermission("billing.manage");
    const payload = (await request.json()) as BillingPatchPayload;
    const data: {
      planCode?: string;
      status?: string;
      seatLimit?: number;
      monthlyPriceUsd?: number;
      currentPeriodEnd?: Date | null;
    } = {};

    if (typeof payload.planCode === "string" && payload.planCode.trim()) {
      data.planCode = payload.planCode.trim().toLowerCase();
    }
    if (typeof payload.status === "string" && payload.status.trim()) {
      data.status = payload.status.trim().toLowerCase();
    }
    if (typeof payload.seatLimit === "number" && Number.isFinite(payload.seatLimit)) {
      data.seatLimit = Math.max(1, Math.min(999, Math.round(payload.seatLimit)));
    }
    if (typeof payload.monthlyPriceUsd === "number" && Number.isFinite(payload.monthlyPriceUsd)) {
      data.monthlyPriceUsd = Math.max(0, Math.round(payload.monthlyPriceUsd));
    }
    if (payload.currentPeriodEnd === null) {
      data.currentPeriodEnd = null;
    } else if (typeof payload.currentPeriodEnd === "string" && payload.currentPeriodEnd.trim()) {
      const date = new Date(payload.currentPeriodEnd);
      if (!Number.isNaN(date.getTime())) {
        data.currentPeriodEnd = date;
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: false, error: "EMPTY_PAYLOAD" }, { status: 400 });
    }

    await ensureAgencySubscription(agencyId);
    const updated = await db.agencySubscription.update({
      where: { agencyId },
      data
    });

    await logAuditEvent({
      agencyId,
      userId,
      action: "billing.subscription.updated",
      resource: "AgencySubscription",
      resourceId: updated.id,
      summary: "Plan y límites actualizados",
      metadata: data
    });

    return NextResponse.json({
      ok: true,
      subscription: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        currentPeriodEnd: updated.currentPeriodEnd?.toISOString() ?? null
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "BILLING_UPDATE_FAILED" }, { status: 500 });
  }
}
