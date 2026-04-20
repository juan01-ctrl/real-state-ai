import { cache } from "react";
import { AiRunType, LeadStage } from "@prisma/client";
import { db } from "@/lib/server/db";
import { displayLeadStage } from "@/lib/i18n/present";
import { formatBuyingIntentSummaryEs } from "@/lib/i18n/legacy-copy-es";
import { parseNextAction } from "@/lib/server/read-models/leads";
import { getStrategicInsightsModel } from "@/lib/server/read-models/strategic-insights";

function leadName(contactName: string | null, id: string) {
  return contactName?.trim() || `Contacto ${id.slice(0, 8)}`;
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency.length === 3 ? currency : "USD",
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("es-AR")}`;
  }
}

function iconForPropertyType(raw: string): string {
  const t = raw.toLowerCase();
  if (t.includes("depart") || t.includes("pent")) return "apartment";
  if (t.includes("casa") || t.includes("villa")) return "villa";
  if (t.includes("terreno") || t.includes("lote")) return "landscape";
  return "real_estate_agent";
}

export interface OpportunityCardModel {
  id: string;
  name: string;
  closeProbability: number;
  interest: string;
  stage: string;
  aiContext: string;
  value: string;
  actionLabel: string;
  icon: string;
}

export interface PipelineStageModel {
  label: string;
  value: number;
  active?: boolean;
}

export interface OpportunitiesAttentionBlock {
  leadId: string;
  title: string;
  variant: "risk" | "primary";
  name: string;
  detail: string;
  footerLabel: string;
  footerValue: string;
}

export interface OpportunitiesModel {
  headline: string;
  opportunities: OpportunityCardModel[];
  pipeline: PipelineStageModel[];
  attention: OpportunitiesAttentionBlock | null;
  bestNext: { leadId: string; name: string; detail: string } | null;
  pipelineBudgetLabel: string;
  pipelineBudgetValue: string;
}

const LATE_STAGES: LeadStage[] = [LeadStage.VISIT_SCHEDULED, LeadStage.OFFER_NEGOTIATION];

export const getOpportunitiesModel = cache(async (agencyId: string): Promise<OpportunitiesModel> => {
  const [lateLeads, counts, insights] = await Promise.all([
    db.lead.findMany({
      where: { agencyId, stage: { in: LATE_STAGES } },
      orderBy: [{ closeProbability: "desc" }, { leadScore: "desc" }],
      take: 25,
      include: {
        profile: true,
        recommendations: {
          orderBy: { rank: "asc" },
          take: 1,
          include: { property: true }
        },
        aiRuns: {
          where: { type: AiRunType.SCORE_LEAD },
          take: 1,
          orderBy: { createdAt: "desc" }
        }
      }
    }),
    db.lead.groupBy({
      by: ["stage"],
      where: { agencyId },
      _count: { _all: true }
    }),
    getStrategicInsightsModel(agencyId)
  ]);

  const countMap = new Map<LeadStage, number>();
  for (const c of counts) {
    countMap.set(c.stage, c._count._all);
  }

  const pipeline: PipelineStageModel[] = [
    {
      label: "Lead nuevo",
      value: (countMap.get(LeadStage.NEW) ?? 0) + (countMap.get(LeadStage.CONTACTED) ?? 0)
    },
    { label: "Calificado", value: countMap.get(LeadStage.QUALIFIED) ?? 0 },
    { label: "Visita agendada", value: countMap.get(LeadStage.VISIT_SCHEDULED) ?? 0 },
    { label: "Negociando", value: countMap.get(LeadStage.OFFER_NEGOTIATION) ?? 0 },
    { label: "Cierre próximo", value: countMap.get(LeadStage.WON) ?? 0 }
  ];

  const preferActive = ["Visita agendada", "Negociando", "Calificado", "Lead nuevo", "Cierre próximo"] as const;
  for (const label of preferActive) {
    const idx = pipeline.findIndex((p) => p.label === label && p.value > 0);
    if (idx >= 0) {
      pipeline[idx] = { ...pipeline[idx], active: true };
      break;
    }
  }

  const opportunities: OpportunityCardModel[] = lateLeads.map((lead) => {
    const topRec = lead.recommendations[0];
    const prop = topRec?.property;
    const interest = prop?.title ?? (lead.profile?.preferredZones?.[0] ? `Zona: ${lead.profile.preferredZones[0]}` : "Sin propiedad top asignada");
    const budgetMax = lead.profile?.budgetMax;
    const currency = lead.profile?.budgetCurrency ?? prop?.currency ?? "USD";
    const value =
      budgetMax != null ? formatMoney(budgetMax, currency) : prop ? formatMoney(prop.price, prop.currency) : "—";
    const summary = lead.profile
      ? formatBuyingIntentSummaryEs(
          lead.profile.budgetMin,
          lead.profile.budgetMax,
          lead.profile.budgetCurrency,
          lead.profile.preferredZones ?? [],
          lead.profile.timelineMonths,
          lead.leadScore
        )
      : "Sin perfil de comprador cargado.";
    const next = parseNextAction(lead.aiRuns[0]?.outputJson);
    return {
      id: lead.id,
      name: leadName(lead.contactName, lead.id),
      closeProbability: lead.closeProbability,
      interest,
      stage: displayLeadStage(lead.stage),
      aiContext: summary,
      value,
      actionLabel: next?.title ? `Ir a ficha · ${next.title}` : "Abrir ficha del lead",
      icon: prop ? iconForPropertyType(prop.propertyType) : "real_estate_agent"
    };
  });

  const headline =
    opportunities.length === 0
      ? "No hay oportunidades en visita o negociación todavía."
      : opportunities.length === 1
        ? "1 oportunidad en etapa avanzada prioritaria."
        : `${opportunities.length} oportunidades en etapa avanzada (visita o negociación).`;

  const waiting = insights.waitingTooLong.sample[0];
  const attention: OpportunitiesAttentionBlock | null = waiting
    ? {
        leadId: waiting.leadId,
        title: "Necesita atención ahora",
        variant: "risk",
        name: waiting.name,
        detail: `${waiting.name} acumula ${waiting.silenceHours} h sin actividad registrada; conviene un contacto.`,
        footerLabel: "Score",
        footerValue: `${waiting.leadScore}%`
      }
    : null;

  const best = lateLeads[0];
  const bestNextAction = best ? parseNextAction(best.aiRuns[0]?.outputJson) : null;
  const bestNext = best
    ? {
        leadId: best.id,
        name: leadName(best.contactName, best.id),
        detail: bestNextAction?.detail
          ? bestNextAction.detail
          : "Revisá tareas y mensajes en la ficha del lead."
      }
    : null;

  let sumBudget = 0;
  let nBudget = 0;
  let cur = "USD";
  for (const lead of lateLeads) {
    const max = lead.profile?.budgetMax;
    if (max != null) {
      sumBudget += max;
      nBudget += 1;
      if (lead.profile?.budgetCurrency) cur = lead.profile.budgetCurrency;
    }
  }
  const pipelineBudgetLabel = "Presupuesto declarado (etapa avanzada)";
  const pipelineBudgetValue =
    nBudget > 0 ? formatMoney(Math.round(sumBudget / nBudget), cur) + " promedio" : "Sin presupuesto cargado";

  return {
    headline,
    opportunities,
    pipeline,
    attention,
    bestNext,
    pipelineBudgetLabel,
    pipelineBudgetValue
  };
});
