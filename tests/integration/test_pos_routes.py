"""Integration tests for POS team routes"""
import requests
import pytest
import time

BASE_URL = "http://localhost:3000/api/pos"

class TestCustomerCRUD:
    """Test Customer CRUD operations"""
    
    def test_create_customer(self):
        """Test POST /api/pos/register"""
        timestamp = int(time.time())
        customer_data = {
            "email": f"test{timestamp}@example.com",
            "username": f"testuser{timestamp}",
            "password": "password123",
            "status": "active"
        }
        
        response = requests.post(f"{BASE_URL}/register", json=customer_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "accountID" in data["data"]
        assert isinstance(data["data"]["accountID"], int)
    
    def test_create_customer_missing_email(self):
        """Test POST /api/pos/register without email"""
        customer_data = {
            "username": "testuser",
            "password": "password123"
        }
        
        response = requests.post(f"{BASE_URL}/register", json=customer_data)
        data = response.json()
        
        assert data["success"] == False
        assert "Missing required fields" in data["message"]
    
    def test_create_customer_missing_username(self):
        """Test POST /api/pos/register without username"""
        customer_data = {
            "email": "test@example.com",
            "password": "password123"
        }
        
        response = requests.post(f"{BASE_URL}/register", json=customer_data)
        data = response.json()
        
        assert data["success"] == False
    
    def test_create_customer_missing_password(self):
        """Test POST /api/pos/register without password"""
        customer_data = {
            "email": "test@example.com",
            "username": "testuser"
        }
        
        response = requests.post(f"{BASE_URL}/register", json=customer_data)
        data = response.json()
        
        assert data["success"] == False
    
    def test_get_all_customers(self):
        """Test GET /api/pos/customers"""
        response = requests.get(f"{BASE_URL}/customers")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert isinstance(data["data"], list)
    
    def test_get_customer_by_id(self):
        """Test GET /api/pos/customers/:id"""
        # First create a customer
        timestamp = int(time.time())
        new_customer = {
            "email": f"get{timestamp}@example.com",
            "username": f"getuser{timestamp}",
            "password": "password123"
        }
        create_response = requests.post(f"{BASE_URL}/customers", json=new_customer)
        customer_id = create_response.json()["data"]["accountID"]
        
        # Now get it
        response = requests.get(f"{BASE_URL}/customers/{customer_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["data"]["AccountID"] == customer_id
        assert data["data"]["Username"] == f"getuser{timestamp}"
    
    def test_get_customer_not_found(self):
        """Test GET /api/pos/customers/:id with non-existent ID"""
        response = requests.get(f"{BASE_URL}/customers/999999")
        data = response.json()
        
        assert data["success"] == False
        assert "not found" in data["message"].lower()
    
    def test_delete_customer(self):
        """Test DELETE /api/pos/customers/:id"""
        # Create customer
        timestamp = int(time.time())
        new_customer = {
            "email": f"delete{timestamp}@example.com",
            "username": f"deleteuser{timestamp}",
            "password": "password123"
        }
        create_response = requests.post(f"{BASE_URL}/customers", json=new_customer)
        customer_id = create_response.json()["data"]["accountID"]
        
        # Delete it
        response = requests.delete(f"{BASE_URL}/customers/{customer_id}")
        data = response.json()
        
        assert response.status_code == 200
        assert data["success"] == True
        assert "deleted" in data["message"].lower()
        
        # Verify it's gone
        get_response = requests.get(f"{BASE_URL}/customers/{customer_id}")
        assert get_response.json()["success"] == False

class TestLogin:
    """Test login functionality"""
    
    def test_login_success(self):
        """Test POST /api/pos/login with valid credentials"""
        # Use existing credentials from database
        login_data = {
            "username": "shandor.ghost",
            "password": "SECRETP@55"
        }
        
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        data = response.json()
        
        assert response.status_code == 200
        assert data["success"] == True
        assert "user" in data["data"]
        assert data["data"]["user"]["Username"] == "shandor.ghost"
        assert "Password" not in data["data"]["user"]  # Password should be removed from response
   
    def test_login_wrong_password(self):
        """Test POST /api/pos/login with incorrect password"""
        # Use existing username but wrong password
        login_data = {
            "username": "shandor.ghost",
            "password": "WrongPassword123"
        }
        
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        data = response.json()
        
        assert data["success"] == False
        assert "Invalid" in data["message"]
    
    def test_login_nonexistent_user(self):
        """Test POST /api/pos/login with non-existent username"""
        login_data = {
            "username": "nonexistentuser999999",
            "password": "password123"
        }
        
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        data = response.json()
        
        assert data["success"] == False
    
    def test_login_missing_username(self):
        """Test POST /api/pos/login without username"""
        login_data = {
            "password": "password123"
        }
        
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        data = response.json()
        
        assert data["success"] == False
    
    def test_login_missing_password(self):
        """Test POST /api/pos/login without password"""
        login_data = {
            "username": "testuser"
        }
        
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        data = response.json()
        
        assert data["success"] == False

class TestPayments:
    """Test payment operations"""
    
    def test_create_payment(self):
        """Test POST /api/pos/payments"""
        payment_data = {
            "accountID": 1,
            "cardNo": "4532123456789012",
            "cvv": "123",
            "expiryDate": "12/26",
            "serviceAddress": "123 Test St",
            "deliveryAddress": "456 Main St"
        }
        
        response = requests.post(f"{BASE_URL}/payments", json=payment_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "paymentID" in data["data"]
    
    def test_create_payment_missing_fields(self):
        """Test POST /api/pos/payments without required fields"""
        payment_data = {
            "accountID": 1,
            "cardNo": "4532123456789012"
        }
        
        response = requests.post(f"{BASE_URL}/payments", json=payment_data)
        data = response.json()
        
        assert data["success"] == False
    
    def test_get_all_payments(self):
        """Test GET /api/pos/payments"""
        response = requests.get(f"{BASE_URL}/payments")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert isinstance(data["data"], list)

class TestTransactions:
    """Test transaction operations"""
    
    def test_create_item_transaction(self):
        """Test POST /api/pos/item-transactions"""
        transaction_data = {
            "paymentID": 1,
            "productID": 1,
            "quantity": 2,
            "subtotal": 29.98
        }
        
        response = requests.post(f"{BASE_URL}/item-transactions", json=transaction_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
    
    def test_create_service_transaction(self):
        """Test POST /api/pos/service-transactions"""
        transaction_data = {
            "paymentID": 1,
            "serviceID": 1,
            "hoursWorked": 3,
            "subtotal": 150.00
        }
        
        response = requests.post(f"{BASE_URL}/service-transactions", json=transaction_data)
        
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
    
    def test_get_all_service_transactions(self):
        """Test GET /api/pos/service-transactions"""
        response = requests.get(f"{BASE_URL}/service-transactions")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert isinstance(data["data"], list)


        INSERT INTO Ghost (GhostID, GhostName, GhostDescription) VALUES
        (0, 'Testing Ghost', 'This is a test ghost.');

        INSERT INTO Trait (TraitID, TraitName) VALUES
        (0, 'Testing Trait');

        INSERT INTO Product (ProductID, ProductName, Price, ProductDescription) VALUES
        (0, 100.00, 'Testing product description.');

        INSERT INTO ProductStock (ProductID, QuantityAvailable, RestockThreshold, LastRestockDate) VALUES
        (0, 5, 2, NOW());

        INSERT INTO Equipment (EquipmentID, EquipmentCode, EquipmentName, EquipmentDescription, EquipmentValue, EquipmentCategory, EquipmentType, EquipmentTrackingId, EquipmentAvailability) VALUES
        (0, 'EQ-OOO-000','Test Equipment Pack', 'Test Equipment Description', 1000.00,                       'Category', 'Type', 'AA-000-A', 'Available');

        INSERT INTO CustomerAccount (AccountID, Email, Username, PasswordHash) VALUES
        (0, 'test@testing.com', 'test', 'T3st123');

        INSERT INTO CustomerAddress (AddressID, AccountID, Line1, City, ProvinceState, PostalCode, Country) VALUES
        (0, 0, '123 First St', 'Toronto', 'Ontario', 'A1A 1A1', 'Canada');

        INSERT INTO Rental (RentalID, RentalCode, AccountID, StartDate, EndDate, RentalStatus, Notes, Scope) VALUES
        (0, 'RT-0000', 0, '2000-01-01', '2000-01-01', 'Closed', 'Test insert rental.', 'External');