import Link from "next/link";
import { AestheteSidebar } from "@/components/layout/AestheteSidebar";
import { AestheteTopBar } from "@/components/layout/AestheteTopBar";
import { AestheteFooter } from "@/components/layout/AestheteFooter";
import type { DashboardModel } from "@/lib/server/read-models/dashboard";

interface DashboardViewProps {
  agencyId: string;
  model: DashboardModel;
}

function MorningBriefing({ model }: { model: DashboardModel["briefing"] }) {
  return (
    <section className="flex flex-col justify-between gap-6 border-b border-[#b2b2ae]/10 pb-10 md:flex-row md:items-end md:gap-8 md:pb-12">
      <div className="max-w-2xl">
        <span className="mb-4 block text-[11px] uppercase tracking-[0.1em] text-[#58624e]">Resumen de la mañana</span>
        <h1 className="text-3xl leading-tight text-[#313330] sm:text-4xl lg:text-5xl" style={{ fontFamily: "'Noto Serif', serif", letterSpacing: "0.04em" }}>
          {model.headline}
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-[#5e5f5c] sm:text-lg">{model.subline}</p>
      </div>
      <Link
        className="inline-flex items-center justify-center bg-[#58624e] px-6 py-3 text-[11px] uppercase tracking-[0.1em] text-[#f2fde3] transition-colors hover:bg-[#4d5643] sm:px-8 sm:py-4"
        href="/opportunities"
      >
        Revisar oportunidades
      </Link>
    </section>
  );
}

function PriorityIntelligence({
  agencyId,
  priorityLeads
}: {
  agencyId: string;
  priorityLeads: DashboardModel["priorityLeads"];
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] uppercase tracking-[0.1em] text-[#5e5f5c]">Inteligencia prioritaria</h2>
        <Link
          className="text-[11px] uppercase tracking-[0.1em] text-[#58624e] transition-all hover:underline"
          href={`/leads?agencyId=${agencyId}`}
        >
          Ver todos los leads activos
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-1">
        {priorityLeads.length === 0 ? (
          <p className="col-span-full text-sm text-[#5e5f5c]">No hay leads en pipeline para mostrar como prioridad.</p>
        ) : (
          priorityLeads.map((lead) => {
            const toneClass =
              lead.tone === "mid" ? "bg-[#efeeea]" : lead.tone === "high" ? "bg-[#f5f3f0]" : "bg-[#f5f3f0]";

            return (
              <Link
                key={lead.id}
                className={`${toneClass} group block p-6 transition-all hover:bg-[#e9e8e4] sm:p-8`}
                href={`/leads/${lead.id}`}
              >
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h3 className="text-xl" style={{ fontFamily: "'Noto Serif', serif", letterSpacing: "0.04em" }}>
                      {lead.name}
                    </h3>
                    <p className={`mt-1 text-xs ${lead.tone === "mid" ? "font-medium text-[#58624e]" : "text-[#5e5f5c]"}`}>
                      {lead.urgency}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl text-[#58624e]" style={{ fontFamily: "'Noto Serif', serif" }}>
                      {lead.score}
                    </span>
                    <p className="text-[10px] uppercase tracking-widest text-[#5e5f5c]">Score</p>
                  </div>
                </div>
                <div className="bg-[#ffffff] p-4">
                  <p className="text-sm leading-snug text-[#313330]">{lead.action}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}

function LossInsightAndActivity({
  lossHeadline,
  lossColumns,
  activity
}: Pick<DashboardModel, "lossHeadline" | "lossColumns" | "activity">) {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <div className="relative overflow-hidden bg-[#f5f3f0] p-8 sm:p-10 lg:col-span-8 lg:p-12">
        <div className="relative z-10">
          <h2 className="mb-8 text-2xl sm:text-3xl" style={{ fontFamily: "'Noto Serif', serif", letterSpacing: "0.04em" }}>
            {lossHeadline}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {lossColumns.map((col) => (
              <div key={col.title}>
                <p
                  className={`mb-2 text-[11px] uppercase tracking-[0.1em] ${col.variant === "accent" ? "text-[#a73b21]" : "text-[#313330]"}`}
                >
                  {col.title}
                </p>
                <div className={`mb-4 h-1 w-full ${col.variant === "accent" ? "bg-[#a73b21]/10" : "bg-[#313330]/10"}`}>
                  <div
                    className={`h-full ${col.variant === "accent" ? "bg-[#a73b21]" : "bg-[#313330]"}`}
                    style={{ width: `${col.barWidthPercent}%` }}
                  />
                </div>
                <p className="text-sm text-[#5e5f5c]">{col.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8 lg:col-span-4">
        <h2 className="text-[11px] uppercase tracking-[0.1em] text-[#5e5f5c]">Actividad reciente</h2>
        <div className="space-y-8">
          {activity.map((item) => (
            <div key={`${item.text}-${item.time}`} className="flex items-start gap-6">
              <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${item.active ? "bg-[#58624e]" : "bg-[#b2b2ae]"}`} />
              <div>
                <p className="text-sm font-medium text-[#313330]">{item.text}</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-[#5e5f5c]">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiStrip({ agencyId, kpis }: { agencyId: string; kpis: DashboardModel["kpis"] }) {
  return (
    <div className="space-y-4">
      <section className="flex flex-col justify-between gap-10 bg-[#313330] p-8 text-[#fbf9f6] sm:p-10 md:flex-row md:flex-wrap md:gap-12">
        {kpis.map((kpi) => (
          <div className="space-y-1" key={kpi.label}>
            <p className="text-[11px] uppercase tracking-[0.1em] text-[#fbf9f6]/50">{kpi.label}</p>
            <p className={`text-3xl ${kpi.highlighted ? "text-[#dce6cd]" : ""}`} style={{ fontFamily: "'Noto Serif', serif" }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </section>
      <p className="text-right text-xs text-[#5e5f5c]">
        <Link className="font-medium text-[#58624e] underline-offset-4 hover:underline" href={`/insights?agencyId=${agencyId}`}>
          Ver analítica operativa completa
        </Link>
      </p>
    </div>
  );
}

export function DashboardView({ agencyId, model }: DashboardViewProps) {
  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#313330]" style={{ fontFamily: "Inter, sans-serif" }}>
      <AestheteSidebar active="Tablero" agencyId={agencyId} />
      <main className="min-h-screen lg:ml-64">
        <AestheteTopBar />
        <div className="mx-auto w-full max-w-7xl space-y-14 px-4 py-10 sm:space-y-16 sm:px-8 sm:py-12 lg:px-12">
          <MorningBriefing model={model.briefing} />
          <PriorityIntelligence agencyId={agencyId} priorityLeads={model.priorityLeads} />
          <LossInsightAndActivity
            activity={model.activity}
            lossColumns={model.lossColumns}
            lossHeadline={model.lossHeadline}
          />
          <KpiStrip agencyId={agencyId} kpis={model.kpis} />
        </div>
        <AestheteFooter variant="atelier" />
      </main>
    </div>
  );
}
