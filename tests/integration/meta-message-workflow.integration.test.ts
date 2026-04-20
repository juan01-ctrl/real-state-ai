import { randomUUID } from "crypto";
import { ChannelConnectionStatus, ChannelType, DeliveryStatus, MessageApprovalStatus, MessageDirection } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ingestLeadAndQualify } from "@/lib/server/lead-intake";
import { processWhatsAppBusinessAccountPayload } from "@/lib/server/meta-inbound";
import { encryptMetaAccessToken } from "@/lib/server/meta-token-crypto";
import { getLeadDetail, getLeadInboxItems } from "@/lib/server/read-models/leads";
import { getStrategicInsightsModel } from "@/lib/server/read-models/strategic-insights";
import {
  approveMetaOutboundDraft,
  discardMetaOutboundDraft,
  sendMetaOutboundMessage
} from "@/lib/server/send-meta-outbound";
import { db } from "@/lib/server/db";

const RUN = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!RUN)("meta outbound workflow (integration)", () => {
  const agencyId = `mvp_meta_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
  const phoneNumberId = `phone_${randomUUID().slice(0, 8)}`;
  const waDigits = `54911${Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(9, "0")}`;
  const externalThreadId = `wa:${waDigits}`;
  let connectionId = "";
  let leadId = "";
  let previousEncryptionKey: string | undefined;
  let dbReady = false;

  beforeAll(async () => {
    try {
      await db.$queryRaw`SELECT 1`;
      dbReady = true;
    } catch (err) {
      console.warn("[integration] DB no disponible, se omiten tests de integración Meta.", err);
      return;
    }

    previousEncryptionKey = process.env.META_TOKEN_ENCRYPTION_KEY;
    if (!process.env.META_TOKEN_ENCRYPTION_KEY?.trim()) {
      process.env.META_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
    }

    await db.agency.create({
      data: {
        id: agencyId,
        name: "ITest Meta Agency",
        slug: `itest-meta-${agencyId.slice(-12)}`
      }
    });

    const conn = await db.channelConnection.create({
      data: {
        agencyId,
        type: ChannelType.WHATSAPP,
        label: "WhatsApp ITest",
        status: ChannelConnectionStatus.CONNECTED,
        externalAccountId: phoneNumberId,
        accessTokenEnc: encryptMetaAccessToken("itest-meta-token")
      }
    });
    connectionId = conn.id;

    const intake = await ingestLeadAndQualify({
      agencyId,
      sourceChannel: "WHATSAPP",
      contactName: "Contacto Meta ITest",
      channelConnectionId: connectionId,
      externalThreadId,
      messages: [
        {
          id: "meta-itest-in-1",
          body: "Hola, quiero visitar una propiedad en Palermo esta semana.",
          direction: "inbound",
          sentAt: new Date().toISOString(),
          channel: "WHATSAPP"
        }
      ]
    });
    leadId = intake.leadId;
  });

  afterAll(async () => {
    if (dbReady) {
      await db.agency.delete({ where: { id: agencyId } }).catch(() => {});
    }
    process.env.META_TOKEN_ENCRYPTION_KEY = previousEncryptionKey;
    await db.$disconnect();
  });

  it("draft -> approve/send -> webhook read updates delivery", async () => {
    if (!dbReady) return;

    const draft = await sendMetaOutboundMessage(leadId, agencyId, "Mensaje ITest para aprobar", "Operador ITest");
    expect(draft.ok).toBe(true);
    if (!draft.ok) return;

    const createdDraft = await db.message.findFirst({
      where: { id: draft.messageId },
      select: { id: true, approvalStatus: true, deliveryStatus: true }
    });
    expect(createdDraft?.approvalStatus).toBe(MessageApprovalStatus.PENDING);
    expect(createdDraft?.deliveryStatus).toBe(DeliveryStatus.NOT_SENT);

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        messages: [{ id: "wamid.itest.out.1" }]
      })
    } as Response);

    try {
      const approved = await approveMetaOutboundDraft(leadId, draft.messageId, agencyId, "Aprobador ITest");
      expect(approved.ok).toBe(true);
    } finally {
      fetchSpy.mockRestore();
    }

    const afterApprove = await db.message.findFirst({
      where: { id: draft.messageId },
      select: { approvalStatus: true, deliveryStatus: true, externalMessageId: true }
    });
    expect(afterApprove?.approvalStatus).toBe(MessageApprovalStatus.APPROVED);
    expect(afterApprove?.deliveryStatus).toBe(DeliveryStatus.DELIVERED);
    expect(afterApprove?.externalMessageId).toBe("wamid.itest.out.1");

    const webhookResult = await processWhatsAppBusinessAccountPayload({
      object: "whatsapp_business_account",
      entry: [
        {
          changes: [
            {
              value: {
                metadata: { phone_number_id: phoneNumberId },
                statuses: [
                  {
                    id: "wamid.itest.out.1",
                    status: "read"
                  }
                ]
              }
            }
          ]
        }
      ]
    });
    expect(webhookResult.errors).toEqual([]);

    const afterRead = await db.message.findFirst({
      where: { id: draft.messageId },
      select: { deliveryStatus: true }
    });
    expect(afterRead?.deliveryStatus).toBe(DeliveryStatus.READ);

    const detail = await getLeadDetail(leadId, agencyId);
    expect(detail?.metaReply?.pendingApprovalCount).toBe(0);
    expect(detail?.metaReply?.lastOutboundStatus).toBe(DeliveryStatus.READ);
    expect(
      detail?.conversation.some(
        (m) => m.direction === MessageDirection.OUTBOUND && m.approvalStatus === MessageApprovalStatus.APPROVED
      )
    ).toBe(true);
  });

  it("discard keeps audit trail as rejected and removes from pending queue", async () => {
    if (!dbReady) return;

    const draft = await sendMetaOutboundMessage(leadId, agencyId, "Mensaje para descartar", "Operador ITest");
    expect(draft.ok).toBe(true);
    if (!draft.ok) return;

    const discarded = await discardMetaOutboundDraft(leadId, draft.messageId, agencyId);
    expect(discarded.ok).toBe(true);

    const message = await db.message.findFirst({
      where: { id: draft.messageId },
      select: { approvalStatus: true, deliveryStatus: true }
    });
    expect(message?.approvalStatus).toBe(MessageApprovalStatus.REJECTED);
    expect(message?.deliveryStatus).toBe(DeliveryStatus.NOT_SENT);

    const detail = await getLeadDetail(leadId, agencyId);
    expect(detail?.metaReply?.pendingDrafts.some((d) => d.id === draft.messageId)).toBe(false);

    const inbox = await getLeadInboxItems(agencyId);
    const row = inbox.find((l) => l.id === leadId);
    expect(row?.messaging.pendingApprovalCount).toBe(0);

    const insights = await getStrategicInsightsModel(agencyId);
    expect(insights.operationalMessaging.rejectedDrafts).toBeGreaterThanOrEqual(1);
  });
});
