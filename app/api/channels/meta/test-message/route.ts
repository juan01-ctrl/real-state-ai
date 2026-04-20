import { NextRequest, NextResponse } from "next/server";
import { ChannelType } from "@prisma/client";
import { requireSessionContext } from "@/lib/server/auth-session";
import { db } from "@/lib/server/db";
import { sendInstagramText, sendWhatsAppText } from "@/lib/server/meta-outbound";
import { decryptMetaAccessToken } from "@/lib/server/meta-token-crypto";

export const dynamic = "force-dynamic";

type Body = {
  connectionId?: string;
  recipientId?: string;
  text?: string;
};

export async function POST(request: NextRequest) {
  try {
    const { agencyId } = await requireSessionContext();
    const body = (await request.json()) as Body;

    const connectionId = body.connectionId?.trim();
    const recipientId = body.recipientId?.trim();
    const text = body.text?.trim();

    if (!connectionId || !recipientId || !text) {
      return NextResponse.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
    }

    const connection = await db.channelConnection.findFirst({
      where: {
        id: connectionId,
        agencyId,
        type: { in: [ChannelType.WHATSAPP, ChannelType.INSTAGRAM] }
      }
    });

    if (!connection) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    if (!connection.accessTokenEnc) {
      return NextResponse.json({ ok: false, error: "NO_TOKEN" }, { status: 400 });
    }

    if (!connection.externalAccountId) {
      return NextResponse.json({ ok: false, error: "MISSING_EXTERNAL_ID" }, { status: 400 });
    }

    let token: string;
    try {
      token = decryptMetaAccessToken(connection.accessTokenEnc);
    } catch {
      return NextResponse.json({ ok: false, error: "TOKEN_DECRYPT_FAILED" }, { status: 503 });
    }

    try {
      if (connection.type === ChannelType.WHATSAPP) {
        await sendWhatsAppText({
          phoneNumberId: connection.externalAccountId,
          accessToken: token,
          toDigits: recipientId,
          body: text
        });
      } else {
        await sendInstagramText({
          instagramBusinessAccountId: connection.externalAccountId,
          accessToken: token,
          recipientInstagramScopedId: recipientId,
          body: text
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "GRAPH_ERROR";
      return NextResponse.json({ ok: false, error: "GRAPH_ERROR", message }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    throw e;
  }
}
