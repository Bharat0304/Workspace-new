#!/usr/bin/env python3
"""
Simple test script for WorkSpace AI Backend.
Tests basic functionality without complex imports.
"""

import sys
import os
import requests
import json
import time
from pathlib import Path

# Add app directory to Python path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

def test_health_endpoint():
    """Test the health endpoint."""
    print("🔍 Testing health endpoint...")
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server - is it running?")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_root_endpoint():
    """Test the root endpoint."""
    print("🔍 Testing root endpoint...")
    
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root endpoint passed: {data}")
            return True
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
        return False

def test_cors_headers():
    """Test CORS headers."""
    print("🔍 Testing CORS headers...")
    
    try:
        headers = {"Origin": "http://localhost:3000"}
        response = requests.options("http://localhost:8000/health", headers=headers, timeout=5)
        
        cors_headers = {
            "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
            "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
            "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
        }
        
        print(f"✅ CORS headers: {cors_headers}")
        return True
        
    except Exception as e:
        print(f"❌ CORS test error: {e}")
        return False

def test_screen_analysis():
    """Test screen analysis endpoint."""
    print("🔍 Testing screen analysis...")
    
    # Create a simple test image (1x1 PNG)
    test_image_data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    
    payload = {
        "screenshot_data": f"data:image/png;base64,{test_image_data}",
        "user_id": "test_user",
        "session_id": "test_session"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/analyze/screen",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Screen analysis passed: {data.get('success', False)}")
            if data.get('result'):
                result = data['result']
                print(f"   Content type: {result.get('content_type')}")
                print(f"   Distraction score: {result.get('distraction_score')}")
            return True
        else:
            print(f"❌ Screen analysis failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Screen analysis error: {e}")
        return False

def test_tab_analysis():
    """Test tab analysis endpoint."""
    print("🔍 Testing tab analysis...")
    
    payload = {
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "title": "Educational Programming Tutorial"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/analyze/tab",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Tab analysis passed: {data.get('success', False)}")
            if data.get('result'):
                result = data['result']
                print(f"   Content type: {result.get('content_type')}")
                print(f"   Distraction score: {result.get('distraction_score')}")
                print(f"   Recommended action: {result.get('recommended_action')}")
            return True
        else:
            print(f"❌ Tab analysis failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Tab analysis error: {e}")
        return False

def main():
    """Run all tests."""
    print("🚀 Starting WorkSpace AI Backend Tests")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_endpoint),
        ("Root Endpoint", test_root_endpoint),
        ("CORS Headers", test_cors_headers),
        ("Screen Analysis", test_screen_analysis),
        ("Tab Analysis", test_tab_analysis),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 Running: {test_name}")
        try:
            if test_func():
                passed += 1
            time.sleep(1)  # Small delay between tests
        except Exception as e:
            print(f"❌ Test '{test_name}' crashed: {e}")
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"Passed: {passed}/{total}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("🎉 All tests passed! Backend is working correctly.")
        return True
    else:
        print("⚠️ Some tests failed. Check the logs above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
