"""
Example requests for WorkSpace AI Backend testing.

Demonstrates API usage with sample base64 images and expected responses.
"""
import base64
import json
import requests
from typing import Dict, Any

# Base API URL
BASE_URL = "http://localhost:8000"

def create_dummy_base64_image(width: int = 100, height: int = 100) -> str:
    """Create a simple dummy base64 image for testing."""
    # Create a simple 1x1 pixel PNG (red pixel)
    # This is just for testing API structure
    dummy_png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    return dummy_png

def example_face_analysis_request():
    """Example face analysis API request."""
    
    request_data = {
        "user_id": "user_12345",
        "session_id": "session_abcde",
        "frame_data": create_dummy_base64_image()
    }
    
    print("=== Face Analysis Request ===")
    print(f"POST {BASE_URL}/api/v1/analyze-face")
    print("Content-Type: application/json")
    print(json.dumps(request_data, indent=2))
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/analyze-face",
            json=request_data,
            timeout=30
        )
        
        print(f"\nResponse Status: {response.status_code}")
        print("Response Body:")
        print(json.dumps(response.json(), indent=2))
        
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        print("Make sure the server is running on localhost:8000")

def example_screen_analysis_request():
    """Example screen analysis API request."""
    
    request_data = {
        "user_id": "user_12345",
        "session_id": "session_abcde",
        "screenshot_data": create_dummy_base64_image()
    }
    
    print("\n=== Screen Analysis Request ===")
    print(f"POST {BASE_URL}/api/v1/analyze-screen")
    print("Content-Type: application/json")
    print(json.dumps(request_data, indent=2))
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/analyze-screen",
            json=request_data,
            timeout=30
        )
        
        print(f"\nResponse Status: {response.status_code}")
        print("Response Body:")
        print(json.dumps(response.json(), indent=2))
        
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        print("Make sure the server is running on localhost:8000")

def example_health_check():
    """Example health check request."""
    
    print("\n=== Health Check Request ===")
    print(f"GET {BASE_URL}/health")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        
        print(f"\nResponse Status: {response.status_code}")
        print("Response Body:")
        print(json.dumps(response.json(), indent=2))
        
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

def example_privacy_info():
    """Example privacy information request."""
    
    print("\n=== Privacy Information Request ===")
    print(f"GET {BASE_URL}/privacy")
    
    try:
        response = requests.get(f"{BASE_URL}/privacy", timeout=10)
        
        print(f"\nResponse Status: {response.status_code}")
        print("Response Body:")
        print(json.dumps(response.json(), indent=2))
        
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

def example_batch_requests():
    """Example of sending multiple requests for ML training data."""
    
    print("\n=== Batch Requests for ML Training ===")
    
    # Simulate a user session with multiple events
    user_id = "ml_training_user"
    session_id = "training_session_001"
    
    events = [
        {"type": "face", "description": "User starting work - alert"},
        {"type": "screen", "description": "Opening IDE - coding"},
        {"type": "face", "description": "Focused coding - high attention"},
        {"type": "screen", "description": "Documentation research"},
        {"type": "face", "description": "Showing fatigue signs"},
        {"type": "screen", "description": "Social media distraction"},
    ]
    
    for i, event in enumerate(events):
        print(f"\n--- Event {i+1}: {event['description']} ---")
        
        if event["type"] == "face":
            request_data = {
                "user_id": user_id,
                "session_id": session_id,
                "frame_data": create_dummy_base64_image()
            }
            endpoint = f"{BASE_URL}/api/v1/analyze-face"
        else:
            request_data = {
                "user_id": user_id,
                "session_id": session_id,
                "screenshot_data": create_dummy_base64_image()
            }
            endpoint = f"{BASE_URL}/api/v1/analyze-screen"
        
        try:
            response = requests.post(endpoint, json=request_data, timeout=30)
            if response.status_code == 200:
                result = response.json()
                content_type = result.get('content_type', 'N/A')
                fatigue_score = result.get('fatigue_score', 'N/A')
                if 'content_type' in result:
                    print(f"✓ Success: {content_type}")
                else:
                    print(f"✓ Success: Fatigue: {fatigue_score}")
            else:
                print(f"✗ Error: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"✗ Request failed: {e}")

def example_error_handling():
    """Example of error handling with invalid requests."""
    
    print("\n=== Error Handling Examples ===")
    
    # Invalid base64 data
    print("\n--- Invalid Base64 Data ---")
    invalid_request = {
        "user_id": "test_user",
        "session_id": "test_session",
        "frame_data": "invalid_base64_data_123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/analyze-face",
            json=invalid_request,
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        print("Response:", json.dumps(response.json(), indent=2))
        
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
    
    # Missing required fields
    print("\n--- Missing Required Fields ---")
    incomplete_request = {
        "user_id": "test_user"
        # Missing session_id and frame_data
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/analyze-face",
            json=incomplete_request,
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        print("Response:", json.dumps(response.json(), indent=2))
        
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    """Run all example requests."""
    
    print("WorkSpace AI Backend - Example API Requests")
    print("=" * 50)
    
    # Basic API checks
    example_health_check()
    example_privacy_info()
    
    # Main functionality
    example_face_analysis_request()
    example_screen_analysis_request()
    
    # Advanced usage
    example_batch_requests()
    example_error_handling()
    
    print("\n" + "=" * 50)
    print("Example requests completed!")
    print("\nNext steps:")
    print("1. Start MongoDB: mongod")
    print("2. Start the API: python -m app.main")
    print("3. Run this script: python example_requests.py")
    print("4. Check MongoDB for stored behavioral data")
