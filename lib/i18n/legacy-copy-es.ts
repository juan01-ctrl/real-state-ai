/**
 * Normaliza textos persistidos en inglés (versiones anteriores del pipeline o demos)
 * para la UI en español sin exigir re-migración manual de filas.
 */

const FOLLOW_UP_TITLE_ES: Record<string, string> = {
  "Qualification pipeline completed": "Calificación completada",
  "Visit scheduling follow-up": "Seguimiento para agendar visita",
  "Follow-up to clarify intent": "Seguimiento para aclarar intención",
  "Operator review required": "Revisión del operador requerida"
};

const FOLLOW_UP_DETAIL_ES: Record<string, string> = {
  "Lead profile and commercial assessment generated": "Perfil del lead y evaluación comercial generados",
  "If no response, call buyer and secure time slot": "Si no hay respuesta, llamar al comprador y cerrar horario",
  "Send consultative message if buyer does not respond": "Enviar mensaje consultivo si el comprador no responde",
  "Low confidence profile: manual validation needed": "Perfil de baja confianza: validación manual necesaria"
};

const REC_REASON_ES: Record<string, string> = {
  "Inside preferred zone cluster": "Dentro del cluster de zona preferida",
  "Inside preferred budget range": "Dentro del rango de presupuesto indicado",
  "Inside stated max budget": "Dentro del presupuesto máximo indicado",
  "Bedroom count aligns with requirement": "Cantidad de dormitorios alineada con el pedido",
  "Strong light and layout for remote work": "Buena luz y distribución para trabajo remoto",
  "Within financing comfort band": "Dentro de la franja cómoda de financiación",
  "7-min walk from requested area": "A ~7 min a pie del área pedida",
  "Balcony + low HOA confirmed": "Balcón y expensas bajas confirmadas"
};

const TRADEOFF_ES: Record<string, string> = {
  "Vs #2, this option is more budget-friendly": "Frente a #2, esta opción es más accesible en precio",
  "Smaller master bedroom than option #2": "Dormitorio principal más chico que la opción #2",
  "8% higher HOA than #1": "Expensas ~8% más altas que la #1"
};

const APPRECIATION_ES: Record<string, string> = {
  "Premium micro-zone, stable long-term demand": "Microzona premium, demanda estable a largo plazo",
  "Low volatility and solid family demand": "Baja volatilidad y demanda familiar sólida",
  "Good buyer velocity in this price band": "Buena velocidad de compradores en esta franja de precio",
  "Rental turnover and resilient pricing": "Rotación de alquiler y precios resilientes",
  "Good entry point for first investment": "Buen punto de entrada para primera inversión",
  "Premium block with low vacancy": "Manzana premium con baja vacancia"
};

const PROPERTY_TITLE_ES: Record<string, string> = {
  "2BR with Balcony on Arevalo": "2 amb. con balcón en Arevalo",
  "2BR with Balcony on Arévalo": "2 amb. con balcón en Arevalo",
  "Colegiales Corner Unit": "Esquina luminosa en Colegiales",
  "Corner unit in Colegiales": "Esquina luminosa en Colegiales"
};

const MESSAGE_BODY_ES: Record<string, string> = {
  "Hi, we are looking for a 2 bedroom apartment in Palermo Soho or Colegiales. Budget is around USD 240k to 280k.":
    "Hola, buscamos un departamento de 2 dormitorios en Palermo Soho o Colegiales. Presupuesto alrededor de USD 240k a 280k.",
  "Perfect, what timeline are you considering and are you financing or cash?":
    "Perfecto, ¿qué plazo tienen en mente y van por financiación o contado?",
  "We are pre-approved and ideally want to move in within 2 months. Main concern is finding low expensas and parking.":
    "Tenemos crédito preaprobado y nos gustaría mudarnos en 2 meses. Lo que más nos preocupa son expensas bajas y cochera.",
  "If we can visit this weekend I can move quickly, financing is already approved.":
    "Si podemos visitar este fin de semana me puedo mover rápido, la financiación ya está aprobada.",
  "Great, I selected 3 options in Palermo/Colegiales with balcony and strong value per sqm.":
    "Genial, seleccioné 3 opciones en Palermo/Colegiales con balcón y buen valor por m².",
  "I can lock two visit slots for Saturday at 11:00 and 13:00. Which one works for you and your partner?":
    "Puedo reservar dos franjas de visita el sábado a las 11:00 y 13:00. ¿Cuál les sirve a vos y a tu pareja?"
};

const NEXT_ACTION_TITLE_ES: Record<string, string> = {
  "Confirm Saturday visit window": "Confirmar franja de visita el sábado",
  "Complete critical qualification data": "Completar datos críticos de calificación",
  "Propose visit times now": "Proponer horarios de visita ahora",
  "Send curated property shortlist": "Enviar shortlist curado de propiedades",
  "Move to nurture cadence": "Pasar a cadencia de nutrición",
  "Escalate to broker review": "Elevar a revisión del broker",
  "Define next action manually": "Definir la próxima acción manualmente"
};

const NEXT_ACTION_DETAIL_ES: Record<string, string> = {
  "Approve and send the pending message, then create visit placeholders for the top two listings.":
    "Aprobá y enviá el mensaje pendiente, luego creá placeholders de visita para las dos mejores opciones."
};

const NEXT_ACTION_WHY_ES: Record<string, string> = {
  "Lead explicitly requested weekend availability": "El lead pidió explícitamente disponibilidad de fin de semana",
  "High score and complete qualification fields": "Score alto y campos de calificación completos",
  "No pricing objection on shortlist": "Sin objeción de precio en el shortlist"
};

const TASK_TITLE_ES: Record<string, string> = {
  "Review qualification output due to low confidence": "Revisar salida de calificación por baja confianza",
  "Confirm visit windows with buyer": "Confirmar franjas de visita con el comprador",
  "Send follow-up message based on current intent": "Enviar mensaje de seguimiento según intención actual"
};

const STAGE_REASON_ES: Record<string, string> = {
  "Initial stage from qualification pipeline": "Etapa inicial desde el pipeline de calificación"
};

function mapOrSelf<T extends string | null | undefined>(map: Record<string, string>, value: T): T {
  if (value == null || value === "") return value;
  return (map[value] ?? value) as T;
}

export function normalizeFollowUpTitle(title: string): string {
  return mapOrSelf(FOLLOW_UP_TITLE_ES, title) ?? title;
}

export function normalizeFollowUpDetail(detail: string): string {
  return mapOrSelf(FOLLOW_UP_DETAIL_ES, detail) ?? detail;
}

export function normalizeRecommendationReason(reason: string): string {
  return mapOrSelf(REC_REASON_ES, reason) ?? reason;
}

export function normalizeTradeoff(tradeoff: string | null): string | null {
  if (tradeoff == null) return null;
  return mapOrSelf(TRADEOFF_ES, tradeoff) ?? tradeoff;
}

export function normalizeAppreciationNote(note: string | null): string | null {
  if (note == null) return null;
  return mapOrSelf(APPRECIATION_ES, note) ?? note;
}

export function normalizePropertyTitle(title: string): string {
  return mapOrSelf(PROPERTY_TITLE_ES, title) ?? title;
}

export function normalizeMessageBody(body: string): string {
  const trimmed = body.trim();
  return mapOrSelf(MESSAGE_BODY_ES, trimmed) ?? body;
}

export function normalizeNextActionTitle(title: string): string {
  return mapOrSelf(NEXT_ACTION_TITLE_ES, title) ?? title;
}

export function normalizeNextActionDetail(detail: string): string {
  return mapOrSelf(NEXT_ACTION_DETAIL_ES, detail) ?? detail;
}

export function normalizeNextActionWhyLine(line: string): string {
  return mapOrSelf(NEXT_ACTION_WHY_ES, line) ?? line;
}

export function normalizeTaskTitle(title: string): string {
  return mapOrSelf(TASK_TITLE_ES, title) ?? title;
}

export function normalizeStageHistoryReason(reason: string | null): string | null {
  if (reason == null) return null;
  return mapOrSelf(STAGE_REASON_ES, reason) ?? reason;
}

/** Resumen de intención siempre en español a partir del perfil persistido (ignora texto viejo en inglés). */
export function formatBuyingIntentSummaryEs(
  budgetMin: number | null,
  budgetMax: number | null,
  budgetCurrency: string | null,
  preferredZones: string[],
  timelineMonths: number | null,
  score: number
): string {
  const zones = preferredZones.slice(0, 2).join(" y ");
  const segments: string[] = [];

  if (budgetMin != null && budgetMax != null) {
    const cur = budgetCurrency ?? "USD";
    segments.push(
      `Presupuesto ${cur} ${budgetMin.toLocaleString("es-AR")}-${budgetMax.toLocaleString("es-AR")}`
    );
  }

  if (zones) {
    segments.push(`interés en ${zones}`);
  }

  if (timelineMonths != null) {
    segments.push(`plazo aproximado ${timelineMonths} ${timelineMonths === 1 ? "mes" : "meses"}`);
  }

  if (!segments.length) {
    return "Intención aún débil: la conversación no define restricciones comerciales clave.";
  }

  return `${segments.join(", ")}. Puntaje de calificación actual: ${score}.`;
}
