"""
Error handling middleware and utilities.

This module provides centralized error handling, custom exceptions,
and error response formatting for consistent API behavior.
"""

import logging
from typing import Dict, Any, Optional
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime

logger = logging.getLogger(__name__)


class WorkspaceException(Exception):
    """Base exception class for WorkSpace AI Backend."""
    
    def __init__(
        self,
        message: str,
        error_code: str = "WORKSPACE_ERROR",
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(WorkspaceException):
    """Raised when input validation fails."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            status_code=400,
            details=details
        )


class AuthenticationError(WorkspaceException):
    """Raised when authentication fails."""
    
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            message=message,
            error_code="AUTHENTICATION_ERROR",
            status_code=401
        )


class AuthorizationError(WorkspaceException):
    """Raised when user lacks permission."""
    
    def __init__(self, message: str = "Access denied"):
        super().__init__(
            message=message,
            error_code="AUTHORIZATION_ERROR",
            status_code=403
        )


class NotFoundError(WorkspaceException):
    """Raised when requested resource is not found."""
    
    def __init__(self, message: str = "Resource not found"):
        super().__init__(
            message=message,
            error_code="NOT_FOUND_ERROR",
            status_code=404
        )


class DatabaseError(WorkspaceException):
    """Raised when database operation fails."""
    
    def __init__(self, message: str = "Database operation failed"):
        super().__init__(
            message=message,
            error_code="DATABASE_ERROR",
            status_code=500
        )


class AIServiceError(WorkspaceException):
    """Raised when AI service operation fails."""
    
    def __init__(self, message: str = "AI service error"):
        super().__init__(
            message=message,
            error_code="AI_SERVICE_ERROR",
            status_code=500
        )


async def workspace_exception_handler(request: Request, exc: WorkspaceException):
    """
    Handle custom WorkspaceException instances.
    
    Args:
        request: FastAPI request object
        exc: WorkspaceException instance
        
    Returns:
        JSONResponse: Formatted error response
    """
    logger.error(f"🚨 WorkspaceException: {exc.error_code} - {exc.message}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.message,
            "error_code": exc.error_code,
            "details": exc.details,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    )


async def general_exception_handler(request: Request, exc: Exception):
    """
    Handle unexpected exceptions.
    
    Args:
        request: FastAPI request object
        exc: Unexpected exception
        
    Returns:
        JSONResponse: Generic error response
    """
    logger.error(f"❌ Unexpected error: {type(exc).__name__} - {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "error_code": "INTERNAL_ERROR",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    )


def setup_error_handlers(app):
    """
    Register error handlers with FastAPI application.
    
    Args:
        app: FastAPI application instance
    """
    app.add_exception_handler(WorkspaceException, workspace_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
    
    logger.info("🛡️ Error handlers registered")
