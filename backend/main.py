from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.auth import router as auth_router
from api.chat import router as chat_router
from api.analytics import router as analytics_router
from rag.pipeline import initialize_rag
import uvicorn

app = FastAPI(title="TechMart AI Support API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])

@app.on_event("startup")
async def startup_event():
    print("Initializing RAG pipeline...")
    initialize_rag()
    print("RAG pipeline ready!")

@app.get("/")
async def root():
    return {"message": "TechMart AI Support API is running!"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)