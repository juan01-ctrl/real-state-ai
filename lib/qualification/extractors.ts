import {
  BudgetRange,
  ExtractedField,
  ExtractionResult,
  FinancingMode,
  InboundConversationMessage,
  PropertyType
} from "@/lib/qualification/types";

const ZONE_DICTIONARY = [
  "Palermo",
  "Palermo Soho",
  "Belgrano",
  "Belgrano R",
  "Colegiales",
  "Caballito",
  "Villa Crespo",
  "Almagro",
  "Boedo",
  "Nuñez",
  "Recoleta"
];

const OBJECTION_DICTIONARY = [
  "hoa",
  "expensas",
  "parking",
  "cochera",
  "financing",
  "credito",
  "school",
  "noise",
  "security",
  "commute"
];

const USD_HINTS = /(u\$s|us\$|usd|d[oó]lares?|dls?|verdes?)/i;
const ARS_HINTS = /(ars|pesos?|ar\$)/i;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function parseAmount(raw: string, suffix?: string): number | null {
  const trimmed = raw.trim().replace(/\s/g, "");
  if (!trimmed) return null;

  let normalized = trimmed;
  const hasDot = normalized.includes(".");
  const hasComma = normalized.includes(",");

  if (hasDot && hasComma) {
    const lastDot = normalized.lastIndexOf(".");
    const lastComma = normalized.lastIndexOf(",");
    const decimalSep = lastDot > lastComma ? "." : ",";
    const thousandSep = decimalSep === "." ? "," : ".";
    normalized = normalized.split(thousandSep).join("");
    if (decimalSep === ",") normalized = normalized.replace(",", ".");
  } else if (hasComma && !hasDot) {
    const commaCount = (normalized.match(/,/g) ?? []).length;
    const looksThousands = commaCount >= 2 || /,\d{3}$/.test(normalized);
    normalized = looksThousands ? normalized.replace(/,/g, "") : normalized.replace(",", ".");
  } else if (hasDot && !hasComma) {
    const dotCount = (normalized.match(/\./g) ?? []).length;
    const looksThousands = dotCount >= 2 || /\.\d{3}$/.test(normalized);
    normalized = looksThousands ? normalized.replace(/\./g, "") : normalized;
  }

  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;

  const suffixNorm = (suffix ?? "").toLowerCase();
  if (suffixNorm === "k" || suffixNorm === "mil" || suffixNorm === "lucas") return Math.round(value * 1_000);
  if (suffixNorm === "m" || suffixNorm === "mm" || suffixNorm.startsWith("millon")) return Math.round(value * 1_000_000);

  return Math.round(value);
}

function inferCurrency(input: {
  prefix?: string;
  connective?: string;
  amountHint?: number;
  messageBody: string;
}): { currency: BudgetRange["currency"]; confidenceBoost: number } {
  const sample = `${input.prefix ?? ""} ${input.connective ?? ""} ${input.messageBody}`.toLowerCase();

  if (USD_HINTS.test(sample)) return { currency: "USD", confidenceBoost: 0.12 };
  if (ARS_HINTS.test(sample)) return { currency: "ARS", confidenceBoost: 0.1 };
  if ((input.prefix ?? "").includes("$")) return { currency: "ARS", confidenceBoost: -0.08 };
  if ((input.amountHint ?? 0) >= 10_000_000) return { currency: "ARS", confidenceBoost: -0.06 };
  return { currency: "USD", confidenceBoost: -0.2 };
}

function extractBudget(messages: InboundConversationMessage[]): ExtractedField<BudgetRange> {
  const rangePattern =
    /((?:u\$s|us\$|usd|d[oó]lares?|ars|ar\$|pesos?)?\s*\$?)\s*([0-9][0-9.,]{0,12})\s*(k|m|mm|mil|millones?|millon|lucas)?\s*(?:a|hasta|to|-|–|y)\s*((?:u\$s|us\$|usd|d[oó]lares?|ars|ar\$|pesos?)?\s*\$?)?\s*([0-9][0-9.,]{0,12})\s*(k|m|mm|mil|millones?|millon|lucas)?/i;

  const singlePattern =
    /((?:u\$s|us\$|usd|d[oó]lares?|ars|ar\$|pesos?)?\s*\$?)\s*([0-9][0-9.,]{1,12})\s*(k|m|mm|mil|millones?|millon|lucas)?/gi;

  for (const message of messages) {
    const rangeMatch = message.body.match(rangePattern);
    if (rangeMatch) {
      const first = parseAmount(rangeMatch[2], rangeMatch[3]);
      const second = parseAmount(rangeMatch[5], rangeMatch[6]);
      if (!first || !second) continue;

      const currencyMeta = inferCurrency({
        prefix: `${rangeMatch[1] ?? ""} ${rangeMatch[4] ?? ""}`,
        connective: rangeMatch[0],
        amountHint: Math.max(first, second),
        messageBody: message.body
      });

      return {
        value: {
          min: Math.min(first, second),
          max: Math.max(first, second),
          currency: currencyMeta.currency
        },
        confidence: clamp(0.82 + currencyMeta.confidenceBoost),
        sourceMessageIds: [message.id],
        method: "regex"
      };
    }

    const candidates: Array<{ amount: number; raw: string; suffix?: string }> = [];
    singlePattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = singlePattern.exec(message.body)) !== null) {
      const amount = parseAmount(match[2], match[3]);
      if (amount) {
        candidates.push({
          amount,
          raw: match[1] ?? "",
          suffix: match[3] ?? ""
        });
      }
    }

    if (candidates.length > 0) {
      const sorted = candidates.map((c) => c.amount).sort((a, b) => a - b);
      const currencyMeta = inferCurrency({
        prefix: candidates.map((c) => `${c.raw} ${c.suffix}`).join(" "),
        amountHint: sorted[Math.max(sorted.length - 1, 0)],
        messageBody: message.body
      });
      return {
        value: {
          min: sorted[0],
          max: sorted[Math.max(sorted.length - 1, 0)],
          currency: currencyMeta.currency
        },
        confidence: clamp((sorted.length > 1 ? 0.76 : 0.7) + currencyMeta.confidenceBoost),
        sourceMessageIds: [message.id],
        method: "regex",
        notes: sorted.length > 1 ? "Se usó primer y último valor como rango implícito" : undefined
      };
    }
  }

  return {
    value: null,
    confidence: 0,
    sourceMessageIds: [],
    method: "none",
    notes: "No explicit budget phrase found"
  };
}

function extractZones(messages: InboundConversationMessage[]): ExtractedField<string[]> {
  const found: string[] = [];
  const sourceMessageIds = new Set<string>();

  for (const message of messages) {
    const normalized = message.body.toLowerCase();
    for (const zone of ZONE_DICTIONARY) {
      if (normalized.includes(zone.toLowerCase())) {
        if (!found.includes(zone)) {
          found.push(zone);
        }
        sourceMessageIds.add(message.id);
      }
    }
  }

  return {
    value: found,
    confidence: found.length > 0 ? clamp(0.55 + found.length * 0.12) : 0,
    sourceMessageIds: Array.from(sourceMessageIds),
    method: found.length ? "keyword" : "none",
    notes: found.length ? undefined : "No known zones detected"
  };
}

function extractPropertyType(messages: InboundConversationMessage[]): ExtractedField<PropertyType> {
  const markers: Array<{ keywords: string[]; type: PropertyType }> = [
    { keywords: ["apartment", "apto", "depto", "departamento"], type: "apartment" },
    { keywords: ["townhouse", "ph"], type: "townhouse" },
    { keywords: ["house", "casa"], type: "single_family" }
  ];

  for (const message of messages) {
    const normalized = message.body.toLowerCase();
    for (const marker of markers) {
      if (marker.keywords.some((keyword) => normalized.includes(keyword))) {
        return {
          value: marker.type,
          confidence: 0.8,
          sourceMessageIds: [message.id],
          method: "keyword"
        };
      }
    }
  }

  return {
    value: "unknown",
    confidence: 0.3,
    sourceMessageIds: [],
    method: "none",
    notes: "Property type not explicit"
  };
}

function extractBedrooms(messages: InboundConversationMessage[]): ExtractedField<number> {
  const pattern = /(\d)\s?(?:bed|br|bedroom|dormitorio|dormitorios|ambientes?)/i;

  for (const message of messages) {
    const match = message.body.match(pattern);
    if (match) {
      return {
        value: Number(match[1]),
        confidence: 0.82,
        sourceMessageIds: [message.id],
        method: "regex"
      };
    }
  }

  return {
    value: null,
    confidence: 0,
    sourceMessageIds: [],
    method: "none",
    notes: "Bedrooms not specified"
  };
}

function extractFinancingMode(messages: InboundConversationMessage[]): ExtractedField<FinancingMode> {
  for (const message of messages) {
    const normalized = message.body.toLowerCase();

    if (normalized.includes("pre-approved") || normalized.includes("pre approved") || normalized.includes("preaprob")) {
      return {
        value: "pre_approved",
        confidence: 0.88,
        sourceMessageIds: [message.id],
        method: "keyword"
      };
    }

    if (normalized.includes("mortgage") || normalized.includes("credito") || normalized.includes("loan")) {
      return {
        value: "mortgage",
        confidence: 0.8,
        sourceMessageIds: [message.id],
        method: "keyword"
      };
    }

    if (normalized.includes("cash") || normalized.includes("contado")) {
      return {
        value: "cash",
        confidence: 0.76,
        sourceMessageIds: [message.id],
        method: "keyword"
      };
    }
  }

  return {
    value: "unknown",
    confidence: 0.2,
    sourceMessageIds: [],
    method: "none",
    notes: "Financing mode not explicit"
  };
}

function extractTimelineMonths(messages: InboundConversationMessage[]): ExtractedField<number> {
  const monthPattern = /(?:in|within|en)\s?(\d{1,2})\s?(?:month|months|mes|meses)/i;

  for (const message of messages) {
    const normalized = message.body.toLowerCase();

    if (
      normalized.includes("asap") ||
      normalized.includes("urgent") ||
      normalized.includes("urgente") ||
      normalized.includes("esta semana") ||
      normalized.includes("this week")
    ) {
      return {
        value: 1,
        confidence: 0.78,
        sourceMessageIds: [message.id],
        method: "keyword"
      };
    }

    if (normalized.includes("next year") || normalized.includes("año que viene") || normalized.includes("ano que viene")) {
      return {
        value: 12,
        confidence: 0.79,
        sourceMessageIds: [message.id],
        method: "keyword"
      };
    }

    const monthMatch = message.body.match(monthPattern);
    if (monthMatch) {
      return {
        value: Number(monthMatch[1]),
        confidence: 0.86,
        sourceMessageIds: [message.id],
        method: "regex"
      };
    }
  }

  return {
    value: null,
    confidence: 0,
    sourceMessageIds: [],
    method: "none",
    notes: "Timeline not explicit"
  };
}

function extractObjections(messages: InboundConversationMessage[]): ExtractedField<string[]> {
  const objections = new Set<string>();
  const sourceMessageIds = new Set<string>();

  for (const message of messages) {
    const normalized = message.body.toLowerCase();
    for (const term of OBJECTION_DICTIONARY) {
      if (normalized.includes(term)) {
        objections.add(term);
        sourceMessageIds.add(message.id);
      }
    }
  }

  return {
    value: Array.from(objections),
    confidence: objections.size ? clamp(0.5 + objections.size * 0.1) : 0.35,
    sourceMessageIds: Array.from(sourceMessageIds),
    method: objections.size ? "keyword" : "heuristic",
    notes: objections.size ? undefined : "No explicit objections found"
  };
}

export function runLeadExtraction(messages: InboundConversationMessage[]): ExtractionResult {
  const inboundMessages = messages.filter((message) => message.direction === "inbound");

  return {
    budget: extractBudget(inboundMessages),
    preferredZones: extractZones(inboundMessages),
    propertyType: extractPropertyType(inboundMessages),
    bedrooms: extractBedrooms(inboundMessages),
    financingMode: extractFinancingMode(inboundMessages),
    timelineMonths: extractTimelineMonths(inboundMessages),
    objections: extractObjections(inboundMessages)
  };
}
