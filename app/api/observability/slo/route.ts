import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/server/auth-session";
import { db } from "@/lib/server/db";

export async function GET() {
  try {
    const { agencyId } = await requirePermission("backoffice.read");
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const rows = await db.analyticsEvent.findMany({
      where: {
        agencyId,
        type: "api.request",
        occurredAt: { gte: since }
      },
      orderBy: { occurredAt: "desc" },
      take: 5000
    });

    const parsed = rows
      .map((row) => row.properties as { statusCode?: number; latencyMs?: number; ok?: boolean; route?: string })
      .filter((item) => typeof item.statusCode === "number" && typeof item.latencyMs === "number");

    const total = parsed.length;
    const success = parsed.filter((item) => item.ok !== false && (item.statusCode ?? 500) < 500).length;
    const p95 = (() => {
      if (total === 0) return 0;
      const sorted = parsed.map((item) => item.latencyMs ?? 0).sort((a, b) => a - b);
      const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(sorted.length * 0.95)));
      return sorted[idx] ?? 0;
    })();

    const errorRate = total === 0 ? 0 : Number((((total - success) / total) * 100).toFixed(2));

    return NextResponse.json({
      ok: true,
      windowHours: 24,
      totalRequests: total,
      successRatePct: total === 0 ? 100 : Number(((success / total) * 100).toFixed(2)),
      errorRatePct: errorRate,
      p95LatencyMs: Math.round(p95),
      target: {
        successRatePct: 99,
        p95LatencyMs: 1500
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "SLO_FETCH_FAILED" }, { status: 500 });
  }
}
