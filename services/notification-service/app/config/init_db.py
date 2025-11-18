from app.config.database import Base, engine
from app.models.notification import Notification  # noqa: F401


def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


if __name__ == "__main__":
    init_db()
