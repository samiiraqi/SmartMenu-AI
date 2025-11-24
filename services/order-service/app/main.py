from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.database import Base, engine
# import socketio
from app.routes import order_routes

# from app.websocket.socket_manager import sio

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Order Service",
    description="Handles customer orders",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(order_routes.router, prefix="/api")

# socket_app = socketio.ASGIApp(sio, app)


@app.get("/")
def read_root():
    return {"message": "Order Service is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Order Service"}
