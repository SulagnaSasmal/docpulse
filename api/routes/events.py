"""Event ingestion API routes."""

import json
from fastapi import APIRouter
from pydantic import BaseModel

from api.database import get_db

router = APIRouter()


class EventPayload(BaseModel):
    site: str
    session_id: str
    events: list[dict]


@router.post("/events")
async def ingest_events(payload: EventPayload):
    """Receive batched events from the tracker."""
    with get_db() as conn:
        for event in payload.events:
            event_type = event.get("type", "unknown")
            url = event.get("url", "")
            timestamp = event.get("timestamp", "")

            if event_type == "pageview":
                conn.execute(
                    "INSERT INTO events (site, session_id, event_type, url, title, referrer, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (payload.site, payload.session_id, event_type, url, event.get("title", ""), event.get("referrer", ""), timestamp),
                )
            elif event_type == "search_query":
                conn.execute(
                    "INSERT INTO search_queries (site, session_id, query, results_count, url, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
                    (payload.site, payload.session_id, event.get("query", ""), event.get("results_count", -1), url, timestamp),
                )
            elif event_type == "feedback":
                conn.execute(
                    "INSERT INTO feedback (site, session_id, url, helpful, comment, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
                    (payload.site, payload.session_id, url, 1 if event.get("helpful") else 0, event.get("comment", ""), timestamp),
                )
            else:
                data = json.dumps({k: v for k, v in event.items() if k not in ("type", "url", "timestamp")})
                conn.execute(
                    "INSERT INTO events (site, session_id, event_type, url, data, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
                    (payload.site, payload.session_id, event_type, url, data, timestamp),
                )
        conn.commit()

    return {"status": "ok", "events_received": len(payload.events)}
