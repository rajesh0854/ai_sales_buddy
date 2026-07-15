from fastapi import APIRouter
from ..services import analytics as svc

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard")
def dashboard():
    return svc.dashboard()
