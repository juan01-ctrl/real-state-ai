import { LeadIntelligenceDossierView } from "@/components/leads/LeadIntelligenceDossierView";
import { getLeadDetail } from "@/lib/server/read-models/leads";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ agencyId?: string }>;
}

export default async function LeadDetailPage({ params, searchParams }: LeadDetailPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const agencyId = query.agencyId ?? "agency_demo_001";
  const leadDetail = await getLeadDetail(id);

  return <LeadIntelligenceDossierView agencyId={agencyId} lead={leadDetail} />;
}
