"""Generate + 'send' (mock) personalized Email / WhatsApp messages."""
import json
from datetime import datetime
from ..database import query_all, query_one, execute, next_id
from ..llm import gemini
from ..llm.prompts import render
from . import context


def generate_message(customer_id, product_id, channel="Email", language="English", extra_request=""):
    customer = context.get_customer(customer_id)
    product = context.get_product(product_id)
    if not customer or not product:
        raise ValueError("Customer or product not found")
    extra = f"The customer specifically wants to know: {extra_request}." if extra_request else ""

    if gemini.enabled:
        try:
            prompt = render("message_generation", channel=channel, extra_request=extra,
                            language=language,
                            customer_context=context.customer_profile_text(customer_id, brief=True),
                            product_details=context.product_details_text(product_id))
            data = gemini.generate_json(prompt, temperature=0.6)
        except Exception:
            data = _fallback_message(customer, product, channel)
    else:
        data = _fallback_message(customer, product, channel)
    return {"channel": channel, "language": language,
            "subject": data.get("subject"), "body": data.get("body", "")}


def send_message(customer_id, agent_id, product_id, channel, subject, body, language="English"):
    msg_id = next_id("MSG", "messages_sent", "message_id")
    execute(
        """INSERT INTO messages_sent (message_id, customer_id, agent_id, product_id, channel,
             subject, body, language, status, sent_at) VALUES (?,?,?,?,?,?,?,?,?,?)""",
        (msg_id, customer_id, agent_id, product_id, channel, subject, body, language,
         "Sent", datetime.now().isoformat(timespec="seconds")))
    return query_one("SELECT * FROM messages_sent WHERE message_id = ?", (msg_id,))


def list_messages(customer_id=None):
    sql = """SELECT m.*, c.full_name FROM messages_sent m JOIN customers c ON m.customer_id=c.customer_id"""
    params = ()
    if customer_id:
        sql += " WHERE m.customer_id = ?"
        params = (customer_id,)
    sql += " ORDER BY m.sent_at DESC, m.message_id DESC"
    return query_all(sql, params)


def _fallback_message(customer, product, channel):
    name = customer["full_name"].split()[0]
    kb = product.get("key_benefits")
    if isinstance(kb, str):
        kb = json.loads(kb)
    benefits = "\n".join(f"• {b}" for b in (kb[:3] if kb else []))
    if channel == "WhatsApp":
        body = (f"Hi {name}! 👋 This is from EXL Bank Limited. Based on your profile, our *{product['name']}* "
                f"could be a great fit for you:\n{benefits}\nWould you like more details? 😊")
        return {"subject": None, "body": body}
    body = (f"Dear {customer['full_name']},\n\nGreetings from EXL Bank Limited!\n\n"
            f"Based on your profile, we believe our {product['name']} would be valuable for you. "
            f"{product['tagline']}\n\nKey benefits:\n{benefits}\n\n"
            f"I'd be happy to walk you through the details at your convenience.\n\n"
            f"Warm regards,\nYour EXL Bank Relationship Team")
    return {"subject": f"A personalized recommendation for you — {product['name']}", "body": body}
