"""
Curated EXL Bank Limited product catalog + eligibility policies.
Hand-crafted so descriptions & policy documents read like real bank collateral.
Each entry carries both the product master fields and its policy fields.
Rates/fees are indicative and realistic for the Indian retail-banking market.
"""

PRODUCTS = [
    {
        "product_id": "PRD001",
        "product_code": "HL-GRIHA",
        "name": "EXL Griha Home Loan",
        "category": "Home Loan",
        "tagline": "Your dream home, made affordable.",
        "description": (
            "The EXL Griha Home Loan helps you purchase, construct, or renovate your home with "
            "competitive floating interest rates linked to the RBI repo rate. Enjoy loans up to "
            "Rs.5 crore with tenures extending to 30 years, minimal documentation, and doorstep "
            "service. Balance-transfer facility and top-up loans are available for existing borrowers."
        ),
        "key_benefits": [
            "Interest rates starting at 8.40% p.a. (repo-linked)",
            "Loan up to 90% of property value (LTV)",
            "Tenure up to 30 years for easy EMIs",
            "No prepayment charges on floating-rate loans",
            "Free personal accident insurance cover",
        ],
        "features": [
            "Repo-linked lending rate (RLLR)",
            "Balance transfer + top-up facility",
            "PMAY subsidy assistance for eligible applicants",
            "Online EMI tracking and account management",
        ],
        "interest_rate_min": 8.40,
        "interest_rate_max": 10.25,
        "min_amount": 500000,
        "max_amount": 50000000,
        "tenure_min_months": 60,
        "tenure_max_months": 360,
        "processing_fee": "0.35% of loan amount (min Rs.10,000, max Rs.25,000)",
        "annual_fee": None,
        "target_segment": ["Mass", "Affluent", "HNI"],
        "policy": {
            "min_age": 23,
            "max_age": 65,
            "min_annual_income": 500000,
            "min_cibil": 700,
            "eligible_employment": ["Salaried", "Self-Employed", "Business"],
            "max_ltv": 90.0,
            "max_foir": 55.0,
            "min_balance": None,
            "required_documents": [
                "PAN & Aadhaar", "Latest 6 months bank statement", "Salary slips / ITR (2 years)",
                "Property documents & sale agreement", "Passport-size photographs",
            ],
            "other_conditions": [
                "Property must be approved / within municipal limits",
                "Applicant age + tenure must not exceed 70 years at maturity",
                "Minimum 3 years of continuous employment or business vintage",
            ],
            "mandatory_disclosures": [
                "Interest rate is floating and linked to RBI repo rate; EMIs may change with repo revisions.",
                "Processing fee is non-refundable once the loan is sanctioned.",
                "Property is mortgaged to EXL Bank until full repayment.",
            ],
        },
    },
    {
        "product_id": "PRD002",
        "product_code": "PL-INSTA",
        "name": "EXL Insta Personal Loan",
        "category": "Personal Loan",
        "tagline": "Funds for life's moments, instantly.",
        "description": (
            "A collateral-free personal loan for weddings, travel, medical needs, or debt "
            "consolidation. Pre-approved customers get instant disbursal to their EXL Bank account. "
            "Fixed EMIs, transparent charges, and flexible tenures up to 6 years."
        ),
        "key_benefits": [
            "Loans from Rs.50,000 to Rs.40 lakh",
            "Instant approval for pre-qualified customers",
            "No collateral or guarantor required",
            "Fixed interest rate and predictable EMIs",
        ],
        "features": [
            "Disbursal within 24 hours",
            "Flexible tenure 12-72 months",
            "Part-prepayment allowed after 12 EMIs",
        ],
        "interest_rate_min": 10.75,
        "interest_rate_max": 18.00,
        "min_amount": 50000,
        "max_amount": 4000000,
        "tenure_min_months": 12,
        "tenure_max_months": 72,
        "processing_fee": "Up to 2% of loan amount + GST",
        "annual_fee": None,
        "target_segment": ["Mass", "Affluent"],
        "policy": {
            "min_age": 21,
            "max_age": 60,
            "min_annual_income": 300000,
            "min_cibil": 720,
            "eligible_employment": ["Salaried", "Self-Employed"],
            "max_ltv": None,
            "max_foir": 50.0,
            "min_balance": None,
            "required_documents": [
                "PAN & Aadhaar", "Latest 3 months salary slips", "Last 6 months bank statement",
            ],
            "other_conditions": [
                "Minimum net monthly income of Rs.25,000",
                "Minimum 1 year in current job",
                "No active loan default in credit history",
            ],
            "mandatory_disclosures": [
                "Personal loans carry a higher rate of interest than secured loans.",
                "Late payment attracts penal charges of 2% per month on overdue amount.",
                "Foreclosure charges of up to 4% apply if closed before 12 EMIs.",
            ],
        },
    },
    {
        "product_id": "PRD003",
        "product_code": "CL-DRIVE",
        "name": "EXL Drive Car Loan",
        "category": "Car Loan",
        "tagline": "Drive home your dream car today.",
        "description": (
            "Finance new and pre-owned cars with up to 100% on-road funding for select models. "
            "Attractive rates, quick sanction, and tie-ups with leading dealerships across India."
        ),
        "key_benefits": [
            "Up to 100% on-road funding on select models",
            "Interest rates from 8.85% p.a.",
            "Tenure up to 7 years",
            "Quick sanction with minimal paperwork",
        ],
        "features": [
            "New & used car financing",
            "Dealer tie-ups for instant processing",
            "Flexible repayment options",
        ],
        "interest_rate_min": 8.85,
        "interest_rate_max": 12.50,
        "min_amount": 100000,
        "max_amount": 15000000,
        "tenure_min_months": 12,
        "tenure_max_months": 84,
        "processing_fee": "Rs.5,000 - Rs.10,000 (flat)",
        "annual_fee": None,
        "target_segment": ["Mass", "Affluent", "HNI"],
        "policy": {
            "min_age": 21,
            "max_age": 65,
            "min_annual_income": 400000,
            "min_cibil": 700,
            "eligible_employment": ["Salaried", "Self-Employed", "Business"],
            "max_ltv": 100.0,
            "max_foir": 50.0,
            "min_balance": None,
            "required_documents": [
                "PAN & Aadhaar", "Income proof (salary slips / ITR)", "Bank statement (6 months)",
                "Proforma invoice of the vehicle",
            ],
            "other_conditions": [
                "Vehicle hypothecated to EXL Bank until loan closure",
                "Comprehensive motor insurance mandatory for loan tenure",
            ],
            "mandatory_disclosures": [
                "The financed vehicle is hypothecated to EXL Bank until full repayment.",
                "On-road funding percentage varies by model and applicant profile.",
            ],
        },
    },
    {
        "product_id": "PRD004",
        "product_code": "CC-PLAT",
        "name": "EXL Platinum Credit Card",
        "category": "Credit Card",
        "tagline": "Rewards that keep giving.",
        "description": (
            "A lifestyle rewards card offering accelerated points on dining, groceries, and online "
            "spends, along with fuel-surcharge waiver and complimentary lounge access. Ideal for "
            "everyday spenders who want value on every swipe."
        ),
        "key_benefits": [
            "5X reward points on dining & groceries",
            "1% fuel surcharge waiver",
            "4 complimentary domestic lounge visits / year",
            "Interest-free credit up to 50 days",
        ],
        "features": [
            "Contactless payments",
            "EMI conversion on large spends",
            "Add-on cards for family",
        ],
        "interest_rate_min": 42.0,
        "interest_rate_max": 46.0,
        "min_amount": None,
        "max_amount": None,
        "tenure_min_months": None,
        "tenure_max_months": None,
        "processing_fee": "Nil",
        "annual_fee": 999,
        "target_segment": ["Mass", "Affluent"],
        "policy": {
            "min_age": 21,
            "max_age": 60,
            "min_annual_income": 360000,
            "min_cibil": 750,
            "eligible_employment": ["Salaried", "Self-Employed", "Business"],
            "max_ltv": None,
            "max_foir": None,
            "min_balance": None,
            "required_documents": ["PAN & Aadhaar", "Income proof", "Address proof"],
            "other_conditions": [
                "Annual fee waived on annual spends above Rs.1.5 lakh",
                "Credit limit assigned basis income and bureau score",
            ],
            "mandatory_disclosures": [
                "Finance charges up to 3.75% per month (46% p.a.) apply on revolving balances.",
                "Paying only the minimum amount due extends repayment and increases interest cost.",
                "Cash withdrawals attract a cash-advance fee and interest from day one.",
            ],
        },
    },
    {
        "product_id": "PRD005",
        "product_code": "CC-SIGN",
        "name": "EXL Signature Credit Card",
        "category": "Credit Card",
        "tagline": "Premium privileges, effortlessly yours.",
        "description": (
            "A premium metal card crafted for affluent customers, featuring unlimited lounge access, "
            "concierge service, golf privileges, and accelerated rewards on travel and luxury spends."
        ),
        "key_benefits": [
            "Unlimited domestic & 6 international lounge visits",
            "10X rewards on travel & luxury",
            "Dedicated 24x7 concierge",
            "Complimentary golf games monthly",
        ],
        "features": [
            "Metal card design",
            "Milestone travel vouchers",
            "Global acceptance with low forex markup (2%)",
        ],
        "interest_rate_min": 42.0,
        "interest_rate_max": 46.0,
        "min_amount": None,
        "max_amount": None,
        "tenure_min_months": None,
        "tenure_max_months": None,
        "processing_fee": "Nil",
        "annual_fee": 4999,
        "target_segment": ["Affluent", "HNI"],
        "policy": {
            "min_age": 25,
            "max_age": 65,
            "min_annual_income": 1500000,
            "min_cibil": 770,
            "eligible_employment": ["Salaried", "Self-Employed", "Business"],
            "max_ltv": None,
            "max_foir": None,
            "min_balance": None,
            "required_documents": ["PAN & Aadhaar", "Income proof (ITR / Form 16)", "Address proof"],
            "other_conditions": [
                "Annual fee waived on annual spends above Rs.5 lakh",
                "Reserved for Affluent and HNI segment customers",
            ],
            "mandatory_disclosures": [
                "Finance charges up to 3.75% per month (46% p.a.) apply on revolving balances.",
                "Forex markup of 2% applies on international transactions.",
            ],
        },
    },
    {
        "product_id": "PRD006",
        "product_code": "FD-SMART",
        "name": "EXL Smart Fixed Deposit",
        "category": "Fixed Deposit",
        "tagline": "Guaranteed growth for your savings.",
        "description": (
            "A safe, assured-return investment with flexible tenures from 7 days to 10 years. "
            "Senior citizens earn an additional 0.50% p.a. Auto-renewal, sweep-in, and loan-against-FD "
            "facilities available."
        ),
        "key_benefits": [
            "Interest up to 7.25% p.a. (7.75% for senior citizens)",
            "Flexible tenure 7 days to 10 years",
            "Loan against FD up to 90% of deposit",
            "Guaranteed returns, DICGC insured up to Rs.5 lakh",
        ],
        "features": [
            "Monthly / quarterly / cumulative payout",
            "Auto-renewal option",
            "Premature withdrawal facility",
        ],
        "interest_rate_min": 3.50,
        "interest_rate_max": 7.75,
        "min_amount": 10000,
        "max_amount": 20000000,
        "tenure_min_months": 1,
        "tenure_max_months": 120,
        "processing_fee": "Nil",
        "annual_fee": None,
        "target_segment": ["Mass", "Affluent", "HNI"],
        "policy": {
            "min_age": 18,
            "max_age": 100,
            "min_annual_income": 0,
            "min_cibil": None,
            "eligible_employment": ["Salaried", "Self-Employed", "Business", "Retired", "Homemaker", "Student"],
            "max_ltv": None,
            "max_foir": None,
            "min_balance": 10000,
            "required_documents": ["PAN & Aadhaar", "KYC documents"],
            "other_conditions": [
                "Minimum deposit Rs.10,000",
                "TDS applicable if interest exceeds Rs.40,000 per year (Rs.50,000 for seniors)",
            ],
            "mandatory_disclosures": [
                "Premature withdrawal attracts a penalty of 0.50% - 1.00% on the applicable rate.",
                "Deposit insurance by DICGC covers up to Rs.5 lakh per depositor.",
                "Interest income is taxable as per your income-tax slab.",
            ],
        },
    },
    {
        "product_id": "PRD007",
        "product_code": "RD-GROW",
        "name": "EXL Grow Recurring Deposit",
        "category": "Fixed Deposit",
        "tagline": "Small savings, big goals.",
        "description": (
            "Build a corpus with disciplined monthly savings. Start with as little as Rs.500 per month "
            "and earn FD-equivalent interest rates with flexible tenures."
        ),
        "key_benefits": [
            "Start from just Rs.500/month",
            "Interest up to 7.10% p.a.",
            "Flexible tenure 6 months to 10 years",
            "Auto-debit from savings account",
        ],
        "features": ["Standing-instruction auto-debit", "Goal-based savings", "Loan against RD"],
        "interest_rate_min": 4.50,
        "interest_rate_max": 7.10,
        "min_amount": 500,
        "max_amount": 200000,
        "tenure_min_months": 6,
        "tenure_max_months": 120,
        "processing_fee": "Nil",
        "annual_fee": None,
        "target_segment": ["Mass", "Affluent"],
        "policy": {
            "min_age": 18,
            "max_age": 100,
            "min_annual_income": 0,
            "min_cibil": None,
            "eligible_employment": ["Salaried", "Self-Employed", "Business", "Retired", "Homemaker", "Student"],
            "max_ltv": None,
            "max_foir": None,
            "min_balance": 500,
            "required_documents": ["PAN & Aadhaar", "Active EXL Bank savings account"],
            "other_conditions": ["Requires an active EXL Bank savings account for auto-debit"],
            "mandatory_disclosures": [
                "Missing monthly instalments attracts a small penalty and may affect maturity value.",
                "Interest income is taxable as per your income-tax slab.",
            ],
        },
    },
    {
        "product_id": "PRD008",
        "product_code": "SA-WEALTH",
        "name": "EXL Wealth Savings Account",
        "category": "Savings",
        "tagline": "Banking that rewards your relationship.",
        "description": (
            "A premium savings account with higher interest, priority service, waived charges, and "
            "exclusive lifestyle privileges for Affluent and HNI customers maintaining a higher average balance."
        ),
        "key_benefits": [
            "Up to 3.5% p.a. interest on savings",
            "Dedicated relationship manager",
            "Free unlimited ATM transactions",
            "Complimentary airport lounge access",
        ],
        "features": ["Priority branch service", "Higher transaction limits", "Preferential loan pricing"],
        "interest_rate_min": 3.0,
        "interest_rate_max": 3.5,
        "min_amount": None,
        "max_amount": None,
        "tenure_min_months": None,
        "tenure_max_months": None,
        "processing_fee": "Nil",
        "annual_fee": None,
        "target_segment": ["Affluent", "HNI"],
        "policy": {
            "min_age": 18,
            "max_age": 100,
            "min_annual_income": 1000000,
            "min_cibil": None,
            "eligible_employment": ["Salaried", "Self-Employed", "Business", "Retired"],
            "max_ltv": None,
            "max_foir": None,
            "min_balance": 100000,
            "required_documents": ["PAN & Aadhaar", "Address proof", "Photographs"],
            "other_conditions": [
                "Average monthly balance of Rs.1,00,000 required",
                "Non-maintenance attracts monthly charges",
            ],
            "mandatory_disclosures": [
                "Failure to maintain the average monthly balance attracts non-maintenance charges.",
                "Interest is calculated on daily balance and paid quarterly.",
            ],
        },
    },
    {
        "product_id": "PRD009",
        "product_code": "INS-LIFE",
        "name": "EXL Suraksha Term Life Insurance",
        "category": "Insurance",
        "tagline": "Protect what matters most.",
        "description": (
            "A pure-protection term plan offering high life cover at affordable premiums. Secure your "
            "family's financial future with cover up to Rs.2 crore, optional riders, and tax benefits "
            "under Section 80C."
        ),
        "key_benefits": [
            "Life cover up to Rs.2 crore",
            "Affordable premiums starting Rs.500/month",
            "Tax benefits under Sec 80C & 10(10D)",
            "Optional critical-illness & accidental riders",
        ],
        "features": ["Level term cover", "Flexible premium payment", "Terminal illness benefit"],
        "interest_rate_min": None,
        "interest_rate_max": None,
        "min_amount": 500000,
        "max_amount": 20000000,
        "tenure_min_months": 60,
        "tenure_max_months": 480,
        "processing_fee": "Nil",
        "annual_fee": None,
        "target_segment": ["Mass", "Affluent", "HNI"],
        "policy": {
            "min_age": 18,
            "max_age": 60,
            "min_annual_income": 300000,
            "min_cibil": None,
            "eligible_employment": ["Salaried", "Self-Employed", "Business"],
            "max_ltv": None,
            "max_foir": None,
            "min_balance": None,
            "required_documents": ["PAN & Aadhaar", "Income proof", "Medical check-up (if required)"],
            "other_conditions": [
                "Sum assured basis age, income and health profile",
                "Medical examination may be required above certain cover / age",
            ],
            "mandatory_disclosures": [
                "This is a pure term insurance plan with no maturity / survival benefit.",
                "Claims are subject to policy terms; non-disclosure of material facts can void the claim.",
                "Insurance is a subject matter of solicitation. IRDAI-regulated product.",
            ],
        },
    },
    {
        "product_id": "PRD010",
        "product_code": "INS-HEALTH",
        "name": "EXL Arogya Health Insurance",
        "category": "Insurance",
        "tagline": "Health cover for the whole family.",
        "description": (
            "A comprehensive family-floater health plan covering hospitalization, day-care procedures, "
            "and pre/post-hospitalization expenses with cashless treatment at 8,000+ network hospitals."
        ),
        "key_benefits": [
            "Family floater cover up to Rs.50 lakh",
            "Cashless treatment at 8,000+ hospitals",
            "No-claim bonus up to 100%",
            "Tax benefit under Sec 80D",
        ],
        "features": ["Pre & post hospitalization cover", "Day-care procedures", "Annual health check-up"],
        "interest_rate_min": None,
        "interest_rate_max": None,
        "min_amount": 300000,
        "max_amount": 5000000,
        "tenure_min_months": 12,
        "tenure_max_months": 36,
        "processing_fee": "Nil",
        "annual_fee": None,
        "target_segment": ["Mass", "Affluent", "HNI"],
        "policy": {
            "min_age": 18,
            "max_age": 65,
            "min_annual_income": 200000,
            "min_cibil": None,
            "eligible_employment": ["Salaried", "Self-Employed", "Business", "Retired", "Homemaker"],
            "max_ltv": None,
            "max_foir": None,
            "min_balance": None,
            "required_documents": ["PAN & Aadhaar", "Proposal form", "Medical history declaration"],
            "other_conditions": [
                "Pre-existing diseases covered after a waiting period of 2-4 years",
                "Initial waiting period of 30 days for illnesses",
            ],
            "mandatory_disclosures": [
                "Pre-existing conditions have a waiting period as per policy terms.",
                "Premium increases with age and at renewal.",
                "Insurance is a subject matter of solicitation. IRDAI-regulated product.",
            ],
        },
    },
    {
        "product_id": "PRD011",
        "product_code": "LN-GOLD",
        "name": "EXL Gold Loan",
        "category": "Personal Loan",
        "tagline": "Unlock the value of your gold.",
        "description": (
            "Get instant funds against your gold jewellery at attractive rates. Quick in-branch "
            "disbursal, transparent valuation, and secure storage of your ornaments."
        ),
        "key_benefits": [
            "Loan up to 75% of gold value",
            "Rates from 9.50% p.a.",
            "Disbursal in 30 minutes",
            "Flexible repayment options",
        ],
        "features": ["Transparent BIS-hallmark valuation", "Secure vault storage", "Part-payment allowed"],
        "interest_rate_min": 9.50,
        "interest_rate_max": 16.00,
        "min_amount": 25000,
        "max_amount": 5000000,
        "tenure_min_months": 6,
        "tenure_max_months": 36,
        "processing_fee": "0.5% of loan amount",
        "annual_fee": None,
        "target_segment": ["Mass", "Affluent"],
        "policy": {
            "min_age": 18,
            "max_age": 70,
            "min_annual_income": 0,
            "min_cibil": None,
            "eligible_employment": ["Salaried", "Self-Employed", "Business", "Retired", "Homemaker", "Student"],
            "max_ltv": 75.0,
            "max_foir": None,
            "min_balance": None,
            "required_documents": ["PAN & Aadhaar", "Gold ornaments for pledge"],
            "other_conditions": [
                "Only gold jewellery of 18-22 carat accepted",
                "Loan amount basis RBI-permitted LTV on gold value",
            ],
            "mandatory_disclosures": [
                "Pledged gold may be auctioned if the loan is not repaid as per terms.",
                "Gold value is assessed as per prevailing market rate and RBI-permitted LTV.",
            ],
        },
    },
    {
        "product_id": "PRD012",
        "product_code": "INV-SIP",
        "name": "EXL Prosperity SIP & Mutual Funds",
        "category": "Investment",
        "tagline": "Invest smart, grow wealthy.",
        "description": (
            "Start a Systematic Investment Plan across curated equity, debt, and hybrid mutual funds. "
            "Goal-based investing with expert-managed portfolios, paperless onboarding, and flexible "
            "SIP amounts from Rs.500/month."
        ),
        "key_benefits": [
            "SIP from Rs.500/month",
            "Curated funds across risk profiles",
            "Goal-based portfolio planning",
            "ELSS options with Sec 80C benefit",
        ],
        "features": ["Paperless KYC & onboarding", "Auto-debit SIP", "Portfolio rebalancing advisory"],
        "interest_rate_min": None,
        "interest_rate_max": None,
        "min_amount": 500,
        "max_amount": None,
        "tenure_min_months": 12,
        "tenure_max_months": None,
        "processing_fee": "Nil (expense ratio applies per fund)",
        "annual_fee": None,
        "target_segment": ["Mass", "Affluent", "HNI"],
        "policy": {
            "min_age": 18,
            "max_age": 100,
            "min_annual_income": 0,
            "min_cibil": None,
            "eligible_employment": ["Salaried", "Self-Employed", "Business", "Retired", "Student"],
            "max_ltv": None,
            "max_foir": None,
            "min_balance": None,
            "required_documents": ["PAN & Aadhaar", "Bank account", "KYC (in-person / video)"],
            "other_conditions": ["Investor risk-profiling questionnaire mandatory before investing"],
            "mandatory_disclosures": [
                "Mutual fund investments are subject to market risks; read all scheme-related documents carefully.",
                "Past performance is not indicative of future returns.",
                "Returns are not guaranteed and depend on market performance.",
            ],
        },
    },
]


def build_policy_document(product, policy):
    """Compose a realistic long-form policy document string for a product."""
    lines = [
        f"EXL BANK LIMITED - PRODUCT POLICY DOCUMENT",
        f"Product: {product['name']} ({product['product_code']})",
        f"Category: {product['category']}",
        "",
        "1. ELIGIBILITY CRITERIA",
        f"   - Age: {policy['min_age']} to {policy['max_age']} years",
    ]
    if policy.get("min_annual_income"):
        lines.append(f"   - Minimum annual income: Rs.{int(policy['min_annual_income']):,}")
    if policy.get("min_cibil"):
        lines.append(f"   - Minimum CIBIL score: {policy['min_cibil']}")
    lines.append(f"   - Eligible employment: {', '.join(policy['eligible_employment'])}")
    if policy.get("max_ltv"):
        lines.append(f"   - Maximum loan-to-value (LTV): {policy['max_ltv']}%")
    if policy.get("max_foir"):
        lines.append(f"   - Maximum FOIR (obligations to income): {policy['max_foir']}%")
    if policy.get("min_balance"):
        lines.append(f"   - Minimum balance / deposit: Rs.{int(policy['min_balance']):,}")
    lines += ["", "2. REQUIRED DOCUMENTS"]
    lines += [f"   - {d}" for d in policy["required_documents"]]
    lines += ["", "3. TERMS & CONDITIONS"]
    lines += [f"   - {c}" for c in policy["other_conditions"]]
    lines += ["", "4. MANDATORY DISCLOSURES (as per RBI / IRDAI norms)"]
    lines += [f"   - {d}" for d in policy["mandatory_disclosures"]]
    lines += ["", "This document is indicative and for internal sales enablement use only."]
    return "\n".join(lines)
