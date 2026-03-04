"""Content freshness API routes."""

import os
from datetime import datetime
from fastapi import APIRouter

router = APIRouter()


@router.get("/freshness")
async def get_freshness(repo_owner: str, repo_name: str, docs_path: str = "docs"):
    """Get content freshness for a GitHub-hosted doc site."""
    import httpx

    github_token = os.getenv("GITHUB_TOKEN", "")
    headers = {"Authorization": f"token {github_token}"} if github_token else {}

    async with httpx.AsyncClient(headers=headers) as client:
        resp = await client.get(f"https://api.github.com/repos/{repo_owner}/{repo_name}/contents/{docs_path}")
        if resp.status_code != 200:
            return {"error": f"Failed to fetch repo contents: {resp.status_code}"}

        files = resp.json()
        freshness_data = []

        for f in files:
            if not f.get("name", "").endswith((".md", ".mdx", ".html")):
                continue

            commits_resp = await client.get(
                f"https://api.github.com/repos/{repo_owner}/{repo_name}/commits",
                params={"path": f["path"], "per_page": 1},
            )

            if commits_resp.status_code == 200 and commits_resp.json():
                last = commits_resp.json()[0]["commit"]["committer"]["date"]
                last_date = datetime.fromisoformat(last.replace("Z", "+00:00"))
                days_ago = (datetime.now(last_date.tzinfo) - last_date).days

                status = "fresh" if days_ago <= 30 else "aging" if days_ago <= 90 else "stale" if days_ago <= 180 else "abandoned"

                freshness_data.append({
                    "file": f["name"], "path": f["path"],
                    "last_updated": last, "days_ago": days_ago, "status": status,
                })

        scores = {"fresh": 100, "aging": 70, "stale": 30, "abandoned": 0}
        avg = sum(scores.get(d["status"], 0) for d in freshness_data) / len(freshness_data) if freshness_data else 0

        return {"repo": f"{repo_owner}/{repo_name}", "files": freshness_data, "overall_score": round(avg)}
