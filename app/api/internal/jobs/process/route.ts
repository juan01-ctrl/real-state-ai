import { NextRequest, NextResponse } from "next/server";
import { processDueCriticalJobs } from "@/lib/server/critical-jobs";
import { runCriticalJobHandler } from "@/lib/server/job-handlers";

function isAuthorized(request: NextRequest) {
  const expected = process.env.INTERNAL_JOBS_SECRET?.trim();
  if (!expected) return false;
  const auth = request.headers.get("authorization") ?? "";
  return auth === `Bearer ${expected}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { limit?: number };
  const result = await processDueCriticalJobs({
    limit: body.limit,
    handler: runCriticalJobHandler
  });

  return NextResponse.json({
    ok: true,
    ...result
  });
}
