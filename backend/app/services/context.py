"""
Shared data-access + context builders used across features.
Assembles the Customer 360 view and human-readable text blocks for LLM prompts.
"""
import json
from collections import defaultdict
from ..database import query_all, query_one


# ---------- raw fetchers ----------

def get_customer(customer_id):
    return query_one("SELECT * FROM customers WHERE customer_id = ?", (customer_id,))


def get_product(product_id):
    return query_one("SELECT * FROM products WHERE product_id = ?", (product_id,))


def get_policy(product_id):
    return query_one("SELECT * FROM product_policies WHERE product_id = ?", (product_id,))


def get_accounts(customer_id):
    return query_all("SELECT * FROM accounts WHERE customer_id = ?", (customer_id,))


def get_holdings(customer_id):
    return query_all("SELECT * FROM existing_products WHERE customer_id = ?", (customer_id,))


def get_recommendations(customer_id):
    return query_all(
        """SELECT r.*, p.name AS product_name, p.category AS product_category, p.tagline
           FROM recommendations r JOIN products p ON r.product_id = p.product_id
           WHERE r.customer_id = ? ORDER BY r.rank""",
        (customer_id,),
    )


def get_transaction_summary(customer_id):
    """Aggregate 12-month transaction behaviour into insights."""
    txns = query_all("SELECT * FROM transactions WHERE customer_id = ?", (customer_id,))
    total_credit = sum(t["amount"] for t in txns if t["txn_type"] == "credit")
    total_debit = sum(t["amount"] for t in txns if t["txn_type"] == "debit")
    by_cat = defaultdict(float)
    for t in txns:
        if t["txn_type"] == "debit":
            by_cat[t["category"]] += t["amount"]
    top_categories = sorted(by_cat.items(), key=lambda x: -x[1])[:5]
    return {
        "txn_count": len(txns),
        "total_credit": round(total_credit, 2),
        "total_debit": round(total_debit, 2),
        "avg_monthly_spend": round(total_debit / 12, 2) if txns else 0,
        "top_spend_categories": [{"category": c, "amount": round(a, 2)} for c, a in top_categories],
        "monthly_series": _monthly_series(txns),
    }


def _monthly_series(txns):
    m = defaultdict(lambda: {"credit": 0.0, "debit": 0.0})
    for t in txns:
        month = t["txn_date"][:7]
        m[month][t["txn_type"]] += t["amount"]
    return [{"month": k, "credit": round(v["credit"], 2), "debit": round(v["debit"], 2)}
            for k, v in sorted(m.items())]


# ---------- Customer 360 ----------

def build_customer_360(customer_id):
    customer = get_customer(customer_id)
    if not customer:
        return None
    return {
        "customer": customer,
        "accounts": get_accounts(customer_id),
        "holdings": get_holdings(customer_id),
        "recommendations": get_recommendations(customer_id),
        "transaction_summary": get_transaction_summary(customer_id),
    }


# ---------- text blocks for prompts ----------

def customer_profile_text(customer_id, brief=False):
    c = get_customer(customer_id)
    if not c:
        return ""
    holdings = get_holdings(customer_id)
    txn = get_transaction_summary(customer_id)
    own = [h for h in holdings if h["is_own_bank"] == 1]
    other = [h for h in holdings if h["is_own_bank"] == 0]

    lines = [
        f"Name: {c['full_name']} ({c['gender']}, age {c['age']})",
        f"Segment: {c['segment']} | CIBIL: {c['cibil_score']} | Risk: {c['risk_category']}",
        f"Occupation: {c['occupation']} at {c['employer']} ({c['industry']})",
        f"Annual income: Rs.{int(c['annual_income']):,} ({c['income_band']})",
        f"Location: {c['city']}, {c['state']} | Residence: {c['residence_type']}",
        f"Marital status: {c['marital_status']} | Dependents: {c['dependents']}",
        f"Preferred language: {c['preferred_language']} | Relationship since: {c['relationship_since']}",
    ]
    if not brief:
        if own:
            lines.append("Holds with EXL Bank: " + ", ".join(
                f"{h['product_type']}" + (f" (outstanding Rs.{int(h['outstanding_amount']):,})" if h.get('outstanding_amount') else "")
                for h in own))
        if other:
            lines.append("Holds with OTHER banks: " + ", ".join(
                f"{h['product_type']} at {h['provider']}" for h in other))
        lines.append(f"Avg monthly spend: Rs.{int(txn['avg_monthly_spend']):,}")
        if txn["top_spend_categories"]:
            lines.append("Top spend categories: " + ", ".join(
                f"{t['category']} (Rs.{int(t['amount']):,})" for t in txn["top_spend_categories"]))
    return "\n".join(lines)


def product_details_text(product_id):
    p = get_product(product_id)
    if not p:
        return ""
    benefits = p.get("key_benefits") or []
    features = p.get("features") or []
    lines = [
        f"Product: {p['name']} ({p['category']})",
        f"Tagline: {p['tagline']}",
        f"Description: {p['description']}",
    ]
    if p.get("interest_rate_min") is not None:
        lines.append(f"Interest rate: {p['interest_rate_min']}% - {p['interest_rate_max']}% p.a.")
    if p.get("annual_fee") is not None:
        lines.append(f"Annual fee: Rs.{int(p['annual_fee']):,}")
    if p.get("processing_fee"):
        lines.append(f"Processing fee: {p['processing_fee']}")
    if benefits:
        lines.append("Key benefits: " + "; ".join(benefits))
    if features:
        lines.append("Features: " + "; ".join(features))
    return "\n".join(lines)


def mandatory_disclosures(product_id):
    pol = get_policy(product_id)
    if not pol:
        return []
    d = pol.get("mandatory_disclosures")
    return d if isinstance(d, list) else (json.loads(d) if d else [])
