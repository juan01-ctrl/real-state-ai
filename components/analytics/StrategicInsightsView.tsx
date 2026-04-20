import Link from "next/link";
import { AestheteSidebar } from "@/components/layout/AestheteSidebar";
import { AestheteTopBar } from "@/components/layout/AestheteTopBar";
import { AestheteFooter } from "@/components/layout/AestheteFooter";
import { displayChannel, displayLeadStage } from "@/lib/i18n/present";
import type { StrategicInsightsModel } from "@/lib/server/read-models/strategic-insights";

interface StrategicInsightsViewProps {
  agencyId: string;
  insights: StrategicInsightsModel;
}

function formatDelayMinutes(m: number | null) {
  if (m == null) return "Sin datos";
  if (m < 60) return `${Math.round(m)} min`;
  const h = Math.floor(m / 60);
  const min = Math.round(m % 60);
  if (min === 0) return `${h} h`;
  return `${h} h ${min} min`;
}

function leadHref(agencyId: string, leadId: string) {
  return `/leads/${leadId}?agencyId=${agencyId}`;
}

function KpiCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="rounded-xl border border-[#e9e8e4] bg-white p-6 shadow-[0_16px_40px_-18px_rgba(49,51,48,0.08)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5e5f5c]">{label}</p>
      <p className="mt-3 text-3xl font-light tabular-nums text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
        {value}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-[#5e5f5c]">{hint}</p>
    </article>
  );
}

export function StrategicInsightsView({ agencyId, insights }: StrategicInsightsViewProps) {
  const topLoss = insights.lossReasons.buckets[0];
  const maxLossCount = insights.lossReasons.buckets[0]?.count ?? 1;

  return (
    <main className="aesthete-page min-h-screen bg-[#fbf9f6] text-[#313330]">
      <AestheteSidebar active="Analítica" agencyId={agencyId} />

      <div className="min-h-screen lg:ml-64">
        <AestheteTopBar />

        <div className="max-w-[1200px] px-4 py-10 sm:px-8 sm:py-12 lg:px-12">
          <header className="mb-10 border-b border-[#e9e8e4] pb-8">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Inteligencia operativa</p>
            <h1 className="text-3xl font-light tracking-tight text-[#313330] sm:text-4xl" style={{ fontFamily: "'Noto Serif', serif" }}>
              Señales estratégicas
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5e5f5c]">
              Indicadores calculados sobre datos de la agencia. Las tablas amplían cada señal; al pie detallamos definiciones y límites.
            </p>
          </header>

          <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard
              label="LOST de alta intención"
              value={String(insights.lostHighIntent.count)}
              hint={`Score ≥ 70 o probabilidad de cierre ≥ 70%. Listado: ${Math.min(8, insights.lostHighIntent.sample.length)} recientes.`}
            />
            <KpiCard
              label="Demora media de respuesta"
              value={formatDelayMinutes(insights.responseDelay.averageMinutes)}
              hint={insights.responseDelay.methodNote}
            />
            <KpiCard
              label="Pipeline sin seguimiento a tiempo"
              value={String(insights.waitingTooLong.count)}
              hint={insights.waitingTooLong.definitionNote}
            />
          </section>

          {(insights.lostHighIntent.sample.length > 0 || insights.waitingTooLong.sample.length > 0) && (
            <section className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {insights.lostHighIntent.sample.length > 0 ? (
                <div className="rounded-xl border border-[#e9e8e4] bg-white p-6">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5e5f5c]">Ejemplos · LOST alta intención</h2>
                  <ul className="mt-4 divide-y divide-[#f0efec]">
                    {insights.lostHighIntent.sample.map((row) => (
                      <li key={row.leadId} className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-0">
                        <Link
                          className="text-sm font-medium text-[#313330] underline-offset-4 hover:underline"
                          href={leadHref(agencyId, row.leadId)}
                        >
                          {row.name}
                        </Link>
                        <span className="text-xs tabular-nums text-[#5e5f5c]">
                          score {row.leadScore} · {displayChannel(row.sourceChannel)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {insights.waitingTooLong.sample.length > 0 ? (
                <div className="rounded-xl border border-[#e9e8e4] bg-white p-6">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5e5f5c]">Prioridad · sin actividad reciente</h2>
                  <ul className="mt-4 divide-y divide-[#f0efec]">
                    {insights.waitingTooLong.sample.map((row) => (
                      <li key={row.leadId} className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-0">
                        <Link
                          className="text-sm font-medium text-[#313330] underline-offset-4 hover:underline"
                          href={leadHref(agencyId, row.leadId)}
                        >
                          {row.name}
                        </Link>
                        <span className="text-xs tabular-nums text-[#5e5f5c]">
                          ~{row.silenceHours} h · score {row.leadScore}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          )}

          <section className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-xl border border-[#e9e8e4] bg-[#fafaf8] p-6 sm:p-8">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5e5f5c]">Motivos de pérdida (historial)</h2>
              <p className="mt-2 text-xs text-[#5e5f5c]">{insights.lossReasons.methodNote}</p>
              {insights.lossReasons.buckets.length === 0 ? (
                <p className="mt-6 text-sm text-[#5e5f5c]">Todavía no hay motivos agrupables en el historial.</p>
              ) : (
                <ul className="mt-6 space-y-4">
                  {insights.lossReasons.buckets.map((b) => (
                    <li key={b.reason}>
                      <div className="mb-1 flex justify-between gap-3 text-sm">
                        <span className="font-medium leading-snug text-[#313330]">{b.reason}</span>
                        <span className="shrink-0 tabular-nums text-xs text-[#5e5f5c]">
                          {b.count} ({b.sharePercent}%)
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#e3e3de]">
                        <div
                          className="h-full rounded-full bg-[#58624e]/70"
                          style={{ width: `${Math.max(6, (b.count / maxLossCount) * 100)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {topLoss ? (
                <p className="mt-6 text-xs text-[#5e5f5c]">
                  Motivo más frecuente: <span className="font-medium text-[#313330]">{topLoss.reason}</span> ({topLoss.sharePercent}% de los eventos con texto).
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-[#e9e8e4] bg-white p-6 sm:p-8">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5e5f5c]">Rendimiento por fuente</h2>
              <p className="mt-2 text-xs text-[#5e5f5c]">
                Calificación = leads en etapa calificada o posterior / total del canal (mismo criterio en todo el producto).
              </p>
              {insights.sourcePerformance.length === 0 ? (
                <p className="mt-6 text-sm text-[#5e5f5c]">No hay leads por canal todavía.</p>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[320px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#e9e8e4] text-[10px] font-semibold uppercase tracking-wider text-[#5e5f5c]">
                        <th className="pb-3 pr-3 font-semibold">Canal</th>
                        <th className="pb-3 pr-3 font-semibold">Leads</th>
                        <th className="pb-3 pr-3 font-semibold">Calif.</th>
                        <th className="pb-3 pr-3 font-semibold">Tasa</th>
                        <th className="pb-3 font-semibold">Score Ø</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0efec]">
                      {insights.sourcePerformance.map((row) => (
                        <tr key={row.channel}>
                          <td className="py-3 pr-3 font-medium text-[#313330]">{row.label}</td>
                          <td className="py-3 pr-3 tabular-nums text-[#5e5f5c]">{row.leadCount}</td>
                          <td className="py-3 pr-3 tabular-nums text-[#5e5f5c]">{row.qualifiedCount}</td>
                          <td className="py-3 pr-3 tabular-nums text-[#5e5f5c]">{row.qualifiedRate}%</td>
                          <td className="py-3 tabular-nums text-[#5e5f5c]">{row.avgScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section className="mb-12 rounded-xl border border-[#e9e8e4] bg-white p-6 sm:p-8">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5e5f5c]">Embudo (snapshot actual)</h2>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-[#5e5f5c]">
              Conteos por etapa hoy. El % respecto de la etapa anterior es una foto instantánea, no una cohorte en el tiempo: útil para ver dónde está el stock, no para medir conversión real de entradas del mes.
            </p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e9e8e4] text-[10px] font-semibold uppercase tracking-wider text-[#5e5f5c]">
                    <th className="pb-3 pr-3 font-semibold">Etapa</th>
                    <th className="pb-3 pr-3 font-semibold">Leads</th>
                    <th className="pb-3 font-semibold">vs. anterior</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0efec]">
                  {insights.stageConversion.map((row) => (
                    <tr key={row.stage}>
                      <td className="py-3 pr-3 font-medium text-[#313330]">{displayLeadStage(row.stage)}</td>
                      <td className="py-3 pr-3 tabular-nums text-[#5e5f5c]">{row.count}</td>
                      <td className="py-3 tabular-nums text-[#5e5f5c]">
                        {row.conversionFromPrevious == null ? "—" : `${row.conversionFromPrevious}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <details className="rounded-xl border border-[#e3e3de] bg-[#fafaf8] p-5 text-sm">
            <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.2em] text-[#5e5f5c]">
              Metodología y límites
            </summary>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[#5e5f5c]">
              {insights.methodology.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </details>
        </div>

        <AestheteFooter className="mt-20 sm:mt-24" variant="editorial" />
      </div>
    </main>
  );
}
