"""
Request logging middleware for monitoring and debugging.

This module provides structured request logging for monitoring
API usage, performance, and debugging.
"""

import time
import logging
import uuid
from typing import Optional
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from ..core.config import get_settings

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for structured request logging.
    
    Logs request details including timing, status codes,
    and client information for monitoring and debugging.
    """
    
    def __init__(self, app):
        super().__init__(app)
        self.settings = get_settings()
    
    async def dispatch(self, request: Request, call_next):
        """
        Process request and log details.
        
        Args:
            request: FastAPI request object
            call_next: Next middleware in chain
            
        Returns:
            HTTP response
        """
        # Skip logging if disabled
        if not self.settings.enable_request_logging:
            return await call_next(request)
        
        # Generate unique request ID
        request_id = str(uuid.uuid4())[:8]
        
        # Record start time
        start_time = time.time()
        
        # Get client info
        client_ip = self._get_client_ip(request)
        user_agent = request.headers.get("User-Agent", "Unknown")
        
        # Log request start
        logger.info(
            f"🚀 [{request_id}] {request.method} {request.url.path} "
            f"from {client_ip} - {user_agent[:50]}"
        )
        
        # Process request
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log successful request
            logger.info(
                f"✅ [{request_id}] {request.method} {request.url.path} "
                f"{response.status_code} - {process_time:.3f}s"
            )
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = f"{process_time:.3f}"
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            
            # Log error
            logger.error(
                f"❌ [{request_id}] {request.method} {request.url.path} "
                f"ERROR - {process_time:.3f}s - {str(e)}"
            )
            
            # Re-raise the exception
            raise
    
    def _get_client_ip(self, request: Request) -> str:
        """
        Extract client IP address from request.
        
        Args:
            request: FastAPI request object
            
        Returns:
            Client IP address
        """
        # Check for forwarded headers (common in production)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fall back to direct connection
        return request.client.host if request.client else "unknown"
