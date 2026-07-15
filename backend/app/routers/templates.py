from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from ..database import query_all, query_one, execute, next_id

router = APIRouter(prefix="/api/templates", tags=["templates"])


class TemplateRequest(BaseModel):
    name: str
    description: str = ""
    channel: str = "Both"
    tone: str = "Warm & Consultative"
    structure: List[str] = []
    rules: List[str] = []
    techniques: List[str] = []
    is_default: int = 0
    created_by: Optional[str] = None


@router.get("")
def list_templates():
    return {"templates": query_all("SELECT * FROM pitch_templates ORDER BY is_default DESC, name")}


@router.get("/{template_id}")
def get_template(template_id: str):
    t = query_one("SELECT * FROM pitch_templates WHERE template_id = ?", (template_id,))
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    return t


@router.post("")
def create_template(req: TemplateRequest):
    import json
    tid = next_id("TPL", "pitch_templates", "template_id", width=3)
    execute(
        """INSERT INTO pitch_templates (template_id, name, description, channel, tone, structure,
             rules, techniques, is_default, created_by, created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
        (tid, req.name, req.description, req.channel, req.tone, json.dumps(req.structure),
         json.dumps(req.rules), json.dumps(req.techniques), req.is_default, req.created_by,
         date.today().isoformat()))
    return get_template(tid)


@router.put("/{template_id}")
def update_template(template_id: str, req: TemplateRequest):
    import json
    if not query_one("SELECT 1 FROM pitch_templates WHERE template_id = ?", (template_id,)):
        raise HTTPException(status_code=404, detail="Template not found")
    execute(
        """UPDATE pitch_templates SET name=?, description=?, channel=?, tone=?, structure=?,
             rules=?, techniques=?, is_default=? WHERE template_id=?""",
        (req.name, req.description, req.channel, req.tone, json.dumps(req.structure),
         json.dumps(req.rules), json.dumps(req.techniques), req.is_default, template_id))
    return get_template(template_id)


@router.delete("/{template_id}")
def delete_template(template_id: str):
    execute("DELETE FROM pitch_templates WHERE template_id = ?", (template_id,))
    return {"deleted": template_id}
