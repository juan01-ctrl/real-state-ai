import { cache } from "react";
import { AiRunType, LeadStage } from "@prisma/client";
import { db } from "@/lib/server/db";
import { displayUrgency } from "@/lib/i18n/present";
import { parseNextAction } from "@/lib/server/read-models/leads";
import {
  getStrategicInsightsModel,
  HIGH_INTENT_CLOSE_MIN,
  HIGH_INTENT_SCORE_MIN
} from "@/lib/server/read-models/strategic-insights";

const ACTIVE_PIPELINE: LeadStage[] = [
  LeadStage.NEW,
  LeadStage.CONTACTED,
  LeadStage.QUALIFIED,
  LeadStage.VISIT_SCHEDULED,
  LeadStage.OFFER_NEGOTIATION,
  LeadStage.NURTURE
];

function leadDisplayName(contactName: string | null, id: string) {
  return contactName?.trim() || `Contacto ${id.slice(0, 8)}`;
}

function formatRelativeShort(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} día${days === 1 ? "" : "s"}`;
}

function toneFromSilence(hours: number | null): "low" | "mid" | "high" {
  if (hours == null) return "mid";
  if (hours >= 48) return "high";
  if (hours >= 24) return "mid";
  return "low";
}

function formatResponseDelayLine(averageMinutes: number | null, sampleSize: number): string {
  if (averageMinutes == null || sampleSize === 0) {
    return "Todavía no hay muestra suficiente de mensajes para estimar la demora típica.";
  }
  if (averageMinutes < 60) {
    return `Demora media aproximada: ${Math.round(averageMinutes)} min (según ${sampleSize} respuesta${sampleSize === 1 ? "" : "s"}).`;
  }
  const h = averageMinutes / 60;
  const rounded = Math.round(h * 10) / 10;
  return `Demora media aproximada: ${rounded} h (según ${sampleSize} respuesta${sampleSize === 1 ? "" : "s"}).`;
}

function analyticsEventLabel(type: string, leadName: string | null): string {
  if (!leadName) {
    const map: Record<string, string> = {
      "qualification.updated": "Calificación actualizada",
      "match.generated": "Recomendaciones generadas",
      "followup.plan.generated": "Plan de seguimiento generado"
    };
    return map[type] ?? type;
  }
  const map: Record<string, string> = {
    "qualification.updated": `Calificación actualizada: ${leadName}`,
    "match.generated": `Recomendaciones de propiedades: ${leadName}`,
    "followup.plan.generated": `Plan de seguimiento: ${leadName}`
  };
  return map[type] ?? `${type}: ${leadName}`;
}

export interface DashboardPriorityLead {
  id: string;
  name: string;
  urgency: string;
  score: string;
  action: string;
  tone: "low" | "mid" | "high";
}

export interface DashboardActivityItem {
  text: string;
  time: string;
  active?: boolean;
}

export interface DashboardKpi {
  label: string;
  value: string;
  highlighted?: boolean;
}

export interface DashboardLossColumn {
  title: string;
  barWidthPercent: number;
  body: string;
  variant: "accent" | "neutral";
}

export interface DashboardBriefing {
  headline: string;
  subline: string;
  highIntentCount: number;
}

export interface DashboardModel {
  /** Momento de generación del tablero (ISO). */
  dataAsOf: string;
  briefing: DashboardBriefing;
  priorityLeads: DashboardPriorityLead[];
  lossHeadline: string;
  lossColumns: DashboardLossColumn[];
  activity: DashboardActivityItem[];
  kpis: DashboardKpi[];
}

export const getDashboardModel = cache(async (agencyId: string): Promise<DashboardModel> => {
  const [insights, highIntentCount, priorityRaw, pipelineStats, events] = await Promise.all([
    getStrategicInsightsModel(agencyId),
    db.lead.count({
      where: {
        agencyId,
        stage: { in: ACTIVE_PIPELINE },
        OR: [{ leadScore: { gte: HIGH_INTENT_SCORE_MIN } }, { closeProbability: { gte: HIGH_INTENT_CLOSE_MIN } }]
      }
    }),
    db.lead.findMany({
      where: {
        agencyId,
        stage: { in: ACTIVE_PIPELINE }
      },
      orderBy: [{ leadScore: "desc" }, { closeProbability: "desc" }, { lastActivityAt: "desc" }],
      take: 3,
      include: {
        profile: true,
        aiRuns: {
          where: { type: AiRunType.SCORE_LEAD },
          take: 1,
          orderBy: { createdAt: "desc" }
        }
      }
    }),
    db.lead.groupBy({
      by: ["stage"],
      where: { agencyId, stage: { in: ACTIVE_PIPELINE } },
      _count: { _all: true },
      _avg: { closeProbability: true, leadScore: true }
    }),
    db.analyticsEvent.findMany({
      where: { agencyId },
      orderBy: { occurredAt: "desc" },
      take: 8,
      include: {
        lead: { select: { contactName: true } }
      }
    })
  ]);

  const activeTotal = pipelineStats.reduce((s, g) => s + g._count._all, 0);
  const qualifiedPlusStages = new Set<LeadStage>([
    LeadStage.QUALIFIED,
    LeadStage.VISIT_SCHEDULED,
    LeadStage.OFFER_NEGOTIATION
  ]);
  const qualifiedPlus = pipelineStats
    .filter((g) => qualifiedPlusStages.has(g.stage))
    .reduce((s, g) => s + g._count._all, 0);

  const visitCount =
    pipelineStats.find((g) => g.stage === LeadStage.VISIT_SCHEDULED)?._count._all ?? 0;

  let sumClose = 0;
  let n = 0;
  for (const g of pipelineStats) {
    const c = g._count._all;
    n += c;
    sumClose += (g._avg.closeProbability ?? 0) * c;
  }
  const avgClose = n ? Math.round(sumClose / n) : 0;
  const qualifiedRate = activeTotal ? Math.round((qualifiedPlus / activeTotal) * 100) : 0;

  const briefingHeadline =
    highIntentCount === 0
      ? "No hay leads de alta intención pendientes de revisión ahora."
      : highIntentCount === 1
        ? "1 comprador de alta intención necesita atención hoy."
        : `${highIntentCount} compradores de alta intención necesitan atención hoy.`;

  const zones = new Set<string>();
  for (const l of priorityRaw) {
    const z = l.profile?.preferredZones?.[0];
    if (z) zones.add(z);
  }
  const zoneHint =
    zones.size > 0
      ? `Zonas frecuentes en prioridades: ${[...zones].slice(0, 3).join(", ")}.`
      : "Revisá la lista prioritaria para ver el próximo paso sugerido por lead.";

  const briefing: DashboardBriefing = {
    headline: briefingHeadline,
    subline: `${zoneHint} Alta intención = score ≥ ${HIGH_INTENT_SCORE_MIN} o probabilidad de cierre ≥ ${HIGH_INTENT_CLOSE_MIN}%.`,
    highIntentCount
  };

  const priorityLeads: DashboardPriorityLead[] = priorityRaw.map((lead) => {
    const silenceHours = lead.lastActivityAt
      ? Math.max(0, Math.round((Date.now() - lead.lastActivityAt.getTime()) / 3600000))
      : null;
    const urgencyLabel =
      lead.profile?.urgency != null
        ? `Urgencia ${displayUrgency(lead.profile.urgency)}`
        : "Urgencia sin datos";
    const next = parseNextAction(lead.aiRuns[0]?.outputJson);
    return {
      id: lead.id,
      name: leadDisplayName(lead.contactName, lead.id),
      urgency: urgencyLabel,
      score: `${lead.leadScore}%`,
      action: next?.title ? next.title : "Abrir ficha para ver la próxima acción sugerida.",
      tone: toneFromSilence(silenceHours)
    };
  });

  const lost = insights.lostHighIntent.count;
  const lossHeadline =
    lost === 0
      ? "No hay contactos de alta intención en etapa perdida por ahora."
      : `${lost} contacto${lost === 1 ? "" : "s"} de alta intención figuran como perdido${lost === 1 ? "" : "s"}.`;

  const buckets = insights.lossReasons.buckets;
  const lossColumns: DashboardLossColumn[] = [];

  if (buckets[0]) {
    lossColumns.push({
      title: buckets[0].reason.length > 42 ? `${buckets[0].reason.slice(0, 40)}…` : buckets[0].reason,
      barWidthPercent: Math.min(100, buckets[0].sharePercent || 50),
      body: `${buckets[0].count} en historial de etapas (${buckets[0].sharePercent}% del total con motivo cargado).`,
      variant: "accent"
    });
  } else {
    lossColumns.push({
      title: "Demora de respuesta",
      barWidthPercent: insights.responseDelay.averageMinutes != null ? 75 : 15,
      body: formatResponseDelayLine(insights.responseDelay.averageMinutes, insights.responseDelay.sampleSize),
      variant: "accent"
    });
  }

  if (buckets[1]) {
    lossColumns.push({
      title: buckets[1].reason.length > 42 ? `${buckets[1].reason.slice(0, 40)}…` : buckets[1].reason,
      barWidthPercent: Math.min(100, buckets[1].sharePercent || 30),
      body: `${buckets[1].count} caso${buckets[1].count === 1 ? "" : "s"} (${buckets[1].sharePercent}% del total con motivo cargado).`,
      variant: "neutral"
    });
  } else {
    lossColumns.push({
      title: "Espera prolongada (pipeline)",
      barWidthPercent: Math.min(100, insights.waitingTooLong.count * 10 + 20),
      body: `${insights.waitingTooLong.count} lead${insights.waitingTooLong.count === 1 ? "" : "s"} activo${insights.waitingTooLong.count === 1 ? "" : "s"} sin actividad reciente según la regla del tablero analítico.`,
      variant: "neutral"
    });
  }

  lossColumns.push({
    title: "Alta intención perdida",
    barWidthPercent: Math.min(100, lost * 15 + 10),
    body:
      lost === 0
        ? "No hay pérdidas recientes con score o probabilidad altos."
        : `Total acumulado en etapa perdida con criterio de alta intención: ${lost}.`,
    variant: "neutral"
  });

  const activity: DashboardActivityItem[] = events.map((ev, i) => ({
    text: analyticsEventLabel(
      ev.type,
      ev.lead ? leadDisplayName(ev.lead.contactName, ev.leadId ?? ev.id) : null
    ),
    time: formatRelativeShort(ev.occurredAt),
    active: i < 2
  }));

  const kpis: DashboardKpi[] = [
    { label: "Pipeline activo", value: activeTotal ? String(activeTotal) : "0" },
    { label: "Prob. cierre media", value: `${avgClose}%` },
    { label: "Visitas agendadas", value: String(visitCount) },
    {
      label: "Calificados+ / activos",
      value: activeTotal ? `${qualifiedRate}%` : "—",
      highlighted: true
    }
  ];

  return {
    dataAsOf: new Date().toISOString(),
    briefing,
    priorityLeads,
    lossHeadline,
    lossColumns: lossColumns.slice(0, 3),
    activity: activity.length ? activity : [{ text: "Todavía no hay eventos recientes.", time: "—", active: false }],
    kpis
  };
});
