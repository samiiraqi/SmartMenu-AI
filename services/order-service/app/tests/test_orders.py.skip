from unittest.mock import patch

from fastapi import status


class TestOrderEndpoints:
    """Test suite for Order API endpoints"""

    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "Order Service"

    @patch("app.services.order_service.OrderService.get_menu_item")
    async def test_create_order(self, mock_get_menu_item, client):
        """Test creating a new order"""

        # Mock the Menu Service response (as a simple async function)
        async def mock_menu_response(menu_item_id):
            return {
                "id": 1,
                "name": "Test Pizza",
                "price": 12.99,
                "is_available": True,
            }

        mock_get_menu_item.side_effect = mock_menu_response

        new_order = {
            "customer_name": "John Doe",
            "table_number": 5,
            "special_instructions": "Extra cheese",
            "items": [{"menu_item_id": 1, "quantity": 2, "notes": "Well done"}],
        }

        response = client.post("/api/v1/orders/", json=new_order)
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["customer_name"] == "John Doe"
        assert data["table_number"] == 5
        assert data["status"] == "pending"
        assert data["total_amount"] == 25.98  # 12.99 * 2
        assert len(data["items"]) == 1
        assert data["items"][0]["quantity"] == 2

    def test_get_empty_orders(self, client):
        """Test getting orders when none exist"""
        response = client.get("/api/v1/orders/")
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    @patch("app.services.order_service.OrderService.get_menu_item")
    async def test_get_all_orders(self, mock_get_menu_item, client):
        """Test getting all orders after creating some"""

        async def mock_menu_response(menu_item_id):
            return {
                "id": 1,
                "name": "Pizza",
                "price": 10.00,
                "is_available": True,
            }

        mock_get_menu_item.side_effect = mock_menu_response

        # Create test orders
        orders = [
            {
                "customer_name": "Alice",
                "table_number": 1,
                "items": [{"menu_item_id": 1, "quantity": 1}],
            },
            {
                "customer_name": "Bob",
                "table_number": 2,
                "items": [{"menu_item_id": 1, "quantity": 2}],
            },
        ]

        for order in orders:
            client.post("/api/v1/orders/", json=order)

        response = client.get("/api/v1/orders/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
        assert data[0]["customer_name"] == "Alice"
        assert data[1]["customer_name"] == "Bob"

    @patch("app.services.order_service.OrderService.get_menu_item")
    async def test_get_order_by_id(self, mock_get_menu_item, client):
        """Test getting a specific order by ID"""

        async def mock_menu_response(menu_item_id):
            return {
                "id": 1,
                "name": "Pizza",
                "price": 15.00,
                "is_available": True,
            }

        mock_get_menu_item.side_effect = mock_menu_response

        # Create order
        new_order = {
            "customer_name": "Test User",
            "table_number": 3,
            "items": [{"menu_item_id": 1, "quantity": 1}],
        }
        create_response = client.post("/api/v1/orders/", json=new_order)
        order_id = create_response.json()["id"]

        # Get order by ID
        response = client.get(f"/api/v1/orders/{order_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == order_id
        assert data["customer_name"] == "Test User"

    def test_get_nonexistent_order(self, client):
        """Test getting an order that doesn't exist"""
        response = client.get("/api/v1/orders/9999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @patch("app.services.order_service.OrderService.get_menu_item")
    async def test_update_order_status(self, mock_get_menu_item, client):
        """Test updating order status"""

        async def mock_menu_response(menu_item_id):
            return {
                "id": 1,
                "name": "Pizza",
                "price": 10.00,
                "is_available": True,
            }

        mock_get_menu_item.side_effect = mock_menu_response

        # Create order
        new_order = {
            "customer_name": "Status Test",
            "table_number": 4,
            "items": [{"menu_item_id": 1, "quantity": 1}],
        }
        create_response = client.post("/api/v1/orders/", json=new_order)
        order_id = create_response.json()["id"]

        # Update status
        response = client.put(
            f"/api/v1/orders/{order_id}", json={"status": "preparing"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "preparing"

    @patch("app.services.order_service.OrderService.get_menu_item")
    async def test_cancel_order(self, mock_get_menu_item, client):
        """Test cancelling an order"""

        async def mock_menu_response(menu_item_id):
            return {
                "id": 1,
                "name": "Pizza",
                "price": 10.00,
                "is_available": True,
            }

        mock_get_menu_item.side_effect = mock_menu_response

        # Create order
        new_order = {
            "customer_name": "Cancel Test",
            "table_number": 5,
            "items": [{"menu_item_id": 1, "quantity": 1}],
        }
        create_response = client.post("/api/v1/orders/", json=new_order)
        order_id = create_response.json()["id"]

        # Cancel order
        response = client.delete(f"/api/v1/orders/{order_id}")
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify cancelled
        get_response = client.get(f"/api/v1/orders/{order_id}")
        assert get_response.json()["status"] == "cancelled"

    @patch("app.services.order_service.OrderService.get_menu_item")
    async def test_get_orders_by_customer(self, mock_get_menu_item, client):
        """Test getting orders for a specific customer"""

        async def mock_menu_response(menu_item_id):
            return {
                "id": 1,
                "name": "Pizza",
                "price": 10.00,
                "is_available": True,
            }

        mock_get_menu_item.side_effect = mock_menu_response

        # Create orders
        new_order = {
            "customer_name": "Customer A",
            "table_number": 1,
            "items": [{"menu_item_id": 1, "quantity": 1}],
        }
        client.post("/api/v1/orders/?customer_id=100", json=new_order)

        # Get orders for customer
        response = client.get("/api/v1/orders/customer/100")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) >= 1
