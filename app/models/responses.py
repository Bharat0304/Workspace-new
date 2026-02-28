"""
Pydantic models for API responses.

Structured response models for behavioral signal analysis results.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class GazeDirection(str, Enum):
    """Gaze direction enumeration."""
    LEFT = "left"
    RIGHT = "right"
    CENTER = "center"
    UNKNOWN = "unknown"

class ContentType(str, Enum):
    """Content type enumeration for screen analysis."""
    EDUCATIONAL = "educational"
    CODING = "coding"
    DOCUMENTATION = "documentation"
    ENTERTAINMENT = "entertainment"
    UNKNOWN = "unknown"

class FaceAnalysisResponse(BaseModel):
    """
    Response model for face analysis results.
    
    ML Relevance: These features are key for productivity modeling:
    - blink_rate: Indicator of fatigue and engagement
    - gaze_direction: Focus and attention patterns
    - head_tilt: Posture and engagement level
    - fatigue_score: Overall cognitive state
    """
    face_present: bool = Field(..., description="Whether a face was detected")
    blink_rate: float = Field(..., ge=0, le=1, description="Eye aspect ratio (0-1)")
    gaze_direction: GazeDirection = Field(..., description="Direction of gaze")
    head_tilt: float = Field(..., description="Head tilt angle in degrees")
    fatigue_score: float = Field(..., ge=0, le=1, description="Estimated fatigue level")
    processing_time_ms: Optional[float] = Field(None, description="Processing time in milliseconds")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Analysis timestamp")

class ScreenAnalysisResponse(BaseModel):
    """
    Response model for screen analysis results.
    
    ML Relevance: These features help classify productivity patterns:
    - content_type: Activity categorization
    - text_density: Information load indicator
    - has_code: Development activity detection
    - distraction_score: Potential productivity disruption
    """
    content_type: ContentType = Field(..., description="Detected content category")
    text_density: float = Field(..., ge=0, le=1, description="Text density score (0-1)")
    has_code: bool = Field(..., description="Whether code patterns were detected")
    has_social_indicator: bool = Field(..., description="Social media presence detected")
    distraction_score: float = Field(..., ge=0, le=100, description="Distraction potential score")
    processing_time_ms: Optional[float] = Field(None, description="Processing time in milliseconds")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Analysis timestamp")

class HealthResponse(BaseModel):
    """Health check response."""
    status: str = Field(default="healthy", description="Service health status")
    mongodb_connected: bool = Field(..., description="MongoDB connection status")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Health check timestamp")

class ErrorResponse(BaseModel):
    """Standard error response."""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Additional error details")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Error timestamp")
