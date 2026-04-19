# Lead Qualification v1 - implementation plan

## Goal
Turn messy inbound conversations into a structured lead profile and a reliable commercial assessment that operators can trust.

## Pipeline design (v1)
1. Ingest conversation messages (tenant-scoped) and optional manual overrides.
2. Run deterministic extraction with explicit field-level confidence and evidence.
3. Normalize into a typed lead profile contract.
4. Run explicit scoring model with transparent weighted components.
5. Derive seriousness and urgency from extracted fields + behavioral depth.
6. Recommend one next action with rationale and fallback conditions.
7. Build confidence report (overall + per-field + missing critical fields).
8. Emit structured logs and evaluation metadata for future regression testing.

## Extraction schema (required fields)
- budget: `{ min, max, currency } | null`
- preferredZones: `string[]`
- propertyType: `apartment | townhouse | single_family | unknown`
- bedrooms: `number | null`
- financingMode: `cash | mortgage | pre_approved | unknown`
- timelineMonths: `number | null`
- urgency: `high | medium | low`
- seriousness: `high | medium | low`
- objections: `string[]`
- buyingIntentSummary: `string`

## Scoring logic (explicit)
Total score (0-100) is the sum of:
- profile completeness (max 35)
- urgency signal (max 20)
- seriousness signal (max 20)
- engagement depth (max 15)
- objection-adjusted confidence (max 10)

Priority policy:
- P1: score >= 80, or >=72 with high urgency
- P2: 60-79
- P3: <60

## Confidence handling
- Per-field confidence from extraction stage.
- Overall confidence = mean(field confidence) - penalty per missing critical field.
- Human review trigger when:
  - overall confidence < 0.62, or
  - 2+ critical fields missing.

## Fallback behavior
- Missing 2+ critical fields -> recommended action `ask_clarifier`.
- Mixed signals / low confidence -> `human_handoff`.
- Low urgency + low seriousness -> `nurture`.

## Manual correction
- Pipeline supports `manualOverrides` at run time.
- Overrides are logged as explicit operator interventions.

## Observability and eval hooks
- Structured pipeline logs by step: extract, normalize, score, next_action, confidence, fallback.
- Output includes event metadata for instrumentation (`qualification.updated`) and version tags.

## v1 constraints
- Deterministic rule extraction only (no external model calls yet).
- Zone/objection dictionaries are bootstrap-level and intentionally small.
- Fit for first production slice; designed to accept future LLM extractor behind same typed contract.
