import { LeadDetailModel } from "@/lib/server/read-models/leads";
import { formatCurrencyUSD, formatDateTime } from "@/lib/formatters";
import {
  displayDeliveryStatus,
  displayFinancingMode,
  displayFollowUpEventStatus,
  displayLeadStage,
  displayMessageDirection,
  displayPropertyType,
  displaySenderLabel,
  displayUrgency,
  displaySeriousness,
  displayUseCase,
  formatTimelineMonths
} from "@/lib/i18n/present";
import styles from "./lead-detail-panel.module.css";

interface LeadDetailPanelProps {
  lead: LeadDetailModel | null;
}

function renderBudget(min: number | null, max: number | null) {
  if (min == null && max == null) {
    return "Desconocido";
  }

  if (min != null && max != null) {
    return `${formatCurrencyUSD(min)} - ${formatCurrencyUSD(max)}`;
  }

  return formatCurrencyUSD(min ?? max ?? 0);
}

export function LeadDetailPanel({ lead }: LeadDetailPanelProps) {
  if (!lead) {
    return (
      <section className={styles.empty}>
        <h2>Seleccioná un lead</h2>
        <p>Elegí un lead de la bandeja para ver el perfil, el historial de conversación y las próximas acciones.</p>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <h2>Detalle del lead</h2>
        <p>
          Etapa: <strong>{displayLeadStage(lead.stage)}</strong> · Prioridad: <strong>{lead.priority}</strong> · Score:{" "}
          <strong>{lead.score}</strong>
        </p>
      </header>

      <div className={styles.block}>
        <h3>Perfil extraído</h3>
        {lead.profile ? (
          <div className={styles.profileGrid}>
            <div>
              <span>Presupuesto</span>
              <strong>{renderBudget(lead.profile.budgetMin, lead.profile.budgetMax)}</strong>
            </div>
            <div>
              <span>Zonas</span>
              <strong>{lead.profile.preferredZones.join(", ") || "Desconocido"}</strong>
            </div>
            <div>
              <span>Tipo de propiedad</span>
              <strong>{displayPropertyType(lead.profile.propertyType)}</strong>
            </div>
            <div>
              <span>Dormitorios</span>
              <strong>{lead.profile.bedrooms ?? "Desconocido"}</strong>
            </div>
            <div>
              <span>Financiación</span>
              <strong>{displayFinancingMode(lead.profile.financingMode)}</strong>
            </div>
            <div>
              <span>Plazo</span>
              <strong>{formatTimelineMonths(lead.profile.timelineMonths)}</strong>
            </div>
            <div>
              <span>Urgencia</span>
              <strong>{displayUrgency(lead.profile.urgency)}</strong>
            </div>
            <div>
              <span>Seriedad</span>
              <strong>{displaySeriousness(lead.profile.seriousness)}</strong>
            </div>
            <div>
              <span>Confianza</span>
              <strong>{Math.round(lead.profile.confidenceOverall * 100)}%</strong>
            </div>
          </div>
        ) : (
          <p className={styles.placeholder}>No hay perfil para este lead.</p>
        )}
      </div>

      <div className={styles.block}>
        <h3>Próxima acción recomendada</h3>
        {lead.nextAction ? (
          <>
            <p className={styles.nextActionTitle}>{lead.nextAction.title}</p>
            <p>{lead.nextAction.detail}</p>
            <ul>
              {lead.nextAction.why.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </>
        ) : (
          <p className={styles.placeholder}>Sin próxima acción calculada aún.</p>
        )}
      </div>

      <div className={styles.block}>
        <h3>Historial de conversación</h3>
        <div className={styles.conversationList}>
          {lead.conversation.length ? (
            lead.conversation.map((message) => (
              <article key={message.id} className={styles.message}>
                <header>
                  <strong>{displaySenderLabel(message.direction, message.senderName)}</strong>
                  <span>
                    {formatDateTime(message.sentAt)} · {displayMessageDirection(message.direction)} ·{" "}
                    {displayDeliveryStatus(message.deliveryStatus)}
                  </span>
                </header>
                <p>{message.body}</p>
              </article>
            ))
          ) : (
            <p className={styles.placeholder}>No hay mensajes registrados.</p>
          )}
        </div>
      </div>

      <div className={styles.dualGrid}>
        <div className={styles.block}>
          <h3>Cronología de seguimiento</h3>
          {lead.followUpEvents.length ? (
            <ul className={styles.simpleList}>
              {lead.followUpEvents.map((event) => (
                <li key={event.id}>
                  <strong>{event.title}</strong>
                  <span>
                    {displayFollowUpEventStatus(event.status)} · {formatDateTime(event.scheduledFor)}
                  </span>
                  <p>{event.detail}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.placeholder}>Aún no hay tareas de seguimiento.</p>
          )}
        </div>

        <div className={styles.block}>
          <h3>Notas / estado CRM</h3>
          {lead.notes.length ? (
            <ul className={styles.simpleList}>
              {lead.notes.map((note) => (
                <li key={note.id}>
                  <strong>{note.author}</strong>
                  <p>{note.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.placeholder}>Sin notas aún.</p>
          )}
        </div>
      </div>

      <div className={styles.block}>
        <h3>Propiedades sugeridas</h3>
        {lead.recommendations.length ? (
          <div className={styles.recommendationList}>
            {lead.recommendations.map((item) => (
              <article key={item.id} className={styles.recommendationCard}>
                <header>
                  <strong>
                    #{item.rank} {item.title}
                  </strong>
                  <span>{Math.round(item.fitScore * 100)}% encaje</span>
                </header>
                <p>
                  {item.neighborhood} · {formatCurrencyUSD(item.price)} · {item.bedrooms} dorm. / {item.bathrooms} baños ·{" "}
                  {displayUseCase(item.useCase)}
                </p>
                <ul>
                  {item.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
                {item.tradeoff ? <p className={styles.tradeoff}>{item.tradeoff}</p> : null}
                {item.appreciationNote ? <p className={styles.appreciation}>{item.appreciationNote}</p> : null}
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.placeholder}>Sin recomendaciones de propiedades aún.</p>
        )}
      </div>
    </section>
  );
}
