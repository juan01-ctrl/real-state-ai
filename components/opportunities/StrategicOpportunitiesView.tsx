import Link from "next/link";
import { AestheteFooter } from "@/components/layout/AestheteFooter";
import { AestheteSidebar } from "@/components/layout/AestheteSidebar";
import { AestheteTopBar } from "@/components/layout/AestheteTopBar";
import type { OpportunitiesModel } from "@/lib/server/read-models/opportunities";

interface StrategicOpportunitiesViewProps {
  agencyId: string;
  model: OpportunitiesModel;
}

function OpportunityCard({
  item,
  agencyId
}: {
  item: OpportunitiesModel["opportunities"][number];
  agencyId: string;
}) {
  return (
    <article className="group border-b border-on-surface/5 bg-surface-container-lowest p-6 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(49,51,48,0.03)] sm:p-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div className="flex gap-5 sm:gap-8">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center bg-surface-container sm:h-16 sm:w-16">
            <span className="material-symbols-outlined scale-125 text-primary">{item.icon}</span>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl serif">{item.name}</h3>
              <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-primary">
                {item.closeProbability}% probabilidad de cierre
              </p>
            </div>
            <div className="grid grid-cols-1 gap-x-12 gap-y-2 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface/40">Interés</p>
                <p className="text-sm font-medium">{item.interest}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface/40">Etapa</p>
                <p className="text-sm font-medium">{item.stage}</p>
              </div>
            </div>
            <div className="max-w-md bg-surface-container-low p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                <p className="text-[9px] uppercase tracking-[0.1em] text-on-surface/60">Contexto IA</p>
              </div>
              <p className="text-sm italic text-on-surface/80">{item.aiContext}</p>
            </div>
          </div>
        </div>
        <div className="flex min-w-[170px] flex-row items-end justify-between gap-4 lg:flex-col lg:items-end lg:gap-5">
          <span className="text-2xl serif">{item.value}</span>
          <Link
            className="border-b border-primary/20 pb-1 text-[10px] uppercase tracking-[0.1em] text-primary transition-all hover:border-primary"
            href={`/leads/${item.id}?agencyId=${agencyId}`}
          >
            {item.actionLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}

function PipelineVelocity({ pipeline }: { pipeline: OpportunitiesModel["pipeline"] }) {
  return (
    <section className="pt-10">
      <p className="mb-8 text-[10px] uppercase tracking-[0.1em] text-on-surface/40">Velocidad del pipeline</p>
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-5 sm:gap-4">
        {pipeline.map((stage, index) => {
          const ringClass = stage.active ? "h-3 w-3 bg-primary ring-4 ring-primary-container" : "h-2 w-2 bg-on-surface/10";
          const textClass = stage.active ? "text-primary" : "";
          const labelClass = stage.active ? "text-primary font-bold" : "";

          return (
            <div className="flex flex-col items-center space-y-3 text-center" key={`${stage.label}-${index}`}>
              <div className={`rounded-full ${ringClass}`} />
              <p className={`text-[9px] uppercase tracking-[0.1em] ${labelClass}`}>{stage.label}</p>
              <p className={`text-xl serif ${textClass}`}>{stage.value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function IntelligencePanel({ agencyId, model }: { agencyId: string; model: OpportunitiesModel }) {
  return (
    <aside className="space-y-10">
      <div className="space-y-10 bg-surface-container p-6 sm:p-8">
        {model.attention ? (
          <div>
            <p className="mb-6 text-[10px] uppercase tracking-[0.1em] text-on-surface/40">{model.attention.title}</p>

            <div className="mb-10 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-error" />
                <p className="text-[9px] uppercase tracking-[0.1em] text-error">Riesgo alto</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-lg serif">{model.attention.name}</h4>
                <p className="text-xs text-on-surface/60">{model.attention.detail}</p>
              </div>
              <div className="flex items-end justify-between border-t border-on-surface/5 pt-3">
                <p className="text-[9px] uppercase tracking-[0.1em]">{model.attention.footerLabel}</p>
                <p className="text-sm serif">{model.attention.footerValue}</p>
              </div>
              <Link
                className="block text-center text-[10px] uppercase tracking-[0.1em] text-primary underline"
                href={`/leads/${model.attention.leadId}?agencyId=${agencyId}`}
              >
                Abrir ficha del lead
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-sm text-on-surface/60">No hay leads en silencio prolongado según las reglas actuales del tablero.</p>
        )}

        {model.bestNext ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <p className="text-[9px] uppercase tracking-[0.1em] text-primary">Mejor próxima acción (prioridad)</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-lg serif">{model.bestNext.name}</h4>
              <p className="text-xs text-on-surface/60">{model.bestNext.detail}</p>
            </div>
            <Link
              className="block w-full bg-on-surface py-3 text-center text-[9px] uppercase tracking-[0.1em] text-surface transition-all hover:bg-primary"
              href={`/leads/${model.bestNext.leadId}?agencyId=${agencyId}`}
            >
              Abrir lead
            </Link>
          </div>
        ) : null}

        <div className="border-t border-on-surface/5 pt-8">
          <p className="mb-6 text-[10px] uppercase tracking-[0.1em] text-on-surface/40">{model.pipelineBudgetLabel}</p>
          <div className="space-y-2">
            <p className="text-2xl tracking-tight serif">{model.pipelineBudgetValue}</p>
            <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface/40">Solo leads en visita o negociación con presupuesto declarado</p>
          </div>
        </div>
      </div>

      <Link
        className="flex h-48 w-full flex-col justify-end bg-gradient-to-t from-surface-container to-surface-container-high p-6 text-on-surface no-underline transition hover:opacity-95"
        href={`/properties?agencyId=${agencyId}`}
      >
        <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface/70">Inventario</p>
        <p className="mt-1 serif text-lg">Revisá propiedades cargadas</p>
      </Link>
    </aside>
  );
}

export function StrategicOpportunitiesView({ agencyId, model }: StrategicOpportunitiesViewProps) {
  return (
    <main className="aesthete-page min-h-screen bg-surface text-on-surface">
      <AestheteSidebar active="Oportunidades" agencyId={agencyId} />

      <div className="min-h-screen lg:ml-64">
        <AestheteTopBar agencyId={agencyId} />

        <div className="mx-auto flex max-w-[1600px] flex-col gap-10 px-4 py-8 sm:px-8 sm:py-10 lg:flex-row lg:gap-12 lg:px-12">
          <div className="flex-1 space-y-12">
            <section>
              <h2 className="max-w-2xl text-3xl leading-tight text-on-surface sm:text-4xl serif">{model.headline}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-on-surface/75">
                Esta vista es un <strong>lente sobre tu pipeline</strong>: no crea entidades aparte; las oportunidades son leads en etapas avanzadas.
                Para mover etapas y tareas, operá desde la{" "}
                <Link className="font-medium text-primary underline underline-offset-2" href={`/leads?agencyId=${agencyId}`}>
                  bandeja
                </Link>{" "}
                o la ficha de cada lead.
              </p>
            </section>

            <section className="space-y-0">
              {model.opportunities.length === 0 ? (
                <p className="text-sm text-on-surface/70">
                  Cuando tengas leads en <strong>Visita agendada</strong> u <strong>Oferta / negociación</strong>, van a aparecer acá
                  ordenados por probabilidad de cierre.
                </p>
              ) : (
                model.opportunities.map((item) => <OpportunityCard agencyId={agencyId} item={item} key={item.id} />)
              )}
            </section>

            <PipelineVelocity pipeline={model.pipeline} />
          </div>

          <div className="w-full lg:w-80">
            <IntelligencePanel agencyId={agencyId} model={model} />
          </div>
        </div>

        <AestheteFooter className="mt-10" variant="atelier" />
      </div>
    </main>
  );
}
