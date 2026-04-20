import {
  ExtractionResult,
  MatchingMode,
  NextAction,
  OutreachTone,
  QualificationAssessment
} from "@/lib/qualification/types";

function applyOutreachTone(detail: string, tone: OutreachTone): string {
  if (tone === "Directo y profesional") return `Acción directa: ${detail}`;
  if (tone === "Cálido y cercano") return `Con tono cercano: ${detail}`;
  if (tone === "Técnico y preciso") return `Ejecución precisa: ${detail}`;
  return detail;
}

export function recommendNextAction(
  extraction: ExtractionResult,
  assessment: Omit<QualificationAssessment, "recommendedNextAction">,
  policy?: { matchingMode?: MatchingMode; outreachTone?: OutreachTone }
): NextAction {
  const matchingMode: MatchingMode = policy?.matchingMode === "AGRESIVO" ? "AGRESIVO" : "CONSERVADOR";
  const outreachTone: OutreachTone = policy?.outreachTone ?? "Sofisticado y reservado";
  const missingGate = matchingMode === "AGRESIVO" ? 3 : 1;
  const visitGate = matchingMode === "AGRESIVO" ? 68 : 78;
  const shortlistGate = matchingMode === "AGRESIVO" ? 60 : 72;
  const seriousnessPass =
    matchingMode === "AGRESIVO"
      ? assessment.seriousness === "high" || assessment.seriousness === "medium"
      : assessment.seriousness === "high";

  const missingCritical = [
    extraction.budget.value ? null : "presupuesto",
    extraction.preferredZones.value?.length ? null : "zonas preferidas",
    extraction.timelineMonths.value ? null : "plazo"
  ].filter((item): item is string => item !== null);

  if (missingCritical.length >= missingGate) {
    return {
      type: "ask_clarifier",
      title: "Completar datos críticos de calificación",
      detail: applyOutreachTone(
        `Confirmar ${missingCritical.join(", ")} antes de enviar recomendaciones de propiedades.`,
        outreachTone
      ),
      why: [
        "Datos estructurados insuficientes para proponer opciones fiables",
        "Evita recomendaciones de baja calidad que erosionan la confianza del operador"
      ]
    };
  }

  if (assessment.urgency === "high" && assessment.leadScore >= visitGate) {
    return {
      type: "book_visit",
      title: "Proponer horarios de visita ahora",
      detail: applyOutreachTone(
        "Ofrecer dos franjas concretas y confirmar disponibilidad del shortlist.",
        outreachTone
      ),
      why: [
        "Alta urgencia y score sólido",
        "Pasar rápido de calificación a visita mejora la probabilidad de cierre"
      ]
    };
  }

  if (seriousnessPass && assessment.leadScore >= shortlistGate) {
    return {
      type: "propose_listings",
      title: "Enviar shortlist curado de propiedades",
      detail: applyOutreachTone(
        "Compartir 2-3 opciones con matices claros según restricciones del comprador.",
        outreachTone
      ),
      why: [
        "El perfil del lead está mayormente completo",
        "El shortlist puede orientar la conversación hacia la visita"
      ]
    };
  }

  if (assessment.recommendedPriority === "P3") {
    return {
      type: "nurture",
      title: "Pasar a cadencia de nutrición",
      detail: applyOutreachTone("Seguimiento de baja frecuencia y reactivar cuando suba la urgencia.", outreachTone),
      why: [
        "Urgencia y seriedad actuales son bajas",
        "Preserva tiempo del agente manteniendo la relación"
      ]
    };
  }

  return {
    type: "human_handoff",
    title: "Elevar a revisión del broker",
    detail: applyOutreachTone(
      "Asignar a un operador senior para resolver señales contradictorias antes del próximo contacto.",
      outreachTone
    ),
    why: [
      "Las señales son mixtas y pueden requerir criterio humano",
      "La revisión humana evita mover etapa demasiado pronto"
    ]
  };
}
