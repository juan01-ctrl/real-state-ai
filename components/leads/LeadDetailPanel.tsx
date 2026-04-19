import { LeadDetailModel } from "@/lib/server/read-models/leads";
import { formatCurrencyUSD, formatDateTime, formatRelativeHours } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Surface } from "@/components/ui/surface";
import {
  displayChannel,
  displayDeliveryStatus,
  displayFollowUpEventStatus,
  displayLeadStage,
  displayMessageDirection,
  displayPropertyType,
  displaySenderLabel,
  displaySeriousness,
  displayUrgency,
  displayUseCase,
  formatTimelineMonths
} from "@/lib/i18n/present";
import styles from "./lead-detail-panel.module.css";

interface LeadDetailPanelProps {
  lead: LeadDetailModel | null;
}

function renderBudget(min: number | null, max: number | null) {
  if (min == null && max == null) return "Desconocido";
  if (min != null && max != null) return `${formatCurrencyUSD(min)} - ${formatCurrencyUSD(max)}`;
  return formatCurrencyUSD(min ?? max ?? 0);
}

function aiJudgment(lead: LeadDetailModel) {
  if (!lead.profile) {
    return "El perfil está incompleto: el riesgo operativo es mayor hasta confirmar la calificación.";
  }

  if (lead.score >= 85) {
    return "Comprador de alto valor con intención comercial clara. Una ejecución rápida y precisa puede llevarlo a visita en poco tiempo.";
  }

  if (lead.score >= 70) {
    return "Hay señales de compra relevantes, pero hace falta seguimiento disciplinado para no perder momentum.";
  }

  return "La intención es moderada o baja. Nutrición consultiva y reservar el contacto intensivo para oportunidades más fuertes.";
}

function riskIfIgnored(lead: LeadDetailModel) {
  if ((lead.silenceHours ?? 0) >= 24) {
    return "Si no actuás, la demora en respuesta probablemente baje la probabilidad de cierre en esta etapa.";
  }

  if (lead.nextAction?.type === "book_visit") {
    return "Si se deja enfriar, la intención de visita puede caer y otro competidor puede captar al comprador antes.";
  }

  return "Si se ignora, el avance del lead se frena y la calidad del pipeline se deteriora con el tiempo.";
}

export function LeadDetailPanel({ lead }: LeadDetailPanelProps) {
  if (!lead) {
    return (
      <Card className={styles.empty}>
        <CardContent className={styles.emptyContent}>
        <p className={styles.emptyKicker}>Consola de inteligencia</p>
        <h2>Elegí un lead para abrir la vista operativa</h2>
        <p>Seleccioná una oportunidad en el feed para ver el juicio de la IA, la guía de ejecución y el contexto comercial.</p>
        </CardContent>
      </Card>
    );
  }

  const topRecommendation = lead.recommendations[0];
  const relatedRecommendations = lead.recommendations.slice(1);

  return (
    <Card className={styles.panel}>
      <CardContent className={styles.panelContent}>
      <div className={styles.layout}>
        <div className={styles.primary}>
          <section className={styles.identitySection}>
            <p className={styles.kicker}>Inteligencia de lead</p>
            <h2>{lead.fullName}</h2>
            <p className={styles.identityMeta}>
              {displayChannel(lead.sourceChannel)}
              {lead.sourceCampaign ? ` · ${lead.sourceCampaign}` : ""}
              {lead.silenceHours != null ? ` · ${formatRelativeHours(lead.silenceHours)} sin actividad` : ""}
            </p>
            <div className={styles.identityBadges}>
              <Badge variant="secondary">{displayLeadStage(lead.stage)}</Badge>
              <Badge variant="outline">Prioridad {lead.priority}</Badge>
            </div>
          </section>

          <Surface tone="soft" spacing="md" className={styles.assessmentSection}>
            <h3>Evaluación del lead</h3>
            <p className={styles.intentSummary}>
              {lead.profile?.buyingIntentSummary ?? "Aún no hay resumen de intención de compra."}
            </p>
            <dl className={styles.assessmentGrid}>
              <div>
                <dt>Puntaje</dt>
                <dd>{lead.score}</dd>
              </div>
              <div>
                <dt>Prob. de cierre</dt>
                <dd>{lead.closeProbability}%</dd>
              </div>
              <div>
                <dt>Urgencia</dt>
                <dd>{lead.profile ? displayUrgency(lead.profile.urgency) : "Desconocido"}</dd>
              </div>
              <div>
                <dt>Seriedad</dt>
                <dd>{lead.profile ? displaySeriousness(lead.profile.seriousness) : "Desconocido"}</dd>
              </div>
              <div>
                <dt>Presupuesto</dt>
                <dd>{renderBudget(lead.profile?.budgetMin ?? null, lead.profile?.budgetMax ?? null)}</dd>
              </div>
              <div>
                <dt>Plazo</dt>
                <dd>{lead.profile ? formatTimelineMonths(lead.profile.timelineMonths) : "Desconocido"}</dd>
              </div>
            </dl>
          </Surface>

          <Surface tone="emphasis" spacing="md" className={styles.aiPerspectiveSection}>
            <p className={styles.aiEyebrow}>Perspectiva de la IA</p>
            <p className={styles.aiJudgment}>{aiJudgment(lead)}</p>
            <div className={styles.aiMoveBlock}>
              <p className={styles.aiMoveLabel}>Movimiento recomendado ahora</p>
              <p className={styles.aiMoveText}>{lead.nextAction?.title ?? "Definí la próxima acción manualmente"}</p>
              <p className={styles.aiMoveDetail}>{lead.nextAction?.detail ?? "Aún no hay detalle de acción generado."}</p>
            </div>
            <div className={styles.aiFooter}>
              <p>
                <strong>Confianza:</strong>{" "}
                {lead.profile ? `${Math.round(lead.profile.confidenceOverall * 100)}%` : "No disponible"}
              </p>
              <p>
                <strong>Riesgo si se ignora:</strong> {riskIfIgnored(lead)}
              </p>
            </div>
          </Surface>

          <Surface tone="soft" spacing="md" className={styles.recommendationSection}>
            <h3>Propiedad destacada</h3>
            {topRecommendation ? (
              <article className={styles.topRecommendationCard}>
                <header>
                  <strong>{topRecommendation.title}</strong>
                  <span>{Math.round(topRecommendation.fitScore * 100)}% de encaje</span>
                </header>
                <p>
                  {topRecommendation.neighborhood} · {formatCurrencyUSD(topRecommendation.price)} ·{" "}
                  {topRecommendation.bedrooms} dorm. / {topRecommendation.bathrooms} baños ·{" "}
                  {displayUseCase(topRecommendation.useCase)}
                </p>
                <ul>
                  {topRecommendation.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
                {topRecommendation.tradeoff ? <p className={styles.tradeoff}>{topRecommendation.tradeoff}</p> : null}
                {topRecommendation.appreciationNote ? (
                  <p className={styles.appreciation}>{topRecommendation.appreciationNote}</p>
                ) : null}
              </article>
            ) : (
              <p className={styles.placeholder}>Todavía no hay recomendación generada.</p>
            )}
          </Surface>

          <Surface tone="soft" spacing="md" className={styles.conversationSection}>
            <h3>Historial de conversación</h3>
            <div className={styles.conversationList}>
              {lead.conversation.length ? (
                lead.conversation.map((message) => (
                  <article
                    key={message.id}
                    className={`${styles.message} ${message.direction === "INBOUND" ? styles.inbound : styles.outbound}`}
                  >
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
          </Surface>
        </div>

        <aside className={styles.secondaryRail}>
          <Surface tone="soft" spacing="sm" className={styles.railBlock}>
            <h4>Metadatos</h4>
            <ul>
              <li>
                <span>Etapa</span>
                <strong>{displayLeadStage(lead.stage)}</strong>
              </li>
              <li>
                <span>Prioridad</span>
                <strong>{lead.priority}</strong>
              </li>
              <li>
                <span>Responsable</span>
                <strong>{lead.ownerName ?? "Sin asignar"}</strong>
              </li>
              <li>
                <span>Tipo de propiedad</span>
                <strong>{lead.profile ? displayPropertyType(lead.profile.propertyType) : "Desconocido"}</strong>
              </li>
              <li>
                <span>Zonas</span>
                <strong>{lead.profile?.preferredZones.join(", ") || "Desconocido"}</strong>
              </li>
            </ul>
          </Surface>

          <Surface tone="soft" spacing="sm" className={styles.railBlock}>
            <h4>Cronología y seguimiento</h4>
            {lead.followUpEvents.length ? (
              <ul className={styles.timelineList}>
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
              <p className={styles.placeholder}>Aún no hay plan de seguimiento.</p>
            )}
          </Surface>

          <Surface tone="soft" spacing="sm" className={styles.railBlock}>
            <h4>Notas</h4>
            {lead.notes.length ? (
              <ul className={styles.notesList}>
                {lead.notes.map((note) => (
                  <li key={note.id}>
                    <strong>{note.author}</strong>
                    <p>{note.body}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.placeholder}>Sin notas por ahora.</p>
            )}
          </Surface>

          <Surface tone="soft" spacing="sm" className={styles.railBlock}>
            <h4>Propiedades relacionadas</h4>
            {relatedRecommendations.length ? (
              <ul className={styles.relatedList}>
                {relatedRecommendations.map((item) => (
                  <li key={item.id}>
                    <strong>
                      #{item.rank} {item.title}
                    </strong>
                    <span>
                      {Math.round(item.fitScore * 100)}% encaje · {item.neighborhood}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.placeholder}>No hay propiedades secundarias.</p>
            )}
          </Surface>
        </aside>
      </div>
      <Separator className="mt-4" />
      </CardContent>
    </Card>
  );
}
