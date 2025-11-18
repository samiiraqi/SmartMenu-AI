from typing import List, Optional

import httpx
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.models.order import Order, OrderItem, OrderStatus
from app.schemas.order import OrderCreate, OrderUpdate


class OrderService:
    """
    Order Service - Business logic for order operations
    """

    @staticmethod
    async def get_menu_item(menu_item_id: int) -> Optional[dict]:
        """
        Fetch menu item details from Menu Service
        This is microservice communication!
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.MENU_SERVICE_URL}/api/v1/menu/{menu_item_id}"
                )
                if response.status_code == 200:
                    return response.json()
                return None
        except Exception as e:
            print(f"Error fetching menu item: {e}")
            return None

    @staticmethod
    async def create_order(
        db: Session, order_data: OrderCreate, customer_id: int
    ) -> Order:
        """Create a new order with items"""
        # Calculate total and validate menu items
        total_amount = 0
        order_items = []

        for item_data in order_data.items:
            # Fetch menu item from Menu Service
            menu_item = await OrderService.get_menu_item(item_data.menu_item_id)
            if not menu_item:
                raise ValueError(f"Menu item {item_data.menu_item_id} not found")

            if not menu_item.get("is_available"):
                raise ValueError(f"Menu item {menu_item['name']} is not available")

            # Calculate subtotal
            subtotal = menu_item["price"] * item_data.quantity
            total_amount += subtotal

            # Create order item
            order_item = OrderItem(
                menu_item_id=item_data.menu_item_id,
                menu_item_name=menu_item["name"],
                menu_item_price=menu_item["price"],
                quantity=item_data.quantity,
                subtotal=subtotal,
                notes=item_data.notes,
            )
            order_items.append(order_item)

        # Create order
        db_order = Order(
            customer_id=customer_id,
            customer_name=order_data.customer_name,
            table_number=order_data.table_number,
            status=OrderStatus.PENDING,
            total_amount=total_amount,
            special_instructions=order_data.special_instructions,
            items=order_items,
        )

        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        return db_order

    @staticmethod
    def get_all_orders(db: Session, skip: int = 0, limit: int = 100) -> List[Order]:
        """Get all orders with pagination"""
        return db.query(Order).offset(skip).limit(limit).all()

    @staticmethod
    def get_order_by_id(db: Session, order_id: int) -> Optional[Order]:
        """Get a specific order by ID"""
        return db.query(Order).filter(Order.id == order_id).first()

    @staticmethod
    def get_orders_by_customer(db: Session, customer_id: int) -> List[Order]:
        """Get all orders for a specific customer"""
        return db.query(Order).filter(Order.customer_id == customer_id).all()

    @staticmethod
    def get_orders_by_status(db: Session, status: str) -> List[Order]:
        """Get orders by status"""
        return db.query(Order).filter(Order.status == status).all()

    @staticmethod
    def update_order_status(
        db: Session, order_id: int, status_data: OrderUpdate
    ) -> Optional[Order]:
        """Update order status"""
        db_order = db.query(Order).filter(Order.id == order_id).first()
        if not db_order:
            return None

        db_order.status = status_data.status
        db.commit()
        db.refresh(db_order)
        return db_order

    @staticmethod
    def cancel_order(db: Session, order_id: int) -> bool:
        """Cancel an order"""
        db_order = db.query(Order).filter(Order.id == order_id).first()
        if not db_order:
            return False

        if db_order.status in [OrderStatus.DELIVERED, OrderStatus.CANCELLED]:
            return False  # Cannot cancel delivered or already cancelled orders

        db_order.status = OrderStatus.CANCELLED
        db.commit()
        return True
