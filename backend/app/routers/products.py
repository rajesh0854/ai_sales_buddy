from fastapi import APIRouter, HTTPException
from ..database import query_all, query_one

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("")
def list_products():
    return {"products": query_all("SELECT * FROM products WHERE is_active = 1 ORDER BY category, name")}


@router.get("/{product_id}")
def get_product(product_id: str):
    p = query_one("SELECT * FROM products WHERE product_id = ?", (product_id,))
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    p["policy"] = query_one("SELECT * FROM product_policies WHERE product_id = ?", (product_id,))
    return p
