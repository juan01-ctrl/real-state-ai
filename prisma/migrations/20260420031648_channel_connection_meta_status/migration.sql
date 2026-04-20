-- CreateEnum
CREATE TYPE "ChannelConnectionStatus" AS ENUM ('DISCONNECTED', 'PENDING_SETUP', 'CONNECTED');

-- AlterTable
ALTER TABLE "ChannelConnection" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "status" "ChannelConnectionStatus" NOT NULL DEFAULT 'PENDING_SETUP';

-- CreateIndex
CREATE INDEX "ChannelConnection_externalAccountId_idx" ON "ChannelConnection"("externalAccountId");
