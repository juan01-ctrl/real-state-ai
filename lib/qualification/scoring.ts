import {
  ExtractionResult,
  InboundConversationMessage,
  QualificationAssessment,
  RecommendedPriority,
  ScoreBreakdown,
  SeriousnessLevel,
  UrgencyLevel
} from "@/lib/qualification/types";

function determineUrgency(timelineMonths: number | null, inboundMessages: InboundConversationMessage[]): UrgencyLevel {
  const content = inboundMessages.map((message) => message.body.toLowerCase()).join(" ");

  if (
    content.includes("urgent") ||
    content.includes("asap") ||
    content.includes("urgente") ||
    content.includes("urgencia") ||
    content.includes("prioridad") ||
    timelineMonths === 1
  ) {
    return "high";
  }

  if (timelineMonths && timelineMonths <= 3) {
    return "high";
  }

  if (timelineMonths && timelineMonths <= 6) {
    return "medium";
  }

  return "low";
}

function determineSeriousness(extraction: ExtractionResult, inboundMessages: InboundConversationMessage[]): SeriousnessLevel {
  const hasBudget = extraction.budget.value !== null;
  const hasZones = (extraction.preferredZones.value?.length ?? 0) > 0;
  const hasTimeline = extraction.timelineMonths.value !== null;
  const hasPropertyType = extraction.propertyType.value !== "unknown";
  const messageDepth = inboundMessages.length;

  const signalCount = [hasBudget, hasZones, hasTimeline, hasPropertyType].filter(Boolean).length;

  if (signalCount >= 3 && messageDepth >= 2) {
    return "high";
  }

  if (signalCount >= 2 && messageDepth >= 1) {
    return "medium";
  }

  return "low";
}

function calculateScoreBreakdown(
  extraction: ExtractionResult,
  urgency: UrgencyLevel,
  seriousness: SeriousnessLevel,
  inboundMessages: InboundConversationMessage[]
): ScoreBreakdown {
  const components: ScoreBreakdown["components"] = [];

  const profileCompletenessScore = [
    extraction.budget.value !== null,
    (extraction.preferredZones.value?.length ?? 0) > 0,
    extraction.propertyType.value !== "unknown",
    extraction.bedrooms.value !== null,
    extraction.timelineMonths.value !== null,
    extraction.financingMode.value !== "unknown"
  ].filter(Boolean).length;

  components.push({
    name: "profile_completeness",
    score: Math.round((profileCompletenessScore / 6) * 35),
    max: 35,
    reason: `${profileCompletenessScore}/6 campos críticos de calificación capturados`
  });

  const urgencyScore = urgency === "high" ? 20 : urgency === "medium" ? 12 : 6;
  components.push({
    name: "urgency_signal",
    score: urgencyScore,
    max: 20,
    reason: `Urgencia: ${urgency}`
  });

  const seriousnessScore = seriousness === "high" ? 20 : seriousness === "medium" ? 12 : 5;
  components.push({
    name: "seriousness_signal",
    score: seriousnessScore,
    max: 20,
    reason: `Seriedad: ${seriousness}`
  });

  const engagementScore = Math.min(15, inboundMessages.length * 5);
  components.push({
    name: "engagement_depth",
    score: engagementScore,
    max: 15,
    reason: `${inboundMessages.length} mensajes entrantes con señal comercial`
  });

  const objectionPenalty = Math.min(10, (extraction.objections.value?.length ?? 0) * 3);
  components.push({
    name: "objection_penalty",
    score: 10 - objectionPenalty,
    max: 10,
    reason: objectionPenalty
      ? `${extraction.objections.value?.length ?? 0} objeciones reducen la confianza para cerrar rápido`
      : "Sin objeciones bloqueantes detectadas"
  });

  const total = components.reduce((sum, component) => sum + component.score, 0);
  return { total: Math.max(0, Math.min(100, total)), components };
}

function recommendPriority(score: number, urgency: UrgencyLevel): RecommendedPriority {
  if (score >= 80 || (score >= 72 && urgency === "high")) {
    return "P1";
  }

  if (score >= 60) {
    return "P2";
  }

  return "P3";
}

export function runScoring(
  extraction: ExtractionResult,
  messages: InboundConversationMessage[]
): Omit<QualificationAssessment, "recommendedNextAction"> {
  const inboundMessages = messages.filter((message) => message.direction === "inbound");
  const urgency = determineUrgency(extraction.timelineMonths.value, inboundMessages);
  const seriousness = determineSeriousness(extraction, inboundMessages);
  const scoreBreakdown = calculateScoreBreakdown(extraction, urgency, seriousness, inboundMessages);

  return {
    leadScore: scoreBreakdown.total,
    recommendedPriority: recommendPriority(scoreBreakdown.total, urgency),
    seriousness,
    urgency,
    scoreBreakdown
  };
}
