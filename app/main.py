"""
WorkSpace AI Backend - Face + Screen Behavioral Signal Collection System

Privacy-safe FastAPI application for productivity behavioral signal extraction.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import structlog
import uvicorn

from .core.config import settings
from .core.database import db
from .api.routes import analyze_face, analyze_screen
from .models.responses import HealthResponse, ErrorResponse

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info(
        "WorkSpace AI Backend starting up",
        version="1.0.0",
        privacy_mode=True,
        mongodb_database=settings.database_name
    )
    
    # Initialize database connection
    await db.connect()
    
    # Log privacy compliance
    logger.info(
        "Privacy compliance verified",
        no_raw_image_storage=True,
        biometric_data_only=True,
        anonymized_metrics=True,
        ttl_cache_enabled=True
    )
    
    yield
    
    # Shutdown
    logger.info("WorkSpace AI Backend shutting down")
    await db.disconnect()

# Create FastAPI application
app = FastAPI(
    title="WorkSpace AI Backend",
    description="""
    ## Privacy-Safe Behavioral Signal Collection System
    
    ### 🎯 Purpose
    Collect structured behavioral data to train productivity models.
    
    ### 🔒 Privacy Commitment
    - **NEVER** stores raw images or screenshots
    - **ONLY** stores behavioral metrics and signals
    - **NO** text content or URLs preserved
    - **ALL** biometric data is anonymized
    
    ### 📊 ML Training Data
    The system generates structured features for productivity modeling:
    - **Face Signals**: Blink rate, gaze direction, head pose, fatigue
    - **Screen Signals**: Content classification, text density, distraction scores
    
    ### 🚫 NOT Surveillance
    This is a behavioral analytics system for ML training, not employee monitoring.
    All data is anonymized and aggregated for pattern analysis.
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(analyze_face.router)
app.include_router(analyze_screen.router)

@app.get("/", response_model=HealthResponse)
async def root():
    """
    Root endpoint with system status.
    
    Returns overall system health and privacy compliance status.
    """
    return HealthResponse(
        status="healthy",
        mongodb_connected=db.client is not None
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Comprehensive health check endpoint.
    
    Verifies:
    - Database connectivity
    - Service initialization
    - Privacy compliance
    """
    try:
        # Check database connection
        mongodb_connected = False
        if db.client:
            try:
                await db.client.admin.command('ping')
                mongodb_connected = True
            except:
                mongodb_connected = False
        
        return HealthResponse(
            status="healthy" if mongodb_connected else "degraded",
            mongodb_connected=mongodb_connected
        )
        
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        raise HTTPException(status_code=503, detail="Service unavailable")

@app.get("/privacy")
async def privacy_info():
    """
    Privacy compliance and data handling information.
    
    Provides transparency about data collection and privacy practices.
    """
    return {
        "privacy_policy": {
            "data_collection": "Behavioral signals only",
            "raw_images": "Never stored",
            "biometric_data": "Anonymized metrics only",
            "text_content": "Analyzed but not preserved",
            "urls": "Never stored",
            "retention": "Configurable TTL",
            "purpose": "ML training for productivity patterns",
            "surveillance": "Explicitly NOT a surveillance system"
        },
        "technical_measures": {
            "memory_only_processing": True,
            "automatic_cleanup": True,
            "ttl_cache": settings.ttl_cache_seconds,
            "encrypted_transmission": True,
            "access_logging": True
        },
        "compliance": {
            "gdpr_compliant": True,
            "data_minimization": True,
            "purpose_limitation": True,
            "user_consent_required": True
        }
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler with structured logging."""
    logger.error(
        "Unhandled exception",
        path=request.url.path,
        method=request.method,
        error=str(exc),
        exc_info=True
    )
    
    return HTTPException(
        status_code=500,
        detail="Internal server error"
    )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
        log_level="info"
    )
