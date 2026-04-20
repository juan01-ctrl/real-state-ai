import Link from "next/link";
import { AestheteSidebar } from "@/components/layout/AestheteSidebar";
import { AestheteTopBar } from "@/components/layout/AestheteTopBar";
import { AestheteFooter } from "@/components/layout/AestheteFooter";

type PriorityLead = {
  name: string;
  urgency: string;
  score: string;
  action: string;
  tone: "low" | "mid" | "high";
};

type ActivityItem = {
  text: string;
  time: string;
  active?: boolean;
};

const priorityLeads: PriorityLead[] = [
  {
    name: "Valeria Di Rossy",
    urgency: "Alta urgencia",
    score: "82%",
    action: "Recomendar 2 propiedades en Palermo",
    tone: "low"
  },
  {
    name: "Dr. Elena Sterling",
    urgency: "Inmediato",
    score: "94%",
    action: "Acción: agendar visita para Penthouse Terrace",
    tone: "mid"
  },
  {
    name: "Julian Vane",
    urgency: "Urgencia media",
    score: "78%",
    action: "Acción: seguimiento sobre estado hipotecario",
    tone: "high"
  }
];

const activityItems: ActivityItem[] = [
  { text: "Lead calificado: Sara Jiménez", time: "Hace 2 horas", active: true },
  { text: "Propiedad recomendada: The Obsidian Heights", time: "Hace 4 horas" },
  { text: "Seguimiento enviado: Marcos G.", time: "Hace 6 horas" },
  { text: "Visita agendada: Penthouse Loft 4", time: "Ayer", active: true }
];

const kpis = [
  { label: "Visitas calificadas", value: "35%" },
  { label: "Probabilidad de cierre", value: "64%" },
  { label: "Primera respuesta", value: "12m" },
  { label: "Tasa de conversión", value: "8.4%", highlighted: true }
];

function MorningBriefing() {
  return (
    <section className="flex flex-col justify-between gap-6 border-b border-[#b2b2ae]/10 pb-10 md:flex-row md:items-end md:gap-8 md:pb-12">
      <div className="max-w-2xl">
        <span className="mb-4 block text-[11px] uppercase tracking-[0.1em] text-[#58624e]">Resumen de la mañana</span>
        <h1 className="text-3xl leading-tight text-[#313330] sm:text-4xl lg:text-5xl" style={{ fontFamily: "'Noto Serif', serif", letterSpacing: "0.04em" }}>
          3 compradores de alta intención necesitan atención hoy.
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-[#5e5f5c] sm:text-lg">
          La inteligencia detecta urgencia inmediata en tus carteras de Palermo y Heights. Una respuesta temprana
          podría aumentar la conversión un 22%.
        </p>
      </div>
      <button className="bg-[#58624e] px-6 py-3 text-[11px] uppercase tracking-[0.1em] text-[#f2fde3] transition-colors hover:bg-[#4d5643] sm:px-8 sm:py-4">
        Revisar oportunidades
      </button>
    </section>
  );
}

function PriorityIntelligence({ agencyId }: { agencyId: string }) {
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
        {priorityLeads.map((lead) => {
          const toneClass =
            lead.tone === "mid" ? "bg-[#efeeea]" : lead.tone === "high" ? "bg-[#f5f3f0]" : "bg-[#f5f3f0]";

          return (
            <div
              key={lead.name}
              className={`${toneClass} group cursor-pointer p-6 transition-all hover:bg-[#e9e8e4] sm:p-8`}
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
                  <p className="text-[10px] uppercase tracking-widest text-[#5e5f5c]">Ajuste</p>
                </div>
              </div>
              <div className="bg-[#ffffff] p-4">
                <p className="text-sm leading-snug text-[#313330]">{lead.action}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LossInsightAndActivity() {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <div className="relative overflow-hidden bg-[#f5f3f0] p-8 sm:p-10 lg:col-span-8 lg:p-12">
        <div className="relative z-10">
          <h2 className="mb-8 text-2xl sm:text-3xl" style={{ fontFamily: "'Noto Serif', serif", letterSpacing: "0.04em" }}>
            Perdiste 4 compradores probables esta semana.
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.1em] text-[#a73b21]">Respuesta lenta</p>
              <div className="mb-4 h-1 w-full bg-[#a73b21]/10">
                <div className="h-full w-3/4 bg-[#a73b21]"></div>
              </div>
              <p className="text-sm text-[#5e5f5c]">Demora promedio: 4,5 h por encima del parámetro de referencia.</p>
            </div>
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.1em] text-[#313330]">Propiedad incorrecta</p>
              <div className="mb-4 h-1 w-full bg-[#313330]/10">
                <div className="h-full w-1/4 bg-[#313330]"></div>
              </div>
              <p className="text-sm text-[#5e5f5c]">2 leads mencionaron desajuste en amenities.</p>
            </div>
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.1em] text-[#313330]">Sin seguimiento</p>
              <div className="mb-4 h-1 w-full bg-[#313330]/10">
                <div className="h-full w-1/2 bg-[#313330]"></div>
              </div>
              <p className="text-sm text-[#5e5f5c]">El período de inactividad superó las 72 horas.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 lg:col-span-4">
        <h2 className="text-[11px] uppercase tracking-[0.1em] text-[#5e5f5c]">Actividad reciente</h2>
        <div className="space-y-8">
          {activityItems.map((item) => (
            <div key={`${item.text}-${item.time}`} className="flex items-start gap-6">
              <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${item.active ? "bg-[#58624e]" : "bg-[#b2b2ae]"}`}></div>
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

function KpiStrip() {
  return (
    <section className="flex flex-col justify-between gap-10 bg-[#313330] p-8 text-[#fbf9f6] sm:p-10 md:flex-row md:gap-12">
      {kpis.map((kpi) => (
        <div className="space-y-1" key={kpi.label}>
          <p className="text-[11px] uppercase tracking-[0.1em] text-[#fbf9f6]/50">{kpi.label}</p>
          <p className={`text-3xl ${kpi.highlighted ? "text-[#dce6cd]" : ""}`} style={{ fontFamily: "'Noto Serif', serif" }}>
            {kpi.value}
          </p>
        </div>
      ))}
    </section>
  );
}

interface DashboardViewProps {
  agencyId: string;
}

export function DashboardView({ agencyId }: DashboardViewProps) {
  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#313330]" style={{ fontFamily: "Inter, sans-serif" }}>
      <AestheteSidebar active="Tablero" agencyId={agencyId} />
      <main className="min-h-screen lg:ml-64">
        <AestheteTopBar />
        <div className="mx-auto w-full max-w-7xl space-y-14 px-4 py-10 sm:space-y-16 sm:px-8 sm:py-12 lg:px-12">
          <MorningBriefing />
          <PriorityIntelligence agencyId={agencyId} />
          <LossInsightAndActivity />
          <KpiStrip />
        </div>
        <AestheteFooter variant="atelier" />
      </main>
    </div>
  );
}
