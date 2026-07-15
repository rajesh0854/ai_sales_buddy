"""Curated Indian reference data pools for realistic mock generation."""

FIRST_NAMES_MALE = [
    "Rajesh", "Arjun", "Vikram", "Suresh", "Anil", "Rohan", "Karthik", "Aditya", "Sanjay",
    "Manish", "Deepak", "Nikhil", "Rahul", "Vivek", "Amit", "Prakash", "Harish", "Gaurav",
    "Ravi", "Sundar", "Naveen", "Kiran", "Ramesh", "Ashok", "Varun",
]
FIRST_NAMES_FEMALE = [
    "Priya", "Ananya", "Meera", "Divya", "Kavya", "Sneha", "Pooja", "Aishwarya", "Lakshmi",
    "Neha", "Shreya", "Deepa", "Anjali", "Radha", "Nandini", "Ritu", "Swati", "Preeti",
    "Sunita", "Kavitha", "Rekha", "Sangeeta", "Ishita", "Tara", "Vidya",
]
LAST_NAMES = [
    "Kumar", "Nair", "Menon", "Sharma", "Reddy", "Iyer", "Patel", "Gupta", "Singh", "Rao",
    "Desai", "Pillai", "Chatterjee", "Verma", "Krishnan", "Joshi", "Malhotra", "Nayak",
    "Bose", "Shetty", "Agarwal", "Mehta", "Bhat", "Kulkarni", "Naidu",
]

# city -> (state, [branches])
CITIES = {
    "Mumbai": ("Maharashtra", ["Bandra Kurla Complex", "Andheri West", "Fort", "Powai"]),
    "Bengaluru": ("Karnataka", ["Koramangala", "Whitefield", "Indiranagar", "Jayanagar"]),
    "Chennai": ("Tamil Nadu", ["T. Nagar", "Anna Nagar", "Adyar"]),
    "Hyderabad": ("Telangana", ["Banjara Hills", "Gachibowli", "Kukatpally"]),
    "Delhi": ("Delhi", ["Connaught Place", "Dwarka", "Saket"]),
    "Pune": ("Maharashtra", ["Kothrud", "Hinjewadi", "Camp"]),
    "Kochi": ("Kerala", ["MG Road", "Kakkanad"]),
    "Ahmedabad": ("Gujarat", ["Navrangpura", "Satellite"]),
    "Kolkata": ("West Bengal", ["Park Street", "Salt Lake"]),
    "Jaipur": ("Rajasthan", ["C-Scheme", "Malviya Nagar"]),
}

OCCUPATIONS = ["Salaried", "Self-Employed", "Business", "Retired"]

EMPLOYERS_SALARIED = [
    "Infosys", "Tata Consultancy Services", "Wipro", "HCL Technologies", "Reliance Industries",
    "Larsen & Toubro", "Accenture India", "Cognizant", "Tech Mahindra", "ITC Limited",
    "Hindustan Unilever", "Bharti Airtel", "Bosch India", "Mahindra & Mahindra",
]
INDUSTRIES = ["Information Technology", "Manufacturing", "Banking & Finance", "Healthcare",
              "Retail", "Telecom", "Consulting", "Education", "Real Estate", "FMCG"]
BUSINESS_TYPES = ["Textile Trading", "Electronics Retail", "Restaurant Chain", "Pharmacy",
                  "Auto Dealership", "Construction", "Jewellery Business", "Export House"]

COMPETITOR_BANKS = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank"]

EDUCATION = ["Graduate", "Post Graduate", "Professional (CA/Engg/MBA)", "Doctorate", "Higher Secondary"]
MARITAL = ["Single", "Married", "Married"]  # weighted toward married
LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi"]

# transaction merchants by category
MERCHANTS = {
    "Shopping": ["Amazon", "Flipkart", "Myntra", "Reliance Trends", "Croma"],
    "Groceries": ["BigBasket", "DMart", "Reliance Fresh", "Blinkit", "Zepto"],
    "Dining": ["Zomato", "Swiggy", "Barbeque Nation", "Starbucks", "Cafe Coffee Day"],
    "Utilities": ["Tata Power", "Airtel Postpaid", "Jio Fiber", "BESCOM", "Mahanagar Gas"],
    "Travel": ["MakeMyTrip", "IRCTC", "IndiGo", "Ola", "Uber"],
    "Investment": ["Zerodha", "Groww", "EXL Mutual Fund", "SIP AutoDebit"],
    "Insurance": ["LIC Premium", "EXL Arogya", "Star Health"],
}

# ML model reason-code phrases per product category
REASON_CODES = {
    "Home Loan": ["High income stability", "Rising rent outflow detected", "Life-stage: family formation",
                   "Strong repayment capacity", "No existing home loan"],
    "Personal Loan": ["High discretionary spend", "Short-term credit need signal", "Clean repayment history",
                       "Festival-season propensity"],
    "Car Loan": ["Growing income trend", "Frequent ride-hailing spend", "Life-stage upgrade signal"],
    "Credit Card": ["High online spend", "No premium card held", "Strong bureau score",
                     "Frequent dining & travel spend"],
    "Fixed Deposit": ["Surplus idle balance", "Conservative risk profile", "Maturing deposit elsewhere"],
    "Savings": ["High average balance", "Eligible for premium relationship", "Multiple product holding"],
    "Insurance": ["Dependents present", "Protection gap detected", "Tax-saving window"],
    "Investment": ["Surplus investible balance", "Long-term wealth goal", "Tax-saving (ELSS) opportunity"],
}
