from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationStatus
from app.schemas.notification import NotificationCreate


class NotificationService:
    @staticmethod
    def send_notification(db: Session, notif_data: NotificationCreate) -> Notification:
        """Send a notification (simulated)"""
        notification = Notification(
            user_id=notif_data.user_id,
            notification_type=notif_data.notification_type,
            recipient=notif_data.recipient,
            subject=notif_data.subject,
            message=notif_data.message,
            status=NotificationStatus.PENDING,
        )

        db.add(notification)
        db.commit()

        # Simulate sending
        print(f"📧 Sending {notif_data.notification_type} to {notif_data.recipient}")
        print(f"Subject: {notif_data.subject}")
        print(f"Message: {notif_data.message}")

        notification.status = NotificationStatus.SENT
        notification.sent_at = datetime.utcnow()
        db.commit()
        db.refresh(notification)

        return notification

    @staticmethod
    def get_notification_by_id(db: Session, notif_id: int) -> Optional[Notification]:
        return db.query(Notification).filter(Notification.id == notif_id).first()

    @staticmethod
    def get_notifications_by_user(db: Session, user_id: int) -> List[Notification]:
        return db.query(Notification).filter(Notification.user_id == user_id).all()
