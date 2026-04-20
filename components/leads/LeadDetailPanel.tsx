import { LeadOperationsPanel } from "@/components/leads/LeadOperationsPanel";
import { MetaOutboundComposer } from "@/components/leads/MetaOutboundComposer";
import { formatRelativeHours } from "@/lib/formatters";
import type { AgencyOperator } from "@/lib/server/read-models/operators";
import type { LeadDetailModel } from "@/lib/server/read-models/leads";

interface LeadDetailPanelProps {
  operators: AgencyOperator[];
  lead: LeadDetailModel | null;
}

function aiJudgment(lead: LeadDetailModel) {
  if (lead.score >= 85) {
    return "Este lead muestra señales de alta intención y una ventana de cierre cercana si el equipo ejecuta con precisión.";
  }

  if (lead.score >= 70) {
    return "Existe interés real, pero la oportunidad depende de priorizar el siguiente movimiento en el momento correcto.";
  }

  return "La intención todavía es media o baja. Conviene nutrir sin desviar foco del equipo comercial.";
}

function whyThisLeadMatters(lead: LeadDetailModel) {
  const why = lead.nextAction?.why?.slice(0, 3) ?? [];
  if (why.length) return why;

  if ((lead.silenceHours ?? 0) >= 24) {
    return [
      "Hay señales de enfriamiento por tiempo sin respuesta.",
      "Una acción precisa puede recuperar la conversación con intención real.",
      "Si se demora más, sube el riesgo de fuga hacia otra agencia."
    ];
  }

  return [
    "El perfil de intención supera al promedio de la bandeja.",
    "Existe una próxima acción concreta para acercar el cierre.",
    "La oportunidad requiere foco comercial en este momento."
  ];
}

function getPersonaSubtitle(lead: LeadDetailModel) {
  const role = lead.ownerName ?? "Lead priorizado";
  const profileType = lead.profile?.propertyType ? `• ${lead.profile.propertyType}` : "";
  return `${role} ${profileType}`.trim();
}

function getPrimaryAction(lead: LeadDetailModel) {
  if (lead.nextAction?.title) return lead.nextAction.title;
  if ((lead.silenceHours ?? 0) >= 24) return "Reactivar conversación con propuesta concreta";
  return "Definir próximo paso comercial";
}

function getHeroKpi(lead: LeadDetailModel) {
  const views = lead.conversation.length;
  const visits = lead.followUpEvents.filter((event) => event.status === "COMPLETED").length;
  return {
    views,
    visits
  };
}

function isMobilePanel() {
  return "block xl:hidden";
}

function isDesktopPanel() {
  return "hidden xl:block";
}

function PanelContent({ lead, operators }: { lead: LeadDetailModel; operators: AgencyOperator[] }) {
  const topRecommendation = lead.recommendations[0];
  const signals = whyThisLeadMatters(lead);
  const kpi = getHeroKpi(lead);

  return (
    <div className="space-y-8 sm:space-y-10">
      <LeadOperationsPanel lead={lead} leadId={lead.id} operators={operators} variant="panel" />

      <div className="text-center">
        <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-white p-1 shadow-sm">
          <div className="h-full w-full overflow-hidden rounded-full">
            <img
              alt={`Avatar de ${lead.fullName}`}
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDy-b4QL61mOOdOWvw8yuTbKV4Lqyk0395YLcyiPneyJRmen0h0AU8UEdd0iSuHP7rdiW5HgIu9bFogzz66pJ57xIoeCmwbERJVcC7EY-8KA30_PAouUlcCu5fKUYpWcSFAF_lM8PsGU0WKH4kRQVbktUt2HOZEifDm3pQ6cUNa5kZlBTqZT6yyn5E9FX6mUcAB382lnAZ1Ju8PRvP3PZR3rzUIII1YXqI1Ha2VqtMZD-PljyqUtAiDip0A3oa0qS7skAcoNz9_6mTf"
            />
          </div>
        </div>
        <h2 className="text-2xl text-[#313330] sm:text-3xl" style={{ fontFamily: "'Noto Serif', serif" }}>
          {lead.fullName}
        </h2>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-500">{getPersonaSubtitle(lead)}</p>
      </div>

      <div className="rounded-xl bg-white p-6 text-center sm:p-8">
        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-stone-400">Probabilidad de cierre</p>
        <span className="text-4xl font-light text-[#58624e] sm:text-5xl" style={{ fontFamily: "'Noto Serif', serif" }}>
          {lead.closeProbability}
          <span className="ml-0.5 text-2xl">%</span>
        </span>
        <div className="mt-6 flex justify-center space-x-4">
          <div className="border-r border-stone-100 px-4 text-center">
            <p className="text-lg text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
              {kpi.views}
            </p>
            <p className="text-[9px] uppercase tracking-widest text-stone-400">Interacciones</p>
          </div>
          <div className="px-4 text-center">
            <p className="text-lg text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
              {kpi.visits}
            </p>
            <p className="text-[9px] uppercase tracking-widest text-stone-400">Visitas</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#313330]">Evaluación IA</h4>
        <p className="text-sm italic leading-relaxed text-stone-600">
          &quot;{aiJudgment(lead)}&quot;
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#313330]">Por qué importa este lead</h4>
        <ul className="space-y-3">
          {signals.map((signal) => (
            <li key={signal} className="flex items-start text-xs leading-tight text-stone-600">
              <span className="material-symbols-outlined mr-3 text-[16px] text-[#58624e]">bolt</span>
              <span>{signal}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#313330]">Propiedad recomendada</h4>
        <div className="group relative cursor-pointer overflow-hidden rounded bg-white">
          <div className="aspect-[16/9] w-full overflow-hidden">
            <img
              alt="Propiedad recomendada"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbce_zM7D1YnCs0os4o694s3i550EwnncqmhfReiJuv5SeuHKtiY0ndz-tDBM63M3VMjcbrTK2OuWs6wBu9c35jxuYGZvPW8Lyfl9TqsxjOgNvbX7s_y2gW3NhM1MCQOyYcb1etXWZ0Z-__B_KgHgm34HlbS-jTZwZrZ0IAIr2Qg243zI2RtDuZQuM-kWLhRViKgMUTe72dLVJnaEqTrLYEhpq1fbYH8H5eyU3M41GNiVraHcJBYhbMDrBIXc7WWXcwHOQusjRUYrI"
            />
          </div>
          <div className="p-4">
            <h5 className="text-sm text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
              {topRecommendation?.title ?? "Portafolio sugerido"}
            </h5>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-stone-400">
              {topRecommendation ? `${topRecommendation.neighborhood} · Coincidencia alta` : "Selección premium"}
            </p>
          </div>
        </div>
      </div>

      <MetaOutboundComposer leadId={lead.id} metaReply={lead.metaReply} />

      <div className="sticky bottom-0 pt-3 sm:pt-4">
        <button
          className="w-full rounded bg-[#58624e] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f2fde3] shadow-lg transition-opacity hover:opacity-95"
          type="button"
        >
          {getPrimaryAction(lead)}
        </button>
      </div>
    </div>
  );
}

export function LeadDetailPanel({ lead, operators }: LeadDetailPanelProps) {
  if (!lead) {
    return (
      <div className="rounded-xl bg-white p-6 sm:p-8">
        <p className="text-[10px] uppercase tracking-[0.15em] text-stone-500">Consola de inteligencia</p>
        <h3 className="mt-3 text-2xl text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
          Seleccioná un lead para abrir el panel
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-stone-500">
          Elegí una oportunidad en la columna izquierda para ver señales de cierre, evaluación y recomendación.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={isDesktopPanel()}>
        <PanelContent lead={lead} operators={operators} />
      </div>
      <div className={`${isMobilePanel()} rounded-xl bg-[#f5f3f0] p-5 sm:p-6`}>
        <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500">Lead activo</p>
            <h3 className="mt-1 text-lg text-[#313330] sm:text-xl" style={{ fontFamily: "'Noto Serif', serif" }}>
              {lead.fullName}
            </h3>
          </div>
          <span className="text-xl text-[#58624e] sm:text-2xl" style={{ fontFamily: "'Noto Serif', serif" }}>
            {lead.closeProbability}%
          </span>
        </div>
        <p className="text-[13px] leading-relaxed text-stone-600 sm:text-sm">
          {lead.silenceHours != null ? `${formatRelativeHours(lead.silenceHours)} sin actividad.` : "Actividad reciente."}{" "}
          {aiJudgment(lead)}
        </p>
      </div>
    </>
  );
}
