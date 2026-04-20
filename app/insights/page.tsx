import { StrategicInsightsView } from "@/components/analytics/StrategicInsightsView";
import { getExecutiveAnalytics } from "@/lib/server/read-models/analytics";

interface InsightsPageProps {
  searchParams: Promise<{ agencyId?: string }>;
}

export default async function InsightsPage({ searchParams }: InsightsPageProps) {
  const params = await searchParams;
  const agencyId = params.agencyId ?? "agency_demo_001";
  const model = await getExecutiveAnalytics(agencyId);

  return <StrategicInsightsView agencyId={agencyId} model={model} />;
}
