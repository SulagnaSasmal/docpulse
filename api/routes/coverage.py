"""Content coverage API routes."""

import yaml
from pathlib import Path
from fastapi import APIRouter

router = APIRouter()


@router.get("/coverage")
async def get_coverage(site: str = "default"):
    coverage_path = Path("data/coverage.yaml")
    if not coverage_path.exists():
        return {"product": site, "features": [], "overall_score": 0, "message": "No coverage.yaml found."}

    with open(coverage_path) as f:
        data = yaml.safe_load(f)

    features = data.get("features", [])
    total = len(features)
    documented = sum(1 for f in features if f.get("status") == "documented")
    partial = sum(1 for f in features if f.get("status") == "partial")
    score = round(((documented + partial * 0.5) / total) * 100) if total > 0 else 0

    return {
        "product": data.get("product", site),
        "features": features,
        "overall_score": score,
        "total_features": total,
        "documented": documented,
        "partial": partial,
        "undocumented": total - documented - partial,
    }
