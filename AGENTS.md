# Agents & AI context

Project customization lives under [`.cursor/`](.cursor/):

| Layer | Path | Role |
|-------|------|------|
| Rules | [`.cursor/rules/`](.cursor/rules/) | Always-on and file-scoped `.mdc`—product bar, domain, stack |
| Skills | [`.cursor/skills/`](.cursor/skills/) | Repeatable workflows and output shapes |
| Subagents | [`.cursor/agents/`](.cursor/agents/) | Specialist briefs—**mandate**, handoffs, anti-patterns |
| Scratchpad | [`.cursor/scratchpad.md`](.cursor/scratchpad.md) | Ephemeral session notes (no secrets) |

**Rules** state *what must be true*. **Skills** are *how to execute* a workflow. **Subagents** are *who owns* a decision area and *who to hand off to*.

## Subagents

| Agent | File | Mandate |
|-------|------|---------|
| Real estate strategist | [`real-estate-strategist.md`](.cursor/agents/real-estate-strategist.md) | ICP, funnel economics, stage policy, roadmap tied to visits and revenue |
| Frontend & marketing designer | [`frontend-marketing-designer.md`](.cursor/agents/frontend-marketing-designer.md) | Premium marketing + operator UI; inbox, pipeline, design system |
| Next.js SaaS engineer | [`nextjs-saas-engineer.md`](.cursor/agents/nextjs-saas-engineer.md) | App Router implementation, tenant-safe data UI, performance |
| Backend & systems engineer | [`backend-systems-engineer.md`](.cursor/agents/backend-systems-engineer.md) | Schema, webhooks, queues, CRM/channel integrations, events |
| AI orchestration architect | [`ai-orchestration-architect.md`](.cursor/agents/ai-orchestration-architect.md) | Extraction, scoring, matching pipelines, eval, observability |
| Conversion copywriter | [`conversion-copywriter.md`](.cursor/agents/conversion-copywriter.md) | Positioning and paste-ready copy for operators and buyers |
| Language (es product) | [`language-es-ar.md`](.cursor/agents/language-es-ar.md) | All user-facing copy in Spanish; es-AR tone for operator UI; no English labels in the product surface |

## Skills (workflows)

| Skill | Folder |
|-------|--------|
| Lead qualification | [`lead-qualification/`](.cursor/skills/lead-qualification/SKILL.md) |
| Property recommendation | [`property-recommendation/`](.cursor/skills/property-recommendation/SKILL.md) |
| Sales funnel audit | [`sales-funnel-audit/`](.cursor/skills/sales-funnel-audit/SKILL.md) |
| Conversation design | [`conversation-design/`](.cursor/skills/conversation-design/SKILL.md) |
| Dashboard UX audit | [`dashboard-ux-audit/`](.cursor/skills/dashboard-ux-audit/SKILL.md) |
| CRM flow design | [`crm-flow-design/`](.cursor/skills/crm-flow-design/SKILL.md) |
| Feature spec writer | [`feature-spec-writer/`](.cursor/skills/feature-spec-writer/SKILL.md) |

## Rules and globs

File-scoped rules use `globs` in each `.mdc`. Tighten patterns (e.g. `app/**`) once the tree is stable; broad `**/*.tsx` remains valid early on.
