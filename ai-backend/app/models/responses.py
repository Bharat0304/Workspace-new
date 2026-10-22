"""
Response models for WorkSpace AI Backend.

This module defines Pydantic models for all API responses,
ensuring consistent and type-safe output formatting.
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime


class BaseResponse(BaseModel):
    """Base model for all responses."""
    success: bool = Field(..., description="Request success status")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


class AnalysisResult(BaseModel):
    """Standard analysis result structure."""
    content_type: str = Field(..., description="Content classification: educational, neutral, high_distraction")
    distraction_score: float = Field(..., ge=0, le=100, description="Distraction score (0-100)")
    focus_score: Optional[float] = Field(None, ge=0, le=100, description="Focus score (0-100)")
    fatigue_score: Optional[float] = Field(None, ge=0, le=100, description="Fatigue score (0-100)")
    detected_indicators: List[str] = Field(default_factory=list, description="List of detected indicators")


class ScreenAnalysisResponse(BaseResponse):
    """Response model for screen analysis."""
    analysis_type: str = Field("screen", description="Type of analysis performed")
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    result: AnalysisResult


class FocusAnalysisResponse(BaseResponse):
    """Response model for focus analysis."""
    analysis_type: str = Field("focus", description="Type of analysis performed")
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    result: AnalysisResult


class TabAnalysisResult(AnalysisResult):
    """Extended analysis result for tab analysis."""
    is_distraction: bool = Field(..., description="Whether content is distracting")
    severity: str = Field(..., description="Severity level: low, medium, high, critical")
    site_name: str = Field(..., description="Site/domain name")
    warning_level: str = Field(..., description="Warning level: none, low, medium, high")
    recommended_action: str = Field(..., description="Recommended action: none, show_banner, show_overlay, close_tab")


class TabAnalysisResponse(BaseResponse):
    """Response model for tab analysis."""
    analysis_type: str = Field("browser_tab", description="Type of analysis performed")
    result: TabAnalysisResult


class PostureAnalysisResult(BaseModel):
    """Posture analysis specific result."""
    posture_status: str = Field(..., description="Posture status: good, ok, poor")
    analysis_timestamp: str = Field(..., description="When analysis was performed")
    recommendations: List[str] = Field(default_factory=list, description="Posture recommendations")


class PostureAnalysisResponse(BaseResponse):
    """Response model for posture analysis."""
    analysis_type: str = Field("posture", description="Type of analysis performed")
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    result: PostureAnalysisResult


class SessionData(BaseModel):
    """Session data structure."""
    id: str
    user_id: str
    subject: str
    goal_minutes: Optional[int]
    status: str
    start_time: str
    end_time: Optional[str]
    average_focus: float
    scores: List[float]
    timeline: Optional[List[Dict[str, Any]]]
    sites: Optional[List[Dict[str, Any]]]


class SessionStartResponse(BaseResponse):
    """Response model for session start."""
    data: Dict[str, SessionData] = Field(..., description="Session data")


class SessionGetResponse(BaseResponse):
    """Response model for getting a session."""
    data: Dict[str, SessionData] = Field(..., description="Session data")


class SessionEndResponse(BaseResponse):
    """Response model for session end."""
    data: Dict[str, SessionData] = Field(..., description="Updated session data")


class UserSessionsResponse(BaseResponse):
    """Response model for user sessions."""
    data: Dict[str, List[SessionData]] = Field(..., description="User sessions list")


class FocusSessionResponse(BaseResponse):
    """Response model for current focus session."""
    session_active: bool
    session_start: Optional[str]
    elapsed_minutes: int
    target_minutes: int
    distractions_blocked: int
    productivity_score: float


class LastEduUrlResponse(BaseResponse):
    """Response model for last educational URL."""
    url: str


class ExtensionStats(BaseModel):
    """Extension statistics."""
    blocked_today: int
    focus_time_minutes: int
    distractions_prevented: int
    most_blocked_site: str
    focus_sessions: int


class ExtensionSettings(BaseModel):
    """Extension settings."""
    warning_delay: int
    block_delay: int
    close_delay: int
    notifications_enabled: bool


class ExtensionStatusResponse(BaseResponse):
    """Response model for extension status."""
    enabled: bool
    focus_mode: bool
    blocked_sites: List[str]
    stats: ExtensionStats
    settings: ExtensionSettings


class ExtensionStatsUpdateResponse(BaseResponse):
    """Response model for extension stats update."""
    action_recorded: str
    message: Optional[str]


class BlockSiteResponse(BaseResponse):
    """Response model for site blocking."""
    message: str
    blocked_site: str
    duration_seconds: int


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "ok"
    python: bool = True
    time: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


class ErrorResponse(BaseModel):
    """Error response model."""
    success: bool = False
    error: str
    error_type: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


class TestExtensionResponse(BaseResponse):
    """Response model for extension testing."""
    test_results: List[Dict[str, Any]]
    backend_status: str


class LastTabResponse(BaseResponse):
    """Response model for last tab analysis."""
    result: Dict[str, Any]


class SimulateBlockResponse(BaseResponse):
    """Response model for block simulation."""
    message: str
    result: Dict[str, Any]


class VoiceAssistantResponse(BaseModel):
    """Response model for intelligent AI assistant."""
    success: bool = Field(..., description="Request success status")
    response: str = Field(..., description="AI assistant response")
    action: Optional[str] = Field(None, description="Action taken by AI")
    motivation: Optional[str] = Field(None, description="Motivational message")
    user_state: Optional[str] = Field(None, description="Current user state")
    insights: Optional[List[str]] = Field(default_factory=list, description="Insights and recommendations")
    recommendations: Optional[List[str]] = Field(default_factory=list, description="Actionable recommendations")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
