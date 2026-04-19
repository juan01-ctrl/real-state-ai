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

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function extractBudget(messages: InboundConversationMessage[]): ExtractedField<BudgetRange> {
  const budgetPattern = /(usd|\$)\s?(\d{2,3}(?:[\.,]\d{3})?|\d{2,3})\s?(k|000)?(?:\s?(?:to|-|and)\s?(\d{2,3}(?:[\.,]\d{3})?|\d{2,3})\s?(k|000)?)?/i;

  for (const message of messages) {
    const match = message.body.match(budgetPattern);
    if (!match) {
      continue;
    }

    const first = Number(match[2].replace(/[\.,]/g, ""));
    const firstMultiplier = match[3]?.toLowerCase() === "k" ? 1000 : 1;
    const secondRaw = match[4];
    const secondMultiplier = match[5]?.toLowerCase() === "k" ? 1000 : 1;
    const min = first * firstMultiplier;
    const max = secondRaw ? Number(secondRaw.replace(/[\.,]/g, "")) * secondMultiplier : min;

    if (!Number.isFinite(min) || min <= 0) {
      continue;
    }

    return {
      value: {
        min: Math.min(min, max),
        max: Math.max(min, max),
        currency: "USD"
      },
      confidence: max === min ? 0.74 : 0.89,
      sourceMessageIds: [message.id],
      method: "regex"
    };
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
    { keywords: ["apartment", "apto", "depto"], type: "apartment" },
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
  const pattern = /(\d)\s?(?:bed|br|bedroom|dormitorio|dormitorios)/i;

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

    if (normalized.includes("asap") || normalized.includes("urgent") || normalized.includes("this week")) {
      return {
        value: 1,
        confidence: 0.78,
        sourceMessageIds: [message.id],
        method: "keyword"
      };
    }

    if (normalized.includes("next year") || normalized.includes("ano que viene")) {
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
