from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.schemas.notification import Notification, NotificationCreate
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.post("/", response_model=Notification, status_code=status.HTTP_201_CREATED)
def send_notification(notif: NotificationCreate, db: Session = Depends(get_db)):
    """Send a notification"""
    try:
        return NotificationService.send_notification(db, notif)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.get("/{notification_id}", response_model=Notification)
def get_notification(notification_id: int, db: Session = Depends(get_db)):
    """Get notification by ID"""
    notif = NotificationService.get_notification_by_id(db, notification_id)
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found"
        )
    return notif


@router.get("/user/{user_id}", response_model=List[Notification])
def get_user_notifications(user_id: int, db: Session = Depends(get_db)):
    """Get all notifications for a user"""
    return NotificationService.get_notifications_by_user(db, user_id)
