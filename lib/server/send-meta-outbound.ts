import { ChannelType, DeliveryStatus, MessageDirection, SenderType } from "@prisma/client";
import { db } from "@/lib/server/db";
import { decryptMetaAccessToken } from "@/lib/server/meta-token-crypto";
import { sendInstagramText, sendWhatsAppText } from "@/lib/server/meta-outbound";

function parseThreadRecipient(externalThreadId: string): { kind: "wa" | "ig"; id: string } | null {
  if (externalThreadId.startsWith("wa:")) {
    return { kind: "wa", id: externalThreadId.slice(3) };
  }
  if (externalThreadId.startsWith("ig:")) {
    return { kind: "ig", id: externalThreadId.slice(3) };
  }
  return null;
}

export type SendMetaOutboundResult =
  | { ok: true; messageId: string }
  | {
      ok: false;
      code: "NOT_FOUND" | "NO_META_THREAD" | "NO_TOKEN" | "GRAPH_ERROR" | "ENCRYPTION_NOT_CONFIGURED";
      message: string;
    };

/**
 * Envía texto por WhatsApp o Instagram y persiste el mensaje saliente en la conversación.
 */
export async function sendMetaOutboundMessage(
  leadId: string,
  agencyId: string,
  text: string,
  agentDisplayName: string
): Promise<SendMetaOutboundResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, code: "GRAPH_ERROR", message: "El mensaje está vacío" };
  }

  const lead = await db.lead.findFirst({
    where: { id: leadId, agencyId },
    include: {
      conversations: {
        where: { channelConnectionId: { not: null }, externalThreadId: { not: null } },
        include: { channelConnection: true },
        take: 1,
        orderBy: { updatedAt: "desc" }
      }
    }
  });

  if (!lead) {
    return { ok: false, code: "NOT_FOUND", message: "Lead no encontrado" };
  }

  const conv = lead.conversations[0];
  if (!conv?.externalThreadId || !conv.channelConnection) {
    return {
      ok: false,
      code: "NO_META_THREAD",
      message: "Este lead no tiene un hilo de WhatsApp o Instagram vinculado."
    };
  }

  const conn = conv.channelConnection;
  if (!conn.accessTokenEnc) {
    return {
      ok: false,
      code: "NO_TOKEN",
      message: "Falta el token de acceso de Meta en Configuración para este canal."
    };
  }

  let accessToken: string;
  try {
    accessToken = decryptMetaAccessToken(conn.accessTokenEnc);
  } catch {
    return {
      ok: false,
      code: "ENCRYPTION_NOT_CONFIGURED",
      message: "No se pudo descifrar el token. Reingresalo en Configuración."
    };
  }

  const thread = parseThreadRecipient(conv.externalThreadId);
  if (!thread) {
    return { ok: false, code: "NO_META_THREAD", message: "Hilo externo inválido" };
  }

  const phoneOrIgId = conn.externalAccountId;
  if (!phoneOrIgId) {
    return { ok: false, code: "GRAPH_ERROR", message: "Falta el ID de número o cuenta en la conexión" };
  }

  try {
    if (conn.type === ChannelType.WHATSAPP && thread.kind === "wa") {
      await sendWhatsAppText({
        phoneNumberId: phoneOrIgId,
        accessToken,
        toDigits: thread.id,
        body: trimmed
      });
    } else if (conn.type === ChannelType.INSTAGRAM && thread.kind === "ig") {
      await sendInstagramText({
        instagramBusinessAccountId: phoneOrIgId,
        accessToken,
        recipientInstagramScopedId: thread.id,
        body: trimmed
      });
    } else {
      return {
        ok: false,
        code: "NO_META_THREAD",
        message: "El tipo de canal no coincide con el hilo guardado."
      };
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al enviar";
    return { ok: false, code: "GRAPH_ERROR", message: msg };
  }

  const saved = await db.$transaction(async (tx) => {
    const m = await tx.message.create({
      data: {
        conversationId: conv.id,
        agencyId,
        direction: MessageDirection.OUTBOUND,
        senderType: SenderType.AGENT,
        senderName: agentDisplayName,
        body: trimmed,
        sentAt: new Date(),
        deliveryStatus: DeliveryStatus.DELIVERED
      }
    });
    await tx.lead.update({
      where: { id: leadId },
      data: { lastActivityAt: new Date() }
    });
    return m;
  });

  return { ok: true, messageId: saved.id };
}
