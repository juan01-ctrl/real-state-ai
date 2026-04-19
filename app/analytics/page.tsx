import Link from "next/link";
import { getExecutiveAnalytics } from "@/lib/server/read-models/analytics";
import { displayChannel, displayLeadStage } from "@/lib/i18n/present";
import styles from "./page.module.css";

interface AnalyticsPageProps {
  searchParams: Promise<{ agencyId?: string }>;
}

function pct(value: number) {
  return `${value.toFixed(1)}%`;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const agencyId = params.agencyId ?? "agency_demo_001";

  const model = await getExecutiveAnalytics(agencyId);

  return (
    <main className={styles.page}>
      <div className={styles.pageInner}>
        <header className={styles.topBar}>
          <div>
            <p className={styles.kicker}>VISIÓN EJECUTIVA</p>
            <h1>Inteligencia comercial</h1>
            <p className={styles.subtitle}>
              Señales mínimas centradas en calidad de conversión, riesgo operativo y dónde debe intervenir tu equipo.
            </p>
          </div>
          <div className={styles.actions}>
            <Link href={`/leads?agencyId=${agencyId}`} className={styles.linkButton}>
              Abrir bandeja de leads
            </Link>
            <Link href={`/analytics?agencyId=${agencyId}`} className={styles.linkButtonSecondary}>
              Actualizar
            </Link>
          </div>
        </header>

        <section className={styles.kpiGrid}>
          <article className={styles.kpiCard}>
            <p>Leads totales</p>
            <strong>{model.headline.totalLeads}</strong>
          </article>
          <article className={styles.kpiCard}>
            <p>Pipeline activo</p>
            <strong>{model.headline.activePipeline}</strong>
          </article>
          <article className={styles.kpiCard}>
            <p>Tasa calificados</p>
            <strong>{pct(model.headline.qualifiedRate)}</strong>
          </article>
          <article className={styles.kpiCard}>
            <p>Score promedio</p>
            <strong>{model.headline.avgLeadScore}</strong>
          </article>
          <article className={styles.kpiCard}>
            <p>Prob. cierre promedio</p>
            <strong>{pct(model.headline.avgCloseProbability)}</strong>
          </article>
          <article className={styles.kpiCard}>
            <p>Leads calientes en silencio</p>
            <strong>{model.headline.staleHighIntentLeads}</strong>
          </article>
        </section>

        <section className={styles.mainGrid}>
          <article className={styles.surface}>
            <h2>Embudo</h2>
            <div className={styles.tableLike}>
              {model.funnel.map((row) => (
                <div key={row.stage} className={styles.tableRow}>
                  <span>{displayLeadStage(row.stage)}</span>
                  <strong>{row.count}</strong>
                  <em>{row.conversionFromPrevious == null ? "—" : pct(row.conversionFromPrevious)}</em>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.surface}>
            <h2>Ideas clave</h2>
            <ul className={styles.insightList}>
              {model.insights.length ? (
                model.insights.map((insight) => <li key={insight}>{insight}</li>)
              ) : (
                <li>Aún no hay datos suficientes para inferir conclusiones.</li>
              )}
            </ul>
          </article>
        </section>

        <section className={styles.mainGrid}>
          <article className={styles.surface}>
            <h2>Calidad por canal</h2>
            <div className={styles.tableLike}>
              {model.channels.map((channel) => (
                <div key={channel.channel} className={styles.tableRow}>
                  <span>{displayChannel(channel.channel)}</span>
                  <strong>score prom. {channel.avgScore}</strong>
                  <em>{pct(channel.qualifiedRate)} calificados</em>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.surface}>
            <h2>Mix por campaña</h2>
            <div className={styles.tableLike}>
              {model.campaigns.map((campaign) => (
                <div key={campaign.campaign} className={styles.tableRowStacked}>
                  <div>
                    <span>{campaign.campaign}</span>
                    <strong>
                      {campaign.leadCount} leads · score prom. {campaign.avgScore}
                    </strong>
                  </div>
                  <em>
                    P1 {campaign.priorityMix.p1} · P2 {campaign.priorityMix.p2} · P3 {campaign.priorityMix.p3}
                  </em>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className={styles.mainGrid}>
          <article className={styles.surface}>
            <h2>Demanda por zona</h2>
            <div className={styles.barList}>
              {model.zones.length ? (
                model.zones.map((zone) => {
                  const max = model.zones[0]?.requests ?? 1;
                  const width = (zone.requests / max) * 100;
                  return (
                    <div key={zone.zone} className={styles.barRow}>
                      <div className={styles.barLabelRow}>
                        <span>{zone.zone}</span>
                        <strong>{zone.requests}</strong>
                      </div>
                      <div className={styles.barTrack}>
                        <div className={styles.barFill} style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className={styles.emptyText}>Aún no hay datos de demanda por zona.</p>
              )}
            </div>
          </article>

          <article className={styles.surface}>
            <h2>Cola de riesgo (respuesta)</h2>
            {model.riskQueue.length ? (
              <ul className={styles.riskList}>
                {model.riskQueue.map((lead) => (
                  <li key={lead.leadId}>
                    <div>
                      <strong>{lead.name}</strong>
                      <span>
                        {displayLeadStage(lead.stage)} · Score {lead.score}
                      </span>
                    </div>
                    <em>{lead.silenceHours} h sin actividad</em>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyText}>No hay leads calientes estancados en este momento.</p>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}
