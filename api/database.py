"""
DocPulse Database — SQLite initialization and connection helpers.
"""

import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.getenv("DOCPULSE_DB_PATH", "./docpulse.db")


def init_db():
    """Initialize the database schema."""
    conn = sqlite3.connect(DB_PATH)
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site TEXT NOT NULL,
            session_id TEXT NOT NULL,
            event_type TEXT NOT NULL,
            url TEXT,
            title TEXT,
            referrer TEXT,
            data TEXT,
            timestamp TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_events_site ON events(site);
        CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
        CREATE INDEX IF NOT EXISTS idx_events_url ON events(url);
        CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);

        CREATE TABLE IF NOT EXISTS daily_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site TEXT NOT NULL,
            date TEXT NOT NULL,
            url TEXT NOT NULL,
            page_views INTEGER DEFAULT 0,
            unique_sessions INTEGER DEFAULT 0,
            avg_reading_time REAL DEFAULT 0,
            max_scroll_depth INTEGER DEFAULT 0,
            code_copies INTEGER DEFAULT 0,
            thumbs_up INTEGER DEFAULT 0,
            thumbs_down INTEGER DEFAULT 0,
            UNIQUE(site, date, url)
        );

        CREATE TABLE IF NOT EXISTS search_queries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site TEXT NOT NULL,
            session_id TEXT,
            query TEXT NOT NULL,
            results_count INTEGER DEFAULT -1,
            url TEXT,
            timestamp TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_search_site ON search_queries(site);
        CREATE INDEX IF NOT EXISTS idx_search_query ON search_queries(query);

        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site TEXT NOT NULL,
            session_id TEXT,
            url TEXT NOT NULL,
            helpful INTEGER NOT NULL,
            comment TEXT,
            timestamp TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_feedback_site ON feedback(site);
        CREATE INDEX IF NOT EXISTS idx_feedback_url ON feedback(url);
    """)
    conn.commit()
    conn.close()


@contextmanager
def get_db():
    """Get a database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
