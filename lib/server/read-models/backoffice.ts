import { CriticalJobStatus } from "@prisma/client";
import { db } from "@/lib/server/db";

export async function ensureAgencySubscription(agencyId: string) {
  return db.agencySubscription.upsert({
    where: { agencyId },
    update: {},
    create: {
      agencyId
    }
  });
}

export async function getBackofficeModel(agencyId: string) {
  const [subscription, auditLogs, queueStats, recentJobs] = await Promise.all([
    ensureAgencySubscription(agencyId),
    db.auditLog.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
      take: 50
    }),
    db.criticalJob.groupBy({
      by: ["status"],
      where: { agencyId },
      _count: { _all: true }
    }),
    db.criticalJob.findMany({
      where: { agencyId },
      orderBy: [{ updatedAt: "desc" }],
      take: 25
    })
  ]);

  const statusMap: Record<CriticalJobStatus, number> = {
    QUEUED: 0,
    RUNNING: 0,
    RETRY_SCHEDULED: 0,
    SUCCEEDED: 0,
    FAILED: 0
  };
  for (const row of queueStats) {
    statusMap[row.status] = row._count._all;
  }

  return {
    subscription: {
      ...subscription,
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null
    },
    queue: {
      summary: statusMap,
      jobs: recentJobs.map((job) => ({
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
    },
    audit: auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      summary: log.summary,
      userId: log.userId,
      metadata: log.metadata,
      createdAt: log.createdAt.toISOString()
    }))
  };
}
