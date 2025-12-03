"""Integration tests for Reviews team routes"""
import requests
import pytest

BASE_URL = "http://localhost:3000/api/reviews"

class TestProductReviews:
    """Test Product Review CRUD operations"""
    
    def test_create_product_review(self):
        """Test POST /api/reviews/product-review"""
        review_data = {
            "productID": 1,
            "accountID": 1,
            "rating": 5,
            "comment": "Excellent product!"
        }
        
        response = requests.post(f"{BASE_URL}/product-review", json=review_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "ReviewID" in data["data"]
    
    def test_create_review_invalid_rating_low(self):
        """Test POST /api/reviews/product-review with rating < 1"""
        review_data = {
            "productID": 1,
            "accountID": 1,
            "rating": 0,
            "comment": "Test"
        }
        
        response = requests.post(f"{BASE_URL}/product-review", json=review_data)
        data = response.json()
        
        assert data["success"] == False
        assert "Invalid rating" in data["message"]
    
    def test_create_review_invalid_rating_high(self):
        """Test POST /api/reviews/product-review with rating > 5"""
        review_data = {
            "productID": 1,
            "accountID": 1,
            "rating": 10,
            "comment": "Test"
        }
        
        response = requests.post(f"{BASE_URL}/product-review", json=review_data)
        data = response.json()
        
        assert data["success"] == False
    
    def test_get_all_product_reviews(self):
        """Test GET /api/reviews/product-review"""
        response = requests.get(f"{BASE_URL}/product-review")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert isinstance(data["data"], list)
    
    def test_get_product_review_by_id(self):
        """Test GET /api/reviews/product-review/:id"""
        # Create review first
        review_data = {
            "productID": 1,
            "accountID": 1,
            "rating": 4,
            "comment": "Good product"
        }
        create_response = requests.post(f"{BASE_URL}/product-review", json=review_data)
        review_id = create_response.json()["data"]["ReviewID"]
        
        # Get it
        response = requests.get(f"{BASE_URL}/product-review/{review_id}")
        data = response.json()
        
        assert response.status_code == 200
        assert data["success"] == True
        assert data["data"]["Rating"] == 4
    
    def test_update_product_review(self):
        """Test PATCH /api/reviews/product-review/:id"""
        # Create review
        review_data = {
            "productID": 1,
            "accountID": 1,
            "rating": 3,
            "comment": "Okay"
        }
        create_response = requests.post(f"{BASE_URL}/product-review", json=review_data)
        review_id = create_response.json()["data"]["ReviewID"]
        
        # Update it
        update_data = {
            "rating": 5,
            "comment": "Actually great!"
        }
        response = requests.patch(f"{BASE_URL}/product-review/{review_id}", json=update_data)
        data = response.json()
        
        assert response.status_code == 200
        assert data["success"] == True
    
    def test_delete_product_review(self):
        """Test DELETE /api/reviews/product-review/:id"""
        # Create review
        review_data = {
            "productID": 1,
            "accountID": 1,
            "rating": 2,
            "comment": "Not great"
        }
        create_response = requests.post(f"{BASE_URL}/product-review", json=review_data)
        review_id = create_response.json()["data"]["ReviewID"]
        
        # Delete it
        response = requests.delete(f"{BASE_URL}/product-review/{review_id}")
        data = response.json()
        
        assert response.status_code == 200
        assert data["success"] == True

class TestRentalReviews:
    """Test Rental Review operations"""
    
    def test_create_rental_review(self):
        """Test POST /api/reviews/rental-review"""
        review_data = {
            "rentalID": 1,
            "accountID": 1,
            "rating": 5,
            "comment": "Great rental!"
        }
        
        response = requests.post(f"{BASE_URL}/rental-review", json=review_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
    
    def test_get_all_rental_reviews(self):
        """Test GET /api/reviews/rental-review"""
        response = requests.get(f"{BASE_URL}/rental-review")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True

class TestServiceReviews:
    """Test Service Review operations"""
    
    def test_create_service_review(self):
        """Test POST /api/reviews/service-review"""
        review_data = {
            "serviceID": 1,
            "accountID": 1,
            "rating": 4,
            "comment": "Good service"
        }
        
        response = requests.post(f"{BASE_URL}/service-review", json=review_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
    
    def test_get_all_service_reviews(self):
        """Test GET /api/reviews/service-review"""
        response = requests.get(f"{BASE_URL}/service-review")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True