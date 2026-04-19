export type LeadPriority = "P1" | "P2" | "P3";

export type LeadStage =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "VISIT_SCHEDULED"
  | "OFFER_NEGOTIATION"
  | "NURTURE";

export type ChannelSource = "WhatsApp" | "Instagram" | "Web Form" | "Portal";

export type FinancingMode = "Cash" | "Mortgage" | "Pre-approved" | "Unknown";

export type ActionType =
  | "book_visit"
  | "ask_clarifier"
  | "human_handoff"
  | "propose_listings"
  | "nurture";

export interface LeadSummary {
  id: string;
  fullName: string;
  source: ChannelSource;
  sourceCampaign: string;
  stage: LeadStage;
  priority: LeadPriority;
  score: number;
  scoreDrivers: string[];
  owner: string;
  city: string;
  silenceHours: number;
  unreadCount: number;
  lastActivityAt: string;
  hasApprovalPending: boolean;
}

export interface ExtractedLeadProfile {
  budget: {
    min: number;
    max: number;
    currency: "USD";
    realism: "aligned" | "stretch" | "unrealistic";
  };
  preferredZones: string[];
  propertyType: "Apartment" | "Townhouse" | "Single-family";
  bedroomsNeeded: number;
  timelineMonths: number;
  financingMode: FinancingMode;
  seriousness: "High" | "Medium" | "Low";
  urgency: "High" | "Medium" | "Low";
  objections: string[];
  profileGaps: string[];
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  sender: string;
  channel: ChannelSource;
  body: string;
  sentAt: string;
  deliveryStatus: "delivered" | "read" | "pending_approval";
}

export interface RecommendedNextAction {
  type: ActionType;
  title: string;
  detail: string;
  confidence: number;
  rationale: string[];
}

export interface SuggestedProperty {
  id: string;
  rank: number;
  title: string;
  neighborhood: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  fitScore: number;
  reasons: string[];
  tradeoffVsNext?: string;
  caveat: string;
}

export interface FollowUpEvent {
  id: string;
  status: "scheduled" | "executed" | "failed" | "needs_approval";
  title: string;
  detail: string;
  scheduledFor: string;
  occurredAt?: string;
}

export interface LeadCRMState {
  crmProvider: "HubSpot" | "Pipedrive";
  externalDealId: string;
  syncState: "OK" | "PENDING" | "ERROR";
  lastSyncedAt: string;
  internalStage: LeadStage;
  crmStage: string;
  notes: {
    id: string;
    author: string;
    body: string;
    createdAt: string;
  }[];
}

export interface LeadRecord {
  summary: LeadSummary;
  profile: ExtractedLeadProfile;
  conversation: ConversationMessage[];
  nextAction: RecommendedNextAction;
  properties: SuggestedProperty[];
  followUpTimeline: FollowUpEvent[];
  crm: LeadCRMState;
}
