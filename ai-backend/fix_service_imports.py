#!/usr/bin/env python3
"""
Fix import issues in service files.
"""

import os
import re

def fix_service_imports():
    """Fix imports in service files."""
    services_dir = "/Users/user/bharat/workspace/ai-backend/app/services"
    
    service_files = [
        "screen_service.py",
        "focus_service.py",
        "tab_service.py",
        "posture_service.py",
        "session_service.py"
    ]
    
    for service_file in service_files:
        file_path = os.path.join(services_dir, service_file)
        try:
            with open(file_path, 'r') as f:
                content = f.read()
            
            # Replace relative imports
            content = re.sub(r'from \.\.models\.', 'from app.models.', content)
            content = re.sub(r'from \.\.core\.', 'from app.core.', content)
            content = re.sub(r'from \.\.utils\.', 'from app.utils.', content)
            
            with open(file_path, 'w') as f:
                f.write(content)
            
            print(f"✅ Fixed imports in {service_file}")
            
        except Exception as e:
            print(f"❌ Error fixing {service_file}: {e}")

if __name__ == "__main__":
    fix_service_imports()
