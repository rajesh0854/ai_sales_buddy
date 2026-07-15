"""Sales agents & admin for EXL Bank Limited (simple prototype auth, plain passwords)."""

USERS = [
    {
        "user_id": "USR001", "username": "rajesh.kumar", "password": "demo123",
        "full_name": "Rajesh Kumar", "role": "agent", "email": "rajesh.kumar@exlbank.in",
        "mobile": "+91 98200 11001", "branch": "Mumbai - Bandra Kurla Complex",
        "designation": "Senior Sales Officer", "avatar_seed": "Rajesh",
    },
    {
        "user_id": "USR002", "username": "priya.nair", "password": "demo123",
        "full_name": "Priya Nair", "role": "agent", "email": "priya.nair@exlbank.in",
        "mobile": "+91 98200 11002", "branch": "Bengaluru - Koramangala",
        "designation": "Sales Officer", "avatar_seed": "Priya",
    },
    {
        "user_id": "USR003", "username": "arjun.menon", "password": "demo123",
        "full_name": "Arjun Menon", "role": "agent", "email": "arjun.menon@exlbank.in",
        "mobile": "+91 98200 11003", "branch": "Chennai - T. Nagar",
        "designation": "Relationship Manager", "avatar_seed": "Arjun",
    },
    {
        "user_id": "USR004", "username": "admin", "password": "admin123",
        "full_name": "Meera Krishnan", "role": "admin", "email": "meera.krishnan@exlbank.in",
        "mobile": "+91 98200 11000", "branch": "Head Office - Mumbai",
        "designation": "Sales Enablement Lead", "avatar_seed": "Meera",
    },
]
