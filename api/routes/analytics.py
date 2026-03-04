"""Core analytics API routes."""

from fastapi import APIRouter
from api.database import get_db

router = APIRouter()


@router.get("/analytics/overview")
async def get_overview(site: str, days: int = 7):
    """Get overview metrics for a site."""
    with get_db() as conn:
        views = conn.execute(
            "SELECT COUNT(*) as count FROM events WHERE site = ? AND event_type = 'pageview' AND timestamp >= datetime('now', ?)",
            (site, f"-{days} days"),
        ).fetchone()

        sessions = conn.execute(
            "SELECT COUNT(DISTINCT session_id) as count FROM events WHERE site = ? AND event_type = 'pageview' AND timestamp >= datetime('now', ?)",
            (site, f"-{days} days"),
        ).fetchone()

        avg_time = conn.execute(
            "SELECT AVG(CAST(json_extract(data, '$.seconds') AS REAL)) as avg_seconds FROM events WHERE site = ? AND event_type = 'reading_time' AND timestamp >= datetime('now', ?)",
            (site, f"-{days} days"),
        ).fetchone()

        top_page = conn.execute(
            "SELECT url, COUNT(*) as views FROM events WHERE site = ? AND event_type = 'pageview' AND timestamp >= datetime('now', ?) GROUP BY url ORDER BY views DESC LIMIT 1",
            (site, f"-{days} days"),
        ).fetchone()

        return {
            "total_views": views["count"] if views else 0,
            "unique_visitors": sessions["count"] if sessions else 0,
            "avg_reading_time": round(avg_time["avg_seconds"] or 0, 1) if avg_time else 0,
            "top_page": {"url": top_page["url"], "views": top_page["views"]} if top_page else None,
            "period_days": days,
        }


@router.get("/analytics/pages")
async def get_page_stats(site: str, days: int = 30, limit: int = 20):
    """Get page-level analytics."""
    with get_db() as conn:
        pages = conn.execute(
            "SELECT url, COUNT(*) as views, COUNT(DISTINCT session_id) as unique_visitors FROM events WHERE site = ? AND event_type = 'pageview' AND timestamp >= datetime('now', ?) GROUP BY url ORDER BY views DESC LIMIT ?",
            (site, f"-{days} days", limit),
        ).fetchall()
        return [dict(p) for p in pages]


@router.get("/analytics/page/{path:path}")
async def get_page_detail(path: str, site: str, days: int = 30):
    """Get detailed analytics for a specific page."""
    url = f"/{path}" if not path.startswith("/") else path
    with get_db() as conn:
        views = conn.execute(
            "SELECT date(timestamp) as day, COUNT(*) as views FROM events WHERE site = ? AND event_type = 'pageview' AND url = ? AND timestamp >= datetime('now', ?) GROUP BY day ORDER BY day",
            (site, url, f"-{days} days"),
        ).fetchall()

        scroll = conn.execute(
            "SELECT json_extract(data, '$.depth') as depth, COUNT(*) as count FROM events WHERE site = ? AND event_type = 'scroll' AND url = ? AND timestamp >= datetime('now', ?) GROUP BY depth",
            (site, url, f"-{days} days"),
        ).fetchall()

        referrers = conn.execute(
            "SELECT referrer, COUNT(*) as count FROM events WHERE site = ? AND event_type = 'pageview' AND url = ? AND referrer != '' AND timestamp >= datetime('now', ?) GROUP BY referrer ORDER BY count DESC LIMIT 10",
            (site, url, f"-{days} days"),
        ).fetchall()

        fb = conn.execute(
            "SELECT SUM(CASE WHEN helpful = 1 THEN 1 ELSE 0 END) as up, SUM(CASE WHEN helpful = 0 THEN 1 ELSE 0 END) as down FROM feedback WHERE site = ? AND url = ?",
            (site, url),
        ).fetchone()

        return {
            "url": url,
            "views_over_time": [dict(v) for v in views],
            "scroll_depth": [dict(s) for s in scroll],
            "referrers": [dict(r) for r in referrers],
            "feedback": {"thumbs_up": fb["up"] or 0, "thumbs_down": fb["down"] or 0} if fb else {"thumbs_up": 0, "thumbs_down": 0},
        }


@router.get("/analytics/timeseries")
async def get_timeseries(site: str, days: int = 30):
    """Get daily page views time series."""
    with get_db() as conn:
        data = conn.execute(
            "SELECT date(timestamp) as day, COUNT(*) as views, COUNT(DISTINCT session_id) as sessions FROM events WHERE site = ? AND event_type = 'pageview' AND timestamp >= datetime('now', ?) GROUP BY day ORDER BY day",
            (site, f"-{days} days"),
        ).fetchall()
        return [dict(d) for d in data]
