"""Search analytics API routes."""

from fastapi import APIRouter
from api.database import get_db

router = APIRouter()


@router.get("/search/queries")
async def get_search_queries(site: str, days: int = 30, limit: int = 50):
    with get_db() as conn:
        queries = conn.execute(
            "SELECT query, COUNT(*) as count, MIN(results_count) as min_results FROM search_queries WHERE site = ? AND timestamp >= datetime('now', ?) GROUP BY query ORDER BY count DESC LIMIT ?",
            (site, f"-{days} days", limit),
        ).fetchall()
        return [dict(q) for q in queries]


@router.get("/search/failed")
async def get_failed_searches(site: str, days: int = 30, limit: int = 30):
    with get_db() as conn:
        failed = conn.execute(
            "SELECT query, COUNT(*) as count FROM search_queries WHERE site = ? AND results_count = 0 AND timestamp >= datetime('now', ?) GROUP BY query ORDER BY count DESC LIMIT ?",
            (site, f"-{days} days", limit),
        ).fetchall()
        return [dict(f) for f in failed]


@router.get("/search/stats")
async def get_search_stats(site: str, days: int = 30):
    with get_db() as conn:
        total = conn.execute(
            "SELECT COUNT(*) as count FROM search_queries WHERE site = ? AND timestamp >= datetime('now', ?)",
            (site, f"-{days} days"),
        ).fetchone()
        failed = conn.execute(
            "SELECT COUNT(*) as count FROM search_queries WHERE site = ? AND results_count = 0 AND timestamp >= datetime('now', ?)",
            (site, f"-{days} days"),
        ).fetchone()

        t = total["count"] if total else 0
        f = failed["count"] if failed else 0
        return {
            "total_searches": t,
            "failed_searches": f,
            "success_rate": round((1 - f / t) * 100, 1) if t > 0 else 100,
        }
