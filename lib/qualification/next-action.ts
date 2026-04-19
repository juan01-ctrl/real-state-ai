import { ExtractionResult, NextAction, QualificationAssessment } from "@/lib/qualification/types";

export function recommendNextAction(
  extraction: ExtractionResult,
  assessment: Omit<QualificationAssessment, "recommendedNextAction">
): NextAction {
  const missingCritical = [
    extraction.budget.value ? null : "presupuesto",
    extraction.preferredZones.value?.length ? null : "zonas preferidas",
    extraction.timelineMonths.value ? null : "plazo"
  ].filter((item): item is string => item !== null);

  if (missingCritical.length >= 2) {
    return {
      type: "ask_clarifier",
      title: "Completar datos críticos de calificación",
      detail: `Confirmar ${missingCritical.join(", ")} antes de enviar recomendaciones de propiedades.`,
      why: [
        "Datos estructurados insuficientes para proponer opciones fiables",
        "Evita recomendaciones de baja calidad que erosionan la confianza del operador"
      ]
    };
  }

  if (assessment.urgency === "high" && assessment.leadScore >= 75) {
    return {
      type: "book_visit",
      title: "Proponer horarios de visita ahora",
      detail: "Ofrecer dos franjas concretas y confirmar disponibilidad del shortlist.",
      why: [
        "Alta urgencia y score sólido",
        "Pasar rápido de calificación a visita mejora la probabilidad de cierre"
      ]
    };
  }

  if (assessment.seriousness === "high" && assessment.leadScore >= 68) {
    return {
      type: "propose_listings",
      title: "Enviar shortlist curado de propiedades",
      detail: "Compartir 2-3 opciones con matices claros según restricciones del comprador.",
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
      detail: "Seguimiento de baja frecuencia y reactivar cuando suba la urgencia.",
      why: [
        "Urgencia y seriedad actuales son bajas",
        "Preserva tiempo del agente manteniendo la relación"
      ]
    };
  }

  return {
    type: "human_handoff",
    title: "Elevar a revisión del broker",
    detail: "Asignar a un operador senior para resolver señales contradictorias antes del próximo contacto.",
    why: [
      "Las señales son mixtas y pueden requerir criterio humano",
      "La revisión humana evita mover etapa demasiado pronto"
    ]
  };
}
