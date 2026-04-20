import { cache } from "react";
import {
  FollowUpEventStatus,
  LeadPriority,
  LeadStage,
  Prisma,
  TaskStatus
} from "@prisma/client";
import { db } from "@/lib/server/db";
import { displayLeadStage } from "@/lib/i18n/present";

const CLOSED: LeadStage[] = [LeadStage.WON, LeadStage.LOST];

function hoursSince(date: Date | null): number {
  if (!date) return 999;
  return Math.max(0, Math.round((Date.now() - date.getTime()) / 1000 / 60 / 60));
}

function dayBounds() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export type TeamUrgentKind = "task" | "followup" | "stale";

export interface TeamUrgentItem {
  kind: TeamUrgentKind;
  id: string;
  leadId: string;
  fullName: string;
  zone: string;
  ownerLabel: string | null;
  headline: string;
  subline: string;
  sortKey: number;
}

export interface TeamLeadRow {
  leadId: string;
  fullName: string;
  zone: string;
  stageLabel: string;
  score: number;
  closeProbability: number;
  silenceHours: number;
  ownerLabel: string | null;
}

export interface TeamVisitRow {
  leadId: string;
  fullName: string;
  zone: string;
  bookedAt: string;
  ownerLabel: string | null;
}

export interface TeamWorkloadRow {
  userId: string;
  name: string;
  activeLeads: number;
}

export interface TeamTaskGroup {
  userId: string | null;
  name: string;
  tasks: {
    taskId: string;
    title: string;
    leadId: string;
    leadName: string;
    type: string;
  }[];
}

export interface TeamCommandCenterModel {
  headline: {
    urgentCount: number;
    visitsToday: number;
    unassignedHighValue: number;
    atRisk: number;
    openTasks: number;
  };
  urgentFollowUps: TeamUrgentItem[];
  unassignedHighValue: TeamLeadRow[];
  atRisk: TeamLeadRow[];
  visitsBookedToday: TeamVisitRow[];
  workloadByMember: TeamWorkloadRow[];
  openTasksByOwner: TeamTaskGroup[];
  insightHint: string | null;
}

function leadName(contactName: string | null, id: string) {
  return contactName?.trim() || `Contacto ${id.slice(0, 8)}`;
}

function zoneOf(zones: string[]) {
  return zones[0] ?? "—";
}

export const getTeamCommandCenterModel = cache(async (agencyId: string): Promise<TeamCommandCenterModel> => {
  const { start: dayStart, end: dayEnd } = dayBounds();

  const activeLeadWhere: Prisma.LeadWhereInput = {
    agencyId,
    stage: { notIn: CLOSED }
  };

  const [openTasksRaw, followUpsToday, visitHistory, allAgents, unassignedCandidates, atRiskCandidates, workloadGroups] =
    await Promise.all([
      db.task.findMany({
        where: {
          status: TaskStatus.OPEN,
          lead: activeLeadWhere
        },
        include: {
          lead: {
            include: {
              profile: true,
              owner: true
            }
          }
        },
        take: 80,
        orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }]
      }),
      db.followUpEvent.findMany({
        where: {
          status: FollowUpEventStatus.SCHEDULED,
          scheduledFor: { gte: dayStart, lte: dayEnd },
          lead: { agencyId }
        },
        include: {
          lead: {
            include: {
              profile: true,
              owner: true
            }
          }
        },
        orderBy: { scheduledFor: "asc" },
        take: 40
      }),
      db.leadStageHistory.findMany({
        where: {
          toStage: LeadStage.VISIT_SCHEDULED,
          changedAt: { gte: dayStart, lte: dayEnd },
          lead: { agencyId }
        },
        include: {
          lead: {
            include: {
              profile: true,
              owner: true
            }
          }
        },
        orderBy: { changedAt: "desc" },
        take: 40
      }),
      db.user.findMany({
        where: { agencyId },
        select: { id: true, name: true },
        orderBy: { name: "asc" }
      }),
      db.lead.findMany({
        where: {
          agencyId,
          ownerUserId: null,
          stage: { notIn: CLOSED },
          OR: [
            { closeProbability: { gte: 70 } },
            { leadScore: { gte: 75 } },
            { priority: { in: [LeadPriority.P1, LeadPriority.P2] } }
          ]
        },
        include: { profile: true },
        orderBy: [{ closeProbability: "desc" }, { leadScore: "desc" }],
        take: 12
      }),
      (() => {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return db.lead.findMany({
          where: {
            agencyId,
            stage: { notIn: CLOSED },
            leadScore: { gte: 65 },
            OR: [{ lastActivityAt: { lt: dayAgo } }, { lastActivityAt: null }]
          },
          include: { profile: true, owner: true },
          orderBy: { lastActivityAt: "asc" },
          take: 40
        });
      })(),
      db.lead.groupBy({
        by: ["ownerUserId"],
        where: {
          agencyId,
          stage: { notIn: CLOSED },
          ownerUserId: { not: null }
        },
        _count: { _all: true }
      })
    ]);

  const atRisk = atRiskCandidates
    .map((lead) => {
      const silenceHours = hoursSince(lead.lastActivityAt);
      return {
        lead,
        silenceHours
      };
    })
    .filter(({ silenceHours }) => silenceHours >= 24)
    .sort((a, b) => b.silenceHours - a.silenceHours)
    .slice(0, 10)
    .map(({ lead, silenceHours }): TeamLeadRow => ({
      leadId: lead.id,
      fullName: leadName(lead.contactName, lead.id),
      zone: zoneOf(lead.profile?.preferredZones ?? []),
      stageLabel: displayLeadStage(lead.stage),
      score: lead.leadScore,
      closeProbability: lead.closeProbability,
      silenceHours,
      ownerLabel: lead.owner?.name ?? null
    }));

  const unassignedHighValue: TeamLeadRow[] = unassignedCandidates.map((lead) => ({
    leadId: lead.id,
    fullName: leadName(lead.contactName, lead.id),
    zone: zoneOf(lead.profile?.preferredZones ?? []),
    stageLabel: displayLeadStage(lead.stage),
    score: lead.leadScore,
    closeProbability: lead.closeProbability,
    silenceHours: hoursSince(lead.lastActivityAt),
    ownerLabel: null
  }));

  const visitSeen = new Set<string>();
  const visitsBookedToday: TeamVisitRow[] = [];
  for (const row of visitHistory) {
    if (visitSeen.has(row.leadId)) continue;
    visitSeen.add(row.leadId);
    const l = row.lead;
    visitsBookedToday.push({
      leadId: l.id,
      fullName: leadName(l.contactName, l.id),
      zone: zoneOf(l.profile?.preferredZones ?? []),
      bookedAt: row.changedAt.toISOString(),
      ownerLabel: l.owner?.name ?? null
    });
    if (visitsBookedToday.length >= 10) break;
  }

  const userNameById = new Map(allAgents.map((u) => [u.id, u.name]));

  const workloadByMember: TeamWorkloadRow[] = workloadGroups
    .map((g) => ({
      userId: g.ownerUserId!,
      name: userNameById.get(g.ownerUserId!) ?? "Operador",
      activeLeads: g._count._all
    }))
    .sort((a, b) => b.activeLeads - a.activeLeads);

  const tasksByOwner = new Map<string | null, typeof openTasksRaw>();
  for (const t of openTasksRaw) {
    const oid = t.lead.ownerUserId;
    const list = tasksByOwner.get(oid) ?? [];
    list.push(t);
    tasksByOwner.set(oid, list);
  }

  const openTasksByOwner: TeamTaskGroup[] = [];

  const sortedKeys = [...tasksByOwner.keys()].sort((a, b) => {
    if (a === null) return 1;
    if (b === null) return -1;
    return (userNameById.get(a) ?? "").localeCompare(userNameById.get(b) ?? "");
  });

  for (const key of sortedKeys) {
    const list = tasksByOwner.get(key) ?? [];
    openTasksByOwner.push({
      userId: key,
      name: key ? userNameById.get(key) ?? "Operador" : "Sin asignar (lead)",
      tasks: list.map((t) => ({
        taskId: t.id,
        title: t.title,
        leadId: t.leadId,
        leadName: leadName(t.lead.contactName, t.lead.id),
        type: t.type
      }))
    });
  }

  /** Urgent merge: tasks (overdue / due hoy), follow-ups hoy, stale high-value */
  const urgent: TeamUrgentItem[] = [];
  const urgentLeadIds = new Set<string>();

  const now = Date.now();

  for (const t of openTasksRaw) {
    const due = t.dueAt;
    const overdue = due != null && due.getTime() < now;
    const dueToday =
      due != null && due.getTime() >= dayStart.getTime() && due.getTime() <= dayEnd.getTime();
    if (!overdue && !dueToday && due != null) continue;

    const l = t.lead;
    const silenceHours = hoursSince(l.lastActivityAt);
    const sk = overdue ? 0 : dueToday ? 1 : 4;
    urgent.push({
      kind: "task",
      id: t.id,
      leadId: l.id,
      fullName: leadName(l.contactName, l.id),
      zone: zoneOf(l.profile?.preferredZones ?? []),
      ownerLabel: l.owner?.name ?? null,
      headline: t.title,
      subline: overdue
        ? `Vencida${due ? ` · ${due.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}` : ""}`
        : due
          ? `Vence hoy · ${due.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}`
          : "Sin fecha · priorizar",
      sortKey: sk
    });
    urgentLeadIds.add(l.id);
  }

  for (const ev of followUpsToday) {
    const l = ev.lead;
    if (urgentLeadIds.has(l.id)) continue;
    urgent.push({
      kind: "followup",
      id: ev.id,
      leadId: l.id,
      fullName: leadName(l.contactName, l.id),
      zone: zoneOf(l.profile?.preferredZones ?? []),
      ownerLabel: l.owner?.name ?? null,
      headline: ev.title,
      subline: `Programado · ${ev.scheduledFor.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}`,
      sortKey: 2
    });
    urgentLeadIds.add(l.id);
  }

  for (const lead of atRiskCandidates) {
    if (urgentLeadIds.has(lead.id)) continue;
    const silenceHours = hoursSince(lead.lastActivityAt);
    if (lead.leadScore < 72 || silenceHours < 36) continue;
    urgent.push({
      kind: "stale",
      id: `stale-${lead.id}`,
      leadId: lead.id,
      fullName: leadName(lead.contactName, lead.id),
      zone: zoneOf(lead.profile?.preferredZones ?? []),
      ownerLabel: lead.owner?.name ?? null,
      headline: "Reactivar contacto",
      subline: `${silenceHours}h sin actividad · score ${lead.leadScore}`,
      sortKey: 3
    });
  }

  urgent.sort((a, b) => a.sortKey - b.sortKey || a.fullName.localeCompare(b.fullName));
  const urgentTotal = urgent.length;
  const urgentFollowUps = urgent.slice(0, 9);

  let insightHint: string | null = null;
  if (atRisk.length > 0) {
    insightHint = `${atRisk.length} oportunidad${atRisk.length === 1 ? "" : "es"} con score alto lleva${atRisk.length === 1 ? "" : "n"} más de 24h sin movimiento.`;
  } else if (unassignedHighValue.length > 0) {
    insightHint = `Hay ${unassignedHighValue.length} oportunidad${unassignedHighValue.length === 1 ? "" : "es"} de alto valor sin responsable asignado.`;
  } else if (visitsBookedToday.length > 0) {
    insightHint = `Hoy se registró ${visitsBookedToday.length === 1 ? "una visita" : `${visitsBookedToday.length} visitas`} pasando a etapa de visita agendada.`;
  }

  return {
    headline: {
      urgentCount: urgentTotal,
      visitsToday: visitsBookedToday.length,
      unassignedHighValue: unassignedHighValue.length,
      atRisk: atRisk.length,
      openTasks: openTasksRaw.length
    },
    urgentFollowUps,
    unassignedHighValue,
    atRisk,
    visitsBookedToday,
    workloadByMember,
    openTasksByOwner,
    insightHint
  };
});
