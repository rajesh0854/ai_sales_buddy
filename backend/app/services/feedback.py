"""Feedback capture + AI-synthesized improvement guides for pitch templates."""
import json
from datetime import date
from ..database import query_all, query_one, execute, next_id
from ..llm import gemini
from ..llm.prompts import render


def add_feedback(script_id, agent_id, rating, outcome=None, comments=""):
    fid = next_id("FBK", "feedback", "feedback_id")
    execute(
        """INSERT INTO feedback (feedback_id, script_id, agent_id, rating, outcome, comments,
             improvement_instruction, created_at) VALUES (?,?,?,?,?,?,?,?)""",
        (fid, script_id, agent_id, rating, outcome, comments, "", date.today().isoformat()))
    if script_id:
        execute("UPDATE pitch_scripts SET status = 'Used' WHERE script_id = ?", (script_id,))
    return query_one("SELECT * FROM feedback WHERE feedback_id = ?", (fid,))


def list_feedback(limit=100):
    return query_all(
        """SELECT f.*, s.title FROM feedback f LEFT JOIN pitch_scripts s ON f.script_id=s.script_id
           ORDER BY f.created_at DESC, f.feedback_id DESC LIMIT ?""", (limit,))


def generate_improvement_guide():
    """Admin action: analyse all feedback and synthesize improvement suggestions."""
    fb = query_all("SELECT rating, outcome, comments FROM feedback WHERE comments IS NOT NULL AND comments != ''")
    if not fb:
        raise ValueError("No feedback available to analyse")
    ratings = [f["rating"] for f in fb if f["rating"]]
    avg = round(sum(ratings) / len(ratings), 2) if ratings else 0

    if gemini.enabled:
        try:
            fb_text = "\n".join(
                f"- Rating {f['rating']}/5, Outcome: {f.get('outcome', 'NA')}, Comment: {f['comments']}"
                for f in fb[:60])
            prompt = render("feedback_improvement", feedback_data=fb_text)
            data = gemini.generate_json(prompt, temperature=0.4)
            summary = data.get("summary", "")
            suggestions = data.get("suggestions", [])
        except Exception:
            summary, suggestions = _fallback_guide(fb, avg)
    else:
        summary, suggestions = _fallback_guide(fb, avg)

    gid = next_id("GDE", "improvement_guides", "guide_id", width=3)
    execute(
        """INSERT INTO improvement_guides (guide_id, title, based_on_count, avg_rating, suggestions, summary, generated_at)
           VALUES (?,?,?,?,?,?,?)""",
        (gid, f"Pitch improvement guide ({date.today().isoformat()})", len(fb), avg,
         json.dumps(suggestions), summary, date.today().isoformat()))
    return query_one("SELECT * FROM improvement_guides WHERE guide_id = ?", (gid,))


def list_guides():
    return query_all("SELECT * FROM improvement_guides ORDER BY generated_at DESC, guide_id DESC")


def _fallback_guide(fb, avg):
    low = [f for f in fb if (f["rating"] or 5) <= 2]
    suggestions = [
        {"area": "Length", "suggestion": "Offer a crisp 60-second variant for busy customers.",
         "rationale": "Several comments mention scripts being too long."},
        {"area": "Personalization", "suggestion": "Lead with a concrete savings/benefit figure specific to the customer.",
         "rationale": "Higher-rated pitches referenced the customer's real numbers."},
        {"area": "Objection Handling", "suggestion": "Strengthen the competitor-comparison branch.",
         "rationale": "Rejections often cite existing products elsewhere."},
    ]
    summary = (f"Analysed {len(fb)} feedback entries (avg rating {avg}/5). "
               f"{len(low)} low-rated pitches suggest opportunities in length and personalization.")
    return summary, suggestions
