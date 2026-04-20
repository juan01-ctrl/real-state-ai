import {
  DeliveryStatus,
  FinancingMode,
  FollowUpEventStatus,
  LeadStage,
  MessageDirection,
  RecommendationUseCase,
  TaskStatus
} from "@prisma/client";

/** Etiquetas en español para valores persistidos / enums mostrados en la UI */

export function displayLeadStage(stage: LeadStage | string): string {
  const map: Record<string, string> = {
    NEW: "Nuevo",
    CONTACTED: "Contactado",
    QUALIFIED: "Calificado",
    VISIT_SCHEDULED: "Visita agendada",
    OFFER_NEGOTIATION: "Oferta / negociación",
    WON: "Ganado",
    LOST: "Perdido",
    NURTURE: "Nutrición"
  };
  return map[stage] ?? String(stage);
}

export function displayFinancingMode(mode: FinancingMode | string): string {
  const map: Record<string, string> = {
    CASH: "Contado",
    MORTGAGE: "Crédito hipotecario",
    PRE_APPROVED: "Preaprobado",
    UNKNOWN: "Desconocido"
  };
  return map[mode] ?? String(mode);
}

export function displayUrgency(u: string): string {
  const map: Record<string, string> = { HIGH: "Alta", MEDIUM: "Media", LOW: "Baja", high: "Alta", medium: "Media", low: "Baja" };
  return map[u] ?? u;
}

export function displaySeriousness(s: string): string {
  const map: Record<string, string> = { HIGH: "Alta", MEDIUM: "Media", LOW: "Baja", high: "Alta", medium: "Media", low: "Baja" };
  return map[s] ?? s;
}

export function displayMessageDirection(d: MessageDirection | string): string {
  const map: Record<string, string> = { INBOUND: "Entrante", OUTBOUND: "Saliente" };
  return map[d] ?? String(d);
}

export function displayDeliveryStatus(s: DeliveryStatus | string): string {
  const map: Record<string, string> = {
    NOT_SENT: "No enviado",
    DELIVERED: "Entregado",
    READ: "Leído",
    FAILED: "Fallido"
  };
  return map[s] ?? String(s);
}

export function displayTaskStatus(s: TaskStatus | string): string {
  const map: Record<string, string> = {
    OPEN: "Abierta",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada"
  };
  return map[s] ?? String(s);
}

export function displayFollowUpEventStatus(s: FollowUpEventStatus | string): string {
  const map: Record<string, string> = {
    SCHEDULED: "Programado",
    EXECUTED: "Ejecutado",
    FAILED: "Fallido",
    NEEDS_APPROVAL: "Requiere aprobación"
  };
  return map[s] ?? String(s);
}

export function displayChannel(channel: string): string {
  const map: Record<string, string> = {
    WHATSAPP: "WhatsApp",
    INSTAGRAM: "Instagram",
    WEB_FORM: "Formulario web",
    PORTAL: "Portal",
    MANUAL_IMPORT: "Importación manual"
  };
  return map[channel] ?? channel;
}

export function displayUseCase(u: RecommendationUseCase | string): string {
  const map: Record<string, string> = {
    LIVING: "Vivienda",
    INVESTMENT: "Inversión"
  };
  return map[u] ?? String(u);
}

export function displayPropertyType(t: string): string {
  const map: Record<string, string> = {
    apartment: "Departamento",
    townhouse: "PH / dúplex",
    single_family: "Casa",
    unknown: "Desconocido"
  };
  return map[t] ?? t;
}

export function displaySenderLabel(direction: string, senderName: string | null): string {
  if (senderName?.trim()) return senderName;
  return direction === "INBOUND" ? "Contacto" : "Agente";
}

export function formatTimelineMonths(months: number | null): string {
  if (months == null) return "Desconocido";
  if (months === 1) return "1 mes";
  return `${months} meses`;
}
