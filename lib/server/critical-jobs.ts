import { CriticalJobStatus, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { db } from "@/lib/server/db";

const BASE_RETRY_DELAY_MS = 30_000;

export async function enqueueCriticalJob(input: {
  agencyId: string;
  type: string;
  payload: Prisma.InputJsonValue;
  idempotencyKey?: string;
  maxAttempts?: number;
}) {
  const idempotencyKey = input.idempotencyKey ?? `${input.type}:${randomUUID()}`;

  return db.criticalJob.upsert({
    where: {
      agencyId_idempotencyKey: {
        agencyId: input.agencyId,
        idempotencyKey
      }
    },
    create: {
      agencyId: input.agencyId,
      type: input.type,
      payload: input.payload,
      idempotencyKey,
      maxAttempts: Math.max(1, Math.min(12, input.maxAttempts ?? 5)),
      status: CriticalJobStatus.QUEUED
    },
    update: {}
  });
}

function nextBackoff(attemptCount: number) {
  const exponent = Math.max(1, attemptCount);
  return BASE_RETRY_DELAY_MS * Math.min(64, 2 ** exponent);
}

export async function processDueCriticalJobs(options: {
  limit?: number;
  handler: (job: { id: string; agencyId: string; type: string; payload: Prisma.JsonValue }) => Promise<void>;
}) {
  const limit = Math.max(1, Math.min(50, options.limit ?? 10));
  const now = new Date();

  const jobs = await db.criticalJob.findMany({
    where: {
      status: { in: [CriticalJobStatus.QUEUED, CriticalJobStatus.RETRY_SCHEDULED] },
      nextAttemptAt: { lte: now }
    },
    orderBy: [{ nextAttemptAt: "asc" }, { createdAt: "asc" }],
    take: limit
  });

  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  for (const job of jobs) {
    processed += 1;

    const claimed = await db.criticalJob.updateMany({
      where: {
        id: job.id,
        status: { in: [CriticalJobStatus.QUEUED, CriticalJobStatus.RETRY_SCHEDULED] }
      },
      data: {
        status: CriticalJobStatus.RUNNING,
        lastRunAt: new Date(),
        attemptCount: { increment: 1 }
      }
    });

    if (claimed.count === 0) continue;

    const fresh = await db.criticalJob.findUnique({
      where: { id: job.id },
      select: { id: true, agencyId: true, type: true, payload: true, attemptCount: true, maxAttempts: true }
    });
    if (!fresh) continue;

    try {
      await options.handler({
        id: fresh.id,
        agencyId: fresh.agencyId,
        type: fresh.type,
        payload: fresh.payload
      });

      await db.criticalJob.update({
        where: { id: fresh.id },
        data: {
          status: CriticalJobStatus.SUCCEEDED,
          lastError: null
        }
      });
      succeeded += 1;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "unknown_error";
      const exhausted = fresh.attemptCount >= fresh.maxAttempts;
      await db.criticalJob.update({
        where: { id: fresh.id },
        data: exhausted
          ? {
              status: CriticalJobStatus.FAILED,
              lastError: errorMessage
            }
          : {
              status: CriticalJobStatus.RETRY_SCHEDULED,
              nextAttemptAt: new Date(Date.now() + nextBackoff(fresh.attemptCount)),
              lastError: errorMessage
            }
      });
      failed += 1;
    }
  }

  return {
    processed,
    succeeded,
    failed
  };
}
