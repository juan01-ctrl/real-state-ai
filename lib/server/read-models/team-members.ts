import { UserRole } from "@prisma/client";
import { db } from "@/lib/server/db";

export interface TeamMemberListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  activeLeads: number;
  openTasks: number;
}

export interface TeamMembersModel {
  dbNow: string;
  members: TeamMemberListItem[];
}

async function getDatabaseNowIso() {
  const rows = await db.$queryRaw<Array<{ now: Date }>>`SELECT NOW() AS now`;
  return (rows[0]?.now ?? new Date()).toISOString();
}

export async function getTeamMembersForAgency(agencyId: string): Promise<TeamMembersModel> {
  const [users, leadsByOwner, tasksByOwner, dbNow] = await Promise.all([
    db.user.findMany({
      where: { agencyId },
      orderBy: [{ role: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    }),
    db.lead.groupBy({
      by: ["ownerUserId"],
      where: {
        agencyId,
        ownerUserId: { not: null },
        stage: { notIn: ["WON", "LOST"] }
      },
      _count: { _all: true }
    }),
    db.task.groupBy({
      by: ["leadId"],
      where: { status: "OPEN", lead: { agencyId } },
      _count: { _all: true }
    }),
    getDatabaseNowIso()
  ]);

  const leadCountByOwner = new Map<string, number>();
  for (const row of leadsByOwner) {
    if (!row.ownerUserId) continue;
    leadCountByOwner.set(row.ownerUserId, row._count._all);
  }

  const leadIds = tasksByOwner.map((row) => row.leadId);
  const leads = leadIds.length
    ? await db.lead.findMany({
        where: { id: { in: leadIds }, agencyId },
        select: { id: true, ownerUserId: true }
      })
    : [];

  const ownerByLeadId = new Map<string, string | null>();
  for (const lead of leads) {
    ownerByLeadId.set(lead.id, lead.ownerUserId ?? null);
  }

  const openTasksByOwner = new Map<string, number>();
  for (const row of tasksByOwner) {
    const ownerId = ownerByLeadId.get(row.leadId);
    if (!ownerId) continue;
    openTasksByOwner.set(ownerId, (openTasksByOwner.get(ownerId) ?? 0) + row._count._all);
  }

  const members: TeamMemberListItem[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    activeLeads: leadCountByOwner.get(user.id) ?? 0,
    openTasks: openTasksByOwner.get(user.id) ?? 0
  }));

  return {
    dbNow,
    members
  };
}
