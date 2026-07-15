"""Loads prompt templates from backend/prompts/*.txt and fills {{placeholders}}."""
import os

PROMPTS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "prompts"
)
_cache = {}


def load_prompt(name: str) -> str:
    if name not in _cache:
        path = os.path.join(PROMPTS_DIR, f"{name}.txt")
        with open(path, "r", encoding="utf-8") as f:
            _cache[name] = f.read()
    return _cache[name]


def render(name: str, **kwargs) -> str:
    """Load a prompt and replace {{key}} tokens with str(value)."""
    text = load_prompt(name)
    for key, value in kwargs.items():
        text = text.replace("{{" + key + "}}", str(value))
    return text
