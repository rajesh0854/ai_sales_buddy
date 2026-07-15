# EXL Bank — AI Sales Buddy

LLM-powered sales enablement for the **EXL Bank Limited** sales team. It turns ML product
recommendations + rich customer data into highly personalized, ready-to-speak sales pitch
scripts, plus a full suite of live-call assistance tools.

Built with **FastAPI + SQLite + Google Gemini** (backend) and **Next.js + Tailwind + Framer Motion + Recharts** (frontend). White, modern, animated UI.

> Prototype project. Auth is intentionally simple (no hashing/JWT). Data is realistic mock data.

## Features

- **AI Pitch Script generation** — personalized, ready-to-speak scripts from customer 360 + recommendation + template.
- **Dynamic script controls** — instant scenario branches (already-has-product, price objection, needs time…) loaded live, with per-branch regeneration.
- **Product eligibility checker** — rule engine + plain-language LLM explanation.
- **Quick chatbot co-pilot** — keyword-tolerant Q&A, product comparison, suggested questions, ready-to-speak answers.
- **Notes & follow-ups** — free-text notes → AI sentiment/summary + auto-scheduled follow-ups (relative dates resolved).
- **Messaging** — personalized Email & WhatsApp generation and sending.
- **Customizable pitch templates** — rules, techniques, tone.
- **Feedback loop** — ratings + AI-synthesized improvement guides for templates.
- **Next-level:** Sales analytics dashboard · Vernacular (Indian-language) pitches · Compliance/mis-selling guardrails · Smart lead prioritization + Customer 360.

## Project structure

```
backend/    FastAPI app, SQLite, DDL, mock-data generators, prompts
frontend/   Next.js app (App Router)
PROGRESS.md build tracker (per-phase)
```

## Prerequisites
- Python 3.11+ (tested on 3.14) · Node.js 18+ (tested on 24)

## Backend setup

```bash
cd backend
python -m venv venv
venv/Scripts/pip install -r requirements.txt   # Windows; use venv/bin/pip on macOS/Linux

# configure
cp .env.example .env          # then add your GEMINI_API_KEY (optional — app runs in demo mode without it)

# seed the database (creates data/sales_buddy.db)
cd mock_data && python seed.py && cd ..

# run the API
venv/Scripts/uvicorn app.main:app --reload --port 8000
```
API docs: http://127.0.0.1:8000/docs

**Gemini:** set `GEMINI_API_KEY` in `backend/.env` to enable real LLM output
(`GEMINI_MODEL=gemini-flash-lite-latest`). Without a key, the app runs in **demo mode** using
deterministic fallbacks so every feature still works.

## Frontend setup

```bash
cd frontend
npm install
cp .env.local.example .env.local     # NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
npm run dev
```
App: http://localhost:3000

## Demo logins
| Username | Password | Role |
|---|---|---|
| rajesh.kumar | demo123 | Agent |
| priya.nair | demo123 | Agent |
| arjun.menon | demo123 | Agent |
| admin | admin123 | Admin |

## Re-seeding / schema changes
DDL lives in `backend/ddl/` (one file per table). Regenerate the DB anytime with
`cd backend/mock_data && python seed.py`. Generated JSON snapshots are written to
`backend/mock_data/generated/` for inspection.
