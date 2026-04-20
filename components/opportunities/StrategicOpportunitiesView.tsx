import { AestheteFooter } from "@/components/layout/AestheteFooter";
import { AestheteSidebar } from "@/components/layout/AestheteSidebar";
import { AestheteTopBar } from "@/components/layout/AestheteTopBar";

type OpportunityItem = {
  name: string;
  closeProbability: number;
  interest: string;
  stage: string;
  aiContext: string;
  value: string;
  actionLabel: string;
  icon: string;
};

type PipelineStage = {
  label: string;
  value: number;
  active?: boolean;
};

interface StrategicOpportunitiesViewProps {
  agencyId: string;
}

const opportunities: OpportunityItem[] = [
  {
    name: "Julianne Vance",
    closeProbability: 82,
    interest: "Bel Air Penthouse",
    stage: "Negociando",
    aiContext: "Solicitó una segunda visita y tiene financiación aprobada.",
    value: "$14,500,000",
    actionLabel: "Enviar propuesta",
    icon: "real_estate_agent"
  },
  {
    name: "Alexander Thorne",
    closeProbability: 74,
    interest: "Sunset Ridge Estate",
    stage: "Calificado",
    aiContext: "Confirmó interés en las especificaciones de la cava.",
    value: "$8,200,000",
    actionLabel: "Agendar llamada",
    icon: "villa"
  }
];

const pipeline: PipelineStage[] = [
  { label: "Lead nuevo", value: 14 },
  { label: "Calificado", value: 9 },
  { label: "Visita agendada", value: 7, active: true },
  { label: "Negociando", value: 4 },
  { label: "Cierre próximo", value: 2 }
];

function OpportunityCard({ item }: { item: OpportunityItem }) {
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
          <button className="border-b border-primary/20 pb-1 text-[10px] uppercase tracking-[0.1em] text-primary transition-all hover:border-primary">
            {item.actionLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

function PipelineVelocity() {
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

function IntelligencePanel() {
  return (
    <aside className="space-y-10">
      <div className="space-y-10 bg-surface-container p-6 sm:p-8">
        <div>
          <p className="mb-6 text-[10px] uppercase tracking-[0.1em] text-on-surface/40">Necesita atención ahora</p>

          <div className="mb-10 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-error" />
              <p className="text-[9px] uppercase tracking-[0.1em] text-error">Riesgo alto</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-lg serif">Marcus Thorne</h4>
              <p className="text-xs text-on-surface/60">Sin seguimiento en 6h. Se recomienda contacto inmediato.</p>
            </div>
            <div className="flex items-end justify-between border-t border-on-surface/5 pt-3">
              <p className="text-[9px] uppercase tracking-[0.1em]">Valor esperado</p>
              <p className="text-sm serif">$4.2M</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <p className="text-[9px] uppercase tracking-[0.1em] text-primary">Mejor próxima acción</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-lg serif">Elena Rodríguez</h4>
              <p className="text-xs text-on-surface/60">Enviar dossier arquitectónico del proyecto Pacific Heights.</p>
            </div>
            <button className="w-full bg-on-surface py-3 text-[9px] uppercase tracking-[0.1em] text-surface transition-all hover:bg-primary">
              Ejecutar acción
            </button>
          </div>
        </div>

        <div className="border-t border-on-surface/5 pt-8">
          <p className="mb-6 text-[10px] uppercase tracking-[0.1em] text-on-surface/40">Proyección de ingresos</p>
          <div className="space-y-2">
            <p className="text-4xl tracking-tight serif">$32.8M</p>
            <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface/40">+12% vs último trimestre</p>
          </div>
          <div className="mt-8 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-on-surface/60">Contratos activos</span>
              <span>$18.5M</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface/60">Propuestas pendientes</span>
              <span>$14.3M</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative h-64 w-full overflow-hidden bg-surface-container">
        <img
          alt="Interior de una casa moderna de lujo con muros de travertino y sombras suaves."
          className="h-full w-full object-cover opacity-80 grayscale-[0.2]"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyG1kdNIFggKKcqGKzCsgHUfEerODqeYf4-Wn50jDM7ReM0TfwZLF45WY3ZK6-AcBdS8YJNAmcWJQ3uIzY1SO-Cs-DbNiPjRiW8qhAGQagl8GGHByhOGXCBwzsQ7fuFmUIKufvC2XgY7OOb4ktydHMkl2zowhHvFQJ3U94hUgvx1YZNHCaPgVLN4kV4b4u9hNpv4mLQakQ8ZeYL1R6umv9aayKs23Hjnf6ggcPGRc20z7d9Wcyr_jHte6PJDkl9Ru8_nzp1VfsbVX3"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface">Portafolio destacado</p>
          <p className="mt-1 text-white serif">Vogue Living: The Stone House</p>
        </div>
      </div>
    </aside>
  );
}

export function StrategicOpportunitiesView({ agencyId }: StrategicOpportunitiesViewProps) {
  return (
    <main className="aesthete-page min-h-screen bg-surface text-on-surface">
      <AestheteSidebar active="Oportunidades" agencyId={agencyId} />

      <div className="min-h-screen lg:ml-64">
        <AestheteTopBar />

        <div className="mx-auto flex max-w-[1600px] flex-col gap-10 px-4 py-8 sm:px-8 sm:py-10 lg:flex-row lg:gap-12 lg:px-12">
          <div className="flex-1 space-y-12">
            <section>
              <h2 className="max-w-2xl text-3xl leading-tight text-on-surface sm:text-4xl serif">
                7 oportunidades son las más propensas a cerrar esta semana.
              </h2>
            </section>

            <section className="space-y-0">
              {opportunities.map((item) => (
                <OpportunityCard item={item} key={item.name} />
              ))}
            </section>

            <PipelineVelocity />
          </div>

          <div className="w-full lg:w-80">
            <IntelligencePanel />
          </div>
        </div>

        <AestheteFooter className="mt-10" variant="atelier" />
      </div>
    </main>
  );
}
