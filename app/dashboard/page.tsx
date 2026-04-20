import { DashboardView } from "@/components/dashboard/DashboardView";
import { requireSessionContext } from "@/lib/server/auth-session";
import { getDashboardModel } from "@/lib/server/read-models/dashboard";

export default async function DashboardPage() {
  const { agencyId } = await requireSessionContext({ redirectTo: "/sign-in" });
  const model = await getDashboardModel(agencyId);
  return <DashboardView model={model} />;
}
