from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate
from app.services.auth_service import AuthService


class UserService:
    """
    User Service
    Handles user CRUD operations
    """

    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """Create a new user"""
        # Validate password
        is_valid, error_msg = AuthService.validate_password(user_data.password)
        if not is_valid:
            raise ValueError(error_msg)

        # Check if email exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise ValueError("Email already registered")

        # Check if username exists
        existing_username = (
            db.query(User).filter(User.username == user_data.username).first()
        )
        if existing_username:
            raise ValueError("Username already taken")

        # Hash password
        hashed_password = AuthService.get_password_hash(user_data.password)

        # Create user
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            phone=user_data.phone,
            role=UserRole.CUSTOMER,
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """Get user by username"""
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users with pagination"""
        return db.query(User).offset(skip).limit(limit).all()

    @staticmethod
    def update_user(db: Session, user_id: int, user_data: UserUpdate) -> Optional[User]:
        """Update user profile"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return None

        if user_data.full_name is not None:
            db_user.full_name = user_data.full_name
        if user_data.phone is not None:
            db_user.phone = user_data.phone

        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        """Delete user (soft delete - mark as inactive)"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return False

        db_user.is_active = False
        db.commit()
        return True

    @staticmethod
    def update_user_role(db: Session, user_id: int, new_role: str) -> Optional[User]:
        """Update user role (admin only)"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return None

        db_user.role = new_role
        db.commit()
        db.refresh(db_user)
        return db_user
