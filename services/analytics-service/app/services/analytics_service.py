from typing import Dict, List

import httpx

from app.config.settings import settings


class AnalyticsService:
    @staticmethod
    async def get_sales_report() -> Dict:
        """Get sales analytics from Order Service"""
        try:
            async with httpx.AsyncClient() as client:
                # Fetch orders
                orders_response = await client.get(
                    f"{settings.ORDER_SERVICE_URL}/api/v1/orders/"
                )
                if orders_response.status_code != 200:
                    return {
                        "total_orders": 0,
                        "total_revenue": 0.0,
                        "average_order_value": 0.0,
                    }

                orders = orders_response.json()
                total_orders = len(orders)
                total_revenue = sum(order.get("total_amount", 0) for order in orders)
                avg_order = total_revenue / total_orders if total_orders > 0 else 0

                return {
                    "total_orders": total_orders,
                    "total_revenue": round(total_revenue, 2),
                    "average_order_value": round(avg_order, 2),
                }
        except Exception as e:
            print(f"Error fetching sales report: {e}")
            return {"total_orders": 0, "total_revenue": 0.0, "average_order_value": 0.0}

    @staticmethod
    async def get_popular_items() -> List[Dict]:
        """Get popular menu items based on orders"""
        try:
            async with httpx.AsyncClient() as client:
                # Fetch all orders
                orders_response = await client.get(
                    f"{settings.ORDER_SERVICE_URL}/api/v1/orders/"
                )
                if orders_response.status_code != 200:
                    return []

                orders = orders_response.json()

                # Count items
                item_counts = {}
                for order in orders:
                    for item in order.get("items", []):
                        item_id = item.get("menu_item_id")
                        item_name = item.get("menu_item_name")
                        if item_id:
                            if item_id not in item_counts:
                                item_counts[item_id] = {
                                    "item_id": item_id,
                                    "item_name": item_name,
                                    "order_count": 0,
                                }
                            item_counts[item_id]["order_count"] += item.get("quantity", 1)

                # Sort by popularity
                popular = sorted(
                    item_counts.values(), key=lambda x: x["order_count"], reverse=True
                )
                return popular[:10]  # Top 10
        except Exception as e:
            print(f"Error fetching popular items: {e}")
            return []

    @staticmethod
    async def get_analytics_summary() -> Dict:
        """Get complete analytics summary"""
        sales = await AnalyticsService.get_sales_report()
        popular = await AnalyticsService.get_popular_items()

        return {
            "sales": sales,
            "popular_items": popular,
            "customer_count": sales.get("total_orders", 0),  # Simplified
        }
