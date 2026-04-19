---
name: crm-flow-design
description: Models pipeline states, ownership, tasks, triggers, and CRM sync for real estate agencies. Use when aligning AI-assisted steps with human brokers or integrating HubSpot, Pipedrive, or custom CRMs.
---

# CRM flow design

## Purpose

One **trustworthy pipeline**: **AI** proposes, **humans** decide where required; **stages**, **tasks**, and **history** sync **reliably** to the CRM agencies already live in—**idempotent**, **auditable**, **recoverable**.

## When to use

- Defining **internal** stages vs **external** deal stages.
- **Ownership**, **SLA tasks**, **escalation** (junior → senior).
- **Triggers**: no reply **48h** → task; score **>** threshold → notify.
- **Sync semantics**: create/update, **conflict** when brokers edit in CRM.

## When not to use

- **Buyer message wording** — **conversation-design** skill.
- **Match ranking** — **property-recommendation** skill.
- **Raw webhook code** — **backend-systems-engineer** (this skill defines **behavior**).

## Inputs (gather first)

- [ ] CRM product(s) and **objects** used (deal, contact, **custom** fields).
- [ ] **Source of truth** per field: system vs **manual** broker edit.
- [ ] **Stage** list in CRM today (even if messy).
- [ ] **Handoff** moments: when **must** a human own the thread?
- [ ] **Compliance** or **brokerage** rules on **recording** comms.

## Workflow

1. **As-is** — Document current flow; **label** **gaps** and **shadow** processes (DMs not in CRM).
2. **To-be stages** — Minimal meaningful set; **guards** for entry (e.g. **Qualified** requires budget band + zone).
3. **Map** — Internal `stage_id` ↔ CRM stage ↔ **product** **labels** (one glossary).
4. **Ownership** — **Single** owner per lead; handoff = **assign + note + optional task**.
5. **Activities** — Log **calls**, **DMs**, **visits** with **timestamps** for **follow-up** logic and **audit**.
6. **Automations** — Which are **system-proposed** vs **human-confirmed** (especially **outbound** or **stage** **jumps**).
7. **Conflicts** — Last-write-wins vs **field-level** **source of truth**; **replay** after failed sync.

## Expected output structure

**Stage table**

| Internal stage | Meaning | CRM stage | Entry guard | Exit / next | Side effects (tasks, notifications) |
|----------------|---------|-----------|-------------|-------------|--------------------------------------|

**Transition table**

| From | To | Trigger (event or human) | System actions | Idempotency key idea |
|------|----|---------------------------|----------------|----------------------|

**Field mapping**

| Internal key | CRM field | Direction | On conflict |
|--------------|-----------|-----------|-------------|

**Edge runbook** — Duplicates, merge, **reassignment**, **bulk** import, **CRM** **deleted** deal.

## Project-specific considerations

- **Real estate**: **visit** / **showing** is often the **key** conversion bridge—stage around it **explicitly**.
- **Premium** ops: **noise** **kills** adoption—**fewer** **automated** **tasks**, **higher** **signal**.
- **AI-assisted**: model **never** silently **wins** over **explicit** **broker** **decision** on **sensitive** **moves** (policy).

## Avoid

- **30 stages** nobody enforces.
- **Automation** **spam** (tasks brokers **ignore** → **alert** fatigue).
- **Two** **truths** (CRM says **won**, product says **nurture**) without **reconciliation** **job**.

## Success metrics

Sync **success** rate; **time in stage**; **SLA** **task** **completion**; **conflict** **tickets** volume.
