import { LeadsWorkspace } from "@/components/leads/LeadsWorkspace";
import { requireSessionContext } from "@/lib/server/auth-session";
import { getLeadDetail, getLeadInboxItems } from "@/lib/server/read-models/leads";
import { getAgencyOperators } from "@/lib/server/read-models/operators";

interface LeadsPageProps {
  searchParams: Promise<{
    leadId?: string;
  }>;
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = await searchParams;
  const { agencyId } = await requireSessionContext({ redirectTo: "/sign-in" });

  const [inboxItems, operators] = await Promise.all([getLeadInboxItems(agencyId), getAgencyOperators(agencyId)]);
  const selectedLeadId = inboxItems.some((item) => item.id === params.leadId)
    ? (params.leadId ?? null)
    : (inboxItems[0]?.id ?? null);
  const leadDetail = selectedLeadId ? await getLeadDetail(selectedLeadId, agencyId) : null;

  return (
    <LeadsWorkspace
      inboxItems={inboxItems}
      leadDetail={leadDetail}
      operators={operators}
      selectedLeadId={selectedLeadId}
    />
  );
}
