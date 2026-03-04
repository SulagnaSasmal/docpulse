"""
DocPulse Demo Data Seeder — Generates 90 days of realistic analytics data.
Usage: python -m data.seed
"""

import json
import random
import sqlite3
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from api.database import init_db

DB_PATH = os.getenv("DOCPULSE_DB_PATH", "./docpulse.db")


def seed_data(site="vaultpay", days=90):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    print(f"Seeding {days} days of data for '{site}'...")

    pages = [
        ("/", "VaultPay API Docs"), ("/authentication", "Authentication"),
        ("/charges", "Charges API"), ("/refunds", "Refunds"),
        ("/webhooks", "Webhooks"), ("/settlements", "Settlements"),
        ("/errors", "Error Handling"), ("/rate-limiting", "Rate Limiting"),
        ("/sdks", "SDKs & Libraries"), ("/changelog", "Changelog"),
    ]
    referrers = ["https://google.com", "https://stackoverflow.com", "", "https://support.vaultpay.com", "https://github.com"]
    searches = [
        ("authentication", 3), ("oauth", 2), ("charges api", 5), ("webhook events", 2),
        ("error codes", 3), ("rate limit", 1), ("3d secure", 0), ("sandbox environment", 0),
        ("idempotency key", 0), ("webhook retry policy", 0), ("pagination", 1), ("refund policy", 2),
    ]

    now = datetime.utcnow()
    total = 0
    hourly_weights = [1,1,1,1,1,2,3,5,8,10,10,9,8,9,10,10,8,6,5,4,3,2,1,1]

    for day_offset in range(days, 0, -1):
        day = now - timedelta(days=day_offset)
        weekday = day.weekday()
        base = 120 if weekday < 5 else 60
        num_sessions = random.randint(int(base * 0.7), int(base * 1.3))

        for _ in range(num_sessions):
            sid = f"dp_{random.randint(100000, 999999)}"
            hour = random.choices(range(24), weights=hourly_weights)[0]
            ts = day.replace(hour=hour, minute=random.randint(0,59), second=random.randint(0,59))
            timestamp = ts.isoformat() + "Z"
            num_pages = random.choices([1,2,3,4,5], weights=[30,35,20,10,5])[0]
            selected = random.sample(pages, min(num_pages, len(pages)))
            ref = random.choice(referrers)

            for page_url, page_title in selected:
                conn.execute("INSERT INTO events (site,session_id,event_type,url,title,referrer,timestamp) VALUES (?,?,?,?,?,?,?)",
                    (site, sid, "pageview", page_url, page_title, ref, timestamp))
                rt = random.randint(30, 300)
                conn.execute("INSERT INTO events (site,session_id,event_type,url,data,timestamp) VALUES (?,?,?,?,?,?)",
                    (site, sid, "reading_time", page_url, json.dumps({"seconds": rt}), timestamp))
                depth = random.choice([25, 50, 75, 100])
                conn.execute("INSERT INTO events (site,session_id,event_type,url,data,timestamp) VALUES (?,?,?,?,?,?)",
                    (site, sid, "scroll", page_url, json.dumps({"depth": depth}), timestamp))
                if random.random() < 0.2:
                    conn.execute("INSERT INTO events (site,session_id,event_type,url,data,timestamp) VALUES (?,?,?,?,?,?)",
                        (site, sid, "code_copy", page_url, json.dumps({"block_index": random.randint(0,5)}), timestamp))
                total += 3

            if random.random() < 0.3:
                q, r = random.choice(searches)
                conn.execute("INSERT INTO search_queries (site,session_id,query,results_count,url,timestamp) VALUES (?,?,?,?,?,?)",
                    (site, sid, q, r, "/", timestamp))

            if random.random() < 0.05:
                pu = random.choice(selected)[0]
                h = random.choices([1,0], weights=[75,25])[0]
                c = random.choice(["Missing code examples","Outdated information","Confusing explanation","Needs more detail",""]) if not h and random.random()<0.5 else ""
                conn.execute("INSERT INTO feedback (site,session_id,url,helpful,comment,timestamp) VALUES (?,?,?,?,?,?)",
                    (site, sid, pu, h, c, timestamp))

    conn.commit()
    conn.close()
    print(f"Seeded ~{total} events across {days} days")


if __name__ == "__main__":
    seed_data()
