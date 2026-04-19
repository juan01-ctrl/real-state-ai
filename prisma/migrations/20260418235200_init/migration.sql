-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('AGENCY_ADMIN', 'AGENT');

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('WHATSAPP', 'INSTAGRAM', 'WEB_FORM', 'PORTAL', 'MANUAL_IMPORT');

-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'VISIT_SCHEDULED', 'OFFER_NEGOTIATION', 'WON', 'LOST', 'NURTURE');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('CONTACT', 'AGENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('DELIVERED', 'READ', 'PENDING_APPROVAL', 'FAILED');

-- CreateEnum
CREATE TYPE "FinancingMode" AS ENUM ('CASH', 'MORTGAGE', 'PRE_APPROVED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SeriousnessLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "LeadPriority" AS ENUM ('P1', 'P2', 'P3');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('CALL', 'FOLLOW_UP_MESSAGE', 'VISIT_CONFIRM', 'MANUAL_REVIEW');

-- CreateEnum
CREATE TYPE "AiRunType" AS ENUM ('EXTRACT_PROFILE', 'SCORE_LEAD', 'RANK_PROPERTIES', 'FOLLOW_UP_PLAN');

-- CreateEnum
CREATE TYPE "AiRunStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "FollowUpEventStatus" AS ENUM ('SCHEDULED', 'EXECUTED', 'FAILED', 'NEEDS_APPROVAL');

-- CreateEnum
CREATE TYPE "RecommendationUseCase" AS ENUM ('LIVING', 'INVESTMENT');

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'AGENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelConnection" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "type" "ChannelType" NOT NULL,
    "label" TEXT NOT NULL,
    "externalAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChannelConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "contactName" TEXT,
    "ownerUserId" TEXT,
    "stage" "LeadStage" NOT NULL DEFAULT 'NEW',
    "sourceChannel" "ChannelType" NOT NULL,
    "sourceCampaign" TEXT,
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "closeProbability" INTEGER NOT NULL DEFAULT 0,
    "priority" "LeadPriority" NOT NULL DEFAULT 'P3',
    "timelineMonths" INTEGER,
    "seriousness" "SeriousnessLevel" NOT NULL DEFAULT 'LOW',
    "urgency" "UrgencyLevel" NOT NULL DEFAULT 'LOW',
    "lastActivityAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadProfile" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "budgetCurrency" TEXT,
    "preferredZones" TEXT[],
    "propertyType" TEXT NOT NULL,
    "bedrooms" INTEGER,
    "financingMode" "FinancingMode" NOT NULL DEFAULT 'UNKNOWN',
    "timelineMonths" INTEGER,
    "seriousness" "SeriousnessLevel" NOT NULL,
    "urgency" "UrgencyLevel" NOT NULL,
    "objections" TEXT[],
    "buyingIntentSummary" TEXT NOT NULL,
    "extractionJson" JSONB NOT NULL,
    "confidenceOverall" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "channelConnectionId" TEXT,
    "externalThreadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "senderType" "SenderType" NOT NULL,
    "senderName" TEXT,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "deliveryStatus" "DeliveryStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "TaskType" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUpEvent" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "status" "FollowUpEventStatus" NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "occurredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowUpEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "propertyType" TEXT NOT NULL,
    "useCase" "RecommendationUseCase" NOT NULL,
    "appreciationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyRecommendation" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "fitScore" DOUBLE PRECISION NOT NULL,
    "reasons" TEXT[],
    "tradeoff" TEXT,
    "strategy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadStageHistory" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "fromStage" "LeadStage",
    "toStage" "LeadStage" NOT NULL,
    "reason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadStageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiRun" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "leadId" TEXT,
    "type" "AiRunType" NOT NULL,
    "status" "AiRunStatus" NOT NULL,
    "model" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "outputJson" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "leadId" TEXT,
    "type" TEXT NOT NULL,
    "properties" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idempotencyKey" TEXT NOT NULL,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agency_slug_key" ON "Agency"("slug");

-- CreateIndex
CREATE INDEX "User_agencyId_idx" ON "User"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "User_agencyId_email_key" ON "User"("agencyId", "email");

-- CreateIndex
CREATE INDEX "ChannelConnection_agencyId_type_idx" ON "ChannelConnection"("agencyId", "type");

-- CreateIndex
CREATE INDEX "Lead_agencyId_stage_idx" ON "Lead"("agencyId", "stage");

-- CreateIndex
CREATE INDEX "Lead_agencyId_priority_idx" ON "Lead"("agencyId", "priority");

-- CreateIndex
CREATE INDEX "Lead_agencyId_lastActivityAt_idx" ON "Lead"("agencyId", "lastActivityAt");

-- CreateIndex
CREATE UNIQUE INDEX "LeadProfile_leadId_key" ON "LeadProfile"("leadId");

-- CreateIndex
CREATE INDEX "Conversation_leadId_idx" ON "Conversation"("leadId");

-- CreateIndex
CREATE INDEX "Conversation_agencyId_idx" ON "Conversation"("agencyId");

-- CreateIndex
CREATE INDEX "Message_conversationId_sentAt_idx" ON "Message"("conversationId", "sentAt");

-- CreateIndex
CREATE INDEX "Message_agencyId_sentAt_idx" ON "Message"("agencyId", "sentAt");

-- CreateIndex
CREATE INDEX "Note_leadId_createdAt_idx" ON "Note"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "Task_leadId_status_idx" ON "Task"("leadId", "status");

-- CreateIndex
CREATE INDEX "FollowUpEvent_leadId_scheduledFor_idx" ON "FollowUpEvent"("leadId", "scheduledFor");

-- CreateIndex
CREATE INDEX "Property_agencyId_neighborhood_idx" ON "Property"("agencyId", "neighborhood");

-- CreateIndex
CREATE INDEX "Property_agencyId_useCase_idx" ON "Property"("agencyId", "useCase");

-- CreateIndex
CREATE INDEX "PropertyRecommendation_leadId_rank_idx" ON "PropertyRecommendation"("leadId", "rank");

-- CreateIndex
CREATE INDEX "LeadStageHistory_leadId_changedAt_idx" ON "LeadStageHistory"("leadId", "changedAt");

-- CreateIndex
CREATE INDEX "AiRun_agencyId_createdAt_idx" ON "AiRun"("agencyId", "createdAt");

-- CreateIndex
CREATE INDEX "AiRun_leadId_createdAt_idx" ON "AiRun"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_agencyId_occurredAt_idx" ON "AnalyticsEvent"("agencyId", "occurredAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_leadId_occurredAt_idx" ON "AnalyticsEvent"("leadId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsEvent_agencyId_idempotencyKey_key" ON "AnalyticsEvent"("agencyId", "idempotencyKey");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelConnection" ADD CONSTRAINT "ChannelConnection_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadProfile" ADD CONSTRAINT "LeadProfile_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_channelConnectionId_fkey" FOREIGN KEY ("channelConnectionId") REFERENCES "ChannelConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpEvent" ADD CONSTRAINT "FollowUpEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyRecommendation" ADD CONSTRAINT "PropertyRecommendation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyRecommendation" ADD CONSTRAINT "PropertyRecommendation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadStageHistory" ADD CONSTRAINT "LeadStageHistory_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiRun" ADD CONSTRAINT "AiRun_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiRun" ADD CONSTRAINT "AiRun_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
