import Link from "next/link";
import { AestheteSidebar } from "@/components/layout/AestheteSidebar";
import { AestheteTopBar } from "@/components/layout/AestheteTopBar";
import { AestheteFooter } from "@/components/layout/AestheteFooter";
import { ExecutiveAnalyticsModel } from "@/lib/server/read-models/analytics";
import { displayChannel } from "@/lib/i18n/present";

interface StrategicInsightsViewProps {
  agencyId: string;
  model: ExecutiveAnalyticsModel;
}

function compactMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function estimateMissedCommission(model: ExecutiveAnalyticsModel) {
  const lostHighIntent = Math.max(model.headline.staleHighIntentLeads, model.riskQueue.length);
  const estimatedDealValue = 250000;
  const commissionRate = 0.03;
  return lostHighIntent * estimatedDealValue * commissionRate;
}

function buildLagLine(model: ExecutiveAnalyticsModel) {
  if (!model.riskQueue.length) {
    return "Timing estable vs. referencia de 20 min.";
  }

  const avgSilence =
    model.riskQueue.reduce((acc, item) => acc + item.silenceHours, 0) / model.riskQueue.length;
  const lagHours = Math.max(0.3, avgSilence / 4);
  return `Demora promedio: ${lagHours.toFixed(1)} h vs. referencia de 20 min.`;
}

export function StrategicInsightsView({ agencyId, model }: StrategicInsightsViewProps) {
  const topZone = model.zones[0]?.zone ?? "Palermo";
  const topChannel = model.channels[0];
  const secondChannel = model.channels[1];
  const thirdChannel = model.channels[2];
  const weakestChannel = model.channels[model.channels.length - 1];

  const highIntentLost = Math.max(model.headline.staleHighIntentLeads, model.riskQueue.length);
  const missedCommissions = estimateMissedCommission(model);
  const lagLine = buildLagLine(model);

  return (
    <main className="aesthete-page min-h-screen bg-[#fbf9f6] text-[#313330]">
      <AestheteSidebar active="Insights" agencyId={agencyId} />

      <div className="min-h-screen lg:ml-64">
        <AestheteTopBar />

        <div className="max-w-[1200px] px-4 py-10 sm:px-8 sm:py-12 lg:px-12">
          <section className="mb-16 sm:mb-20 lg:mb-24">
            <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Alerta de rendimiento prioritaria</p>
            <h1 className="max-w-4xl text-4xl font-light leading-[1.1] tracking-tight text-[#313330] sm:text-5xl md:text-6xl" style={{ fontFamily: "'Noto Serif', serif" }}>
              Estás perdiendo a tus compradores más fuertes porque{" "}
              <span className="font-normal italic">el follow-up llega demasiado tarde.</span>
            </h1>
          </section>

          <section className="mb-16 grid grid-cols-1 items-center gap-10 sm:mb-20 sm:gap-12 lg:mb-24 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-5">
              <div className="space-y-2">
                <span className="block text-7xl font-light text-[#707A65]" style={{ fontFamily: "'Noto Serif', serif" }}>
                  {highIntentLost}
                </span>
                <p className="text-sm font-medium uppercase tracking-wide text-[#5e5f5c]">Leads de alta intención perdidos</p>
              </div>
              <div className="h-px w-24 bg-[#58624e]/20" />
              <div className="space-y-1">
                <span className="block text-4xl font-light text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
                  {compactMoney(missedCommissions)}
                </span>
                <p className="text-xs uppercase tracking-wider text-[#5e5f5c]">Comisiones estimadas no capturadas</p>
              </div>
            </div>

            <div className="relative flex h-[300px] items-center justify-center overflow-hidden rounded-xl bg-[#f5f3f0] sm:h-[360px] lg:col-span-7 lg:h-[400px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(88,98,78,0.18),_transparent_65%)] opacity-50" />
              <div className="relative flex h-full w-full items-end justify-around px-8 pb-12">
                <div className="h-[60%] w-16 cursor-help rounded-t-full bg-[#e3e3de] transition-all hover:h-[65%]" title="Oportunidad activa" />
                <div className="relative h-[85%] w-16 rounded-t-full bg-[#58624e]/40">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-lg italic" style={{ fontFamily: "'Noto Serif', serif" }}>
                    La brecha
                  </div>
                </div>
                <div className="h-[40%] w-16 rounded-t-full bg-[#e3e3de]" />
                <div className="h-[55%] w-16 rounded-t-full bg-[#e3e3de]" />
              </div>
            </div>
          </section>

          <section className="mb-16 sm:mb-20 lg:mb-24">
            <h3 className="mb-12 border-b border-[#e9e8e4] pb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#5e5f5c]">
              Puntos críticos de fricción
            </h3>
            <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
              <div className="space-y-4">
                <h4 className="text-xl text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
                  Tiempo de respuesta demasiado lento
                </h4>
                <p className="text-sm font-light leading-relaxed text-[#5e5f5c]">
                  {lagLine} Los clientes de mayor ticket se desconectan tras 45 minutos sin respuesta.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-xl text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
                  Propiedad equivocada recomendada
                </h4>
                <p className="text-sm font-light leading-relaxed text-[#5e5f5c]">
                  Una tasa calificada del {model.headline.qualifiedRate.toFixed(1)}% sugiere que la lógica de matching
                  actual no prioriza la urgencia con la precisión necesaria.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-xl text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
                  Comprador sin nuevo contacto
                </h4>
                <p className="text-sm font-light leading-relaxed text-[#5e5f5c]">
                  {model.riskQueue.length} leads calificados sin actividad en el último ciclo. Representan valor
                  significativo de pipeline.
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 items-stretch gap-10 sm:gap-12 lg:grid-cols-2">
            <div className="space-y-8 rounded-xl bg-[#f5f3f0] p-7 sm:p-10">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5e5f5c]">Integridad por fuente</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Referidos</span>
                  <div className="mx-6 h-px flex-1 bg-[#58624e]/40" />
                  <span className="text-[#58624e]" style={{ fontFamily: "'Noto Serif', serif" }}>
                    Élite
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#5e5f5c]">{topChannel ? displayChannel(topChannel.channel) : "WhatsApp"}</span>
                  <div className="mx-6 h-px flex-1 bg-[#e3e3de]" />
                  <span className="text-xs uppercase tracking-widest text-[#5e5f5c]">Alta</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#5e5f5c]">{secondChannel ? displayChannel(secondChannel.channel) : "Instagram"}</span>
                  <div className="mx-6 h-px flex-1 bg-[#e3e3de]" />
                  <span className="text-xs uppercase tracking-widest text-[#5e5f5c]">Media</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#5e5f5c]">{thirdChannel ? displayChannel(thirdChannel.channel) : "Portales"}</span>
                  <div className="mx-6 h-px flex-1 bg-[#e3e3de]" />
                  <span className="text-xs uppercase tracking-widest text-[#5e5f5c]">Volátil</span>
                </div>
                {weakestChannel ? (
                  <p className="pt-2 text-[11px] uppercase tracking-[0.14em] text-[#5e5f5c]">
                    Menor integridad: {displayChannel(weakestChannel.channel)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-[#313330] p-7 text-[#fbf9f6] sm:p-10">
              <img
                alt="Visual del barrio"
                className="absolute inset-0 h-full w-full object-cover opacity-20"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVialbTxB4JPBG1kGhrQarNLNIi9XtjZSxCTbhTip415j3IXO0XVg0Vqz_fSYhNbsbPnla4W3DZe-oioStPbW3iUGvCOVpwUbuj3ItqDb1AplphYgyS_z-5sJn8Mz8BrojEHHp3aVgaEZ3jG3knSq2d5lxPdgx4X91OS0NSDmdwnCl1x9tZm9oTfNgeiO6vuIIfUIrEGOKwASBFFREhM-PLs3Rh7KKANmHQmOGmy9Y4Y9lW6v5TEiqLA5PaULohfwcBBiCwihxEA3B"
              />
              <div className="relative">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#fbf9f6]/60">Inteligencia de ubicación</span>
                <h4 className="mt-4 max-w-xs text-3xl leading-snug" style={{ fontFamily: "'Noto Serif', serif" }}>
                  Eficiencia de mercado · {topZone}
                </h4>
              </div>
              <div className="relative mt-12">
                <p className="text-lg font-light leading-relaxed">
                  Quienes buscan en {topZone} convierten{" "}
                  <span className="font-normal italic text-[#dce6cd] underline underline-offset-4">2,3× más</span> cuando
                  el contacto ocurre en menos de 2 horas.
                </p>
              </div>
            </div>
          </section>
        </div>

        <AestheteFooter className="mt-20 sm:mt-24" variant="editorial" />
      </div>
    </main>
  );
}
