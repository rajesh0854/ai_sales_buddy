"""
Generates realistic, correlated EXL Bank Limited mock data.
Deterministic (fixed seed) so re-runs reproduce the same dataset.

Produces a dict of lists keyed by table name. `seed.py` loads it into SQLite.
Curated data (products, policies, users, templates) comes from the curated_* modules.
"""
import random
import json
from datetime import date, datetime, timedelta

from reference_data import (
    FIRST_NAMES_MALE, FIRST_NAMES_FEMALE, LAST_NAMES, CITIES, OCCUPATIONS,
    EMPLOYERS_SALARIED, INDUSTRIES, BUSINESS_TYPES, COMPETITOR_BANKS, EDUCATION,
    MARITAL, LANGUAGES, MERCHANTS, REASON_CODES,
)
from curated_products import PRODUCTS
from curated_users import USERS
from curated_templates import TEMPLATES

random.seed(42)
TODAY = date(2026, 7, 15)
NUM_CUSTOMERS = 50


def _dt(d):
    return d.strftime("%Y-%m-%d")


def _pan():
    L = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    return ("".join(random.choice(L) for _ in range(5)) +
            "".join(str(random.randint(0, 9)) for _ in range(4)) + random.choice(L))


def _mobile():
    return "+91 " + str(random.randint(70, 99)) + "".join(str(random.randint(0, 9)) for _ in range(3)) \
        + " " + "".join(str(random.randint(0, 9)) for _ in range(5))


def _income_to_segment(income):
    if income >= 5000000:
        return "HNI"
    if income >= 1500000:
        return "Affluent"
    return "Mass"


def _income_band(income):
    if income < 500000:
        return "<5L"
    if income < 1000000:
        return "5-10L"
    if income < 2500000:
        return "10-25L"
    if income < 5000000:
        return "25-50L"
    return "50L+"


def generate_customers():
    customers = []
    for i in range(1, NUM_CUSTOMERS + 1):
        gender = random.choice(["Male", "Female"])
        first = random.choice(FIRST_NAMES_MALE if gender == "Male" else FIRST_NAMES_FEMALE)
        last = random.choice(LAST_NAMES)
        age = random.randint(24, 66)
        dob = date(TODAY.year - age, random.randint(1, 12), random.randint(1, 28))
        occupation = random.choices(OCCUPATIONS, weights=[55, 20, 18, 7])[0]

        if occupation == "Retired":
            income = random.randint(3, 15) * 100000
            employer, industry = "Retired", "N/A"
        elif occupation == "Salaried":
            income = random.choice([4, 6, 8, 12, 18, 25, 35, 55, 80]) * 100000
            employer = random.choice(EMPLOYERS_SALARIED)
            industry = random.choice(INDUSTRIES)
        else:  # Self-Employed / Business
            income = random.choice([6, 10, 15, 22, 30, 45, 60, 90]) * 100000
            employer = random.choice(BUSINESS_TYPES)
            industry = "Business / Self-employed"

        income = int(income + random.randint(-50000, 90000))
        segment = _income_to_segment(income)
        # CIBIL skews higher for higher segments, with some spread
        base = {"Mass": 700, "Affluent": 740, "HNI": 770}[segment]
        cibil = max(620, min(880, base + random.randint(-70, 90)))
        city = random.choice(list(CITIES.keys()))
        state, branches = CITIES[city]
        rel_years = random.randint(1, 18)

        customers.append({
            "customer_id": f"EXLC{i:04d}",
            "first_name": first, "last_name": last, "full_name": f"{first} {last}",
            "date_of_birth": _dt(dob), "age": age, "gender": gender,
            "pan": _pan(), "aadhaar_masked": "XXXX XXXX " + str(random.randint(1000, 9999)),
            "email": f"{first.lower()}.{last.lower()}{random.randint(1, 99)}@gmail.com",
            "mobile": _mobile(),
            "address_line": f"{random.randint(1, 300)}, {random.choice(['Green', 'Lake', 'Palm', 'Rose', 'MG'])} "
                            f"{random.choice(['Residency', 'Apartments', 'Nagar', 'Enclave', 'Heights'])}",
            "city": city, "state": state, "pincode": str(random.randint(400001, 700099)),
            "occupation": occupation, "employer": employer, "industry": industry,
            "annual_income": income, "income_band": _income_band(income),
            "marital_status": random.choice(MARITAL),
            "dependents": random.choice([0, 0, 1, 2, 2, 3]),
            "education": random.choice(EDUCATION),
            "residence_type": random.choices(["Owned", "Rented"], weights=[60, 40])[0],
            "segment": segment, "cibil_score": cibil,
            "relationship_since": _dt(date(TODAY.year - rel_years, random.randint(1, 12), random.randint(1, 28))),
            "kyc_status": random.choices(["Verified", "Pending"], weights=[92, 8])[0],
            "risk_category": random.choices(["Low", "Medium", "High"], weights=[60, 30, 10])[0],
            "preferred_language": random.choices(LANGUAGES, weights=[40, 20, 10, 10, 8, 7, 5])[0],
            "home_branch": f"{city} - {random.choice(branches)}",
            "created_at": _dt(TODAY),
        })
    return customers


def generate_accounts(customers):
    accounts = []
    n = 0
    for c in customers:
        n += 1
        state, branches = CITIES[c["city"]]
        branch = c["home_branch"]
        acc_type = "Salary" if c["occupation"] == "Salaried" else "Savings"
        # balance correlated with income & segment
        bal = int(c["annual_income"] * random.uniform(0.05, 0.35))
        accounts.append({
            "account_id": f"AC{n:05d}", "customer_id": c["customer_id"],
            "account_type": acc_type,
            "account_number": "5011" + "".join(str(random.randint(0, 9)) for _ in range(8)),
            "ifsc": "EXLB0" + str(random.randint(100000, 999999)), "branch": branch,
            "balance": bal, "avg_monthly_balance": int(bal * random.uniform(0.6, 1.1)),
            "open_date": c["relationship_since"], "status": "Active",
        })
        # ~30% also hold a second (savings) account
        if random.random() < 0.3:
            n += 1
            bal2 = int(c["annual_income"] * random.uniform(0.02, 0.15))
            accounts.append({
                "account_id": f"AC{n:05d}", "customer_id": c["customer_id"],
                "account_type": "Savings",
                "account_number": "5011" + "".join(str(random.randint(0, 9)) for _ in range(8)),
                "ifsc": "EXLB0" + str(random.randint(100000, 999999)), "branch": branch,
                "balance": bal2, "avg_monthly_balance": int(bal2 * random.uniform(0.6, 1.1)),
                "open_date": c["relationship_since"], "status": random.choice(["Active", "Active", "Dormant"]),
            })
    return accounts


def generate_existing_products(customers):
    """Some products with EXL Bank, some with competitors (to trigger dynamic-script scenarios)."""
    holdings = []
    n = 0
    catalog = {
        "Home Loan": ("Home Loan", 8.5, 11.0),
        "Personal Loan": ("Personal Loan", 12.0, 18.0),
        "Credit Card": ("Credit Card", None, None),
        "Car Loan": ("Car Loan", 9.0, 12.0),
        "Fixed Deposit": ("Fixed Deposit", 6.0, 7.5),
        "Life Insurance": ("Life Insurance", None, None),
    }
    for c in customers:
        held = random.sample(list(catalog.keys()), k=random.randint(0, 3))
        for ptype in held:
            n += 1
            is_own = random.random() < 0.55
            provider = "EXL Bank Limited" if is_own else random.choice(COMPETITOR_BANKS)
            label, rmin, rmax = catalog[ptype]
            sanctioned = None
            outstanding = None
            emi = None
            rate = None
            start = date(TODAY.year - random.randint(1, 6), random.randint(1, 12), random.randint(1, 28))
            end = None
            if ptype in ("Home Loan", "Personal Loan", "Car Loan"):
                sanctioned = random.choice([5, 8, 12, 20, 35, 50]) * 100000
                if ptype == "Home Loan":
                    sanctioned = random.choice([25, 40, 60, 85]) * 100000
                outstanding = int(sanctioned * random.uniform(0.3, 0.9))
                rate = round(random.uniform(rmin, rmax), 2)
                emi = int(sanctioned * (rate / 100 / 12) / (1 - (1 + rate / 100 / 12) ** -120) if rate else 0)
                end = date(start.year + random.randint(5, 20), start.month, start.day)
            elif ptype == "Credit Card":
                sanctioned = random.choice([1, 2, 3, 5, 8]) * 100000  # limit
                outstanding = int(sanctioned * random.uniform(0.0, 0.4))
            elif ptype == "Fixed Deposit":
                sanctioned = random.choice([1, 2, 5, 10]) * 100000
                outstanding = sanctioned
                rate = round(random.uniform(rmin, rmax), 2)
                end = date(start.year + random.randint(1, 5), start.month, start.day)
            holdings.append({
                "holding_id": f"HLD{n:05d}", "customer_id": c["customer_id"],
                "product_type": label, "product_name": f"{provider} {label}",
                "provider": provider, "is_own_bank": 1 if is_own else 0,
                "sanctioned_amount": sanctioned, "outstanding_amount": outstanding,
                "emi": emi, "interest_rate": rate,
                "start_date": _dt(start), "end_date": _dt(end) if end else None,
                "status": "Active" if (outstanding or 0) > 0 or ptype in ("Credit Card", "Fixed Deposit", "Life Insurance") else "Closed",
            })
    return holdings


def generate_transactions(customers, accounts):
    """~12 months of categorized transactions per customer."""
    txns = []
    n = 0
    acc_by_cust = {}
    for a in accounts:
        acc_by_cust.setdefault(a["customer_id"], []).append(a)
    for c in customers:
        cust_accs = acc_by_cust.get(c["customer_id"], [])
        if not cust_accs:
            continue
        primary = cust_accs[0]
        balance = primary["balance"]
        monthly_salary = int(c["annual_income"] / 12)
        for m in range(12, 0, -1):
            month_start = TODAY.replace(day=1) - timedelta(days=30 * m)
            # salary / income credit
            if c["occupation"] in ("Salaried", "Retired"):
                n += 1
                credit = monthly_salary if c["occupation"] == "Salaried" else int(monthly_salary * 0.8)
                balance += credit
                txns.append(_txn(n, c, primary, month_start.replace(day=1),
                                 "Salary" if c["occupation"] == "Salaried" else "Pension",
                                 "Salary" if c["occupation"] == "Salaried" else "Utilities",
                                 "credit", credit, balance, "NEFT",
                                 c["employer"] if c["occupation"] == "Salaried" else "Pension Dept"))
            else:
                # business: 2-4 irregular credits
                for _ in range(random.randint(2, 4)):
                    n += 1
                    credit = int(monthly_salary * random.uniform(0.2, 0.6))
                    balance += credit
                    d = month_start + timedelta(days=random.randint(1, 27))
                    txns.append(_txn(n, c, primary, d, "Business Receipt", "Transfer",
                                     "credit", credit, balance, "NEFT", "Business Income"))
            # spends
            num_spends = random.randint(6, 14)
            for _ in range(num_spends):
                cat = random.choice(list(MERCHANTS.keys()))
                merchant = random.choice(MERCHANTS[cat])
                amt = _spend_amount(cat, c["segment"])
                balance -= amt
                d = month_start + timedelta(days=random.randint(1, 27))
                channel = random.choice(["UPI", "Card", "UPI", "AutoDebit"])
                n += 1
                txns.append(_txn(n, c, primary, d, f"{merchant}", cat, "debit", amt, balance, channel, merchant))
            # EMI debit if likely has a loan (approx via income)
            if random.random() < 0.4:
                n += 1
                emi = int(monthly_salary * random.uniform(0.1, 0.3))
                balance -= emi
                d = month_start + timedelta(days=5)
                txns.append(_txn(n, c, primary, d, "Loan EMI", "EMI", "debit", emi, balance, "AutoDebit", "EMI"))
    return txns


def _txn(n, c, acc, d, desc, cat, ttype, amt, bal, channel, merchant):
    return {
        "txn_id": f"TXN{n:07d}", "customer_id": c["customer_id"], "account_id": acc["account_id"],
        "txn_date": _dt(d), "value_date": _dt(d), "description": desc, "category": cat,
        "txn_type": ttype, "amount": round(float(amt), 2), "balance_after": round(float(max(bal, 0)), 2),
        "channel": channel, "merchant": merchant,
    }


def _spend_amount(cat, segment):
    mult = {"Mass": 1.0, "Affluent": 2.2, "HNI": 4.5}[segment]
    base = {
        "Shopping": (800, 12000), "Groceries": (500, 6000), "Dining": (300, 4000),
        "Utilities": (500, 5000), "Travel": (1500, 40000), "Investment": (2000, 50000),
        "Insurance": (1000, 25000),
    }[cat]
    return int(random.randint(*base) * mult)


def generate_recommendations(customers, holdings):
    """1-3 recommendations per customer based on profile, avoiding products already held with EXL Bank."""
    recs = []
    n = 0
    held_own = {}
    for h in holdings:
        if h["is_own_bank"] == 1:
            held_own.setdefault(h["customer_id"], set()).add(h["product_type"])

    prod_by_cat = {}
    for p in PRODUCTS:
        prod_by_cat.setdefault(p["category"], []).append(p)

    for c in customers:
        candidates = _candidate_products(c, held_own.get(c["customer_id"], set()))
        random.shuffle(candidates)
        k = random.randint(1, min(3, len(candidates)))
        chosen = candidates[:k]
        for rank, p in enumerate(chosen, start=1):
            n += 1
            propensity = round(random.uniform(0.45, 0.95) - (rank - 1) * 0.08, 2)
            propensity = max(0.35, propensity)
            ev = int(_expected_value(p, c))
            codes = random.sample(REASON_CODES.get(p["category"], ["Profile match"]),
                                   k=min(3, len(REASON_CODES.get(p["category"], ["Profile match"]))))
            recs.append({
                "recommendation_id": f"REC{n:05d}", "customer_id": c["customer_id"],
                "product_id": p["product_id"], "propensity_score": propensity, "rank": rank,
                "expected_value": ev, "reason_codes": json.dumps(codes),
                "model_version": "NBO_MODEL_v3.2",
                "generated_at": _dt(TODAY - timedelta(days=random.randint(0, 20))),
                "status": random.choices(["New", "Contacted", "Converted", "Rejected"],
                                          weights=[55, 25, 12, 8])[0],
            })
    return recs


def _candidate_products(c, held):
    cands = []
    for p in PRODUCTS:
        # skip loan categories the customer already holds with EXL Bank
        if p["category"] in ("Home Loan", "Personal Loan", "Car Loan") and p["category"] in held:
            continue
        if c["segment"] not in p["target_segment"]:
            continue
        # simple profile fit
        if p["category"] == "Home Loan" and (c["age"] > 55 or c["residence_type"] == "Owned" and random.random() < 0.5):
            if c["residence_type"] == "Owned":
                continue
        if p["category"] == "Savings" and c["segment"] == "Mass":
            continue
        if p["category"] == "Insurance" and p["name"].startswith("EXL Suraksha") and c["dependents"] == 0:
            continue
        cands.append(p)
    if not cands:
        cands = [p for p in PRODUCTS if c["segment"] in p["target_segment"]]
    return cands


def _expected_value(p, c):
    cat = p["category"]
    if cat in ("Home Loan",):
        return random.randint(30, 90) * 100000 * 0.02
    if cat in ("Personal Loan", "Car Loan"):
        return random.randint(3, 20) * 100000 * 0.03
    if cat == "Credit Card":
        return random.randint(4000, 25000)
    if cat in ("Fixed Deposit", "Investment"):
        return random.randint(1, 15) * 100000 * 0.01
    if cat == "Insurance":
        return random.randint(6000, 40000)
    if cat == "Savings":
        return random.randint(3000, 12000)
    return 5000


def generate_seed_activity(customers, recs, holdings):
    """Pre-seed some feedback, notes, follow-ups, messages so analytics/dashboards look populated."""
    feedback, notes, follow_ups, messages = [], [], [], []
    agents = [u["user_id"] for u in USERS if u["role"] == "agent"]
    outcomes = ["Converted", "Interested", "Callback", "Rejected", "No Answer"]

    # Feedback tied to some 'used' recommendations (synthetic script ids)
    fn = 0
    for r in random.sample(recs, k=min(30, len(recs))):
        fn += 1
        rating = random.choices([5, 4, 3, 2, 1], weights=[25, 35, 22, 12, 6])[0]
        outcome = random.choices(outcomes, weights=[18, 30, 25, 15, 12])[0]
        feedback.append({
            "feedback_id": f"FBK{fn:05d}", "script_id": f"SCR{fn:05d}",
            "agent_id": random.choice(agents), "rating": rating, "outcome": outcome,
            "comments": random.choice([
                "Pitch felt natural and personalized.", "Customer appreciated the tailored numbers.",
                "Objection handling section was very useful.", "Too long, need a crisper version.",
                "Great hook, closed the call positively.", "Customer already had the product elsewhere.",
            ]),
            "improvement_instruction": "",
            "created_at": _dt(TODAY - timedelta(days=random.randint(1, 60))),
        })

    nn = 0
    for c in random.sample(customers, k=min(20, len(customers))):
        nn += 1
        sentiment = random.choice(["Positive", "Neutral", "Negative"])
        notes.append({
            "note_id": f"NOTE{nn:04d}", "customer_id": c["customer_id"], "agent_id": random.choice(agents),
            "content": random.choice([
                "Customer interested but wants to compare with existing bank offer. Call back next week.",
                "Asked about home loan interest rate for 20 years. Wants email with details.",
                "Not interested right now, revisit after 3 months.",
                "Very keen on the credit card, requested application link on WhatsApp.",
                "Concerned about processing fees. Needs reassurance on transparency.",
            ]),
            "ai_summary": "", "sentiment": sentiment, "key_points": json.dumps([]),
            "created_at": _dt(TODAY - timedelta(days=random.randint(1, 30))),
        })

    fu = 0
    for c in random.sample(customers, k=min(12, len(customers))):
        fu += 1
        due = TODAY + timedelta(days=random.randint(0, 14))
        follow_ups.append({
            "followup_id": f"FUP{fu:04d}", "customer_id": c["customer_id"], "agent_id": random.choice(agents),
            "note_id": None, "title": f"Callback: {c['full_name']}",
            "description": "Follow up on product discussion and share details.",
            "type": random.choice(["Callback", "Meeting", "Task"]),
            "due_date": _dt(due), "due_time": random.choice(["10:00", "11:30", "15:00", "16:30"]),
            "priority": random.choice(["High", "Medium", "Low"]),
            "status": random.choices(["Pending", "Done", "Missed"], weights=[70, 20, 10])[0],
            "created_at": _dt(TODAY - timedelta(days=random.randint(1, 10))),
        })

    return feedback, notes, follow_ups, messages


def build_dataset():
    customers = generate_customers()
    accounts = generate_accounts(customers)
    holdings = generate_existing_products(customers)
    transactions = generate_transactions(customers, accounts)
    recs = generate_recommendations(customers, holdings)
    feedback, notes, follow_ups, messages = generate_seed_activity(customers, recs, holdings)

    return {
        "customers": customers,
        "accounts": accounts,
        "existing_products": holdings,
        "transactions": transactions,
        "recommendations": recs,
        "feedback": feedback,
        "notes": notes,
        "follow_ups": follow_ups,
        "messages_sent": messages,
    }


if __name__ == "__main__":
    ds = build_dataset()
    for k, v in ds.items():
        print(f"{k:20s}: {len(v)} rows")
