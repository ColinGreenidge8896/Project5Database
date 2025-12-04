"""Integration tests for Ghost Diagnostics team routes"""
import requests
import pytest
import time

BASE_URL = "http://localhost:3000/api/ghostDiagnostics"

class TestInquiryForm:
    """Test InquiryForm CRUD operations"""
    
    def test_create_inquiry_form(self):
        """Test POST /api/ghostDiagnostics/inquiry-form"""
        form_data = {
            "accountID": 1,
            "description": "Strange noises in the attic at night"
        }
        
        response = requests.post(f"{BASE_URL}/inquiry-form", json=form_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "inquiryFormID" in data["data"]
    
    def test_create_inquiry_form_missing_accountid(self):
        """Test POST /api/ghostDiagnostics/inquiry-form without accountID"""
        form_data = {
            "description": "Test inquiry"
        }
        
        response = requests.post(f"{BASE_URL}/inquiry-form", json=form_data)
        data = response.json()
        
        assert data["success"] == False
        assert "Missing accountID" in data["message"]
    
    def test_get_all_inquiry_forms(self):
        """Test GET /api/ghostDiagnostics/inquiry-form"""
        response = requests.get(f"{BASE_URL}/inquiry-form")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert isinstance(data["data"], list)
    
    def test_get_inquiry_form_by_id(self):
        """Test GET /api/ghostDiagnostics/inquiry-form/:id"""
        # Create form first
        form_data = {
            "accountID": 1,
            "description": "Test for GET by ID"
        }
        create_response = requests.post(f"{BASE_URL}/inquiry-form", json=form_data)
        form_id = create_response.json()["data"]["inquiryFormID"]
        
        # Get it
        response = requests.get(f"{BASE_URL}/inquiry-form/{form_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["data"]["InquiryFormID"] == form_id
    
    def test_get_inquiry_form_not_found(self):
        """Test GET /api/ghostDiagnostics/inquiry-form/:id with non-existent ID"""
        response = requests.get(f"{BASE_URL}/inquiry-form/999999")
        data = response.json()
        
        assert data["success"] == False
        assert "not found" in data["message"].lower()
    
    def test_update_inquiry_form(self):
        """Test PATCH /api/ghostDiagnostics/inquiry-form/:id"""
        # Create form
        form_data = {
            "accountID": 1,
            "description": "Original description"
        }
        create_response = requests.post(f"{BASE_URL}/inquiry-form", json=form_data)
        form_id = create_response.json()["data"]["inquiryFormID"]
        
        # Update it
        update_data = {
            "description": "Updated: More details about the haunting"
        }
        response = requests.patch(f"{BASE_URL}/inquiry-form/{form_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
    
    def test_delete_inquiry_form(self):
        """Test DELETE /api/ghostDiagnostics/inquiry-form/:id"""
        # Create form
        form_data = {
            "accountID": 1,
            "description": "Form to delete"
        }
        create_response = requests.post(f"{BASE_URL}/inquiry-form", json=form_data)
        form_id = create_response.json()["data"]["inquiryFormID"]
        
        # Delete it
        response = requests.delete(f"{BASE_URL}/inquiry-form/{form_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "deleted" in data["message"].lower()

class TestInquiryFormResponse:
    """Test InquiryFormResponse CRUD operations"""
    
    def test_create_inquiry_form_response(self):
        """Test POST /api/ghostDiagnostics/inquiry-form-response"""
        response_data = {
            "inquiryFormID": 1,
            "ghostID": 1,
            "description": "Class IV full-torso apparition detected"
        }
        
        response = requests.post(f"{BASE_URL}/inquiry-form-response", json=response_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
    
    def test_create_response_missing_fields(self):
        """Test POST /api/ghostDiagnostics/inquiry-form-response without required fields"""
        response_data = {
            "description": "Missing IDs"
        }
        
        response = requests.post(f"{BASE_URL}/inquiry-form-response", json=response_data)
        data = response.json()
        
        assert data["success"] == False
        assert "Missing required fields" in data["message"]
    
    def test_get_all_inquiry_form_responses(self):
        """Test GET /api/ghostDiagnostics/inquiry-form-response"""
        response = requests.get(f"{BASE_URL}/inquiry-form-response")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert isinstance(data["data"], list)
    
    def test_get_inquiry_form_response_by_id(self):
        """Test GET /api/ghostDiagnostics/inquiry-form-response/:id"""
        # Create response first
        response_data = {
            "inquiryFormID": 1,
            "ghostID": 1,
            "description": "Test response for GET"
        }
        create_response = requests.post(f"{BASE_URL}/inquiry-form-response", json=response_data)
        response_id = create_response.json()["data"]["inquiryFormResponseID"]
        
        # Get it
        response = requests.get(f"{BASE_URL}/inquiry-form-response/{response_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
    
    def test_update_inquiry_form_response(self):
        """Test PATCH /api/ghostDiagnostics/inquiry-form-response/:id"""
        # Create response
        response_data = {
            "inquiryFormID": 1,
            "ghostID": 1,
            "description": "Initial assessment"
        }
        create_response = requests.post(f"{BASE_URL}/inquiry-form-response", json=response_data)
        response_id = create_response.json()["data"]["inquiryFormResponseID"]
        
        # Update it
        update_data = {
            "description": "Updated: Further investigation needed",
            "ghostID": 2
        }
        response = requests.patch(f"{BASE_URL}/inquiry-form-response/{response_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
    
    def test_delete_inquiry_form_response(self):
        """Test DELETE /api/ghostDiagnostics/inquiry-form-response/:id"""
        # Create response
        response_data = {
            "inquiryFormID": 1,
            "ghostID": 1,
            "description": "Response to delete"
        }
        create_response = requests.post(f"{BASE_URL}/inquiry-form-response", json=response_data)
        response_id = create_response.json()["data"]["inquiryFormResponseID"]
        
        # Delete it
        response = requests.delete(f"{BASE_URL}/inquiry-form-response/{response_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True

class TestChosenTrait:
    """Test ChosenTrait operations"""
    
    def test_create_chosen_trait(self):
        """Test POST /api/ghostDiagnostics/chosen-trait"""
        trait_data = {
            "inquiryFormID": 1,
            "traitID": 1
        }
        
        response = requests.post(f"{BASE_URL}/chosen-trait", json=trait_data)
        
        # May succeed or fail depending on if form/trait exist
        assert response.status_code == 200
    
    def test_create_chosen_trait_missing_fields(self):
        """Test POST /api/ghostDiagnostics/chosen-trait without required fields"""
        trait_data = {
            "inquiryFormID": 1
        }
        
        response = requests.post(f"{BASE_URL}/chosen-trait", json=trait_data)
        data = response.json()
        
        assert data["success"] == False
        assert "Missing required fields" in data["message"]
    
    def test_get_chosen_traits_for_form(self):
        """Test GET /api/ghostDiagnostics/chosen-trait/form/:id"""
        response = requests.get(f"{BASE_URL}/chosen-trait/form/1")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert isinstance(data["data"], list)
    
    def test_delete_chosen_trait(self):
        """Test DELETE /api/ghostDiagnostics/chosen-trait"""
        # First create a trait
        trait_data = {
            "inquiryFormID": 1,
            "traitID": 2
        }
        requests.post(f"{BASE_URL}/chosen-trait", json=trait_data)
        
        # Delete it
        delete_data = {
            "inquiryFormID": 1,
            "traitID": 2
        }
        response = requests.delete(f"{BASE_URL}/chosen-trait", json=delete_data)
        
        # Should succeed or return "not found"
        assert response.status_code == 200

class TestIdentifyingTrait:
    """Test IdentifyingTrait operations"""
    
    def test_create_identifying_trait(self):
        """Test POST /api/ghostDiagnostics/identifying-trait"""
        trait_data = {
            "ghostID": 1,
            "traitID": 1
        }
        
        response = requests.post(f"{BASE_URL}/identifying-trait", json=trait_data)
        
        assert response.status_code == 200
        data = response.json()
        # May succeed or indicate duplicate
        assert "success" in data
    
    def test_create_identifying_trait_missing_fields(self):
        """Test POST /api/ghostDiagnostics/identifying-trait without required fields"""
        trait_data = {
            "ghostID": 1
        }
        
        response = requests.post(f"{BASE_URL}/identifying-trait", json=trait_data)
        data = response.json()
        
        assert data["success"] == False
        assert "Missing fields" in data["message"]
    
    def test_get_identifying_traits_for_ghost(self):
        """Test GET /api/ghostDiagnostics/identifying-trait/ghost/:id"""
        response = requests.get(f"{BASE_URL}/identifying-trait/ghost/1")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert isinstance(data["data"], list)
    
    def test_delete_identifying_trait(self):
        """Test DELETE /api/ghostDiagnostics/identifying-trait"""
        # First create a trait
        trait_data = {
            "ghostID": 1,
            "traitID": 3
        }
        requests.post(f"{BASE_URL}/identifying-trait", json=trait_data)
        
        # Delete it
        delete_data = {
            "ghostID": 1,
            "traitID": 3
        }
        response = requests.delete(f"{BASE_URL}/identifying-trait", json=delete_data)
        
        # Should succeed or return "not found"
        assert response.status_code == 200

class TestTraitRelationships:
    """Test trait relationships and data integrity"""
    
    def test_chosen_traits_include_trait_details(self):
        """Test that chosen traits endpoint returns trait details"""
        response = requests.get(f"{BASE_URL}/chosen-trait/form/1")
        data = response.json()
        
        if data["success"] and len(data["data"]) > 0:
            # Should include joined trait data
            trait = data["data"][0]
            # Check for either TraitName or traitName (case may vary)
            has_trait_info = "TraitName" in trait or "traitName" in trait
            assert has_trait_info
    
    def test_identifying_traits_include_trait_details(self):
        """Test that identifying traits endpoint returns trait details"""
        response = requests.get(f"{BASE_URL}/identifying-trait/ghost/1")
        data = response.json()
        
        if data["success"] and len(data["data"]) > 0:
            # Should include joined trait data
            trait = data["data"][0]
            # Check for either TraitName or traitName (case may vary)
            has_trait_info = "TraitName" in trait or "traitName" in trait
            assert has_trait_info