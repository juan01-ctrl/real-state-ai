import { PropertyAdvisorIntelligenceView } from "@/components/properties/PropertyAdvisorIntelligenceView";

interface PropertiesPageProps {
  searchParams: Promise<{ agencyId?: string }>;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const params = await searchParams;
  const agencyId = params.agencyId ?? "agency_demo_001";

  return <PropertyAdvisorIntelligenceView agencyId={agencyId} />;
}
