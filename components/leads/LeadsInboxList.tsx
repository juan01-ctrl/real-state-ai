import Link from "next/link";
import { LeadInboxItem } from "@/lib/server/read-models/leads";
import { formatRelativeHours } from "@/lib/formatters";
import { displayChannel, displayLeadStage } from "@/lib/i18n/present";
import styles from "./leads-inbox-list.module.css";

interface LeadsInboxListProps {
  items: LeadInboxItem[];
  agencyId: string;
  selectedLeadId: string | null;
}

function badgeClass(priority: string) {
  if (priority === "P1") return styles.badgeP1;
  if (priority === "P2") return styles.badgeP2;
  return styles.badgeP3;
}

export function LeadsInboxList({ items, agencyId, selectedLeadId }: LeadsInboxListProps) {
  return (
    <section className={styles.inbox}>
      <header className={styles.header}>
        <h2>Bandeja de leads</h2>
        <p>{items.length} leads ordenados por prioridad, score y actividad reciente.</p>
      </header>

      <div className={styles.rows}>
        {items.map((item) => {
          const isActive = item.id === selectedLeadId;
          return (
            <Link
              key={item.id}
              className={`${styles.row} ${isActive ? styles.rowActive : ""}`}
              href={`/leads?agencyId=${agencyId}&leadId=${item.id}`}
            >
              <div className={styles.rowTop}>
                <div>
                  <h3>{item.fullName}</h3>
                  <p>
                    {displayChannel(item.sourceChannel)} {item.sourceCampaign ? `· ${item.sourceCampaign}` : ""}
                  </p>
                </div>
                <span className={`${styles.priorityBadge} ${badgeClass(item.priority)}`}>{item.priority}</span>
              </div>

              <div className={styles.metricsGrid}>
                <div>
                  <span>Score</span>
                  <strong>{item.score}</strong>
                </div>
                <div>
                  <span>Prob. cierre</span>
                  <strong>{item.closeProbability}%</strong>
                </div>
                <div>
                  <span>Etapa</span>
                  <strong>{displayLeadStage(item.stage)}</strong>
                </div>
                <div>
                  <span>Silencio</span>
                  <strong>{item.silenceHours == null ? "—" : formatRelativeHours(item.silenceHours)}</strong>
                </div>
              </div>

              <div className={styles.rowBottom}>
                <p>{item.recommendedNextAction?.title ?? "Sin próxima acción calculada aún"}</p>
                {item.hasManualReviewTask ? <span className={styles.alertBadge}>Revisión manual</span> : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
