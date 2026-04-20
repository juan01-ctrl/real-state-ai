import { NextResponse } from "next/server";
import { ChannelType, MessageDirection } from "@prisma/client";
import { requireSessionContext } from "@/lib/server/auth-session";
import { db } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { agencyId } = await requireSessionContext();

    const connections = await db.channelConnection.findMany({
      where: {
        agencyId,
        type: { in: [ChannelType.WHATSAPP, ChannelType.INSTAGRAM] }
      },
      orderBy: [{ type: "asc" }, { updatedAt: "desc" }]
    });

    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const rows = await Promise.all(
      connections.map(async (connection) => {
        const [inbound24h, outbound24h, lastMessage] = await Promise.all([
          db.message.count({
            where: {
              direction: MessageDirection.INBOUND,
              sentAt: { gte: dayAgo },
              conversation: { channelConnectionId: connection.id }
            }
          }),
          db.message.count({
            where: {
              direction: MessageDirection.OUTBOUND,
              sentAt: { gte: dayAgo },
              conversation: { channelConnectionId: connection.id }
            }
          }),
          db.message.findFirst({
            where: { conversation: { channelConnectionId: connection.id } },
            orderBy: { sentAt: "desc" },
            select: { sentAt: true, direction: true }
          })
        ]);

        return {
          id: connection.id,
          type: connection.type,
          label: connection.label,
          externalAccountId: connection.externalAccountId,
          status: connection.status,
          hasToken: Boolean(connection.accessTokenEnc),
          updatedAt: connection.updatedAt.toISOString(),
          inbound24h,
          outbound24h,
          lastMessageAt: lastMessage?.sentAt.toISOString() ?? null,
          lastMessageDirection: lastMessage?.direction ?? null
        };
      })
    );

    const summary = {
      totalConnections: rows.length,
      connected: rows.filter((r) => r.status === "CONNECTED").length,
      withToken: rows.filter((r) => r.hasToken).length,
      inbound24h: rows.reduce((acc, r) => acc + r.inbound24h, 0),
      outbound24h: rows.reduce((acc, r) => acc + r.outbound24h, 0),
      hasRecentActivity: rows.some((r) => r.inbound24h > 0 || r.outbound24h > 0)
    };

    return NextResponse.json({ ok: true, summary, connections: rows, checkedAt: new Date().toISOString() });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    throw e;
  }
}
