"""
Core configuration module for WorkSpace AI Backend.

This module handles all environment variables, settings, and application configuration.
Uses Pydantic for type-safe configuration management.
"""

from functools import lru_cache
from typing import List, Optional
from pydantic import Field, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application
    app_name: str = "WorkSpace AI Backend"
    app_version: str = "1.0.0"
    debug: bool = False
    python_port: int = 8000
    
    # Database
    mongodb_url: str = "mongodb+srv://kbharat84265:SjgpL1UbSskmfFBO@cluster0.tfyruuc.mongodb.net/workspaceai"
    mongodb_db_name: str = "workspace_ai"
    
    # Authentication (Clerk)
    clerk_jwks_url: Optional[str] = None
    clerk_jwt_audience: Optional[str] = None
    clerk_jwt_issuer: Optional[str] = None
    
    # CORS
    frontend_url: Optional[str] = None
    frontend_vercel_url: Optional[str] = None
    allowed_origins: List[str] = [
        "https://workspace-frontend-liard.vercel.app",
        "https://workspace-new-qlxm.onrender.com",
        "https://backend-workspace-vccb.onrender.com",
        "http://localhost:3000",
        "http://localhost:5000",
        "http://localhost:5001",
        "http://localhost:8000",
    ]
    
    # Educational Content
    default_edu_url: str = (
        "https://www.youtube.com/embed/?listType=playlist&list=PL-osiE80TeTs4UjLw5MM6OjgkjFeUxCYH"
    )
    
    # Cache TTLs (in seconds)
    url_cache_ttl: int = 60
    jwks_cache_ttl: int = 300
    
    # Rate Limiting
    enable_rate_limiting: bool = True
    rate_limit_requests_per_minute: int = 100
    analysis_rate_limit_per_minute: int = 30
    auth_rate_limit_per_5min: int = 10
    
    # Logging
    log_level: str = "INFO"
    enable_request_logging: bool = False
    
    # Performance
    max_concurrent_analyses: int = 10
    analysis_timeout_seconds: int = 30
    
    # Security
    enable_cors: bool = True
    enable_auth: bool = True
    
    # Monitoring
    enable_metrics: bool = False
    metrics_port: Optional[int] = None
    
    @validator("allowed_origins", pre=True)
    def assemble_cors_origins(cls, v, values):
        """Combine static origins with environment-provided ones."""
        origins = list(v) if v else []
        
        if values.get("frontend_url"):
            origins.append(values["frontend_url"])
        
        if values.get("frontend_vercel_url"):
            origins.append(values["frontend_vercel_url"])
        
        # Remove duplicates while preserving order
        seen = set()
        return [x for x in origins if not (x in seen or seen.add(x))]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
