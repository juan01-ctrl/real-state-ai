import { NextRequest, NextResponse } from "next/server";
import { ChannelConnectionStatus, ChannelType } from "@prisma/client";
import { db } from "@/lib/server/db";
import { requireSessionContext } from "@/lib/server/auth-session";
import { encryptMetaAccessToken, isMetaEncryptionConfigured } from "@/lib/server/meta-token-crypto";

export const dynamic = "force-dynamic";

function sanitizeConnection(c: {
  id: string;
  type: ChannelType;
  label: string;
  externalAccountId: string | null;
  status: ChannelConnectionStatus;
  accessTokenEnc: string | null;
  updatedAt: Date;
}) {
  return {
    id: c.id,
    type: c.type,
    label: c.label,
    externalAccountId: c.externalAccountId,
    status: c.status,
    hasToken: Boolean(c.accessTokenEnc),
    updatedAt: c.updatedAt.toISOString()
  };
}

export async function GET() {
  try {
    const { agencyId } = await requireSessionContext();
    const connections = await db.channelConnection.findMany({
      where: { agencyId },
      orderBy: [{ type: "asc" }, { updatedAt: "desc" }]
    });
    return NextResponse.json({
      ok: true,
      connections: connections.map((c) => ({
        id: c.id,
        type: c.type,
        label: c.label,
        externalAccountId: c.externalAccountId,
        status: c.status,
        hasToken: Boolean(c.accessTokenEnc),
        updatedAt: c.updatedAt.toISOString()
      }))
    });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    throw e;
  }
}

type Body = {
  type?: string;
  label?: string;
  externalAccountId?: string;
  status?: ChannelConnectionStatus;
  /** Si se envía vacío, se borra el token guardado. */
  accessToken?: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const { agencyId } = await requireSessionContext();
    const body = (await request.json()) as Body;
    const typeRaw = body.type?.toUpperCase();
    if (typeRaw !== "WHATSAPP" && typeRaw !== "INSTAGRAM") {
      return NextResponse.json({ ok: false, error: "invalid_type" }, { status: 400 });
    }
    const externalAccountId = body.externalAccountId?.trim();
    if (!externalAccountId) {
      return NextResponse.json({ ok: false, error: "externalAccountId_required" }, { status: 400 });
    }
    const label = body.label?.trim() || (typeRaw === "WHATSAPP" ? "WhatsApp Business" : "Instagram");
    const type = typeRaw === "INSTAGRAM" ? ChannelType.INSTAGRAM : ChannelType.WHATSAPP;

    let accessTokenEnc: string | null | undefined;
    if (body.accessToken !== undefined) {
      if (body.accessToken === null || (typeof body.accessToken === "string" && body.accessToken.trim() === "")) {
        accessTokenEnc = null;
      } else if (typeof body.accessToken === "string") {
        if (!isMetaEncryptionConfigured()) {
          return NextResponse.json(
            { ok: false, error: "encryption_key_missing", message: "Definí META_TOKEN_ENCRYPTION_KEY en el servidor." },
            { status: 503 }
          );
        }
        accessTokenEnc = encryptMetaAccessToken(body.accessToken.trim());
      }
    }

    const existing = await db.channelConnection.findFirst({
      where: { agencyId, type, externalAccountId }
    });

    if (existing) {
      const updated = await db.channelConnection.update({
        where: { id: existing.id },
        data: {
          label,
          status: body.status ?? ChannelConnectionStatus.CONNECTED,
          ...(accessTokenEnc !== undefined ? { accessTokenEnc } : {})
        }
      });
      return NextResponse.json({ ok: true, connection: sanitizeConnection(updated) });
    }

    const created = await db.channelConnection.create({
      data: {
        agencyId,
        type,
        label,
        externalAccountId,
        status: ChannelConnectionStatus.CONNECTED,
        ...(accessTokenEnc !== undefined ? { accessTokenEnc } : {})
      }
    });

    return NextResponse.json({ ok: true, connection: sanitizeConnection(created) }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    throw e;
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { agencyId } = await requireSessionContext();
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "id_required" }, { status: 400 });
    }
    const row = await db.channelConnection.findFirst({
      where: { id, agencyId }
    });
    if (!row) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    await db.channelConnection.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    throw e;
  }
}
