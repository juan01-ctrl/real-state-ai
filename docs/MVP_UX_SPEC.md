# MVP product UX specification

This document defines **screens, hierarchy, and interaction principles** for the first shippable product: a **B2B** workspace for **real estate agencies**—**premium**, **operationally clear**, and **commercially sharp**. It complements [`ARCHITECTURE.md`](./ARCHITECTURE.md) and [`DOMAIN_AND_SCHEMA.md`](./DOMAIN_AND_SCHEMA.md).

**Design intent:** the product should feel like **infrastructure brokers trust with money decisions**, not a generic “AI dashboard” or a playful consumer app.

---

## Global UX principles

| Principle | In practice |
|-----------|-------------|
| **Decision-first** | Every screen answers: *what do I do next?* Secondary metrics never compete with **primary queue**. |
| **Scan in seconds** | **Density** where operators work (inbox, lost deals); **breathing room** on marketing-style empty states—not in the working queue. |
| **Trust in AI** | Suggestions are **grounded** (listing cards, reasons, timestamps, “last updated”); **never** anonymous magic scores without **why**. |
| **One pipeline truth** | Stage labels, counts, and CRM language **match**—no duplicate jargon (“Qualified” vs “Hot” without mapping). |
| **Premium = restraint** | Confident typography, limited color roles, **no** chart carnival above the fold on **work** screens. |

**Visual hierarchy (default):** **risk / money / time** → **identity** (name, source) → **stage & score** → **supporting** metadata → **settings / admin** chrome (de-emphasized).

---

## Screen overview (MVP)

| Screen | Primary operator job |
|--------|----------------------|
| Login / onboarding | Enter the workspace; connect what’s required to start earning value. |
| Lead inbox | Choose **who** to work **now**; nothing important hides below noise. |
| Lead detail | Understand **one** deal thread, **act**, **hand off**, **move stage** with confidence. |
| Property matching | Review **why** these homes; **accept**, **discard**, or **book** next step. |
| Follow-up timeline | See **what’s scheduled**, **what failed**, **what needs approval**—no surprises. |
| Analytics dashboard | Understand **funnel health** and **where time goes**—not vanity charts. |
| Lost opportunities | Find **recoverable revenue** and **repeatable failure modes**. |
| Settings / integrations | **Connect** channels and CRM; **control** risk (approvals, quiet hours). |

---

## 1. Login / onboarding

### Primary user goal

Authenticate securely and reach a **credible first-run state**: agency context is clear, and **at least one ingestion path** is connected or explicitly skipped with a **visible reminder**.

### Essential components

- **Login**: email + password or SSO (provider TBD); **minimal** chrome; **no** stock photo hero clutter.
- **Post-auth shell**: agency name, user role, **connection status strip** (channels / CRM: connected · attention · disconnected).
- **Onboarding steps** (wizard or checklist): connect **primary channel** (e.g. WhatsApp / form), **invite teammates**, **optional CRM**; **skip** with persistent **“Finish setup”** entry in settings.

### Information hierarchy

1. **Trust**: product name + one **outcome** line (e.g. “Pipeline you can defend in a Monday meeting”)—**single** sentence, not marketing paragraphs.
2. **Task**: connection checklist with **clear done / not done**.
3. **Support**: doc link, support contact—**tertiary**.

### Critical actions

- Sign in; **complete** or **snooze** onboarding; **open** settings to fix a **red** connection.

### What must feel premium

- **Calm** layout, **sharp** alignment, **no** cluttered signup upsells on login.
- Onboarding **feels like configuration**, not a **tutorial game**—respects expert users.

### What must be visually de-emphasized

- Secondary integrations (“Add later”), legal footers, **non-blocking** tips.

### Responsive considerations

- **Mobile**: login full-width; onboarding **single-column** steps; **large** tap targets for **Connect** CTAs.
- **Desktop**: optional **two-column** preview (e.g. checklist left, **status** right)—**never** hide blocking errors off-screen.

---

## 2. Lead inbox

### Primary user goal

**Prioritize** leads that need action **now**: response debt, **hot** qualification, **stale** money, **approval** queues—**without** reading full threads first.

### Essential components

- **Toolbar**: search (name, phone, listing ref), **filters** (stage, owner, channel, **needs reply**, **approval pending**), **sort** (default: **risk / urgency**, not “newest” only).
- **Row model** (table or **dense** list): **lead identity** (name + source chip), **stage + score** (with **tooltip**: drivers), **last activity** (relative time + **inbound vs outbound** icon), **SLA / silence** indicator (e.g. “No outbound **18h**”), **owner** avatar, **unread** / **pending approval** badge.
- **Bulk** (phase 1.5 if needed): assign owner; **minimal** for MVP—prefer **strong single-row** actions first.
- **Empty state**: “No leads yet” → **connect channel** or **import** CTA—**illustration** optional, **one** primary action.

### Information hierarchy

1. **Attention**: rows breaching SLA or with **pending outbound approval** **surface first** (color **restraint**: **one** alert accent, not rainbow flags).
2. **Commercial signal**: **score** + **stage**—**paired**, so “high score + wrong stage” is visible.
3. **Recency** as **supporting**, not the only sort.

### Critical actions

- **Open** lead detail; **assign** owner; **filter** to “Needs reply” / “Approvals”; **snooze** (if supported) **secondary**.

### What must feel premium

- **Predictable** columns; **aligned** numerics; **no** fake “AI sparkle” on every row—**substance** over decoration.
- **Trust**: when **AI** affects sort or badges, **hover** explains **rule** (“Prioritized: silence **24h** + stage **Contacted**”).

### What must be visually de-emphasized

- **Total lead count** as hero metric (can be **small** stat); **chart** thumbnails **not** in inbox **v1**.
- **Secondary** metadata: full phone, internal IDs—**overflow** or detail drawer.

### Responsive considerations

- **Tablet / mobile**: **card** layout with **same** priority order; **sticky** filter bar; **reduce** columns to: **name + stage**, **silence**, **cta**; **swipe** optional later.

---

## 3. Lead detail

### Primary user goal

Run **one** deal: read context, **move pipeline**, **assign**, **approve** outbound, **schedule** visit, **add note**—with **clear** **next action** always visible.

### Essential components

- **Header**: lead name, **source** + channel, **stage** (prominent **selector** or **stepper** with guardrails), **owner**, **score** + **short** driver summary, **primary CTA** (e.g. **Reply**, **Approve send**, **Book visit**—context-dependent).
- **Conversation panel**: **thread** (chronological), **inbound/outbound** clearly distinct; **pending** outbound draft **highlighted** with **approve / edit / reject**.
- **Sidebar or tabs** (desktop): **Profile** (structured fields from qualification), **Properties** (latest recommendation set), **Notes**, **Tasks**, **History** (stage changes, assignments—**compact** timeline).
- **Footer / sticky bar** (mobile): **stage** + **primary** action—**don’t** bury **approve**.

### Information hierarchy

1. **What’s blocking** (approval needed, unanswered inbound, missing **must-have** fields).
2. **Thread** (last messages **in view** on load).
3. **Structured profile** (budget, zones, timeline, financing, objections).
4. **Everything else** (CRM IDs, raw metadata)—**collapsed**.

### Critical actions

- Change **stage** (with **confirm** if **regressive** or **to Lost**); **assign** owner; **add note**; **approve** AI draft; **manual** send; **open** property match view; **create visit**; **hand off** (explicit **escalation** with reason).

### What must feel premium

- **Stage** changes feel **deliberate** (short **confirmation** copy: “Move to **Qualified**—you’re saying budget + zone are **confirmed**”).
- **AI** outputs are **labeled** (“Suggested reply **v3** · based on last **4** messages”)—**auditability** without clutter.

### What must be visually de-emphasized

- Raw **JSON**, **internal** IDs, **verbose** system logs—**developer** panel optional **hidden**.

### Responsive considerations

- **Mobile**: **tabbed** sections (Thread | Profile | Next); **sticky** approve bar; **stage** in **header** **menu** if space tight.
- **Desktop**: **three-column** optional (thread center, **profile** right); **min-width** for readable thread (**max line length**).

---

## 4. Property matching view

### Primary user goal

**Trust** the suggested homes: see **rank**, **fit**, **reasons**, **tradeoffs**, and **caveats**—then **act** (share to buyer, book visit, **request** different inventory).

### Essential components

- **Buyer constraints summary** (sticky subheader): budget band, zones, must-haves—**editable** entry points **if** policy allows.
- **Ranked list**: each **card** = photo (if available) + **price** + **zone** + **2** **specific** **reasons** tied to buyer fields + **tradeoff vs #2** (when rank > 1) + **caveat** (e.g. days on market).
- **Actions per card**: **Share** (generates channel-appropriate snippet), **Mark not a fit** (feeds eval), **Create visit** (if integrated).
- **Empty / conflict** states: **honest** (“Nothing in inventory matches **zone + budget**”) + **suggested** relaxations **with consent**—**never** fake listings.

### Information hierarchy

1. **Why #1** (reasons + score).
2. **Alternatives** as **comparisons**, not duplicates.
3. **System strategy** label (“Prioritizing **zone** over **price** slack”)—**small** but **visible**.

### Critical actions

- **Regenerate** (with **reason** prompt optional), **share**, **discard set**, **escalate to human** for inventory gap.

### What must feel premium

- **Specific** language (“**Parking** matches request”) vs **generic** (“Great location”).
- **Calm** cards; **no** **flashy** “AI pick” badges—**confidence** via **clarity**.

### What must be visually de-emphasized

- Model name, **embedding** jargon, **debug** scores—**tooltip** or **advanced** fold only.

### Responsive considerations

- **Mobile**: **single-column** cards; **sticky** buyer constraint bar; **bottom** sheet for **share** preview.

---

## 5. Follow-up timeline

### Primary user goal

See **what the system planned**, **what ran**, **what’s waiting on a human**, and **what failed**—so **nothing** “automated” is a **black box**.

### Essential components

- **Filters**: by lead, **status** (scheduled · executed · failed · **needs approval**), date range.
- **Timeline** (vertical): **chronological** **events**—sequence **name**, **step**, **scheduled time**, **executed time**, **outcome** (sent / skipped / failed), **link** to **message** or **task**.
- **Approval queue** embedded or linked: **draft** preview, **approve / edit / reject** inline.
- **Failure** rows: **clear** **error** + **retry** / **fix connection** CTA.

### Information hierarchy

1. **Attention**: **failed** and **pending approval** **above** historical noise.
2. **Upcoming** (next **24–48h**) **compact** list.
3. **Past** **collapsible** by day.

### Critical actions

- **Approve** or **reject** draft; **pause** enrollment for a lead; **retry** failed step; **open** lead detail.

### What must feel premium

- **Reliability** aesthetic: **predictable** spacing, **readable** timestamps (agency timezone), **no** cute icons for **failures**—**clear** **red** state + **fix**.

### What must be visually de-emphasized

- **Successful** bulk history—**collapse** by default after **7** days.

### Responsive considerations

- **Mobile**: **feed** style; **filters** in **sheet**; **approval** as **full-screen** preview.

---

## 6. Analytics dashboard

### Primary user goal

Answer: **Is the machine working?** **Where is time going?** **Are we converting intent into visits?**—for **agency leads**, not data scientists.

### Essential components

- **Narrow hero band** (**not** full-bleed chart wallpaper): **3–4** **diagnostic** KPIs with **definitions** on hover—e.g. **median first response**, **% leads qualified in 24h**, **visit holds** this week, **stage dwell** **Contacted → Qualified** (median hours).
- **Funnel** view: **stage counts** **and** **conversion rates** between **adjacent** stages—**click** → **segment** list (leads) **or** **saved** filter in inbox.
- **Source** breakdown: **channel** × **stage** **or** **visit rate**—**honest** **small** numbers (“Instagram: **high** volume, **lower** qual **%**”).
- **Team** (if multi-agent): **leaderboard** **avoid** **toxic** defaults—prefer **distribution** of response times, not **“top seller”** vibes unless **opt-in**.

### Information hierarchy

1. **Operational health** (time-based metrics).
2. **Funnel** shape (where **volume** **stacks**).
3. **Source quality** (where to **invest** **next** dollar).

### Critical actions

- **Drill down** to **filtered** inbox or **export** (phase 2); **set** date range; **compare** to **prior** period (simple **delta**).

### What must feel premium

- **Sparse** **layout**; **one** **primary** chart type **per** section—**no** **dashboard** **template** **pack**.
- **Footnotes** **on** **definitions** (“Qualified = **budget + zone** **saved** in profile”).

### What must be visually de-emphasized

- **Message volume** as **headline** KPI; **vanity** **totals** without **denominator**.

### Responsive considerations

- **Mobile**: **stack** KPIs; **funnel** as **vertical** **steps** with **rates**; **drill-down** opens **native** **sheet** **with** **count** **+** **“View leads”**.

---

## 7. Lost opportunities dashboard

### Primary user goal

Find **recoverable** deals and **systemic** leaks: **ghosted** threads, **stale** **qualified** leads, **no-shows**, **lost reasons** **patterns**—**actionable**, not **shame** metrics.

### Essential components

- **Segments** as **first-class**: **Stale** (no outbound **N** hours), **Ghosted** (inbound **unanswered** **N** hours), **Post-visit silence**, **Qualified but no visit scheduled**, **Lost** **last 30d** with **reason** **distribution**.
- **Each segment**: **count**, **trend** **spark optional**, **primary** **action** (“**Open** **list** in inbox” **with** **filter** **pre-applied**).
- **Lost reasons** chart: **bar** by **`LostReason`** **category**—**click** → **list** **of** **leads**.
- **No** **punitive** **copy**—**neutral** **ops** language (“**Needs** **attention**” **not** “**Bad** **agents**”).

### Information hierarchy

1. **Recoverable** **now** (stale / ghosted)—**top**.
2. **Structural** **loss** **analysis** (reasons, **sources**).
3. **Historical** **trend** **optional** **MVP**.

### Critical actions

- **Open** **workqueue** **for** **segment**; **assign** **round-robin** (later); **export** (later); **add** **note** **template** **for** **recovery** **(later)**.

### What must feel premium

- **Serious** **tool** **tone**; **high** **data-to-ink** ratio; **action** **always** **paired** **with** **segment**.

### What must be visually de-emphasized

- **Guilt** **UX**; **unbounded** **red** **everywhere**—**use** **one** **alert** **role** **sparingly**.

### Responsive considerations

- **Cards** **per** **segment** **on** **mobile**; **full-width** **CTA** **per** **card**.

---

## 8. Settings / integrations

### Primary user goal

**Control** **risk** and **connectivity**: **channels**, **CRM**, **messaging** **policy** (approvals, quiet hours), **team**—**without** **hunting**.

### Essential components

- **Sections**: **Organization** (name, timezone), **Channels** (cards per **connection**: status, **last** **sync**, **reconnect**), **CRM** (provider, **mapping** **preview** **internal** **stage** ↔ **external**), **Messaging** **policy** (default **approval** **for** **AI** **outbound**, **auto-send** **thresholds** **if** **any**), **Team** **(users)**, **Notifications** (email **digest** **optional** **MVP**).
- **Danger** **zone**: **disconnect** **channel**, **delete** **data**—**confirm** **modal** **with** **type-to-confirm** **for** **destructive**.

### Information hierarchy

1. **Broken** **or** **attention** **required** **integrations** **top**.
2. **Policy** **that** **affects** **buyers** **(approvals)** **prominent**.
3. **Cosmetic** **org** **settings** **below**.

### Critical actions

- **Connect** / **reconnect** **OAuth**; **edit** **quiet** **hours**; **toggle** **approval** **defaults**; **invite** **user**; **revoke** **access**.

### What must feel premium

- **Settings** **feel** **solid**: **clear** **sections**, **no** **infinite** **nested** **menus** **on** **mobile**.

### What must be visually de-emphasized

- **Advanced** **developer** **hooks** **(webhook** **URLs)**—**collapse** **under** **Advanced**.

### Responsive considerations

- **Mobile**: **accordion** **sections**; **integration** **cards** **full-width**; **OAuth** **flows** **open** **in** **same** **tab** **with** **return** **state** **clear**.

---

## Cross-cutting: trust in AI (all screens)

- **Every** **AI-touched** **artifact** **links** **to** **trace**: **template** **version**, **timestamp**, **or** **“View** **run”** **deep** **link** **(admin/agent** **role-gated)**.
- **Scores** **always** **explain** **drivers** **on** **hover** **or** **inline** **subline**.
- **Failure** **states** **for** **AI** **(timeout,** **refusal)** **are** **user-safe** **copy** **+** **fallback** **(human** **task** **created)**.

---

## Navigation model (MVP)

**Primary nav (desktop):** **Inbox** · **Follow-ups** · **Analytics** · **Lost** · **Settings**  
**Lead detail** and **property match** are **routes** **from** **inbox** **/** **lead** **(not** **top-level** **noise**).

**Mobile:** **bottom** **nav** **or** **hamburger** **with** **same** **order**; **lead** **detail** **is** **full-screen** **stack**.

---

## What we deliberately avoid (MVP)

- **Generic** **“dashboard”** **widgets** **(weather,** **unrelated** **news)**.
- **Gamification** **(badges,** **streaks)** **for** **core** **work** **queues**.
- **Hiding** **approval** **behind** **multiple** **clicks** **on** **mobile**.
- **Equating** **“AI** **replies”** **with** **success** **in** **any** **headline** **metric**.

---

## Document map

| Doc | Role |
|-----|------|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | System boundaries, sync/async, AI pipelines |
| [`DOMAIN_AND_SCHEMA.md`](./DOMAIN_AND_SCHEMA.md) | Entities and Prisma direction |
| **MVP_UX_SPEC.md** (this file) | Screens, hierarchy, **premium** **bar** |

---

*Version: 1.0 — align **copy** **with** `.cursor/rules/ui-ux-standards.mdc` **and** **domain** **language**; **iterate** **after** **first** **pilot** **agency**.*
