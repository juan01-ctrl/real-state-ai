import { ChannelType, DeliveryStatus, MessageApprovalStatus, MessageDirection, SenderType } from "@prisma/client";
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

export type ApproveMetaOutboundResult =
  | { ok: true; messageId: string }
  | {
      ok: false;
      code:
        | "NOT_FOUND"
        | "NO_META_THREAD"
        | "NO_TOKEN"
        | "GRAPH_ERROR"
        | "ENCRYPTION_NOT_CONFIGURED"
        | "INVALID_DRAFT_STATE";
      message: string;
    };

export type DiscardMetaOutboundResult =
  | { ok: true }
  | {
      ok: false;
      code: "NOT_FOUND" | "INVALID_DRAFT_STATE";
      message: string;
    };

type LeadMetaContext =
  | {
      ok: true;
      leadId: string;
      convId: string;
      conn: {
        type: ChannelType;
        externalAccountId: string | null;
        accessTokenEnc: string | null;
      };
      externalThreadId: string;
    }
  | {
      ok: false;
      code: "NOT_FOUND" | "NO_META_THREAD";
      message: string;
    };

async function getLeadMetaContext(leadId: string, agencyId: string): Promise<LeadMetaContext> {
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

  return {
    ok: true,
    leadId: lead.id,
    convId: conv.id,
    conn: {
      type: conv.channelConnection.type,
      externalAccountId: conv.channelConnection.externalAccountId,
      accessTokenEnc: conv.channelConnection.accessTokenEnc
    },
    externalThreadId: conv.externalThreadId
  };
}

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

  const ctx = await getLeadMetaContext(leadId, agencyId);
  if (!ctx.ok) {
    return ctx;
  }

  try {
    const saved = await db.message.create({
      data: {
        conversationId: ctx.convId,
        agencyId,
        direction: MessageDirection.OUTBOUND,
        senderType: SenderType.AGENT,
        senderName: agentDisplayName,
        body: trimmed,
        sentAt: new Date(),
        // Estado inicial como borrador pendiente de aprobación humana.
        approvalStatus: MessageApprovalStatus.PENDING,
        deliveryStatus: DeliveryStatus.NOT_SENT
      }
    });

    return { ok: true, messageId: saved.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al enviar";
    return { ok: false, code: "GRAPH_ERROR", message: msg };
  }
}

export async function approveMetaOutboundDraft(
  leadId: string,
  draftMessageId: string,
  agencyId: string,
  approverName: string
): Promise<ApproveMetaOutboundResult> {
  const draft = await db.message.findFirst({
    where: {
      id: draftMessageId,
      agencyId,
      direction: MessageDirection.OUTBOUND,
      conversation: { leadId }
    },
    include: {
      conversation: {
        include: {
          channelConnection: true
        }
      }
    }
  });
  if (!draft) {
    return { ok: false, code: "NOT_FOUND", message: "Borrador no encontrado." };
  }
  if (draft.approvalStatus !== MessageApprovalStatus.PENDING) {
    return {
      ok: false,
      code: "INVALID_DRAFT_STATE",
      message: "Solo se pueden aprobar mensajes pendientes."
    };
  }
  const conv = draft.conversation;
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
    let sendResult: { messageId: string | null } | null = null;
    if (conn.type === ChannelType.WHATSAPP && thread.kind === "wa") {
      sendResult = await sendWhatsAppText({
        phoneNumberId: phoneOrIgId,
        accessToken,
        toDigits: thread.id,
        body: draft.body
      });
    } else if (conn.type === ChannelType.INSTAGRAM && thread.kind === "ig") {
      sendResult = await sendInstagramText({
        instagramBusinessAccountId: phoneOrIgId,
        accessToken,
        recipientInstagramScopedId: thread.id,
        body: draft.body
      });
    } else {
      return {
        ok: false,
        code: "NO_META_THREAD",
        message: "El tipo de canal no coincide con el hilo guardado."
      };
    }
    const sentAt = new Date();
    await db.$transaction(async (tx) => {
      await tx.message.update({
        where: { id: draft.id },
        data: {
          externalMessageId: sendResult?.messageId ?? undefined,
          senderName: approverName,
          sentAt,
          approvalStatus: MessageApprovalStatus.APPROVED,
          // Meta aceptó el envío; quedará READ/FAILED por webhook cuando aplique.
          deliveryStatus: DeliveryStatus.DELIVERED
        }
      });
      await tx.lead.update({
        where: { id: leadId },
        data: { lastActivityAt: sentAt }
      });
    });
    return { ok: true, messageId: draft.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al enviar";
    await db.message.update({
      where: { id: draft.id },
      data: { deliveryStatus: DeliveryStatus.FAILED }
    });
    return { ok: false, code: "GRAPH_ERROR", message: msg };
  }
}

export async function discardMetaOutboundDraft(
  leadId: string,
  draftMessageId: string,
  agencyId: string
): Promise<DiscardMetaOutboundResult> {
  const draft = await db.message.findFirst({
      where: {
        id: draftMessageId,
        agencyId,
        direction: MessageDirection.OUTBOUND,
        conversation: { leadId }
      },
    select: { id: true, approvalStatus: true }
  });
  if (!draft) {
    return { ok: false, code: "NOT_FOUND", message: "Borrador no encontrado." };
  }
  if (draft.approvalStatus !== MessageApprovalStatus.PENDING) {
    return {
      ok: false,
      code: "INVALID_DRAFT_STATE",
      message: "Solo se pueden descartar mensajes pendientes."
    };
  }
  await db.message.update({
    where: { id: draft.id },
    data: {
      approvalStatus: MessageApprovalStatus.REJECTED
    }
  });
  return { ok: true };
}
