"""
Authentication module for Clerk JWT verification.

This module handles JWT token verification, user authentication,
and provides authentication dependencies for FastAPI routes.
"""

import logging
import requests
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, Depends
from jose import jwt, JWTError
from .config import get_settings

logger = logging.getLogger(__name__)

# Cache for JWKS keys
_jwks_cache: Optional[Dict[str, Any]] = None


async def get_jwks() -> Dict[str, Any]:
    """
    Fetch JSON Web Key Set (JWKS) from Clerk.
    
    Returns:
        Dict containing JWKS keys
        
    Note:
        Results are cached to avoid repeated requests
    """
    global _jwks_cache
    
    settings = get_settings()
    
    if _jwks_cache is not None:
        return _jwks_cache
    
    if not settings.clerk_jwks_url:
        logger.warning("⚠️ Clerk JWKS URL not configured")
        return {"keys": []}
    
    try:
        response = requests.get(settings.clerk_jwks_url, timeout=5)
        response.raise_for_status()
        _jwks_cache = response.json()
        logger.debug("🔑 JWKS fetched successfully")
        return _jwks_cache
        
    except Exception as e:
        logger.error(f"❌ Failed to fetch Clerk JWKS: {e}")
        return {"keys": []}


async def verify_clerk_token(authorization: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Verify Clerk JWT token from Authorization header.
    
    Args:
        authorization: Authorization header value (Bearer token)
        
    Returns:
        Dict containing decoded JWT claims if valid, None otherwise
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        return None
    
    settings = get_settings()
    
    try:
        # Get JWKS for token verification
        jwks = await get_jwks()
        
        # Configure verification options
        options = {"verify_aud": bool(settings.clerk_jwt_audience)}
        
        # Decode and verify token
        claims = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            audience=settings.clerk_jwt_audience,
            issuer=settings.clerk_jwt_issuer,
            options=options,
        )
        
        logger.debug(f"✅ JWT verified for user: {claims.get('sub')}")
        return claims
        
    except JWTError as e:
        logger.debug(f"❌ JWT verification failed: {e}")
        return None
    except Exception as e:
        logger.error(f"❌ Unexpected error during JWT verification: {e}")
        return None


async def get_current_user(
    authorization: Optional[str] = Header(None, description="Bearer token for authentication")
) -> Optional[Dict[str, Any]]:
    """
    FastAPI dependency to get current authenticated user.
    
    Args:
        authorization: Authorization header
        
    Returns:
        Dict containing user claims if authenticated, None otherwise
        
    Raises:
        HTTPException: If authentication is required but fails
    """
    settings = get_settings()
    
    # If Clerk is not configured, skip authentication
    if not settings.clerk_jwks_url:
        logger.debug("🔓 Authentication disabled (Clerk not configured)")
        return None
    
    claims = await verify_clerk_token(authorization)
    
    if claims is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return claims


async def get_optional_user(
    authorization: Optional[str] = Header(None, description="Optional Bearer token")
) -> Optional[Dict[str, Any]]:
    """
    FastAPI dependency for optional authentication.
    
    Unlike get_current_user, this returns None instead of raising
    an exception when authentication fails.
    
    Args:
        authorization: Authorization header
        
    Returns:
        Dict containing user claims if authenticated, None otherwise
    """
    settings = get_settings()
    
    # If Clerk is not configured, always return None
    if not settings.clerk_jwks_url:
        return None
    
    return await verify_clerk_token(authorization)
