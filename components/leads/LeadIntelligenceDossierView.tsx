import Link from "next/link";
import { notFound } from "next/navigation";
import { AestheteFooter } from "@/components/layout/AestheteFooter";
import { AestheteSidebar } from "@/components/layout/AestheteSidebar";
import { AestheteTopBar } from "@/components/layout/AestheteTopBar";
import { LeadOperationsPanel } from "@/components/leads/LeadOperationsPanel";
import { MetaOutboundComposer } from "@/components/leads/MetaOutboundComposer";
import type { AgencyOperator } from "@/lib/server/read-models/operators";
import type { LeadDetailModel } from "@/lib/server/read-models/leads";
import { formatCurrencyUSD, formatDateTime, formatRelativeHours } from "@/lib/formatters";
import { displayFinancingMode, displayMessageDirection, displayPropertyType } from "@/lib/i18n/present";

interface LeadIntelligenceDossierViewProps {
  agencyId: string;
  lead: LeadDetailModel | null;
  operators: AgencyOperator[];
}

const dossierImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAPxz8S_Z6PW3Avaz54iJ1oDqc7RMhmh1JcX5IdRh37gsvK0HCvzFGvYNjUIPU15rqaQF_YCoUS_4E4y_ZKWH9OX0MRdesSv_r6sQJHlMLrYSPHOMSASw3PgHXM5nJkM7xYKO4HA1i4HkyznYxK6JaXFIUPZOMc_nuV4FWlergTrpKWBQMGgO8txzQvrD1b9Exgkb4KWR-YMEmvRPWXciits8-JHa3cI9m9LPj1HAY0j0QV9jj0CRY-Roa5wurs0BzFrgysSI-Sg33F",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCJncSqdIkjK-_oP9-dC_qeJa2-18ale0DEVHA3Ipy1lCBEiZndohvmP0izmy6KZxcKjvmZ1VqXPYhBgZG5tVZdOYz-ng7-yhF2xE8EqiVAUUhG9ZHG73mrKq2reRg-07-ArBmsuWW6NrCYZ0RONMqu0xv90my_V6vuCPRnsF45nX0GcJ9jslInde8rtcctlIfqKUY5cybXRyuOzkS5E43vCtcVbo_sKNFynpnSfQJtxWCnvrT5MBHWFGh2wIcmzUFfpCGJRabO2ciB",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAje6gDMfuQWyE4CBpgPl32agCnTLpR5Q6HOrNnCP2z1EdRKpoQZmh5DhF_ICNCPWS8uRMyzjdBmVhqK0Cl2sH9J757aQuZnU4YXTkHsvJ0LMTS7qT2Bf8AotpR_6s1LCmsymV3DPHp3wdg-x-tD0iXYAW9HZ4eMnc7-FYGw8PxpXXSkbY9GlhRUfpHtiXsyIgc5ZiYh1N1DFDHYn21VPcBLQTQSC2xq39c2TJVxeXWm1_hIUZ_p62RpMTVXIMHg68qZg_y39aE1O7G",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAAsaqXJED610jdUusexOdSwpVGVQj934tvP4gBqL8xh8VhQT9G2F2Vof-JsStxwNN_PX_WXONKXYfW7XcDggkw3uO403yHOvXQ9L3BS_xMyJWnjoSUlPRP5IS8IZWWf3Mu59OPospk9Hd6xJ3wUwO9nnmff9sse2VNnGHZifT3_pWKRYk29afU3KVcXlNVmH_aHqjHYEdFFkAUwM6FOaSJtQ75xsgfQYxpfzDF33irEBZuJK7PMROkVZxDBFe1MQKkRqR6HLKoAq6w"
];

function budgetLabel(lead: LeadDetailModel) {
  const min = lead.profile?.budgetMin ?? null;
  const max = lead.profile?.budgetMax ?? null;
  if (min != null && max != null) return `${formatCurrencyUSD(min)} - ${formatCurrencyUSD(max)}`;
  if (min != null) return `Desde ${formatCurrencyUSD(min)}`;
  if (max != null) return `Hasta ${formatCurrencyUSD(max)}`;
  return "Presupuesto no definido";
}

function urgencyLabel(lead: LeadDetailModel) {
  if ((lead.silenceHours ?? 0) >= 36) return "Alta";
  if (lead.closeProbability >= 80) return "Elevada";
  return "Normal";
}

function sourceLabel(lead: LeadDetailModel) {
  return lead.sourceCampaign ?? lead.sourceChannel;
}

function aiNarrative(lead: LeadDetailModel) {
  if (lead.closeProbability >= 80) return "Este comprador tiene alta probabilidad de cerrar en los próximos 7 días.";
  if (lead.closeProbability >= 65)
    return "Este comprador tiene buenas chances de cerrar con un follow-up inmediato y preciso.";
  return "Este comprador necesita más calificación antes de asignar inventario premium.";
}

function aiLogic(lead: LeadDetailModel) {
  const signals = lead.nextAction?.why?.slice(0, 2) ?? [];
  if (signals.length) return signals.join(" ");
  return "La actividad y el historial de conversación muestran intención relevante. La ventana prioritaria de follow-up está abierta.";
}

function generatedOutreach(lead: LeadDetailModel) {
  if (lead.nextAction?.detail) return lead.nextAction.detail;
  return "Vi tu actividad reciente sobre esta oportunidad. Puedo coordinar una visita privada mañana si querés evaluarla con todo el contexto.";
}

export function LeadIntelligenceDossierView({ agencyId, lead, operators }: LeadIntelligenceDossierViewProps) {
  if (!lead) notFound();

  const matches = lead.recommendations.slice(0, 2);
  const log = lead.conversation.slice(0, 3);
  const signals = lead.recommendations.slice(0, 2);
  const riskText =
    (lead.silenceHours ?? 0) >= 4
      ? `Riesgo alto de perder a este comprador si no hay follow-up en las próximas ${Math.max(1, 8 - (lead.silenceHours ?? 0))} horas.`
      : "Hay presión competitiva. Mantené la respuesta bajo 4 horas para proteger la probabilidad de cierre.";

  return (
    <main className="aesthete-page min-h-screen bg-background text-on-background antialiased">
      <AestheteSidebar active="Leads" agencyId={agencyId} />

      <div className="min-h-screen lg:ml-64">
        <AestheteTopBar title="Dossier de inteligencia del lead" />

        <header className="sticky top-[76px] z-30 bg-[#fbf9f6]/80 px-4 py-6 backdrop-blur-xl sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="space-y-1">
              <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                <span>Dossier #{lead.id.slice(0, 8).toUpperCase()}</span>
                <span className="h-1 w-1 rounded-full bg-outline-variant" />
                <span>
                  Última actividad: {lead.silenceHours != null ? formatRelativeHours(lead.silenceHours) : "Ahora"}
                </span>
              </div>
              <h2 className="text-3xl tracking-tight sm:text-4xl serif">{lead.fullName}</h2>
            </div>

            <div className="flex flex-wrap items-end gap-8 lg:gap-12">
              <div className="text-right">
                <p className="mb-1 text-[10px] uppercase tracking-widest text-on-surface-variant">Probabilidad</p>
                <p className="text-2xl text-primary serif">{lead.closeProbability}%</p>
              </div>
              <div className="text-right">
                <p className="mb-1 text-[10px] uppercase tracking-widest text-on-surface-variant">Origen</p>
                <p className="text-sm font-medium">{sourceLabel(lead)}</p>
              </div>
              <div className="text-right">
                <p className="mb-1 text-[10px] uppercase tracking-widest text-on-surface-variant">Urgencia</p>
                <p className="flex items-center justify-end gap-1 text-sm font-medium text-error">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    priority_high
                  </span>
                  {urgencyLabel(lead)}
                </p>
              </div>
              <Link
                className="bg-primary px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-on-primary transition-opacity hover:opacity-90"
                href={`https://wa.me/5491159570977?text=${encodeURIComponent(`Hola, quiero hacer follow-up con ${lead.fullName}.`)}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                Iniciar seguimiento
              </Link>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-10 px-4 pb-20 pt-8 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:px-12">
          <div className="lg:col-span-12">
            <LeadOperationsPanel lead={lead} leadId={lead.id} operators={operators} variant="dossier" />
          </div>

          <div className="space-y-14 lg:col-span-7">
            <section>
              <h3 className="mb-8 flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] text-on-surface-variant">
                <span className="h-px w-8 bg-primary/30" />
                Perfil del comprador
              </h3>
              <div className="grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant">Asignación de capital</label>
                  <p className="text-xl serif">{budgetLabel(lead)}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant">Barrios objetivo</label>
                  <p className="text-xl serif">{lead.profile?.preferredZones.join(", ") || "No definido"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant">Tipología</label>
                  <p className="text-xl serif text-primary/80">
                    {lead.profile?.propertyType ? displayPropertyType(lead.profile.propertyType) : "Portafolio mixto"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant">Horizonte temporal</label>
                  <p className="text-xl serif">
                    {lead.profile?.timelineMonths != null
                      ? `${lead.profile.timelineMonths} ${lead.profile.timelineMonths === 1 ? "mes" : "meses"}`
                      : "Inmediato"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant">Estado financiero</label>
                  <p className="flex items-center gap-2 text-xl serif">
                    <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                    {lead.profile?.financingMode ? displayFinancingMode(lead.profile.financingMode) : "Preaprobado"}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-8 flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] text-on-surface-variant">
                <span className="h-px w-8 bg-primary/30" />
                Registro de comunicación
              </h3>
              <div className="ml-2 border-l border-outline-variant/20">
                {log.length ? (
                  log.map((message, index) => (
                    <div className={`${index === log.length - 1 ? "" : "pb-10"} relative pl-10`} key={message.id}>
                      <div className={`absolute left-[-5px] top-0 h-[9px] w-[9px] rounded-full ${index === 0 ? "bg-primary" : "bg-outline-variant"}`} />
                      <div className="mb-2 flex items-start justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                          {displayMessageDirection(message.direction)} · {formatDateTime(message.sentAt)}
                        </span>
                      </div>
                      <div className={`${index === 0 ? "bg-surface-container-low" : "bg-surface-container-lowest shadow-[0_2px_10px_rgba(49,51,48,0.02)]"} rounded-lg p-5`}>
                        <p className={`${index === 0 ? "italic text-on-surface/80" : ""} text-sm leading-relaxed`}>
                          {message.body}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="pl-10">
                    <p className="text-sm text-on-surface-variant">Todavía no hay mensajes en el registro.</p>
                  </div>
                )}
              </div>
            </section>

            {lead.metaReply ? (
              <section className="max-w-xl">
                <MetaOutboundComposer leadId={lead.id} metaReply={lead.metaReply} />
              </section>
            ) : null}

            <section>
              <h3 className="mb-8 flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] text-on-surface-variant">
                <span className="h-px w-8 bg-primary/30" />
                Señales de interacción
              </h3>
              <div className="space-y-4">
                {(signals.length ? signals : [null, null]).map((recommendation, index) => (
                  <div className="flex items-center justify-between border-b border-outline-variant/10 py-4" key={recommendation?.id ?? `signal-${index}`}>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 overflow-hidden bg-surface-container">
                        <img alt="" className="h-full w-full object-cover" src={dossierImages[index]} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{recommendation?.title ?? `Señal de actividad ${index + 1}`}</p>
                        <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                          {recommendation
                            ? `${recommendation.neighborhood} · Encaje ${recommendation.fitScore}%`
                            : "Actualización de seguimiento"}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${recommendation && recommendation.fitScore >= 85 ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-on-surface-variant"}`}>
                      {recommendation && recommendation.fitScore >= 85 ? "Alta interacción" : "Pasivo"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8 lg:col-span-5">
            <div className="relative overflow-hidden bg-surface-container p-8 sm:p-10">
              <div className="absolute right-0 top-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'wght' 100" }}>
                  neurology
                </span>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Inteligencia predictiva</p>
                <h4 className="text-3xl leading-snug serif">{aiNarrative(lead)}</h4>
              </div>
              <div className="mt-6 space-y-6">
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-widest text-on-surface-variant">La lógica</p>
                  <p className="text-sm leading-relaxed text-on-surface/80">{aiLogic(lead)}</p>
                </div>
                <div className="border-l-2 border-primary bg-surface-container-lowest p-6">
                  <p className="mb-2 text-[10px] uppercase tracking-widest text-on-surface-variant">Acción sugerida</p>
                  <p className="mb-4 text-sm font-medium">
                    {lead.nextAction?.title ?? "Coordinar visita privada para mañana a la mañana."}
                  </p>
                  <button className="flex items-center gap-2 text-xs font-medium text-primary transition-all hover:gap-3" type="button">
                    Enviar invitación ahora <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-error-container/10 p-6">
              <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                warning
              </span>
              <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.1em] text-error">Insight de riesgo urgente</p>
                <p className="text-xs leading-relaxed text-on-surface/80">{riskText}</p>
              </div>
            </div>

            <section>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Matches sugeridos</h3>
                <Link className="border-b border-primary/20 text-[10px] uppercase tracking-widest text-primary" href={`/properties?agencyId=${agencyId}`}>
                  Ver portafolio
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {(matches.length ? matches : [null, null]).slice(0, 2).map((match, index) => (
                  <div className="space-y-3" key={match?.id ?? `match-${index}`}>
                    <div className="group aspect-[4/5] cursor-pointer overflow-hidden bg-surface-container">
                      <img alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={dossierImages[index + 2]} />
                    </div>
                    <div>
                      <p className="text-xs font-medium">{match?.title ?? `Match curado ${index + 1}`}</p>
                      <p className="mb-2 text-[10px] uppercase text-on-surface-variant">{match?.neighborhood ?? "Zona premium"}</p>
                      <p className="text-[9px] italic leading-tight text-primary">
                        {match?.reasons?.[0] ?? "Alineado con preferencias arquitectónicas y timing del comprador."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-t-4 border-secondary/10 bg-surface-container-low p-8">
              <h3 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Mensaje generado</h3>
              <div className="space-y-6">
                <div className="rounded bg-background p-6 text-sm italic leading-relaxed text-on-surface/90 serif">
                  &quot;{generatedOutreach(lead)}&quot;
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <button className="border-b border-outline-variant text-[10px] font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:text-on-surface" type="button">
                      Editar
                    </button>
                    <button className="border-b border-outline-variant text-[10px] font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:text-on-surface" type="button">
                      Personalizar
                    </button>
                  </div>
                  <Link
                    className="bg-primary px-5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-on-primary hover:opacity-90"
                    href={`https://wa.me/5491159570977?text=${encodeURIComponent(generatedOutreach(lead))}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Enviar por WhatsApp
                  </Link>
                </div>
              </div>
            </section>
          </aside>
        </div>

        <AestheteFooter className="lg:ml-0" variant="atelier" />
      </div>
    </main>
  );
}
