from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class Message(BaseModel):
    """Single message in conversation"""

    role: str = Field(..., description="Role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    """Request for chat interaction"""

    message: str = Field(..., min_length=1, max_length=1000)
    session_id: Optional[str] = Field(None, description="Session ID for context")
    customer_id: Optional[int] = Field(None, description="Customer ID")
    customer_name: Optional[str] = Field(None, max_length=100)


class ChatResponse(BaseModel):
    """Response from chatbot"""

    message: str = Field(..., description="Bot response")
    session_id: str = Field(..., description="Session ID")
    suggested_actions: Optional[List[str]] = Field(
        None, description="Suggested user actions"
    )
    context: Optional[dict] = Field(None, description="Current context")


class ConversationHistory(BaseModel):
    """Conversation history"""

    session_id: str
    customer_name: Optional[str]
    messages: List[Message]
    created_at: datetime
    last_activity: datetime
    is_active: str

    class Config:
        from_attributes = True
