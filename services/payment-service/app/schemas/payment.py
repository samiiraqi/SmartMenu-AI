from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PaymentCreate(BaseModel):
    order_id: int
    user_id: int
    amount: float = Field(..., gt=0)
    payment_method: str


class Payment(BaseModel):
    id: int
    order_id: int
    user_id: int
    amount: float
    currency: str
    payment_method: str
    status: str
    transaction_id: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True
