from fastapi import APIRouter
from ..config import settings

router = APIRouter(prefix="/api/meta", tags=["meta"])

LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi", "Bengali", "Gujarati"]


@router.get("/languages")
def languages():
    return {"languages": LANGUAGES}


@router.get("/status")
def status():
    return {
        "app": "EXL Bank AI Sales Buddy",
        "gemini_enabled": settings.gemini_enabled,
        "gemini_model": settings.GEMINI_MODEL,
    }
