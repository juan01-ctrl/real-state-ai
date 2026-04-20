import { redirect } from "next/navigation";
import { requireSessionContext } from "@/lib/server/auth-session";

export default async function AnalyticsRedirectPage() {
  const { agencyId } = await requireSessionContext({ redirectTo: "/sign-in" });
  redirect(`/insights?agencyId=${agencyId}`);
}
