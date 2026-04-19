---
name: feature-spec-writer
description: Produces implementation-ready feature specs for the real estate agency sales platform—flows, data, AI boundaries, and measurable outcomes. Use when starting a feature, scoping an epic, or decomposing ambiguous requests.
---

# Feature spec writer

## Purpose

One **buildable** document: **operator/buyer** problem → **behavior** → **data + APIs + jobs** → **success** **metrics**—aligned with **qualification**, **pipeline**, **visibility**, and **consultative** **AI** **positioning**.

## When to use

- New **vertical slice**: e.g. **lost-deals** view, **new channel**, **visit** **handoff**, **scoring** **override**.
- **Spike** alignment before code; **cross-team** **kickoff**.
- **Refining** vague tickets into **testable** **acceptance** **criteria**.

## When not to use

- **Company strategy** or **ICP** — **real-estate-strategist** agent (spec may **reference** **decisions**).
- **Marketing** **landing** copy — **conversion-copywriter** agent.

## Inputs (gather first)

- [ ] **Problem** statement from **operator** or **buyer** (1 paragraph, **real** **quote** if possible).
- [ ] **Non-goals** / **deadline** / **risk** **tolerance**.
- [ ] **Roles**: agency admin, agent, **read-only** **manager**.
- [ ] **Dependencies**: CRM, **channel**, **model** **availability**.
- [ ] **Success** **hypothesis** (e.g. **↓** **stale** **leads** **>** **48h**).

## Workflow

1. **Outcome** — **Business** **metric** first (visits, **qualified** **rate**, **time-to-first** **response**, **lost** **visibility**).
2. **Flows** — **Primary** **path** **numbered**; **failure** **branches** (offline **channel**, **duplicate** **lead**, **permission** **denied**).
3. **Data** — **Entities**, **fields**, **states**, **PII** **and** **retention**; **what** **must** **be** **auditable**.
4. **APIs / jobs / AI** — **Endpoints** **and** **events**; **what** **code** **vs** **model** **does**; **validation** **and** **guardrails**.
5. **Instrumentation** — **Stable** **event** **names** **and** **properties** (**sales-funnel-audit** / **dashboard** **ready**).
6. **Rollout** — **Flag**, **migration**, **monitoring**, **rollback**; **pilot** **agency** **if** **needed**.
7. **Cut** — **v1** **scope**; **open** **questions** **explicit**.

## Expected output structure

```markdown
## Summary
- Problem & outcome (metric-forward)

## Non-goals

## Users & permissions (tenant scope)

## User flows
1. Primary …
2. Failures: …

## Data model
- Entities, fields, states, retention, PII

## APIs & events & jobs
- REST/RPC: …
- Events: name + payload
- Workers/queues: …

## AI (if any)
- Inputs/outputs schema; human override; failure behavior

## UX acceptance criteria
- …

## Success criteria (measurable)
- Funnel: e.g. % leads qualified within X h; stale count ↓
- Ops: SLA breaches ↓; task completion ↑
- Engineering: error rate, p95 latency

## Instrumentation
- List of events

## Rollout & risk

## Open questions
```

## Project-specific considerations

- Features should **improve** **follow-up**, **serious buyer** **identification**, or **lost-deal** **understanding**—state **why** **this** **fits**.
- **AI** **sections** **must** **include** **handoff** **and** **bad-output** **behavior**—not **only** **happy** **path**.
- **Agencies** **buy** **clarity**—**avoid** **feature** **sprawl** **without** **pipeline** **story**.

## Avoid

- **Specs** **without** **measurable** **success** **criteria**.
- **Orphan** **features** **that** **don’t** **emit** **events** **or** **touch** **CRM** **truth**.
- **“AI** **will** **handle** **it”** **without** **schema** **and** **eval** **plan**.

## Guardrail

If the feature **doesn’t** **touch** **qualification**, **pipeline**, **or** **visibility**, **justify** **explicitly**—usually **lower** **leverage** **here**.
