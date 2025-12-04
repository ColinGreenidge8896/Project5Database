"""Integration tests for POS team routes"""
import requests
import pytest
import time

BASE_URL = "http://localhost:3000/api/pos"

class TestCustomerCRUD:
    """Test Customer CRUD operations"""
    
    def test_get_test_customer(self):
        """Test GET /api/pos/customers/:id with seeded test customer (ID=0)"""
        response = requests.get(f"{BASE_URL}/customers/1")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["data"]["AccountID"] == 1
        assert data["data"]["Username"] == "test"
        assert data["data"]["Email"] == "test@testing.com"
    
    def test_create_customer(self):
        """Test POST /api/pos/register"""
        timestamp = int(time.time())
        customer_data = {
            "email": f"newcustomer{timestamp}@example.com",
            "username": f"newuser{timestamp}",
            "password": "password123",
            "status": "active"
        }
        
        response = requests.post(f"{BASE_URL}/register", json=customer_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "accountID" in data["data"]
    
    def test_get_all_customers(self):
        """Test GET /api/pos/customers"""
        response = requests.get(f"{BASE_URL}/customers")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert isinstance(data["data"], list)
        # Should include at least the test customer (ID=0)
        assert len(data["data"]) > 0

class TestLogin:
    """Test login functionality"""
    
    def test_login_with_test_account(self):
        """Test POST /api/pos/login with seeded test account"""
        login_data = {
            "username": "test",
            "password": "T3st123"
        }
        
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        data = response.json()
        print(response.status_code)
        print(response.json())
        
        assert response.status_code == 200
        assert data["success"] == True
        assert "user" in data["data"]
        assert data["data"]["user"]["Username"] == "test"
        assert data["data"]["user"]["Email"] == "test@testing.com"
    
    def test_login_wrong_password(self):
        """Test POST /api/pos/login with incorrect password"""
        login_data = {
            "username": "test",
            "password": "WrongPassword123"
        }
        
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        data = response.json()
        print(response.status_code)
        print(response.json())
        
        assert data["success"] == False
        assert "Invalid" in data["message"]

class TestPayments:
    """Test payment operations"""
    
    def test_create_payment_with_test_customer(self):
        """Test POST /api/pos/payments using test customer (ID=0)"""
        payment_data = {
        "accountID": 1,
        "cardNo": "4532123456789012",
        "amount": 100.00,
        "paymentMethod": "credit_card"
        # billing address if they want
        }
        
        response = requests.post(f"{BASE_URL}/payments", json=payment_data)
        print(response.status_code)
        print(response.json())
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "paymentID" in data["data"]
    
    def test_get_all_payments(self):
        """Test GET /api/pos/payments"""
        response = requests.get(f"{BASE_URL}/payments")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert isinstance(data["data"], list)

class TestTransactions:
    """Test transaction operations"""
    
    def test_create_item_transaction_with_test_product(self):
        """Test POST /api/pos/item-transactions using test product (ID=0)"""
        #create test payment
        payment_data = {
            "accountID": 1, 
            "cardNo": "4532123456789012",
            "amount": 200.00,
            "paymentMethod": "credit_card",
        }
        payment_response = requests.post(f"{BASE_URL}/payments", json=payment_data)
        payment_id = payment_response.json()["data"]["paymentID"]
        
        # Create transaction with test product
        transaction_data = {
            "paymentID": payment_id,
            "productID": 1,
            "quantity": 2,
            "subtotal": 200.00
        }
        
        response = requests.post(f"{BASE_URL}/item-transactions", json=transaction_data)
        print(response.status_code)
        print(response.json())
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
    
    def test_get_all_item_transactions(self):
        """Test GET /api/pos/item-transactions"""
        response = requests.get(f"{BASE_URL}/item-transactions")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert isinstance(data["data"], list)