import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { SectionHeading } from "@/components/ui/section-heading";
import { getExecutiveAnalytics } from "@/lib/server/read-models/analytics";
import { displayChannel } from "@/lib/i18n/present";
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

  const topChannel = model.channels[0];
  const fallbackChannel = model.channels[model.channels.length - 1];

  const contacted = model.funnel.find((row) => row.stage === "CONTACTED")?.count ?? 0;
  const qualified = model.funnel.find((row) => row.stage === "QUALIFIED")?.count ?? 0;
  const leakRate = contacted ? ((contacted - qualified) / contacted) * 100 : 0;

  const topZone = model.zones[0];
  const riskCount = model.riskQueue.length;

  const topChannelLabel = topChannel ? displayChannel(topChannel.channel) : null;
  const fallbackChannelLabel = fallbackChannel ? displayChannel(fallbackChannel.channel) : null;

  return (
    <main className={styles.page}>
      <div className={styles.pageInner}>
        <header className={styles.topBar}>
          <SectionHeading
            eyebrow="Inteligencia ejecutiva"
            title="Consola estratégica de la agencia"
            subtitle="Lectura concentrada de dónde se crea valor en el embudo, dónde se pierde y qué debería pasar esta semana."
            className={styles.heading}
          />
          <div className={styles.actions}>
            <Button asChild size="sm" className={styles.linkButton}>
              <Link href={`/leads?agencyId=${agencyId}`}>Abrir espacio de leads</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className={styles.linkButtonSecondary}>
              <Link href={`/analytics?agencyId=${agencyId}`}>Actualizar</Link>
            </Button>
          </div>
        </header>

        <Surface tone="default" spacing="lg" className={styles.hero}>
          <p className={styles.heroKicker}>Rendimiento de la agencia</p>
          <div className={styles.heroMain}>
            <div>
              <h2>
                {pct(model.headline.qualifiedRate)} de tasa de calificación sobre la demanda entrante activa
              </h2>
              <p>
                Tu pipeline tiene hoy {model.headline.activePipeline} leads activos con un score promedio de{" "}
                {model.headline.avgLeadScore}. Esto indica{" "}
                {model.headline.staleHighIntentLeads > 0
                  ? "alta oportunidad con riesgo de ejecución"
                  : "momentum de conversión estable"}
                .
              </p>
            </div>
            <div className={styles.heroNumber}>{model.headline.activePipeline}</div>
          </div>
          <div className={styles.heroEvidence}>
            <span>Leads totales: {model.headline.totalLeads}</span>
            <span>Prob. de cierre promedio: {pct(model.headline.avgCloseProbability)}</span>
            <span>Leads calientes en silencio: {model.headline.staleHighIntentLeads}</span>
          </div>
          <p className={styles.recommendation}>
            Recomendación: mantener el SLA de respuesta bajo 2 h para leads de alta intención y proteger la conversión
            calificado → visita.
          </p>
        </Surface>

        <section className={styles.sectionGrid}>
          <Surface tone="soft" spacing="md" className={styles.sectionCard}>
            <h3>Mayor fuga de ingresos</h3>
            <div className={styles.metricLine}>{pct(leakRate)} de caída entre Contactado y Calificado</div>
            <p>
              La fuga más grande hoy está entre el primer contacto y la calificación plena: el contexto comercial no se
              convierte con la velocidad suficiente.
            </p>
            <ul>
              <li>Leads contactados: {contacted}</li>
              <li>Leads calificados: {qualified}</li>
              <li>Cola caliente en silencio: {model.headline.staleHighIntentLeads}</li>
            </ul>
            <p className={styles.recommendation}>
              Recomendación: exigir un movimiento de calificación obligatorio dentro del primer ciclo de respuesta.
            </p>
          </Surface>

          <Surface tone="soft" spacing="md" className={styles.sectionCard}>
            <h3>Patrón que más convierte</h3>
            <div className={styles.metricLine}>{topZone ? topZone.zone : "Aún no hay una zona dominante"}</div>
            <p>
              Los leads de mayor calidad se concentran en pocas zonas y bandas de presupuesto más claras: ahí el
              matching consultivo es más fuerte.
            </p>
            <ul>
              <li>
                Zona más demandada:{" "}
                {topZone ? `${topZone.zone} (${topZone.requests} consultas)` : "Sin datos"}
              </li>
              <li>Score promedio de leads: {model.headline.avgLeadScore}</li>
              <li>Tasa de calificados: {pct(model.headline.qualifiedRate)}</li>
            </ul>
            <p className={styles.recommendation}>
              Recomendación: priorizar stock y guiones en el cluster de zona con más demanda.
            </p>
          </Surface>
        </section>

        <section className={styles.sectionGrid}>
          <Surface tone="soft" spacing="md" className={styles.sectionCard}>
            <h3>Fuente de leads más valiosa</h3>
            <div className={styles.metricLine}>{topChannelLabel ?? "Sin datos de fuentes aún"}</div>
            <p>
              {topChannel && topChannelLabel
                ? `Los leads de ${topChannelLabel} aportan hoy el mejor mix de calidad, con scores y tasas de calificación por encima del resto de canales.`
                : "Hace falta más volumen para rankear la calidad por fuente."}
            </p>
            <ul>
              <li>Score prom.: {topChannel ? topChannel.avgScore : "—"}</li>
              <li>Tasa calificados: {topChannel ? pct(topChannel.qualifiedRate) : "—"}</li>
              <li>Volumen de leads: {topChannel ? topChannel.leadCount : "—"}</li>
            </ul>
            <p className={styles.recommendation}>
              Recomendación: desplazar presupuesto y la cobertura de respuesta más rápida hacia el canal de mayor
              retorno.
            </p>
          </Surface>

          <Surface tone="soft" spacing="md" className={styles.sectionCard}>
            <h3>Qué requiere atención</h3>
            <div className={styles.metricLine}>{riskCount} leads de alta intención en riesgo de timing</div>
            <p>
              Son comercialmente valiosos pero están envejeciendo en silencio. La demora acá suele traducirse en
              oportunidades perdidas.
            </p>
            <ul>
              {model.riskQueue.length ? (
                model.riskQueue.slice(0, 4).map((lead) => (
                  <li key={lead.leadId}>
                    {lead.name}: {lead.silenceHours} h en silencio, score {lead.score}
                  </li>
                ))
              ) : (
                <li>No hay cola de riesgo urgente en este momento.</li>
              )}
              {fallbackChannelLabel ? (
                <li>Fuente con peor desempeño relativo: {fallbackChannelLabel}</li>
              ) : null}
            </ul>
            <p className={styles.recommendation}>
              Recomendación: hacer un barrido diario de recuperación de alta intención con responsable asignado.
            </p>
          </Surface>
        </section>
      </div>
    </main>
  );
}
