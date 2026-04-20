import { buildConfidenceReport } from "@/lib/qualification/confidence";
import { runLeadExtraction } from "@/lib/qualification/extractors";
import { maybeEnrichExtractionWithLlm } from "@/lib/qualification/llm-extractor";
import { recommendNextAction } from "@/lib/qualification/next-action";
import { runScoring } from "@/lib/qualification/scoring";
import {
  ExtractionResult,
  LeadProfile,
  LeadQualificationInput,
  MatchingMode,
  OutreachTone,
  QualificationLog,
  QualificationOutput
} from "@/lib/qualification/types";

const PIPELINE_VERSION = "lead_qualification_v1";
const PROMPT_VERSION = "deterministic_rules_v1";

function buildIntentSummary(extraction: ExtractionResult, score: number): string {
  const zones = extraction.preferredZones.value?.slice(0, 2).join(" y ");
  const budget = extraction.budget.value;
  const timeline = extraction.timelineMonths.value;

  const segments: string[] = [];

  if (budget) {
    segments.push(
      `Presupuesto ${budget.currency} ${budget.min.toLocaleString("es-AR")}-${budget.max.toLocaleString("es-AR")}`
    );
  }

  if (zones) {
    segments.push(`interés en ${zones}`);
  }

  if (timeline) {
    segments.push(`plazo aproximado ${timeline} ${timeline === 1 ? "mes" : "meses"}`);
  }

  if (!segments.length) {
    return "Intención aún débil: la conversación no define restricciones comerciales clave.";
  }

  return `${segments.join(", ")}. Puntaje de calificación actual: ${score}.`;
}

function applyManualOverrides(
  profile: LeadProfile,
  overrides: LeadQualificationInput["manualOverrides"],
  logs: QualificationLog[]
): LeadProfile {
  if (!overrides) {
    return profile;
  }

  logs.push({
    timestamp: new Date().toISOString(),
    step: "normalize",
    level: "info",
    message: "Se aplicaron sobrescrituras manuales",
    data: { fieldCount: Object.keys(overrides).length }
  });

  return {
    ...profile,
    ...overrides
  };
}

function buildProfile(extraction: ExtractionResult, score: number): LeadProfile {
  return {
    budget: extraction.budget.value,
    preferredZones: extraction.preferredZones.value ?? [],
    propertyType: extraction.propertyType.value ?? "unknown",
    bedrooms: extraction.bedrooms.value,
    financingMode: extraction.financingMode.value ?? "unknown",
    timelineMonths: extraction.timelineMonths.value,
    urgency: "low",
    seriousness: "low",
    objections: extraction.objections.value ?? [],
    buyingIntentSummary: buildIntentSummary(extraction, score)
  };
}

function normalizePolicy(policy: LeadQualificationInput["policy"]) {
  const urgencyThreshold = Math.max(0, Math.min(100, Math.round(policy?.urgencyThreshold ?? 75)));
  const matchingMode: MatchingMode = policy?.matchingMode === "AGRESIVO" ? "AGRESIVO" : "CONSERVADOR";
  const outreachTone: OutreachTone =
    policy?.outreachTone === "Directo y profesional" ||
    policy?.outreachTone === "Cálido y cercano" ||
    policy?.outreachTone === "Técnico y preciso" ||
    policy?.outreachTone === "Sofisticado y reservado"
      ? policy.outreachTone
      : "Sofisticado y reservado";

  return { urgencyThreshold, matchingMode, outreachTone };
}

export async function runLeadQualificationPipeline(input: LeadQualificationInput): Promise<QualificationOutput> {
  const now = input.now ?? new Date().toISOString();
  const policy = normalizePolicy(input.policy);
  const logs: QualificationLog[] = [
    {
      timestamp: now,
      step: "extract",
      level: "info",
      message: "Pipeline de calificación iniciado",
      data: {
        messageCount: input.messages.length,
        leadId: input.leadId
      }
    }
  ];

  const ruleExtraction = runLeadExtraction(input.messages);
  const llmResult = await maybeEnrichExtractionWithLlm({
    extraction: ruleExtraction,
    messages: input.messages
  });
  const extraction = llmResult.extraction;

  logs.push({
    timestamp: new Date().toISOString(),
    step: "extract",
    level: "info",
    message: "Extracción completada",
    data: {
      budgetExtracted: extraction.budget.value !== null,
      zonesExtracted: (extraction.preferredZones.value?.length ?? 0) > 0,
      timelineExtracted: extraction.timelineMonths.value !== null,
      llmAssisted: llmResult.used
    }
  });

  if (!llmResult.used && llmResult.reason && llmResult.reason !== "not_ambiguous") {
    logs.push({
      timestamp: new Date().toISOString(),
      step: "fallback",
      level: "warn",
      message: "Fallback a extracción por reglas",
      data: {
        reason: llmResult.reason
      }
    });
  }

  const scoringBase = runScoring(extraction, input.messages, {
    urgencyThreshold: policy.urgencyThreshold,
    matchingMode: policy.matchingMode
  });
  const nextAction = recommendNextAction(extraction, scoringBase, {
    matchingMode: policy.matchingMode,
    outreachTone: policy.outreachTone
  });
  const confidence = buildConfidenceReport(extraction, logs);

  let profile = buildProfile(extraction, scoringBase.leadScore);
  profile = {
    ...profile,
    urgency: scoringBase.urgency,
    seriousness: scoringBase.seriousness
  };

  profile = applyManualOverrides(profile, input.manualOverrides, logs);

  if (confidence.requiresHumanReview) {
    logs.push({
      timestamp: new Date().toISOString(),
      step: "fallback",
      level: "warn",
      message: "Confianza por debajo del umbral: requiere revisión del operador",
      data: {
        confidence: Number(confidence.overall.toFixed(2)),
        missingCriticalFields: confidence.missingCriticalFields.length
      }
    });
  }

  return {
    version: PIPELINE_VERSION,
    profile,
    extraction,
    extractionStrategy: llmResult.used ? "llm_assisted" : "rules_only",
    assessment: {
      ...scoringBase,
      recommendedNextAction: nextAction
    },
    confidence,
    logs,
    evaluationHooks: {
      promptVersion: PROMPT_VERSION,
      eventName: "qualification.updated",
      tags: ["lead_qualification", `agency:${input.agencyId}`, `confidence:${confidence.overall.toFixed(2)}`]
    }
  };
}
