"""Smart lead prioritization: rank customers' recommendations by a blended score."""
from datetime import date
from ..database import query_all


def _recency_weight(gen_at):
    try:
        d = date.fromisoformat(gen_at)
        days = (date(2026, 7, 15) - d).days
        return max(0.3, 1.0 - days / 60.0)  # fresher = higher
    except Exception:
        return 0.6


def priority_queue(limit=25):
    """Return top recommendations ranked by propensity x value x recency, with customer info."""
    rows = query_all(
        """SELECT r.recommendation_id, r.customer_id, r.product_id, r.propensity_score,
                  r.expected_value, r.reason_codes, r.generated_at, r.status,
                  c.full_name, c.segment, c.city, c.cibil_score, c.mobile, c.preferred_language,
                  p.name AS product_name, p.category AS product_category
           FROM recommendations r
           JOIN customers c ON r.customer_id = c.customer_id
           JOIN products p ON r.product_id = p.product_id
           WHERE r.status IN ('New', 'Contacted')"""
    )
    # normalize expected value for scoring
    max_ev = max((r["expected_value"] or 0) for r in rows) or 1
    for r in rows:
        ev_norm = (r["expected_value"] or 0) / max_ev
        rec = _recency_weight(r["generated_at"])
        seg_boost = {"HNI": 1.15, "Affluent": 1.07, "Mass": 1.0}.get(r["segment"], 1.0)
        score = (0.55 * (r["propensity_score"] or 0) + 0.35 * ev_norm + 0.10 * rec) * seg_boost
        r["priority_score"] = round(min(score, 1.0) * 100, 1)
        r["priority_band"] = "Hot" if r["priority_score"] >= 70 else ("Warm" if r["priority_score"] >= 50 else "Cool")
    rows.sort(key=lambda x: -x["priority_score"])
    return rows[:limit]
