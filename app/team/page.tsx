import { TeamCommandCenterView } from "@/components/lead/TeamCommandCenterView";
import { getExecutiveAnalytics } from "@/lib/server/read-models/analytics";
import { getLeadInboxItems } from "@/lib/server/read-models/leads";

interface TeamCommandCenterPageProps {
  searchParams: Promise<{ agencyId?: string }>;
}

export default async function TeamCommandCenterPage({ searchParams }: TeamCommandCenterPageProps) {
  const params = await searchParams;
  const agencyId = params.agencyId ?? "agency_demo_001";

  const [leads, analytics] = await Promise.all([getLeadInboxItems(agencyId), getExecutiveAnalytics(agencyId)]);

  return <TeamCommandCenterView agencyId={agencyId} leads={leads} analytics={analytics} />;
}
