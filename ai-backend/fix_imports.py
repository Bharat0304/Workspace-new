#!/usr/bin/env python3
"""
Fix import issues in all route files.
"""

import os
import re

def fix_imports_in_file(file_path):
    """Fix relative imports to absolute imports."""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Replace relative imports with absolute imports
        old_patterns = [
            (r'from \.\.models\.', 'from app.models.'),
            (r'from \.\.services\.', 'from app.services.'),
            (r'from \.\.core\.', 'from app.core.'),
            (r'from \.\.utils\.', 'from app.utils.'),
        ]
        
        for old_pattern, new_pattern in old_patterns:
            content = re.sub(old_pattern, new_pattern, content)
        
        with open(file_path, 'w') as f:
            f.write(content)
        
        print(f"✅ Fixed imports in {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")
        return False

def main():
    """Fix all import issues."""
    routes_dir = "/Users/user/bharat/workspace/ai-backend/app/api/routes"
    
    route_files = [
        "analyze_focus.py",
        "analyze_tab.py", 
        "analyze_posture.py",
        "session.py",
        "metrics.py"
    ]
    
    for route_file in route_files:
        file_path = os.path.join(routes_dir, route_file)
        if os.path.exists(file_path):
            fix_imports_in_file(file_path)
        else:
            print(f"⚠️ File not found: {file_path}")

if __name__ == "__main__":
    main()
