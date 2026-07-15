"""Quick chatbot: keyword-tolerant Q&A, product comparison, suggested questions."""
import json
from datetime import datetime
from ..database import query_all, query_one, execute, next_id
from ..llm import gemini
from ..llm.prompts import render
from . import context


def _all_products_knowledge():
    products = query_all("SELECT * FROM products WHERE is_active = 1")
    blocks = []
    for p in products:
        blocks.append(context.product_details_text(p["product_id"]))
    return "\n\n".join(blocks)


def _relevant_products_knowledge(question):
    """Cheap keyword filter to keep the prompt focused; falls back to all products."""
    q = question.lower()
    products = query_all("SELECT product_id, name, category FROM products WHERE is_active = 1")
    hits = []
    for p in products:
        hay = f"{p['name']} {p['category']}".lower()
        if any(tok in hay for tok in q.split() if len(tok) > 2) or any(w in q for w in hay.split()):
            hits.append(p["product_id"])
    if not hits:
        return _all_products_knowledge()
    return "\n\n".join(context.product_details_text(pid) for pid in hits)


def ask(question, customer_id=None, agent_id=None):
    knowledge = _relevant_products_knowledge(question)
    cust_ctx = ""
    if customer_id:
        cust_ctx = "CUSTOMER CONTEXT (personalize the answer):\n" + context.customer_profile_text(customer_id, brief=True)

    if gemini.enabled:
        try:
            prompt = render("chatbot_qa", product_knowledge=knowledge,
                            customer_context=cust_ctx, question=question)
            data = gemini.generate_json(prompt, temperature=0.5)
        except Exception:
            data = _fallback_answer(question)
    else:
        data = _fallback_answer(question)

    _log(customer_id, agent_id, "qa", question, data.get("answer", ""), None)
    return data


def compare(product_id_a, product_id_b, customer_id=None, agent_id=None):
    pa = context.product_details_text(product_id_a)
    pb = context.product_details_text(product_id_b)
    if not pa or not pb:
        raise ValueError("One or both products not found")
    cust_ctx = ""
    if customer_id:
        cust_ctx = "CUSTOMER CONTEXT (tailor the recommendation):\n" + context.customer_profile_text(customer_id, brief=True)

    if gemini.enabled:
        try:
            prompt = render("chatbot_comparison", product_a=pa, product_b=pb, customer_context=cust_ctx)
            data = gemini.generate_json(prompt, temperature=0.5)
        except Exception:
            data = _fallback_compare(product_id_a, product_id_b)
    else:
        data = _fallback_compare(product_id_a, product_id_b)

    _log(customer_id, agent_id, "comparison",
         f"Compare {product_id_a} vs {product_id_b}", data.get("recommendation", ""),
         [product_id_a, product_id_b])
    return data


def suggested_questions(customer_id=None):
    recs = context.get_recommendations(customer_id) if customer_id else []
    rec_text = "\n".join(f"- {r['product_name']} ({r['product_category']})" for r in recs) or "General banking products"
    if gemini.enabled and customer_id:
        try:
            prompt = render("suggested_questions",
                            customer_context=context.customer_profile_text(customer_id, brief=True),
                            recommended_products=rec_text)
            data = gemini.generate_json(prompt, temperature=0.6)
            return data.get("questions", [])[:6]
        except Exception:
            pass
    # fallback: derive from recommended categories
    base = ["home loan roi 20 years", "credit card annual fee", "fd senior citizen rate",
            "personal loan eligibility", "health insurance cashless hospitals", "car loan on-road funding"]
    if recs:
        cat_q = {
            "Home Loan": "home loan interest rate & emi", "Personal Loan": "personal loan max amount",
            "Credit Card": "credit card reward points & lounge", "Fixed Deposit": "fd rates 1-5 years",
            "Insurance": "insurance cover & premium", "Investment": "sip minimum amount & tax benefit",
            "Savings": "wealth savings account benefits", "Car Loan": "car loan tenure & rate",
        }
        derived = [cat_q.get(r["product_category"]) for r in recs if cat_q.get(r["product_category"])]
        return (derived + base)[:6]
    return base


# ---------- fallbacks ----------

def _fallback_answer(question):
    q = question.lower()
    products = query_all("SELECT * FROM products WHERE is_active = 1")
    best = None
    for p in products:
        hay = f"{p['name']} {p['category']}".lower()
        if any(tok in hay for tok in q.split() if len(tok) > 2):
            best = p
            break
    if not best:
        return {"answer": "I couldn't find that in our catalog right now — let me check and get back to you.",
                "quick_facts": [], "confidence": "low"}
    facts = []
    if best.get("interest_rate_min") is not None:
        facts.append(f"Rate {best['interest_rate_min']}%-{best['interest_rate_max']}% p.a.")
    if best.get("annual_fee") is not None:
        facts.append(f"Annual fee Rs.{int(best['annual_fee']):,}")
    kb = best.get("key_benefits")
    if isinstance(kb, str):
        kb = json.loads(kb)
    if kb:
        facts.append(kb[0])
    return {"answer": f"For our {best['name']}, {best['tagline']} " + (facts[0] if facts else ""),
            "quick_facts": facts, "confidence": "medium"}


def _fallback_compare(a, b):
    pa = query_one("SELECT * FROM products WHERE product_id = ?", (a,))
    pb = query_one("SELECT * FROM products WHERE product_id = ?", (b,))

    def pros(p):
        kb = p.get("key_benefits")
        if isinstance(kb, str):
            kb = json.loads(kb)
        return kb[:3] if kb else []
    return {
        "product_a_pros": pros(pa), "product_a_cons": ["Review charges and eligibility in detail"],
        "product_b_pros": pros(pb), "product_b_cons": ["Review charges and eligibility in detail"],
        "recommendation": f"Both are strong options; choose {pa['name']} for its headline benefits.",
        "sales_pitch": f"Based on what matters to you, I'd suggest our {pa['name']} — {pa['tagline']}",
    }


def _log(customer_id, agent_id, mode, question, answer, compared):
    execute(
        """INSERT INTO chat_history (chat_id, customer_id, agent_id, mode, question, answer, products_compared, created_at)
           VALUES (?,?,?,?,?,?,?,?)""",
        (next_id("CHT", "chat_history", "chat_id"), customer_id, agent_id, mode, question, answer,
         json.dumps(compared) if compared else None, datetime.now().isoformat(timespec="seconds")))
