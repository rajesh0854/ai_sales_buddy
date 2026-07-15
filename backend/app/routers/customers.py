from fastapi import APIRouter, HTTPException, Query
from ..database import query_all
from ..services import context
from ..services.leads import priority_queue

router = APIRouter(prefix="/api/customers", tags=["customers"])


@router.get("")
def list_customers(search: str = Query(default=""), segment: str = Query(default="")):
    sql = """SELECT c.customer_id, c.full_name, c.age, c.gender, c.segment, c.city, c.state,
                    c.occupation, c.annual_income, c.income_band, c.cibil_score, c.mobile,
                    c.preferred_language, c.risk_category,
                    (SELECT COUNT(*) FROM recommendations r WHERE r.customer_id = c.customer_id) AS rec_count
             FROM customers c WHERE 1=1"""
    params = []
    if search:
        sql += " AND (LOWER(c.full_name) LIKE ? OR LOWER(c.customer_id) LIKE ? OR c.mobile LIKE ?)"
        like = f"%{search.lower()}%"
        params += [like, like, f"%{search}%"]
    if segment:
        sql += " AND c.segment = ?"
        params.append(segment)
    sql += " ORDER BY c.full_name"
    return {"customers": query_all(sql, tuple(params))}


@router.get("/priority-queue")
def get_priority_queue(limit: int = 25):
    return {"leads": priority_queue(limit)}


@router.get("/{customer_id}")
def customer_360(customer_id: str):
    data = context.build_customer_360(customer_id)
    if not data:
        raise HTTPException(status_code=404, detail="Customer not found")
    return data
