from sqlalchemy.orm import Session

from app.config.database import SessionLocal
from app.models.user import User, UserRole
from app.services.auth_service import AuthService


def seed_user_data():
    """Seed the database with sample users"""
    db: Session = SessionLocal()

    # Check if data already exists
    existing_users = db.query(User).count()
    if existing_users > 0:
        print(f"Database already has {existing_users} users. Skipping seed.")
        db.close()
        return

    print("Seeding user data...")

    users = [
        # Admin user
        User(
            email="admin@smartmenu.com",
            username="admin",
            hashed_password=AuthService.get_password_hash("Admin123!"),
            full_name="System Administrator",
            phone="+1234567890",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        ),
        # Staff users
        User(
            email="chef@smartmenu.com",
            username="chef_mike",
            hashed_password=AuthService.get_password_hash("Chef123!"),
            full_name="Mike Johnson",
            phone="+1234567891",
            role=UserRole.STAFF,
            is_active=True,
            is_verified=True,
        ),
        User(
            email="waiter@smartmenu.com",
            username="waiter_sarah",
            hashed_password=AuthService.get_password_hash("Waiter123!"),
            full_name="Sarah Williams",
            phone="+1234567892",
            role=UserRole.STAFF,
            is_active=True,
            is_verified=True,
        ),
        # Customer users
        User(
            email="john@example.com",
            username="john_doe",
            hashed_password=AuthService.get_password_hash("Customer123!"),
            full_name="John Doe",
            phone="+1234567893",
            role=UserRole.CUSTOMER,
            is_active=True,
            is_verified=True,
        ),
        User(
            email="jane@example.com",
            username="jane_smith",
            hashed_password=AuthService.get_password_hash("Customer123!"),
            full_name="Jane Smith",
            phone="+1234567894",
            role=UserRole.CUSTOMER,
            is_active=True,
            is_verified=True,
        ),
        User(
            email="bob@example.com",
            username="bob_wilson",
            hashed_password=AuthService.get_password_hash("Customer123!"),
            full_name="Bob Wilson",
            phone="+1234567895",
            role=UserRole.CUSTOMER,
            is_active=True,
            is_verified=True,
        ),
    ]

    for user in users:
        db.add(user)

    db.commit()
    print(f"✅ Successfully seeded {len(users)} users!")
    print("\n📋 Test Credentials:")
    print("  Admin:    admin / Admin123!")
    print("  Chef:     chef_mike / Chef123!")
    print("  Waiter:   waiter_sarah / Waiter123!")
    print("  Customer: john_doe / Customer123!")
    db.close()


if __name__ == "__main__":
    seed_user_data()
