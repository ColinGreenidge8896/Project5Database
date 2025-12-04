"""Integration tests for Inventory team routes"""
import requests
import pytest
import time

BASE_URL = "http://localhost:3000/api/inventory"

class TestProducts:
    """Test Product CRUD operations"""
    
    def test_create_product(self):
        """Test POST /api/inventory/product"""
        timestamp = int(time.time())
        product_data = {
            "name": f"Test Product {timestamp}",
            "description": "A test product",
            "price": 29.99
        }
        
        response = requests.post(f"{BASE_URL}/product", json=product_data)
        
        assert response.status_code == 200
        data = response.json()
        print(response.status_code)
        print(response.json())

        assert data["success"] == True
        assert "productID" in data["data"]
    
    def test_create_product_missing_name(self):
        """Test POST /api/inventory/product without name"""
        product_data = {
            "description": "Test",
            "price": 10.00
        }
        
        response = requests.post(f"{BASE_URL}/product", json=product_data)
        data = response.json()
        
        assert data["success"] == False
        assert "Missing required fields" in data["message"]
    
    def test_create_product_missing_price(self):
        """Test POST /api/inventory/product without price"""
        product_data = {
            "name": "Test Product",
            "description": "Test"
        }
        
        response = requests.post(f"{BASE_URL}/product", json=product_data)
        data = response.json()
        
        assert data["success"] == False
    
    def test_get_all_products(self):
        """Test GET /api/inventory/product"""
        response = requests.get(f"{BASE_URL}/product")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert isinstance(data["data"], list)
    
    def test_update_product(self):
        """Test PATCH /api/inventory/product/:id"""
        # Create product first
        timestamp = int(time.time())
        product_data = {
            "name": f"Update Test {timestamp}",
            "price": 10.00
        }
        create_response = requests.post(f"{BASE_URL}/product", json=product_data)
        product_id = create_response.json()["data"]["productID"]
        
        # Update it
        update_data = {
            "price": 15.00,
            "description": "Updated description"
        }
        response = requests.patch(f"{BASE_URL}/product/{product_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "updated" in data["message"].lower()
    
    def test_update_nonexistent_product(self):
        """Test PATCH /api/inventory/product/:id with invalid ID"""
        update_data = {"price": 100.00}
        response = requests.patch(f"{BASE_URL}/product/999999", json=update_data)
        data = response.json()
        
        assert data["success"] == False
        assert "not found" in data["message"].lower()
    
    def test_delete_product(self):
        """Test DELETE /api/inventory/product/:id"""
        # Create product
        timestamp = int(time.time())
        product_data = {
            "name": f"Delete Test {timestamp}",
            "price": 5.00
        }
        create_response = requests.post(f"{BASE_URL}/product", json=product_data)
        product_id = create_response.json()["data"]["productID"]
        
        # Delete it
        response = requests.delete(f"{BASE_URL}/product/{product_id}")
        data = response.json()
        
        assert response.status_code == 200
        assert data["success"] == True
        assert "deleted" in data["message"].lower()

class TestProductStock:
    """Test ProductStock operations"""
    
    def test_create_product_stock(self):


        """Test POST /api/inventory/product-stock"""
        stock_data = {
            "productid": 15,
            "qty": 100,
            "restock": 20,
            "lastrestock": "2025-01-01"
        }
        
        response = requests.post(f"{BASE_URL}/product-stock", json=stock_data)
        
        assert response.status_code == 200
        data = response.json()
        print(response.status_code)
        print(response.json())
        assert data["success"] == True
    
    def test_get_all_product_stock(self):
        """Test GET /api/inventory/product-stock"""
        response = requests.get(f"{BASE_URL}/product-stock")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert isinstance(data["data"], list)

class TestStockOrders:
    """Test StockOrder operations"""
    
    def test_create_stock_order(self):
        """Test POST /api/inventory/stock-order"""
        order_data = {
            "productid": 1,
            "qty": 50,
            "suppliername": "Test Supplier",
            "ordered": "2025-01-15"
        }
        
        response = requests.post(f"{BASE_URL}/stock-order", json=order_data)
        print(response.status_code)
        print(response.json())
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
    
    def test_get_all_stock_orders(self):
        """Test GET /api/inventory/stock-order"""
        response = requests.get(f"{BASE_URL}/stock-order")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert isinstance(data["data"], list)
    
    def test_update_stock_order_received(self):
        """Test PATCH /api/inventory/stock-order/received/:id"""
        # Create order first
        order_data = {
            "productid": 1,
            "qty": 25,
            "suppliername": "Test",
            "ordered": "2025-01-01"
        }
        create_response = requests.post(f"{BASE_URL}/stock-order", json=order_data)
        order_id = create_response.json()["data"]["productID"]
        
        # Update received date
        update_data = {"received": "2025-01-10"}
        response = requests.patch(f"{BASE_URL}/stock-order/received/{order_id}", json=update_data)
        
        assert response.status_code == 200