import { LeadStage } from "@prisma/client";
import { db } from "@/lib/server/db";
import { displayChannel } from "@/lib/i18n/present";

interface StageMetric {
  stage: LeadStage;
  count: number;
  conversionFromPrevious: number | null;
}

interface ChannelMetric {
  channel: string;
  leadCount: number;
  avgScore: number;
  qualifiedRate: number;
}

interface CampaignMetric {
  campaign: string;
  leadCount: number;
  avgScore: number;
  priorityMix: {
    p1: number;
    p2: number;
    p3: number;
  };
}

interface ZoneMetric {
  zone: string;
  requests: number;
}

interface RiskLead {
  leadId: string;
  name: string;
  score: number;
  stage: string;
  silenceHours: number;
  nextAction: string;
}

export interface ExecutiveAnalyticsModel {
  headline: {
    totalLeads: number;
    activePipeline: number;
    qualifiedRate: number;
    avgLeadScore: number;
    avgCloseProbability: number;
    staleHighIntentLeads: number;
  };
  funnel: StageMetric[];
  channels: ChannelMetric[];
  campaigns: CampaignMetric[];
  zones: ZoneMetric[];
  riskQueue: RiskLead[];
  insights: string[];
}

function round(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function hoursSince(date: Date | null) {
  if (!date) return 999;
  const diff = Date.now() - date.getTime();
  return Math.max(0, Math.round(diff / 1000 / 60 / 60));
}

function safeRate(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return round((numerator / denominator) * 100, 1);
}

function buildFunnel(stages: LeadStage[]): StageMetric[] {
  const ordered: LeadStage[] = [
    LeadStage.NEW,
    LeadStage.CONTACTED,
    LeadStage.QUALIFIED,
    LeadStage.VISIT_SCHEDULED,
    LeadStage.OFFER_NEGOTIATION,
    LeadStage.WON,
    LeadStage.LOST,
    LeadStage.NURTURE
  ];

  const counts = new Map<LeadStage, number>();
  for (const stage of ordered) counts.set(stage, 0);
  for (const stage of stages) counts.set(stage, (counts.get(stage) ?? 0) + 1);

  return ordered.map((stage, index) => {
    const count = counts.get(stage) ?? 0;
    if (index === 0) return { stage, count, conversionFromPrevious: null };
    const previousCount = counts.get(ordered[index - 1]) ?? 0;
    return {
      stage,
      count,
      conversionFromPrevious: safeRate(count, previousCount)
    };
  });
}

export async function getExecutiveAnalytics(agencyId: string): Promise<ExecutiveAnalyticsModel> {
  const leads = await db.lead.findMany({
    where: { agencyId },
    include: {
      profile: true,
      aiRuns: {
        take: 1,
        orderBy: { createdAt: "desc" }
      }
    }
  });

  const totalLeads = leads.length;
  const closedStages = new Set<LeadStage>([LeadStage.WON, LeadStage.LOST]);
  const qualifiedStages = new Set<LeadStage>([
    LeadStage.QUALIFIED,
    LeadStage.VISIT_SCHEDULED,
    LeadStage.OFFER_NEGOTIATION,
    LeadStage.WON
  ]);

  const activePipeline = leads.filter((lead) => !closedStages.has(lead.stage)).length;
  const qualifiedCount = leads.filter((lead) =>
    qualifiedStages.has(lead.stage)
  ).length;

  const avgLeadScore = totalLeads ? round(leads.reduce((sum, lead) => sum + lead.leadScore, 0) / totalLeads, 1) : 0;
  const avgCloseProbability = totalLeads
    ? round(leads.reduce((sum, lead) => sum + lead.closeProbability, 0) / totalLeads, 1)
    : 0;

  const staleHighIntentLeads = leads.filter((lead) => lead.leadScore >= 72 && hoursSince(lead.lastActivityAt) >= 24).length;

  const channelMap = new Map<string, { count: number; scoreTotal: number; qualified: number }>();
  const campaignMap = new Map<
    string,
    { count: number; scoreTotal: number; p1: number; p2: number; p3: number }
  >();
  const zoneMap = new Map<string, number>();

  for (const lead of leads) {
    const channelKey = lead.sourceChannel;
    const channel = channelMap.get(channelKey) ?? { count: 0, scoreTotal: 0, qualified: 0 };
    channel.count += 1;
    channel.scoreTotal += lead.leadScore;
    if (qualifiedStages.has(lead.stage)) {
      channel.qualified += 1;
    }
    channelMap.set(channelKey, channel);

    const campaignKey = lead.sourceCampaign ?? "Sin atribuir";
    const campaign = campaignMap.get(campaignKey) ?? { count: 0, scoreTotal: 0, p1: 0, p2: 0, p3: 0 };
    campaign.count += 1;
    campaign.scoreTotal += lead.leadScore;
    if (lead.priority === "P1") campaign.p1 += 1;
    if (lead.priority === "P2") campaign.p2 += 1;
    if (lead.priority === "P3") campaign.p3 += 1;
    campaignMap.set(campaignKey, campaign);

    for (const zone of lead.profile?.preferredZones ?? []) {
      zoneMap.set(zone, (zoneMap.get(zone) ?? 0) + 1);
    }
  }

  const channels: ChannelMetric[] = Array.from(channelMap.entries())
    .map(([channel, stats]) => ({
      channel,
      leadCount: stats.count,
      avgScore: round(stats.scoreTotal / stats.count, 1),
      qualifiedRate: safeRate(stats.qualified, stats.count)
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  const campaigns: CampaignMetric[] = Array.from(campaignMap.entries())
    .map(([campaign, stats]) => ({
      campaign,
      leadCount: stats.count,
      avgScore: round(stats.scoreTotal / stats.count, 1),
      priorityMix: {
        p1: stats.p1,
        p2: stats.p2,
        p3: stats.p3
      }
    }))
    .sort((a, b) => b.leadCount - a.leadCount)
    .slice(0, 6);

  const zones: ZoneMetric[] = Array.from(zoneMap.entries())
    .map(([zone, requests]) => ({ zone, requests }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 8);

  const riskQueue: RiskLead[] = leads
    .map((lead) => {
      const latestAiRun = lead.aiRuns[0]?.outputJson as { assessment?: { recommendedNextAction?: { title?: string } } } | undefined;
      return {
        leadId: lead.id,
        name: lead.contactName ?? `Contacto ${lead.id.slice(0, 8)}`,
        score: lead.leadScore,
        stage: lead.stage,
        silenceHours: hoursSince(lead.lastActivityAt),
        nextAction: latestAiRun?.assessment?.recommendedNextAction?.title ?? "Revisar lead"
      };
    })
    .filter((lead) => lead.score >= 70 && lead.silenceHours >= 18)
    .sort((a, b) => b.silenceHours - a.silenceHours)
    .slice(0, 6);

  const topChannel = channels[0];
  const weakestChannel = channels[channels.length - 1];

  const insights: string[] = [];
  if (topChannel) {
    insights.push(
      `${displayChannel(topChannel.channel)} es hoy tu canal con mejor calidad (score promedio ${topChannel.avgScore}).`
    );
  }
  if (weakestChannel && channels.length > 1) {
    insights.push(
      `Alerta de brecha: ${displayChannel(weakestChannel.channel)} va detrás de los mejores canales en tasa de calificación.`
    );
  }
  if (staleHighIntentLeads > 0) {
    insights.push(
      `${staleHighIntentLeads} leads de alta intención están en riesgo por demora en la respuesta.`
    );
  }
  if (zones[0]) {
    insights.push(`${zones[0].zone} es la zona más solicitada en la demanda activa.`);
  }

  return {
    headline: {
      totalLeads,
      activePipeline,
      qualifiedRate: safeRate(qualifiedCount, totalLeads),
      avgLeadScore,
      avgCloseProbability,
      staleHighIntentLeads
    },
    funnel: buildFunnel(leads.map((lead) => lead.stage)),
    channels,
    campaigns,
    zones,
    riskQueue,
    insights
  };
}
