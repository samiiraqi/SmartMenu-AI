from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.menu import MenuItem
from app.schemas.menu import MenuItemCreate, MenuItemUpdate


class MenuService:
    """
    Menu Service - Business logic for menu operations
    """

    @staticmethod
    def get_all_items(db: Session, skip: int = 0, limit: int = 100) -> List[MenuItem]:
        """Get all menu items with pagination"""
        return db.query(MenuItem).offset(skip).limit(limit).all()

    @staticmethod
    def get_item_by_id(db: Session, item_id: int) -> Optional[MenuItem]:
        """Get a specific menu item by ID"""
        return db.query(MenuItem).filter(MenuItem.id == item_id).first()

    @staticmethod
    def get_items_by_category(db: Session, category: str) -> List[MenuItem]:
        """Get menu items by category"""
        return db.query(MenuItem).filter(MenuItem.category == category).all()

    @staticmethod
    def get_available_items(db: Session) -> List[MenuItem]:
        """Get only available menu items"""
        return db.query(MenuItem).filter(MenuItem.is_available_(True)).all()

    @staticmethod
    def create_item(db: Session, item: MenuItemCreate) -> MenuItem:
        """Create a new menu item"""
        db_item = MenuItem(**item.model_dump())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def update_item(
        db: Session, item_id: int, item: MenuItemUpdate
    ) -> Optional[MenuItem]:
        """Update an existing menu item"""
        db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
        if not db_item:
            return None

        # Update only provided fields
        update_data = item.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_item, key, value)

        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def delete_item(db: Session, item_id: int) -> bool:
        """Delete a menu item"""
        db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
        if not db_item:
            return False

        db.delete(db_item)
        db.commit()
        return True
