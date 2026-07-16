from agents.intent_detector import detect_intent
from agents.billing import billing_agent
from agents.technical import technical_agent
from agents.product import product_agent
from agents.complaint import complaint_agent
from agents.faq import faq_agent
from models.llm import get_llm_response
import time

def route_and_respond(query: str, conversation_history: list = []) -> dict:
    start_time = time.time()

    intent_result = detect_intent(query)
    intents = intent_result.get("intents", ["faq"])

    agent_map = {
        "billing": billing_agent,
        "technical": technical_agent,
        "product": product_agent,
        "complaint": complaint_agent,
        "refund": billing_agent,
        "faq": faq_agent
    }

    responses = []
    agents_used = []

    if len(intents) == 1:
        intent = intents[0]
        agent_fn = agent_map.get(intent, faq_agent)
        response = agent_fn(query, conversation_history)
        agents_used.append(intent)
        final_response = response
    else:
        for intent in intents[:2]:
            agent_fn = agent_map.get(intent, faq_agent)
            resp = agent_fn(query, conversation_history)
            responses.append(resp)
            agents_used.append(intent)
        final_response = aggregate_responses(query, responses, agents_used)

    response_time = round(time.time() - start_time, 2)

    return {
        "response": final_response,
        "intents": intents,
        "agents_used": agents_used,
        "confidence": intent_result.get("confidence", 0.8),
        "response_time": response_time
    }

def aggregate_responses(query: str, responses: list, agents: list) -> str:
    if not responses:
        return "I'm sorry, I couldn't find information to help with your query."
    if len(responses) == 1:
        return responses[0]

    combined = "\n\n".join([
        f"[{agent.upper()} AGENT]: {resp}"
        for agent, resp in zip(agents, responses)
    ])

    aggregation_prompt = """You are a response aggregator for TechMart Electronics customer support.
Two specialized agents have provided responses to a customer query.
Combine them into ONE coherent, helpful response without repeating information.
Be concise, professional, and address all aspects of the customer query.
Do not mention agents or internal system details to the customer."""

    user_msg = f"Customer query: {query}\n\nAgent responses to combine:\n{combined}"
    return get_llm_response(aggregation_prompt, user_msg)
