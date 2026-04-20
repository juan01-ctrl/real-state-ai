import { NextRequest, NextResponse } from "next/server";
import { processInstagramMessagingPayload, processWhatsAppBusinessAccountPayload } from "@/lib/server/meta-inbound";
import { verifyMetaWebhookSignature } from "@/lib/server/meta-signature";

export const dynamic = "force-dynamic";

/**
 * Webhook único para Meta (WhatsApp Cloud API + Instagram messaging).
 * Configurá la misma URL y el mismo verify token en el panel de desarrolladores.
 */
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  const verify = process.env.META_WEBHOOK_VERIFY_TOKEN?.trim();

  if (mode === "subscribe" && token && verify && token === verify && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const appSecret = process.env.META_APP_SECRET?.trim();

  if (appSecret) {
    const sig = request.headers.get("x-hub-signature-256");
    if (!verifyMetaWebhookSignature(rawBody, sig, appSecret)) {
      return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
    }
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const obj = (body as { object?: string }).object;

  if (obj === "whatsapp_business_account") {
    const r = await processWhatsAppBusinessAccountPayload(body);
    return NextResponse.json({ ok: true, ...r });
  }

  if (obj === "instagram") {
    const r = await processInstagramMessagingPayload(body);
    return NextResponse.json({ ok: true, ...r });
  }

  return NextResponse.json({ ok: true, ignored: true, object: obj ?? null });
}
