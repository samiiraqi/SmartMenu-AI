# from typing import List, Optional  # Removed unused imports
from sqlalchemy.orm import Session

# from datetime import datetime  # Removed unused import
import httpx
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate
from app.config.settings import settings

# from app.websocket.socket_manager import broadcast_order_status  # TODO: Add websocket module


class OrderService:
    @staticmethod
    async def validate_menu_items(items: list) -> dict:
        """Validate menu items with Menu Service"""
        menu_items = {}
        async with httpx.AsyncClient() as client:
            for item in items:
                try:
                    response = await client.get(
                        f"{settings.MENU_SERVICE_URL}/api/v1/menu/{item.menu_item_id}"
                    )
                    if response.status_code == 200:
                        menu_items[item.menu_item_id] = response.json()
                    else:
                        raise ValueError(
                            f"Menu item {item.menu_item_id} not found or unavailable"
                        )
                except Exception as e:
                    raise ValueError(f"Error validating menu item: {str(e)}")
        return menu_items

    @staticmethod
    async def create_order(db: Session, order_data: OrderCreate, customer_id: int = 1):
        """Create a new order"""
        # Validate menu items
        menu_items = await OrderService.validate_menu_items(order_data.items)

        # Calculate total
        total_amount = sum(
            menu_items[item.menu_item_id]["price"] * item.quantity
            for item in order_data.items
        )

        # Create order
        order = Order(
            customer_id=customer_id,
            table_number=order_data.table_number,
            customer_name=order_data.customer_name,
            total_amount=total_amount,
            status="pending",
        )
        db.add(order)
        db.flush()

        # Create order items
        for item_data in order_data.items:
            menu_item = menu_items[item_data.menu_item_id]
            order_item = OrderItem(
                order_id=order.id,
                menu_item_id=item_data.menu_item_id,
                quantity=item_data.quantity,
                price=menu_item["price"],
                item_name=menu_item["name"],
                special_instructions=item_data.special_instructions,
            )
            db.add(order_item)

        db.commit()
        db.refresh(order)

        # Broadcast order status
        # broadcast_order_status(order.id, order.table_number, order.status)

        return order

    @staticmethod
    def get_orders(db: Session, skip: int = 0, limit: int = 100):
        """Get all orders"""
        return db.query(Order).offset(skip).limit(limit).all()

    @staticmethod
    def get_order(db: Session, order_id: int):
        """Get order by ID"""
        return db.query(Order).filter(Order.id == order_id).first()

    @staticmethod
    def update_order_status(db: Session, order_id: int, status: str):
        """Update order status"""
        order = db.query(Order).filter(Order.id == order_id).first()
        if order:
            order.status = status
            db.commit()
            db.refresh(order)
            # broadcast_order_status(order.id, order.table_number, order.status)
        return order

    @staticmethod
    def delete_order(db: Session, order_id: int):
        """Delete order"""
        order = db.query(Order).filter(Order.id == order_id).first()
        if order:
            db.delete(order)
            db.commit()
        return order
