from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services import notes as svc

router = APIRouter(prefix="/api/notes", tags=["notes"])


class NoteRequest(BaseModel):
    customer_id: str
    agent_id: Optional[str] = None
    content: str


@router.post("")
def create_note(req: NoteRequest):
    if not req.content.strip():
        raise HTTPException(status_code=400, detail="Note content is required")
    try:
        return svc.create_note(req.customer_id, req.agent_id, req.content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("")
def list_notes(customer_id: Optional[str] = None):
    return {"notes": svc.list_notes(customer_id)}


@router.get("/follow-ups")
def follow_ups(customer_id: Optional[str] = None, status: Optional[str] = None):
    return {"follow_ups": svc.list_follow_ups(customer_id, status)}


class StatusRequest(BaseModel):
    status: str


@router.patch("/follow-ups/{followup_id}")
def update_follow_up(followup_id: str, req: StatusRequest):
    return svc.update_follow_up_status(followup_id, req.status)
