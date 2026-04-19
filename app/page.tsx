import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import styles from "./page.module.css";

const chapters = [
  {
    title: "Identificá compradores con probabilidad real de cierre",
    body: "Cada conversación se convierte en una lectura comercial clara para que el equipo sepa a quién priorizar sin depender de intuiciones sueltas.",
    bullets: [
      "Extracción de presupuesto, zona, urgencia y modo de financiación",
      "Score explicable con señales positivas, objeciones y riesgo de enfriamiento"
    ],
    signal: "Resultado típico: 1 de cada 4 leads pasa a prioridad alta en menos de 10 minutos.",
    reverse: false
  },
  {
    title: "Recomendá la propiedad correcta y el movimiento correcto",
    body: "No muestra solo inmuebles disponibles. Te indica cuál encaja mejor para avanzar una visita y qué decir para sostener el momentum.",
    bullets: [
      "Ranking con razones de encaje y tradeoffs por propiedad",
      "Próxima acción sugerida según etapa, intención y ventana temporal"
    ],
    signal: "El sistema sugiere qué propuesta tiene mayor probabilidad de respuesta positiva hoy.",
    reverse: true
  },
  {
    title: "Seguí cada oportunidad sin sonar robótico",
    body: "La secuencia de seguimiento se adapta a cada comprador: acelera cuando hay intención, frena cuando no hay señal y escala al asesor cuando corresponde.",
    bullets: [
      "Cadencias multicanal con tono consultivo y contexto comercial",
      "Historial de acciones con estado, responsable y trazabilidad"
    ],
    signal: "Evita que leads calientes pasen más de 2 horas sin respuesta útil.",
    reverse: false
  },
  {
    title: "Entendé por qué se ganan y se pierden operaciones",
    body: "La dirección comercial ve fugas, patrones de conversión y cuellos de botella sin armar reportes manuales cada semana.",
    bullets: [
      "Detección de pérdidas por demora, mala recomendación o baja calificación",
      "Lectura por canal, campaña, tipo de propiedad y performance de equipo"
    ],
    signal: "Visibilidad ejecutiva para decidir dónde poner esfuerzo, presupuesto y cobertura.",
    reverse: true
  }
];

const thinkingFlow = [
  "Ingresa un lead desde WhatsApp, Instagram, formulario o portal.",
  "La IA estructura datos clave: presupuesto, zona, intención, objeciones y urgencia.",
  "El motor calcula score comercial y probabilidad de cierre con confianza explícita.",
  "El sistema recomienda propiedad, mensaje y siguiente movimiento operativo.",
  "La agencia ejecuta con contexto completo y aprende de cada resultado."
];

const diffRows = [
  ["Calidad del lead", "Etiquetas manuales y subjetivas", "Perfil estructurado con incertidumbre explícita"],
  ["Priorización", "Orden cronológico o por intuición", "Ranking por probabilidad de cierre y urgencia"],
  ["Próxima acción", "Depende de cada agente", "Siguiente movimiento recomendado por contexto"],
  ["Recomendación de propiedades", "Filtro por precio y zona", "Encaje, tradeoffs y argumento comercial"],
  ["Visibilidad de pérdidas", "Revisión tardía y parcial", "Motivos de pérdida en tiempo operativo"]
];

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Infraestructura de ventas con IA para inmobiliarias</p>
          <h1>Convertí más leads inmobiliarios en operaciones cerradas.</h1>
          <p className={styles.subheadline}>
            Un sistema comercial que detecta compradores serios, recomienda la mejor jugada y evita que oportunidades de alto
            valor se pierdan por ejecución.
          </p>

          <div className={styles.ctaRow}>
            <Button asChild size="lg" className={styles.primaryCta}>
              <Link href="/leads">Reservar demo privada</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className={styles.secondaryCta}>
              <Link href="#como-funciona">Ver el sistema</Link>
            </Button>
          </div>

          <div className={styles.proofRow}>
            <span>Reduce tiempos de respuesta hasta 70%</span>
            <span>Diseñado para agencias que ya invierten en generación de demanda</span>
          </div>
        </div>

        <div className={styles.heroProduct}>
          <div className={styles.heroGlow} />
          <article className={styles.mainPanel}>
            <header>
              <div>
                <p>Lead de alto valor</p>
                <h2>Valentina Álvarez</h2>
              </div>
              <span>Score 89</span>
            </header>

            <div className={styles.assessmentBlock}>
              <p>Evaluación IA</p>
              <strong>
                Compradora lista para visita: presupuesto validado, crédito preaprobado y ventana de decisión menor a 30 días.
              </strong>
            </div>

            <div className={styles.nextMoveBlock}>
              <p>Movimiento recomendado</p>
              <strong>Proponer dos horarios de visita hoy y confirmar documentación en el mismo hilo.</strong>
            </div>

            <div className={styles.mainMeta}>
              <span>Prob. de cierre: 76%</span>
              <span>Riesgo por demora: alto en 4h</span>
            </div>
          </article>

          <article className={styles.propertyPanel}>
            <p>Propiedad con mejor encaje</p>
            <strong>Semipiso 3 ambientes · Las Cañitas · 93% fit</strong>
            <span>Dentro de presupuesto, zona prioritaria y timing ideal para conversión a visita.</span>
          </article>

          <aside className={styles.timelinePanel}>
            <p>Señal de conversión</p>
            <ul>
              <li>14:10 Nuevo mensaje inbound</li>
              <li>14:12 Perfil estructurado por IA</li>
              <li>14:15 Próxima acción sugerida</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className={`${styles.section} ${styles.tensionSection}`}>
        <p className={styles.sectionEyebrow}>La pérdida invisible</p>
        <h3>La mayoría de las agencias no pierde ventas por falta de leads. Las pierde por falta de foco.</h3>
        <p className={styles.sectionIntro}>
          Entran decenas de conversaciones todos los días, pero pocas representan ingresos reales. Cuando todo recibe la misma
          atención, los mejores compradores se enfrían primero.
        </p>

        <div className={styles.compareGrid}>
          <article className={styles.compareCard}>
            <p>Proceso actual</p>
            <h4>Muchas conversaciones, poca claridad comercial.</h4>
            <ul>
              <li>120 leads entran en la semana</li>
              <li>Se responde por orden de llegada</li>
              <li>Los leads serios se mezclan con ruido</li>
            </ul>
          </article>
          <article className={`${styles.compareCard} ${styles.compareCardStrong}`}>
            <p>Con el sistema</p>
            <h4>Pocas prioridades, ejecución precisa y más visitas.</h4>
            <ul>
              <li>18 oportunidades de alta intención detectadas</li>
              <li>Prioridad dinámica por score + urgencia</li>
              <li>Acción sugerida en cada momento crítico</li>
            </ul>
          </article>
        </div>
      </section>

      <section className={styles.section} id="como-funciona">
        {chapters.map((chapter) => (
          <article key={chapter.title} className={`${styles.chapter} ${chapter.reverse ? styles.chapterReverse : ""}`}>
            <div className={styles.chapterContent}>
              <p className={styles.sectionEyebrow}>Capacidad clave</p>
              <h3>{chapter.title}</h3>
              <p>{chapter.body}</p>
              <ul>
                {chapter.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <p className={styles.chapterSignal}>{chapter.signal}</p>
            </div>
            <div className={styles.chapterVisual}>
              <div className={styles.visualLine}>
                <span>Señal comercial</span>
                <strong>Alta intención</strong>
              </div>
              <div className={styles.visualLine}>
                <span>Confianza del modelo</span>
                <strong>84%</strong>
              </div>
              <div className={styles.visualLine}>
                <span>Acción sugerida</span>
                <strong>Coordinar visita hoy</strong>
              </div>
              <Separator className={styles.visualDivider} />
              <p>
                Decisión guiada por contexto completo: perfil, conversación, timing y fricción detectada.
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className={`${styles.section} ${styles.thinkingSection}`}>
        <p className={styles.sectionEyebrow}>Cómo piensa el sistema</p>
        <h3>Una segunda mente comercial para la agencia.</h3>
        <div className={styles.thinkingRail}>
          {thinkingFlow.map((step, index) => (
            <article key={step} className={styles.thinkingStep}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.diffSection}`}>
        <p className={styles.sectionEyebrow}>Diferenciación real</p>
        <h3>La mayoría de las herramientas ayuda a gestionar leads. Este sistema te dice cuáles merecen tu atención.</h3>

        <div className={styles.diffTable}>
          <div className={styles.diffHeadRow}>
            <div className={styles.diffHead}>Capacidad</div>
            <div className={styles.diffHead}>Stack tradicional</div>
            <div className={styles.diffHead}>Sistema AI comercial</div>
          </div>
          {diffRows.map((row) => (
            <div key={row[0]} className={styles.diffRow}>
              <div className={styles.diffCellLabel}>{row[0]}</div>
              <div className={styles.diffCell}>{row[1]}</div>
              <div className={`${styles.diffCell} ${styles.diffCellStrong}`}>{row[2]}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.atmosphereSection}`}>
        <blockquote>
          “Por primera vez sabemos qué leads realmente merecen al equipo senior. Dejamos de reaccionar y empezamos a operar
          con criterio.”
        </blockquote>
        <p className={styles.quoteAuthor}>Directora comercial · Agencia boutique en CABA</p>

        <div className={styles.metricsRow}>
          <article>
            <strong>35%</strong>
            <span>más visitas calificadas sobre el mismo volumen de leads</span>
          </article>
          <article>
            <strong>2.1x</strong>
            <span>más seguimientos efectivos en leads de alta intención</span>
          </article>
          <article>
            <strong>70%</strong>
            <span>menos tiempo hasta la primera respuesta comercial útil</span>
          </article>
        </div>

        <p className={styles.trustLine}>Implementación guiada, trazabilidad completa y control humano en decisiones sensibles.</p>
      </section>

      <section className={styles.finalCta}>
        <p className={styles.sectionEyebrow}>Acceso limitado</p>
        <h3>Descubrí qué leads está perdiendo hoy tu agencia.</h3>
        <p>
          Mostramos tu embudo real, dónde se está escapando ingreso y qué cambios generan impacto comercial inmediato.
        </p>
        <div className={styles.finalActions}>
          <Button asChild size="lg" className={styles.primaryCta}>
            <Link href="/leads">Reservar demo privada</Link>
          </Button>
          <span>Estamos incorporando un número reducido de agencias por ciclo.</span>
        </div>
      </section>
    </main>
  );
}
