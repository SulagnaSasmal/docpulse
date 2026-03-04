# DocPulse — Documentation Analytics Dashboard

> Treat your docs like a product. Measure them like one.

DocPulse is an analytics dashboard purpose-built for documentation teams. Track page views, reading time, search queries, failed searches, content freshness, coverage gaps, and user feedback — all in one interface.

## Features

- **Lightweight JS Tracker** — Under 5KB, no cookies, anonymous sessions
- **Page Analytics** — Views, active reading time, scroll depth, code block copies
- **Search Analytics** — Top queries, failed searches, search success rate
- **User Feedback** — Thumbs up/down + optional comment widget
- **Content Freshness** — GitHub integration to detect stale documentation
- **Coverage Matrix** — Visual map of documented vs. undocumented features
- **Report Generator** — Weekly Markdown reports with actionable insights
- **Privacy-Respecting** — No cookies, no PII, anonymous session fingerprints

## Quick Start

### 1. Add Tracker to Your Doc Site

```html
<script
  src="https://your-docpulse.vercel.app/tracker.js"
  data-site="my-docs"
  data-api="https://your-docpulse-api.railway.app"
  async
></script>
```

### 2. Start the API

```bash
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

### 3. Seed Demo Data

```bash
python -m data.seed
```

## Architecture

```
Doc Site + Tracker.js  -->  POST /api/events  -->  SQLite  -->  Dashboard
                                                      ^
                                                 GitHub API (freshness)
```

## API Endpoints

```
POST /api/events                    — Ingest batched tracker events
GET  /api/analytics/overview        — Hero metrics (views, visitors, reading time)
GET  /api/analytics/pages           — Page-level stats ranked by views
GET  /api/analytics/page/{path}     — Detailed page analytics
GET  /api/analytics/timeseries      — Daily views time series
GET  /api/search/queries            — Top search queries
GET  /api/search/failed             — Failed searches (zero results)
GET  /api/search/stats              — Search success rate
GET  /api/freshness                 — Content freshness via GitHub API
GET  /api/coverage                  — Coverage matrix from YAML config
GET  /api/reports/weekly            — Generate Markdown weekly report
```

## Metrics Tracked

### Tier 1: Usage
Page views, unique visitors, active reading time, scroll depth, code copies, bounce rate

### Tier 2: Search & Discovery
Top search queries, failed searches, search-to-page conversion, navigation paths

### Tier 3: Content Quality
Content freshness score, feedback score, coverage score, readability score

### Tier 4: Business Impact
Ticket deflection tracking, documentation ROI estimate

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Tracker | Vanilla JS (< 5KB) |
| Backend | FastAPI (Python) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Dashboard | Next.js 14 + Tailwind + Recharts |
| Freshness | GitHub API integration |
| Charts | Recharts + D3.js |

## Project Structure

```
docpulse/
├── tracker/
│   ├── tracker.js              # Analytics tracker (< 5KB)
│   └── feedback-widget.js      # Inline feedback component
├── api/
│   ├── main.py                 # FastAPI app
│   ├── database.py             # SQLite schema + connections
│   └── routes/
│       ├── events.py           # Event ingestion
│       ├── analytics.py        # Core analytics queries
│       ├── search.py           # Search analytics
│       ├── freshness.py        # GitHub content freshness
│       ├── coverage.py         # Coverage matrix
│       └── reports.py          # Report generation
├── data/
│   ├── coverage.yaml           # Product feature mapping
│   └── seed.py                 # Demo data generator
├── dashboard/                   # Next.js frontend (coming)
├── requirements.txt
└── README.md
```

## License

MIT
