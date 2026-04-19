import Link from "next/link";
import { CreateDemoLeadsButton } from "@/components/leads/CreateDemoLeadsButton";
import { LeadDetailPanel } from "@/components/leads/LeadDetailPanel";
import { LeadsInboxList } from "@/components/leads/LeadsInboxList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
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
          <SectionHeading
            eyebrow="INFRAESTRUCTURA DE VENTAS CON IA"
            title="Bandeja de leads y calificación"
            subtitle="Priorizá a quién contactar ahora, entendé la calidad de la intención y ejecutá la próxima acción comercial."
            className={styles.heading}
          />
          <div className={styles.topActions}>
            <Button asChild className={styles.refreshLink} variant="outline" size="sm">
              <Link href={`/analytics?agencyId=${agencyId}`}>Analítica</Link>
            </Button>
            <CreateDemoLeadsButton agencyId={agencyId} />
            <Button asChild className={styles.refreshLink} variant="outline" size="sm">
              <Link href={`/leads?agencyId=${agencyId}`}>Actualizar</Link>
            </Button>
          </div>
        </header>

        {inboxItems.length === 0 ? (
          <Card className={styles.emptyState}>
            <CardContent>
              <h2>Aún no hay leads para esta agencia</h2>
              <p>
                Generá registros de demostración para probar priorización, perfil extraído, historial de conversación y próximas acciones.
              </p>
              <CreateDemoLeadsButton agencyId={agencyId} />
            </CardContent>
          </Card>
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
