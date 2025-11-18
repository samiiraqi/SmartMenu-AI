from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.schemas.order import Order, OrderCreate, OrderUpdate
from app.services.order_service import OrderService

# Create router
router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    order: OrderCreate, customer_id: int = 1, db: Session = Depends(get_db)
):
    """
    Create a new order
    - Validates menu items from Menu Service
    - Calculates total amount
    - Creates order with items
    """
    try:
        return await OrderService.create_order(db, order, customer_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", response_model=List[Order])
def get_all_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all orders with pagination"""
    return OrderService.get_all_orders(db, skip=skip, limit=limit)


@router.get("/{order_id}", response_model=Order)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get a specific order by ID"""
    order = OrderService.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found",
        )
    return order


@router.get("/customer/{customer_id}", response_model=List[Order])
def get_customer_orders(customer_id: int, db: Session = Depends(get_db)):
    """Get all orders for a specific customer"""
    return OrderService.get_orders_by_customer(db, customer_id)


@router.get("/status/{status}", response_model=List[Order])
def get_orders_by_status(status: str, db: Session = Depends(get_db)):
    """Get orders by status (pending, confirmed, preparing, ready, delivered, cancelled)"""
    return OrderService.get_orders_by_status(db, status)


@router.put("/{order_id}", response_model=Order)
def update_order_status(
    order_id: int, status_data: OrderUpdate, db: Session = Depends(get_db)
):
    """Update order status"""
    updated_order = OrderService.update_order_status(db, order_id, status_data)
    if not updated_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found",
        )
    return updated_order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    """Cancel an order"""
    success = OrderService.cancel_order(db, order_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order cannot be cancelled (already delivered or cancelled)",
        )
    return None
