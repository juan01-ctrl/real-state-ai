import { AgencySettingsView } from "@/components/settings/AgencySettingsView";
import { requireSessionContext } from "@/lib/server/auth-session";
import { getExecutiveAnalytics } from "@/lib/server/read-models/analytics";

export default async function SettingsPage() {
  const { agencyId } = await requireSessionContext({ redirectTo: "/sign-in" });
  const analytics = await getExecutiveAnalytics(agencyId);

  return <AgencySettingsView agencyId={agencyId} analytics={analytics} />;
}
