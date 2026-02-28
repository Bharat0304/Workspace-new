"""
Rate limiting middleware for API protection.

This module provides rate limiting functionality to prevent abuse
and ensure fair usage of API resources.
"""

import time
import logging
from typing import Dict, Optional
from fastapi import Request, HTTPException, Response
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict, deque
import sys
import os

# Add parent directory to path
parent_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(parent_dir)

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class RateLimiter:
    """
    In-memory rate limiter using sliding window algorithm.
    
    For production, consider using Redis-based rate limiting for
    distributed deployments.
    """
    
    def __init__(self):
        # Store client requests in sliding window
        # Format: {client_id: deque of timestamps}
        self.requests: Dict[str, deque] = defaultdict(deque)
        
        # Rate limits (requests per window)
        self.limits = {
            "default": {"requests": 100, "window": 60},  # 100 requests per minute
            "analysis": {"requests": 30, "window": 60},  # 30 analysis requests per minute
            "auth": {"requests": 10, "window": 300},   # 10 auth requests per 5 minutes
        }
    
    def is_allowed(
        self,
        client_id: str,
        limit_type: str = "default"
    ) -> tuple[bool, Dict[str, int]]:
        """
        Check if request is allowed based on rate limits.
        
        Args:
            client_id: Unique client identifier
            limit_type: Type of rate limit to apply
            
        Returns:
            Tuple of (is_allowed, rate_limit_info)
        """
        if limit_type not in self.limits:
            limit_type = "default"
        
        limit_config = self.limits[limit_type]
        max_requests = limit_config["requests"]
        window_seconds = limit_config["window"]
        current_time = time.time()
        
        # Get client's request history
        client_requests = self.requests[client_id]
        
        # Remove old requests outside the window
        while client_requests and client_requests[0] < current_time - window_seconds:
            client_requests.popleft()
        
        # Check if under limit
        if len(client_requests) < max_requests:
            client_requests.append(current_time)
            return True, {
                "limit": max_requests,
                "remaining": max_requests - len(client_requests),
                "reset_time": int(current_time + window_seconds)
            }
        
        # Rate limit exceeded
        oldest_request = client_requests[0] if client_requests else current_time
        reset_time = int(oldest_request + window_seconds)
        
        return False, {
            "limit": max_requests,
            "remaining": 0,
            "reset_time": reset_time
        }
    
    def cleanup_old_entries(self):
        """Clean up old client entries to prevent memory leaks."""
        current_time = time.time()
        max_age = 3600  # 1 hour
        
        clients_to_remove = []
        for client_id, requests in self.requests.items():
            # Remove old requests
            while requests and requests[0] < current_time - max_age:
                requests.popleft()
            
            # Mark empty clients for removal
            if not requests:
                clients_to_remove.append(client_id)
        
        # Remove empty client entries
        for client_id in clients_to_remove:
            del self.requests[client_id]
        
        if clients_to_remove:
            logger.debug(f"🧹 Cleaned up {len(clients_to_remove)} inactive rate limit entries")


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    FastAPI middleware for rate limiting.
    
    Applies rate limits based on endpoint patterns and client identity.
    """
    
    def __init__(self, app):
        super().__init__(app)
        self.rate_limiter = RateLimiter()
        self.last_cleanup = time.time()
        self.cleanup_interval = 300  # 5 minutes
    
    def get_client_id(self, request: Request) -> str:
        """
        Extract client identifier from request.
        
        Args:
            request: FastAPI request object
            
        Returns:
            Client identifier string
        """
        # Try to get user ID from authentication
        if hasattr(request.state, 'user') and request.state.user:
            return f"user:{request.state.user.get('sub', 'unknown')}"
        
        # Fall back to IP address
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return f"ip:{forwarded_for.split(',')[0].strip()}"
        
        return f"ip:{request.client.host}"
    
    def get_limit_type(self, request: Request) -> str:
        """
        Determine rate limit type based on request path.
        
        Args:
            request: FastAPI request object
            
        Returns:
            Rate limit type string
        """
        path = request.url.path.lower()
        
        if "/analyze/" in path:
            return "analysis"
        elif any(auth_path in path for auth_path in ["/session/", "/auth"]):
            return "auth"
        
        return "default"
    
    async def dispatch(self, request: Request, call_next):
        """
        Process request through rate limiting middleware.
        
        Args:
            request: FastAPI request object
            call_next: Next middleware in chain
            
        Returns:
            HTTP response
        """
        # Skip rate limiting for health checks and docs
        path = request.url.path.lower()
        if path in ["/health", "/health/detailed", "/", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        # Periodic cleanup
        current_time = time.time()
        if current_time - self.last_cleanup > self.cleanup_interval:
            self.rate_limiter.cleanup_old_entries()
            self.last_cleanup = current_time
        
        # Get client info and limit type
        client_id = self.rate_limiter.get_client_id(request)
        limit_type = self.rate_limiter.get_limit_type(request)
        
        # Check rate limit
        is_allowed, limit_info = self.rate_limiter.is_allowed(client_id, limit_type)
        
        if not is_allowed:
            logger.warning(f"🚫 Rate limit exceeded for {client_id} ({limit_type})")
            
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded",
                headers={
                    "X-RateLimit-Limit": str(limit_info["limit"]),
                    "X-RateLimit-Remaining": str(limit_info["remaining"]),
                    "X-RateLimit-Reset": str(limit_info["reset_time"]),
                    "Retry-After": str(max(1, limit_info["reset_time"] - int(current_time)))
                }
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(limit_info["limit"])
        response.headers["X-RateLimit-Remaining"] = str(limit_info["remaining"])
        response.headers["X-RateLimit-Reset"] = str(limit_info["reset_time"])
        
        return response
