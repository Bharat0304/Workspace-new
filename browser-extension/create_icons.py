#!/usr/bin/env python3
"""
Create simple placeholder icons for the WorkSpace AI extension.
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, color, text):
    """Create a simple icon with text."""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw rounded rectangle background
    margin = size // 8
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=size // 6,
        fill=color
    )
    
    # Add text if it fits
    try:
        font_size = size // 3
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    # Draw text
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    text_x = (size - text_width) // 2
    text_y = (size - text_height) // 2
    draw.text((text_x, text_y), text, fill='white', font=font)
    
    return img

def main():
    """Create all required icon sizes."""
    icons_dir = '/Users/user/bharat/workspace/browser-extension/icons'
    os.makedirs(icons_dir, exist_ok=True)
    
    # Define colors and sizes
    primary_color = (99, 102, 241)  # Blue-purple
    
    # Create icons
    icons = [
        (16, 'W'),  # 16x16 - just 'W' for WorkSpace
        (48, 'WS'), # 48x48 - 'WS' for WorkSpace
        (128, 'AI') # 128x128 - 'AI' for AI Assistant
    ]
    
    for size, text in icons:
        icon = create_icon(size, primary_color, text)
        filename = f'icon{size}.png'
        filepath = os.path.join(icons_dir, filename)
        icon.save(filepath, 'PNG')
        print(f'Created {filename}')
    
    print(f'Icons created in {icons_dir}')

if __name__ == '__main__':
    main()
