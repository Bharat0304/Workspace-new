#!/usr/bin/env python3
"""
Test script to verify the extension manifest and files.
"""

import json
import os

def test_extension():
    """Test the extension configuration."""
    extension_dir = '/Users/user/bharat/workspace/browser-extension'
    
    print("🔍 Testing WorkSpace AI Extension...")
    
    # Check manifest.json
    manifest_path = os.path.join(extension_dir, 'manifest.json')
    if not os.path.exists(manifest_path):
        print("❌ manifest.json not found")
        return False
    
    try:
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
        
        print("✅ manifest.json is valid JSON")
        
        # Check required fields
        required_fields = ['name', 'version', 'manifest_version', 'background', 'content_scripts', 'action']
        for field in required_fields:
            if field not in manifest:
                print(f"❌ Missing required field: {field}")
                return False
        
        print("✅ All required manifest fields present")
        
        # Check files referenced in manifest
        files_to_check = [
            manifest['background']['service_worker'],
            manifest['content_scripts'][0]['js'][0],
            manifest['action']['default_popup']
        ]
        
        for file in files_to_check:
            file_path = os.path.join(extension_dir, file)
            if not os.path.exists(file_path):
                print(f"❌ Referenced file not found: {file}")
                return False
        
        print("✅ All referenced files exist")
        
        # Check icons
        if 'icons' in manifest:
            for size, icon_path in manifest['icons'].items():
                full_icon_path = os.path.join(extension_dir, icon_path)
                if not os.path.exists(full_icon_path):
                    print(f"❌ Icon not found: {icon_path}")
                    return False
        
        print("✅ All icons present")
        
        # Check web accessible resources
        if 'web_accessible_resources' in manifest:
            for resource in manifest['web_accessible_resources'][0]['resources']:
                resource_path = os.path.join(extension_dir, resource)
                if not os.path.exists(resource_path):
                    print(f"❌ Web accessible resource not found: {resource}")
                    return False
        
        print("✅ All web accessible resources present")
        
        print("\n🎉 Extension test passed! Ready to install.")
        print("\n📦 Installation Instructions:")
        print("1. Open Chrome and go to chrome://extensions/")
        print("2. Enable 'Developer mode'")
        print("3. Click 'Load unpacked'")
        print("4. Select the browser-extension folder")
        
        return True
        
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in manifest.json: {e}")
        return False
    except Exception as e:
        print(f"❌ Error testing extension: {e}")
        return False

if __name__ == '__main__':
    test_extension()
