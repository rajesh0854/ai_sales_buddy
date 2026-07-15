from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services import chatbot as svc

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])


class AskRequest(BaseModel):
    question: str
    customer_id: Optional[str] = None
    agent_id: Optional[str] = None


@router.post("/ask")
def ask(req: AskRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question is required")
    return svc.ask(req.question, req.customer_id, req.agent_id)


class CompareRequest(BaseModel):
    product_id_a: str
    product_id_b: str
    customer_id: Optional[str] = None
    agent_id: Optional[str] = None


@router.post("/compare")
def compare(req: CompareRequest):
    try:
        return svc.compare(req.product_id_a, req.product_id_b, req.customer_id, req.agent_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/suggested-questions")
def suggested(customer_id: Optional[str] = None):
    return {"questions": svc.suggested_questions(customer_id)}
