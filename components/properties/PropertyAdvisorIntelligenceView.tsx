import Link from "next/link";
import { AestheteFooter } from "@/components/layout/AestheteFooter";
import { AestheteSidebar } from "@/components/layout/AestheteSidebar";
import { AestheteTopBar } from "@/components/layout/AestheteTopBar";
import type { PropertiesPageModel } from "@/lib/server/read-models/properties-page";

interface PropertyAdvisorIntelligenceViewProps {
  agencyId: string;
  model: PropertiesPageModel;
}

function AgencyInventoryCard({ model }: { model: PropertiesPageModel }) {
  return (
    <article className="rounded-lg bg-[#f5f3f0] p-6 sm:p-8">
      <h3 className="text-2xl text-on-surface">Inventario de la agencia</h3>
      <p className="mb-6 mt-1 text-[10px] uppercase tracking-[0.1em] text-outline">{model.inventoryHeadline}</p>

      <p className="text-sm leading-relaxed text-on-surface-variant">{model.inventoryDetail}</p>

      <div className="mt-8 border-t border-stone-200 pt-6">
        <Link className="text-[11px] font-medium uppercase tracking-widest text-primary underline" href="/leads">
          Ir a la bandeja de leads
        </Link>
      </div>
    </article>
  );
}

function FeaturedPropertyCard({ card }: { card: PropertiesPageModel["properties"][number] }) {
  return (
    <article className="group overflow-hidden rounded-xl bg-surface-container-lowest transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
      <div className="relative h-64 overflow-hidden sm:h-72 lg:h-80">
        {card.imageUrl ? (
          <img alt={card.imageAlt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={card.imageUrl} />
        ) : (
          <div
            aria-hidden
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-200 via-stone-100 to-[#efeeea] text-4xl text-stone-400 serif"
          >
            {card.title.slice(0, 1)}
          </div>
        )}
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <div className="rounded-lg bg-white/90 px-4 py-3 text-center shadow-sm backdrop-blur">
            <span className="block text-[9px] font-bold uppercase tracking-[0.1em] text-primary">Match medio</span>
            <span className="block text-3xl serif text-on-surface">{card.scoreLabel}</span>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">{card.zone}</p>
            <h4 className="mt-1 text-2xl serif text-on-surface">{card.title}</h4>
          </div>
          <p className="text-2xl serif text-on-surface">{card.price}</p>
        </div>

        <div className="flex flex-col gap-4 border-t border-stone-100 pt-6 text-[11px] uppercase tracking-widest sm:flex-row sm:gap-8">
          {card.details.map((detail, index) => (
            <div className="flex items-center gap-2" key={`${card.id}-${detail}`}>
              <span className="material-symbols-outlined text-stone-400">{card.icons[index]}</span>
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function AdvisorPanel({ summary }: { summary: string | null }) {
  return (
    <div className="space-y-8 rounded-lg border border-primary/10 bg-[#efeeea] p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          auto_awesome
        </span>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface">Notas del inventario</h3>
      </div>

      <p className="text-[13px] leading-relaxed font-light text-on-surface-variant">
        {summary ??
          "Cargá propiedades con barrio, precio y tipo para que el motor de recomendaciones tenga material verificable."}
      </p>

      <div className="rounded-lg border-l-4 border-primary bg-primary-container p-6">
        <div className="mb-2 flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-sm">inventory_2</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Buena práctica</span>
        </div>
        <p className="text-base serif text-on-primary-container">Mantené precios y disponibilidad alineados con el CRM.</p>
      </div>
    </div>
  );
}

function RelatedIntelligenceCard({ rows }: { rows: PropertiesPageModel["relatedRows"] }) {
  return (
    <div className="rounded-lg border border-stone-200 p-6 sm:p-8">
      <span className="mb-4 block text-[9px] uppercase tracking-[0.15em] text-outline">Resumen</span>
      <ul className="space-y-4">
        {rows.map((insight) => (
          <li className="flex items-center justify-between text-[12px]" key={insight.label}>
            <span className="text-on-surface-variant">{insight.label}</span>
            <span className="font-medium text-primary">{insight.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PropertyAdvisorIntelligenceView({ agencyId, model }: PropertyAdvisorIntelligenceViewProps) {
  return (
    <main className="aesthete-page min-h-screen bg-background text-on-background">
      <AestheteSidebar active="Propiedades" agencyId={agencyId} />

      <div className="min-h-screen lg:ml-64">
        <AestheteTopBar />

        <section className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
          <header className="mb-10 sm:mb-14 lg:mb-16">
            <h2 className="text-3xl italic tracking-tight text-on-surface sm:text-4xl">Tablero de inventario</h2>
            <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-primary">Propiedades de tu agencia</p>
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            <section className="lg:col-span-3">
              <AgencyInventoryCard model={model} />
            </section>

            <section className="space-y-8 sm:space-y-10 lg:col-span-6">
              {model.properties.length === 0 ? (
                <p className="text-sm text-on-surface/80">
                  Todavía no hay propiedades cargadas. Sumá registros en la base para alimentar recomendaciones y reportes.
                </p>
              ) : (
                model.properties.map((property) => <FeaturedPropertyCard card={property} key={property.id} />)
              )}
            </section>

            <aside className="space-y-6 lg:col-span-3 lg:space-y-8">
              <div className="lg:sticky lg:top-28 lg:space-y-8">
                <AdvisorPanel summary={model.advisorSummary} />
                <RelatedIntelligenceCard rows={model.relatedRows} />
              </div>
            </aside>
          </div>
        </section>

        <AestheteFooter variant="editorial" className="mt-12 sm:mt-16 lg:mt-20" />
      </div>
    </main>
  );
}
