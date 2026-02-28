"""
Session management endpoints.

This module handles session lifecycle operations including creating,
retrieving, updating, and listing study sessions.
"""

import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from app.models.requests import SessionStartRequest, SessionEndRequest
from app.models.responses import (
    SessionStartResponse, 
    SessionGetResponse, 
    SessionEndResponse,
    UserSessionsResponse,
    FocusSessionResponse
)
from app.services.session_service import SessionService
from app.core.auth import get_current_user, get_optional_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/session", tags=["Sessions"])


@router.post("/start", response_model=SessionStartResponse)
async def start_session(
    request: SessionStartRequest,
    current_user=Depends(get_optional_user)
):
    """
    Start a new study session.
    
    Args:
        request: Session start request with subject and goal
        current_user: Optional authenticated user
        
    Returns:
        SessionStartResponse: Created session data
        
    Raises:
        HTTPException: If session creation fails
    """
    try:
        # Get user ID from auth or request
        user_id = current_user.get("sub") if current_user else request.user_id
        if not user_id:
            user_id = "guest"  # Fallback for unauthenticated users
        
        logger.debug(f"📝 Starting session for user {user_id}: {request.subject}")
        
        # Create session
        session = await SessionService.create_session(
            subject=request.subject,
            user_id=user_id,
            goal_minutes=request.goal_minutes
        )
        
        return SessionStartResponse(
            success=True,
            data={"session": session}
        )
        
    except ValueError as e:
        logger.warning(f"⚠️ Invalid session start request: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Failed to start session: {e}")
        raise HTTPException(status_code=500, detail="Failed to start session")


@router.get("/{session_id}", response_model=SessionGetResponse)
async def get_session(
    session_id: str,
    current_user=Depends(get_current_user)
):
    """
    Retrieve session by ID.
    
    Args:
        session_id: Session identifier
        current_user: Authenticated user
        
    Returns:
        SessionGetResponse: Session data
        
    Raises:
        HTTPException: If session not found or access denied
    """
    try:
        logger.debug(f"🔍 Retrieving session: {session_id}")
        
        # Get session
        session = await SessionService.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Verify user ownership (optional - depends on security requirements)
        user_id = current_user.get("sub")
        if session.user_id != user_id:
            logger.warning(f"⚠️ User {user_id} attempted to access session {session_id} owned by {session.user_id}")
            raise HTTPException(status_code=403, detail="Access denied")
        
        return SessionGetResponse(
            success=True,
            data={"session": session}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to get session: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve session")


@router.put("/{session_id}/end", response_model=SessionEndResponse)
async def end_session(
    session_id: str,
    request: SessionEndRequest,
    current_user=Depends(get_current_user)
):
    """
    End a session and save results.
    
    Args:
        session_id: Session identifier
        request: Session end request with results
        current_user: Authenticated user
        
    Returns:
        SessionEndResponse: Updated session data
        
    Raises:
        HTTPException: If session not found or update fails
    """
    try:
        logger.debug(f"📊 Ending session: {session_id}")
        
        # Verify session exists and user owns it
        existing_session = await SessionService.get_session(session_id)
        if not existing_session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        user_id = current_user.get("sub")
        if existing_session.user_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Update session
        updated_session = await SessionService.update_session(
            session_id=session_id,
            average_focus=request.average_focus,
            scores=request.scores,
            timeline=request.timeline,
            sites=request.sites
        )
        
        return SessionEndResponse(
            success=True,
            data={"session": updated_session}
        )
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"⚠️ Invalid session end request: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Failed to end session: {e}")
        raise HTTPException(status_code=500, detail="Failed to end session")


@router.get("/user/{user_id}", response_model=UserSessionsResponse)
async def get_user_sessions(
    user_id: str,
    current_user=Depends(get_current_user)
):
    """
    Get all sessions for a user.
    
    Args:
        user_id: User identifier
        current_user: Authenticated user
        
    Returns:
        UserSessionsResponse: List of user sessions
        
    Raises:
        HTTPException: If access denied or retrieval fails
    """
    try:
        # Verify user can only access their own sessions
        auth_user_id = current_user.get("sub")
        if user_id != auth_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        logger.debug(f"👤 Retrieving sessions for user: {user_id}")
        
        # Get user sessions
        sessions = await SessionService.get_user_sessions(user_id)
        
        return UserSessionsResponse(
            success=True,
            data={"sessions": sessions}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to get user sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve sessions")


@router.get("/focus/current", response_model=FocusSessionResponse)
async def get_current_focus_session():
    """
    Get current focus session information.
    
    Returns:
        FocusSessionResponse: Current session status and metrics
        
    Note:
        This endpoint provides legacy compatibility for existing
        frontend implementations.
    """
    try:
        logger.debug("🔄 Retrieving current focus session")
        
        # Get active sessions
        active_sessions = await SessionService.get_active_sessions()
        
        if active_sessions:
            # Get the most recent active session
            latest = max(active_sessions, key=lambda x: x.start_time)
            
            # Calculate elapsed time
            start_time = latest.start_time
            try:
                if start_time.endswith("Z"):
                    dt_start = datetime.fromisoformat(start_time[:-1])
                else:
                    dt_start = datetime.fromisoformat(start_time.replace("+00:00", ""))
                elapsed = (datetime.utcnow() - dt_start).total_seconds() / 60
            except Exception:
                elapsed = 0
            
            return FocusSessionResponse(
                success=True,
                session_active=True,
                session_start=start_time,
                elapsed_minutes=int(elapsed),
                target_minutes=latest.goal_minutes or 120,
                distractions_blocked=0,  # Could be calculated from events
                productivity_score=latest.average_focus
            )
        
        # No active session
        return FocusSessionResponse(
            success=True,
            session_active=False,
            session_start=None,
            elapsed_minutes=0,
            target_minutes=120,
            distractions_blocked=0,
            productivity_score=0.0
        )
        
    except Exception as e:
        logger.error(f"❌ Failed to get current focus session: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve focus session")
