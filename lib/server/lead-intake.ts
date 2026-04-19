import {
  AiRunStatus,
  AiRunType,
  DeliveryStatus,
  FinancingMode,
  LeadPriority,
  LeadStage,
  MessageDirection,
  Prisma,
  SenderType,
  SeriousnessLevel,
  UrgencyLevel
} from "@prisma/client";
import { randomUUID } from "crypto";
import { runLeadQualificationPipeline } from "@/lib/qualification";
import { ChannelType, InboundConversationMessage, LeadQualificationInput } from "@/lib/qualification/types";
import { stableHash } from "@/lib/server/hash";
import { db } from "@/lib/server/db";
import { createRecommendationsForLead } from "@/lib/server/recommendations";
import { createFollowUpPlan } from "@/lib/server/follow-up";

export interface LeadIntakeRequest {
  agencyId: string;
  sourceChannel: ChannelType;
  sourceCampaign?: string;
  assignedAgentEmail?: string;
  contactName?: string;
  messages: InboundConversationMessage[];
  manualOverrides?: LeadQualificationInput["manualOverrides"];
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

function toDeliveryStatus(value: "delivered" | "read" | "pending_approval"): DeliveryStatus {
  if (value === "read") return DeliveryStatus.READ;
  if (value === "pending_approval") return DeliveryStatus.PENDING_APPROVAL;
  return DeliveryStatus.DELIVERED;
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

  const qualificationInput: LeadQualificationInput = {
    agencyId: input.agencyId,
    leadId,
    messages: input.messages,
    now: now.toISOString(),
    manualOverrides: input.manualOverrides
  };

  const output = runLeadQualificationPipeline(qualificationInput);

  const agency = await db.agency.upsert({
    where: { id: input.agencyId },
    update: {},
    create: {
      id: input.agencyId,
      slug: input.agencyId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name: `Agency ${input.agencyId}`
    }
  });

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
        agencyId: agency.id
      }
    });

    await tx.message.createMany({
      data: input.messages.map((message) => ({
        conversationId: conversation.id,
        agencyId: agency.id,
        direction: message.direction === "inbound" ? MessageDirection.INBOUND : MessageDirection.OUTBOUND,
        senderType: message.direction === "inbound" ? SenderType.CONTACT : SenderType.AGENT,
        senderName: message.direction === "inbound" ? input.contactName ?? "Contact" : "Agent",
        body: message.body,
        sentAt: new Date(message.sentAt),
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
        reason: "Initial stage from qualification pipeline"
      }
    });

    if (output.confidence.requiresHumanReview) {
      await tx.task.create({
        data: {
          leadId: lead.id,
          type: "MANUAL_REVIEW",
          title: "Review qualification output due to low confidence"
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
    propertyType: output.profile.propertyType
  });

  const followUpEvents = await createFollowUpPlan({
    leadId: created.leadId,
    urgency: output.assessment.urgency,
    recommendedActionType: output.assessment.recommendedNextAction.type,
    requiresManualReview: output.confidence.requiresHumanReview
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

export async function getLeadSnapshot(leadId: string) {
  return db.lead.findUnique({
    where: { id: leadId },
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
