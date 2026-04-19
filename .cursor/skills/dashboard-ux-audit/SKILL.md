---
name: dashboard-ux-audit
description: Evaluates agency dashboards for prioritization, lost-deal visibility, and premium B2B usability. Use when designing home/pipeline views, inbox, or KPI surfaces for operators and owners.
---

# Dashboard UX audit

## Purpose

Ensure operators **see the best opportunities first**, **spot money dying** (stale, ghosted, weak qual), and **act in seconds**—UI that feels **premium**, not **generic** analytics wallpaper.

## When to use

- **New** home, pipeline, inbox, or **manager** overview.
- **Pre-ship** review of density, **defaults**, and **metric honesty**.
- Aligning **widgets** to **sales-funnel-audit** outcomes.

## When not to use

- **Funnel strategy** from scratch — **sales-funnel-audit** skill (audit **informs** layout).
- **Visual brand** from zero — **frontend-marketing-designer** agent (audit **critiques** **UX** fit).
- **Backend** event implementation — engineering.

## Inputs (gather first)

- [ ] **Persona**: agent vs team lead vs owner—**primary** user for this screen.
- [ ] **Top 3 jobs** (e.g. clear inbox, **book visits**, **rescue stale**).
- [ ] **SLA** definitions used in product (response time, **stale** threshold days).
- [ ] **KPI list** marketing wants vs **operations** needs — **reconcile** before layout.
- [ ] **Real data** pain: row counts, **long** names, **mobile** use **yes/no**.

## Workflow

1. **5-second test** — What **must** be visible without scroll? (Usually: **risk** + **today’s money moves**.)
2. **Prioritization** — Default sort = **urgency + value**, not **only** recency; **hot** vs **stale** visually distinct.
3. **Row → detail** — Clicking preserves **context** (thread, tasks, **stage** history); **no** dead ends.
4. **Traceability** — Every **number** has **definition** or drill-down to **events** (**sales-funnel-audit** alignment).
5. **States** — Loading (**skeletons**), **empty** (setup guidance), **error** (retry + **human-readable**).
6. **Premium bar** — Spacing, type scale, **calm** color; **no** chart soup without **operational** queue.

## Expected output structure

```markdown
## Audit context
- Persona: …
- Primary jobs: …

## Findings (ranked)
| Severity | Area | Issue | Impact | Recommendation |
|----------|------|-------|--------|----------------|

## Above-the-fold contract
- Must show: …
- Must not show: …

## Widget ↔ metric map
| Widget | Supports funnel stage / audit leak | Event source |
|--------|-------------------------------------|--------------|

## Copy / label fixes
- …

## Acceptance criteria (sample)
- Operator identifies **top 3 at-risk** leads in < … s on desktop.
```

## Project-specific considerations

- **Lost deals visibility**: **stale**, **ghosted post-tour**, **qualified** but **no visit**—**surface** with **clear** **recovery** actions.
- **Serious buyers**: **signals** from **lead-qualification** should **lift** rows (without **black-box** **UI**).
- **Premium B2B**: **confidence** and **clarity** over **playful** **dashboard** **chrome**.

## Avoid

- **Vanity** charts with **no** **next action**.
- **Same** default for **IC** and **owner**—may need **role-specific** **density**.
- **Jargon** labels that **differ** from **domain-real-estate** **stages**.

## Success metrics

Time-to-action on **high-value** rows; **reduction** in **missed** SLAs (if measured); **operator** **subjective** clarity (pilot feedback).
