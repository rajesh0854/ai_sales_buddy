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

## Phase 2 — Backend Development (FastAPI)  ⬜ PENDING
Setup (venv, requirements, .env, config, db, Gemini client) + routers/services:
auth · customers+360+lead-prioritization · pitch generation · dynamic script controls · eligibility ·
chatbot · notes/follow-ups · messaging · templates · feedback loop · compliance · analytics · vernacular.

## Phase 3 — Frontend Development (Next.js)  ⬜ PENDING
9 screens: landing/login · dashboard · customer 360 · pitch studio · eligibility · chatbot ·
notes/follow-ups · messaging · templates admin.

## Phase 4 — UI/UX Verification & Polish  ⬜ PENDING
Browser drive-through, screenshots, white-theme consistency, animation polish, flawless E2E flows.
