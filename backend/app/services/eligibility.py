"""Product eligibility checker: rule engine validates customer vs policy, LLM explains."""
import json
from ..llm import gemini
from ..llm.prompts import render
from . import context


def _as_list(v):
    if isinstance(v, list):
        return v
    if isinstance(v, str) and v:
        try:
            return json.loads(v)
        except ValueError:
            return [v]
    return []


def check(customer_id, product_id):
    customer = context.get_customer(customer_id)
    product = context.get_product(product_id)
    policy = context.get_policy(product_id)
    if not customer or not product or not policy:
        raise ValueError("Customer, product, or policy not found")

    checks = _run_rules(customer, policy)
    eligible = all(c["passed"] for c in checks)
    verdict = "ELIGIBLE" if eligible else "NOT_ELIGIBLE"

    result = {
        "customer_id": customer_id,
        "product_id": product_id,
        "product_name": product["name"],
        "verdict": verdict,
        "rule_checks": checks,
    }

    # LLM explanation (with graceful fallback)
    if gemini.enabled:
        try:
            rule_text = "\n".join(
                f"- {c['criterion']}: {'PASS' if c['passed'] else 'FAIL'} "
                f"(required: {c['required']}, actual: {c['actual']})" for c in checks)
            prompt = render("eligibility_explanation", product_name=product["name"],
                            verdict=verdict, rule_results=rule_text)
            expl = gemini.generate_json(prompt, temperature=0.4)
            result.update({
                "headline": expl.get("headline"),
                "explanation": expl.get("explanation"),
                "failed_reasons": expl.get("failed_reasons", []),
                "suggestions": expl.get("suggestions", []),
            })
            return result
        except Exception:
            pass
    result.update(_fallback_explanation(verdict, checks, customer))
    return result


def _run_rules(customer, policy):
    checks = []

    def add(criterion, passed, required, actual):
        checks.append({"criterion": criterion, "passed": bool(passed),
                       "required": str(required), "actual": str(actual)})

    age = customer["age"]
    if policy.get("min_age") is not None:
        add("Minimum age", age >= policy["min_age"], f">= {policy['min_age']} yrs", f"{age} yrs")
    if policy.get("max_age") is not None:
        add("Maximum age", age <= policy["max_age"], f"<= {policy['max_age']} yrs", f"{age} yrs")
    if policy.get("min_annual_income"):
        add("Minimum annual income", customer["annual_income"] >= policy["min_annual_income"],
            f">= Rs.{int(policy['min_annual_income']):,}", f"Rs.{int(customer['annual_income']):,}")
    if policy.get("min_cibil"):
        cib = customer["cibil_score"] or 0
        add("Minimum CIBIL score", cib >= policy["min_cibil"], f">= {policy['min_cibil']}", cib)
    emp = _as_list(policy.get("eligible_employment"))
    if emp:
        add("Eligible employment type", customer["occupation"] in emp,
            "/".join(emp), customer["occupation"])
    return checks


def _fallback_explanation(verdict, checks, customer):
    failed = [c for c in checks if not c["passed"]]
    if verdict == "ELIGIBLE":
        return {
            "headline": f"{customer['full_name']} is eligible for this product.",
            "explanation": "The customer meets all key eligibility criteria based on age, income, "
                           "credit score and employment profile.",
            "failed_reasons": [],
            "suggestions": [],
        }
    reasons = [f"{c['criterion']} not met (required {c['required']}, actual {c['actual']})" for c in failed]
    return {
        "headline": f"{customer['full_name']} is currently not eligible for this product.",
        "explanation": "The customer does not meet one or more mandatory criteria: "
                       + "; ".join(reasons) + ".",
        "failed_reasons": reasons,
        "suggestions": ["Revisit once the failing criteria improve (e.g. higher CIBIL / income)."],
    }
