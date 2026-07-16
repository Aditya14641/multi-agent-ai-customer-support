from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from api.auth import get_current_user
from agents.router import route_and_respond
from database.mongodb import save_message, get_conversation_history, create_session, get_user_sessions, log_analytics
import uuid

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: str = None

@router.post("/session")
async def create_new_session(current_user: dict = Depends(get_current_user)):
    session_id = str(uuid.uuid4())
    create_session(current_user["email"], session_id)
    return {"session_id": session_id}

@router.get("/sessions")
async def get_sessions(current_user: dict = Depends(get_current_user)):
    sessions = get_user_sessions(current_user["email"])
    return {"sessions": sessions}

@router.get("/history/{session_id}")
async def get_history(session_id: str, current_user: dict = Depends(get_current_user)):
    messages = get_conversation_history(session_id, limit=50)
    return {"messages": messages}

@router.post("/message")
async def send_message(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    session_id = request.session_id or str(uuid.uuid4())
    history = get_conversation_history(session_id, limit=10)
    history_formatted = [{"role": msg["role"], "content": msg["content"]} for msg in history]

    save_message(session_id, current_user["email"], "user", request.message)

    result = route_and_respond(request.message, history_formatted)

    save_message(
        session_id,
        current_user["email"],
        "assistant",
        result["response"],
        agent_used=", ".join(result["agents_used"])
    )

    log_analytics("chat_interaction", {
        "user_id": current_user["email"],
        "session_id": session_id,
        "intents": result["intents"],
        "agents_used": result["agents_used"],
        "response_time": result["response_time"]
    })

    return {
        "session_id": session_id,
        "response": result["response"],
        "agents_used": result["agents_used"],
        "intents": result["intents"],
        "response_time": result["response_time"]
    }
