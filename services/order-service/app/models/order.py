from datetime import datetime
from enum import Enum

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.config.database import Base


class OrderStatus(str, Enum):
    """Order status enum"""

    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Order(Base):
    """
    Order Model
    Represents a customer order
    """

    __tablename__ = "orders"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Customer Info
    customer_id = Column(Integer, nullable=False)
    customer_name = Column(String(100), nullable=False)
    table_number = Column(Integer, nullable=True)

    # Order Details
    status = Column(String(20), default=OrderStatus.PENDING, nullable=False)
    total_amount = Column(Float, nullable=False)
    special_instructions = Column(String(500), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship with order items
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Order {self.id} - Customer: {self.customer_name} - Status: {self.status}>"


class OrderItem(Base):
    """
    Order Item Model
    Represents individual items in an order
    """

    __tablename__ = "order_items"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Key to Order
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)

    # Menu Item Reference (from Menu Service)
    menu_item_id = Column(Integer, nullable=False)
    menu_item_name = Column(String(100), nullable=False)
    menu_item_price = Column(Float, nullable=False)

    # Quantity
    quantity = Column(Integer, nullable=False, default=1)

    # Subtotal
    subtotal = Column(Float, nullable=False)

    # Special requests for this item
    notes = Column(String(200), nullable=True)

    # Relationship back to order
    order = relationship("Order", back_populates="items")

    def __repr__(self):
        return f"<OrderItem {self.menu_item_name} x{self.quantity}>"
