import { AestheteSidebar } from "@/components/layout/AestheteSidebar";
import { AestheteFooter } from "@/components/layout/AestheteFooter";
import { AestheteTopBar } from "@/components/layout/AestheteTopBar";
import { AiPreferencesEditor } from "@/components/settings/AiPreferencesEditor";
import { MetaChannelConnections } from "@/components/settings/MetaChannelConnections";
import { TeamMembersManager } from "@/components/settings/TeamMembersManager";
import { displayChannel } from "@/lib/i18n/present";
import type { AiMatchingMode, AiOutreachTone } from "@/lib/server/read-models/agency-settings";
import { ExecutiveAnalyticsModel } from "@/lib/server/read-models/analytics";
import type { ChannelConnectionListItem } from "@/lib/server/read-models/channel-connections";
import type { TeamMemberListItem } from "@/lib/server/read-models/team-members";

interface AgencySettingsViewProps {
  agencyId: string;
  analytics: ExecutiveAnalyticsModel;
  connections: ChannelConnectionListItem[];
  metaWebhookUrl: string;
  metaVerifyConfigured: boolean;
  metaSecretConfigured: boolean;
  metaEncryptionConfigured: boolean;
  aiSnapshotAt: string;
  aiUrgencyThreshold: number;
  aiMatchingMode: AiMatchingMode;
  aiOutreachTone: AiOutreachTone;
  teamMembers: TeamMemberListItem[];
  teamSnapshotAt: string;
}

export function AgencySettingsView({
  agencyId,
  analytics,
  connections,
  metaWebhookUrl,
  metaVerifyConfigured,
  metaSecretConfigured,
  metaEncryptionConfigured,
  aiSnapshotAt,
  aiUrgencyThreshold,
  aiMatchingMode,
  aiOutreachTone,
  teamMembers,
  teamSnapshotAt
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
        <AestheteTopBar agencyId={agencyId} />

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
                La operación está optimizada para WhatsApp e Instagram, con captura y actualización de leads en tiempo real.
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

          <TeamMembersManager initialDbNow={teamSnapshotAt} initialMembers={teamMembers} />

          <AiPreferencesEditor
            initialMatchingMode={aiMatchingMode}
            initialOutreachTone={aiOutreachTone}
            initialSnapshotAt={aiSnapshotAt}
            initialUrgencyThreshold={aiUrgencyThreshold}
          />
        </main>

        <AestheteFooter variant="atelier" />
      </div>
    </main>
  );
}
