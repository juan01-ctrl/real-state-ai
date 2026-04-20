import { cache } from "react";
import { ChannelType, LeadStage, MessageDirection } from "@prisma/client";
import { db } from "@/lib/server/db";
import { displayChannel } from "@/lib/i18n/present";

/** Umbrales explícitos — documentados en la UI */
export const HIGH_INTENT_SCORE_MIN = 70;
export const HIGH_INTENT_CLOSE_MIN = 70;
export const STALE_HOURS = 48;
export const STALE_MIN_SCORE = 55;

export interface LostHighIntentRow {
  leadId: string;
  name: string;
  leadScore: number;
  closeProbability: number;
  sourceChannel: ChannelType;
}

export interface LossReasonBucket {
  reason: string;
  count: number;
  sharePercent: number;
}

export interface SourcePerformanceRow {
  channel: ChannelType;
  label: string;
  leadCount: number;
  qualifiedCount: number;
  qualifiedRate: number;
  avgScore: number;
}

export interface StageConversionRow {
  stage: LeadStage;
  count: number;
  conversionFromPrevious: number | null;
}

export interface WaitingLeadRow {
  leadId: string;
  name: string;
  leadScore: number;
  silenceHours: number;
  sourceChannel: ChannelType;
}

export interface StrategicInsightsModel {
  /** Momento en que se calculó el modelo (ISO). */
  generatedAt: string;
  lostHighIntent: {
    count: number;
    sample: LostHighIntentRow[];
  };
  responseDelay: {
    averageMinutes: number | null;
    sampleSize: number;
    /** Texto técnico para transparencia */
    methodNote: string;
  };
  waitingTooLong: {
    count: number;
    sample: WaitingLeadRow[];
    definitionNote: string;
  };
  lossReasons: {
    buckets: LossReasonBucket[];
    totalWithHistory: number;
    methodNote: string;
  };
  sourcePerformance: SourcePerformanceRow[];
  stageConversion: StageConversionRow[];
  methodology: string[];
}

function hoursSince(date: Date | null): number {
  if (!date) return 999;
  return Math.max(0, Math.round((Date.now() - date.getTime()) / 1000 / 60 / 60));
}

function leadName(contactName: string | null, id: string) {
  return contactName?.trim() || `Contacto ${id.slice(0, 8)}`;
}

const QUALIFIED_STAGES = new Set<LeadStage>([
  LeadStage.QUALIFIED,
  LeadStage.VISIT_SCHEDULED,
  LeadStage.OFFER_NEGOTIATION,
  LeadStage.WON
]);

const FUNNEL_ORDER: LeadStage[] = [
  LeadStage.NEW,
  LeadStage.CONTACTED,
  LeadStage.QUALIFIED,
  LeadStage.VISIT_SCHEDULED,
  LeadStage.OFFER_NEGOTIATION,
  LeadStage.WON,
  LeadStage.LOST,
  LeadStage.NURTURE
];

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/**
 * Demora media entre primer mensaje entrante de un turno y la primera respuesta saliente posterior.
 * Solo conversaciones con al menos un par válido.
 */
function computeInboundToOutboundDelayMinutes(
  messages: { conversationId: string; sentAt: Date; direction: MessageDirection }[]
): { averageMinutes: number | null; sampleSize: number } {
  const byConv = new Map<string, typeof messages>();
  for (const m of messages) {
    const list = byConv.get(m.conversationId) ?? [];
    list.push(m);
    byConv.set(m.conversationId, list);
  }

  const delaysMinutes: number[] = [];

  for (const [, msgs] of byConv) {
    msgs.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
    let pendingInbound: Date | null = null;
    for (const m of msgs) {
      if (m.direction === MessageDirection.INBOUND) {
        pendingInbound = m.sentAt;
      } else if (m.direction === MessageDirection.OUTBOUND && pendingInbound) {
        const diffMin = (m.sentAt.getTime() - pendingInbound.getTime()) / 60000;
        if (diffMin >= 0 && diffMin <= 7 * 24 * 60) {
          delaysMinutes.push(diffMin);
        }
        pendingInbound = null;
      }
    }
  }

  if (!delaysMinutes.length) {
    return { averageMinutes: null, sampleSize: 0 };
  }

  const avg = delaysMinutes.reduce((a, b) => a + b, 0) / delaysMinutes.length;
  return { averageMinutes: avg, sampleSize: delaysMinutes.length };
}

export const getStrategicInsightsModel = cache(async (agencyId: string): Promise<StrategicInsightsModel> => {
  const staleWhere = {
    agencyId,
    stage: { notIn: [LeadStage.WON, LeadStage.LOST] },
    leadScore: { gte: STALE_MIN_SCORE },
    OR: [
      { lastActivityAt: { lt: new Date(Date.now() - STALE_HOURS * 60 * 60 * 1000) } },
      { lastActivityAt: null }
    ]
  };

  const [lostLeads, lostSamples, waitingCount, staleLeads, messagesForDelay, lossHistoryRows, allLeadsForFunnelAndSources] =
    await Promise.all([
      db.lead.count({
        where: {
          agencyId,
          stage: LeadStage.LOST,
          OR: [{ leadScore: { gte: HIGH_INTENT_SCORE_MIN } }, { closeProbability: { gte: HIGH_INTENT_CLOSE_MIN } }]
        }
      }),
      db.lead.findMany({
        where: {
          agencyId,
          stage: LeadStage.LOST,
          OR: [{ leadScore: { gte: HIGH_INTENT_SCORE_MIN } }, { closeProbability: { gte: HIGH_INTENT_CLOSE_MIN } }]
        },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: {
          id: true,
          contactName: true,
          leadScore: true,
          closeProbability: true,
          sourceChannel: true
        }
      }),
      db.lead.count({ where: staleWhere }),
      db.lead.findMany({
        where: staleWhere,
        orderBy: { lastActivityAt: "asc" },
        take: 40,
        select: {
          id: true,
          contactName: true,
          leadScore: true,
          lastActivityAt: true,
          sourceChannel: true
        }
      }),
      db.message.findMany({
        where: { agencyId },
        select: {
          conversationId: true,
          sentAt: true,
          direction: true
        },
        orderBy: { sentAt: "asc" },
        take: 15000
      }),
      db.leadStageHistory.findMany({
        where: {
          toStage: LeadStage.LOST,
          lead: { agencyId }
        },
        select: { reason: true }
      }),
      db.lead.findMany({
        where: { agencyId },
        select: { stage: true, sourceChannel: true, leadScore: true }
      })
    ]);

  const delayStats = computeInboundToOutboundDelayMinutes(messagesForDelay);

  const reasonCounts = new Map<string, number>();
  for (const row of lossHistoryRows) {
    const key = row.reason?.trim() || "Sin motivo registrado en historial";
    reasonCounts.set(key, (reasonCounts.get(key) ?? 0) + 1);
  }
  const totalLossEvents = lossHistoryRows.length;
  const buckets: LossReasonBucket[] = [...reasonCounts.entries()]
    .map(([reason, count]) => ({
      reason,
      count,
      sharePercent: totalLossEvents ? round1((count / totalLossEvents) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const channelMap = new Map<
    ChannelType,
    { count: number; scoreSum: number; qualified: number }
  >();
  for (const lead of allLeadsForFunnelAndSources) {
    const ch = lead.sourceChannel;
    const cur = channelMap.get(ch) ?? { count: 0, scoreSum: 0, qualified: 0 };
    cur.count += 1;
    cur.scoreSum += lead.leadScore;
    if (QUALIFIED_STAGES.has(lead.stage)) cur.qualified += 1;
    channelMap.set(ch, cur);
  }

  const sourcePerformance: SourcePerformanceRow[] = (Object.values(ChannelType) as ChannelType[])
    .map((channel) => {
      const stats = channelMap.get(channel);
      if (!stats || stats.count === 0) return null;
      return {
        channel,
        label: displayChannel(channel),
        leadCount: stats.count,
        qualifiedCount: stats.qualified,
        qualifiedRate: round1((stats.qualified / stats.count) * 100),
        avgScore: round1(stats.scoreSum / stats.count)
      };
    })
    .filter((r): r is SourcePerformanceRow => r !== null)
    .sort((a, b) => b.avgScore - a.avgScore);

  const stageCounts = new Map<LeadStage, number>();
  for (const s of FUNNEL_ORDER) stageCounts.set(s, 0);
  for (const lead of allLeadsForFunnelAndSources) {
    stageCounts.set(lead.stage, (stageCounts.get(lead.stage) ?? 0) + 1);
  }

  const stageConversion: StageConversionRow[] = FUNNEL_ORDER.map((stage, index) => {
    const count = stageCounts.get(stage) ?? 0;
    if (index === 0) return { stage, count, conversionFromPrevious: null };
    const prev = FUNNEL_ORDER[index - 1];
    const prevCount = stageCounts.get(prev) ?? 0;
    const conv = prevCount > 0 ? round1((count / prevCount) * 100) : null;
    return { stage, count, conversionFromPrevious: conv };
  });

  const waitingRows: WaitingLeadRow[] = staleLeads.slice(0, 8).map((l) => ({
    leadId: l.id,
    name: leadName(l.contactName, l.id),
    leadScore: l.leadScore,
    silenceHours: hoursSince(l.lastActivityAt),
    sourceChannel: l.sourceChannel
  }));

  const methodology: string[] = [
    `Alta intención perdida: etapa LOST y (score ≥ ${HIGH_INTENT_SCORE_MIN} o probabilidad ≥ ${HIGH_INTENT_CLOSE_MIN}%).`,
    `Demora de respuesta: promedio de minutos entre mensaje INBOUND y el siguiente OUTBOUND por conversación (muestra de hasta 15.000 mensajes).`,
    `Espera prolongada: pipeline activo, score ≥ ${STALE_MIN_SCORE} y sin actividad ≥ ${STALE_HOURS}h (según lastActivityAt).`,
    `Motivos de pérdida: agrupación de textos en LeadStageHistory al pasar a LOST (puede haber "Sin motivo" si no se cargó razón).`,
    `Fuentes: tasas de calificación = leads en etapas calificadas+ / total por canal (mismo criterio que el tablero).`,
    `Conversión entre etapas: conteo actual por etapa; % = etapa / etapa anterior en el orden del embudo (interpretación: snapshot, no cohorte temporal).`
  ];

  return {
    generatedAt: new Date().toISOString(),
    lostHighIntent: {
      count: lostLeads,
      sample: lostSamples.map((l) => ({
        leadId: l.id,
        name: leadName(l.contactName, l.id),
        leadScore: l.leadScore,
        closeProbability: l.closeProbability,
        sourceChannel: l.sourceChannel
      }))
    },
    responseDelay: {
      averageMinutes: delayStats.averageMinutes != null ? round1(delayStats.averageMinutes) : null,
      sampleSize: delayStats.sampleSize,
      methodNote:
        delayStats.sampleSize > 0
          ? `Basado en ${delayStats.sampleSize} respuesta${delayStats.sampleSize === 1 ? "" : "s"} (pares entrante → saliente).`
          : "No hay suficientes mensajes entrantes con respuesta saliente posterior para estimar."
    },
    waitingTooLong: {
      count: waitingCount,
      sample: waitingRows,
      definitionNote: `Activos (no ganados/perdidos), score ≥ ${STALE_MIN_SCORE}, sin actividad registrada hace ≥ ${STALE_HOURS} h.`
    },
    lossReasons: {
      buckets,
      totalWithHistory: totalLossEvents,
      methodNote:
        totalLossEvents > 0
          ? `${totalLossEvents} transición${totalLossEvents === 1 ? "" : "es"} a LOST con texto de razón en historial.`
          : "Todavía no hay historial de etapas a LOST con razón cargada."
    },
    sourcePerformance,
    stageConversion,
    methodology
  };
});
