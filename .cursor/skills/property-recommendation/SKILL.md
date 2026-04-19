---
name: property-recommendation
description: Produces ranked property matches with reasoning and tradeoffs for agency buyers—not a dumb filter. Use when designing match APIs, ranking, explainability, or message patterns for listing suggestions.
---

# Property recommendation

## Purpose

Deliver **ranked matches** with **explicit reasoning and tradeoffs** (what you gain/lose vs #2–3) so buyers feel **advised** and agencies trust suggestions—**not** a portal-style filter dump.

## When to use

- Designing **rank + explain** pipelines (rules + optional retrieval/embeddings).
- **UX/copy** for “why this home,” compare, weak-inventory, or conflict states.
- **Operator tools**: why the system ranked X first; **override** with audit.

## When not to use

- **Extracting buyer budget** from chat → **lead-qualification** skill.
- **Writing full conversation scripts** → **conversation-design** skill.
- **CRM stage sync** → **crm-flow-design** skill.

## Inputs (gather first)

- [ ] **Buyer profile** from qualification (budget realism, zones, type, must-haves).
- [ ] **Inventory source**: agency listings vs portal feed — **grounding** rules.
- [ ] **Business rules**: price floors, **exclusive** listings, **seller** priorities (ethical, disclosed).
- [ ] **Constraints** that conflict (budget vs location) — product must expose **tradeoffs**.

## Workflow

1. **Hard eligibility** — Non-negotiables only (type, absolute max price if policy says so). If **zero** results → **say so** and suggest **relax** options with consent.
2. **Soft scoring** — Weighted fit: budget slack, zone fit, size, **condition**, **commute** if modeled, freshness.
3. **Tradeoff layer** — For top 3, make **differences explicit**: “#1 cheaper / smaller”; “#2 better zone / over stretch budget by X%.”
4. **Diversity** — Avoid five identical units unless user asked for comps.
5. **Narration** — 1–2 **specific** reasons per listing tied to **buyer fields**; **caveats** (days on market, **confirm availability**).
6. **Next step** — Visit path, **narrow search**, or **one** clarifying buyer question—aligned with **lead-qualification** `recommended_next_action`.

## Expected output structure

```json
{
  "matches": [
    {
      "listing_id": "lst_…",
      "rank": 1,
      "fit_score": 0.91,
      "reasons": ["Within budget with must-have parking", "Preferred zone A"],
      "tradeoffs_vs_next": "vs #2: smaller floor plan; quieter street",
      "caveats": ["Listed 45d ago — verify availability before visit"]
    }
  ],
  "runner_up_summary": "If budget flexes +8%, opens 2 additional listings in Zone B.",
  "strategy": "prioritize_zone_over_price_slack",
  "fallback": {
    "type": "no_inventory | widen_budget | widen_zone | human_review",
    "message": "operator- or buyer-facing explanation"
  }
}
```

**Deliverables checklist**

- [ ] **Scoring outline**: deterministic vs **LLM narration** boundaries.
- [ ] **Copy templates** for WhatsApp/UI (short; **no** generic adjectives).
- [ ] **Edge playbook**: stale data, **duplicate** portal vs internal, buyer **changes** criteria mid-thread.

## Project-specific considerations

- **Consultative + premium**: reads like **advisor notes**, not **search results**.
- **Commercially useful**: every suggestion should **advance** visit or **honest** repositioning of expectations.
- **Never invent** price, availability, or features—**ground** on rows/refs.

## Avoid

- **Filter-only** behavior with **no ordering rationale**.
- **Identical** “great location” blurbs for every row.
- Hiding **stretch** or **compromise** — brokers win on **honesty**.
- **Pure embedding** k-NN with **no** business guardrails.

## Success metrics

Suggestion **accept** rate; **click-to-visit**; operator **override** rate; time from suggestion to **visit scheduled**.
