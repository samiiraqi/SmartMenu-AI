from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.schemas.menu import MenuItem, MenuItemCreate, MenuItemUpdate
from app.services.menu_service import MenuService

# Create router
router = APIRouter(prefix="/menu", tags=["Menu"])


@router.get("/", response_model=List[MenuItem])
async def get_all_menu_items(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """
    Get all menu items
    - **skip**: Number of items to skip (pagination)
    - **limit**: Maximum number of items to return
    """
    items = MenuService.get_all_items(db, skip=skip, limit=limit)
    return items


@router.get("/available", response_model=List[MenuItem])
async def get_available_menu_items(db: Session = Depends(get_db)):
    """Get only available menu items"""
    items = MenuService.get_available_items(db)
    return items


@router.get("/category/{category}", response_model=List[MenuItem])
async def get_menu_items_by_category(category: str, db: Session = Depends(get_db)):
    """Get menu items by category (e.g., Pizza, Drinks, Dessert)"""
    items = MenuService.get_items_by_category(db, category)
    return items


@router.get("/{item_id}", response_model=MenuItem)
async def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    """Get a specific menu item by ID"""
    item = MenuService.get_item_by_id(db, item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {item_id} not found",
        )
    return item


@router.post("/", response_model=MenuItem, status_code=status.HTTP_201_CREATED)
async def create_menu_item(item: MenuItemCreate, db: Session = Depends(get_db)):
    """Create a new menu item"""
    return MenuService.create_item(db, item)


@router.put("/{item_id}", response_model=MenuItem)
async def update_menu_item(
    item_id: int, item: MenuItemUpdate, db: Session = Depends(get_db)
):
    """Update an existing menu item"""
    updated_item = MenuService.update_item(db, item_id, item)
    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {item_id} not found",
        )
    return updated_item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    """Delete a menu item"""
    success = MenuService.delete_item(db, item_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {item_id} not found",
        )
    return None
