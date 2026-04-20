import { randomUUID } from "crypto";
import { ChannelConnectionStatus, ChannelType } from "@prisma/client";
import { db } from "@/lib/server/db";
import type { ChannelType as QualificationChannelType } from "@/lib/qualification/types";
import { appendInboundTextMessage, ingestLeadAndQualify } from "@/lib/server/lead-intake";

function toQualificationChannel(ct: ChannelType): QualificationChannelType {
  if (ct === ChannelType.WHATSAPP) return "WHATSAPP";
  if (ct === ChannelType.INSTAGRAM) return "INSTAGRAM";
  if (ct === ChannelType.WEB_FORM) return "WEB_FORM";
  return "PORTAL";
}

function threadKeyWhatsApp(from: string) {
  return `wa:${from.replace(/\D/g, "")}`;
}

function threadKeyInstagram(senderId: string) {
  return `ig:${senderId}`;
}

/** Meta suele enviar segundos UNIX (string o number). */
function parseMetaEpochToMs(raw: unknown): number {
  if (typeof raw === "string") return Number(raw) * 1000;
  if (typeof raw === "number") return raw < 1e12 ? raw * 1000 : raw;
  return Date.now();
}

async function findConnectionForWhatsApp(phoneNumberId: string) {
  return db.channelConnection.findFirst({
    where: {
      type: ChannelType.WHATSAPP,
      externalAccountId: phoneNumberId,
      status: { in: [ChannelConnectionStatus.CONNECTED, ChannelConnectionStatus.PENDING_SETUP] }
    }
  });
}

async function findConnectionForInstagram(igAccountId: string) {
  return db.channelConnection.findFirst({
    where: {
      type: ChannelType.INSTAGRAM,
      externalAccountId: igAccountId,
      status: { in: [ChannelConnectionStatus.CONNECTED, ChannelConnectionStatus.PENDING_SETUP] }
    }
  });
}

async function routeInboundText(params: {
  agencyId: string;
  channelConnectionId: string;
  sourceChannel: ChannelType;
  externalThreadId: string;
  body: string;
  sentAtMs: number;
  contactName?: string | null;
}) {
  const sentAt = new Date(params.sentAtMs);
  const existing = await db.conversation.findFirst({
    where: {
      agencyId: params.agencyId,
      channelConnectionId: params.channelConnectionId,
      externalThreadId: params.externalThreadId
    },
    include: { lead: true }
  });

  if (existing) {
    await appendInboundTextMessage({
      agencyId: params.agencyId,
      conversationId: existing.id,
      leadId: existing.leadId,
      body: params.body,
      sentAt,
      senderName: params.contactName
    });
    return { kind: "appended" as const, leadId: existing.leadId };
  }

  const qCh = toQualificationChannel(params.sourceChannel);
  const result = await ingestLeadAndQualify({
    agencyId: params.agencyId,
    sourceChannel: qCh,
    contactName: params.contactName ?? undefined,
    channelConnectionId: params.channelConnectionId,
    externalThreadId: params.externalThreadId,
    messages: [
      {
        id: randomUUID(),
        body: params.body,
        direction: "inbound",
        sentAt: sentAt.toISOString(),
        channel: qCh
      }
    ]
  });

  return { kind: "created" as const, leadId: result.leadId };
}

/** Procesa cuerpo JSON del webhook de Meta (WhatsApp Cloud API). */
export async function processWhatsAppBusinessAccountPayload(body: unknown): Promise<{ processed: number; errors: string[] }> {
  const errors: string[] = [];
  let processed = 0;
  const root = body as Record<string, unknown>;
  if (root.object !== "whatsapp_business_account") {
    return { processed: 0, errors: ["object_no_whatsapp_business_account"] };
  }
  const entries = Array.isArray(root.entry) ? root.entry : [];
  for (const entry of entries) {
    const e = entry as Record<string, unknown>;
    const changes = Array.isArray(e.changes) ? e.changes : [];
    for (const change of changes) {
      const ch = change as Record<string, unknown>;
      const value = ch.value as Record<string, unknown> | undefined;
      if (!value) continue;
      const metadata = value.metadata as Record<string, unknown> | undefined;
      const phoneNumberId = typeof metadata?.phone_number_id === "string" ? metadata.phone_number_id : null;
      if (!phoneNumberId) {
        errors.push("missing_phone_number_id");
        continue;
      }
      const conn = await findConnectionForWhatsApp(phoneNumberId);
      if (!conn) {
        errors.push(`no_connection:${phoneNumberId}`);
        continue;
      }
      const messages = Array.isArray(value.messages) ? value.messages : [];
      const contacts = Array.isArray(value.contacts) ? value.contacts : [];
      const nameByFrom = new Map<string, string>();
      for (const c of contacts) {
        const contact = c as Record<string, unknown>;
        const wa = contact.wa_id as string | undefined;
        const profile = contact.profile as Record<string, unknown> | undefined;
        const name = typeof profile?.name === "string" ? profile.name : undefined;
        if (wa && name) nameByFrom.set(wa, name);
      }
      for (const raw of messages) {
        const m = raw as Record<string, unknown>;
        const from = typeof m.from === "string" ? m.from : null;
        const ts = parseMetaEpochToMs(m.timestamp);
        if (!from || Number.isNaN(ts)) {
          errors.push("invalid_message_shape");
          continue;
        }
        const type = m.type;
        let text = "";
        if (type === "text") {
          const t = m.text as Record<string, unknown> | undefined;
          text = typeof t?.body === "string" ? t.body : "";
        } else {
          errors.push(`skip_type:${String(type)}`);
          continue;
        }
        if (!text.trim()) continue;
        try {
          await routeInboundText({
            agencyId: conn.agencyId,
            channelConnectionId: conn.id,
            sourceChannel: ChannelType.WHATSAPP,
            externalThreadId: threadKeyWhatsApp(from),
            body: text.trim(),
            sentAtMs: ts,
            contactName: nameByFrom.get(from) ?? null
          });
          processed += 1;
        } catch (err) {
          errors.push(err instanceof Error ? err.message : "route_failed");
        }
      }
    }
  }
  return { processed, errors };
}

/** Instagram messaging webhook (object: instagram). */
export async function processInstagramMessagingPayload(body: unknown): Promise<{ processed: number; errors: string[] }> {
  const errors: string[] = [];
  let processed = 0;
  const root = body as Record<string, unknown>;
  if (root.object !== "instagram") {
    return { processed: 0, errors: ["object_no_instagram"] };
  }
  const entries = Array.isArray(root.entry) ? root.entry : [];
  for (const entry of entries) {
    const e = entry as Record<string, unknown>;
    const igUserId = typeof e.id === "string" ? e.id : null;
    if (!igUserId) continue;
    const conn = await findConnectionForInstagram(igUserId);
    if (!conn) {
      errors.push(`no_connection_ig:${igUserId}`);
      continue;
    }
    const messaging = Array.isArray(e.messaging) ? e.messaging : [];
    for (const raw of messaging) {
      const msg = raw as Record<string, unknown>;
      const sender = msg.sender as Record<string, unknown> | undefined;
      const senderId = typeof sender?.id === "string" ? sender.id : null;
      const message = msg.message as Record<string, unknown> | undefined;
      const ts = parseMetaEpochToMs(msg.timestamp);
      if (!senderId || !message || Number.isNaN(ts)) continue;
      const text = typeof message.text === "string" ? message.text : "";
      if (!text.trim()) {
        errors.push("skip_non_text_ig");
        continue;
      }
      try {
        await routeInboundText({
          agencyId: conn.agencyId,
          channelConnectionId: conn.id,
          sourceChannel: ChannelType.INSTAGRAM,
          externalThreadId: threadKeyInstagram(senderId),
          body: text.trim(),
          sentAtMs: ts,
          contactName: null
        });
        processed += 1;
      } catch (err) {
        errors.push(err instanceof Error ? err.message : "route_failed_ig");
      }
    }
  }
  return { processed, errors };
}
