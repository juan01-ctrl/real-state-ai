import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/server/auth-session";
import { db } from "@/lib/server/db";

export async function GET(request: NextRequest) {
  try {
    const { agencyId } = await requirePermission("backoffice.read");
    const limitRaw = Number(request.nextUrl.searchParams.get("limit") ?? "100");
    const limit = Math.max(1, Math.min(500, Number.isFinite(limitRaw) ? limitRaw : 100));

    const rows = await db.auditLog.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return NextResponse.json({
      ok: true,
      rows: rows.map((row) => ({
        id: row.id,
        action: row.action,
        resource: row.resource,
        resourceId: row.resourceId,
        summary: row.summary,
        userId: row.userId,
        metadata: row.metadata,
        createdAt: row.createdAt.toISOString()
      }))
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "AUDIT_FETCH_FAILED" }, { status: 500 });
  }
}
