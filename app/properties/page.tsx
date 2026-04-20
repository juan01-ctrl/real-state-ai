import { PropertyAdvisorIntelligenceView } from "@/components/properties/PropertyAdvisorIntelligenceView";
import { requireSessionContext } from "@/lib/server/auth-session";
import { getPropertiesPageModel } from "@/lib/server/read-models/properties-page";

export default async function PropertiesPage() {
  const { agencyId } = await requireSessionContext({ redirectTo: "/sign-in" });
  const model = await getPropertiesPageModel(agencyId);

  return <PropertyAdvisorIntelligenceView model={model} />;
}
