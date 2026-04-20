-- Split editorial approval state from delivery lifecycle.
CREATE TYPE "MessageApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "Message"
ADD COLUMN "approvalStatus" "MessageApprovalStatus" NOT NULL DEFAULT 'APPROVED';

-- Existing pending-approval rows become editorially pending.
UPDATE "Message"
SET "approvalStatus" = 'PENDING'
WHERE "deliveryStatus" = 'PENDING_APPROVAL';

-- Delivery status should represent transport only; rename legacy value.
ALTER TYPE "DeliveryStatus" RENAME VALUE 'PENDING_APPROVAL' TO 'NOT_SENT';
