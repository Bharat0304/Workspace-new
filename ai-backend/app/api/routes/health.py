"""
Health check endpoint.

This module provides basic health check functionality to verify
that the API service is running and accessible.
"""

import logging
from datetime import datetime
from fastapi import APIRouter, Depends
from app.models.responses import HealthResponse
from app.core.database import get_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthResponse)
async def health_check():
    """
    Basic health check endpoint.
    
    Returns:
        HealthResponse: Service health status
        
    Note:
        This endpoint does not require authentication and provides
        basic service availability information.
    """
    return HealthResponse(
        status="ok",
        python=True,
        time=datetime.utcnow().isoformat() + "Z"
    )


@router.get("/detailed", response_model=HealthResponse)
async def detailed_health_check(db=Depends(get_database)):
    """
    Detailed health check including database connectivity.
    
    Returns:
        HealthResponse: Service health status with database verification
        
    Raises:
        HTTPException: If database connection fails
    """
    try:
        # Test database connection
        await db.command('ping')
        db_status = "connected"
    except Exception as e:
        logger.error(f"❌ Database health check failed: {e}")
        db_status = "disconnected"
        raise HTTPException(status_code=503, detail="Database connection failed")
    
    return HealthResponse(
        status="ok",
        python=True,
        time=datetime.utcnow().isoformat() + "Z"
    )
