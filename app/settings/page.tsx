import { AgencySettingsView } from "@/components/settings/AgencySettingsView";
import { getExecutiveAnalytics } from "@/lib/server/read-models/analytics";

interface SettingsPageProps {
  searchParams: Promise<{ agencyId?: string }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const agencyId = params.agencyId ?? "agency_demo_001";
  const analytics = await getExecutiveAnalytics(agencyId);

  return <AgencySettingsView agencyId={agencyId} analytics={analytics} />;
}
