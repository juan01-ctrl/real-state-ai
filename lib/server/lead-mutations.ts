import {
  FollowUpEventStatus,
  LeadStage,
  Prisma,
  TaskStatus,
  TaskType
} from "@prisma/client";
import { db } from "@/lib/server/db";

const PIPELINE_BEFORE_VISIT: LeadStage[] = [
  LeadStage.NEW,
  LeadStage.CONTACTED,
  LeadStage.QUALIFIED
];

export async function getLeadForAgency(leadId: string, agencyId: string) {
  return db.lead.findFirst({
    where: { id: leadId, agencyId },
    select: { id: true, stage: true, agencyId: true }
  });
}

/** Operaciones combinadas (p. ej. PATCH API) en una sola transacción */
export async function patchLeadOperations(
  leadId: string,
  agencyId: string,
  payload: {
    stage?: LeadStage;
    ownerUserId?: string | null;
    note?: string;
  },
  authorName: string
) {
  const existing = await db.lead.findFirst({
    where: { id: leadId, agencyId },
    select: { id: true, stage: true, ownerUserId: true }
  });
  if (!existing) return { ok: false as const, error: "NOT_FOUND" as const };

  const nextStage = payload.stage;
  const ownerUserId = payload.ownerUserId;
  const note = payload.note?.trim();

  const stageWillChange = Boolean(nextStage && nextStage !== existing.stage);
  const ownerWillChange =
    ownerUserId !== undefined && (ownerUserId || null) !== (existing.ownerUserId ?? null);

  if (!stageWillChange && !ownerWillChange && !note) {
    return { ok: false as const, error: "EMPTY_PAYLOAD" as const };
  }

  if (ownerUserId) {
    const owner = await db.user.findFirst({
      where: { id: ownerUserId, agencyId },
      select: { id: true }
    });
    if (!owner) return { ok: false as const, error: "OWNER_NOT_FOUND" as const };
  }

  await db.$transaction(async (tx) => {
    if (stageWillChange && nextStage) {
      await tx.lead.update({
        where: { id: existing.id },
        data: { stage: nextStage }
      });
      await tx.leadStageHistory.create({
        data: {
          leadId: existing.id,
          fromStage: existing.stage,
          toStage: nextStage,
          reason: "Actualización manual desde API de operaciones"
        }
      });
    }

    if (ownerWillChange) {
      await tx.lead.update({
        where: { id: existing.id },
        data: { ownerUserId: ownerUserId || null }
      });
    }

    if (note) {
      await tx.note.create({
        data: {
          leadId: existing.id,
          author: authorName || "Operador",
          body: note
        }
      });
    }

    await tx.lead.update({
      where: { id: existing.id },
      data: { lastActivityAt: new Date() }
    });

    await tx.task.updateMany({
      where: {
        leadId: existing.id,
        status: TaskStatus.OPEN,
        type: TaskType.MANUAL_REVIEW
      },
      data: { status: TaskStatus.COMPLETED }
    });
  });

  return { ok: true as const };
}

function bumpActivity(): Pick<Prisma.LeadUpdateInput, "lastActivityAt" | "updatedAt"> {
  return { lastActivityAt: new Date() };
}

export async function changeLeadStage(
  leadId: string,
  agencyId: string,
  nextStage: LeadStage,
  reason = "Cambio manual de etapa"
) {
  const existing = await getLeadForAgency(leadId, agencyId);
  if (!existing) return { ok: false as const, error: "NOT_FOUND" };

  if (existing.stage === nextStage) {
    await db.lead.update({
      where: { id: leadId },
      data: bumpActivity()
    });
    return { ok: true as const, stageChanged: false };
  }

  await db.$transaction(async (tx) => {
    await tx.lead.update({
      where: { id: leadId },
      data: {
        stage: nextStage,
        ...bumpActivity()
      }
    });
    await tx.leadStageHistory.create({
      data: {
        leadId,
        fromStage: existing.stage,
        toStage: nextStage,
        reason
      }
    });
    await tx.task.updateMany({
      where: {
        leadId,
        status: TaskStatus.OPEN,
        type: TaskType.MANUAL_REVIEW
      },
      data: { status: TaskStatus.COMPLETED }
    });
  });

  return { ok: true as const, stageChanged: true };
}

export async function assignLeadOwner(leadId: string, agencyId: string, ownerUserId: string | null) {
  const existing = await db.lead.findFirst({
    where: { id: leadId, agencyId },
    select: { id: true, ownerUserId: true }
  });
  if (!existing) return { ok: false as const, error: "NOT_FOUND" };

  if ((ownerUserId ?? null) === (existing.ownerUserId ?? null)) {
    return { ok: true as const, unchanged: true as const };
  }

  if (ownerUserId) {
    const owner = await db.user.findFirst({
      where: { id: ownerUserId, agencyId },
      select: { id: true }
    });
    if (!owner) return { ok: false as const, error: "OWNER_NOT_FOUND" };
  }

  await db.lead.update({
    where: { id: leadId },
    data: {
      ownerUserId,
      ...bumpActivity()
    }
  });

  return { ok: true as const, unchanged: false as const };
}

export async function addLeadNote(leadId: string, agencyId: string, body: string, authorName: string) {
  const existing = await getLeadForAgency(leadId, agencyId);
  if (!existing) return { ok: false as const, error: "NOT_FOUND" };

  const trimmed = body.trim();
  if (!trimmed) return { ok: false as const, error: "EMPTY_NOTE" };

  await db.$transaction(async (tx) => {
    await tx.note.create({
      data: {
        leadId,
        body: trimmed,
        author: authorName || "Operador"
      }
    });
    await tx.lead.update({
      where: { id: leadId },
      data: bumpActivity()
    });
    await tx.task.updateMany({
      where: {
        leadId,
        status: TaskStatus.OPEN,
        type: TaskType.MANUAL_REVIEW
      },
      data: { status: TaskStatus.COMPLETED }
    });
  });

  return { ok: true as const };
}

export async function createLeadTask(
  leadId: string,
  agencyId: string,
  input: { title: string; type: TaskType; dueAt?: Date | null }
) {
  const existing = await getLeadForAgency(leadId, agencyId);
  if (!existing) return { ok: false as const, error: "NOT_FOUND" };

  const title = input.title.trim();
  if (!title) return { ok: false as const, error: "EMPTY_TITLE" };

  await db.$transaction(async (tx) => {
    await tx.task.create({
      data: {
        leadId,
        type: input.type,
        title,
        status: TaskStatus.OPEN,
        dueAt: input.dueAt ?? null
      }
    });
    await tx.lead.update({
      where: { id: leadId },
      data: bumpActivity()
    });
  });

  return { ok: true as const };
}

export async function completeLeadTask(leadId: string, agencyId: string, taskId: string) {
  const task = await db.task.findFirst({
    where: { id: taskId, leadId },
    select: { id: true, status: true, lead: { select: { agencyId: true } } }
  });

  if (!task || task.lead.agencyId !== agencyId) {
    return { ok: false as const, error: "NOT_FOUND" };
  }

  if (task.status === TaskStatus.COMPLETED) {
    return { ok: true as const, alreadyDone: true };
  }

  await db.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.COMPLETED }
    });
    await tx.lead.update({
      where: { id: leadId },
      data: bumpActivity()
    });
  });

  return { ok: true as const, alreadyDone: false };
}

export async function reopenLeadTask(leadId: string, agencyId: string, taskId: string) {
  const task = await db.task.findFirst({
    where: { id: taskId, leadId },
    select: { id: true, status: true, lead: { select: { agencyId: true } } }
  });

  if (!task || task.lead.agencyId !== agencyId) {
    return { ok: false as const, error: "NOT_FOUND" as const };
  }

  if (task.status === TaskStatus.OPEN) {
    return { ok: true as const, unchanged: true as const };
  }

  if (task.status === TaskStatus.CANCELLED) {
    return { ok: false as const, error: "CANNOT_REOPEN" as const };
  }

  await db.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.OPEN }
    });
    await tx.lead.update({
      where: { id: leadId },
      data: bumpActivity()
    });
  });

  return { ok: true as const, unchanged: false as const };
}

/**
 * Marca visita como agendada: avanza a VISIT_SCHEDULED si aún está antes en el embudo;
 * registra historial; opcionalmente crea un evento de seguimiento para confirmar visita.
 */
export async function markVisitBooked(leadId: string, agencyId: string) {
  const lead = await db.lead.findFirst({
    where: { id: leadId, agencyId },
    select: { id: true, stage: true }
  });
  if (!lead) return { ok: false as const, error: "NOT_FOUND" };

  const reason = "Visita agendada (operador)";

  if (PIPELINE_BEFORE_VISIT.includes(lead.stage)) {
    await db.$transaction(async (tx) => {
      await tx.lead.update({
        where: { id: leadId },
        data: {
          stage: LeadStage.VISIT_SCHEDULED,
          ...bumpActivity()
        }
      });
      await tx.leadStageHistory.create({
        data: {
          leadId,
          fromStage: lead.stage,
          toStage: LeadStage.VISIT_SCHEDULED,
          reason
        }
      });
      await tx.followUpEvent.create({
        data: {
          leadId,
          status: FollowUpEventStatus.SCHEDULED,
          title: "Confirmar visita",
          detail: "Verificar asistencia y mandar ubicación al comprador.",
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });
      await tx.task.updateMany({
        where: {
          leadId,
          status: TaskStatus.OPEN,
          type: TaskType.MANUAL_REVIEW
        },
        data: { status: TaskStatus.COMPLETED }
      });
    });
    return { ok: true as const, advanced: true };
  }

  await db.lead.update({
    where: { id: leadId },
    data: bumpActivity()
  });

  return { ok: true as const, advanced: false };
}
