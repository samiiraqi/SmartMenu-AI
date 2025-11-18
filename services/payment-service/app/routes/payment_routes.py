from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.schemas.payment import Payment, PaymentCreate
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/", response_model=Payment, status_code=status.HTTP_201_CREATED)
def process_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    """Process a new payment"""
    try:
        return PaymentService.process_payment(db, payment)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Payment failed: {str(e)}"
        )


@router.get("/{payment_id}", response_model=Payment)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    """Get payment by ID"""
    payment = PaymentService.get_payment_by_id(db, payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found"
        )
    return payment


@router.get("/order/{order_id}", response_model=List[Payment])
def get_payments_by_order(order_id: int, db: Session = Depends(get_db)):
    """Get all payments for an order"""
    return PaymentService.get_payments_by_order(db, order_id)


@router.get("/user/{user_id}", response_model=List[Payment])
def get_payments_by_user(user_id: int, db: Session = Depends(get_db)):
    """Get all payments by user"""
    return PaymentService.get_payments_by_user(db, user_id)


@router.post("/{payment_id}/refund", response_model=Payment)
def refund_payment(payment_id: int, db: Session = Depends(get_db)):
    """Refund a payment"""
    payment = PaymentService.refund_payment(db, payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment cannot be refunded",
        )
    return payment
