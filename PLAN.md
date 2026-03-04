# DocPulse — Documentation Analytics Dashboard
## End-to-End Project Plan

---

## Executive Summary

**Project name:** DocPulse
**Tagline:** Treat your docs like a product. Measure them like one.
**What it is:** An analytics dashboard purpose-built for documentation teams. It tracks page views, time on page, search queries (including failed searches), user feedback, content freshness, coverage gaps, and ticket deflection — all in a single interface designed specifically for technical writers, not marketers.

**Why this project:**
None of your current 10 documentation sites show measurement. They show you can write excellent documentation, but not that you can measure its impact. Every documentation manager and VP of Engineering asks the same question: "How do we know our docs are working?" DocPulse is your answer — and it's the project that bridges the gap between "Senior Technical Writer" and "Documentation Team Lead."

**What makes it best-in-class:**
- Purpose-built for documentation (not repurposed marketing analytics)
- Failed search detection — surfaces what users looked for and couldn't find
- Content freshness scoring — flags docs that haven't been updated since the product changed
- Ticket deflection tracking — connects docs to support ticket reduction
- Content coverage matrix — visual map of what's documented vs. what exists
- Lightweight: runs on your existing GitHub Pages sites with a single script tag
- Open-source, free, no SaaS lock-in

---

## Strategic Positioning

### The career gap this fills

| What you have | What it proves |
|---------------|---------------|
| 10 live doc sites | You write excellent documentation |
| DocCraft AI | You can automate content creation |
| PPT2Video | You can build engineering pipelines |
| SpecFlow | You can build documentation infrastructure |
| DocQuery | You understand AI + docs retrieval |
| **DocPulse** | **You treat documentation as a measurable product** |

DocPulse is the leadership project. It says: "I don't just write docs. I measure whether they work, identify what's failing, and know how to improve them with data." This is exactly what companies hiring Documentation Team Leads and Documentation Architects want to hear.

### Competitive landscape

| Tool | Focus | DocPulse advantage |
|------|-------|-------------------|
| Google Analytics | Generic web analytics | DocPulse has doc-specific metrics (freshness, coverage, failed search) |
| GitBook Analytics | Tied to GitBook platform | DocPulse works with any documentation site |
| Document360 Analytics | Tied to Document360 platform | DocPulse is open-source, platform-agnostic |
| ReadMe Analytics | Tied to ReadMe platform | DocPulse works on static GitHub Pages sites |
| Heap / Hotjar | General product analytics | DocPulse understands documentation structure |

No open-source, platform-agnostic documentation analytics tool exists. DocPulse fills that gap.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA COLLECTION LAYER                      │
│                                                              │
│  Lightweight JS Tracker (< 5KB)                              │
│  Embedded on any doc site via <script> tag                   │
│                                                              │
│  Tracks:                                                     │
│  ├── Page views + timestamps                                 │
│  ├── Time on page (active reading time, not idle)            │
│  ├── Scroll depth (25% / 50% / 75% / 100%)                 │
│  ├── Search queries (captures input from site search)        │
│  ├── Search results: found / not found                       │
│  ├── Copy events (code blocks copied)                        │
│  ├── Feedback: thumbs up/down + optional text                │
│  ├── Navigation paths (page → page flows)                    │
│  ├── External link clicks (to API references, etc.)          │
│  └── Referrer (from support ticket? from product? from search?) │
│                                                              │
│         ▼                                                    │
│  Events sent to → API endpoint (batched, every 30s)          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    PROCESSING LAYER                          │
│                                                              │
│  FastAPI Backend                                             │
│  ├── Event ingestion endpoint                                │
│  ├── Aggregation jobs (hourly/daily rollups)                 │
│  ├── Content freshness checker (GitHub commit dates)         │
│  ├── Coverage analyzer (sitemap vs. product feature list)    │
│  └── Failed search clusterer                                 │
│                                                              │
│  Storage: SQLite (dev) / PostgreSQL (prod)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD (Next.js)                        │
│                                                              │
│  ┌─────────────┬──────────────┬────────────────┐            │
│  │  Overview   │  Content     │  Search        │            │
│  │  Dashboard  │  Performance │  Analytics     │            │
│  ├─────────────┼──────────────┼────────────────┤            │
│  │  Freshness  │  User        │  Coverage      │            │
│  │  Monitor    │  Feedback    │  Matrix        │            │
│  ├─────────────┼──────────────┼────────────────┤            │
│  │  Ticket     │  Content     │  Reports       │            │
│  │  Deflection │  Gaps        │  & Export      │            │
│  └─────────────┴──────────────┴────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Tracker** | Vanilla JS (< 5KB, no dependencies) | Must be ultra-lightweight for doc sites |
| **Backend** | FastAPI (Python) | Consistent with your other projects, great for APIs |
| **Database** | SQLite (dev) → PostgreSQL (prod via Supabase free tier) | Zero-config dev, scalable prod |
| **Frontend** | Next.js 14 + Tailwind CSS + Recharts | Consistent with DocCraft/SpecFlow stack |
| **Charts** | Recharts (React) + D3.js (custom visualizations) | Coverage matrix needs D3 |
| **Git integration** | GitHub API (content freshness) | Checks last commit date per doc file |
| **Deployment** | Vercel (dashboard) + Railway (API) | Free tier covers demo |

---

## Metrics Framework

### Tier 1: Core Usage Metrics

| Metric | What it measures | Why it matters |
|--------|-----------------|----------------|
| **Page views** | How many times each page is viewed | Basic traffic — which docs get used |
| **Unique visitors** | Distinct users (fingerprint, no PII) | Reach of documentation |
| **Active reading time** | Time spent actively reading (not idle tab) | Engagement quality — 10s vs 5min tells different stories |
| **Scroll depth** | How far users scroll (25/50/75/100%) | Are users reading the full page or bouncing early? |
| **Code copy events** | How often code blocks are copied | Direct signal of developer usage |
| **Bounce rate** | % of visitors who leave after one page | High bounce = content mismatch or poor discoverability |

### Tier 2: Search & Discovery Metrics

| Metric | What it measures | Why it matters |
|--------|-----------------|----------------|
| **Top search queries** | What users search for most | Reveals what users need vs. what you promote |
| **Failed searches** | Queries that returned zero results | **Gold mine** — tells you exactly what's missing |
| **Search-to-page conversion** | After searching, did the user find a page? | Measures search effectiveness |
| **Navigation paths** | Page A → Page B → Page C flows | Shows how users navigate — are they finding things logically? |
| **Entry pages** | Which pages users land on first | Often not the homepage — often deep links from support tickets |
| **Referrer analysis** | Where users come from (search engine, support tool, product) | Connects doc usage to business context |

### Tier 3: Content Quality Metrics

| Metric | What it measures | Why it matters |
|--------|-----------------|----------------|
| **Content freshness score** | Days since last update vs. product release cadence | Stale docs are wrong docs |
| **Feedback score** | Thumbs up/down ratio per page | Direct user sentiment |
| **Feedback comments** | Free-text feedback per page | Qualitative insight |
| **Coverage score** | % of product features/endpoints that have documentation | Identifies undocumented areas |
| **Readability score** | Automated readability index per page | Complexity vs. audience level |

### Tier 4: Business Impact Metrics

| Metric | What it measures | Why it matters |
|--------|-----------------|----------------|
| **Ticket deflection rate** | Support tickets before/after doc improvements | Proves docs reduce support costs |
| **Time to resolution** | When support links docs, how fast is the ticket closed? | Measures doc effectiveness for support |
| **Onboarding completion** | Do new users complete the Getting Started guide? | Measures developer onboarding success |

---

## Feature Breakdown (Phased)

### Phase 1: Tracker + Core Dashboard (Weeks 1–3)
*Goal: Embed a script, see page-level analytics in a dashboard.*

**1.1 Lightweight JavaScript Tracker**
```html
<!-- Embed on any doc site -->
<script
  src="https://docpulse.vercel.app/tracker.js"
  data-site="vaultpay"
  data-api="https://docpulse-api.railway.app"
  async
></script>
```

Tracker features:
- Under 5KB gzipped — zero performance impact on doc sites
- No cookies — uses anonymous session fingerprint (privacy-respecting)
- Batches events — sends every 30 seconds, not per interaction
- Tracks:
  - Page view (URL, title, timestamp, referrer)
  - Active reading time (pauses timer when tab is hidden or user is idle > 30s)
  - Scroll depth (fires at 25%, 50%, 75%, 100% thresholds)
  - Code block copy (detects clipboard copy from `<pre>` / `<code>` elements)
  - Outbound link clicks

**1.2 Event Ingestion API**
```
POST /api/events
Body: {
  "site": "vaultpay",
  "session_id": "anon_abc123",
  "events": [
    { "type": "pageview", "url": "/authentication", "title": "Authentication", "timestamp": "...", "referrer": "..." },
    { "type": "reading_time", "url": "/authentication", "seconds": 187 },
    { "type": "scroll", "url": "/authentication", "depth": 75 },
    { "type": "code_copy", "url": "/authentication", "block_index": 2 }
  ]
}
```

- Rate limiting: 100 events/minute per session
- Batch processing: aggregation job runs hourly
- Storage: raw events + hourly rollups + daily summaries

**1.3 Overview Dashboard**
The main dashboard screen — what you see when you open DocPulse.

**Hero metrics (top row, large cards):**
- Total page views (last 7 days, with trend arrow)
- Unique visitors (last 7 days)
- Average active reading time
- Top page today

**Page views over time (line chart):**
- Daily page views, last 30 days
- Filterable by: page, section, date range

**Top 10 pages (bar chart):**
- Ranked by page views
- Secondary metric: average reading time

**Engagement heatmap:**
- Calendar heatmap (GitHub contribution graph style)
- Shows activity density by day

**1.4 Page-Level Detail View**
Click any page to see:
- Views over time (line chart)
- Average reading time
- Scroll depth distribution (bar chart: what % reach 25/50/75/100%)
- Code block copy count per block
- Referrer breakdown (pie chart)
- Feedback summary (thumbs up/down count)

---

### Phase 2: Search Analytics + Feedback (Weeks 4–5)
*Goal: Track what users search for and capture direct feedback.*

**2.1 Search Query Capture**
The tracker hooks into common documentation search implementations:
- Detects `<input>` elements with common search selectors:
  - `[type="search"]`, `.search-input`, `#search`, `[role="search"]`
- Captures: query text, timestamp, results count (if detectable)
- Fires: `search_query` event on submit/enter

**2.2 Failed Search Detection**
- If search results page contains "no results" / "nothing found" patterns → mark as failed
- Group similar failed queries using fuzzy matching (Levenshtein distance)
- Dashboard view: **"Users searched for these but found nothing"**

```
┌─────────────────────────────────────────────────────────┐
│  Failed Searches (Last 30 Days)                         │
│                                                         │
│  Query                    │ Count │ Action              │
│  ─────────────────────────┼───────┼──────────────────── │
│  3D Secure EU cards       │  12   │ [Create Page]       │
│  webhook retry policy     │   8   │ [Create Section]    │
│  sandbox environment      │   6   │ [Create Page]       │
│  rate limiting            │   5   │ [Add to FAQ]        │
│  idempotency key format   │   3   │ [Create Section]    │
└─────────────────────────────────────────────────────────┘
```

This is one of the most powerful features. It directly tells you what to write next.

**2.3 User Feedback Widget**
Inject a lightweight feedback component at the bottom of each doc page:
```
┌─────────────────────────────────────────┐
│  Was this page helpful?   👍  👎       │
│                                         │
│  [Optional: Tell us more...]            │
└─────────────────────────────────────────┘
```

- Thumbs up/down stored with page URL + timestamp
- Optional free-text feedback (max 500 chars)
- Dashboard: pages ranked by feedback score (worst first)
- Alert: flag pages with > 30% negative feedback

**2.4 Search Analytics Dashboard**
- **Top queries** — what users search for most (word cloud + table)
- **Failed queries** — prioritized by frequency
- **Search → page conversion** — after searching, which page did they visit?
- **Zero-result rate** — % of searches that return nothing (trend line)

---

### Phase 3: Content Freshness & Coverage (Weeks 6–7)
*Goal: Know which docs are stale and which product areas have no docs.*

**3.1 Content Freshness Monitor**
Connects to the GitHub repo backing your doc site.

For each page:
- Fetch last commit date from GitHub API
- Compare against product release dates (configurable)
- Calculate freshness score:
  - **Fresh** (green): Updated within last release cycle
  - **Aging** (amber): Not updated in 2+ release cycles
  - **Stale** (red): Not updated in 6+ months
  - **Abandoned** (black): Not updated in 12+ months

Dashboard: **Freshness Heatmap**
```
┌───────────────────────────────────────────────────┐
│  Content Freshness — VaultPay API Docs             │
│                                                    │
│  Page                      │ Last Updated │ Status │
│  ──────────────────────────┼──────────────┼─────── │
│  Authentication            │ 2 weeks ago  │  🟢    │
│  Charges API               │ 1 month ago  │  🟢    │
│  Disputes                  │ 4 months ago │  🟡    │
│  Webhooks                  │ 7 months ago │  🔴    │
│  Legacy v1 Migration       │ 14 months    │  ⚫    │
│                                                    │
│  Overall Freshness Score: 72/100                   │
└───────────────────────────────────────────────────┘
```

**3.2 Content Coverage Matrix**
This is the feature that demonstrates documentation strategy thinking.

Define a product feature list (manual input or auto-generated from OpenAPI spec):
```yaml
# coverage.yaml
product: VaultPay
features:
  - name: Authentication
    endpoints: [/auth/token, /auth/refresh, /auth/revoke]
    doc_pages: ["/authentication"]
    status: documented
  - name: 3D Secure
    endpoints: [/3ds/initiate, /3ds/verify]
    doc_pages: []
    status: undocumented        # ← gap!
  - name: Charges
    endpoints: [/charges, /charges/{id}, /charges/{id}/capture]
    doc_pages: ["/charges"]
    status: partial             # ← only 2 of 3 endpoints documented
```

Dashboard: **Coverage Matrix (D3.js visualization)**
```
                    API Ref  Admin Guide  Tutorial  FAQ
Authentication       ✅        ✅           ✅       ✅     100%
Charges              ✅        ✅           ✅       ❌      75%
Refunds              ✅        ✅           ❌       ❌      50%
Disputes             ✅        ❌           ❌       ❌      25%
3D Secure            ❌        ❌           ❌       ❌       0%  ← critical gap
Webhooks             ✅        ✅           ❌       ✅      75%
```

Color-coded cells. Hoverable for details. Exportable as image or CSV.

**3.3 Freshness + Coverage Combined Score**
Each doc site gets a single "Documentation Health Score":

```
Health Score = (0.4 × Freshness) + (0.3 × Coverage) + (0.2 × Feedback) + (0.1 × Search Success Rate)

VaultPay API Docs: 78/100 — Good
├── Freshness: 72/100
├── Coverage: 85/100
├── Feedback: 82/100 (thumbs up rate)
└── Search Success: 68/100 (needs improvement)
```

---

### Phase 4: Business Impact & Reporting (Week 8)
*Goal: Connect documentation metrics to business outcomes.*

**4.1 Ticket Deflection Tracking**
Two approaches (configurable):

**Approach A — Referrer-based:**
- Detect visits where referrer is a support tool (Zendesk, Freshdesk, JIRA Service Desk)
- Track: did the user find what they needed? (page view + reading time > 60s = "deflected")
- Metric: "X visits from support tools, Y resulted in meaningful doc engagement"

**Approach B — Manual tagging:**
- Support team tags tickets with "doc_link" when sending users to docs
- Import ticket data (CSV upload)
- Calculate: tickets that were resolved after doc link was shared vs. those that escalated

**4.2 Documentation ROI Calculator**
Simple but powerful widget:
```
┌──────────────────────────────────────────────────────┐
│  Documentation ROI Estimate                           │
│                                                       │
│  Monthly doc page views:              12,400          │
│  Estimated ticket deflection rate:    15%             │
│  Estimated tickets deflected:         1,860/month     │
│  Average cost per support ticket:     $25             │
│  Estimated monthly savings:           $46,500         │
│                                                       │
│  ⚠ These are estimates based on industry benchmarks   │
│    and your traffic data. Customize the assumptions.  │
└──────────────────────────────────────────────────────┘
```

**4.3 Report Generator**
One-click export of:
- **Weekly report** (Markdown/PDF): top pages, search trends, new content gaps, feedback summary
- **Monthly report** (Markdown/PDF): all metrics + health score trend + recommendations
- **Quarterly review** (Markdown/PDF): comprehensive report with coverage matrix, freshness trends, ROI estimate

Report template:
```markdown
# Documentation Performance Report — March 2026
## VaultPay API Docs

### Key Metrics
- Total page views: 14,200 (+12% vs. Feb)
- Unique visitors: 3,800
- Average reading time: 2m 34s
- Search success rate: 72% (+5% vs. Feb)

### Top Performing Pages
1. Authentication (2,100 views, 3m 12s avg reading time)
2. Charges API (1,800 views)
3. Webhooks (1,200 views)

### Content Gaps Identified
- 3D Secure documentation (12 failed searches)
- Rate limiting details (8 failed searches)
- Sandbox environment setup (6 failed searches)

### Recommendations
1. Create 3D Secure documentation (highest demand gap)
2. Update Webhooks page (flagged as stale — 7 months since update)
3. Add rate limiting section to API overview

### Health Score: 78/100 (+3 vs. Feb)
```

---

### Phase 5: Showcase & Demo (Week 9)
*Goal: Make it demo-ready. Deploy with your own data.*

**5.1 Live Demo**
- Deploy DocPulse dashboard on Vercel
- Pre-loaded with simulated analytics data for your 3 main doc sites:
  - VaultPay API Docs
  - FraudShield AI Engine
  - US Payments Hub
- Simulated data covers 90 days of realistic usage patterns
- All dashboard features functional and explorable

**5.2 Embed Tracker on Your Own Sites**
- Add the `<script>` tag to your live VaultPay doc site
- After 1–2 weeks, you have REAL analytics data
- Screenshot real data for LinkedIn posts and interview demos

**5.3 Repository Structure**
```
docpulse/
├── tracker/
│   ├── tracker.js              # Lightweight JS tracker (< 5KB)
│   ├── feedback-widget.js      # Inline feedback component
│   └── tracker.test.js         # Unit tests
├── api/
│   ├── main.py                 # FastAPI app
│   ├── routes/
│   │   ├── events.py           # Event ingestion
│   │   ├── analytics.py        # Aggregation queries
│   │   ├── search.py           # Search analytics
│   │   ├── freshness.py        # GitHub API integration
│   │   ├── coverage.py         # Coverage matrix
│   │   └── reports.py          # Report generation
│   ├── models/
│   │   ├── event.py            # Event schema
│   │   └── aggregation.py      # Rollup models
│   └── jobs/
│       ├── aggregate.py        # Hourly aggregation
│       └── freshness_check.py  # Daily freshness scan
├── dashboard/                   # Next.js frontend
│   ├── app/
│   │   ├── page.tsx            # Overview dashboard
│   │   ├── pages/[slug]/       # Page detail view
│   │   ├── search/page.tsx     # Search analytics
│   │   ├── freshness/page.tsx  # Freshness monitor
│   │   ├── coverage/page.tsx   # Coverage matrix
│   │   ├── feedback/page.tsx   # Feedback dashboard
│   │   ├── reports/page.tsx    # Report generator
│   │   └── components/
│   │       ├── MetricCard.tsx
│   │       ├── TimeSeriesChart.tsx
│   │       ├── FreshnessHeatmap.tsx
│   │       ├── CoverageMatrix.tsx
│   │       ├── FailedSearchTable.tsx
│   │       ├── HealthScore.tsx
│   │       └── ROICalculator.tsx
├── data/
│   ├── seed.py                 # Simulated demo data generator
│   └── coverage.yaml           # Product feature → doc page mapping
├── .env.example
├── requirements.txt
└── README.md
```

---

## Timeline

| Week | Phase | Deliverable | Hours |
|------|-------|------------|-------|
| 1 | Tracker | JS tracker + event ingestion API | 12–15 |
| 2 | Dashboard | Core dashboard: page views, reading time, scroll depth | 15–20 |
| 3 | Dashboard | Page detail view + engagement heatmap + code copy tracking | 12–15 |
| 4 | Search | Search query capture + failed search detection + search dashboard | 15–20 |
| 5 | Feedback | Feedback widget + feedback dashboard + alerts | 10–15 |
| 6 | Freshness | GitHub integration + freshness heatmap + freshness scoring | 12–15 |
| 7 | Coverage | Coverage matrix (D3.js) + health score + gap identification | 15–20 |
| 8 | Impact | Ticket deflection tracking + ROI calculator + report generator | 12–15 |
| 9 | Showcase | Demo data + real deployment + README + LinkedIn posts | 10–12 |
| **Total** | | | **~113–147 hrs** |

---

## LinkedIn Content Strategy

| Week | Post | Hook |
|------|------|------|
| 3 | "I finally know which pages in my docs people actually read" | Real data screenshot from your own doc site |
| 5 | "Users searched for these 5 things. My docs didn't have them." | Failed search data — the most shareable insight |
| 7 | "My documentation has a health score. It's 78/100. Here's what I'm fixing." | Coverage matrix + health score — visual and concrete |
| 9 | "If you can't measure your docs, you're guessing. Here's how I stopped guessing." | Thought leadership — ties DocPulse to documentation leadership philosophy |

---

## Cost Estimate

| Service | Monthly cost | Notes |
|---------|-------------|-------|
| Vercel (dashboard) | $0 | Free tier |
| Railway (API) | $0–5 | Free tier or hobby plan |
| Supabase (PostgreSQL) | $0 | Free tier: 500MB |
| GitHub API | $0 | Authenticated: 5,000 req/hr (plenty) |
| **Total** | **$0–5/mo** | |

---

## Minimum Viable Demo (If Time-Constrained)

**2-week version:** Build only the JS tracker + the overview dashboard (Phase 1). Embed the tracker on your VaultPay doc site today. In 2 weeks, you have real analytics data in a live dashboard. That's enough to show in an interview: "I built an analytics layer for my documentation, and here's what the data told me."

The failed search and coverage matrix features can come later — they're powerful, but the core dashboard with real data from your own docs is already a strong differentiator.

---

## How All Three Projects Connect

```
Your Documentation Portfolio (2026)

Writing           →  10 live doc sites (VaultPay, FraudShield, PayPlus, etc.)
                     "I write best-in-class documentation."

Creation Tools    →  DocCraft AI + PPT2Video
                     "I build tools that automate content creation."

Infrastructure    →  SpecFlow (OpenAPI → Portal)
                     "I build the systems that generate documentation."

AI Integration    →  DocQuery (RAG chatbot)
                     "I understand how docs get consumed by AI."

Measurement       →  DocPulse (Analytics dashboard)
                     "I treat docs as a product and measure their impact."

─────────────────────────────────────────────────────────────
Together: "I own the full documentation lifecycle — from creation
          to infrastructure to AI delivery to measurement."
```

This is the narrative that gets you Documentation Architect and Documentation Engineering roles at the companies you're targeting.

---

*Plan created: March 2026*
*Project: DocPulse — Documentation Analytics Dashboard*
*Author: Sulagna Sasmal*
