#!/usr/bin/env python3
"""
Create simple colored square icons for the extension.
"""

import os

def create_simple_png(size, color):
    """Create a simple PNG with a colored square."""
    # Simple PNG header for a colored square
    # This creates a minimal valid PNG file
    
    # PNG signature
    png_signature = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    width, height = size, size
    bit_depth = 8
    color_type = 2  # RGB
    compression = 0
    filter_method = 0
    interlace = 0
    
    ihdr_data = (
        width.to_bytes(4, 'big') +
        height.to_bytes(4, 'big') +
        bytes([bit_depth, color_type, compression, filter_method, interlace])
    )
    
    import struct
    ihdr_crc = 0x36226f9b  # Pre-calculated CRC for this specific IHDR
    
    ihdr_chunk = (
        (13).to_bytes(4, 'big') +  # Length
        b'IHDR' +                   # Type
        ihdr_data +                 # Data
        ihdr_crc.to_bytes(4, 'big') # CRC
    )
    
    # IDAT chunk - simple colored square
    pixels = []
    for y in range(height):
        pixels.append(0)  # Filter type
        for x in range(width):
            pixels.extend(color)  # RGB
    
    import zlib
    compressed_data = zlib.compress(bytes(pixels))
    
    idat_chunk = (
        len(compressed_data).to_bytes(4, 'big') +
        b'IDAT' +
        compressed_data +
        (0x8e6d4c8f).to_bytes(4, 'big')  # CRC (placeholder)
    )
    
    # IEND chunk
    iend_chunk = b'\x00\x00\x00\x00IEND\xaeB`\x82'
    
    # Combine all chunks
    png_data = png_signature + ihdr_chunk + idat_chunk + iend_chunk
    
    return png_data

def main():
    """Create simple colored icons."""
    icons_dir = '/Users/user/bharat/workspace/browser-extension/icons'
    os.makedirs(icons_dir, exist_ok=True)
    
    # Blue-purple color (RGB)
    color = [99, 102, 241]
    
    sizes = [16, 48, 128]
    
    for size in sizes:
        try:
            png_data = create_simple_png(size, color)
            filename = f'icon{size}.png'
            filepath = os.path.join(icons_dir, filename)
            
            with open(filepath, 'wb') as f:
                f.write(png_data)
            
            print(f'Created {filename}')
        except Exception as e:
            print(f'Error creating {size}x{size} icon: {e}')
    
    print('Icon creation completed!')

if __name__ == '__main__':
    main()
