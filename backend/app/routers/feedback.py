from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services import feedback as svc

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


class FeedbackRequest(BaseModel):
    script_id: Optional[str] = None
    agent_id: Optional[str] = None
    rating: int
    outcome: Optional[str] = None
    comments: str = ""


@router.post("")
def add_feedback(req: FeedbackRequest):
    if not (1 <= req.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be 1-5")
    return svc.add_feedback(req.script_id, req.agent_id, req.rating, req.outcome, req.comments)


@router.get("")
def list_feedback(limit: int = 100):
    return {"feedback": svc.list_feedback(limit)}


@router.post("/improvement-guide")
def generate_guide():
    try:
        return svc.generate_improvement_guide()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/improvement-guides")
def list_guides():
    return {"guides": svc.list_guides()}
