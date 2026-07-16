import os
from dotenv import load_dotenv

load_dotenv()

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq")

def get_llm_response(system_prompt: str, user_message: str, conversation_history: list = []) -> str:
    messages = []
    for msg in conversation_history[-6:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": user_message})

    if LLM_PROVIDER == "groq":
        return _groq_response(system_prompt, messages)
    elif LLM_PROVIDER == "openai":
        return _openai_response(system_prompt, messages)
    elif LLM_PROVIDER == "google":
        return _google_response(system_prompt, messages)
    else:
        return _groq_response(system_prompt, messages)

def _groq_response(system_prompt: str, messages: list) -> str:
    from groq import Groq
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "system", "content": system_prompt}] + messages,
        temperature=0.3,
        max_tokens=1024
    )
    return response.choices[0].message.content

def _openai_response(system_prompt: str, messages: list) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "system", "content": system_prompt}] + messages,
        temperature=0.3,
        max_tokens=1024
    )
    return response.choices[0].message.content

def _google_response(system_prompt: str, messages: list) -> str:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    model = genai.GenerativeModel("gemini-1.5-flash")
    full_prompt = f"{system_prompt}\n\nConversation:\n"
    for msg in messages:
        full_prompt += f"{msg['role'].upper()}: {msg['content']}\n"
    full_prompt += "ASSISTANT:"
    response = model.generate_content(full_prompt)
    return response.text
