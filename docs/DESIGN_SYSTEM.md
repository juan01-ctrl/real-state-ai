# Design system — Real estate sales platform

This guide is **implementation-first** for **Next.js + Tailwind CSS + shadcn/ui**. It targets a premium B2B operations product (inbox, pipeline, analytics)—not a marketing landing page. Conceptual references: **Stripe** (trust, restraint), **Linear** (density + speed), **Vercel** (typography, surfaces), applied to brokerage workflows and AI-grounded UI.

**Stack:** Tailwind 3.4+, `class-variance-authority` (CVA) for variants, shadcn primitives as the base—extend via composition and tokens, not one-off overrides everywhere.

---

## 1. Design principles

| Principle | In practice |
|-----------|-------------|
| **Operational clarity** | One primary action per dense view; scanning beats scrolling for queues. |
| **Calm confidence** | Limited accent colors; no rainbow status chips—each color role has a meaning. |
| **Honest density** | Tables and threads use real line-height and padding that survive long sessions—not cramped “spreadsheet cosplay.” |
| **Trust in systems** | AI and automation are labeled, timestamped, and grounded—never mystery sparkles. |
| **Commercial sharpness** | Money and time-at-risk surface before vanity metrics; typography hierarchy carries the UI, not decoration. |

**Anti-patterns:** illustration-heavy empty states inside work queues; chart walls above actionable lists; “AI” badges on every row.

---

## 2. Spacing system

Use Tailwind’s 4px grid consistently. Prefer semantic rhythm (`section` vs `compact`) over arbitrary one-off values.

| Token | Tailwind | Use |
|-------|----------|-----|
| tight | `gap-1` / `p-1` | Inline badges, chip groups |
| compact | `gap-2` / `p-2` | Table cells, dense metadata |
| default | `gap-3` / `p-3` | Cards, form groups |
| comfortable | `gap-4` / `p-4` | Panels, modals, settings sections |
| section | `gap-6` `py-6` `px-4` sm:`px-6` | Page sections, split layouts |

**Page shell**

- App chrome: content area `px-4 lg:px-8 py-6` with optional `max-w-[1600px] mx-auto`.
- Sticky filter toolbars (inbox): `py-3 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80` (Linear-like).

**Implementation**

```tsx
<main className="mx-auto w-full max-w-[1600px] px-4 py-6 lg:px-8">
  {/* ... */}
</main>
```

**Lists:** Prefer `divide-y divide-border` + `py-3` per row for scan lines; avoid only `gap` without dividers on dense operational lists.

---

## 3. Typography hierarchy

**Fonts**

- **Sans (UI):** `font-sans` — Inter or Geist Sans via `next/font` in `layout.tsx`.
- **Mono:** `font-mono text-xs` for external message IDs, event keys, debug—never for body copy.

| Role | Tailwind | Usage |
|------|----------|--------|
| Page title | `text-2xl font-semibold tracking-tight text-foreground` | Use sparingly; inbox may use smaller if toolbar carries context |
| Section title | `text-sm font-semibold text-foreground` | Card headers, panel titles |
| Body | `text-sm leading-relaxed text-foreground` | Threads, notes |
| Secondary | `text-sm text-muted-foreground` | Metadata, captions |
| Label | `text-xs font-medium text-muted-foreground` | Form labels; uppercase `tracking-wide` only for table headers if needed—use sparingly |
| Numeric | `text-sm font-medium tabular-nums text-foreground` | Scores, money, SLA hours |

**Line length:** Cap message text with `max-w-prose` or `max-w-[52ch]` on bubbles.

**shadcn:** Apply the same tokens via `className` on `CardTitle`, `FormLabel`, `TableHead` for consistency.

---

## 4. Color role system

Map to shadcn CSS variables in `globals.css`. Semantic roles first; brand accent is secondary to functional meaning.

| Role | Variable | Purpose |
|------|----------|---------|
| Page | `--background` / `--foreground` | Default canvas and text |
| Raised | `--card` / `--card-foreground` | Cards, popovers |
| Muted | `--muted` / `--muted-foreground` | Secondary chrome, placeholders |
| Border | `--border` | 1px hairlines |
| Accent | `--accent` | Row hover, subtle selection |
| Primary | `--primary` | One strong CTA per region |
| Destructive | `--destructive` | Irreversible actions, failed sends |
| Ring | `--ring` | Focus visible—never remove |

**Operational tokens (extend theme)**

Add to `globals.css` as HSL and wire in `tailwind.config.ts`:

```ts
// tailwind.config.ts — extend colors
colors: {
  attention: "hsl(var(--attention))",
  "attention-foreground": "hsl(var(--attention-foreground))",
  success: "hsl(var(--success))",
  risk: "hsl(var(--risk))",
}
```

| Token | When | Guidance |
|-------|------|----------|
| `attention` | Reply debt, approval pending | One accent per row max; pair with icon + short label |
| `risk` | Stale pipeline, ghosted, failed jobs | Don’t paint entire rows red—left border or badge |
| `success` | Delivered, synced | Subtle; avoid green everywhere |

**Dark mode:** Ship light + dark early (Stripe-style); verify tables and borders in both.

---

## 5. Surface system

Elevation is subtle: border + background shift, not heavy shadow stacks (Vercel/Linear bias).

| Level | Pattern | Classes |
|-------|---------|---------|
| Base | Page | `bg-background text-foreground` |
| Inset | Thread pane, filter well | `bg-muted/30 rounded-md` or `bg-muted/40` |
| Raised | Cards, dropdowns | `bg-card border border-border rounded-lg shadow-sm` |
| Overlay | Dialog, sheet | `bg-background border shadow-lg` |

**Dividers:** `border-border`; lists use `divide-y divide-border`.

**Focus:** Keep shadcn defaults: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`.

---

## 6. Components

### 6.1 Cards

Use shadcn `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`. Default padding `p-4`; nested dense grids `p-3`. Header: `flex items-start justify-between gap-4` with title left, actions right.

### 6.2 Tables

Wrap in `rounded-md border` + `overflow-x-auto`. Header cells: `text-muted-foreground font-medium h-10 px-3 text-left align-middle`. Body rows: `h-12` or `h-14` for touch; `hover:bg-muted/50` + `cursor-pointer` when row opens lead. Sticky header: `thead sticky top-0 z-10 bg-card shadow-sm`. Numeric columns: `text-right tabular-nums`.

### 6.3 Panels (split layouts)

Lead detail: e.g. `grid gap-0 lg:grid-cols-[1fr_320px]` with sidebar `border-l border-border`. Panel title row: `text-sm font-semibold px-4 py-3 border-b`.

### 6.4 Badges

Extend `Badge` with CVA variants: keep `default`, `secondary`, `outline`, `destructive`, add `attention` and `risk` for operations.

| Variant | Use |
|---------|-----|
| `outline` | Stage labels (default) |
| `secondary` | Source chips (WhatsApp, Form) |
| `attention` (custom) | SLA / needs reply |
| `risk` (custom) | Stale / ghosted |

Avoid more than two badges per cell—merge into one line with middot or a tooltip.

### 6.5 Alerts

Use `Alert`, `AlertTitle`, `AlertDescription`. Page-level for integration failure; inline for forms. Prefer one summary alert + “View details” over five stacked alerts.

---

## 7. Chart style (analytics / lost)

- One primary metric per card; minimal gridlines; muted axis labels; no 3D.
- Library: Recharts or Visx inside `Card` with `h-[240px]` max on widgets.
- Series color: `hsl(var(--primary))` or foreground at ~80% opacity.
- Grid stroke: `stroke-muted` at low opacity.
- Tooltip: `bg-popover text-sm border shadow-md rounded-md p-2`.
- Sparklines: height 32–40px only when the trend drives a decision.

**Do not** place full-width chart heroes on inbox—charts belong on Analytics and Lost Opportunity routes.

---

## 8. Empty states

| Context | Pattern |
|---------|---------|
| Inbox empty | `text-sm font-medium` title, one sentence outcome, primary button “Connect channel” or “Open settings” |
| Filtered empty | “No leads match filters” + link “Clear filters” |
| Thread empty | Rare—use skeleton while loading |
| Analytics thin data | Neutral copy + hint to widen date range—never blame the user |

Skip large illustrations in operator paths (optional on marketing only).

---

## 9. AI insight components

Goal: grounded, inspectable, calm.

| Pattern | Implementation |
|---------|----------------|
| Insight strip | `Alert` default, or `rounded-md border border-dashed bg-muted/50 p-3 text-sm` |
| Title | “Suggested next step” / “Profile updated”—avoid “✨ AI” in the title |
| Body | 1–2 lines; metadata `text-xs text-muted-foreground` with `promptVersion` or `updatedAt` |
| Actions | `Button variant="outline" size="sm"` — Apply / Edit / Dismiss |

Raw extraction JSON: `ScrollArea` + `max-h-48` + `font-mono text-xs`, behind “Advanced” or admin-only.

---

## 10. Lead priority indicators

Do not rely on color alone—pair icon + label + tooltip.

| Level | UI |
|-------|-----|
| P1 (now) | `Badge` with `attention` + `Clock` or `AlertCircle` (16px) |
| P2 (scheduled) | `outline` badge + relative time |
| P3 (nurture) | `text-muted-foreground` only—no badge unless filtering |

Score: `tabular-nums`; optional micro-bar `h-1.5 w-12 rounded-full bg-muted` with foreground fill by percent—keep subtle.

---

## 11. Recommendation explanation blocks

ASCII structure for property match cards:

```
┌─────────────────────────────────────────────┐
│ [Thumb]  Title · Price              #1      │
│          Zone · key attrs                  │
│          ─────────────────────────────────  │
│          Match reasons (2 bullets max)      │
│          Tradeoff vs #2 (one line, muted)   │
│          Caveat (text-xs, muted)            │
│          Footer: secondary actions          │
└─────────────────────────────────────────────┘
```

- Card: `Card` + `overflow-hidden`; image `aspect-[4/3]` or `bg-muted` placeholder.
- Rank: `Badge variant="secondary"` top-right.
- Reasons: `ul list-disc list-inside text-sm space-y-1` or `CheckCircle2` inline.
- Tradeoff: `text-xs text-muted-foreground border-l-2 border-border pl-3`.

---

## 12. Timeline / activity

Vertical timeline (follow-ups, stage history):

- Wrapper: `relative pl-6` with pseudo or child line: `absolute left-2 top-2 bottom-2 w-px bg-border`.
- Node: `absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 bg-background` — success uses `border-primary`, failure `border-destructive`.
- Row spacing: `pb-4`, last `pb-0`.
- Timestamp first line: `text-xs text-muted-foreground tabular-nums`.

Use `ScrollArea` inside `Sheet` on mobile for long timelines.

---

## 13. Forms and filters

**Forms:** shadcn `Form` + `FormField` + `FormItem` + `FormLabel` + `FormControl` + `FormMessage`. Input height `h-9` default, `h-10` on mobile-heavy screens. Labels always visible—no placeholder-only labels.

**Filters (inbox toolbar):** `Popover` + `Command` for multi-select, or one `Select` per dimension; cap visible controls at 3–4. Active filters as `Badge variant="secondary"` with clear (×); `Button variant="ghost" size="sm"` for “Clear all”. Persist in URL `searchParams` for shareable views (`useSearchParams`).

Toolbar layout: `flex flex-wrap items-center gap-2 min-h-10`.

---

## 14. Mobile behavior

| Pattern | Implementation |
|---------|----------------|
| Navigation | Bottom bar or `Sheet` for secondary nav; lead detail as full-screen route |
| Tables | Inner `min-w-[640px]` + horizontal scroll, or card list—pick one pattern per screen for MVP |
| Approvals | Sticky bottom `border-t bg-background p-4 flex gap-2` for Approve / Edit |
| Touch targets | ≥44px on primary actions |
| Motion | Respect `prefers-reduced-motion` for non-essential animation |

---

## 15. File organization

```
components/
  ui/                    # shadcn primitives — avoid forking
  app/
    lead-priority-badge.tsx
    insight-strip.tsx
    recommendation-card.tsx
    stage-select.tsx
    kpi-stat.tsx
lib/
  utils.ts               # cn()
```

Use PascalCase; domain prefix when ambiguous (`LeadRow`, `FollowUpTimelineItem`).

---

## 16. Bootstrap checklist

- [ ] `npx shadcn@latest init` with CSS variables theme
- [ ] Inter or Geist in root `layout.tsx`
- [ ] Extend Tailwind with `attention`, `risk`, `success` in `globals.css`
- [ ] `components.json` paths: `@/components`, `@/lib`
- [ ] Document component variants here or in Storybook (optional)

---

## Cross-references

- Screen UX: [`MVP_UX_SPEC.md`](./MVP_UX_SPEC.md)
- Cursor rules: `.cursor/rules/ui-ux-standards.mdc`

---

*Version: 1.0 — adjust spacing after real data pilot; keep semantic tokens stable when brand colors shift.*
