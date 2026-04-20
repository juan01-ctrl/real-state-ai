import { StrategicOpportunitiesView } from "@/components/opportunities/StrategicOpportunitiesView";

interface OpportunitiesPageProps {
  searchParams: Promise<{ agencyId?: string }>;
}

export default async function OpportunitiesPage({ searchParams }: OpportunitiesPageProps) {
  const params = await searchParams;
  const agencyId = params.agencyId ?? "agency_demo_001";

  return <StrategicOpportunitiesView agencyId={agencyId} />;
}
