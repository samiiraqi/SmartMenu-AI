from fastapi import APIRouter

from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/sales")
async def get_sales_report():
    """Get sales analytics"""
    return await AnalyticsService.get_sales_report()


@router.get("/popular-items")
async def get_popular_items():
    """Get most popular menu items"""
    return await AnalyticsService.get_popular_items()


@router.get("/summary")
async def get_analytics_summary():
    """Get complete analytics summary"""
    return await AnalyticsService.get_analytics_summary()
