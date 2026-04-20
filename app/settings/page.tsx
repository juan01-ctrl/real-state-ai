import { AgencySettingsView } from "@/components/settings/AgencySettingsView";
import { requireSessionContext } from "@/lib/server/auth-session";
import { getExecutiveAnalytics } from "@/lib/server/read-models/analytics";
import { getChannelConnectionsForAgency } from "@/lib/server/read-models/channel-connections";
import { isMetaEncryptionConfigured } from "@/lib/server/meta-token-crypto";
import { getPublicAppOrigin } from "@/lib/server/public-app-url";

export default async function SettingsPage() {
  const { agencyId } = await requireSessionContext({ redirectTo: "/sign-in" });
  const [analytics, connections] = await Promise.all([
    getExecutiveAnalytics(agencyId),
    getChannelConnectionsForAgency(agencyId)
  ]);
  const origin = getPublicAppOrigin();

  return (
    <AgencySettingsView
      agencyId={agencyId}
      analytics={analytics}
      connections={connections}
      metaEncryptionConfigured={isMetaEncryptionConfigured()}
      metaSecretConfigured={Boolean(process.env.META_APP_SECRET?.trim())}
      metaVerifyConfigured={Boolean(process.env.META_WEBHOOK_VERIFY_TOKEN?.trim())}
      metaWebhookUrl={origin ? `${origin}/api/webhooks/meta` : ""}
    />
  );
}
