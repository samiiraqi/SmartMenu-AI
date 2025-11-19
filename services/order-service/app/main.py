from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from app.routes import order_routes
from app.config.database import Base, engine
from app.websocket.socket_manager import sio

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Order Service",
    description="Handles customer orders",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(order_routes.router, prefix="/api")

# Mount Socket.IO
socket_app = socketio.ASGIApp(sio, app)

@app.get("/")
def read_root():
    return {"message": "Order Service is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
