"""
Session management service.

This module handles session lifecycle management, storing session data
in MongoDB and providing session-related operations.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.core.database import get_collection, Collections
from app.models.responses import SessionData

logger = logging.getLogger(__name__)


class SessionService:
    """Service for session management and persistence."""
    
    @staticmethod
    async def create_session(
        subject: str,
        user_id: str,
        goal_minutes: Optional[int] = None
    ) -> SessionData:
        """
        Create a new study session.
        
        Args:
            subject: Study subject/topic
            user_id: User identifier
            goal_minutes: Optional goal in minutes
            
        Returns:
            SessionData: Created session data
            
        Raises:
            ValueError: If required fields are missing
            RuntimeError: If session creation fails
        """
        try:
            logger.debug(f"📝 Creating session for user {user_id}: {subject}")
            
            # Validate input
            if not subject:
                raise ValueError("Subject cannot be empty")
            if not user_id:
                raise ValueError("User ID cannot be empty")
            
            # Generate session ID
            session_id = f"session_{int(datetime.utcnow().timestamp() * 1000)}"
            start_time = datetime.utcnow().isoformat() + "Z"
            
            # Create session data
            session = SessionData(
                id=session_id,
                user_id=user_id,
                subject=subject,
                goal_minutes=goal_minutes,
                status="active",
                start_time=start_time,
                end_time=None,
                average_focus=0.0,
                scores=[],
                timeline=[],
                sites=[]
            )
            
            # Store in database
            collection = await get_collection(Collections.SESSIONS)
            await collection.insert_one(session.dict())
            
            logger.info(f"✅ Session created: {session_id}")
            return session
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to create session: {e}")
            raise RuntimeError(f"Session creation failed: {str(e)}")
    
    @staticmethod
    async def get_session(session_id: str) -> Optional[SessionData]:
        """
        Retrieve session by ID.
        
        Args:
            session_id: Session identifier
            
        Returns:
            SessionData: Session data if found, None otherwise
            
        Raises:
            RuntimeError: If database operation fails
        """
        try:
            logger.debug(f"🔍 Retrieving session: {session_id}")
            
            if not session_id:
                raise ValueError("Session ID cannot be empty")
            
            collection = await get_collection(Collections.SESSIONS)
            session_doc = await collection.find_one({"id": session_id})
            
            if session_doc:
                session_data = SessionData(**session_doc)
                logger.debug(f"✅ Session found: {session_id}")
                return session_data
            else:
                logger.debug(f"⚠️ Session not found: {session_id}")
                return None
                
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to retrieve session: {e}")
            raise RuntimeError(f"Session retrieval failed: {str(e)}")
    
    @staticmethod
    async def update_session(
        session_id: str,
        average_focus: float,
        scores: List[float],
        timeline: Optional[List[Dict[str, Any]]] = None,
        sites: Optional[List[Dict[str, Any]]] = None
    ) -> SessionData:
        """
        Update session with completion data.
        
        Args:
            session_id: Session identifier
            average_focus: Average focus score
            scores: List of focus scores over time
            timeline: Optional timeline of events
            sites: Optional list of visited sites
            
        Returns:
            SessionData: Updated session data
            
        Raises:
            ValueError: If session not found or invalid data
            RuntimeError: If update fails
        """
        try:
            logger.debug(f"📊 Updating session: {session_id}")
            
            # Validate inputs
            if not session_id:
                raise ValueError("Session ID cannot be empty")
            if not isinstance(scores, list) or not scores:
                raise ValueError("Scores must be a non-empty list")
            if not (0 <= average_focus <= 100):
                raise ValueError("Average focus must be between 0 and 100")
            
            # Get existing session
            existing_session = await SessionService.get_session(session_id)
            if not existing_session:
                raise ValueError(f"Session not found: {session_id}")
            
            # Update session data
            end_time = datetime.utcnow().isoformat() + "Z"
            
            update_data = {
                "status": "completed",
                "end_time": end_time,
                "average_focus": average_focus,
                "scores": scores,
                "timeline": timeline or [],
                "sites": sites or []
            }
            
            # Update in database
            collection = await get_collection(Collections.SESSIONS)
            result = await collection.update_one(
                {"id": session_id},
                {"$set": update_data}
            )
            
            if result.modified_count == 0:
                raise RuntimeError("No session was updated")
            
            # Get updated session
            updated_session = await SessionService.get_session(session_id)
            logger.info(f"✅ Session updated: {session_id}")
            return updated_session
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to update session: {e}")
            raise RuntimeError(f"Session update failed: {str(e)}")
    
    @staticmethod
    async def get_user_sessions(user_id: str) -> List[SessionData]:
        """
        Get all sessions for a user.
        
        Args:
            user_id: User identifier
            
        Returns:
            List[SessionData]: List of user sessions
            
        Raises:
            ValueError: If user ID is empty
            RuntimeError: If database operation fails
        """
        try:
            logger.debug(f"👤 Retrieving sessions for user: {user_id}")
            
            if not user_id:
                raise ValueError("User ID cannot be empty")
            
            collection = await get_collection(Collections.SESSIONS)
            cursor = collection.find({"user_id": user_id}).sort("start_time", -1)
            
            sessions = []
            async for session_doc in cursor:
                sessions.append(SessionData(**session_doc))
            
            logger.debug(f"✅ Found {len(sessions)} sessions for user {user_id}")
            return sessions
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to get user sessions: {e}")
            raise RuntimeError(f"User sessions retrieval failed: {str(e)}")
    
    @staticmethod
    async def get_active_sessions() -> List[SessionData]:
        """
        Get all currently active sessions.
        
        Returns:
            List[SessionData]: List of active sessions
            
        Raises:
            RuntimeError: If database operation fails
        """
        try:
            logger.debug("🔄 Retrieving active sessions")
            
            collection = await get_collection(Collections.SESSIONS)
            cursor = collection.find({"status": "active"}).sort("start_time", -1)
            
            sessions = []
            async for session_doc in cursor:
                sessions.append(SessionData(**session_doc))
            
            logger.debug(f"✅ Found {len(sessions)} active sessions")
            return sessions
            
        except Exception as e:
            logger.error(f"❌ Failed to get active sessions: {e}")
            raise RuntimeError(f"Active sessions retrieval failed: {str(e)}")
    
    @staticmethod
    async def record_event(
        session_id: str,
        user_id: str,
        event_type: str,
        content_type: str,
        distraction_score: float,
        focus_score: Optional[float] = None,
        fatigue_score: Optional[float] = None
    ) -> bool:
        """
        Record an event for analytics and tracking.
        
        Args:
            session_id: Session identifier
            user_id: User identifier
            event_type: Type of event (screen_analysis, tab_analysis, etc.)
            content_type: Content classification
            distraction_score: Distraction score
            focus_score: Optional focus score
            fatigue_score: Optional fatigue score
            
        Returns:
            bool: True if event was recorded successfully
            
        Raises:
            ValueError: If required fields are missing
            RuntimeError: If recording fails
        """
        try:
            # Validate inputs
            if not all([session_id, user_id, event_type, content_type]):
                raise ValueError("Required fields cannot be empty")
            
            # Create event document
            event = {
                "session_id": session_id,
                "user_id": user_id,
                "type": event_type,
                "content_type": content_type,
                "distraction_score": float(distraction_score),
                "focus_score": float(focus_score) if focus_score is not None else None,
                "fatigue_score": float(fatigue_score) if fatigue_score is not None else None,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
            # Store in database
            collection = await get_collection(Collections.EVENTS)
            await collection.insert_one(event)
            
            logger.debug(f"📊 Event recorded: {event_type} for session {session_id}")
            return True
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to record event: {e}")
            raise RuntimeError(f"Event recording failed: {str(e)}")
