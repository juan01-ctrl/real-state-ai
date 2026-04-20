export type ChannelType = "WHATSAPP" | "INSTAGRAM" | "WEB_FORM" | "PORTAL";
export type MatchingMode = "CONSERVADOR" | "AGRESIVO";
export type OutreachTone =
  | "Sofisticado y reservado"
  | "Directo y profesional"
  | "Cálido y cercano"
  | "Técnico y preciso";

export type FinancingMode = "cash" | "mortgage" | "pre_approved" | "unknown";

export type PropertyType = "apartment" | "townhouse" | "single_family" | "unknown";

export type UrgencyLevel = "high" | "medium" | "low";

export type SeriousnessLevel = "high" | "medium" | "low";

export type RecommendedPriority = "P1" | "P2" | "P3";

export type NextActionType =
  | "ask_clarifier"
  | "propose_listings"
  | "book_visit"
  | "human_handoff"
  | "nurture";

export interface InboundConversationMessage {
  id: string;
  body: string;
  direction: "inbound" | "outbound";
  sentAt: string;
  channel: ChannelType;
}

export interface LeadQualificationInput {
  agencyId: string;
  leadId: string;
  messages: InboundConversationMessage[];
  now?: string;
  manualOverrides?: Partial<LeadProfile>;
  policy?: {
    urgencyThreshold?: number;
    matchingMode?: MatchingMode;
    outreachTone?: OutreachTone;
  };
}

export interface ExtractedField<T> {
  value: T | null;
  confidence: number;
  sourceMessageIds: string[];
  method: "regex" | "keyword" | "heuristic" | "manual_override" | "none";
  notes?: string;
}

export interface BudgetRange {
  min: number;
  max: number;
  currency: "USD";
}

export interface LeadProfile {
  budget: BudgetRange | null;
  preferredZones: string[];
  propertyType: PropertyType;
  bedrooms: number | null;
  financingMode: FinancingMode;
  timelineMonths: number | null;
  urgency: UrgencyLevel;
  seriousness: SeriousnessLevel;
  objections: string[];
  buyingIntentSummary: string;
}

export interface ExtractionResult {
  budget: ExtractedField<BudgetRange>;
  preferredZones: ExtractedField<string[]>;
  propertyType: ExtractedField<PropertyType>;
  bedrooms: ExtractedField<number>;
  financingMode: ExtractedField<FinancingMode>;
  timelineMonths: ExtractedField<number>;
  objections: ExtractedField<string[]>;
}

export interface ScoreBreakdown {
  total: number;
  components: {
    name: string;
    score: number;
    max: number;
    reason: string;
  }[];
}

export interface NextAction {
  type: NextActionType;
  title: string;
  detail: string;
  why: string[];
}

export interface ConfidenceReport {
  overall: number;
  fieldConfidence: Record<string, number>;
  missingCriticalFields: string[];
  requiresHumanReview: boolean;
}

export interface QualificationAssessment {
  leadScore: number;
  recommendedPriority: RecommendedPriority;
  seriousness: SeriousnessLevel;
  urgency: UrgencyLevel;
  recommendedNextAction: NextAction;
  scoreBreakdown: ScoreBreakdown;
}

export interface QualificationLog {
  timestamp: string;
  step:
    | "extract"
    | "normalize"
    | "score"
    | "next_action"
    | "confidence"
    | "fallback";
  level: "info" | "warn";
  message: string;
  data?: Record<string, string | number | boolean>;
}

export interface QualificationOutput {
  version: string;
  profile: LeadProfile;
  extraction: ExtractionResult;
  assessment: QualificationAssessment;
  confidence: ConfidenceReport;
  logs: QualificationLog[];
  evaluationHooks: {
    promptVersion: string;
    eventName: "qualification.updated";
    tags: string[];
  };
}
