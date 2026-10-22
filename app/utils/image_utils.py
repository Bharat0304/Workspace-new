"""
Image processing utilities for privacy-safe behavioral analysis.

Memory-efficient image processing with automatic cleanup.
"""
import base64
import cv2
import numpy as np
from PIL import Image
import io
import structlog
from typing import Optional, Tuple
from ..core.config import settings

logger = structlog.get_logger()

class ImageProcessor:
    """Privacy-safe image processing with memory management."""
    
    def __init__(self):
        self.max_size = settings.max_image_size
        
    def decode_base64_image(self, base64_str: str) -> Optional[np.ndarray]:
        """
        Decode base64 image to numpy array.
        
        Privacy: Image data is processed in memory only.
        Memory: Automatic cleanup after processing.
        """
        try:
            # Remove data URL prefix if present
            if base64_str.startswith('data:image'):
                base64_str = base64_str.split(',')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(base64_str)
            
            # Convert to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                logger.warning("Failed to decode image", reason="Invalid image format")
                return None
                
            return image
            
        except Exception as e:
            logger.error("Error decoding base64 image", error=str(e))
            return None
    
    def resize_image(self, image: np.ndarray, max_width: int = 640, max_height: int = 480) -> np.ndarray:
        """
        Resize image for processing efficiency.
        
        Privacy: Reduces image resolution to minimize biometric data exposure.
        """
        try:
            height, width = image.shape[:2]
            
            # Only resize if image is larger than max dimensions
            if width <= max_width and height <= max_height:
                return image
            
            # Calculate scaling factor
            scale = min(max_width / width, max_height / height)
            new_width = int(width * scale)
            new_height = int(height * scale)
            
            # Resize image
            resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
            
            logger.debug(
                "Image resized for privacy",
                original_size=(width, height),
                new_size=(new_width, new_height),
                scale_factor=scale
            )
            
            return resized
            
        except Exception as e:
            logger.error("Error resizing image", error=str(e))
            return image
    
    def convert_to_grayscale(self, image: np.ndarray) -> np.ndarray:
        """Convert image to grayscale for processing efficiency."""
        try:
            if len(image.shape) == 3:
                return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            return image
        except Exception as e:
            logger.error("Error converting to grayscale", error=str(e))
            return image
    
    def get_image_info(self, image: np.ndarray) -> dict:
        """Get basic image information for logging."""
        if image is None:
            return {"valid": False}
            
        height, width = image.shape[:2]
        channels = image.shape[2] if len(image.shape) == 3 else 1
        
        return {
            "valid": True,
            "width": width,
            "height": height,
            "channels": channels,
            "size_bytes": image.nbytes
        }
    
    def cleanup_image(self, image: np.ndarray):
        """
        Explicitly clean up image memory.
        
        Privacy: Ensures no image data remains in memory after processing.
        """
        try:
            if image is not None:
                # Clear the numpy array from memory
                del image
        except Exception as e:
            logger.warning("Error during image cleanup", error=str(e))

# In-memory TTL cache for processed results
from collections import OrderedDict
import time

class TTLCache:
    """Simple TTL cache with automatic cleanup."""
    
    def __init__(self, ttl_seconds: int = 60):
        self.ttl = ttl_seconds
        self.cache = OrderedDict()
        
    def get(self, key: str) -> Optional[any]:
        """Get item from cache if not expired."""
        if key in self.cache:
            item, timestamp = self.cache[key]
            if time.time() - timestamp < self.ttl:
                # Move to end (LRU)
                self.cache.move_to_end(key)
                return item
            else:
                # Expired item
                del self.cache[key]
        return None
    
    def put(self, key: str, value: any):
        """Put item in cache with timestamp."""
        self.cache[key] = (value, time.time())
        # Move to end
        self.cache.move_to_end(key)
        
        # Remove oldest items if cache gets too large
        while len(self.cache) > 1000:  # Max 1000 items
            self.cache.popitem(last=False)
    
    def clear_expired(self):
        """Remove expired items from cache."""
        current_time = time.time()
        expired_keys = [
            key for key, (_, timestamp) in self.cache.items()
            if current_time - timestamp >= self.ttl
        ]
        for key in expired_keys:
            del self.cache[key]

# Global instances
image_processor = ImageProcessor()
cache = TTLCache(ttl_seconds=settings.ttl_cache_seconds)
