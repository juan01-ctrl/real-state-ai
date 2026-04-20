-- AlterTable
ALTER TABLE "Message" ADD COLUMN "externalMessageId" TEXT;

-- CreateIndex
CREATE INDEX "Message_conversationId_externalMessageId_idx" ON "Message"("conversationId", "externalMessageId");

-- CreateIndex
CREATE INDEX "Message_agencyId_externalMessageId_idx" ON "Message"("agencyId", "externalMessageId");
