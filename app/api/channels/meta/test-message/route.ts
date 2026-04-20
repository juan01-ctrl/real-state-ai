import { NextRequest, NextResponse } from "next/server";
import { ChannelType } from "@prisma/client";
import { logAuditEvent } from "@/lib/server/audit";
import { requirePermission } from "@/lib/server/auth-session";
import { db } from "@/lib/server/db";
import { sendInstagramText, sendWhatsAppText } from "@/lib/server/meta-outbound";
import { decryptMetaAccessToken } from "@/lib/server/meta-token-crypto";

export const dynamic = "force-dynamic";

type Body = {
  connectionId?: string;
  recipientId?: string;
  text?: string;
};

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/channels/meta/test-message",
    method: "POST",
    requiredBody: ["connectionId", "recipientId", "text"]
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET,POST,OPTIONS"
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const { agencyId, userId } = await requirePermission("channels.manage");
    const body = (await request.json()) as Body;

    const connectionId = body.connectionId?.trim();
    const recipientId = body.recipientId?.trim();
    const text = body.text?.trim();

    if (!connectionId || !recipientId || !text) {
      return NextResponse.json(
        { ok: false, error: "INVALID_INPUT", message: "Debés enviar connectionId, recipientId y text." },
        { status: 400 }
      );
    }

    const connection = await db.channelConnection.findFirst({
      where: {
        id: connectionId,
        agencyId,
        type: { in: [ChannelType.WHATSAPP, ChannelType.INSTAGRAM] }
      }
    });

    if (!connection) {
      const existsInOtherAgency = await db.channelConnection.findUnique({
        where: { id: connectionId },
        select: { id: true, agencyId: true }
      });
      if (existsInOtherAgency) {
        return NextResponse.json(
          {
            ok: false,
            error: "FORBIDDEN_CONNECTION",
            message: "La conexión existe pero no pertenece a tu agencia."
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        {
          ok: false,
          error: "NOT_FOUND",
          message: "La conexión no existe o fue eliminada. Actualizá la lista e intentá de nuevo."
        },
        { status: 404 }
      );
    }

    if (connection.status !== "CONNECTED") {
      return NextResponse.json(
        {
          ok: false,
          error: "CONNECTION_NOT_CONNECTED",
          message: "La conexión no está en estado Conectado."
        },
        { status: 400 }
      );
    }

    if (!connection.accessTokenEnc) {
      return NextResponse.json(
        {
          ok: false,
          error: "NO_TOKEN",
          message: "La conexión no tiene token de acceso para enviar mensajes."
        },
        { status: 400 }
      );
    }

    if (!connection.externalAccountId) {
      return NextResponse.json(
        {
          ok: false,
          error: "MISSING_EXTERNAL_ID",
          message: "La conexión no tiene configurado el ID de cuenta en Meta."
        },
        { status: 400 }
      );
    }

    let token: string;
    try {
      token = decryptMetaAccessToken(connection.accessTokenEnc);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "TOKEN_DECRYPT_FAILED",
          message: "No se pudo descifrar el token guardado. Volvé a cargarlo en la conexión."
        },
        { status: 503 }
      );
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

    await logAuditEvent({
      agencyId,
      userId,
      action: "channel.test_message.sent",
      resource: "ChannelConnection",
      resourceId: connection.id,
      summary: `Mensaje de prueba enviado por ${connection.type}`
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }
    throw e;
  }
}
