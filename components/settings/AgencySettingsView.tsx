import { AestheteSidebar } from "@/components/layout/AestheteSidebar";
import { AestheteFooter } from "@/components/layout/AestheteFooter";
import { AestheteTopBar } from "@/components/layout/AestheteTopBar";
import { MetaChannelConnections } from "@/components/settings/MetaChannelConnections";
import { displayChannel } from "@/lib/i18n/present";
import { ExecutiveAnalyticsModel } from "@/lib/server/read-models/analytics";
import type { ChannelConnectionListItem } from "@/lib/server/read-models/channel-connections";

interface AgencySettingsViewProps {
  agencyId: string;
  analytics: ExecutiveAnalyticsModel;
  connections: ChannelConnectionListItem[];
  metaWebhookUrl: string;
  metaVerifyConfigured: boolean;
  metaSecretConfigured: boolean;
  metaEncryptionConfigured: boolean;
}

export function AgencySettingsView({
  agencyId,
  analytics,
  connections,
  metaWebhookUrl,
  metaVerifyConfigured,
  metaSecretConfigured,
  metaEncryptionConfigured
}: AgencySettingsViewProps) {
  const sourceCards =
    analytics.channels.length > 0
      ? analytics.channels.map((c) => ({
          label: displayChannel(c.channel),
          value: c.leadCount
        }))
      : [{ label: "Sin datos aún", value: 0 }];

  return (
    <main className="aesthete-page min-h-screen bg-[#fbf9f6] text-[#313330] antialiased">
      <AestheteSidebar active="Configuración" agencyId={agencyId} />

      <div className="min-h-screen lg:ml-64">
        <AestheteTopBar />

        <main className="mx-auto max-w-5xl space-y-20 px-4 py-10 sm:space-y-24 sm:px-8 sm:py-14 lg:space-y-32 lg:px-16 lg:py-24">
          <header className="space-y-4">
            <h2 className="text-4xl tracking-tight text-[#313330] sm:text-5xl md:text-6xl" style={{ fontFamily: "'Noto Serif', serif" }}>
              Configuración de la agencia
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-[#5e5f5c] sm:text-lg">
              Configurá tu atelier digital y los parámetros de inteligencia. El comportamiento de la agencia se modela a
              partir de estos ajustes.
            </p>
          </header>

          <section className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Comunicación</span>
              <h3 className="text-2xl text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
                WhatsApp e Instagram (Meta)
              </h3>
              <p className="max-w-2xl text-sm text-[#5e5f5c]">
                Registrá el ID que figura en el panel de Meta y el mismo callback URL en la app. Los mensajes de texto
                entrantes crean o actualizan leads en tu agencia ({agencyId}).
              </p>
            </div>
            <MetaChannelConnections
              encryptionConfigured={metaEncryptionConfigured}
              initialConnections={connections}
              secretConfigured={metaSecretConfigured}
              verifyConfigured={metaVerifyConfigured}
              webhookUrl={metaWebhookUrl}
            />
          </section>

          <section className="grid grid-cols-1 gap-14 sm:gap-20 md:grid-cols-2">
            <div className="space-y-4 rounded-lg border border-[#e9e8e4] bg-white p-6">
              <h4 className="text-sm font-medium text-[#313330]">Otros canales</h4>
              <p className="text-xs leading-relaxed text-[#5e5f5c]">
                Correo y teléfono como fuentes nativas siguen en roadmap; podés seguir cargando leads vía formulario web o
                API de ingesta.
              </p>
            </div>

            <div className="space-y-8">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Adquisición</span>
                <h3 className="text-2xl text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
                  Fuentes de leads (datos)
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {sourceCards.map((source) => (
                  <div
                    key={source.label}
                    className="flex h-28 flex-col justify-between bg-[#efeeea] p-4 transition-all hover:bg-[#e9e8e4] sm:h-32 sm:p-6"
                  >
                    <span className="text-[10px] uppercase tracking-widest text-[#313330]/60 sm:text-[11px]">{source.label}</span>
                    <p className="text-xl text-[#313330] sm:text-2xl" style={{ fontFamily: "'Noto Serif', serif" }}>
                      {source.value}{" "}
                      <span className="text-[12px] italic text-[#313330]/40" style={{ fontFamily: "Inter, sans-serif" }}>
                        leads
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="-mx-0 flex flex-col items-start gap-8 bg-[#f5f3f0] p-6 sm:gap-12 sm:p-10 md:-mx-12 md:flex-row md:p-12">
            <div className="space-y-4 md:w-1/3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Inventario</span>
              <h3 className="text-3xl text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
                Integración del feed de propiedades
              </h3>
              <p className="text-sm leading-relaxed text-[#5e5f5c]">
                Mantené el inventario actualizado. La sincronización corre automáticamente cada 15 minutos.
              </p>
            </div>
            <div className="flex w-full flex-col gap-5 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 md:w-2/3">
              <div className="flex items-center space-x-6">
                <div className="flex h-12 w-12 items-center justify-center bg-[#efeeea]">
                  <span className="material-symbols-outlined text-[#58624e]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    database
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">Feed principal: inventario global Elite</p>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#58624e]" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#58624e]">Sincronizando</span>
                  </div>
                </div>
              </div>
              <button className="text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-[#313330]/40 transition-colors hover:text-[#313330] sm:text-right">
                Forzar actualización
              </button>
            </div>
          </section>

          <section className="space-y-12">
            <div className="flex items-end justify-between border-b border-[#b2b2ae]/10 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#58624e]">Equipo de curaduría</span>
                <h3 className="text-3xl text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
                  Agentes activos
                </h3>
              </div>
              <button className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#58624e] underline decoration-[#58624e]/30 underline-offset-8">
                Agregar miembro
              </button>
            </div>
            <div className="divide-y divide-[#b2b2ae]/5">
              {[
                { name: "Julian Thorne", role: "Agente elite", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsApkYhYEu_WoUMMMBL0BFw-P6nV7rc0C3dhi5fVvMpBWkngln2g7UWI7vDflbIycU6RJKb8QzieRDZ7QEOc2Z94sV3PrBqYloKhr4N9PEDi4ubhPfgPrs11gQxYrjKasYyI56agpZASOL6KdSvXNq96PtszFcFVqIfL5pSQG-_pjpGhvaASXutH38BpqQHAdN1TkPiiKYZthoSCZJjlXHAdh-x3FCYQbk-u8rPfLjf0lIKVpAqIutdybuERyFGN1rfIpRRlfKKQeY" },
                { name: "Sienna Vance", role: "Administración", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWQ_Pjv69ZiFhonEgqI1yBzqUbkOXaEIMYn8B7bVPwQJsSXF6p1ihKUNNGX4ge6n9PmzL5KV4kIAHz-DtdAPIw6IObtghqACr5uedr8fr3EriS7byxX7FeZw4A0AxEnVH25pUPH7zgfTjoMiwWzhwqptFZm6FE789UbvOM9PpGRXsZTNu-FWGPXo27gf3n5UPFwsxJx_ofjW3eEkJJIiH61J7c042TTFnJnwOCceos463vHkZxvdVxidt2JPSikLmTFbxlhrYCraRc" },
                { name: "Adrian Locke", role: "Agente elite", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCL7xfS9IuuwkVm1foXhEfhf1N4lS5rmy6HxbVnYxprBeFcF7JG3q2MYLTqp0St3UYJksmE9qQbd4R8aQQKjlT6FDDK9gasFdD8ZvHwKA0qeBS4BIyR5NBpFPpn9JANU-2Sf2OrrCUiynME-kE1AA0ryxBr-T0G4I-6Pgm62KG7Uutl8DLICoANN_WgjKAOQOcFkcDLKDlyAhwTFK421QquKWSaYiT0_DvIS-YEbYs6dkMYJ94yZIhenWy8uiFbZwVAcOv-zKq__IAn" }
              ].map((agent) => (
                <div key={agent.name} className="flex items-center justify-between py-6 sm:py-8">
                  <div className="flex items-center space-x-6">
                    <img alt="Agente" className="h-14 w-14 object-cover grayscale brightness-110" src={agent.image} />
                    <div>
                      <h4 className="text-lg font-medium">{agent.name}</h4>
                      <p className="text-[11px] uppercase tracking-widest text-[#313330]/40">{agent.role}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined cursor-pointer text-[#313330]/20 transition-colors hover:text-[#313330]">more_vert</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-12 pb-16 sm:pb-24 lg:pb-32">
            <div className="border-l-8 border-[#58624e] bg-[#dce6cd]/30 p-6 sm:p-10 lg:p-12">
              <div className="max-w-2xl space-y-10">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#58624e]">Núcleo de inteligencia</span>
                  <h3 className="text-3xl italic text-[#313330]" style={{ fontFamily: "'Noto Serif', serif" }}>
                    Preferencias de IA
                  </h3>
                </div>
                <div className="space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-baseline justify-between">
                      <label className="text-[12px] font-semibold uppercase tracking-widest">Umbrales de urgencia</label>
                      <span className="text-[10px] font-medium text-[#58624e]">Prioridad al foco</span>
                    </div>
                    <div className="relative mt-2 h-px w-full bg-[#b2b2ae]/30">
                      <div className="absolute left-3/4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#58624e] ring-8 ring-[#58624e]/10" />
                    </div>
                    <p className="text-[11px] italic text-[#313330]/50">Define con qué rapidez la IA interactúa con leads de alto valor.</p>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[12px] font-semibold uppercase tracking-widest">Exigencia del matching</label>
                    <div className="flex flex-col gap-3 sm:flex-row sm:space-x-4 sm:gap-0">
                      <button className="flex-1 border border-[#58624e] py-4 text-[11px] font-semibold uppercase tracking-widest text-[#58624e]">
                        Conservador
                      </button>
                      <button className="flex-1 bg-[#efeeea] py-4 text-[11px] font-semibold uppercase tracking-widest text-[#313330]/40 transition-colors hover:bg-[#e9e8e4]">
                        Agresivo
                      </button>
                    </div>
                    <p className="text-[11px] italic text-[#313330]/50">
                      Un matching conservador muestra solo encajes arquitectónicos muy altos.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[12px] font-semibold uppercase tracking-widest">Tono del alcance automático</label>
                    <select className="w-full border-0 border-b border-[#b2b2ae] bg-transparent py-3 text-sm font-body transition-all focus:border-[#58624e] focus:ring-0">
                      <option>Sofisticado y reservado</option>
                      <option>Directo y profesional</option>
                      <option>Cálido y cercano</option>
                      <option>Técnico y preciso</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <AestheteFooter variant="atelier" />
      </div>
    </main>
  );
}
