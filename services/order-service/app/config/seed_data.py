from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.config.database import SessionLocal
from app.models.order import Order, OrderItem, OrderStatus


def seed_order_data():
    """Seed the database with sample orders"""
    db: Session = SessionLocal()

    # Check if data already exists
    existing_orders = db.query(Order).count()
    if existing_orders > 0:
        print(f"Database already has {existing_orders} orders. Skipping seed.")
        db.close()
        return

    print("Seeding order data...")

    # Sample orders with various statuses
    now = datetime.utcnow()
    
    orders = [
        # Order 1 - Completed (30 mins ago)
        Order(
            customer_id=4,  # john_doe
            customer_name="John Doe",
            table_number=5,
            status=OrderStatus.DELIVERED,
            total_amount=27.97,
            special_instructions="Extra napkins please",
            created_at=now - timedelta(minutes=30),
            updated_at=now - timedelta(minutes=5),
            items=[
                OrderItem(menu_item_id=2, menu_item_name="Pepperoni Pizza", 
                         menu_item_price=14.99, quantity=1, subtotal=14.99),
                OrderItem(menu_item_id=11, menu_item_name="Caesar Salad", 
                         menu_item_price=8.99, quantity=1, subtotal=8.99),
                OrderItem(menu_item_id=16, menu_item_name="Coca Cola", 
                         menu_item_price=2.99, quantity=1, subtotal=2.99),
            ]
        ),
        
        # Order 2 - Ready for pickup (10 mins ago)
        Order(
            customer_id=5,  # jane_smith
            customer_name="Jane Smith",
            table_number=3,
            status=OrderStatus.READY,
            total_amount=24.98,
            special_instructions="No cheese on burger",
            created_at=now - timedelta(minutes=20),
            updated_at=now - timedelta(minutes=10),
            items=[
                OrderItem(menu_item_id=8, menu_item_name="Classic Cheeseburger", 
                         menu_item_price=9.99, quantity=2, subtotal=19.98),
                OrderItem(menu_item_id=17, menu_item_name="Fresh Orange Juice", 
                         menu_item_price=4.99, quantity=1, subtotal=4.99),
            ]
        ),
        
        # Order 3 - Currently being prepared
        Order(
            customer_id=6,  # bob_wilson
            customer_name="Bob Wilson",
            table_number=7,
            status=OrderStatus.PREPARING,
            total_amount=38.96,
            special_instructions="",
            created_at=now - timedelta(minutes=15),
            updated_at=now - timedelta(minutes=5),
            items=[
                OrderItem(menu_item_id=5, menu_item_name="Spaghetti Carbonara", 
                         menu_item_price=11.99, quantity=2, subtotal=23.98),
                OrderItem(menu_item_id=13, menu_item_name="Tiramisu", 
                         menu_item_price=6.99, quantity=2, subtotal=13.98),
            ]
        ),
        
        # Order 4 - Just confirmed
        Order(
            customer_id=4,  # john_doe again
            customer_name="John Doe",
            table_number=2,
            status=OrderStatus.CONFIRMED,
            total_amount=45.94,
            special_instructions="Birthday celebration - please bring candles!",
            created_at=now - timedelta(minutes=5),
            updated_at=now - timedelta(minutes=3),
            items=[
                OrderItem(menu_item_id=1, menu_item_name="Margherita Pizza", 
                         menu_item_price=12.99, quantity=1, subtotal=12.99),
                OrderItem(menu_item_id=7, menu_item_name="Fettuccine Alfredo", 
                         menu_item_price=12.99, quantity=1, subtotal=12.99),
                OrderItem(menu_item_id=12, menu_item_name="Greek Salad", 
                         menu_item_price=9.99, quantity=1, subtotal=9.99),
                OrderItem(menu_item_id=14, menu_item_name="Chocolate Cake", 
                         menu_item_price=5.99, quantity=1, subtotal=5.99),
                OrderItem(menu_item_id=18, menu_item_name="Iced Coffee", 
                         menu_item_price=3.99, quantity=1, subtotal=3.99),
            ]
        ),
        
        # Order 5 - Pending (just received)
        Order(
            customer_id=5,  # jane_smith
            customer_name="Jane Smith",
            table_number=10,
            status=OrderStatus.PENDING,
            total_amount=33.97,
            special_instructions="Gluten-free if possible",
            created_at=now - timedelta(minutes=2),
            updated_at=now - timedelta(minutes=2),
            items=[
                OrderItem(menu_item_id=3, menu_item_name="Vegetarian Pizza", 
                         menu_item_price=13.99, quantity=1, subtotal=13.99),
                OrderItem(menu_item_id=10, menu_item_name="Veggie Burger", 
                         menu_item_price=10.99, quantity=1, subtotal=10.99),
                OrderItem(menu_item_id=11, menu_item_name="Caesar Salad", 
                         menu_item_price=8.99, quantity=1, subtotal=8.99),
            ]
        ),
    ]

    for order in orders:
        db.add(order)

    db.commit()
    print(f"✅ Successfully seeded {len(orders)} orders!")
    print("\n📊 Order Status Summary:")
    print(f"  Delivered: 1")
    print(f"  Ready: 1")
    print(f"  Preparing: 1")
    print(f"  Confirmed: 1")
    print(f"  Pending: 1")
    db.close()


if __name__ == "__main__":
    seed_order_data()
