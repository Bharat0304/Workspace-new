"""
Request models for WorkSpace AI Backend.

This module defines Pydantic models for all incoming API requests,
ensuring type safety and validation.
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, validator


class BaseRequest(BaseModel):
    """Base model for all requests."""
    user_id: Optional[str] = None
    session_id: Optional[str] = None


class VoiceCommandRequest(BaseModel):
    """Request model for voice command processing."""
    command: str = Field(..., description="Voice command to process")
    user_context: Optional[Dict[str, Any]] = Field(None, description="Current user context data")


class ScreenAnalyzeRequest(BaseModel):
    """Request model for screen analysis."""
    screenshot_data: str = Field(..., description="Base64 encoded screenshot data")
    
    @validator('screenshot_data')
    def validate_base64(cls, v):
        """Validate that screenshot_data is a valid base64 string."""
        if not v:
            raise ValueError('screenshot_data cannot be empty')
        # Basic validation - should start with data:image/ or be base64 string
        if not (v.startswith('data:image/') or len(v) > 100):
            raise ValueError('Invalid screenshot_data format')
        return v


class FocusAnalyzeRequest(BaseModel):
    """Request model for focus analysis."""
    frame_data: str = Field(..., description="Base64 encoded frame data")
    
    @validator('frame_data')
    def validate_base64(cls, v):
        """Validate that frame_data is a valid base64 string."""
        if not v:
            raise ValueError('frame_data cannot be empty')
        return v


class TabAnalyzeRequest(BaseModel):
    """Request model for tab analysis."""
    url: str = Field(..., description="Tab URL")
    title: Optional[str] = Field(None, description="Tab title")
    timestamp: Optional[int] = Field(None, description="Unix timestamp")


class PostureAnalyzeRequest(BaseModel):
    """Request model for posture analysis."""
    frame_data: str = Field(..., description="Base64 encoded frame data")


class SessionStartRequest(BaseModel):
    """Request model for starting a session."""
    subject: str = Field(..., description="Study subject")
    goal_minutes: Optional[int] = Field(None, ge=1, le=480, description="Goal in minutes (1-480)")
    user_id: Optional[str] = None


class SessionEndRequest(BaseModel):
    """Request model for ending a session."""
    session_id: str = Field(..., description="Session ID")
    average_focus: Optional[float] = Field(None, ge=0, le=100, description="Average focus score (0-100)")
    scores: Optional[List[float]] = Field(None, description="List of focus scores over time")
    timeline: Optional[List[Dict[str, Any]]] = Field(None, description="Timeline of events")
    sites: Optional[List[Dict[str, Any]]] = Field(None, description="Visited sites data")
    user_id: Optional[str] = None


class SessionGetRequest(BaseModel):
    """Request model for getting session data."""
    user_id: Optional[str] = None


class ExtensionStatsRequest(BaseModel):
    """Request model for extension statistics."""
    action: str = Field(..., description="Action type")
    site: Optional[str] = Field(None, description="Site domain")
    duration: Optional[int] = Field(None, ge=0, description="Duration in seconds")
    
    @validator('action')
    def validate_action(cls, v):
        """Validate action type."""
        valid_actions = ['block_site', 'unblock_site', 'continue_work', 'take_break', 'session_start', 'session_end']
        if v not in valid_actions:
            raise ValueError(f'Invalid action: {v}')
        return v


class BlockSiteRequest(BaseModel):
    """Request model for manual site blocking."""
    site: str = Field(..., description="Site to block")
    duration: Optional[int] = Field(3600, ge=60, le=86400, description="Block duration in seconds")
    
    @validator('site')
    def validate_site(cls, v):
        """Validate site format."""
        if not v:
            raise ValueError('Site cannot be empty')
        return v


class LastEduUrlRequest(BaseModel):
    """Request model for setting last educational URL."""
    url: str = Field(..., description="Educational URL")
    
    @validator('url')
    def validate_url(cls, v):
        """Validate URL format."""
        if not v:
            raise ValueError('URL cannot be empty')
        if not (v.startswith('http://') or v.startswith('https://')):
            raise ValueError('URL must start with http:// or https://')
        return v


class SimulateBlockRequest(BaseModel):
    """Request model for simulating block for testing."""
    site: str = Field("example.com", description="Site to simulate blocking for")
