import {
  BudgetRange,
  ExtractedField,
  ExtractionResult,
  InboundConversationMessage,
  PropertyType
} from "@/lib/qualification/types";

interface LlmExtractionPatch {
  budget?: {
    min?: number;
    max?: number;
    currency?: "USD" | "ARS";
    confidence?: number;
  } | null;
  preferredZones?: {
    value?: string[];
    confidence?: number;
  } | null;
  propertyType?: {
    value?: PropertyType;
    confidence?: number;
  } | null;
  bedrooms?: {
    value?: number;
    confidence?: number;
  } | null;
  financingMode?: {
    value?: "cash" | "mortgage" | "pre_approved" | "unknown";
    confidence?: number;
  } | null;
  timelineMonths?: {
    value?: number;
    confidence?: number;
  } | null;
  objections?: {
    value?: string[];
    confidence?: number;
  } | null;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function parseJsonFromContent(content: unknown): LlmExtractionPatch | null {
  if (typeof content !== "string") return null;
  try {
    const parsed = JSON.parse(content) as LlmExtractionPatch;
    return parsed;
  } catch {
    return null;
  }
}

function toBudgetField(
  candidate: LlmExtractionPatch["budget"],
  sourceMessageIds: string[]
): ExtractedField<BudgetRange> | null {
  if (!candidate || typeof candidate !== "object") return null;
  const min = Number(candidate.min);
  const max = Number(candidate.max);
  const currency = candidate.currency;
  if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0) return null;
  const boundedMin = Math.round(Math.max(10_000, Math.min(10_000_000_000, min)));
  const boundedMax = Math.round(Math.max(10_000, Math.min(10_000_000_000, max)));
  if (currency !== "USD" && currency !== "ARS") return null;
  return {
    value: {
      min: Math.min(boundedMin, boundedMax),
      max: Math.max(boundedMin, boundedMax),
      currency
    },
    confidence: clamp(typeof candidate.confidence === "number" ? candidate.confidence : 0.72),
    sourceMessageIds,
    method: "llm"
  };
}

function toScalarField<T>(
  value: T | null | undefined,
  confidence: number | null | undefined,
  sourceMessageIds: string[]
): ExtractedField<T> | null {
  if (value === null || value === undefined) return null;
  return {
    value,
    confidence: clamp(typeof confidence === "number" ? confidence : 0.68),
    sourceMessageIds,
    method: "llm"
  };
}

function normalizeTimelineMonths(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (rounded < 1 || rounded > 36) return null;
  return rounded;
}

function normalizeBedrooms(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (rounded < 0 || rounded > 12) return null;
  return rounded;
}

function shouldUseLlmFallback(extraction: ExtractionResult): boolean {
  const criticalMissing =
    extraction.budget.value === null ||
    extraction.timelineMonths.value === null ||
    extraction.preferredZones.value === null ||
    extraction.preferredZones.value.length === 0 ||
    extraction.propertyType.value === "unknown";

  const lowSignalCount = [
    extraction.budget.confidence,
    extraction.timelineMonths.confidence,
    extraction.preferredZones.confidence,
    extraction.propertyType.confidence
  ].filter((confidence) => confidence >= 0.65).length < 2;

  return criticalMissing || lowSignalCount;
}

export async function maybeEnrichExtractionWithLlm(params: {
  extraction: ExtractionResult;
  messages: InboundConversationMessage[];
  timeoutMs?: number;
}): Promise<{ extraction: ExtractionResult; used: boolean; reason?: string }> {
  const { extraction, messages } = params;

  if (!shouldUseLlmFallback(extraction)) {
    return { extraction, used: false, reason: "not_ambiguous" };
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { extraction, used: false, reason: "missing_openai_key" };
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";
  const timeoutMs = params.timeoutMs ?? 6_000;
  const sourceMessageIds = messages.filter((message) => message.direction === "inbound").map((message) => message.id);
  const transcript = messages
    .map(
      (message) =>
        `[${message.direction.toUpperCase()}][${message.sentAt}] ${message.body.replace(/\s+/g, " ").trim()}`
    )
    .join("\n");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Extraé señales de compra inmobiliaria. Devolvé SOLO JSON. currency solo USD o ARS. timelineMonths entero 1..36 o null. propertyType: apartment|townhouse|single_family|unknown. financingMode: cash|mortgage|pre_approved|unknown."
          },
          {
            role: "user",
            content: `Conversación:\n${transcript}\n\nDevolvé JSON con esta forma exacta (campos opcionales): {\"budget\":{\"min\":number,\"max\":number,\"currency\":\"USD|ARS\",\"confidence\":0..1},\"preferredZones\":{\"value\":[\"zona\"],\"confidence\":0..1},\"propertyType\":{\"value\":\"apartment|townhouse|single_family|unknown\",\"confidence\":0..1},\"bedrooms\":{\"value\":number,\"confidence\":0..1},\"financingMode\":{\"value\":\"cash|mortgage|pre_approved|unknown\",\"confidence\":0..1},\"timelineMonths\":{\"value\":number,\"confidence\":0..1},\"objections\":{\"value\":[\"objecion\"],\"confidence\":0..1}}`
          }
        ]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      return { extraction, used: false, reason: `llm_http_${response.status}` };
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    const parsed = parseJsonFromContent(content);
    if (!parsed) {
      return { extraction, used: false, reason: "invalid_json" };
    }

    const merged: ExtractionResult = { ...extraction };
    let applied = false;

    const llmBudget = toBudgetField(parsed.budget, sourceMessageIds);
    if (llmBudget && (merged.budget.value === null || llmBudget.confidence > merged.budget.confidence + 0.1)) {
      merged.budget = llmBudget;
      applied = true;
    }

    const zones = toScalarField(parsed.preferredZones?.value ?? null, parsed.preferredZones?.confidence, sourceMessageIds);
    if (
      zones &&
      Array.isArray(zones.value) &&
      ((merged.preferredZones.value?.length ?? 0) === 0 ||
        zones.confidence > merged.preferredZones.confidence + 0.1)
    ) {
      merged.preferredZones = { ...zones, value: zones.value.filter(Boolean) };
      applied = true;
    }

    const propertyType = toScalarField(parsed.propertyType?.value ?? null, parsed.propertyType?.confidence, sourceMessageIds);
    if (
      propertyType &&
      (merged.propertyType.value === "unknown" || propertyType.confidence > merged.propertyType.confidence + 0.1)
    ) {
      merged.propertyType = propertyType;
      applied = true;
    }

    const bedrooms = toScalarField(
      normalizeBedrooms(Number(parsed.bedrooms?.value)),
      parsed.bedrooms?.confidence,
      sourceMessageIds
    );
    if (bedrooms && (merged.bedrooms.value === null || bedrooms.confidence > merged.bedrooms.confidence + 0.1)) {
      merged.bedrooms = bedrooms;
      applied = true;
    }

    const financingMode = toScalarField(
      parsed.financingMode?.value ?? null,
      parsed.financingMode?.confidence,
      sourceMessageIds
    );
    if (
      financingMode &&
      (merged.financingMode.value === "unknown" || financingMode.confidence > merged.financingMode.confidence + 0.1)
    ) {
      merged.financingMode = financingMode;
      applied = true;
    }

    const timeline = toScalarField(
      normalizeTimelineMonths(Number(parsed.timelineMonths?.value)),
      parsed.timelineMonths?.confidence,
      sourceMessageIds
    );
    if (timeline && (merged.timelineMonths.value === null || timeline.confidence > merged.timelineMonths.confidence + 0.1)) {
      merged.timelineMonths = timeline;
      applied = true;
    }

    const objections = toScalarField(
      parsed.objections?.value ?? null,
      parsed.objections?.confidence,
      sourceMessageIds
    );
    if (objections && Array.isArray(objections.value) && objections.value.length > 0) {
      const union = new Set<string>([...(merged.objections.value ?? []), ...objections.value]);
      merged.objections = {
        value: Array.from(union),
        confidence: Math.max(merged.objections.confidence, objections.confidence),
        sourceMessageIds: Array.from(new Set([...merged.objections.sourceMessageIds, ...sourceMessageIds])),
        method: "llm"
      };
      applied = true;
    }

    return {
      extraction: applied ? merged : extraction,
      used: applied,
      reason: applied ? "llm_applied" : "llm_no_better_signals"
    };
  } catch {
    return { extraction, used: false, reason: "llm_failed_or_timeout" };
  } finally {
    clearTimeout(timer);
  }
}
