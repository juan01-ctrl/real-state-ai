import Link from "next/link";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

const productChapters = [
  {
    title: "Sabé quién realmente tiene probabilidad de cerrar",
    description:
      "Cuando entra demanda, el sistema separa intención real de ruido comercial. Tu equipo ve primero dónde hay dinero probable y qué riesgo hay por demora.",
    proofA: "Prioridad por probabilidad de cierre, no por orden de llegada",
    proofB: "Señales explicables: urgencia, capacidad y objeciones",
    visualTitle: "Evaluación comercial",
    visualMain: "Lead con probabilidad alta y ventana de decisión corta",
    visualSub: "Acción recomendada disponible en minutos",
    reverse: false
  },
  {
    title: "Mostrá la propiedad correcta mientras el comprador está atento",
    description:
      "No se trata de listar inmuebles. Se trata de presentar la opción con más chance de visita ahora, con argumento claro y siguiente movimiento concreto.",
    proofA: "Recomendación con razones de encaje y tradeoffs",
    proofB: "Sugerencia de mensaje y timing para sostener momentum",
    visualTitle: "Momento de recomendación",
    visualMain: "Propiedad priorizada por encaje + intención",
    visualSub: "Confianza visible para decidir rápido",
    reverse: true
  },
  {
    title: "Entendé por qué se pierden operaciones y corregilo a tiempo",
    description:
      "La dirección comercial deja de mirar métricas tarde. Ves dónde se fuga ingreso: respuesta lenta, seguimiento débil o mala asignación de atención.",
    proofA: "Fugas detectadas por etapa, canal y performance",
    proofB: "Señales accionables para recuperar leads de alto valor",
    visualTitle: "Inteligencia de pérdida",
    visualMain: "Motivo principal: demora en el primer movimiento útil",
    visualSub: "Canales con mejor y peor conversión claramente visibles",
    reverse: false
  }
];

const thinkingFlow = [
  "Llega un lead desde WhatsApp, Instagram, web o portal.",
  "El sistema entiende presupuesto, zona, urgencia y seriedad.",
  "Predice probabilidad de cierre con confianza explícita.",
  "Recomienda próximo movimiento y prioridad operativa.",
  "Mide resultado para mejorar decisiones futuras."
];

const compareRows = [
  {
    label: "Priorización",
    old: "Se responde por orden de llegada o intuición",
    next: "Se ordena por probabilidad de cierre y urgencia"
  },
  {
    label: "Próxima acción",
    old: "Depende de cada asesor",
    next: "Cada lead tiene un siguiente movimiento sugerido"
  },
  {
    label: "Timing",
    old: "Seguimiento irregular",
    next: "Ventana de contacto marcada antes de enfriarse"
  },
  {
    label: "Visibilidad",
    old: "No está claro por qué se pierden operaciones",
    next: "Motivos de pérdida visibles y accionables"
  }
];

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={`${styles.section} ${styles.heroSection}`}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Sistema comercial para inmobiliarias de alto rendimiento</p>
          <h1>Sabé qué compradores importan antes que tu competencia.</h1>
          <p className={styles.lead}>
            Un sistema de ventas que identifica compradores serios, recomienda el próximo movimiento y enfoca a tu equipo donde
            las operaciones sí pueden cerrarse.
          </p>

          <div className={styles.heroActions}>
            <Button asChild size="lg" className={styles.primaryCta}>
              <Link href="/leads">Reservar demo privada</Link>
            </Button>
            <Link href="#problema" className={styles.secondaryCta}>
              Ver el sistema
            </Link>
          </div>

          <div className={styles.proofLine}>
            <span>Normalmente reduce tiempos de respuesta hasta 70%</span>
            <span>Diseñado para agencias que ya invierten en generación de leads</span>
          </div>
        </div>

        <div className={styles.heroScene}>
          <article className={`${styles.surface} ${styles.heroPanel}`}>
            <header className={styles.heroPanelHeader}>
              <div>
                <p className={styles.meta}>Lead prioritario</p>
                <h2>Marina Suárez</h2>
              </div>
              <div className={styles.closeBadge}>Prob. cierre 81%</div>
            </header>

            <div className={styles.heroMetricRow}>
              <div>
                <p className={styles.meta}>Evaluación</p>
                <strong>Alta intención</strong>
              </div>
              <div>
                <p className={styles.meta}>Urgencia</p>
                <strong>21 días</strong>
              </div>
              <div>
                <p className={styles.meta}>Confianza</p>
                <strong>87%</strong>
              </div>
            </div>

            <div className={styles.heroInsight}>
              <p className={styles.meta}>Insight de cierre</p>
              <strong>Este lead tiene 2.4x más probabilidad de convertirse que el promedio semanal.</strong>
            </div>

            <div className={styles.heroNextMove}>
              <p className={styles.meta}>Próximo movimiento</p>
              <strong>Confirmar visita hoy con dos propiedades de mayor encaje.</strong>
            </div>
          </article>

          <aside className={`${styles.surfaceSoft} ${styles.propertyPanel}`}>
            <p className={styles.meta}>Propiedad recomendada</p>
            <strong>Semipiso 3 amb · Las Cañitas · 94% de encaje</strong>
          </aside>

          <aside className={styles.riskTag}>Riesgo por demora: alto en 4h</aside>
        </div>
      </section>

      <section id="problema" className={`${styles.section} ${styles.problemSection}`}>
        <p className={styles.kicker}>La tensión real</p>
        <h3>Ya estás pagando por leads. Estás perdiendo los mejores.</h3>
        <p className={styles.lead}>
          Entran 20 consultas. Solo 3 suelen ser compradores serios. Si todo se atiende igual, los valiosos desaparecen antes
          de que el equipo lo note.
        </p>

        <div className={`${styles.surface} ${styles.problemPanel}`}>
          <article>
            <h4>Cómo suele funcionar</h4>
            <ul>
              <li>Todos los leads reciben la misma atención</li>
              <li>Seguimiento lento y sin criterio uniforme</li>
              <li>No hay claridad sobre quién merece foco inmediato</li>
            </ul>
          </article>
          <article className={styles.problemAfter}>
            <h4>Cómo funciona con este sistema</h4>
            <ul>
              <li>Compradores fuertes resaltados al instante</li>
              <li>Próximo movimiento sugerido para cada caso</li>
              <li>Seguimiento ejecutado en la ventana que convierte</li>
            </ul>
          </article>
        </div>
      </section>

      <section className={`${styles.section} ${styles.chapterSection}`}>
        {productChapters.map((chapter) => (
          <article key={chapter.title} className={`${styles.chapter} ${chapter.reverse ? styles.reverse : ""}`}>
            <div className={styles.chapterCopy}>
              <p className={styles.kicker}>Ventaja comercial</p>
              <h3>{chapter.title}</h3>
              <p className={styles.lead}>{chapter.description}</p>
              <div className={styles.chapterProof}>
                <span>{chapter.proofA}</span>
                <span>{chapter.proofB}</span>
              </div>
            </div>
            <div className={`${styles.surface} ${styles.chapterVisual}`}>
              <p className={styles.meta}>{chapter.visualTitle}</p>
              <strong>{chapter.visualMain}</strong>
              <span>{chapter.visualSub}</span>
            </div>
          </article>
        ))}
      </section>

      <section className={`${styles.section} ${styles.thinkingSection}`}>
        <p className={styles.kicker}>Cómo piensa el sistema</p>
        <h3>Una segunda mente para tu agencia.</h3>
        <div className={styles.timelineSurface}>
          <div className={styles.timelineTrack} />
          {thinkingFlow.map((step, index) => (
            <article key={step} className={styles.timelineStep}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.compareSection}`}>
        <p className={styles.kicker}>Diferencia real</p>
        <h3>La mayoría de herramientas ayuda a gestionar leads. Esto te dice cuáles importan.</h3>

        <div className={`${styles.surface} ${styles.compareSplit}`}>
          <div className={styles.compareColHeader}>Cómo trabajan la mayoría de agencias</div>
          <div className={styles.compareColHeaderAccent}>Cómo trabaja este sistema</div>
          {compareRows.map((row) => (
            <div key={row.label} className={styles.compareRow}>
              <p>{row.label}</p>
              <span>{row.old}</span>
              <span className={styles.compareAccent}>{row.next}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.proofSection}`}>
        <blockquote>
          “Dejamos de responder por ansiedad y empezamos a priorizar por probabilidad de cierre. Cambió el foco del equipo en
          la primera semana.”
        </blockquote>
        <p className={styles.quoteBy}>Gerencia comercial · Agencia residencial premium</p>

        <div className={`${styles.surface} ${styles.metricsSurface}`}>
          <article>
            <strong>35%</strong>
            <span>más visitas calificadas con el mismo presupuesto de leads</span>
          </article>
          <article>
            <strong>2.1x</strong>
            <span>más seguimiento efectivo sobre compradores de alta intención</span>
          </article>
          <article>
            <strong>70%</strong>
            <span>menos tiempo hasta la primera respuesta comercial útil</span>
          </article>
        </div>

        <p className={styles.proofNote}>
          Construido para agencias que ya invierten en demanda y quieren convertir mejor los leads que ya tienen.
        </p>
      </section>

      <section className={`${styles.section} ${styles.finalSection}`}>
        <p className={styles.kicker}>Acceso exclusivo</p>
        <h3>Mirá qué leads está perdiendo hoy tu agencia y qué hacer con cada uno.</h3>
        <p className={styles.lead}>Un walkthrough privado para equipos que quieren más cierre, no más ruido operativo.</p>
        <Button asChild size="lg" className={styles.primaryCta}>
          <Link href="/leads">Reservar demo privada</Link>
        </Button>
        <span>Actualmente incorporamos un número limitado de agencias.</span>
      </section>
    </main>
  );
}
