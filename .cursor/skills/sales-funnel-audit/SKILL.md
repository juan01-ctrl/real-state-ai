---
name: sales-funnel-audit
description: Finds operational leaks, delays, weak messaging, poor qualification, and visibility gaps in real estate agency funnels. Use when conversion is weak, building analytics, or prioritizing roadmap for pipeline and lost deals.
---

# Sales funnel audit

## Purpose

Expose **where revenue leaks**: **delays**, **messaging quality**, **shallow qualification**, **handoff failures**, and **no visibility** into stale/ghosted deals—so the product roadmap serves **agencies**, not vanity metrics.

## When to use

- Before building **dashboards**, **alerts**, or **lost-opportunity** views.
- **Post-mortem**: “Lots of leads, few **visits** or **closes**.”
- **New channel** (e.g. Instagram) **end-to-end** review.
- **Executive** narrative: what to fix first **this quarter**.

## When not to use

- **Schema + webhook implementation** — engineering task (audit may **inform** it).
- **Exact DM copy** — **conversation-design** skill.
- **CRM field mapping** detail — **crm-flow-design** skill (audit may **call out** gaps).

## Inputs (gather first)

- [ ] **Stages** used today (even if messy): CRM + spreadsheets + DMs.
- [ ] **SLAs** (explicit or tribal): first response, follow-up cadence.
- [ ] **Channels** and **volume** mix; worst-performing source if known.
- [ ] **Team**: who owns inbound, handoff rules, **weekend** reality.
- [ ] **Tooling**: CRM, phone, WhatsApp Business — **where data dies**.

## Workflow

1. **Map the funnel** — First touch → contact → **qualified** → **visit** → offer → won/lost/nurture (adjust for rental).
2. **Per stage** — Owner, **entry/exit**, **SLA**, tool used; **where leads wait** longest.
3. **Leak taxonomy** — Tag issues:
   - **Delay**: first response, between-stage **stalls**.
   - **Messaging**: generic, **pushy**, wrong channel tone, **no CTA**.
   - **Qualification**: missing budget/zone, **false hot** leads burning broker time.
   - **Operational**: no second touch, **no owner**, bad handoff, **no-show** follow-up missing.
   - **Visibility**: can’t see **stale**, **ghosted**, **mispriced** vs market—**flying blind**.
4. **Data gaps** — What’s **not logged** (timestamps, source, outcome of visit).
5. **Instrument** — For each top leak: **event** or **field** needed to **detect** it in product.
6. **Prioritize** — Rank by **revenue impact × feasibility**; split **quick wins** vs **platform** bets.

## Expected output structure

```markdown
## Funnel map
- [Diagram or bullet chain + owners]

## Leak register
| Leak | Stage | Symptom | Likely cause | Evidence needed | Fix type (process / product / training) |
|------|-------|---------|--------------|-----------------|----------------------------------------|

## Top 5 prioritized
1. … (metric to watch, owner, 30-day success signal)

## Instrumentation backlog
- Event: … properties …
- Screen/alert: …

## Quick wins vs structural
- Quick: …
- Structural: …
```

**Metrics reminder**

| Tier | Examples |
|------|-----------|
| North Star | Visits **held**, offers, won deals |
| Diagnostic | First response time, **dwell** in stage, ghost rate, % **qualified** |
| Quality | Message **reply** rate, **qual completeness**, match **accept** |

## Project-specific considerations

- Agencies buy **visibility into lost money** and **better follow-up**—audit must **feed** dashboard priorities (**dashboard-ux-audit**).
- **Premium** product story: fewer **pointless** touches, more **serious buyer** focus.

## Avoid

- **Activity** KPIs (messages sent) as success — ties to **outcomes** only.
- **Blaming** channel alone without **stage** and **qual** analysis.
- **Audit** with no **instrumentation** follow-up — becomes shelf-ware.

## Pair with

**crm-flow-design** (stages/triggers), **lead-qualification** (if qual is the leak).
