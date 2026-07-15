from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services import pitch as pitch_svc
from ..services import compliance as compliance_svc
from ..database import query_all

router = APIRouter(prefix="/api/pitch", tags=["pitch"])


class GeneratePitchRequest(BaseModel):
    customer_id: str
    product_id: str
    template_id: Optional[str] = None
    language: str = "English"
    agent_id: Optional[str] = None
    run_compliance: bool = True


@router.post("/generate")
def generate(req: GeneratePitchRequest):
    try:
        script = pitch_svc.generate_pitch(
            req.customer_id, req.product_id, req.template_id, req.language, req.agent_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Pitch generation failed: {e}")
    if req.run_compliance:
        try:
            script["compliance"] = compliance_svc.check_pitch(script["script_id"])
        except Exception:
            script["compliance"] = None
    return script


@router.get("/scripts")
def list_scripts(customer_id: str = None):
    sql = """SELECT s.script_id, s.customer_id, s.product_id, s.title, s.language, s.status, s.generated_at,
                    c.full_name, p.name AS product_name
             FROM pitch_scripts s JOIN customers c ON s.customer_id=c.customer_id
             JOIN products p ON s.product_id=p.product_id"""
    params = ()
    if customer_id:
        sql += " WHERE s.customer_id = ?"
        params = (customer_id,)
    sql += " ORDER BY s.generated_at DESC, s.script_id DESC"
    return {"scripts": query_all(sql, params)}


@router.get("/scripts/{script_id}")
def get_script(script_id: str):
    s = pitch_svc.get_script(script_id)
    if not s:
        raise HTTPException(status_code=404, detail="Script not found")
    return s


class RegenScenarioRequest(BaseModel):
    scenario_key: str


@router.post("/scripts/{script_id}/scenarios/regenerate")
def regenerate_scenario(script_id: str, req: RegenScenarioRequest):
    try:
        return pitch_svc.regenerate_scenario(script_id, req.scenario_key)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
