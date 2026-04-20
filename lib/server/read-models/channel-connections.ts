import { cache } from "react";
import { db } from "@/lib/server/db";

export interface ChannelConnectionListItem {
  id: string;
  type: string;
  label: string;
  externalAccountId: string | null;
  status: string;
  hasToken: boolean;
  updatedAt: string;
}

export const getChannelConnectionsForAgency = cache(async (agencyId: string): Promise<ChannelConnectionListItem[]> => {
  const rows = await db.channelConnection.findMany({
    where: { agencyId },
    orderBy: [{ type: "asc" }, { updatedAt: "desc" }]
  });
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    label: r.label,
    externalAccountId: r.externalAccountId,
    status: r.status,
    hasToken: Boolean(r.accessTokenEnc),
    updatedAt: r.updatedAt.toISOString()
  }));
});
