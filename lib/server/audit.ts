import { Prisma } from "@prisma/client";
import { db } from "@/lib/server/db";

export async function logAuditEvent(input: {
  agencyId: string;
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  summary?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    await db.auditLog.create({
      data: {
        agencyId: input.agencyId,
        userId: input.userId ?? null,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId ?? null,
        summary: input.summary,
        metadata: input.metadata
      }
    });
  } catch {
    // No bloqueamos flujos de negocio por fallas de auditoría.
  }
}
