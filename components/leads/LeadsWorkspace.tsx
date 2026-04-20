import { LeadDetailPanel } from "@/components/leads/LeadDetailPanel";
import { LeadsInboxList } from "@/components/leads/LeadsInboxList";
import { AestheteSidebar } from "@/components/layout/AestheteSidebar";
import { AestheteTopBar } from "@/components/layout/AestheteTopBar";
import { AestheteFooter } from "@/components/layout/AestheteFooter";
import type { AgencyOperator } from "@/lib/server/read-models/operators";
import type { LeadDetailModel, LeadInboxItem } from "@/lib/server/read-models/leads";

interface LeadsWorkspaceProps {
  agencyId: string;
  inboxItems: LeadInboxItem[];
  selectedLeadId: string | null;
  leadDetail: LeadDetailModel | null;
  operators: AgencyOperator[];
}

export function LeadsWorkspace({ agencyId, inboxItems, selectedLeadId, leadDetail, operators }: LeadsWorkspaceProps) {
  return (
    <main className="aesthete-page min-h-screen bg-[#fbf9f6] font-body text-[#313330] antialiased">
      <AestheteSidebar active="Leads" agencyId={agencyId} />

      <div className="min-h-screen lg:ml-64">
        <AestheteTopBar />

        <div className="flex min-h-[calc(100vh-72px)] overflow-hidden">
          <section className="flex-1 overflow-y-auto border-r border-transparent px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
            <LeadsInboxList items={inboxItems} agencyId={agencyId} selectedLeadId={selectedLeadId} />
            <div className="mt-8 xl:hidden">
              <LeadDetailPanel lead={leadDetail} operators={operators} />
            </div>
          </section>
          <aside className="hidden w-[420px] overflow-y-auto bg-[#f5f3f0] p-10 xl:block">
            <LeadDetailPanel lead={leadDetail} operators={operators} />
          </aside>
        </div>
      </div>

      <AestheteFooter className="lg:ml-64" variant="editorial" />
    </main>
  );
}
