import { AestheteFooter } from "@/components/layout/AestheteFooter";
import { AestheteSidebar } from "@/components/layout/AestheteSidebar";
import { AestheteTopBar } from "@/components/layout/AestheteTopBar";

interface PropertyAdvisorIntelligenceViewProps {
  agencyId: string;
}

type PropertyCardModel = {
  title: string;
  zone: string;
  price: string;
  score: string;
  image: string;
  imageAlt: string;
  details: [string, string, string];
  icons: [string, string, string];
};

const featuredProperties: PropertyCardModel[] = [
  {
    title: "Villa L'Orizzonte",
    zone: "Mondello, Palermo",
    price: "€5,400,000",
    score: "94%",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAnhJUqStT64ovmJ4Sz82tWN1290ibxGpM1FduxAOAps7qlIQCtEdT2KQwv3kAXmtneVNy8OnuBD_B-VhlxfPDbJgalWXze-LtkZHHKs1aseAT6OHojfoSK4xN8hHYolr9XzALgUlklzZTdSN69onBp_N-POtOzAyBEViMQXo8Wkr7At-2zvILbKYEqyWmi6xNkgMlKNybdTAXyYRkmzk6wEz1waW5KQyBI5nijbF03nknVVq6SVeIkr5D8L8NlJ1N99v6PyTwe9u_d",
    imageAlt:
      "Villa arquitectónica moderna con vidrios de piso a techo, líneas de hormigón limpio y vegetación mediterránea.",
    details: ["5 dormitorios", "620 m²", "Piscina infinita"],
    icons: ["bed", "straighten", "pool"]
  },
  {
    title: "Penthouse Renaissance",
    zone: "Palazzo District, Palermo",
    price: "€4,850,000",
    score: "89%",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBU2gtuWHUWPZwKUvPZx-CqVCZFAtKp3rQEODIqxy4LqShwvN1NZeWK1FH5OEAhAlXml70sOpLQ3e3BXwV2rthMVNe1dm1b-0BS2maHbk8iXKjxJTcmzp3FpNnpM4zKwu7XckwMitA51dzBt5ECPPnT3BdiabN1513gE24fg9Mv4UuBud7Y2LlsddZMwjdvKUtksXBJI5K77rQ2SQFELHCAVWZDaO9YuVQsBYpn3ITFRTQYgjB0ZAlBvcLZAp3WkGYlw0bILmLH3-_q",
    imageAlt:
      "Departamento palaciego histórico con frescos en el techo, ventanas altas en arco y mobiliario de lujo minimalista.",
    details: ["4 dormitorios", "440 m²", "Terraza"],
    icons: ["bed", "straighten", "deck"]
  }
];

const relatedInsights = [
  { label: "Tendencia de mercado", value: "+4.2%" },
  { label: "Interés local", value: "Medio" },
  { label: "Riesgo regulatorio", value: "Bajo" }
];

function BuyerProfileCard() {
  return (
    <article className="rounded-lg bg-[#f5f3f0] p-6 sm:p-8">
      <h3 className="text-2xl text-on-surface">Valeria Di Rossy</h3>
      <p className="mb-6 mt-1 text-[10px] uppercase tracking-[0.1em] text-outline">Portafolio de ultra alto patrimonio</p>

      <div className="space-y-6">
        <div>
          <span className="mb-1 block text-[9px] uppercase tracking-[0.15em] text-primary">Asignación de presupuesto</span>
          <p className="text-lg serif">€4.5M — €6.2M</p>
        </div>

        <div>
          <span className="mb-1 block text-[9px] uppercase tracking-[0.15em] text-primary">Barrios preferidos</span>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-[10px] uppercase tracking-wider">Palermo</span>
            <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-[10px] uppercase tracking-wider">Mondello</span>
          </div>
        </div>

        <div>
          <span className="mb-1 block text-[9px] uppercase tracking-[0.15em] text-primary">Tipo de propiedad</span>
          <p className="text-base serif">Villa histórica, penthouse</p>
        </div>

        <div>
          <span className="mb-1 block text-[9px] uppercase tracking-[0.15em] text-primary">Horizonte temporal</span>
          <p className="text-base serif">Adquisición Q3 2024</p>
        </div>

        <div className="border-t border-stone-200 pt-4">
          <span className="mb-2 block text-[9px] uppercase tracking-[0.15em] text-primary">Estado financiero</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-[11px] font-medium uppercase tracking-widest">Liquidez verificada</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function FeaturedPropertyCard({ card }: { card: PropertyCardModel }) {
  return (
    <article className="group overflow-hidden rounded-xl bg-surface-container-lowest transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
      <div className="relative h-64 overflow-hidden sm:h-72 lg:h-80">
        <img alt={card.imageAlt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={card.image} />
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <div className="rounded-lg bg-white/90 px-4 py-3 text-center shadow-sm backdrop-blur">
            <span className="block text-[9px] font-bold uppercase tracking-[0.1em] text-primary">Score de match</span>
            <span className="block text-3xl serif text-on-surface">{card.score}</span>
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
            <div className="flex items-center gap-2" key={`${card.title}-${detail}`}>
              <span className="material-symbols-outlined text-stone-400">{card.icons[index]}</span>
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function AdvisorPanel() {
  return (
    <div className="space-y-8 rounded-lg border border-primary/10 bg-[#efeeea] p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          auto_awesome
        </span>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface">Insight del asesor IA</h3>
      </div>

      <div>
        <h4 className="mb-2 text-lg serif text-on-surface">Afinidad arquitectónica</h4>
        <p className="text-[13px] leading-relaxed font-light text-on-surface-variant">
          &quot;Villa L&apos;Orizzonte&quot; se alinea con la preferencia del cliente por estructuras mediterráneas
          brutalistas. El rating de privacidad de este lote está dentro del top 2% de Mondello.
        </p>
      </div>

      <div className="rounded-lg bg-white p-6">
        <span className="mb-1 block text-[9px] uppercase tracking-[0.15em] text-outline">Probabilidad de visita</span>
        <div className="flex items-end gap-2">
          <span className="text-4xl serif text-on-surface">88%</span>
          <span className="mb-1 text-[10px] font-medium text-primary">Muy alta</span>
        </div>
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-stone-100">
          <div className="h-full w-[88%] bg-primary" />
        </div>
      </div>

      <div className="rounded-lg border-l-4 border-primary bg-primary-container p-6">
        <div className="mb-2 flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-sm">schedule</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Timing sugerido</span>
        </div>
        <p className="text-base serif text-on-primary-container">Recomendar dentro de 24h</p>
        <p className="mt-2 text-[11px] italic text-on-primary-container/80">
          Publicación off-market con 3 consultas privadas concurrentes.
        </p>
      </div>

      <button className="w-full rounded-lg bg-on-background px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-surface transition-colors hover:bg-primary">
        Generar pitch a medida
      </button>
    </div>
  );
}

function RelatedIntelligenceCard() {
  return (
    <div className="rounded-lg border border-stone-200 p-6 sm:p-8">
      <span className="mb-4 block text-[9px] uppercase tracking-[0.15em] text-outline">Inteligencia relacionada</span>
      <ul className="space-y-4">
        {relatedInsights.map((insight) => (
          <li className="flex items-center justify-between text-[12px]" key={insight.label}>
            <span className="text-on-surface-variant">{insight.label}</span>
            <span className="font-medium text-primary">{insight.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PropertyAdvisorIntelligenceView({ agencyId }: PropertyAdvisorIntelligenceViewProps) {
  return (
    <main className="aesthete-page min-h-screen bg-background text-on-background">
      <AestheteSidebar active="Propiedades" agencyId={agencyId} />

      <div className="min-h-screen lg:ml-64">
        <AestheteTopBar />

        <section className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
          <header className="mb-10 sm:mb-14 lg:mb-16">
            <h2 className="text-3xl italic tracking-tight text-on-surface sm:text-4xl">Tablero de inteligencia</h2>
            <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-primary">Motor curado de recomendaciones</p>
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            <section className="lg:col-span-3">
              <BuyerProfileCard />
            </section>

            <section className="space-y-8 sm:space-y-10 lg:col-span-6">
              {featuredProperties.map((property) => (
                <FeaturedPropertyCard card={property} key={property.title} />
              ))}
            </section>

            <aside className="space-y-6 lg:col-span-3 lg:space-y-8">
              <div className="lg:sticky lg:top-28 lg:space-y-8">
                <AdvisorPanel />
                <RelatedIntelligenceCard />
              </div>
            </aside>
          </div>
        </section>

        <AestheteFooter variant="editorial" className="mt-12 sm:mt-16 lg:mt-20" />
      </div>
    </main>
  );
}
