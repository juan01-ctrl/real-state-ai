import { LeadRecord } from "@/lib/types/leads";

export const leadRecords: LeadRecord[] = [
  {
    summary: {
      id: "lead_001",
      fullName: "Camila Torres",
      source: "WhatsApp",
      sourceCampaign: "Meta Ads | Palermo Buyers",
      stage: "QUALIFIED",
      priority: "P1",
      score: 91,
      scoreDrivers: [
        "Budget is explicit",
        "Asked for visit window",
        "Fast reply cadence"
      ],
      owner: "Lucia Perez",
      city: "Buenos Aires",
      silenceHours: 2,
      unreadCount: 1,
      lastActivityAt: "2026-04-18T18:22:00Z",
      hasApprovalPending: true
    },
    profile: {
      budget: {
        min: 240000,
        max: 285000,
        currency: "USD",
        realism: "aligned"
      },
      preferredZones: ["Palermo Soho", "Colegiales", "Belgrano R"],
      propertyType: "Apartment",
      bedroomsNeeded: 2,
      timelineMonths: 2,
      financingMode: "Pre-approved",
      seriousness: "High",
      urgency: "High",
      objections: ["Needs low monthly HOA", "Wants balcony"],
      profileGaps: ["Decision maker alignment pending"],
      updatedAt: "2026-04-18T18:15:00Z"
    },
    conversation: [
      {
        id: "m_101",
        direction: "INBOUND",
        sender: "Camila",
        channel: "WhatsApp",
        body: "If we can visit this weekend I can move quickly, financing is already approved.",
        sentAt: "2026-04-18T17:50:00Z",
        deliveryStatus: "read"
      },
      {
        id: "m_102",
        direction: "OUTBOUND",
        sender: "Lucia",
        channel: "WhatsApp",
        body: "Great, I selected 3 options in Palermo/Colegiales with balcony and strong value per sqm.",
        sentAt: "2026-04-18T18:02:00Z",
        deliveryStatus: "delivered"
      },
      {
        id: "m_103",
        direction: "OUTBOUND",
        sender: "AI Draft",
        channel: "WhatsApp",
        body: "I can lock two visit slots for Saturday at 11:00 and 13:00. Which one works for you and your partner?",
        sentAt: "2026-04-18T18:21:00Z",
        deliveryStatus: "not_sent"
      }
    ],
    nextAction: {
      type: "book_visit",
      title: "Confirm Saturday visit window",
      detail:
        "Approve and send the pending message, then create visit placeholders for the top two listings.",
      confidence: 0.93,
      rationale: [
        "Lead explicitly requested weekend availability",
        "High score and complete qualification fields",
        "No pricing objection on shortlist"
      ]
    },
    properties: [
      {
        id: "prop_501",
        rank: 1,
        title: "2BR with Balcony on Arévalo",
        neighborhood: "Palermo Soho",
        price: 272000,
        bedrooms: 2,
        bathrooms: 2,
        fitScore: 0.94,
        reasons: [
          "Inside preferred budget range",
          "Balcony + low HOA confirmed",
          "7-min walk from requested area"
        ],
        tradeoffVsNext: "Smaller master bedroom than option #2",
        caveat: "On market 39 days, verify seller flexibility"
      },
      {
        id: "prop_502",
        rank: 2,
        title: "Colegiales Corner Unit",
        neighborhood: "Colegiales",
        price: 279000,
        bedrooms: 2,
        bathrooms: 2,
        fitScore: 0.9,
        reasons: [
          "Strong light and layout for remote work",
          "Within financing comfort band"
        ],
        tradeoffVsNext: "8% higher HOA than #1",
        caveat: "Building elevator maintenance starts next month"
      },
      {
        id: "prop_503",
        rank: 3,
        title: "Belgrano R Renovated Apartment",
        neighborhood: "Belgrano R",
        price: 287000,
        bedrooms: 2,
        bathrooms: 2,
        fitScore: 0.86,
        reasons: ["Premium block in preferred zone", "Move-in ready condition"],
        caveat: "Slightly above preferred cap by 0.7%"
      }
    ],
    followUpTimeline: [
      {
        id: "f_001",
        status: "needs_approval",
        title: "Visit scheduling draft",
        detail: "Awaiting approval before outbound send",
        scheduledFor: "2026-04-18T18:25:00Z"
      },
      {
        id: "f_002",
        status: "scheduled",
        title: "Reminder if no reply",
        detail: "Auto-task in 6 hours to call directly",
        scheduledFor: "2026-04-19T00:25:00Z"
      },
      {
        id: "f_003",
        status: "executed",
        title: "Qualification summary posted",
        detail: "Profile fields synced to CRM record",
        scheduledFor: "2026-04-18T18:15:00Z",
        occurredAt: "2026-04-18T18:15:07Z"
      }
    ],
    crm: {
      crmProvider: "HubSpot",
      externalDealId: "HS-AR-88211",
      syncState: "OK",
      lastSyncedAt: "2026-04-18T18:16:00Z",
      internalStage: "QUALIFIED",
      crmStage: "Qualified buyer",
      notes: [
        {
          id: "n_101",
          author: "Lucia Perez",
          body: "Partner joins visits. Keep inventory focused on quiet streets.",
          createdAt: "2026-04-18T18:12:00Z"
        },
        {
          id: "n_102",
          author: "System",
          body: "Lead score moved 84 -> 91 after financing confirmation.",
          createdAt: "2026-04-18T18:15:00Z"
        }
      ]
    }
  },
  {
    summary: {
      id: "lead_002",
      fullName: "Matias Roldan",
      source: "Instagram",
      sourceCampaign: "Organic DM | Reels",
      stage: "CONTACTED",
      priority: "P1",
      score: 78,
      scoreDrivers: ["Strong urgency", "Area preference clear", "Budget range still broad"],
      owner: "Santiago Molina",
      city: "Buenos Aires",
      silenceHours: 19,
      unreadCount: 0,
      lastActivityAt: "2026-04-17T23:10:00Z",
      hasApprovalPending: false
    },
    profile: {
      budget: {
        min: 170000,
        max: 240000,
        currency: "USD",
        realism: "stretch"
      },
      preferredZones: ["Caballito", "Villa Crespo"],
      propertyType: "Apartment",
      bedroomsNeeded: 2,
      timelineMonths: 1,
      financingMode: "Mortgage",
      seriousness: "High",
      urgency: "High",
      objections: ["Worried about bank approval timing"],
      profileGaps: ["Monthly payment tolerance"],
      updatedAt: "2026-04-17T22:58:00Z"
    },
    conversation: [
      {
        id: "m_201",
        direction: "INBOUND",
        sender: "Matias",
        channel: "Instagram",
        body: "Need to close in 30-45 days, can you show me 2-bed options near Caballito?",
        sentAt: "2026-04-17T21:43:00Z",
        deliveryStatus: "read"
      },
      {
        id: "m_202",
        direction: "OUTBOUND",
        sender: "Santiago",
        channel: "Instagram",
        body: "Yes, I can shortlist options tonight. Are you already pre-approved or still in process?",
        sentAt: "2026-04-17T22:06:00Z",
        deliveryStatus: "read"
      }
    ],
    nextAction: {
      type: "ask_clarifier",
      title: "Collect financing certainty",
      detail: "Send one focused clarifier to narrow monthly payment tolerance before booking visits.",
      confidence: 0.82,
      rationale: [
        "Timeline is urgent but financing risk remains",
        "High intent is present, avoid over-offering inventory",
        "Clarifier enables tighter recommendation set"
      ]
    },
    properties: [
      {
        id: "prop_601",
        rank: 1,
        title: "Caballito Semi-floor, 2BR",
        neighborhood: "Caballito",
        price: 235000,
        bedrooms: 2,
        bathrooms: 2,
        fitScore: 0.88,
        reasons: ["Inside upper band", "Near requested school zone"],
        tradeoffVsNext: "Older building than #2",
        caveat: "Needs kitchen update"
      },
      {
        id: "prop_602",
        rank: 2,
        title: "Villa Crespo Modern Unit",
        neighborhood: "Villa Crespo",
        price: 228000,
        bedrooms: 2,
        bathrooms: 1,
        fitScore: 0.84,
        reasons: ["Lower HOA burden", "Faster closing timeline"],
        caveat: "One bathroom only"
      }
    ],
    followUpTimeline: [
      {
        id: "f_101",
        status: "failed",
        title: "Follow-up ping",
        detail: "DM failed due to channel token refresh",
        scheduledFor: "2026-04-18T11:30:00Z",
        occurredAt: "2026-04-18T11:30:14Z"
      },
      {
        id: "f_102",
        status: "scheduled",
        title: "Retry clarifier",
        detail: "Retry after token refresh job at 19:30",
        scheduledFor: "2026-04-18T19:30:00Z"
      }
    ],
    crm: {
      crmProvider: "HubSpot",
      externalDealId: "HS-AR-88117",
      syncState: "PENDING",
      lastSyncedAt: "2026-04-17T22:58:00Z",
      internalStage: "CONTACTED",
      crmStage: "Initial contact",
      notes: [
        {
          id: "n_201",
          author: "Santiago Molina",
          body: "Responds quickly, but financing confidence unclear.",
          createdAt: "2026-04-17T22:59:00Z"
        }
      ]
    }
  },
  {
    summary: {
      id: "lead_003",
      fullName: "Rocio Benitez",
      source: "Web Form",
      sourceCampaign: "Google Search | Almagro",
      stage: "NURTURE",
      priority: "P3",
      score: 59,
      scoreDrivers: ["Long purchase horizon", "Budget realistic", "Low conversation depth"],
      owner: "Valentina Ruiz",
      city: "Buenos Aires",
      silenceHours: 72,
      unreadCount: 0,
      lastActivityAt: "2026-04-15T14:48:00Z",
      hasApprovalPending: false
    },
    profile: {
      budget: {
        min: 120000,
        max: 155000,
        currency: "USD",
        realism: "aligned"
      },
      preferredZones: ["Almagro", "Boedo"],
      propertyType: "Apartment",
      bedroomsNeeded: 1,
      timelineMonths: 8,
      financingMode: "Unknown",
      seriousness: "Medium",
      urgency: "Low",
      objections: ["Unsure if buying this year"],
      profileGaps: ["Financing mode", "Visit intent"],
      updatedAt: "2026-04-15T14:44:00Z"
    },
    conversation: [
      {
        id: "m_301",
        direction: "INBOUND",
        sender: "Rocio",
        channel: "Web Form",
        body: "Exploring options for next year. Prefer Almagro if value is good.",
        sentAt: "2026-04-15T14:40:00Z",
        deliveryStatus: "read"
      },
      {
        id: "m_302",
        direction: "OUTBOUND",
        sender: "Valentina",
        channel: "Web Form",
        body: "Thanks, I can send a monthly shortlist while you evaluate timing.",
        sentAt: "2026-04-15T14:48:00Z",
        deliveryStatus: "delivered"
      }
    ],
    nextAction: {
      type: "nurture",
      title: "Move to low-frequency nurture",
      detail: "Keep one curated listing update every 3 weeks and monitor engagement before re-prioritizing.",
      confidence: 0.9,
      rationale: [
        "Low urgency with long buying horizon",
        "No immediate visit signal",
        "Nurture cadence preserves relationship without noise"
      ]
    },
    properties: [
      {
        id: "prop_701",
        rank: 1,
        title: "Almagro Starter Apartment",
        neighborhood: "Almagro",
        price: 149000,
        bedrooms: 1,
        bathrooms: 1,
        fitScore: 0.8,
        reasons: ["In budget", "Strong rental comparables"],
        caveat: "Third-floor walk-up"
      }
    ],
    followUpTimeline: [
      {
        id: "f_201",
        status: "executed",
        title: "Nurture enrollment",
        detail: "Lead moved to monthly shortlist sequence",
        scheduledFor: "2026-04-15T15:00:00Z",
        occurredAt: "2026-04-15T15:00:09Z"
      },
      {
        id: "f_202",
        status: "scheduled",
        title: "Next shortlist",
        detail: "Send 1 curated listing and financing tip",
        scheduledFor: "2026-05-06T13:00:00Z"
      }
    ],
    crm: {
      crmProvider: "HubSpot",
      externalDealId: "HS-AR-87504",
      syncState: "OK",
      lastSyncedAt: "2026-04-15T15:01:00Z",
      internalStage: "NURTURE",
      crmStage: "Long-term nurture",
      notes: [
        {
          id: "n_301",
          author: "Valentina Ruiz",
          body: "Good fit for nurture newsletter, no immediate agent intervention needed.",
          createdAt: "2026-04-15T15:03:00Z"
        }
      ]
    }
  }
];

export const defaultLeadId = leadRecords[0]?.summary.id;
