"""
Focus analysis endpoint.

This module handles focus detection from video frames, analyzing
user attention and concentration levels.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from app.models.requests import FocusAnalyzeRequest
from app.models.responses import FocusAnalysisResponse
from app.services.focus_service import FocusService
from app.services.session_service import SessionService
from app.core.auth import get_optional_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyze", tags=["Analysis"])


@router.post("/focus", response_model=FocusAnalysisResponse)
async def analyze_focus(
    request: FocusAnalyzeRequest,
    current_user=Depends(get_optional_user)
):
    """
    Analyze user focus from video frame data.
    
    Args:
        request: Focus analysis request with base64 frame data
        current_user: Optional authenticated user
        
    Returns:
        FocusAnalysisResponse: Analysis results with focus metrics
        
    Raises:
        HTTPException: If analysis fails or input is invalid
    """
    try:
        logger.debug(f"👁️ Focus analysis request for user: {request.user_id}")
        
        # Perform focus analysis
        result = await FocusService.analyze_focus(request.frame_data)
        
        # Record event if session exists
        if request.session_id and request.user_id:
            try:
                await SessionService.record_event(
                    session_id=request.session_id,
                    user_id=request.user_id,
                    event_type="focus_analysis",
                    content_type=result.content_type,
                    distraction_score=result.distraction_score,
                    focus_score=result.focus_score,
                    fatigue_score=result.fatigue_score
                )
            except Exception as e:
                logger.warning(f"⚠️ Failed to record focus analysis event: {e}")
        
        return FocusAnalysisResponse(
            success=True,
            analysis_type="focus",
            user_id=request.user_id,
            session_id=request.session_id,
            result=result
        )
        
    except ValueError as e:
        logger.warning(f"⚠️ Invalid focus analysis request: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Focus analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Focus analysis failed")
