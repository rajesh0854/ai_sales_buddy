"""Sales analytics: KPIs, product-wise performance, feedback trends, agent leaderboard."""
from collections import defaultdict
from ..database import query_all, query_one


def dashboard():
    return {
        "kpis": _kpis(),
        "product_performance": _product_performance(),
        "segment_distribution": _segment_distribution(),
        "recommendation_funnel": _recommendation_funnel(),
        "feedback_trend": _feedback_trend(),
        "rating_distribution": _rating_distribution(),
        "leaderboard": _leaderboard(),
        "pipeline_value": _pipeline_value(),
    }


def _one(sql, params=()):
    r = query_one(sql, params)
    return list(r.values())[0] if r else 0


def _kpis():
    total_recs = _one("SELECT COUNT(*) FROM recommendations")
    converted = _one("SELECT COUNT(*) FROM recommendations WHERE status='Converted'")
    contacted = _one("SELECT COUNT(*) FROM recommendations WHERE status IN ('Contacted','Converted','Rejected')")
    pitches = _one("SELECT COUNT(*) FROM pitch_scripts")
    avg_rating = query_one("SELECT ROUND(AVG(rating),2) v FROM feedback WHERE rating IS NOT NULL")
    conv_rate = round((converted / contacted * 100), 1) if contacted else 0.0
    return {
        "total_customers": _one("SELECT COUNT(*) FROM customers"),
        "total_recommendations": total_recs,
        "pitches_generated": pitches,
        "conversions": converted,
        "conversion_rate": conv_rate,
        "avg_pitch_rating": (avg_rating["v"] if avg_rating and avg_rating["v"] else 0),
        "pending_follow_ups": _one("SELECT COUNT(*) FROM follow_ups WHERE status='Pending'"),
        "messages_sent": _one("SELECT COUNT(*) FROM messages_sent"),
    }


def _product_performance():
    rows = query_all(
        """SELECT p.name, p.category, COUNT(r.recommendation_id) AS total,
                  SUM(CASE WHEN r.status='Converted' THEN 1 ELSE 0 END) AS converted,
                  ROUND(AVG(r.propensity_score),2) AS avg_propensity,
                  SUM(r.expected_value) AS total_value
           FROM recommendations r JOIN products p ON r.product_id=p.product_id
           GROUP BY p.product_id ORDER BY total DESC"""
    )
    for r in rows:
        r["conversion_rate"] = round((r["converted"] / r["total"] * 100), 1) if r["total"] else 0
    return rows


def _segment_distribution():
    return query_all(
        "SELECT segment AS name, COUNT(*) AS value FROM customers GROUP BY segment ORDER BY value DESC")


def _recommendation_funnel():
    rows = query_all("SELECT status AS name, COUNT(*) AS value FROM recommendations GROUP BY status")
    order = {"New": 0, "Contacted": 1, "Converted": 2, "Rejected": 3}
    rows.sort(key=lambda x: order.get(x["name"], 9))
    return rows


def _feedback_trend():
    rows = query_all(
        """SELECT substr(created_at,1,7) AS month, COUNT(*) AS count, ROUND(AVG(rating),2) AS avg_rating
           FROM feedback WHERE rating IS NOT NULL GROUP BY month ORDER BY month""")
    return rows


def _rating_distribution():
    counts = defaultdict(int)
    for r in query_all("SELECT rating FROM feedback WHERE rating IS NOT NULL"):
        counts[r["rating"]] += 1
    return [{"rating": i, "count": counts.get(i, 0)} for i in range(1, 6)]


def _leaderboard():
    rows = query_all(
        """SELECT u.user_id, u.full_name, u.branch,
                  COUNT(f.feedback_id) AS pitches,
                  ROUND(AVG(f.rating),2) AS avg_rating,
                  SUM(CASE WHEN f.outcome='Converted' THEN 1 ELSE 0 END) AS conversions
           FROM users u LEFT JOIN feedback f ON u.user_id=f.agent_id
           WHERE u.role='agent' GROUP BY u.user_id ORDER BY conversions DESC, avg_rating DESC""")
    return rows


def _pipeline_value():
    rows = query_all(
        """SELECT c.segment, ROUND(SUM(r.expected_value)) AS value
           FROM recommendations r JOIN customers c ON r.customer_id=c.customer_id
           WHERE r.status IN ('New','Contacted') GROUP BY c.segment""")
    return rows
