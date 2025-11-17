from fastapi import status


class TestMenuEndpoints:
    """Test suite for Menu API endpoints"""

    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "Menu Service"

    def test_get_empty_menu(self, client):
        """Test getting menu when it's empty"""
        response = client.get("/api/v1/menu/")
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    def test_create_menu_item(self, client):
        """Test creating a new menu item"""
        new_item = {
            "name": "Margherita Pizza",
            "description": "Classic Italian pizza",
            "price": 12.99,
            "category": "Pizza",
            "is_available": True,
            "prep_time": 15,
        }
        response = client.post("/api/v1/menu/", json=new_item)
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "Margherita Pizza"
        assert data["price"] == 12.99
        assert data["id"] == 1
        assert "created_at" in data

    def test_get_all_menu_items(self, client):
        """Test getting all menu items after creating some"""
        # Create test items
        items = [
            {
                "name": "Pizza",
                "description": "Delicious pizza",
                "price": 12.99,
                "category": "Main",
                "prep_time": 15,
            },
            {
                "name": "Salad",
                "description": "Fresh salad",
                "price": 8.50,
                "category": "Appetizer",
                "prep_time": 10,
            },
        ]

        for item in items:
            client.post("/api/v1/menu/", json=item)

        response = client.get("/api/v1/menu/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
        assert data[0]["name"] == "Pizza"
        assert data[1]["name"] == "Salad"

    def test_get_menu_item_by_id(self, client):
        """Test getting a specific menu item by ID"""
        # Create item
        new_item = {
            "name": "Test Pizza",
            "description": "Test description",
            "price": 10.99,
            "category": "Pizza",
            "prep_time": 15,
        }
        create_response = client.post("/api/v1/menu/", json=new_item)
        item_id = create_response.json()["id"]

        # Get item by ID
        response = client.get(f"/api/v1/menu/{item_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == item_id
        assert data["name"] == "Test Pizza"

    def test_get_nonexistent_menu_item(self, client):
        """Test getting a menu item that doesn't exist"""
        response = client.get("/api/v1/menu/9999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_items_by_category(self, client):
        """Test filtering menu items by category"""
        # Create items in different categories
        items = [
            {"name": "Pizza", "price": 12.99, "category": "Pizza", "prep_time": 15},
            {"name": "Pasta", "price": 11.99, "category": "Pasta", "prep_time": 20},
            {
                "name": "Another Pizza",
                "price": 14.99,
                "category": "Pizza",
                "prep_time": 15,
            },
        ]

        for item in items:
            client.post("/api/v1/menu/", json=item)

        response = client.get("/api/v1/menu/category/Pizza")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
        assert all(item["category"] == "Pizza" for item in data)

    def test_create_menu_item_invalid_price(self, client):
        """Test creating menu item with invalid price"""
        invalid_item = {
            "name": "Invalid Item",
            "price": -5.00,  # Negative price!
            "category": "Test",
            "prep_time": 10,
        }
        response = client.post("/api/v1/menu/", json=invalid_item)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_update_menu_item(self, client):
        """Test updating an existing menu item"""
        # Create item
        new_item = {
            "name": "Original Pizza",
            "price": 12.99,
            "category": "Pizza",
            "prep_time": 15,
        }
        create_response = client.post("/api/v1/menu/", json=new_item)
        item_id = create_response.json()["id"]

        # Update item
        update_data = {"name": "Updated Pizza", "price": 14.99}
        response = client.put(f"/api/v1/menu/{item_id}", json=update_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Pizza"
        assert data["price"] == 14.99

    def test_delete_menu_item(self, client):
        """Test deleting a menu item"""
        # Create item
        new_item = {
            "name": "To Delete",
            "price": 9.99,
            "category": "Test",
            "prep_time": 10,
        }
        create_response = client.post("/api/v1/menu/", json=new_item)
        item_id = create_response.json()["id"]

        # Delete item
        response = client.delete(f"/api/v1/menu/{item_id}")
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify deleted
        get_response = client.get(f"/api/v1/menu/{item_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND
