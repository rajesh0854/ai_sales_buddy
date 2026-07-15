"""Notes -> AI intelligence -> follow-ups/events."""
import json
from datetime import date, timedelta
from ..database import query_all, query_one, execute, next_id
from ..llm import gemini
from ..llm.prompts import render
from . import context

TODAY = date(2026, 7, 15)


def create_note(customer_id, agent_id, content):
    customer = context.get_customer(customer_id)
    if not customer:
        raise ValueError("Customer not found")

    intel = _analyze(content, customer["full_name"])
    note_id = next_id("NOTE", "notes", "note_id", width=4)
    execute(
        """INSERT INTO notes (note_id, customer_id, agent_id, content, ai_summary, sentiment, key_points, created_at)
           VALUES (?,?,?,?,?,?,?,?)""",
        (note_id, customer_id, agent_id, content, intel.get("summary", ""),
         intel.get("sentiment", "Neutral"), json.dumps(intel.get("key_points", [])),
         TODAY.isoformat()))

    follow_up = None
    fu = intel.get("follow_up") or {}
    if fu.get("needed"):
        fid = next_id("FUP", "follow_ups", "followup_id", width=4)
        execute(
            """INSERT INTO follow_ups (followup_id, customer_id, agent_id, note_id, title, description,
                 type, due_date, due_time, priority, status, created_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
            (fid, customer_id, agent_id, note_id, fu.get("title", "Follow up"),
             fu.get("description", ""), fu.get("type", "Task"),
             fu.get("due_date"), fu.get("due_time"), fu.get("priority", "Medium"),
             "Pending", TODAY.isoformat()))
        follow_up = query_one("SELECT * FROM follow_ups WHERE followup_id = ?", (fid,))

    note = query_one("SELECT * FROM notes WHERE note_id = ?", (note_id,))
    note["follow_up_created"] = follow_up
    return note


def _analyze(content, customer_name):
    if gemini.enabled:
        try:
            prompt = render("notes_intelligence", today=TODAY.isoformat(),
                            customer_name=customer_name, note_content=content)
            return gemini.generate_json(prompt, temperature=0.3)
        except Exception:
            pass
    return _fallback_analyze(content)


def _fallback_analyze(content):
    low = content.lower()
    sentiment = "Neutral"
    if any(w in low for w in ["interested", "keen", "happy", "great", "yes", "positive"]):
        sentiment = "Positive"
    if any(w in low for w in ["not interested", "no ", "later", "concerned", "expensive", "reject"]):
        sentiment = "Negative"
    needs_fu = any(w in low for w in ["call back", "callback", "follow", "next week", "tomorrow",
                                       "meeting", "revisit", "remind", "send"])
    due = None
    if "tomorrow" in low:
        due = (TODAY + timedelta(days=1)).isoformat()
    elif "next week" in low:
        due = (TODAY + timedelta(days=7)).isoformat()
    elif needs_fu:
        due = (TODAY + timedelta(days=3)).isoformat()
    fu = {"needed": needs_fu, "title": "Follow up on conversation",
          "description": content[:120], "type": "Callback",
          "due_date": due, "due_time": "10:00", "priority": "Medium"} if needs_fu else {"needed": False}
    return {"summary": content[:120], "sentiment": sentiment,
            "key_points": [content[:80]], "follow_up": fu}


def list_notes(customer_id=None):
    sql = """SELECT n.*, c.full_name FROM notes n JOIN customers c ON n.customer_id=c.customer_id"""
    params = ()
    if customer_id:
        sql += " WHERE n.customer_id = ?"
        params = (customer_id,)
    sql += " ORDER BY n.created_at DESC, n.note_id DESC"
    return query_all(sql, params)


def list_follow_ups(customer_id=None, status=None):
    sql = """SELECT f.*, c.full_name, c.mobile FROM follow_ups f JOIN customers c ON f.customer_id=c.customer_id WHERE 1=1"""
    params = []
    if customer_id:
        sql += " AND f.customer_id = ?"
        params.append(customer_id)
    if status:
        sql += " AND f.status = ?"
        params.append(status)
    sql += " ORDER BY f.due_date, f.due_time"
    return query_all(sql, tuple(params))


def update_follow_up_status(followup_id, status):
    execute("UPDATE follow_ups SET status = ? WHERE followup_id = ?", (status, followup_id))
    return query_one("SELECT * FROM follow_ups WHERE followup_id = ?", (followup_id,))
