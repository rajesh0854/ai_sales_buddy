"""EXL Bank AI Sales Buddy - FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import (
    auth, customers, products, pitch, eligibility, chatbot,
    notes, messaging, templates, feedback, compliance, analytics, meta,
)

app = FastAPI(
    title="EXL Bank AI Sales Buddy API",
    description="LLM-powered sales enablement for the EXL Bank Limited sales team.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth, customers, products, pitch, eligibility, chatbot, notes,
          messaging, templates, feedback, compliance, analytics, meta):
    app.include_router(r.router)


@app.get("/")
def root():
    return {"message": "EXL Bank AI Sales Buddy API", "docs": "/docs",
            "gemini_enabled": settings.gemini_enabled}
