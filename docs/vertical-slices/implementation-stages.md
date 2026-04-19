# Implementation stages

## Stage 1 - Data and domain backbone
- Add Prisma schema for multi-tenant lead CRM primitives.
- Add database client and environment contract.
- Keep qualification pipeline as standalone domain module.

## Stage 2 - Ingestion + qualification persistence
- Add `POST /api/leads/intake` to ingest messages and run qualification.
- Persist lead, conversation, messages, profile, stage history, ai run, and analytics event.
- Add confidence-based manual review task creation.
- Add `GET /api/leads/:leadId` snapshot route.

## Stage 3 - Operator workflow UI
- Build lead inbox from persisted rows (priority/score/SLA sorting).
- Build lead detail with conversation, profile edit, next action, notes.

## Stage 4 - Automation + recommendation
- Add follow-up scheduler and approval queue.
- Add recommendation ranking pipeline and explanation blocks.
- Persist generated follow-up events and ranked recommendations for each lead.

## Stage 5 - Intelligence and lost opportunity
- Add funnel/lost-opportunity projections.
- Add operator decision dashboard for channel/campaign/agent insights.
