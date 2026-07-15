"""
Creates the SQLite database from the DDL files and loads all mock data.

Run:  python seed.py
Produces: backend/data/sales_buddy.db and writes generated JSON to generated/
"""
import os
import glob
import json
import sqlite3

from generate_all import build_dataset
from curated_products import PRODUCTS, build_policy_document
from curated_users import USERS
from curated_templates import TEMPLATES

HERE = os.path.dirname(os.path.abspath(__file__))
BACKEND = os.path.dirname(HERE)
DDL_DIR = os.path.join(BACKEND, "ddl")
DATA_DIR = os.path.join(BACKEND, "data")
GEN_DIR = os.path.join(HERE, "generated")
DB_PATH = os.path.join(DATA_DIR, "sales_buddy.db")


def _ensure_dirs():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(GEN_DIR, exist_ok=True)


def create_schema(conn):
    for ddl_file in sorted(glob.glob(os.path.join(DDL_DIR, "*.sql"))):
        with open(ddl_file, "r", encoding="utf-8") as f:
            conn.executescript(f.read())
    conn.commit()


def _insert(conn, table, rows):
    if not rows:
        return
    cols = list(rows[0].keys())
    placeholders = ",".join("?" for _ in cols)
    sql = f"INSERT INTO {table} ({','.join(cols)}) VALUES ({placeholders})"
    conn.executemany(sql, [[r.get(c) for c in cols] for r in rows])
    conn.commit()


def build_product_rows():
    products, policies = [], []
    for p in PRODUCTS:
        pol = p["policy"]
        products.append({
            "product_id": p["product_id"], "product_code": p["product_code"], "name": p["name"],
            "category": p["category"], "tagline": p["tagline"], "description": p["description"],
            "key_benefits": json.dumps(p["key_benefits"]), "features": json.dumps(p["features"]),
            "interest_rate_min": p["interest_rate_min"], "interest_rate_max": p["interest_rate_max"],
            "min_amount": p["min_amount"], "max_amount": p["max_amount"],
            "tenure_min_months": p["tenure_min_months"], "tenure_max_months": p["tenure_max_months"],
            "processing_fee": p["processing_fee"], "annual_fee": p["annual_fee"],
            "target_segment": json.dumps(p["target_segment"]), "is_active": 1,
        })
        policies.append({
            "policy_id": "POL" + p["product_id"][3:], "product_id": p["product_id"],
            "min_age": pol["min_age"], "max_age": pol["max_age"],
            "min_annual_income": pol["min_annual_income"], "min_cibil": pol["min_cibil"],
            "eligible_employment": json.dumps(pol["eligible_employment"]),
            "max_ltv": pol["max_ltv"], "max_foir": pol["max_foir"], "min_balance": pol["min_balance"],
            "required_documents": json.dumps(pol["required_documents"]),
            "other_conditions": json.dumps(pol["other_conditions"]),
            "mandatory_disclosures": json.dumps(pol["mandatory_disclosures"]),
            "policy_document": build_policy_document(p, pol),
        })
    return products, policies


def main():
    _ensure_dirs()
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    create_schema(conn)

    dataset = build_dataset()
    products, policies = build_product_rows()

    # curated
    _insert(conn, "products", products)
    _insert(conn, "product_policies", policies)
    _insert(conn, "users", USERS)
    _insert(conn, "pitch_templates", [
        {**t, "structure": json.dumps(t["structure"]), "rules": json.dumps(t["rules"]),
         "techniques": json.dumps(t["techniques"]), "created_at": "2026-01-10"}
        for t in TEMPLATES
    ])

    # generated
    _insert(conn, "customers", dataset["customers"])
    _insert(conn, "accounts", dataset["accounts"])
    _insert(conn, "existing_products", dataset["existing_products"])
    _insert(conn, "transactions", dataset["transactions"])
    _insert(conn, "recommendations", dataset["recommendations"])
    _insert(conn, "feedback", dataset["feedback"])
    _insert(conn, "notes", dataset["notes"])
    _insert(conn, "follow_ups", dataset["follow_ups"])

    # write JSON snapshots for easy inspection/debugging
    snapshot = {**dataset, "products": products, "product_policies": policies,
                "users": USERS, "pitch_templates": TEMPLATES}
    for name, rows in snapshot.items():
        with open(os.path.join(GEN_DIR, f"{name}.json"), "w", encoding="utf-8") as f:
            json.dump(rows, f, indent=2, ensure_ascii=False)

    # summary
    print(f"Database created at: {DB_PATH}")
    for tbl in ["customers", "accounts", "existing_products", "transactions", "products",
                "product_policies", "recommendations", "users", "pitch_templates",
                "feedback", "notes", "follow_ups"]:
        cnt = conn.execute(f"SELECT COUNT(*) FROM {tbl}").fetchone()[0]
        print(f"  {tbl:20s}: {cnt} rows")
    conn.close()


if __name__ == "__main__":
    main()
