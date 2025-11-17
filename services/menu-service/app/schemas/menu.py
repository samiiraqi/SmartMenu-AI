from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# Base schema with common fields
class MenuItemBase(BaseModel):
    """Base schema for menu items"""

    name: str = Field(..., min_length=1, max_length=100, description="Item name")
    description: Optional[str] = Field(None, description="Item description")
    price: float = Field(..., gt=0, description="Item price (must be positive)")
    category: str = Field(..., min_length=1, max_length=50, description="Category")
    is_available: bool = Field(True, description="Availability status")
    image_url: Optional[str] = Field(None, max_length=255, description="Image URL")
    prep_time: int = Field(15, gt=0, description="Preparation time in minutes")


# Schema for creating new menu item
class MenuItemCreate(MenuItemBase):
    """Schema for creating a new menu item"""

    pass


# Schema for updating menu item
class MenuItemUpdate(BaseModel):
    """Schema for updating a menu item (all fields optional)"""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    is_available: Optional[bool] = None
    image_url: Optional[str] = Field(None, max_length=255)
    prep_time: Optional[int] = Field(None, gt=0)


# Schema for returning menu item (includes database fields)
class MenuItem(MenuItemBase):
    """Schema for menu item response"""

    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Allows reading from SQLAlchemy models
