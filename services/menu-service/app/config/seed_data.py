from sqlalchemy.orm import Session

from app.config.database import SessionLocal
from app.models.menu import MenuItem


def seed_menu_data():
    """
    Seed the database with sample menu items
    """
    db: Session = SessionLocal()

    # Check if data already exists
    existing_items = db.query(MenuItem).count()
    if existing_items > 0:
        print(f"Database already has {existing_items} menu items. Skipping seed.")
        db.close()
        return

    print("Seeding menu data...")

    # Sample menu items
    menu_items = [
        # Pizzas
        MenuItem(
            name="Margherita Pizza",
            description="Classic Italian pizza with tomato, mozzarella, and fresh basil",
            price=12.99,
            category="Pizza",
            is_available=True,
            prep_time=15,
        ),
        MenuItem(
            name="Pepperoni Pizza",
            description="Delicious pepperoni pizza with extra cheese",
            price=14.99,
            category="Pizza",
            is_available=True,
            prep_time=15,
        ),
        MenuItem(
            name="Vegetarian Pizza",
            description="Fresh vegetables, mushrooms, peppers, and olives",
            price=13.99,
            category="Pizza",
            is_available=True,
            prep_time=18,
        ),
        MenuItem(
            name="Hawaiian Pizza",
            description="Ham, pineapple, and mozzarella cheese",
            price=13.99,
            category="Pizza",
            is_available=True,
            prep_time=15,
        ),
        # Pasta
        MenuItem(
            name="Spaghetti Carbonara",
            description="Creamy pasta with bacon, eggs, and parmesan",
            price=11.99,
            category="Pasta",
            is_available=True,
            prep_time=20,
        ),
        MenuItem(
            name="Penne Arrabbiata",
            description="Spicy tomato sauce with garlic and chili",
            price=10.99,
            category="Pasta",
            is_available=True,
            prep_time=18,
        ),
        MenuItem(
            name="Fettuccine Alfredo",
            description="Rich and creamy white sauce pasta",
            price=12.99,
            category="Pasta",
            is_available=True,
            prep_time=20,
        ),
        # Burgers
        MenuItem(
            name="Classic Cheeseburger",
            description="Beef patty with cheese, lettuce, tomato, and special sauce",
            price=9.99,
            category="Burgers",
            is_available=True,
            prep_time=12,
        ),
        MenuItem(
            name="Bacon Burger",
            description="Beef patty with crispy bacon and cheddar cheese",
            price=11.99,
            category="Burgers",
            is_available=True,
            prep_time=15,
        ),
        MenuItem(
            name="Veggie Burger",
            description="Plant-based patty with fresh vegetables",
            price=10.99,
            category="Burgers",
            is_available=True,
            prep_time=12,
        ),
        # Salads
        MenuItem(
            name="Caesar Salad",
            description="Romaine lettuce with parmesan, croutons, and Caesar dressing",
            price=8.99,
            category="Salads",
            is_available=True,
            prep_time=8,
        ),
        MenuItem(
            name="Greek Salad",
            description="Fresh vegetables, feta cheese, and olives",
            price=9.99,
            category="Salads",
            is_available=True,
            prep_time=8,
        ),
        # Desserts
        MenuItem(
            name="Tiramisu",
            description="Classic Italian dessert with coffee and mascarpone",
            price=6.99,
            category="Desserts",
            is_available=True,
            prep_time=5,
        ),
        MenuItem(
            name="Chocolate Cake",
            description="Rich chocolate cake with chocolate frosting",
            price=5.99,
            category="Desserts",
            is_available=True,
            prep_time=5,
        ),
        MenuItem(
            name="Ice Cream Sundae",
            description="Vanilla ice cream with chocolate sauce and toppings",
            price=4.99,
            category="Desserts",
            is_available=True,
            prep_time=3,
        ),
        # Drinks
        MenuItem(
            name="Coca Cola",
            description="Classic Coca Cola",
            price=2.99,
            category="Drinks",
            is_available=True,
            prep_time=1,
        ),
        MenuItem(
            name="Fresh Orange Juice",
            description="Freshly squeezed orange juice",
            price=4.99,
            category="Drinks",
            is_available=True,
            prep_time=3,
        ),
        MenuItem(
            name="Iced Coffee",
            description="Cold brew coffee with ice",
            price=3.99,
            category="Drinks",
            is_available=True,
            prep_time=2,
        ),
    ]

    # Add all items to database
    for item in menu_items:
        db.add(item)

    db.commit()
    print(f"✅ Successfully seeded {len(menu_items)} menu items!")
    db.close()


if __name__ == "__main__":
    seed_menu_data()
