from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..database import query_one

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(req: LoginRequest):
    user = query_one("SELECT * FROM users WHERE username = ?", (req.username.strip().lower(),))
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    user.pop("password", None)
    return {"user": user, "token": f"demo-token-{user['user_id']}"}
