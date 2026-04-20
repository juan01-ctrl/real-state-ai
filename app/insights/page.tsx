import { StrategicInsightsView } from "@/components/analytics/StrategicInsightsView";
import { requirePermission } from "@/lib/server/auth-session";
import { getStrategicInsightsModel } from "@/lib/server/read-models/strategic-insights";

export default async function InsightsPage() {
  const { agencyId } = await requirePermission("insights.read", { redirectTo: "/sign-in" });
  const insights = await getStrategicInsightsModel(agencyId);

  return <StrategicInsightsView insights={insights} />;
}
