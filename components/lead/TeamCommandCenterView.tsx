import Link from "next/link";
import { AestheteSidebar } from "@/components/layout/AestheteSidebar";
import { AestheteTopBar } from "@/components/layout/AestheteTopBar";
import { AestheteFooter } from "@/components/layout/AestheteFooter";
import { LeadInboxItem } from "@/lib/server/read-models/leads";
import { ExecutiveAnalyticsModel } from "@/lib/server/read-models/analytics";
import { displayChannel } from "@/lib/i18n/present";
import { formatCurrencyUSD } from "@/lib/formatters";

interface TeamCommandCenterViewProps {
  agencyId: string;
  leads: LeadInboxItem[];
  analytics: ExecutiveAnalyticsModel;
}

type UrgentCardTone = "immediate" | "hot" | "market";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");
}

function budgetLine(lead: LeadInboxItem) {
  if (lead.budgetMin != null && lead.budgetMax != null) {
    return `${formatCurrencyUSD(lead.budgetMin)} - ${formatCurrencyUSD(lead.budgetMax)}`;
  }
  if (lead.budgetMin != null) return `Desde ${formatCurrencyUSD(lead.budgetMin)}`;
  if (lead.budgetMax != null) return `Hasta ${formatCurrencyUSD(lead.budgetMax)}`;
  return "Presupuesto sin definir";
}

function urgencyTone(lead: LeadInboxItem): UrgentCardTone {
  if ((lead.silenceHours ?? 0) >= 36) return "immediate";
  if (lead.closeProbability >= 80) return "hot";
  return "market";
}

function toneLabel(tone: UrgentCardTone) {
  if (tone === "immediate") return "Acción inmediata";
  if (tone === "hot") return "Prospecto caliente";
  return "Cambio de mercado";
}

function toneIcon(tone: UrgentCardTone) {
  if (tone === "immediate") return "bolt";
  if (tone === "hot") return "star";
  return "trending_down";
}

function toneClass(tone: UrgentCardTone) {
  if (tone === "immediate") return "text-[#a73b21] border-[#a73b21]/20";
  if (tone === "hot") return "text-[#58624e] border-[#58624e]/20";
  return "text-[#686028] border-[#686028]/20";
}

function buildUrgentCards(leads: LeadInboxItem[]) {
  const sorted = [...leads].sort((a, b) => {
    const silenceA = a.silenceHours ?? 0;
    const silenceB = b.silenceHours ?? 0;
    return b.closeProbability + silenceB - (a.closeProbability + silenceA);
  });
  return sorted.slice(0, 3);
}

function pct(value: number) {
  return `${Math.round(value)}%`;
}

export function TeamCommandCenterView({ agencyId, leads, analytics }: TeamCommandCenterViewProps) {
  const urgentCards = buildUrgentCards(leads);
  const stagnantLeads = [...leads]
    .filter((lead) => (lead.silenceHours ?? 0) >= 24)
    .sort((a, b) => (b.silenceHours ?? 0) - (a.silenceHours ?? 0))
    .slice(0, 2);

  const confirmedLeads = [...leads].sort((a, b) => b.closeProbability - a.closeProbability).slice(0, 2);
  const riskLead = analytics.riskQueue[0];
  const topPerformers = analytics.channels.slice(0, 2);
  const monthlyGoal = Math.max(5600000, analytics.headline.activePipeline * 700000);
  const monthlyCurrent = Math.round((monthlyGoal * Math.max(55, analytics.headline.qualifiedRate)) / 100);
  const monthlyProgress = Math.min(96, Math.max(30, Math.round((monthlyCurrent / monthlyGoal) * 100)));

  return (
    <main className="aesthete-page min-h-screen bg-[#fbf9f6] font-body text-[#313330]">
      <AestheteSidebar active="Equipo" agencyId={agencyId} />

      <div className="min-h-screen lg:ml-64">
        <AestheteTopBar />

        <div className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-8 sm:pb-20 lg:px-10">
          <section className="mb-14 sm:mb-16">
            <div className="mb-6 flex items-baseline justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Inteligencia urgente</h3>
              <div className="mx-6 h-px flex-1 bg-stone-200/60" />
              <Link
                className="text-[10px] uppercase tracking-[0.1em] text-stone-400 transition-colors hover:text-[#58624e]"
                href={`/leads?agencyId=${agencyId}`}
              >
                Ver toda la prioridad
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
              {urgentCards.map((lead) => {
                const tone = urgencyTone(lead);
                return (
                  <article
                    key={lead.id}
                    className="group rounded-lg border border-transparent bg-white p-6 shadow-[0_20px_50px_-12px_rgba(49,51,48,0.04)] transition-all hover:border-[#58624e]/10 sm:p-8"
                  >
                    <div className="mb-6 flex items-start justify-between">
                      <span className={`border-b pb-1 text-[9px] font-bold uppercase tracking-widest ${toneClass(tone)}`}>
                        {toneLabel(tone)}
                      </span>
                      <span className="material-symbols-outlined text-stone-300 transition-colors group-hover:text-[#58624e]">
                        {toneIcon(tone)}
                      </span>
                    </div>
                    <h4 className="mb-2 text-xl text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
                      {lead.fullName}
                    </h4>
                    <p className="mb-6 text-sm leading-relaxed text-stone-500">
                      {lead.preferredZones[0] ?? "Zona premium"} • {budgetLine(lead)}
                    </p>
                    <div className="mb-6 rounded bg-[#f5f3f0] p-4">
                      <p className="mb-2 text-[11px] uppercase tracking-wider text-stone-400">Recomendado</p>
                      <p className="text-sm italic text-[#313330]">
                        &quot;{lead.recommendedNextAction?.title ?? "Definir próximo movimiento para recuperar timing comercial."}&quot;
                      </p>
                    </div>
                    <Link className="flex items-center text-[10px] font-bold uppercase tracking-[0.1em] text-[#58624e]" href={`/leads/${lead.id}?agencyId=${agencyId}`}>
                      Abrir lead <span className="material-symbols-outlined ml-2 text-[14px]">chevron_right</span>
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>

          <div className="flex flex-col gap-12 sm:gap-16 lg:flex-row">
            <section className="flex-grow">
              <div className="mb-8 sm:mb-10">
                <h3 className="mb-2 text-2xl text-[#313330] sm:text-3xl" style={{ fontFamily: "'Noto Serif', serif" }}>
                  Movimiento diario
                </h3>
                <p className="text-sm tracking-wide text-stone-400">
                  Un panorama curado de gestión activa y cambios de alto valor.
                </p>
              </div>

              <div className="space-y-10 sm:space-y-12">
                <div className="relative border-l border-stone-200 pl-8">
                  <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-[#58624e]" />
                  <span className="mb-4 block text-[10px] uppercase tracking-[0.2em] text-stone-400">
                    Estancamiento de alto valor
                  </span>
                  <div className="space-y-6">
                    {stagnantLeads.length ? (
                      stagnantLeads.map((lead) => (
                        <Link
                          key={lead.id}
                          className="group flex items-center justify-between"
                          href={`/leads/${lead.id}?agencyId=${agencyId}`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#efeeea] text-lg italic text-[#58624e]" style={{ fontFamily: "'Noto Serif', serif" }}>
                              {initials(lead.fullName)}
                            </div>
                            <div>
                              <h5 className="text-base font-medium text-[#313330]">{lead.fullName}</h5>
                              <p className="text-xs text-stone-400">
                                Puntuación {lead.score} • {lead.silenceHours != null ? `${lead.silenceHours}h sin contacto` : "sin actividad"}
                              </p>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-stone-200 transition-colors group-hover:text-[#58624e]">
                            arrow_forward_ios
                          </span>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-stone-500">No hay estancamientos críticos en este momento.</p>
                    )}
                  </div>
                </div>

                <div className="relative border-l border-stone-200 pl-8">
                  <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-stone-300" />
                  <span className="mb-6 block text-[10px] uppercase tracking-[0.2em] text-stone-400">
                    Encuentros confirmados
                  </span>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
                    {confirmedLeads.map((lead, index) => (
                      <article key={lead.id} className="group cursor-pointer overflow-hidden">
                        <div className="mb-4 aspect-[16/9] overflow-hidden rounded-sm bg-stone-200">
                          <img
                            alt="Propiedad"
                            className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
                            src={
                              index === 0
                                ? "https://lh3.googleusercontent.com/aida-public/AB6AXuBwv_-WSJcEpFbVnHO2RHbER8bD1l8Pba9C2RY2ase9eIZYPG46VxczHkOtrFkPthNIBkLWF-TuwOQlYFUKW85oXmnFNFxKkaRvYYiybevdoaBTnUvkRx0PXfVBABEn6f1N9Tu5zoX2JwYII5mjhnV4_4BlW2GyNs9Wf4-fhQ2BenI9jGwfewp6lpdty6bTHl5HbjfcKslucLcn6P4K9SFOin-FyExZbAN6hiOAxA0yy23uVEvCwtwFRfBXKCir5zFRWWaJuS_sFLT3"
                                : "https://lh3.googleusercontent.com/aida-public/AB6AXuA_39Uf8TuHfmqjOJnvnxLwnP9Jms4ZNrAngbG8di8JXoAqEw-45Vy3QKz6zzmm-had-PaJOpWl7jGn74FHXuOBmS6xRhpJ4EwiySRbwL3tAFRbq4jm2vzK3E7adwJen3XYxcxS1bGELzzpuQVKuKtzEtXBGXjyjCKhzurMW43ilQqytF2bebmPyfaUDjmTkVM6mDVGfHRjbKGCAdWVGef0zr9xbPVCR6-po8XxDVQjNRQUF7853BmwHYZWgVEKZ9z2M2YqC2RFYXSC"
                            }
                          />
                        </div>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-lg italic text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
                              {lead.preferredZones[0] ?? "Visita premium"}
                            </p>
                            <p className="mt-1 text-[11px] uppercase tracking-widest text-stone-400">
                              {lead.closeProbability >= 80 ? "Visita privada" : "Recorrido final"}
                            </p>
                          </div>
                          <span
                            className={`rounded px-2 py-1 text-[9px] uppercase tracking-tight ${
                              lead.closeProbability >= 80
                                ? "bg-[#dce6cd] text-[#4b5542]"
                                : "bg-[#e3e3de] text-[#5e5f5c]"
                            }`}
                          >
                            {lead.closeProbability >= 80 ? "VIP" : "Pendiente"}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="relative border-l border-stone-200 pl-8">
                  <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-[#a73b21]/40" />
                  <span className="mb-4 block text-[10px] uppercase tracking-[0.2em] text-stone-400">
                    Preservación requerida
                  </span>
                  <div className="flex flex-col gap-4 rounded-lg border border-[#a73b21]/5 bg-[#fd795a]/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                      <h5 className="text-lg text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
                        {riskLead ? `Negocio de ${riskLead.name}` : "Negocio de pipeline en riesgo"}
                      </h5>
                      <p className="mt-1 text-sm text-stone-500">
                        La probabilidad cayó <span className="font-semibold text-[#a73b21]">24%</span> por timing y
                        desajuste de valuación.
                      </p>
                    </div>
                    <button className="w-full rounded-full border border-stone-200 bg-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-stone-50 sm:w-auto">
                      Intervenir
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <aside className="w-full lg:w-80">
              <div className="lg:sticky lg:top-32">
                <div className="mb-10">
                  <h3 className="mb-4 text-xl italic text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
                    Momentum de la agencia
                  </h3>
                  <div className="h-1 w-12 bg-[#58624e] opacity-30" />
                </div>

                <div className="mb-8 rounded-2xl bg-[#efeeea] p-8 text-center">
                  <div className="relative mb-6 inline-flex items-center justify-center">
                    <svg className="h-32 w-32" viewBox="0 0 128 128">
                      <circle cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-stone-200" />
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        fill="transparent"
                        stroke="currentColor"
                        strokeDasharray="364"
                        strokeDashoffset={364 - (364 * monthlyProgress) / 100}
                        strokeLinecap="round"
                        strokeWidth="4"
                        className="text-[#58624e]"
                      />
                    </svg>
                    <span className="absolute text-2xl italic text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
                      {monthlyProgress}%
                    </span>
                  </div>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-stone-500">Objetivo mensual</p>
                  <p className="text-sm font-medium text-[#313330]">
                    {compactMoney(monthlyCurrent)} / {compactMoney(monthlyGoal)}
                  </p>
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#58624e]">Mejor rendimiento</p>
                  {topPerformers.length ? (
                    topPerformers.map((channel, index) => (
                      <div key={channel.channel} className="flex items-center space-x-4">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-stone-200">
                          <img
                            alt="Miembro del equipo"
                            className="h-full w-full object-cover grayscale"
                            src={
                              index === 0
                                ? "https://lh3.googleusercontent.com/aida-public/AB6AXuD0AsS27dvRVfZq6no_AzLxS9Xl0jRPszkz4Q7wnL5fTxlqJzKyDnpjA-JIkhI9NITDLPWo-K6E8wYiIfKLF1eQzMp8DGq85o-5j6CrLpmpJtX3PHvklKV1IG75z9dHUjM0eZCFPxVGHnP1DcUmbMVw26D0Pg74rtwIeWGVgEjbqIUX80rFXpO8Zmvo1UFvnJfTiSi7BSc8QtoLQofdwFWihG3mQRjKkmAjIIsEuegX_Tr1ZEXqWD9bLt_JmrjykIgJrQck1NjZG28C"
                                : "https://lh3.googleusercontent.com/aida-public/AB6AXuD2z004VGjgNFarvzXurZklO3GG4cX_KKW1l7CqXcZCs7KZq77Lqi1dzmfa1BmjcsWpVyl4A1EUyD10y3K9XyUhC67NRVAlGOsFSFnNbFc34RFy9vHYa2I7QxlZOYePTCggWbFxS7sIZhtsi6XEA4PM6ovbHc7wklM3B0xT8DniHxLF177ZYV8P9h1TYHiGfXvJsvTEsubutSMfH5r6qzXnEnOwld1p2dozmYHYBvZCNLaHQowpq16d8fyJZu12dDzfdQC-16vzUvwx"
                            }
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-[#313330]">{displayChannel(channel.channel)}</p>
                            <span className="text-[10px] text-stone-400">{Math.round(channel.leadCount / 2)} cierres</span>
                          </div>
                          <div className="mt-1 h-[2px] w-full bg-stone-200">
                            <div className="h-[2px] bg-[#58624e]" style={{ width: pct(channel.qualifiedRate) }} />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-stone-500">Todavía no hay datos de rendimiento.</p>
                  )}
                </div>

                <div className="mt-12 rounded-sm border-l-2 border-[#58624e] bg-white p-6 shadow-[0_20px_50px_-12px_rgba(49,51,48,0.04)]">
                  <span className="material-symbols-outlined mb-3 text-sm text-[#58624e]">auto_awesome</span>
                  <p className="text-sm italic leading-relaxed text-stone-600">
                    &quot;El mercado se está moviendo hacia activos de resguardo de largo plazo. Conviene pivotear tus
                    leads top hacia propiedades off-market en {analytics.zones[0]?.zone ?? "zonas de alta intención"}.&quot;
                  </p>
                  <p className="mt-4 text-[9px] uppercase tracking-widest text-stone-400">
                    — Motor de inteligencia
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <AestheteFooter className="mt-16 sm:mt-20" variant="editorial" />
      </div>
    </main>
  );
}

function compactMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}
