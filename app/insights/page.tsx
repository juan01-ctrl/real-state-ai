import { StrategicInsightsView } from "@/components/analytics/StrategicInsightsView";
import { requireSessionContext } from "@/lib/server/auth-session";
import { getStrategicInsightsModel } from "@/lib/server/read-models/strategic-insights";

export default async function InsightsPage() {
  const { agencyId } = await requireSessionContext({ redirectTo: "/sign-in" });
  const insights = await getStrategicInsightsModel(agencyId);

  return <StrategicInsightsView agencyId={agencyId} insights={insights} />;
}
