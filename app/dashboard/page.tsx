import { DashboardView } from "@/components/dashboard/DashboardView";
import { requireSessionContext } from "@/lib/server/auth-session";

export default async function DashboardPage() {
  const { agencyId } = await requireSessionContext({ redirectTo: "/sign-in" });
  return <DashboardView agencyId={agencyId} />;
}
