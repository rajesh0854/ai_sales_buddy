"""
Thin wrapper around Google Gemini (google-genai SDK).
Model: gemini-flash-lite-latest (configurable via .env).

If no API key is configured, `enabled` is False and callers should fall back
to deterministic stubs so the app remains demoable without a key.
"""
import json
import re
from ..config import settings

try:
    from google import genai
    from google.genai import types
    _SDK_AVAILABLE = True
except Exception:  # SDK not installed
    _SDK_AVAILABLE = False


class GeminiClient:
    def __init__(self):
        self.model = settings.GEMINI_MODEL
        self._client = None
        if _SDK_AVAILABLE and settings.gemini_enabled:
            try:
                self._client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception:
                self._client = None

    @property
    def enabled(self) -> bool:
        return self._client is not None

    def generate(self, prompt: str, system: str = None, temperature: float = 0.7,
                 json_mode: bool = False) -> str:
        """Return raw text (or JSON string) from Gemini. Raises RuntimeError if disabled."""
        if not self.enabled:
            raise RuntimeError("Gemini is not configured (missing GEMINI_API_KEY).")
        config_kwargs = {"temperature": temperature}
        if system:
            config_kwargs["system_instruction"] = system
        if json_mode:
            config_kwargs["response_mime_type"] = "application/json"
        config = types.GenerateContentConfig(**config_kwargs)
        resp = self._client.models.generate_content(
            model=self.model, contents=prompt, config=config,
        )
        return (resp.text or "").strip()

    def generate_json(self, prompt: str, system: str = None, temperature: float = 0.6) -> dict:
        """Generate and parse a JSON object. Tolerates code-fenced output."""
        raw = self.generate(prompt, system=system, temperature=temperature, json_mode=True)
        return _parse_json(raw)


def _parse_json(raw: str):
    raw = raw.strip()
    # strip ```json ... ``` fences if present
    fence = re.match(r"^```(?:json)?\s*(.*?)\s*```$", raw, re.DOTALL)
    if fence:
        raw = fence.group(1).strip()
    try:
        return json.loads(raw)
    except (ValueError, TypeError):
        # attempt to locate the first {...} or [...] block
        m = re.search(r"(\{.*\}|\[.*\])", raw, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(1))
            except (ValueError, TypeError):
                pass
    raise ValueError(f"Could not parse JSON from model output: {raw[:200]}")


# module-level singleton
gemini = GeminiClient()
