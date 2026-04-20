import { AgencySettingsView } from "@/components/settings/AgencySettingsView";
import { requirePermission } from "@/lib/server/auth-session";
import { getExecutiveAnalytics } from "@/lib/server/read-models/analytics";
import { getAgencyAiPreferences } from "@/lib/server/read-models/agency-settings";
import { getChannelConnectionsForAgency } from "@/lib/server/read-models/channel-connections";
import { getTeamMembersForAgency } from "@/lib/server/read-models/team-members";
import { isMetaEncryptionConfigured } from "@/lib/server/meta-token-crypto";
import { getPublicAppOrigin } from "@/lib/server/public-app-url";

export default async function SettingsPage() {
  const { agencyId } = await requirePermission("settings.read", { redirectTo: "/sign-in" });
  const [analytics, connections, teamMembers, aiPreferences] = await Promise.all([
    getExecutiveAnalytics(agencyId),
    getChannelConnectionsForAgency(agencyId),
    getTeamMembersForAgency(agencyId),
    getAgencyAiPreferences(agencyId)
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
      aiMatchingMode={aiPreferences.matchingMode}
      aiOutreachTone={aiPreferences.outreachTone}
      aiSnapshotAt={aiPreferences.snapshotAt}
      aiUrgencyThreshold={aiPreferences.urgencyThreshold}
      teamMembers={teamMembers.members}
      teamSnapshotAt={teamMembers.dbNow}
    />
  );
}
