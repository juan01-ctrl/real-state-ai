import { Prisma } from "@prisma/client";
import { dispatchApprovedMetaMessageById } from "@/lib/server/send-meta-outbound";

interface MetaOutboundPayload {
  draftMessageId?: string;
}

function parseMetaPayload(payload: Prisma.JsonValue): { draftMessageId: string } | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const candidate = payload as MetaOutboundPayload;
  if (!candidate.draftMessageId || typeof candidate.draftMessageId !== "string") return null;
  return { draftMessageId: candidate.draftMessageId };
}

export async function runCriticalJobHandler(job: {
  id: string;
  agencyId: string;
  type: string;
  payload: Prisma.JsonValue;
}) {
  if (job.type === "META_OUTBOUND_SEND") {
    const parsed = parseMetaPayload(job.payload);
    if (!parsed) {
      throw new Error("invalid_meta_payload");
    }
    const sent = await dispatchApprovedMetaMessageById(job.agencyId, parsed.draftMessageId);
    if (!sent.ok) {
      throw new Error(sent.message);
    }
    return;
  }

  throw new Error(`unsupported_job_type:${job.type}`);
}
