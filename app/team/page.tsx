import { TeamCommandCenterView } from "@/components/lead/TeamCommandCenterView";
import { requirePermission } from "@/lib/server/auth-session";
import { getTeamCommandCenterModel } from "@/lib/server/read-models/team-command-center";

export default async function TeamCommandCenterPage() {
  const { agencyId } = await requirePermission("team.read", { redirectTo: "/sign-in" });
  const team = await getTeamCommandCenterModel(agencyId);

  return <TeamCommandCenterView team={team} />;
}
