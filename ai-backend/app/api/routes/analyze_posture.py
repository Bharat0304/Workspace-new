"""
Posture analysis endpoint.

This module handles posture detection from video frames, analyzing
physical positioning and providing ergonomic recommendations.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from app.models.requests import PostureAnalyzeRequest
from app.models.responses import PostureAnalysisResponse
from app.services.posture_service import PostureService
from app.services.session_service import SessionService
from app.core.auth import get_optional_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyze", tags=["Analysis"])


@router.post("/posture", response_model=PostureAnalysisResponse)
async def analyze_posture(
    request: PostureAnalyzeRequest,
    current_user=Depends(get_optional_user)
):
    """
    Analyze user posture from video frame data.
    
    Args:
        request: Posture analysis request with base64 frame data
        current_user: Optional authenticated user
        
    Returns:
        PostureAnalysisResponse: Analysis results with posture status and recommendations
        
    Raises:
        HTTPException: If analysis fails or input is invalid
    """
    try:
        logger.debug(f"🪑 Posture analysis request for user: {request.user_id}")
        
        # Perform posture analysis
        result = await PostureService.analyze_posture(request.frame_data)
        
        # Record event if session exists (posture doesn't have traditional scores)
        if request.session_id and request.user_id:
            try:
                # Map posture status to distraction score for consistency
                posture_distraction_map = {
                    "good": 10.0,
                    "ok": 30.0,
                    "poor": 70.0
                }
                distraction_score = posture_distraction_map.get(result.posture_status, 50.0)
                
                await SessionService.record_event(
                    session_id=request.session_id,
                    user_id=request.user_id,
                    event_type="posture_analysis",
                    content_type="neutral",  # Posture doesn't classify content
                    distraction_score=distraction_score,
                    focus_score=max(0, 100 - distraction_score)
                )
            except Exception as e:
                logger.warning(f"⚠️ Failed to record posture analysis event: {e}")
        
        return PostureAnalysisResponse(
            success=True,
            analysis_type="posture",
            user_id=request.user_id,
            session_id=request.session_id,
            result=result
        )
        
    except ValueError as e:
        logger.warning(f"⚠️ Invalid posture analysis request: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Posture analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Posture analysis failed")
