const GRAPH_VERSION = "v21.0";

export interface GraphErrorBody {
  error?: { message?: string; type?: string; code?: number };
}

export interface GraphSendResult {
  messageId: string | null;
  raw: Record<string, unknown>;
}

async function graphFetch(url: string, accessToken: string, body: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const json = (await res.json()) as GraphErrorBody & Record<string, unknown>;
  if (!res.ok || json.error) {
    const msg = json.error?.message ?? res.statusText;
    throw new Error(`Graph API ${res.status}: ${msg}`);
  }
  const messageId =
    typeof (json as { message_id?: unknown }).message_id === "string"
      ? ((json as { message_id: string }).message_id ?? null)
      : Array.isArray((json as { messages?: unknown }).messages) &&
          typeof (json as { messages: Array<{ id?: unknown }> }).messages[0]?.id === "string"
        ? ((json as { messages: Array<{ id: string }> }).messages[0]?.id ?? null)
        : null;

  return {
    messageId,
    raw: json
  } satisfies GraphSendResult;
}

/** WhatsApp Cloud API — envío de texto. `to` sin + (solo dígitos). */
export async function sendWhatsAppText(params: {
  phoneNumberId: string;
  accessToken: string;
  toDigits: string;
  body: string;
}) {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${params.phoneNumberId}/messages`;
  return graphFetch(url, params.accessToken, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: params.toDigits.replace(/\D/g, ""),
    type: "text",
    text: {
      preview_url: false,
      body: params.body
    }
  });
}

/** Instagram Messaging API — mensaje de texto al usuario (IGSID). */
export async function sendInstagramText(params: {
  instagramBusinessAccountId: string;
  accessToken: string;
  recipientInstagramScopedId: string;
  body: string;
}) {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${params.instagramBusinessAccountId}/messages`;
  return graphFetch(url, params.accessToken, {
    recipient: { id: params.recipientInstagramScopedId },
    message: { text: params.body }
  });
}
