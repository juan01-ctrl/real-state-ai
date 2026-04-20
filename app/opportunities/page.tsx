import { StrategicOpportunitiesView } from "@/components/opportunities/StrategicOpportunitiesView";
import { requireSessionContext } from "@/lib/server/auth-session";
import { getOpportunitiesModel } from "@/lib/server/read-models/opportunities";

export default async function OpportunitiesPage() {
  const { agencyId } = await requireSessionContext({ redirectTo: "/sign-in" });
  const model = await getOpportunitiesModel(agencyId);

  return <StrategicOpportunitiesView agencyId={agencyId} model={model} />;
}
