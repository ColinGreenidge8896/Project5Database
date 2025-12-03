"""Integration tests for Fleet team routes"""
import requests
import pytest
import time

BASE_URL = "http://localhost:3000/api/fleet"

class TestRentals:
    """Test Rental CRUD operations"""
    # must match format:
    # const { rentalcode, accountid, start, end, status, notes, scope } = req.body;
    # accountId = 0 for testing
    def test_create_rental(self):
        """Test POST /api/fleet/rental"""
        rental_data = {
            "rentalcode": "test",
            "accountid": 0,
            "start": "2025-01-15",
            "end": "2025-01-20",
            "status": "Returned",
            "notes": "Test rental",
            "scope": "External"
        }
        response = requests.post(f"{BASE_URL}/rental", json=rental_data)
        print(response.status_code)
        print(response.json())

        assert response.status_code == 200
        data = response.json()

        assert data["success"] == True
        assert "rentalID" in data["data"] or "RentalID" in data["data"]
    
    def test_get_all_rentals(self):
        """Test GET /api/fleet/rental"""
        response = requests.get(f"{BASE_URL}/rental")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert isinstance(data["data"], list)
    
    def test_get_rental_by_id(self):
        """Test GET /api/fleet/rental/:id"""
        # Create rental first
        rental_data = {
            "rentalcode": "test",
            "accountid": 0,
            "start": "2025-01-15",
            "end": "2025-01-20",
            "status": "Returned",
            "notes": "Test rental",
            "scope": "External"
        }
        create_response = requests.post(f"{BASE_URL}/rental", json=rental_data)
        rental_id = create_response.json()["data"].get("rentalID") or create_response.json()["data"].get("RentalID")
        
        # Get it
        response = requests.get(f"{BASE_URL}/rental/{rental_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
    
    def test_update_rental(self):
        """Test PATCH /api/fleet/rental/:id"""
        # Create rental
        rental_data = {
            "rentalcode": "test",
            "accountid": 0,
            "start": "2025-01-15",
            "end": "2025-01-20",
            "status": "Returned",
            "notes": "Test rental",
            "scope": "External"
        }
        create_response = requests.post(f"{BASE_URL}/rental", json=rental_data)
        rental_id = create_response.json()["data"].get("rentalID") or create_response.json()["data"].get("RentalID")
        
        # Update it
        update_data = {
            "status": "Reserved",
            "note": "Updated note"
        }
        response = requests.patch(f"{BASE_URL}/rental/{rental_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
    
    def test_delete_rental(self):
        """Test DELETE /api/fleet/rental/:id"""
        # Create rental
        rental_data = {
            "rentalcode": "test",
            "accountid": 0,
            "start": "2025-01-15",
            "end": "2025-01-20",
            "status": "Returned",
            "notes": "Test rental",
            "scope": "External"
        }
        create_response = requests.post(f"{BASE_URL}/rental", json=rental_data)
        rental_id = create_response.json()["data"].get("rentalID") or create_response.json()["data"].get("RentalID")
        
        # Delete it
        response = requests.delete(f"{BASE_URL}/rental/{rental_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True

class TestEquipment:
    """Test Equipment CRUD operations"""
    
    def test_create_equipment(self):
        """Test POST /api/fleet/equipment"""
        timestamp = int(time.time())
        equipment_data = {
            "code": f"EQ-TEST-{timestamp}",
            "description": "Test equipment",
            "value": 1000.00,
            "category": "Test Category",
            "type": "Test Type",
            "availability": "Available"
        }
        
        response = requests.post(f"{BASE_URL}/equipment", json=equipment_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "equipmentID" in data["data"] or "EquipmentID" in data["data"]
    
    def test_get_all_equipment(self):
        """Test GET /api/fleet/equipment"""
        response = requests.get(f"{BASE_URL}/equipment")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert isinstance(data["data"], list)
    
    def test_get_equipment_by_id(self):
        """Test GET /api/fleet/equipment/:id"""
        # Create equipment first
        timestamp = int(time.time())
        equipment_data = {
            "code": f"EQ-GET-{timestamp}",
            "description": "Get test",
            "value": 500.00,
            "category": "Test",
            "type": "Test",
            "availability": "Available"
        }
        create_response = requests.post(f"{BASE_URL}/equipment", json=equipment_data)
        equipment_id = create_response.json()["data"].get("equipmentID") or create_response.json()["data"].get("EquipmentID")
        
        # Get it
        response = requests.get(f"{BASE_URL}/equipment/{equipment_id}")
        
        assert response.sta