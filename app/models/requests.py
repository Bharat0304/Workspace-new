"""
Pydantic models for API requests.

Privacy-safe request models with validation for behavioral signal collection.
"""
from pydantic import BaseModel, Field, validator
from typing import Optional
import base64
import re
from ..core.config import settings

class FaceAnalysisRequest(BaseModel):
    """
    Request model for face frame analysis.
    
    Privacy: Frame data is processed in memory only, never stored.
    """
    user_id: str = Field(..., description="Unique user identifier")
    session_id: str = Field(..., description="Session identifier for grouping events")
    frame_data: str = Field(..., description="Base64 encoded image frame")
    
    @validator('frame_data')
    def validate_base64(cls, v):
        """Validate base64 image data."""
        try:
            # Remove data URL prefix if present
            if v.startswith('data:image'):
                v = v.split(',')[1]
            
            # Decode to validate format
            decoded = base64.b64decode(v)
            
            # Check size limit for privacy/security
            if len(decoded) > settings.max_image_size:
                raise ValueError(f"Image size exceeds limit of {settings.max_image_size} bytes")
            
            return v
        except Exception as e:
            raise ValueError(f"Invalid base64 image data: {str(e)}")
    
    @validator('user_id', 'session_id')
    def validate_ids(cls, v):
        """Validate user and session IDs."""
        if not v or len(v.strip()) == 0:
            raise ValueError("ID cannot be empty")
        if len(v) > 100:
            raise ValueError("ID too long (max 100 characters)")
        return v.strip()

class ScreenAnalysisRequest(BaseModel):
    """
    Request model for screenshot analysis.
    
    Privacy: Screenshot data is processed in memory only, never stored.
    """
    user_id: str = Field(..., description="Unique user identifier")
    session_id: str = Field(..., description="Session identifier for grouping events")
    screenshot_data: str = Field(..., description="Base64 encoded screenshot")
    
    @validator('screenshot_data')
    def validate_base64(cls, v):
        """Validate base64 image data."""
        try:
            # Remove data URL prefix if present
            if v.startswith('data:image'):
                v = v.split(',')[1]
            
            # Decode to validate format
            decoded = base64.b64decode(v)
            
            # Check size limit for privacy/security
            if len(decoded) > settings.max_image_size:
                raise ValueError(f"Image size exceeds limit of {settings.max_image_size} bytes")
            
            return v
        except Exception as e:
            raise ValueError(f"Invalid base64 image data: {str(e)}")
    
    @validator('user_id', 'session_id')
    def validate_ids(cls, v):
        """Validate user and session IDs."""
        if not v or len(v.strip()) == 0:
            raise ValueError("ID cannot be empty")
        if len(v) > 100:
            raise ValueError("ID too long (max 100 characters)")
        return v.strip()
