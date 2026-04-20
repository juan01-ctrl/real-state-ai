import { PropertyAdvisorIntelligenceView } from "@/components/properties/PropertyAdvisorIntelligenceView";
import { requireSessionContext } from "@/lib/server/auth-session";

export default async function PropertiesPage() {
  const { agencyId } = await requireSessionContext({ redirectTo: "/sign-in" });

  return <PropertyAdvisorIntelligenceView agencyId={agencyId} />;
}
