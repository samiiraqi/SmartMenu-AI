from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# Order Item Schemas
class OrderItemBase(BaseModel):
    """Base schema for order items"""

    menu_item_id: int = Field(..., description="Menu item ID from Menu Service")
    quantity: int = Field(..., gt=0, description="Quantity (must be positive)")
    notes: Optional[str] = Field(None, max_length=200, description="Special requests")


class OrderItemCreate(OrderItemBase):
    """Schema for creating order item"""

    pass


class OrderItem(OrderItemBase):
    """Schema for order item response"""

    id: int
    order_id: int
    menu_item_name: str
    menu_item_price: float
    subtotal: float

    class Config:
        from_attributes = True


# Order Schemas
class OrderBase(BaseModel):
    """Base schema for orders"""

    customer_name: str = Field(..., min_length=1, max_length=100)
    table_number: Optional[int] = Field(None, ge=1, description="Table number")
    special_instructions: Optional[str] = Field(None, max_length=500)


class OrderCreate(OrderBase):
    """Schema for creating a new order"""

    items: List[OrderItemCreate] = Field(..., min_items=1, description="Order items")


class OrderUpdate(BaseModel):
    """Schema for updating order status"""

    status: str = Field(..., description="New order status")


class Order(OrderBase):
    """Schema for order response"""

    id: int
    customer_id: int
    status: str
    total_amount: float
    created_at: datetime
    updated_at: datetime
    items: List[OrderItem]

    class Config:
        from_attributes = True


class OrderSummary(BaseModel):
    """Simplified order schema for listing"""

    id: int
    customer_name: str
    table_number: Optional[int]
    status: str
    total_amount: float
    item_count: int
    created_at: datetime

    class Config:
        from_attributes = True
