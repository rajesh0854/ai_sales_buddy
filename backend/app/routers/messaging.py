from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services import messaging as svc

router = APIRouter(prefix="/api/messaging", tags=["messaging"])


class GenerateRequest(BaseModel):
    customer_id: str
    product_id: str
    channel: str = "Email"
    language: str = "English"
    extra_request: str = ""


@router.post("/generate")
def generate(req: GenerateRequest):
    try:
        return svc.generate_message(req.customer_id, req.product_id, req.channel,
                                    req.language, req.extra_request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


class SendRequest(BaseModel):
    customer_id: str
    agent_id: Optional[str] = None
    product_id: Optional[str] = None
    channel: str
    subject: Optional[str] = None
    body: str
    language: str = "English"


@router.post("/send")
def send(req: SendRequest):
    return svc.send_message(req.customer_id, req.agent_id, req.product_id, req.channel,
                            req.subject, req.body, req.language)


@router.get("")
def list_messages(customer_id: Optional[str] = None):
    return {"messages": svc.list_messages(customer_id)}
