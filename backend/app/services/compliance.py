"""Compliance & mis-selling guardrails for pitch scripts and messages."""
import json
import re
from datetime import datetime
from ..database import query_one, execute, next_id
from ..llm import gemini
from ..llm.prompts import render
from . import context

# risky phrases for the deterministic fallback / pre-screen
RISKY_PATTERNS = [
    (r"guarantee(d)? return", "High", "Claims guaranteed returns"),
    (r"\bno risk\b|zero risk|risk[- ]free", "High", "Claims zero/no risk"),
    (r"best (in|rate)|lowest rate ever|unbeatable", "Medium", "Unsubstantiated superlative claim"),
    (r"instant(ly)? approv", "Medium", "Implies guaranteed instant approval"),
    (r"double your money|assured profit", "High", "Unrealistic profit claim"),
    (r"limited time|act now|hurry", "Low", "Pressure / false urgency"),
]


def _script_text(script):
    parts = []
    content = script.get("script_content")
    if isinstance(content, str):
        try:
            content = json.loads(content)
        except ValueError:
            content = []
    for sec in content or []:
        parts.append(sec.get("content", ""))
    return "\n".join(parts)


def check_pitch(script_id):
    script = query_one("SELECT * FROM pitch_scripts WHERE script_id = ?", (script_id,))
    if not script:
        raise ValueError("Script not found")
    text = _script_text(script)
    disclosures = context.mandatory_disclosures(script["product_id"])
    result = _evaluate("pitch_script", text, disclosures)
    _persist("pitch_script", script_id, result)
    return result


def check_message(message_id, text, product_id):
    disclosures = context.mandatory_disclosures(product_id) if product_id else []
    result = _evaluate("message", text, disclosures)
    _persist("message", message_id, result)
    return result


def check_text(content, product_id=None):
    disclosures = context.mandatory_disclosures(product_id) if product_id else []
    return _evaluate("content", content, disclosures)


def _evaluate(content_type, text, disclosures):
    if gemini.enabled:
        try:
            prompt = render("compliance_check", content_type=content_type, content=text,
                            mandatory_disclosures="\n".join(f"- {d}" for d in disclosures) or "None specified")
            data = gemini.generate_json(prompt, temperature=0.2)
            data.setdefault("flags", [])
            data.setdefault("missing_disclosures", [])
            data.setdefault("status", "Pass")
            data.setdefault("risk_score", 0)
            return data
        except Exception:
            pass
    return _fallback_eval(text, disclosures)


def _fallback_eval(text, disclosures):
    flags = []
    low = (text or "").lower()
    for pattern, severity, issue in RISKY_PATTERNS:
        m = re.search(pattern, low)
        if m:
            flags.append({"severity": severity, "issue": issue,
                          "excerpt": text[max(0, m.start() - 20):m.end() + 20].strip(),
                          "suggestion": "Rephrase to avoid this claim; state facts and disclosures."})
    # naive missing-disclosure check
    missing = []
    for d in disclosures:
        key = d.split()[0].lower() if d else ""
        if key and key not in low:
            # only flag the first 2 to avoid noise in fallback mode
            if len(missing) < 2:
                missing.append(d)
    risk = min(100, len(flags) * 25 + len(missing) * 10)
    status = "Fail" if any(f["severity"] == "High" for f in flags) else ("Warning" if flags or missing else "Pass")
    return {"status": status, "risk_score": risk, "flags": flags, "missing_disclosures": missing,
            "summary": "Automated pre-screen (LLM disabled): "
                       + ("issues found." if flags or missing else "no obvious issues.")}


def _persist(subject_type, subject_id, result):
    execute(
        """INSERT INTO compliance_checks (check_id, subject_type, subject_id, status, risk_score,
             flags, missing_disclosures, checked_at) VALUES (?,?,?,?,?,?,?,?)""",
        (next_id("CMP", "compliance_checks", "check_id"), subject_type, subject_id,
         result.get("status"), result.get("risk_score"),
         json.dumps(result.get("flags", [])), json.dumps(result.get("missing_disclosures", [])),
         datetime.now().isoformat(timespec="seconds")))
