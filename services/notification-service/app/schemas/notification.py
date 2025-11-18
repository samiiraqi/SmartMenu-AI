from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class NotificationCreate(BaseModel):
    user_id: int
    notification_type: str = Field(..., description="email, sms, or push")
    recipient: str
    subject: Optional[str] = None
    message: str


class Notification(BaseModel):
    id: int
    user_id: int
    notification_type: str
    recipient: str
    subject: Optional[str]
    message: str
    status: str
    sent_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
