from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.schemas.chatbot import ChatRequest, ChatResponse
from app.services.chatbot_service import ChatbotService

# Create router
router = APIRouter(prefix="/chat", tags=["Chatbot"])


@router.post("/", response_model=ChatResponse)
async def chat(chat_request: ChatRequest, db: Session = Depends(get_db)):
    """
    Chat with AI assistant
    - Handles natural language
    - Provides menu information
    - Helps with ordering
    """
    try:
        return await ChatbotService.chat(db, chat_request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat: {str(e)}",
        )


@router.get("/history/{session_id}")
async def get_conversation_history(session_id: str, db: Session = Depends(get_db)):
    """
    Get conversation history for a session
    """
    history = ChatbotService.get_conversation_history(db, session_id)
    if not history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation {session_id} not found",
        )
    return history


@router.delete("/history/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def clear_conversation(session_id: str, db: Session = Depends(get_db)):
    """
    Clear/end a conversation
    """
    conversation = (
        db.query(ChatbotService.__annotations__["Conversation"])
        .filter_by(session_id=session_id)
        .first()
    )
    if conversation:
        conversation.is_active = "completed"
        db.commit()
    return None
