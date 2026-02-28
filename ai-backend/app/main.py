"""
Main FastAPI application for WorkSpace AI Backend.

This module sets up the FastAPI application with middleware,
routes, and startup/shutdown events. It follows clean architecture
principles with proper separation of concerns.
"""

import logging
import re
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add app directory to path for imports
sys.path.append('/Users/user/bharat/workspace/ai-backend')

from app.core.config import get_settings
from app.core.database import create_indexes, close_database_connection
from app.core.errors import setup_error_handlers
from app.core.rate_limiting import RateLimitMiddleware
from app.core.logging import RequestLoggingMiddleware
from app.api.routes import (
    health,
    analyze_screen,
    analyze_focus,
    analyze_tab,
    analyze_posture,
    intelligent_assistant,
    session,
    metrics
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    
    Handles startup and shutdown events for the FastAPI application.
    """
    # Startup
    logger.info("🚀 Starting WorkSpace AI Backend...")
    
    try:
        # Initialize database indexes
        await create_indexes()
        logger.info("✅ Database initialization completed")
        
        # Log configuration
        settings = get_settings()
        logger.info(f"🔧 Configuration loaded - Debug: {settings.debug}")
        logger.info(f"🌐 CORS origins: {settings.allowed_origins}")
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down WorkSpace AI Backend...")
    try:
        await close_database_connection()
        logger.info("✅ Shutdown completed")
    except Exception as e:
        logger.error(f"❌ Shutdown error: {e}")


# Create FastAPI application
app = FastAPI(
    title="WorkSpace AI Backend",
    description="Production-grade AI backend for cognitive performance system",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if get_settings().debug else None,
    redoc_url="/redoc" if get_settings().debug else None
)


def setup_middleware():
    """Configure application middleware."""
    settings = get_settings()
    
    # Request logging middleware (add first to capture all requests)
    if settings.enable_request_logging:
        app.add_middleware(RequestLoggingMiddleware)
        logger.info("📝 Request logging middleware enabled")
    
    # Rate limiting middleware
    if settings.enable_rate_limiting:
        app.add_middleware(RateLimitMiddleware)
        logger.info("🚫 Rate limiting middleware enabled")
    
    # CORS middleware
    if settings.enable_cors:
        setup_cors_middleware()
        logger.info("🌐 CORS middleware enabled")
    
    # Error handlers
    setup_error_handlers(app)
    logger.info("🛡️ Error handlers configured")


def setup_cors_middleware():
    """Configure CORS middleware with dynamic origin handling."""
    settings = get_settings()
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_origin_regex=r"https://.*\.vercel\.app",  # Allow all Vercel deployments
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600,  # Cache preflight requests for 1 hour
    )
    
    logger.info(f"🌐 CORS configured with {len(settings.allowed_origins)} origins")


def setup_routes():
    """Configure API routes."""
    
    # Health check routes
    app.include_router(health.router)
    
    # Analysis routes
    app.include_router(analyze_screen.router)
    app.include_router(analyze_focus.router)
    app.include_router(analyze_tab.router)
    app.include_router(analyze_posture.router)
    
    # AI Assistant routes
    app.include_router(intelligent_assistant.router)
    
    # Session management routes
    app.include_router(session.router)
    
    # Metrics routes (only if enabled)
    if get_settings().enable_metrics:
        app.include_router(metrics.router)
        logger.info("📊 Metrics routes enabled")
    
    logger.info("🛣️ API routes configured")


# Add explicit OPTIONS handler for preflight requests
@app.options("/{full_path:path}")
async def options_handler(request: Request, full_path: str):
    """
    Handle OPTIONS preflight requests with dynamic origin.
    
    This ensures proper CORS handling for browser extensions.
    """
    settings = get_settings()
    origin = request.headers.get("origin")
    
    # Check if origin is allowed
    is_allowed = False
    if origin:
        if origin in settings.allowed_origins:
            is_allowed = True
        elif re.match(r"https://.*\.vercel\.app", origin):
            is_allowed = True
    
    response = Response()
    if is_allowed and origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    else:
        # Default to first allowed origin if no origin or not allowed
        response.headers["Access-Control-Allow-Origin"] = settings.allowed_origins[0] if settings.allowed_origins else "*"
    
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Max-Age"] = "3600"
    
    return response


# Initialize application components
setup_middleware()
setup_routes()


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with basic information."""
    settings = get_settings()
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs" if settings.debug else "disabled"
    }


if __name__ == "__main__":
    import uvicorn
    
    settings = get_settings()
    
    logger.info(f"🚀 Starting WorkSpace AI Backend on port {settings.python_port}")
    logger.info("🔌 AI detection endpoints enabled")
    logger.info("📊 Session management enabled")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.python_port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
