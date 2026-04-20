import { DeliveryStatus, LeadPriority, LeadStage, MessageApprovalStatus, MessageDirection, TaskStatus } from "@prisma/client";
import { db } from "@/lib/server/db";
import {
  formatBuyingIntentSummaryEs,
  normalizeAppreciationNote,
  normalizeFollowUpDetail,
  normalizeFollowUpTitle,
  normalizeMessageBody,
  normalizeNextActionDetail,
  normalizeNextActionTitle,
  normalizeNextActionWhyLine,
  normalizePropertyTitle,
  normalizeRecommendationReason,
  normalizeStageHistoryReason,
  normalizeTaskTitle,
  normalizeTradeoff
} from "@/lib/i18n/legacy-copy-es";

export interface LeadInboxItem {
  id: string;
  createdAt: string;
  stage: LeadStage;
  priority: LeadPriority;
  score: number;
  closeProbability: number;
  fullName: string;
  budgetMin: number | null;
  budgetMax: number | null;
  sourceChannel: string;
  sourceCampaign: string | null;
  ownerName: string | null;
  lastActivityAt: string | null;
  silenceHours: number | null;
  preferredZones: string[];
  timelineMonths: number | null;
  hasManualReviewTask: boolean;
  messaging: {
    pendingApprovalCount: number;
    failedCount: number;
    lastOutboundStatus: string | null;
  };
  recommendedNextAction: {
    type: string;
    title: string;
    detail: string;
  } | null;
}

export interface LeadDetailModel {
  id: string;
  fullName: string;
  stage: LeadStage;
  priority: LeadPriority;
  score: number;
  closeProbability: number;
  silenceHours: number | null;
  sourceChannel: string;
  sourceCampaign: string | null;
  ownerUserId: string | null;
  ownerName: string | null;
  profile: {
    budgetMin: number | null;
    budgetMax: number | null;
    budgetCurrency: string | null;
    preferredZones: string[];
    propertyType: string;
    bedrooms: number | null;
    financingMode: string;
    timelineMonths: number | null;
    seriousness: string;
    urgency: string;
    objections: string[];
    buyingIntentSummary: string;
    confidenceOverall: number;
  } | null;
  conversation: {
    id: string;
    body: string;
    direction: string;
    senderName: string | null;
    sentAt: string;
    approvalStatus: string;
    deliveryStatus: string;
  }[];
  nextAction: {
    type: string;
    title: string;
    detail: string;
    why: string[];
  } | null;
  scoreBreakdown: {
    total: number;
    components: {
      name: string;
      score: number;
      max: number;
      reason: string;
    }[];
  } | null;
  stageHistory: {
    fromStage: string | null;
    toStage: string;
    reason: string | null;
    changedAt: string;
  }[];
  tasks: {
    id: string;
    title: string;
    type: string;
    status: string;
    dueAt: string | null;
  }[];
  followUpEvents: {
    id: string;
    status: string;
    title: string;
    detail: string;
    scheduledFor: string;
    occurredAt: string | null;
  }[];
  recommendations: {
    id: string;
    rank: number;
    fitScore: number;
    title: string;
    neighborhood: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    useCase: string;
    appreciationNote: string | null;
    reasons: string[];
    tradeoff: string | null;
  }[];
  notes: {
    id: string;
    author: string;
    body: string;
    createdAt: string;
  }[];
  /** Respuesta por WhatsApp/Instagram si el lead tiene hilo Meta y token configurado. */
  metaReply: {
    canSend: boolean;
    channelLabel: string;
    channelType: string;
    missingTokenHint?: string;
    pendingApprovalCount: number;
    failedCount: number;
    lastOutboundStatus: string | null;
    pendingDrafts: {
      id: string;
      body: string;
      sentAt: string;
      senderName: string | null;
    }[];
  } | null;
}

function hoursSince(date: Date | null): number | null {
  if (!date) return null;
  const diffMs = Date.now() - date.getTime();
  return Math.max(0, Math.round(diffMs / 1000 / 60 / 60));
}

export function parseNextAction(outputJson: unknown): LeadInboxItem["recommendedNextAction"] {
  if (!outputJson || typeof outputJson !== "object") return null;

  const root = outputJson as Record<string, unknown>;
  const assessment = root.assessment as Record<string, unknown> | undefined;
  const next = assessment?.recommendedNextAction as Record<string, unknown> | undefined;

  if (!next) return null;

  const type = typeof next.type === "string" ? next.type : "unknown";
  const title = typeof next.title === "string" ? next.title : "Sin título";
  const detail = typeof next.detail === "string" ? next.detail : "";

  return {
    type,
    title: normalizeNextActionTitle(title),
    detail: normalizeNextActionDetail(detail)
  };
}

export async function getLeadInboxItems(agencyId: string): Promise<LeadInboxItem[]> {
  const leads = await db.lead.findMany({
    where: { agencyId },
    orderBy: [{ priority: "asc" }, { leadScore: "desc" }, { lastActivityAt: "desc" }],
    include: {
      profile: true,
      owner: true,
      tasks: {
        where: { status: TaskStatus.OPEN },
        take: 3,
        orderBy: { createdAt: "desc" }
      },
      aiRuns: {
        take: 1,
        orderBy: { createdAt: "desc" }
      },
      conversations: {
        include: {
          messages: {
            where: { direction: MessageDirection.OUTBOUND },
            orderBy: { sentAt: "desc" },
            take: 20
          }
        }
      }
    }
  });

  return leads.map((lead) => {
    const manualReview = lead.tasks.some((task) => task.type === "MANUAL_REVIEW");
    const outbound = lead.conversations.flatMap((conversation) => conversation.messages);
    const pendingApprovalCount = outbound.filter((message) => message.approvalStatus === MessageApprovalStatus.PENDING).length;
    const failedCount = outbound.filter((message) => message.deliveryStatus === DeliveryStatus.FAILED).length;
    const lastApprovedOutbound = outbound.find((message) => message.approvalStatus === MessageApprovalStatus.APPROVED) ?? null;
    const lastOutboundStatus = lastApprovedOutbound?.deliveryStatus ?? null;
    return {
      id: lead.id,
      createdAt: lead.createdAt.toISOString(),
      stage: lead.stage,
      priority: lead.priority,
      score: lead.leadScore,
      closeProbability: lead.closeProbability,
      fullName: lead.contactName ?? `Contacto ${lead.id.slice(0, 8)}`,
      budgetMin: lead.profile?.budgetMin ?? null,
      budgetMax: lead.profile?.budgetMax ?? null,
      sourceChannel: lead.sourceChannel,
      sourceCampaign: lead.sourceCampaign,
      ownerName: lead.owner?.name ?? null,
      lastActivityAt: lead.lastActivityAt?.toISOString() ?? null,
      silenceHours: hoursSince(lead.lastActivityAt),
      preferredZones: lead.profile?.preferredZones ?? [],
      timelineMonths: lead.profile?.timelineMonths ?? null,
      hasManualReviewTask: manualReview,
      messaging: {
        pendingApprovalCount,
        failedCount,
        lastOutboundStatus
      },
      recommendedNextAction: parseNextAction(lead.aiRuns[0]?.outputJson)
    };
  });
}

function parseDetailNextAction(outputJson: unknown): LeadDetailModel["nextAction"] {
  if (!outputJson || typeof outputJson !== "object") return null;

  const root = outputJson as Record<string, unknown>;
  const assessment = root.assessment as Record<string, unknown> | undefined;
  const next = assessment?.recommendedNextAction as Record<string, unknown> | undefined;

  if (!next) return null;

  const whyRaw = next.why;
  const why = Array.isArray(whyRaw) ? whyRaw.filter((w): w is string => typeof w === "string") : [];

  const title = typeof next.title === "string" ? next.title : "Sin título";
  const detail = typeof next.detail === "string" ? next.detail : "";

  return {
    type: typeof next.type === "string" ? next.type : "unknown",
    title: normalizeNextActionTitle(title),
    detail: normalizeNextActionDetail(detail),
    why: why.map(normalizeNextActionWhyLine)
  };
}

function parseScoreBreakdown(outputJson: unknown): LeadDetailModel["scoreBreakdown"] {
  if (!outputJson || typeof outputJson !== "object") return null;
  const root = outputJson as Record<string, unknown>;
  const assessment = root.assessment as Record<string, unknown> | undefined;
  const scoreBreakdown = assessment?.scoreBreakdown as Record<string, unknown> | undefined;
  if (!scoreBreakdown) return null;

  const totalRaw = scoreBreakdown.total;
  const total = typeof totalRaw === "number" ? Math.max(0, Math.min(100, Math.round(totalRaw))) : null;
  const componentsRaw = Array.isArray(scoreBreakdown.components) ? scoreBreakdown.components : [];
  const components = componentsRaw
    .map((component) => {
      if (!component || typeof component !== "object") return null;
      const c = component as Record<string, unknown>;
      const name = typeof c.name === "string" ? c.name : "component";
      const score = typeof c.score === "number" ? c.score : null;
      const max = typeof c.max === "number" ? c.max : null;
      const reason = typeof c.reason === "string" ? c.reason : "";
      if (score == null || max == null) return null;
      return { name, score, max, reason };
    })
    .filter((component): component is NonNullable<typeof component> => component !== null);

  if (total == null) return null;
  return { total, components };
}

export async function getLeadDetail(leadId: string, agencyId: string): Promise<LeadDetailModel | null> {
  const lead = await db.lead.findFirst({
    where: { id: leadId, agencyId },
    include: {
      owner: true,
      profile: true,
      notes: { orderBy: { createdAt: "desc" } },
      tasks: { orderBy: { createdAt: "desc" } },
      followUpEvents: { orderBy: { scheduledFor: "asc" } },
      recommendations: {
        orderBy: { rank: "asc" },
        include: { property: true }
      },
      stageHistory: { orderBy: { changedAt: "desc" } },
      conversations: {
        include: {
          messages: {
            orderBy: { sentAt: "asc" }
          },
          channelConnection: true
        }
      },
      aiRuns: {
        take: 1,
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!lead) {
    return null;
  }

  const messages = lead.conversations.flatMap((conversation) => conversation.messages);

  return {
    id: lead.id,
    fullName: lead.contactName ?? `Contacto ${lead.id.slice(0, 8)}`,
    stage: lead.stage,
    priority: lead.priority,
    score: lead.leadScore,
    closeProbability: lead.closeProbability,
    silenceHours: hoursSince(lead.lastActivityAt),
    sourceChannel: lead.sourceChannel,
    sourceCampaign: lead.sourceCampaign,
    ownerUserId: lead.ownerUserId ?? null,
    ownerName: lead.owner?.name ?? null,
    profile: lead.profile
      ? {
          budgetMin: lead.profile.budgetMin,
          budgetMax: lead.profile.budgetMax,
          budgetCurrency: lead.profile.budgetCurrency,
          preferredZones: lead.profile.preferredZones,
          propertyType: lead.profile.propertyType,
          bedrooms: lead.profile.bedrooms,
          financingMode: lead.profile.financingMode,
          timelineMonths: lead.profile.timelineMonths,
          seriousness: lead.profile.seriousness,
          urgency: lead.profile.urgency,
          objections: lead.profile.objections,
          buyingIntentSummary: formatBuyingIntentSummaryEs(
            lead.profile.budgetMin,
            lead.profile.budgetMax,
            lead.profile.budgetCurrency,
            lead.profile.preferredZones,
            lead.profile.timelineMonths,
            lead.leadScore
          ),
          confidenceOverall: lead.profile.confidenceOverall
        }
      : null,
    conversation: messages.map((message) => ({
      id: message.id,
      body: normalizeMessageBody(message.body),
      direction: message.direction,
      senderName: message.senderName,
      sentAt: message.sentAt.toISOString(),
      approvalStatus: message.approvalStatus,
      deliveryStatus: message.deliveryStatus
    })),
    nextAction: parseDetailNextAction(lead.aiRuns[0]?.outputJson),
    scoreBreakdown: parseScoreBreakdown(lead.aiRuns[0]?.outputJson),
    stageHistory: lead.stageHistory.map((entry) => ({
      fromStage: entry.fromStage,
      toStage: entry.toStage,
      reason: normalizeStageHistoryReason(entry.reason),
      changedAt: entry.changedAt.toISOString()
    })),
    tasks: lead.tasks.map((task) => ({
      id: task.id,
      title: normalizeTaskTitle(task.title),
      type: task.type,
      status: task.status,
      dueAt: task.dueAt?.toISOString() ?? null
    })),
    followUpEvents: lead.followUpEvents.map((event) => ({
      id: event.id,
      status: event.status,
      title: normalizeFollowUpTitle(event.title),
      detail: normalizeFollowUpDetail(event.detail),
      scheduledFor: event.scheduledFor.toISOString(),
      occurredAt: event.occurredAt?.toISOString() ?? null
    })),
    recommendations: lead.recommendations.map((recommendation) => ({
      id: recommendation.id,
      rank: recommendation.rank,
      fitScore: recommendation.fitScore,
      title: normalizePropertyTitle(recommendation.property.title),
      neighborhood: recommendation.property.neighborhood,
      price: recommendation.property.price,
      bedrooms: recommendation.property.bedrooms,
      bathrooms: recommendation.property.bathrooms,
      useCase: recommendation.property.useCase,
      appreciationNote: normalizeAppreciationNote(recommendation.property.appreciationNote),
      reasons: recommendation.reasons.map(normalizeRecommendationReason),
      tradeoff: normalizeTradeoff(recommendation.tradeoff)
    })),
    notes: lead.notes.map((note) => ({
      id: note.id,
      author: note.author,
      body: note.body,
      createdAt: note.createdAt.toISOString()
    })),
    metaReply: (() => {
      const conv = lead.conversations.find(
        (c) =>
          Boolean(c.externalThreadId) &&
          (c.externalThreadId!.startsWith("wa:") || c.externalThreadId!.startsWith("ig:")) &&
          c.channelConnectionId
      );
      if (!conv?.channelConnection) return null;
      const conn = conv.channelConnection;
      const hasToken = Boolean(conn.accessTokenEnc);
      const outbound = messages.filter((message) => message.direction === MessageDirection.OUTBOUND);
      const pendingApprovalCount = outbound.filter((message) => message.approvalStatus === MessageApprovalStatus.PENDING).length;
      const failedCount = outbound.filter((message) => message.deliveryStatus === DeliveryStatus.FAILED).length;
      const lastApprovedOutbound =
        outbound
          .slice()
          .reverse()
          .find((message) => message.approvalStatus === MessageApprovalStatus.APPROVED) ?? null;
      const lastOutboundStatus = lastApprovedOutbound?.deliveryStatus ?? null;
      return {
        canSend: hasToken,
        channelLabel: conn.label,
        channelType: conn.type,
        missingTokenHint: hasToken
          ? undefined
          : "Configurá el token de acceso (Graph API) en Configuración → WhatsApp e Instagram para responder desde acá.",
        pendingApprovalCount,
        failedCount,
        lastOutboundStatus,
        pendingDrafts: outbound
          .filter((message) => message.approvalStatus === MessageApprovalStatus.PENDING)
          .slice()
          .reverse()
          .map((message) => ({
            id: message.id,
            body: normalizeMessageBody(message.body),
            sentAt: message.sentAt.toISOString(),
            senderName: message.senderName
          }))
      };
    })()
  };
}
