from fastapi import APIRouter, Depends
from api.auth import get_current_user
from database.mongodb import analytics_collection, messages_collection, conversations_collection
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    total_conversations = conversations_collection.count_documents({})
    total_messages = messages_collection.count_documents({"role": "user"})

    pipeline = [
        {"$match": {"agent_used": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": "$agent_used", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    agent_usage = list(messages_collection.aggregate(pipeline))

    avg_response = list(analytics_collection.aggregate([
        {"$match": {"event_type": "chat_interaction"}},
        {"$group": {"_id": None, "avg_time": {"$avg": "$data.response_time"}}}
    ]))
    avg_time = round(avg_response[0]["avg_time"], 2) if avg_response else 0

    week_ago = datetime.utcnow() - timedelta(days=7)
    recent = conversations_collection.count_documents({"created_at": {"$gte": week_ago}})

    return {
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "agent_usage": agent_usage,
        "avg_response_time": avg_time,
        "conversations_last_7_days": recent
    }
