import { StrategicOpportunitiesView } from "@/components/opportunities/StrategicOpportunitiesView";
import { requireSessionContext } from "@/lib/server/auth-session";

export default async function OpportunitiesPage() {
  const { agencyId } = await requireSessionContext({ redirectTo: "/sign-in" });

  return <StrategicOpportunitiesView agencyId={agencyId} />;
}
