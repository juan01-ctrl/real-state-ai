import { TeamCommandCenterView } from "@/components/lead/TeamCommandCenterView";
import { requireSessionContext } from "@/lib/server/auth-session";
import { getTeamCommandCenterModel } from "@/lib/server/read-models/team-command-center";

export default async function TeamCommandCenterPage() {
  const { agencyId } = await requireSessionContext({ redirectTo: "/sign-in" });
  const team = await getTeamCommandCenterModel(agencyId);

  return <TeamCommandCenterView team={team} />;
}
