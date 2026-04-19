import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import styles from "./page.module.css";

const leadCloud = Array.from({ length: 18 }, (_, i) => i);
const focusCloud = Array.from({ length: 10 }, (_, i) => i);

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>AI sales infrastructure for real estate agencies</p>
          <h1>Know which buyers matter before your competitors do.</h1>
          <p className={styles.subhead}>
            Most agencies do not lose deals because they lack leads. They lose them because they cannot see which leads deserve
            attention.
          </p>
          <Button asChild size="lg" className={styles.cta}>
            <Link href="/leads">Book a private demo</Link>
          </Button>
          <p className={styles.microProof}>Typically reduces response time by 70%.</p>
        </div>

        <div className={styles.heroObject}>
          <div className={styles.glow} />

          <Card variant="premium" className={styles.mainPanel}>
            <header>
              <div>
                <p className={styles.label}>Lead assessment</p>
                <h2>Valentina Márquez</h2>
              </div>
              <span className={styles.score}>82% likely to close</span>
            </header>

            <div className={styles.panelRow}>
              <p className={styles.label}>AI view</p>
              <strong>Budget validated, financing ready, purchase window under 30 days.</strong>
            </div>

            <div className={styles.panelRow}>
              <p className={styles.label}>Next move</p>
              <strong>Offer two visit slots today and send one matched property immediately.</strong>
            </div>
          </Card>

          <Card variant="elevated" className={styles.sidePanel}>
            <p className={styles.label}>Recommended property</p>
            <strong>Semipiso · Las Cañitas · 94% fit</strong>
            <span>Matches budget, zone and urgency profile.</span>
          </Card>

          <div className={styles.signal}>High risk if ignored in next 4h</div>
        </div>
      </section>

      <section className={styles.tension}>
        <p className={styles.eyebrow}>The hidden cost</p>
        <h3>You are already paying for leads. You are losing the best ones.</h3>
        <p className={styles.tightCopy}>When every lead gets equal effort, the highest-value buyers cool down first.</p>

        <div className={styles.tensionVisual}>
          <div className={styles.chaos}> 
            <div className={styles.dotField}>
              {leadCloud.map((i) => (
                <span key={`lead-${i}`} className={styles.dot} />
              ))}
            </div>
            <p>Before: noisy, reactive, unfocused.</p>
          </div>

          <div className={styles.focus}> 
            <div className={styles.dotFieldFocus}>
              {focusCloud.map((i) => (
                <span key={`focus-${i}`} className={`${styles.dot} ${i < 3 ? styles.dotHot : ""}`} />
              ))}
            </div>
            <Card variant="elevated" className={styles.focusTag}>
              <strong>Priority lead identified</strong>
              <span>Clear probability + clear action + clear timing.</span>
            </Card>
          </div>
        </div>
      </section>

      <section className={styles.storyOne}>
        <Card variant="elevated" className={styles.storyVisualOne}>
          <p className={styles.label}>Who matters</p>
          <strong>Lead quality becomes visible in one decision surface.</strong>
          <span>Probability, seriousness, urgency and context interpreted together.</span>
        </Card>

        <div className={styles.storyCopyOne}>
          <h3>Know who is actually likely to close.</h3>
          <p>Your team stops chasing volume and starts protecting opportunities with real commercial potential.</p>
        </div>
      </section>

      <section className={styles.storyTwo}>
        <p className={styles.eyebrow}>Execution layer</p>
        <h3>Know what to do next — before the buyer disappears.</h3>

        <div className={styles.storyRunway}>
          <Card variant="elevated" className={styles.runwayMain}>
            <p className={styles.label}>Recommended move</p>
            <strong>Send matched property + confirm visit in one touchpoint.</strong>
          </Card>

          <div className={styles.runwaySide}>
            <p className={styles.label}>Best timing</p>
            <strong>Next 2h</strong>
          </div>
        </div>
      </section>

      <section className={styles.proof}> 
        <blockquote>“We finally know which leads are actually worth our team’s attention.”</blockquote>
        <p className={styles.quoteBy}>Head of Sales · Premium Residential Agency</p>

        <div className={styles.metricStrip}>
          <div>
            <strong className={styles.metricAccent}>35%</strong>
            <span>more qualified visits</span>
          </div>
          <div>
            <strong>2x</strong>
            <span>more follow-ups completed</span>
          </div>
          <div>
            <strong>70%</strong>
            <span>faster response time</span>
          </div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <h3>See which leads your agency is losing — and what to do about it.</h3>
        <p>A private walkthrough for agencies that want more from the leads they already pay for.</p>
        <Button asChild size="lg" className={styles.cta}>
          <Link href="/leads">Book a private demo</Link>
        </Button>
        <span>Currently onboarding a limited number of agencies.</span>
      </section>
    </main>
  );
}
