from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services import compliance as svc
from ..database import query_all

router = APIRouter(prefix="/api/compliance", tags=["compliance"])


class CheckTextRequest(BaseModel):
    content: str
    product_id: Optional[str] = None


@router.post("/check-text")
def check_text(req: CheckTextRequest):
    return svc.check_text(req.content, req.product_id)


@router.post("/check-pitch/{script_id}")
def check_pitch(script_id: str):
    try:
        return svc.check_pitch(script_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/history")
def history(limit: int = 50):
    return {"checks": query_all(
        "SELECT * FROM compliance_checks ORDER BY checked_at DESC LIMIT ?", (limit,))}
