import { CreateDemoLeadsButton } from "@/components/leads/CreateDemoLeadsButton";
import { LeadDetailPanel } from "@/components/leads/LeadDetailPanel";
import { LeadsInboxList } from "@/components/leads/LeadsInboxList";
import { LeadSignalSidebar } from "@/components/layout/LeadSignalSidebar";
import { LeadSignalTopBar } from "@/components/layout/LeadSignalTopBar";
import { LeadSignalFooter } from "@/components/layout/LeadSignalFooter";
import type { AgencyOperator } from "@/lib/server/read-models/operators";
import type { LeadDetailModel, LeadInboxItem } from "@/lib/server/read-models/leads";

interface LeadsWorkspaceProps {
  inboxItems: LeadInboxItem[];
  selectedLeadId: string | null;
  leadDetail: LeadDetailModel | null;
  operators: AgencyOperator[];
}

export function LeadsWorkspace({ inboxItems, selectedLeadId, leadDetail, operators }: LeadsWorkspaceProps) {
  return (
    <main className="leadsignal-page min-h-screen overflow-x-hidden bg-[#fbf9f6] font-body text-[#313330] antialiased">
      <LeadSignalSidebar active="Leads" />

      <div className="min-h-screen min-w-0 lg:ml-64">
        <LeadSignalTopBar />

        <div className="flex min-h-[calc(100vh-72px)] min-w-0 overflow-hidden">
          <section className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden border-r border-transparent px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-dashed border-stone-200 bg-[#fafaf8] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-sm text-stone-600">
                ¿Probando el producto? Generá varios leads de ejemplo (WhatsApp, Instagram, formulario) en tu agencia.
              </p>
              <CreateDemoLeadsButton />
            </div>
            <LeadsInboxList items={inboxItems} selectedLeadId={selectedLeadId} />
            <div className="mt-8 xl:hidden">
              <LeadDetailPanel lead={leadDetail} operators={operators} />
            </div>
          </section>
          <aside className="hidden w-[420px] shrink-0 overflow-y-auto overflow-x-hidden bg-[#f5f3f0] p-10 xl:block">
            <LeadDetailPanel lead={leadDetail} operators={operators} />
          </aside>
        </div>
      </div>

      <LeadSignalFooter className="lg:ml-64" variant="editorial" />
    </main>
  );
}
