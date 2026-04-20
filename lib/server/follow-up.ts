import { FollowUpEventStatus, TaskStatus, TaskType } from "@prisma/client";
import { db } from "@/lib/server/db";

interface FollowUpInput {
  leadId: string;
  urgency: "high" | "medium" | "low";
  recommendedActionType: string;
  requiresManualReview: boolean;
  outreachTone?: "Sofisticado y reservado" | "Directo y profesional" | "Cálido y cercano" | "Técnico y preciso";
}

function addHours(base: Date, hours: number) {
  return new Date(base.getTime() + hours * 60 * 60 * 1000);
}

export async function createFollowUpPlan(input: FollowUpInput) {
  await db.followUpEvent.deleteMany({ where: { leadId: input.leadId } });
  await db.task.deleteMany({
    where: {
      leadId: input.leadId,
      status: TaskStatus.OPEN,
      OR: [
        { type: TaskType.VISIT_CONFIRM, title: "Confirmar franjas de visita con el comprador" },
        { type: TaskType.FOLLOW_UP_MESSAGE, title: "Enviar mensaje de seguimiento según intención actual" }
      ]
    }
  });

  const now = new Date();
  const tone = input.outreachTone ?? "Sofisticado y reservado";
  const detailByTone = {
    "Sofisticado y reservado": {
      visit: "Si no hay respuesta, llamar al comprador y cerrar horario",
      clarify: "Enviar mensaje consultivo si el comprador no responde"
    },
    "Directo y profesional": {
      visit: "Llamar hoy y cerrar franja de visita con hora concreta.",
      clarify: "Enviar un mensaje breve y pedir confirmación puntual."
    },
    "Cálido y cercano": {
      visit: "Retomar con tono cercano y proponer dos horarios simples de visita.",
      clarify: "Contactar con mensaje amigable y abrir conversación de necesidades."
    },
    "Técnico y preciso": {
      visit: "Confirmar disponibilidad, dirección y franja exacta de visita.",
      clarify: "Solicitar datos faltantes con preguntas concretas y ordenadas."
    }
  } as const;

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
      detail: detailByTone[tone].visit,
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
      detail: detailByTone[tone].clarify,
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
