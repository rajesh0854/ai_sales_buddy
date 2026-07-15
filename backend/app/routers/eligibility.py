from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services import eligibility as elig_svc

router = APIRouter(prefix="/api/eligibility", tags=["eligibility"])


class EligibilityRequest(BaseModel):
    customer_id: str
    product_id: str


@router.post("/check")
def check(req: EligibilityRequest):
    try:
        return elig_svc.check(req.customer_id, req.product_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
