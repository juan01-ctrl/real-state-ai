---
name: lead-qualification
description: Builds structured buyer profiles, seriousness signals, and next actions for real estate agencies. Use when designing intake, extraction schemas, scoring, tuning hot/nurture tiers, or debugging visit/show rates.
---

# Lead qualification

## Purpose

Turn inbound (DM, form, portal) into a **repeatable profile** so the system can **prioritize serious buyers**, route work, **match listings**, and recommend a **single next commercial action**—consultative, not form-factory.

## When to use

- Defining or changing **minimum viable qualification** vs progressive depth.
- **LLM extraction** + validation rules; edge cases (vague budget, “just looking”, investor vs end-user).
- **Scoring** when everything looks “hot” or nothing escalates.
- Auditing **why visits aren’t booking** upstream of matching.

## When not to use

- **Ranking listings** → **property-recommendation** skill.
- **Full DM scripts** → **conversation-design** skill (this skill owns **fields + score + next action type**).
- **CRM stage mapping** alone → **crm-flow-design** skill.

## Inputs (gather first)

- [ ] Channel(s): WhatsApp / IG / form / portal — **intent density** differs.
- [ ] Market: currency, typical **financing** path, zone granularity (neighborhood vs city).
- [ ] Agency rules: **disqualify** lines, **VIP** sources, **human-first** segments.
- [ ] Current pain: slow response, **bad show rate**, **tire-kickers**, or **data mess** in CRM.
- [ ] Existing schema or **must-preserve** CRM fields.

## Workflow

1. **Inventory signals** — Stated (budget, zone, type); **behavioral** (reply speed, depth, ghosting); **metadata** (source, time of day).
2. **Define required fields** — Minimum to allow **match + stage**; mark **progressive** fields (ask after trust).
3. **Normalize** — Currency bands, zone IDs, property type enum, timeline buckets, **financing mode** (cash / mortgage / pre-approved / unknown).
4. **Assess** — **Seriousness**, **urgency**, **budget realism** vs comps (flag **unrealistic** without mocking the buyer).
5. **Capture objections** — Parking, timing, financing doubt, competing listing—**tags**, not essays.
6. **Score** — Weight **intent + fit + urgency + engagement**; document weights; define **hot / standard / nurture / hold**.
7. **Next action** — One primary: e.g. **clarify zone**, **propose 2 listings**, **book visit window**, **assign senior broker**, **nurture cadence**—system must output **action type + rationale**.

## Expected output structure

**A. Field spec (table)**

| Field | Type | Source | Validation | Notes |
|-------|------|--------|------------|--------|
| … | … | user / inferred / CRM | … | … |

**B. Scoring rubric** — Weights; **thresholds**; **override** (broker bump, source VIP).

**C. Machine-friendly record (adapt to your schema)**

```json
{
  "financing_mode": "pre_approved | mortgage_unknown | cash | unknown",
  "budget": { "min": 180000, "max": 220000, "currency": "USD", "realism": "aligned | stretch | unrealistic" },
  "preferred_areas": [{ "zone_id": "…", "priority": 1 }],
  "property_type": "apartment",
  "timeline_months": 3,
  "seriousness": "high | medium | low",
  "urgency": "high | medium | low",
  "objections": ["parking", "financing_uncertainty"],
  "lead_score": 82,
  "score_drivers": ["fast_replies", "specific_budget", "visit_window_stated"],
  "gaps": ["decision_makers"],
  "recommended_next_action": {
    "type": "propose_listings | ask_clarifier | book_visit | human_handoff | nurture",
    "detail": "one line",
    "confidence": 0.86
  }
}
```

**D. Clarification bank** — 1–3 **consultative** question variants per gap (not surveys).

## Project-specific considerations

- **Premium positioning**: questions sound like a **sharp broker**, not a bot collecting fields.
- **Commercial usefulness**: **next action** must map to **pipeline** and **tasks** operators understand.
- **Serious buyers**: weight **behavior + specificity** over politeness; **protect** operator time from **low-seriousness** floods.

## Avoid

- **Parity scoring** that marks everyone 70–85 — useless for prioritization.
- **20 fields** before first value (listing suggestion or human hello).
- **Judgmental** copy in clarifiers — stay **neutral-professional**.
- **SQL** jargon in agency-facing docs — use **qualified pipeline** language.

## Success metrics

% inbound **qualified** in SLA; **median time to recommended_next_action** executed; correlation of score with **visit held** / **offer**.
