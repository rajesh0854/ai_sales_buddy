"""Customizable pitch-script templates used to steer LLM pitch generation."""

TEMPLATES = [
    {
        "template_id": "TPL001",
        "name": "Consultative Telecalling (Default)",
        "description": "Warm, consultative telecalling flow that leads with the customer's needs before the product.",
        "channel": "Telecalling",
        "tone": "Warm & Consultative",
        "structure": ["Opening & Rapport", "Permission to Continue", "Need Discovery",
                       "Personalized Pitch", "Value & Benefits", "Objection Pre-emption", "Call to Action & Close"],
        "rules": [
            "Always greet by name and identify yourself as calling from EXL Bank Limited.",
            "Ask permission before launching into the pitch.",
            "Reference the customer's actual profile/behaviour, never generic claims.",
            "Never over-promise returns or hide charges.",
            "Keep each spoken segment under 3 sentences for a natural phone rhythm.",
        ],
        "techniques": [
            "Use the customer's name at least twice.",
            "Anchor benefits to the customer's life stage and goals.",
            "Use social proof lightly ('many customers in your segment...').",
            "Close with a low-friction next step (e.g., 'shall I email you the details?').",
        ],
        "is_default": 1, "created_by": "USR004",
    },
    {
        "template_id": "TPL002",
        "name": "Face-to-Face Branch Pitch",
        "description": "In-person branch conversation with room for documents and demonstrations.",
        "channel": "Face-to-Face",
        "tone": "Confident & Advisory",
        "structure": ["Welcome", "Understand Requirement", "Present Recommendation",
                       "Walk Through Benefits", "Handle Questions", "Documentation & Next Steps"],
        "rules": [
            "Maintain an advisory, unhurried tone.",
            "Offer to show comparison sheets or brochures.",
            "Be transparent about eligibility and documentation upfront.",
        ],
        "techniques": [
            "Use visual aids and written figures.",
            "Summarize benefits in a short recap before closing.",
            "Offer on-the-spot eligibility check.",
        ],
        "is_default": 0, "created_by": "USR004",
    },
    {
        "template_id": "TPL003",
        "name": "Quick & Direct (Busy Customer)",
        "description": "Crisp, benefit-first pitch for time-pressed customers.",
        "channel": "Both",
        "tone": "Confident & Direct",
        "structure": ["One-line Hook", "Top 3 Benefits", "Single Objection Handle", "Immediate CTA"],
        "rules": [
            "Get to the point within the first two sentences.",
            "Lead with the single most relevant benefit.",
            "Respect the customer's time; offer to follow up.",
        ],
        "techniques": [
            "Lead with a number or savings figure.",
            "Offer a one-tap next step (WhatsApp / email).",
        ],
        "is_default": 0, "created_by": "USR001",
    },
]
