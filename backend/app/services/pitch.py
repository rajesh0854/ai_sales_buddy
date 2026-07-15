"""Pitch script generation + dynamic scenario branches (with LLM + graceful fallback)."""
import json
from datetime import date
from ..database import query_one, query_all, execute, next_id
from ..llm import gemini
from ..llm.prompts import render
from . import context

SCENARIO_LABELS = {
    "already_has_product": "Already has product elsewhere",
    "price_objection": "Price / rate objection",
    "not_interested": "Not interested right now",
    "needs_time": "Needs time to think",
    "competitor_offer": "Mentions a competitor offer",
    "trust_concern": "Trust / hesitation concern",
}


def _template(template_id):
    t = query_one("SELECT * FROM pitch_templates WHERE template_id = ?", (template_id,))
    if not t:
        t = query_one("SELECT * FROM pitch_templates WHERE is_default = 1 LIMIT 1")
    return t


def generate_pitch(customer_id, product_id, template_id=None, language="English", agent_id=None):
    customer = context.get_customer(customer_id)
    product = context.get_product(product_id)
    if not customer or not product:
        raise ValueError("Customer or product not found")
    template = _template(template_id)

    rec = query_one(
        "SELECT reason_codes FROM recommendations WHERE customer_id = ? AND product_id = ?",
        (customer_id, product_id))
    reason_codes = rec["reason_codes"] if rec and rec.get("reason_codes") else ["Profile match"]
    if isinstance(reason_codes, str):
        try:
            reason_codes = json.loads(reason_codes)
        except ValueError:
            reason_codes = [reason_codes]

    if gemini.enabled:
        script = _llm_pitch(customer_id, product_id, template, language, reason_codes)
        scenarios = _llm_scenarios(customer_id, product, language)
    else:
        script = _fallback_pitch(customer, product, template, reason_codes)
        scenarios = _fallback_scenarios(customer, product)

    # persist
    script_id = next_id("SCR", "pitch_scripts", "script_id")
    execute(
        """INSERT INTO pitch_scripts (script_id, customer_id, product_id, template_id, agent_id,
             language, title, script_content, talking_points, generated_at, status)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
        (script_id, customer_id, product_id, template["template_id"] if template else None, agent_id,
         language, script.get("title", f"Pitch for {product['name']}"),
         json.dumps(script.get("sections", [])), json.dumps(script.get("talking_points", [])),
         date.today().isoformat(), "Draft"))

    for i, s in enumerate(scenarios):
        execute(
            """INSERT INTO script_scenarios (scenario_id, script_id, scenario_key, title, trigger_hint, content, sort_order)
               VALUES (?,?,?,?,?,?,?)""",
            (next_id("SCN", "script_scenarios", "scenario_id"), script_id, s["scenario_key"],
             s["title"], s.get("trigger_hint", ""), s["content"], i))

    return get_script(script_id)


def _llm_pitch(customer_id, product_id, template, language, reason_codes):
    prompt = render(
        "pitch_generation",
        template_name=template["name"], template_channel=template["channel"],
        template_tone=template["tone"],
        template_structure=", ".join(json.loads(template["structure"]) if isinstance(template["structure"], str) else template["structure"]),
        template_rules="\n".join(f"- {r}" for r in (json.loads(template["rules"]) if isinstance(template["rules"], str) else template["rules"])),
        template_techniques="\n".join(f"- {t}" for t in (json.loads(template["techniques"]) if isinstance(template["techniques"], str) else template["techniques"])),
        language=language,
        customer_profile=context.customer_profile_text(customer_id),
        product_details=context.product_details_text(product_id),
        reason_codes="\n".join(f"- {r}" for r in reason_codes),
    )
    return gemini.generate_json(prompt, temperature=0.75)


def _llm_scenarios(customer_id, product, language):
    prompt = render(
        "scenario_generation",
        product_details=context.product_details_text(product["product_id"]),
        customer_summary=context.customer_profile_text(customer_id, brief=True),
        language=language,
    )
    data = gemini.generate_json(prompt, temperature=0.7)
    return data.get("scenarios", [])


# ---------- deterministic fallbacks (no API key) ----------

def _fallback_pitch(customer, product, template, reason_codes):
    name = customer["full_name"].split()[0]
    benefits = product.get("key_benefits") or []
    if isinstance(benefits, str):
        benefits = json.loads(benefits)
    structure = template["structure"] if template else ["Opening", "Pitch", "Close"]
    if isinstance(structure, str):
        structure = json.loads(structure)
    sections = []
    for sec in structure:
        low = sec.lower()
        if "open" in low or "welcome" in low or "rapport" in low or "hook" in low:
            content = (f"Good morning {name} ji, this is your relationship officer from EXL Bank Limited. "
                       f"Hope I've caught you at a good time?")
        elif "need" in low or "discover" in low or "understand" in low or "requirement" in low:
            content = (f"Given your profile as a valued {customer['segment']} customer, I wanted to share "
                       f"something specially relevant to you.")
        elif "close" in low or "action" in low or "next" in low or "document" in low:
            content = (f"Shall I go ahead and email you the complete details, {name} ji? It takes just a minute "
                       f"and you can decide at your convenience.")
        else:
            content = (f"Our {product['name']} — {product['tagline']} "
                       + (f"Key benefit: {benefits[0]}." if benefits else ""))
        sections.append({"heading": sec, "content": content})
    return {
        "title": f"{product['name']} pitch for {customer['full_name']}",
        "sections": sections,
        "talking_points": (benefits[:4] if benefits else []) + [f"Recommended because: {reason_codes[0]}"],
        "estimated_duration": "3-4 minutes",
        "_fallback": True,
    }


def _fallback_scenarios(customer, product):
    name = customer["full_name"].split()[0]
    out = []
    texts = {
        "already_has_product": f"That's great, {name} ji. Many customers find our terms more competitive — may I quickly show you how our {product['name']} compares, with no obligation?",
        "price_objection": f"I understand, {name} ji. Let me highlight the value you get for it, and I can also check what best pricing I can offer for your profile.",
        "not_interested": f"No problem at all, {name} ji. May I send you a short summary on WhatsApp so you have it whenever you need it?",
        "needs_time": f"Absolutely, take your time, {name} ji. Shall I schedule a quick follow-up call next week that suits you?",
        "competitor_offer": f"Thanks for sharing that, {name} ji. Let me match that against our offer point by point so you can decide fairly.",
        "trust_concern": f"I completely understand, {name} ji. EXL Bank has served you since {customer.get('relationship_since', 'years')}, and I'm here to help — no pressure at all.",
    }
    for i, (key, label) in enumerate(SCENARIO_LABELS.items()):
        out.append({"scenario_key": key, "title": label, "trigger_hint": label, "content": texts[key]})
    return out


# ---------- read / regenerate ----------

def get_script(script_id):
    s = query_one("SELECT * FROM pitch_scripts WHERE script_id = ?", (script_id,))
    if not s:
        return None
    s["scenarios"] = query_all(
        "SELECT * FROM script_scenarios WHERE script_id = ? ORDER BY sort_order", (script_id,))
    return s


def regenerate_scenario(script_id, scenario_key):
    """Regenerate a single scenario branch on the fly without touching the main script."""
    script = query_one("SELECT * FROM pitch_scripts WHERE script_id = ?", (script_id,))
    if not script:
        raise ValueError("Script not found")
    product = context.get_product(script["product_id"])
    customer = context.get_customer(script["customer_id"])
    if gemini.enabled:
        prompt = render(
            "scenario_generation",
            product_details=context.product_details_text(product["product_id"]),
            customer_summary=context.customer_profile_text(script["customer_id"], brief=True),
            language=script["language"],
        )
        data = gemini.generate_json(prompt, temperature=0.85)
        new = next((s for s in data.get("scenarios", []) if s["scenario_key"] == scenario_key), None)
    else:
        new = next((s for s in _fallback_scenarios(customer, product) if s["scenario_key"] == scenario_key), None)
    if not new:
        raise ValueError("Scenario key not found")
    execute("UPDATE script_scenarios SET content = ?, trigger_hint = ? WHERE script_id = ? AND scenario_key = ?",
            (new["content"], new.get("trigger_hint", ""), script_id, scenario_key))
    return query_one(
        "SELECT * FROM script_scenarios WHERE script_id = ? AND scenario_key = ?", (script_id, scenario_key))
