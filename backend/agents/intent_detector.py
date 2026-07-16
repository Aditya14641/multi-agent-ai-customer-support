from models.llm import get_llm_response
import json

INTENT_SYSTEM_PROMPT = """You are an intent detection system for TechMart Electronics customer support.

Classify the customer query into ONE OR MORE of these intents:
- billing: payment issues, invoices, subscriptions, charges
- technical: login problems, bugs, installation, errors, device not working
- product: product features, comparisons, availability, specifications
- complaint: complaints, dissatisfaction, bad experience, escalation requests
- refund: return requests, refund status, exchange
- faq: general questions, policies, contact info, shipping info

Respond ONLY with a JSON object in this exact format:
{
  "intents": ["intent1"],
  "confidence": 0.95,
  "reasoning": "brief explanation"
}

Examples:
- "My payment failed but money was deducted" -> {"intents": ["billing"], "confidence": 0.95, "reasoning": "Payment issue"}
- "I paid but my premium is locked" -> {"intents": ["billing", "technical"], "confidence": 0.90, "reasoning": "Payment and access issue"}
- "I want to return my laptop" -> {"intents": ["refund"], "confidence": 0.98, "reasoning": "Return request"}
"""

def detect_intent(query: str) -> dict:
    response = get_llm_response(INTENT_SYSTEM_PROMPT, query)
    try:
        clean = response.strip()
        if "```" in clean:
            clean = clean.split("```")[1]
            if clean.startswith("json"):
                clean = clean[4:]
        result = json.loads(clean)
        return result
    except Exception:
        return {"intents": ["faq"], "confidence": 0.5, "reasoning": "Could not parse intent"}
