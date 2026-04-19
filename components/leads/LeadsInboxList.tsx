import Link from "next/link";
import { LeadInboxItem } from "@/lib/server/read-models/leads";
import { formatRelativeHours } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { displayLeadStage } from "@/lib/i18n/present";
import styles from "./leads-inbox-list.module.css";

interface LeadsInboxListProps {
  items: LeadInboxItem[];
  agencyId: string;
  selectedLeadId: string | null;
}

function buildJudgment(item: LeadInboxItem) {
  if (item.score >= 85) {
    return `Oportunidad con alta convicción: ${item.closeProbability}% de prob. de cierre y momentum claro hacia la visita.`;
  }

  if (item.score >= 70) {
    return `Lead prometedor con señales accionables de intención; hace falta ejecución ajustada para convertir.`;
  }

  return `Perfil de intención moderada o baja por ahora. Nutrir sin quemar capacidad de agentes en contacto intensivo.`;
}

function buildUrgencyLine(item: LeadInboxItem) {
  if (item.silenceHours == null) {
    return "Todavía no hay señal clara de silencio.";
  }

  if (item.silenceHours >= 24) {
    return `${formatRelativeHours(item.silenceHours)} sin actividad. El riesgo por demora en respuesta sube.`;
  }

  return `${formatRelativeHours(item.silenceHours)} sin actividad. El timing sigue siendo sano.`;
}

export function LeadsInboxList({ items, agencyId, selectedLeadId }: LeadsInboxListProps) {
  return (
    <Card className={styles.inbox}>
      <CardHeader className={styles.header}>
        <p className={styles.kicker}>Feed de oportunidades</p>
        <CardTitle>En qué enfocarse ahora</CardTitle>
      </CardHeader>
      <Separator />

      <CardContent className={styles.rows}>
        {items.map((item) => {
          const isActive = item.id === selectedLeadId;

          return (
            <Link
              key={item.id}
              className={`${styles.row} ${isActive ? styles.rowActive : ""}`}
              href={`/leads?agencyId=${agencyId}&leadId=${item.id}`}
            >
              <div className={styles.identityLine}>
                <h3>{item.fullName}</h3>
                <Badge variant="secondary" className={styles.stageBadge}>
                  {displayLeadStage(item.stage)}
                </Badge>
              </div>

              <p className={styles.judgment}>{buildJudgment(item)}</p>

              <p className={styles.moveLine}>
                <span>Mejor movimiento:</span>{" "}
                {item.recommendedNextAction?.title ?? "Definí la próxima acción manualmente"}
              </p>

              <p className={styles.urgency}>{buildUrgencyLine(item)}</p>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
