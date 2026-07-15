# AI Sales Buddy — Build Progress Tracker

> Living document. Updated at the end of every phase. Legend: ✅ done · ⏳ in progress · ⬜ pending

Plan reference: `C:\Users\vmuser\.claude\plans\project-requirement-txt-i-want-you-lexical-spindle.md`

---

## Phase 1 — Mock Data Creation  ✅ COMPLETE

**Schema / DDL** (`backend/ddl/`, one file per table — 18 tables):
- ✅ customers, accounts, existing_products, transactions (CRM / core banking / txn warehouse)
- ✅ products, product_policies (product catalog + eligibility + full policy docs)
- ✅ recommendations (ML recommendation store)
- ✅ users, pitch_templates, pitch_scripts, script_scenarios, feedback, notes, follow_ups,
     chat_history, messages_sent, compliance_checks, improvement_guides (app-generated)

**Mock data** (`backend/mock_data/`):
- ✅ `curated_products.py` — 12 realistic EXL Bank products w/ rich descriptions, benefits, policies, disclosures
- ✅ `curated_users.py` — 3 sales agents + 1 admin (logins below)
- ✅ `curated_templates.py` — 3 pitch templates (consultative / face-to-face / quick)
- ✅ `reference_data.py` — Indian names, cities, employers, merchants, reason codes
- ✅ `generate_all.py` — correlated generator (income↔segment↔CIBIL↔holdings↔recommendations)
- ✅ `seed.py` — builds DB from DDL + loads data + writes JSON snapshots to `generated/`

**Seeded volumes:** 50 customers · 70 accounts · 78 holdings (incl. competitor banks) ·
7,093 transactions (12 mo) · 12 products/policies · 101 recommendations · 30 feedback · 20 notes · 12 follow-ups.

**DB location:** `backend/data/sales_buddy.db` · **Re-seed:** `cd backend/mock_data && python seed.py`

**Demo logins:** `rajesh.kumar / demo123` (agent) · `priya.nair / demo123` · `arjun.menon / demo123` · `admin / admin123` (admin)

**Notes/decisions:**
- Used curated pools instead of Faker → seeder runs on pure stdlib (no install needed for Phase 1).
- Deterministic seed (`random.seed(42)`) → reproducible dataset.
- Some holdings are with competitor banks (is_own_bank=0) to exercise dynamic-script "already has product" scenarios.
- pitch_scripts / script_scenarios / chat_history / messages_sent / compliance_checks / improvement_guides
  tables are created empty — populated at runtime by the backend in Phase 2.

---

## Phase 2 — Backend Development (FastAPI)  ✅ COMPLETE

**Foundation:**
- ✅ venv + `requirements.txt` (installed: fastapi 0.139, google-genai 2.11, pydantic 2.13, uvicorn 0.51)
  - Note: pinned versions were unpinned to latest — Python 3.14 lacked wheels for the old pinned pydantic-core.
- ✅ `.env` / `.env.example`, `app/config.py`, `app/database.py` (dict rows, JSON auto-parse, id generator)
- ✅ `app/llm/gemini_client.py` — google-genai wrapper (gemini-flash-lite-latest), JSON mode, **graceful fallback when no key**
- ✅ `app/llm/prompts.py` + 10 prompt files in `backend/prompts/` (isolated, editable)
- ✅ `app/main.py` — CORS + 13 routers

**Routers/services (all verified live via curl):**
- ✅ auth (`/api/auth/login`)
- ✅ customers + Customer 360 + **smart lead priority-queue** (`/api/customers*`)
- ✅ products (`/api/products*`)
- ✅ pitch generation + **dynamic scenario branches** + single-scenario regenerate (`/api/pitch*`)
- ✅ eligibility (rule engine + LLM explanation) (`/api/eligibility/check`)
- ✅ chatbot (keyword Q&A, product comparison, suggested questions) (`/api/chatbot*`)
- ✅ notes → AI intelligence → auto follow-ups w/ relative-date resolution (`/api/notes*`)
- ✅ messaging (Email/WhatsApp generate + send) (`/api/messaging*`)
- ✅ templates CRUD (`/api/templates*`)
- ✅ feedback capture + AI improvement guide synthesis (`/api/feedback*`)
- ✅ compliance & mis-selling guardrails (`/api/compliance*`)
- ✅ analytics dashboard KPIs/charts/leaderboard (`/api/analytics/dashboard`)
- ✅ meta (languages for vernacular, gemini status) (`/api/meta*`)

**Vernacular:** `language` param flows through pitch / chatbot / messaging → Gemini generates in the chosen Indian language.

**Run:** `cd backend && venv/Scripts/uvicorn app.main:app --port 8000` · Swagger at `/docs`
**Verified:** login, 360, priority queue (Hot/Warm/Cool bands), pitch+scenarios+compliance, eligibility rules,
chatbot keyword Q&A, notes→followup (resolved "next week"→2026-07-22), messaging, comparison, analytics KPIs, improvement guide.
**Pending user action:** add `GEMINI_API_KEY` to `backend/.env` to enable real LLM output (fallbacks used until then).

## Phase 3 — Frontend Development (Next.js)  ⬜ PENDING
9 screens: landing/login · dashboard · customer 360 · pitch studio · eligibility · chatbot ·
notes/follow-ups · messaging · templates admin.

## Phase 4 — UI/UX Verification & Polish  ⬜ PENDING
Browser drive-through, screenshots, white-theme consistency, animation polish, flawless E2E flows.
