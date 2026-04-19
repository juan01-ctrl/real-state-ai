import Link from "next/link";
import { CreateDemoLeadsButton } from "@/components/leads/CreateDemoLeadsButton";
import { LeadDetailPanel } from "@/components/leads/LeadDetailPanel";
import { LeadsInboxList } from "@/components/leads/LeadsInboxList";
import { getLeadDetail, getLeadInboxItems } from "@/lib/server/read-models/leads";
import styles from "./page.module.css";

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
  const selectedLeadId = params.leadId ?? inboxItems[0]?.id ?? null;
  const leadDetail = selectedLeadId ? await getLeadDetail(selectedLeadId) : null;

  return (
    <main className={styles.page}>
      <div className={styles.pageInner}>
        <header className={styles.topBar}>
          <div>
            <p className={styles.eyebrow}>INFRAESTRUCTURA DE VENTAS CON IA</p>
            <h1>Bandeja de leads y calificación</h1>
            <p className={styles.subtitle}>
              Priorizá a quién contactar ahora, entendé la calidad de la intención y ejecutá la próxima acción comercial.
            </p>
          </div>
          <div className={styles.topActions}>
            <Link href={`/analytics?agencyId=${agencyId}`} className={styles.refreshLink}>
              Analytics
            </Link>
            <CreateDemoLeadsButton agencyId={agencyId} />
            <Link href={`/leads?agencyId=${agencyId}`} className={styles.refreshLink}>
              Actualizar
            </Link>
          </div>
        </header>

        {inboxItems.length === 0 ? (
          <section className={styles.emptyState}>
            <h2>Aún no hay leads para esta agencia</h2>
            <p>
              Generá registros de demostración para probar priorización, perfil extraído, historial de conversación y próximas acciones.
            </p>
            <CreateDemoLeadsButton agencyId={agencyId} />
          </section>
        ) : (
          <section className={styles.layout}>
            <LeadsInboxList items={inboxItems} agencyId={agencyId} selectedLeadId={selectedLeadId} />
            <LeadDetailPanel lead={leadDetail} />
          </section>
        )}
      </div>
    </main>
  );
}
