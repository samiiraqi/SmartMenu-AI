import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.payment import Payment, PaymentStatus
from app.schemas.payment import PaymentCreate


class PaymentService:
    @staticmethod
    def process_payment(db: Session, payment_data: PaymentCreate) -> Payment:
        """Process a payment (simulated)"""
        # Generate transaction ID
        transaction_id = f"TXN_{uuid.uuid4().hex[:12].upper()}"

        # Create payment record
        payment = Payment(
            order_id=payment_data.order_id,
            user_id=payment_data.user_id,
            amount=payment_data.amount,
            payment_method=payment_data.payment_method,
            status=PaymentStatus.PROCESSING,
            transaction_id=transaction_id,
            payment_provider="stripe_simulation",
        )

        db.add(payment)
        db.commit()

        # Simulate successful payment
        payment.status = PaymentStatus.COMPLETED
        payment.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(payment)

        return payment

    @staticmethod
    def get_payment_by_id(db: Session, payment_id: int) -> Optional[Payment]:
        return db.query(Payment).filter(Payment.id == payment_id).first()

    @staticmethod
    def get_payments_by_order(db: Session, order_id: int) -> List[Payment]:
        return db.query(Payment).filter(Payment.order_id == order_id).all()

    @staticmethod
    def get_payments_by_user(db: Session, user_id: int) -> List[Payment]:
        return db.query(Payment).filter(Payment.user_id == user_id).all()

    @staticmethod
    def refund_payment(db: Session, payment_id: int) -> Optional[Payment]:
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment or payment.status != PaymentStatus.COMPLETED:
            return None

        payment.status = PaymentStatus.REFUNDED
        db.commit()
        db.refresh(payment)
        return payment
