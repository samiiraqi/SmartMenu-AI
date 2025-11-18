from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.routes import menu_routes

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Menu Service API for SmartMenu AI - Manage restaurant menu items",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(menu_routes.router, prefix=settings.API_PREFIX)


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint
    Used by Kubernetes and monitoring tools
    """
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint - API information
    """
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
    }
