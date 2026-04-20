import {
  AiRunStatus,
  AiRunType,
  ChannelType as PrismaChannelType,
  DeliveryStatus,
  FinancingMode,
  LeadPriority,
  LeadStage,
  MessageApprovalStatus,
  MessageDirection,
  Prisma,
  SenderType,
  SeriousnessLevel,
  UrgencyLevel
} from "@prisma/client";
import { randomUUID } from "crypto";
import { runLeadQualificationPipeline } from "@/lib/qualification";
import {
  ChannelType as QualificationChannelType,
  InboundConversationMessage,
  LeadQualificationInput
} from "@/lib/qualification/types";
import { stableHash } from "@/lib/server/hash";
import { db } from "@/lib/server/db";
import { createRecommendationsForLead } from "@/lib/server/recommendations";
import { createFollowUpPlan } from "@/lib/server/follow-up";

export interface LeadIntakeRequest {
  agencyId: string;
  sourceChannel: QualificationChannelType;
  sourceCampaign?: string;
  assignedAgentEmail?: string;
  contactName?: string;
  messages: InboundConversationMessage[];
  manualOverrides?: LeadQualificationInput["manualOverrides"];
  /** Vincula la conversación a una conexión Meta (WhatsApp / Instagram). */
  channelConnectionId?: string | null;
  /** Clave estable por hilo (p. ej. wa:+54911… / ig:psid). */
  externalThreadId?: string | null;
}

type AgencyPolicy = {
  urgencyThreshold: number;
  matchingMode: "CONSERVADOR" | "AGRESIVO";
  outreachTone: "Sofisticado y reservado" | "Directo y profesional" | "Cálido y cercano" | "Técnico y preciso";
};

async function getAgencyPolicy(agencyId: string): Promise<AgencyPolicy> {
  const agency = await db.agency.findUnique({
    where: { id: agencyId },
    select: {
      aiUrgencyThreshold: true,
      aiMatchingMode: true,
      aiOutreachTone: true
    }
  });

  const urgencyThreshold = Math.max(0, Math.min(100, Math.round(agency?.aiUrgencyThreshold ?? 75)));
  const matchingMode: AgencyPolicy["matchingMode"] = agency?.aiMatchingMode === "AGRESIVO" ? "AGRESIVO" : "CONSERVADOR";
  const outreachTone: AgencyPolicy["outreachTone"] =
    agency?.aiOutreachTone === "Directo y profesional" ||
    agency?.aiOutreachTone === "Cálido y cercano" ||
    agency?.aiOutreachTone === "Técnico y preciso" ||
    agency?.aiOutreachTone === "Sofisticado y reservado"
      ? agency.aiOutreachTone
      : "Sofisticado y reservado";

  return { urgencyThreshold, matchingMode, outreachTone };
}

function toPriority(priority: "P1" | "P2" | "P3"): LeadPriority {
  if (priority === "P1") return LeadPriority.P1;
  if (priority === "P2") return LeadPriority.P2;
  return LeadPriority.P3;
}

function toUrgency(value: "high" | "medium" | "low"): UrgencyLevel {
  if (value === "high") return UrgencyLevel.HIGH;
  if (value === "medium") return UrgencyLevel.MEDIUM;
  return UrgencyLevel.LOW;
}

function toSeriousness(value: "high" | "medium" | "low"): SeriousnessLevel {
  if (value === "high") return SeriousnessLevel.HIGH;
  if (value === "medium") return SeriousnessLevel.MEDIUM;
  return SeriousnessLevel.LOW;
}

function toDeliveryStatus(value: "delivered" | "read"): DeliveryStatus {
  if (value === "read") return DeliveryStatus.READ;
  return DeliveryStatus.DELIVERED;
}

function toQualificationChannel(sourceChannel: PrismaChannelType): QualificationChannelType {
  if (sourceChannel === "WHATSAPP") return "WHATSAPP";
  if (sourceChannel === "INSTAGRAM") return "INSTAGRAM";
  if (sourceChannel === "WEB_FORM") return "WEB_FORM";
  return "PORTAL";
}

function stageRank(stage: LeadStage): number {
  const order: LeadStage[] = [
    LeadStage.NEW,
    LeadStage.CONTACTED,
    LeadStage.QUALIFIED,
    LeadStage.VISIT_SCHEDULED,
    LeadStage.OFFER_NEGOTIATION,
    LeadStage.WON,
    LeadStage.LOST,
    LeadStage.NURTURE
  ];
  const idx = order.indexOf(stage);
  return idx >= 0 ? idx : 0;
}

function toStage(score: number): LeadStage {
  if (score >= 75) return LeadStage.QUALIFIED;
  if (score >= 50) return LeadStage.CONTACTED;
  return LeadStage.NEW;
}

function toFinancingMode(value: "cash" | "mortgage" | "pre_approved" | "unknown"): FinancingMode {
  if (value === "cash") return FinancingMode.CASH;
  if (value === "mortgage") return FinancingMode.MORTGAGE;
  if (value === "pre_approved") return FinancingMode.PRE_APPROVED;
  return FinancingMode.UNKNOWN;
}

function assertValidRequest(input: LeadIntakeRequest) {
  if (!input.agencyId?.trim()) {
    throw new Error("agencyId es obligatorio");
  }

  if (!input.messages?.length) {
    throw new Error("Se requiere al menos un mensaje");
  }

  for (const message of input.messages) {
    if (!message.body.trim()) {
      throw new Error("El cuerpo del mensaje no puede estar vacío");
    }
  }
}

export async function ingestLeadAndQualify(input: LeadIntakeRequest) {
  assertValidRequest(input);

  const now = new Date();
  const leadId = randomUUID();

  const agency = await db.agency.upsert({
    where: { id: input.agencyId },
    update: {},
    create: {
      id: input.agencyId,
      slug: input.agencyId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name: `Agencia ${input.agencyId}`
    }
  });

  const policy = await getAgencyPolicy(agency.id);

  const qualificationInput: LeadQualificationInput = {
    agencyId: input.agencyId,
    leadId,
    messages: input.messages,
    now: now.toISOString(),
    manualOverrides: input.manualOverrides,
    policy
  };

  const output = await runLeadQualificationPipeline(qualificationInput);

  let ownerUserId: string | null = null;
  if (input.assignedAgentEmail) {
    const owner = await db.user.upsert({
      where: {
        agencyId_email: {
          agencyId: agency.id,
          email: input.assignedAgentEmail
        }
      },
      update: {
        name: input.assignedAgentEmail.split("@")[0]
      },
      create: {
        agencyId: agency.id,
        email: input.assignedAgentEmail,
        name: input.assignedAgentEmail.split("@")[0]
      }
    });

    ownerUserId = owner.id;
  }

  const created = await db.$transaction(async (tx) => {
    const lead = await tx.lead.create({
      data: {
        id: leadId,
        agencyId: agency.id,
        contactName: input.contactName,
        ownerUserId,
        sourceChannel: input.sourceChannel,
        sourceCampaign: input.sourceCampaign,
        stage: toStage(output.assessment.leadScore),
        leadScore: output.assessment.leadScore,
        closeProbability: Math.min(95, Math.max(5, Math.round(output.assessment.leadScore * 0.82))),
        priority: toPriority(output.assessment.recommendedPriority),
        timelineMonths: output.profile.timelineMonths,
        seriousness: toSeriousness(output.profile.seriousness),
        urgency: toUrgency(output.profile.urgency),
        lastActivityAt: new Date(input.messages[input.messages.length - 1].sentAt)
      }
    });

    const conversation = await tx.conversation.create({
      data: {
        leadId: lead.id,
        agencyId: agency.id,
        channelConnectionId: input.channelConnectionId ?? undefined,
        externalThreadId: input.externalThreadId ?? undefined
      }
    });

    await tx.message.createMany({
      data: input.messages.map((message) => ({
        conversationId: conversation.id,
        agencyId: agency.id,
        externalMessageId: message.id,
        direction: message.direction === "inbound" ? MessageDirection.INBOUND : MessageDirection.OUTBOUND,
        senderType: message.direction === "inbound" ? SenderType.CONTACT : SenderType.AGENT,
        senderName: message.direction === "inbound" ? input.contactName ?? "Contacto" : "Agente",
        body: message.body,
        sentAt: new Date(message.sentAt),
        approvalStatus: MessageApprovalStatus.APPROVED,
        deliveryStatus: toDeliveryStatus(message.direction === "inbound" ? "read" : "delivered")
      }))
    });

    await tx.leadProfile.create({
      data: {
        leadId: lead.id,
        budgetMin: output.profile.budget?.min,
        budgetMax: output.profile.budget?.max,
        budgetCurrency: output.profile.budget?.currency,
        preferredZones: output.profile.preferredZones,
        propertyType: output.profile.propertyType,
        bedrooms: output.profile.bedrooms,
        financingMode: toFinancingMode(output.profile.financingMode),
        timelineMonths: output.profile.timelineMonths,
        seriousness: toSeriousness(output.profile.seriousness),
        urgency: toUrgency(output.profile.urgency),
        objections: output.profile.objections,
        buyingIntentSummary: output.profile.buyingIntentSummary,
        extractionJson: output.extraction as unknown as Prisma.JsonObject,
        confidenceOverall: output.confidence.overall
      }
    });

    await tx.leadStageHistory.create({
      data: {
        leadId: lead.id,
        toStage: lead.stage,
        reason: "Etapa inicial desde el pipeline de calificación"
      }
    });

    if (output.confidence.requiresHumanReview) {
      await tx.task.create({
        data: {
          leadId: lead.id,
          type: "MANUAL_REVIEW",
          title: "Revisar salida de calificación por baja confianza"
        }
      });
    }

    await tx.aiRun.create({
      data: {
        agencyId: agency.id,
        leadId: lead.id,
        type: AiRunType.SCORE_LEAD,
        status: AiRunStatus.SUCCESS,
        model: "deterministic-rules",
        version: output.version,
        inputHash: stableHash(input.messages),
        outputJson: output as unknown as Prisma.JsonObject,
        confidence: output.confidence.overall
      }
    });

    await tx.analyticsEvent.create({
      data: {
        agencyId: agency.id,
        leadId: lead.id,
        type: output.evaluationHooks.eventName,
        properties: {
          score: output.assessment.leadScore,
          priority: output.assessment.recommendedPriority,
          confidence: output.confidence.overall,
          nextAction: output.assessment.recommendedNextAction.type,
          sourceChannel: input.sourceChannel,
          sourceCampaign: input.sourceCampaign ?? null
        },
        idempotencyKey: `qualification:${lead.id}:${stableHash(output.assessment)}`
      }
    });

    await tx.analyticsEvent.create({
      data: {
        agencyId: agency.id,
        leadId: lead.id,
        type: "qualification.eval.online",
        properties: {
          extractionStrategy: output.extractionStrategy,
          confidence: output.confidence.overall,
          requiresHumanReview: output.confidence.requiresHumanReview,
          missingCriticalFields: output.confidence.missingCriticalFields,
          score: output.assessment.leadScore
        },
        idempotencyKey: `qualification-eval:${lead.id}:${stableHash({
          strategy: output.extractionStrategy,
          confidence: output.confidence.overall,
          score: output.assessment.leadScore
        })}`
      }
    });

    return {
      leadId: lead.id,
      stage: lead.stage,
      score: lead.leadScore,
      closeProbability: lead.closeProbability,
      priority: lead.priority,
      confidence: output.confidence.overall,
      nextAction: output.assessment.recommendedNextAction
    };
  });

  const recommendations = await createRecommendationsForLead({
    agencyId: agency.id,
    leadId: created.leadId,
    preferredZones: output.profile.preferredZones,
    budgetMin: output.profile.budget?.min ?? null,
    budgetMax: output.profile.budget?.max ?? null,
    bedrooms: output.profile.bedrooms,
    propertyType: output.profile.propertyType,
    matchingMode: policy.matchingMode
  });

  const followUpEvents = await createFollowUpPlan({
    leadId: created.leadId,
    urgency: output.assessment.urgency,
    recommendedActionType: output.assessment.recommendedNextAction.type,
    requiresManualReview: output.confidence.requiresHumanReview,
    outreachTone: policy.outreachTone
  });

  await db.aiRun.create({
    data: {
      agencyId: agency.id,
      leadId: created.leadId,
      type: AiRunType.RANK_PROPERTIES,
      status: AiRunStatus.SUCCESS,
      model: "deterministic-rules",
      version: "recommendation_v1",
      inputHash: stableHash({
        preferredZones: output.profile.preferredZones,
        budget: output.profile.budget,
        bedrooms: output.profile.bedrooms
      }),
      outputJson: recommendations as unknown as Prisma.JsonObject,
      confidence: recommendations.length ? recommendations[0].fitScore : 0.3
    }
  });

  await db.aiRun.create({
    data: {
      agencyId: agency.id,
      leadId: created.leadId,
      type: AiRunType.FOLLOW_UP_PLAN,
      status: AiRunStatus.SUCCESS,
      model: "deterministic-rules",
      version: "followup_v1",
      inputHash: stableHash({
        urgency: output.assessment.urgency,
        action: output.assessment.recommendedNextAction.type,
        manualReview: output.confidence.requiresHumanReview
      }),
      outputJson: followUpEvents as unknown as Prisma.JsonObject,
      confidence: output.confidence.overall
    }
  });

  await db.analyticsEvent.create({
    data: {
      agencyId: agency.id,
      leadId: created.leadId,
      type: "match.generated",
      properties: {
        count: recommendations.length,
        strategy: "weighted_zone_budget_bedrooms_v1"
      },
      idempotencyKey: `recommendation:${created.leadId}:${stableHash(recommendations.map((r) => r.id))}`
    }
  });

  await db.analyticsEvent.create({
    data: {
      agencyId: agency.id,
      leadId: created.leadId,
      type: "followup.plan.generated",
      properties: {
        count: followUpEvents.length,
        urgency: output.assessment.urgency
      },
      idempotencyKey: `followup:${created.leadId}:${stableHash(followUpEvents)}`
    }
  });

  return created;
}

/**
 * Mensaje entrante adicional en un hilo ya existente (Meta u otros).
 * No re-ejecuta calificación completa en este MVP (solo persistencia + actividad).
 */
export async function appendInboundTextMessage(params: {
  agencyId: string;
  conversationId: string;
  leadId: string;
  body: string;
  sentAt: Date;
  externalMessageId?: string | null;
  senderName?: string | null;
}) {
  const appended = await db.$transaction(async (tx) => {
    if (params.externalMessageId?.trim()) {
      const duplicated = await tx.message.findFirst({
        where: {
          conversationId: params.conversationId,
          externalMessageId: params.externalMessageId.trim()
        },
        select: { id: true }
      });
      if (duplicated) {
        return false;
      }
    }

    await tx.message.create({
      data: {
        conversationId: params.conversationId,
        agencyId: params.agencyId,
        externalMessageId: params.externalMessageId?.trim() || undefined,
        direction: MessageDirection.INBOUND,
        senderType: SenderType.CONTACT,
        senderName: params.senderName?.trim() || null,
        body: params.body,
        sentAt: params.sentAt,
        approvalStatus: MessageApprovalStatus.APPROVED,
        deliveryStatus: DeliveryStatus.DELIVERED
      }
    });
    await tx.lead.update({
      where: { id: params.leadId },
      data: { lastActivityAt: params.sentAt }
    });

    return true;
  });

  if (!appended) {
    return { duplicated: true as const };
  }

  await rerunLeadIntelligence(params.agencyId, params.leadId);
  return { duplicated: false as const };
}

async function rerunLeadIntelligence(agencyId: string, leadId: string) {
  const lead = await db.lead.findFirst({
    where: { id: leadId, agencyId },
    include: {
      profile: true,
      conversations: {
        include: {
          messages: { orderBy: { sentAt: "asc" } }
        }
      }
    }
  });
  if (!lead) return;

  const qualificationMessages: InboundConversationMessage[] = lead.conversations
    .flatMap((conversation) => conversation.messages)
    .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime())
    .map((message) => ({
      id: message.externalMessageId ?? message.id,
      body: message.body,
      direction: message.direction === MessageDirection.INBOUND ? "inbound" : "outbound",
      sentAt: message.sentAt.toISOString(),
      channel: toQualificationChannel(lead.sourceChannel)
    }));

  if (!qualificationMessages.length) return;

  const policy = await getAgencyPolicy(agencyId);

  const output = await runLeadQualificationPipeline({
    agencyId,
    leadId,
    messages: qualificationMessages,
    now: new Date().toISOString(),
    policy
  });

  const inferredStage = toStage(output.assessment.leadScore);
  const closedStages = new Set<LeadStage>([LeadStage.WON, LeadStage.LOST]);
  const keepsCurrentStage =
    stageRank(lead.stage) > stageRank(inferredStage) || closedStages.has(lead.stage);
  const nextStage = keepsCurrentStage ? lead.stage : inferredStage;

  await db.$transaction(async (tx) => {
    await tx.lead.update({
      where: { id: leadId },
      data: {
        stage: nextStage,
        leadScore: output.assessment.leadScore,
        closeProbability: Math.min(95, Math.max(5, Math.round(output.assessment.leadScore * 0.82))),
        priority: toPriority(output.assessment.recommendedPriority),
        timelineMonths: output.profile.timelineMonths,
        seriousness: toSeriousness(output.profile.seriousness),
        urgency: toUrgency(output.profile.urgency),
        lastActivityAt: new Date(qualificationMessages[qualificationMessages.length - 1].sentAt)
      }
    });

    if (lead.stage !== nextStage) {
      await tx.leadStageHistory.create({
        data: {
          leadId,
          fromStage: lead.stage,
          toStage: nextStage,
          reason: "Recalificación automática por nuevo mensaje entrante"
        }
      });
    }

    await tx.leadProfile.upsert({
      where: { leadId },
      create: {
        leadId,
        budgetMin: output.profile.budget?.min,
        budgetMax: output.profile.budget?.max,
        budgetCurrency: output.profile.budget?.currency,
        preferredZones: output.profile.preferredZones,
        propertyType: output.profile.propertyType,
        bedrooms: output.profile.bedrooms,
        financingMode: toFinancingMode(output.profile.financingMode),
        timelineMonths: output.profile.timelineMonths,
        seriousness: toSeriousness(output.profile.seriousness),
        urgency: toUrgency(output.profile.urgency),
        objections: output.profile.objections,
        buyingIntentSummary: output.profile.buyingIntentSummary,
        extractionJson: output.extraction as unknown as Prisma.JsonObject,
        confidenceOverall: output.confidence.overall
      },
      update: {
        budgetMin: output.profile.budget?.min,
        budgetMax: output.profile.budget?.max,
        budgetCurrency: output.profile.budget?.currency,
        preferredZones: output.profile.preferredZones,
        propertyType: output.profile.propertyType,
        bedrooms: output.profile.bedrooms,
        financingMode: toFinancingMode(output.profile.financingMode),
        timelineMonths: output.profile.timelineMonths,
        seriousness: toSeriousness(output.profile.seriousness),
        urgency: toUrgency(output.profile.urgency),
        objections: output.profile.objections,
        buyingIntentSummary: output.profile.buyingIntentSummary,
        extractionJson: output.extraction as unknown as Prisma.JsonObject,
        confidenceOverall: output.confidence.overall
      }
    });

    if (output.confidence.requiresHumanReview) {
      const existingManual = await tx.task.findFirst({
        where: {
          leadId,
          type: "MANUAL_REVIEW",
          status: "OPEN"
        },
        select: { id: true }
      });
      if (!existingManual) {
        await tx.task.create({
          data: {
            leadId,
            type: "MANUAL_REVIEW",
            title: "Revisar salida de calificación por baja confianza"
          }
        });
      }
    } else {
      await tx.task.updateMany({
        where: {
          leadId,
          type: "MANUAL_REVIEW",
          status: "OPEN"
        },
        data: { status: "COMPLETED" }
      });
    }

    await tx.aiRun.create({
      data: {
        agencyId,
        leadId,
        type: AiRunType.SCORE_LEAD,
        status: AiRunStatus.SUCCESS,
        model: "deterministic-rules",
        version: output.version,
        inputHash: stableHash(qualificationMessages),
        outputJson: output as unknown as Prisma.JsonObject,
        confidence: output.confidence.overall
      }
    });

    await tx.analyticsEvent.create({
      data: {
        agencyId,
        leadId,
        type: "qualification.updated",
        properties: {
          score: output.assessment.leadScore,
          priority: output.assessment.recommendedPriority,
          confidence: output.confidence.overall,
          nextAction: output.assessment.recommendedNextAction.type,
          reason: "inbound_message_requalification"
        },
        idempotencyKey: `qualification-refresh:${leadId}:${stableHash(output.assessment)}`
      }
    });

    await tx.analyticsEvent.create({
      data: {
        agencyId,
        leadId,
        type: "qualification.eval.online",
        properties: {
          extractionStrategy: output.extractionStrategy,
          confidence: output.confidence.overall,
          requiresHumanReview: output.confidence.requiresHumanReview,
          missingCriticalFields: output.confidence.missingCriticalFields,
          score: output.assessment.leadScore,
          reason: "inbound_message_requalification"
        },
        idempotencyKey: `qualification-eval-refresh:${leadId}:${stableHash({
          strategy: output.extractionStrategy,
          confidence: output.confidence.overall,
          score: output.assessment.leadScore
        })}`
      }
    });
  });

  const recommendations = await createRecommendationsForLead({
    agencyId,
    leadId,
    preferredZones: output.profile.preferredZones,
    budgetMin: output.profile.budget?.min ?? null,
    budgetMax: output.profile.budget?.max ?? null,
    bedrooms: output.profile.bedrooms,
    propertyType: output.profile.propertyType,
    matchingMode: policy.matchingMode
  });

  const followUpEvents = await createFollowUpPlan({
    leadId,
    urgency: output.assessment.urgency,
    recommendedActionType: output.assessment.recommendedNextAction.type,
    requiresManualReview: output.confidence.requiresHumanReview,
    outreachTone: policy.outreachTone
  });

  await db.aiRun.create({
    data: {
      agencyId,
      leadId,
      type: AiRunType.RANK_PROPERTIES,
      status: AiRunStatus.SUCCESS,
      model: "deterministic-rules",
      version: "recommendation_v1",
      inputHash: stableHash({
        preferredZones: output.profile.preferredZones,
        budget: output.profile.budget,
        bedrooms: output.profile.bedrooms
      }),
      outputJson: recommendations as unknown as Prisma.JsonObject,
      confidence: recommendations.length ? recommendations[0].fitScore : 0.3
    }
  });

  await db.aiRun.create({
    data: {
      agencyId,
      leadId,
      type: AiRunType.FOLLOW_UP_PLAN,
      status: AiRunStatus.SUCCESS,
      model: "deterministic-rules",
      version: "followup_v1",
      inputHash: stableHash({
        urgency: output.assessment.urgency,
        action: output.assessment.recommendedNextAction.type,
        manualReview: output.confidence.requiresHumanReview
      }),
      outputJson: followUpEvents as unknown as Prisma.JsonObject,
      confidence: output.confidence.overall
    }
  });
}

export async function getLeadSnapshot(leadId: string, agencyId?: string) {
  return db.lead.findFirst({
    where: agencyId ? { id: leadId, agencyId } : { id: leadId },
    include: {
      profile: true,
      recommendations: {
        include: { property: true },
        orderBy: { rank: "asc" }
      },
      followUpEvents: {
        orderBy: { scheduledFor: "asc" }
      },
      conversations: {
        include: {
          messages: {
            orderBy: { sentAt: "asc" }
          }
        }
      },
      tasks: {
        orderBy: { createdAt: "desc" }
      },
      stageHistory: {
        orderBy: { changedAt: "desc" }
      }
    }
  });
}
