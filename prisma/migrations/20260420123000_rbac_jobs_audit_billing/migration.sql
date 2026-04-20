-- Core platform hardening: audit trail, critical jobs queue, and agency subscription.

CREATE TYPE "CriticalJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'RETRY_SCHEDULED', 'SUCCEEDED', 'FAILED');

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "agencyId" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "resourceId" TEXT,
  "summary" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CriticalJob" (
  "id" TEXT NOT NULL,
  "agencyId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" "CriticalJobStatus" NOT NULL DEFAULT 'QUEUED',
  "payload" JSONB NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 5,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastRunAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CriticalJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgencySubscription" (
  "id" TEXT NOT NULL,
  "agencyId" TEXT NOT NULL,
  "planCode" TEXT NOT NULL DEFAULT 'starter',
  "status" TEXT NOT NULL DEFAULT 'trialing',
  "seatLimit" INTEGER NOT NULL DEFAULT 3,
  "monthlyPriceUsd" INTEGER NOT NULL DEFAULT 0,
  "currentPeriodEnd" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AgencySubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CriticalJob_agencyId_idempotencyKey_key" ON "CriticalJob"("agencyId", "idempotencyKey");
CREATE INDEX "CriticalJob_agencyId_status_nextAttemptAt_idx" ON "CriticalJob"("agencyId", "status", "nextAttemptAt");
CREATE INDEX "CriticalJob_agencyId_type_createdAt_idx" ON "CriticalJob"("agencyId", "type", "createdAt");

CREATE INDEX "AuditLog_agencyId_createdAt_idx" ON "AuditLog"("agencyId", "createdAt");
CREATE INDEX "AuditLog_agencyId_resource_createdAt_idx" ON "AuditLog"("agencyId", "resource", "createdAt");

CREATE UNIQUE INDEX "AgencySubscription_agencyId_key" ON "AgencySubscription"("agencyId");

ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_agencyId_fkey"
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CriticalJob"
  ADD CONSTRAINT "CriticalJob_agencyId_fkey"
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AgencySubscription"
  ADD CONSTRAINT "AgencySubscription_agencyId_fkey"
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
