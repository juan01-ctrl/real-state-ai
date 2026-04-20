import { LeadsWorkspace } from "@/components/leads/LeadsWorkspace";
import { getLeadDetail, getLeadInboxItems } from "@/lib/server/read-models/leads";

interface LeadsPageProps {
  searchParams: Promise<{
    agencyId?: string;
    leadId?: string;
  }>;
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = await searchParams;
  const agencyId = params.agencyId ?? "agency_demo_001";

  const inboxItems = await getLeadInboxItems(agencyId);
  const selectedLeadId = inboxItems.some((item) => item.id === params.leadId)
    ? (params.leadId ?? null)
    : (inboxItems[0]?.id ?? null);
  const leadDetail = selectedLeadId ? await getLeadDetail(selectedLeadId) : null;

  return <LeadsWorkspace agencyId={agencyId} inboxItems={inboxItems} leadDetail={leadDetail} selectedLeadId={selectedLeadId} />;
}
