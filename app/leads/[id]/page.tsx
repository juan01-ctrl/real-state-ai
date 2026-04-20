import { LeadIntelligenceDossierView } from "@/components/leads/LeadIntelligenceDossierView";
import { requireSessionContext } from "@/lib/server/auth-session";
import { getLeadDetail } from "@/lib/server/read-models/leads";
import { getAgencyOperators } from "@/lib/server/read-models/operators";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const [{ id }, { agencyId }] = await Promise.all([params, requireSessionContext({ redirectTo: "/sign-in" })]);
  const [leadDetail, operators] = await Promise.all([getLeadDetail(id, agencyId), getAgencyOperators(agencyId)]);

  return <LeadIntelligenceDossierView agencyId={agencyId} lead={leadDetail} operators={operators} />;
}
