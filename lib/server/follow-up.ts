import { FollowUpEventStatus, TaskType } from "@prisma/client";
import { db } from "@/lib/server/db";

interface FollowUpInput {
  leadId: string;
  urgency: "high" | "medium" | "low";
  recommendedActionType: string;
  requiresManualReview: boolean;
}

function addHours(base: Date, hours: number) {
  return new Date(base.getTime() + hours * 60 * 60 * 1000);
}

export async function createFollowUpPlan(input: FollowUpInput) {
  await db.followUpEvent.deleteMany({ where: { leadId: input.leadId } });

  const now = new Date();
  const events: Array<{
    status: FollowUpEventStatus;
    title: string;
    detail: string;
    scheduledFor: Date;
    occurredAt?: Date;
  }> = [];

  events.push({
    status: FollowUpEventStatus.EXECUTED,
    title: "Calificación completada",
    detail: "Perfil del lead y evaluación comercial generados",
    scheduledFor: now,
    occurredAt: now
  });

  if (input.requiresManualReview) {
    events.push({
      status: FollowUpEventStatus.NEEDS_APPROVAL,
      title: "Revisión del operador requerida",
      detail: "Perfil de baja confianza: validación manual necesaria",
      scheduledFor: addHours(now, 1)
    });
  }

  if (input.recommendedActionType === "book_visit") {
    events.push({
      status: FollowUpEventStatus.SCHEDULED,
      title: "Seguimiento para agendar visita",
      detail: "Si no hay respuesta, llamar al comprador y cerrar horario",
      scheduledFor: addHours(now, input.urgency === "high" ? 4 : 12)
    });

    await db.task.create({
      data: {
        leadId: input.leadId,
        type: TaskType.VISIT_CONFIRM,
        title: "Confirmar franjas de visita con el comprador",
        dueAt: addHours(now, input.urgency === "high" ? 4 : 12)
      }
    });
  } else {
    events.push({
      status: FollowUpEventStatus.SCHEDULED,
      title: "Seguimiento para aclarar intención",
      detail: "Enviar mensaje consultivo si el comprador no responde",
      scheduledFor: addHours(now, input.urgency === "high" ? 6 : 24)
    });

    await db.task.create({
      data: {
        leadId: input.leadId,
        type: TaskType.FOLLOW_UP_MESSAGE,
        title: "Enviar mensaje de seguimiento según intención actual",
        dueAt: addHours(now, input.urgency === "high" ? 6 : 24)
      }
    });
  }

  for (const event of events) {
    await db.followUpEvent.create({
      data: {
        leadId: input.leadId,
        status: event.status,
        title: event.title,
        detail: event.detail,
        scheduledFor: event.scheduledFor,
        occurredAt: event.occurredAt
      }
    });
  }

  return events;
}
