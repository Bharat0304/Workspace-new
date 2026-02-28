"""
Configuration settings for WorkSpace AI Backend.

Privacy-focused configuration with security and performance considerations.
"""
from pydantic_settings import BaseSettings
from typing import Optional
import structlog

logger = structlog.get_logger()

class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # MongoDB Configuration
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "workspace_analytics"
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    
    # Privacy and Security Settings
    max_image_size: int = 10485760  # 10MB max image size
    ttl_cache_seconds: int = 60  # In-memory cache TTL
    
    # ML Model Settings
    face_detection_confidence: float = 0.5
    blink_threshold: float = 0.25
    fatigue_threshold: float = 0.7
    
    # Screen Analysis Settings
    text_density_threshold: float = 0.3
    distraction_keywords: list = [
        "facebook", "twitter", "instagram", "youtube", "reddit",
        "tiktok", "linkedin", "netflix", "twitch"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()

# Privacy logging
logger.info(
    "WorkSpace AI Backend initialized",
    privacy_mode=True,
    raw_image_storage=False,
    biometric_data_collection=True,
    mongodb_database=settings.database_name
)
