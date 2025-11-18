from typing import Dict, List

from pydantic import BaseModel


class SalesReport(BaseModel):
    total_orders: int
    total_revenue: float
    average_order_value: float


class PopularItem(BaseModel):
    item_id: int
    item_name: str
    order_count: int


class AnalyticsSummary(BaseModel):
    sales: SalesReport
    popular_items: List[PopularItem]
    customer_count: int
