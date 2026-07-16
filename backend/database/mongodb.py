from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/techmart_support"))
db = client["techmart_support"]

users_collection = db["users"]
conversations_collection = db["conversations"]
messages_collection = db["messages"]
analytics_collection = db["analytics"]

def save_message(session_id: str, user_id: str, role: str, content: str, agent_used: str = None):
    message = {
        "session_id": session_id,
        "user_id": user_id,
        "role": role,
        "content": content,
        "agent_used": agent_used,
        "timestamp": datetime.utcnow()
    }
    messages_collection.insert_one(message)
    return message

def get_conversation_history(session_id: str, limit: int = 10):
    messages = list(
        messages_collection.find(
            {"session_id": session_id},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit)
    )
    return list(reversed(messages))

def create_session(user_id: str, session_id: str):
    conversations_collection.insert_one({
        "session_id": session_id,
        "user_id": user_id,
        "created_at": datetime.utcnow(),
        "status": "active"
    })

def get_user_sessions(user_id: str):
    return list(conversations_collection.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1))

def log_analytics(event_type: str, data: dict):
    analytics_collection.insert_one({
        "event_type": event_type,
        "data": data,
        "timestamp": datetime.utcnow()
    })
