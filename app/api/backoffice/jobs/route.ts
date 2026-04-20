import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/server/auth-session";
import { db } from "@/lib/server/db";
import { processDueCriticalJobs } from "@/lib/server/critical-jobs";
import { runCriticalJobHandler } from "@/lib/server/job-handlers";

export async function GET() {
  try {
    const { agencyId } = await requirePermission("backoffice.read");
    const jobs = await db.criticalJob.findMany({
      where: { agencyId },
      orderBy: [{ updatedAt: "desc" }],
      take: 100
    });

    return NextResponse.json({
      ok: true,
      jobs: jobs.map((job) => ({
        id: job.id,
        type: job.type,
        status: job.status,
        attemptCount: job.attemptCount,
        maxAttempts: job.maxAttempts,
        nextAttemptAt: job.nextAttemptAt.toISOString(),
        lastRunAt: job.lastRunAt?.toISOString() ?? null,
        lastError: job.lastError,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString()
      }))
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "JOBS_FETCH_FAILED" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("jobs.manage");
    const payload = (await request.json().catch(() => ({}))) as { limit?: number };
    const result = await processDueCriticalJobs({
      limit: payload.limit,
      handler: runCriticalJobHandler
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "JOBS_PROCESS_FAILED" }, { status: 500 });
  }
}
