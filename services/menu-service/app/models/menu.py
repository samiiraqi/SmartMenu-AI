from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text

from app.config.database import Base


class MenuItem(Base):
    """
    Menu Item Model
    Represents a dish/product in the restaurant menu
    """

    __tablename__ = "menu_items"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Basic Info
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)

    # Category
    category = Column(String(50), nullable=False)  # e.g., "Pizza", "Drinks", "Dessert"

    # Availability
    is_available = Column(Boolean, default=True)

    # Image
    image_url = Column(String(255), nullable=True)

    # Preparation time (in minutes)
    prep_time = Column(Integer, default=15)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<MenuItem {self.name} - ${self.price}>"
