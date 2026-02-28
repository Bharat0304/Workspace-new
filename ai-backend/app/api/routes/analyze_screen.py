"""
Screen analysis endpoint.

This module handles screen content analysis requests, providing
AI-powered classification and distraction scoring.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from app.models.requests import ScreenAnalyzeRequest
from app.models.responses import ScreenAnalysisResponse
from app.services.screen_service import ScreenService
from app.services.session_service import SessionService
from app.core.auth import get_optional_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyze", tags=["Analysis"])


@router.post("/screen", response_model=ScreenAnalysisResponse)
async def analyze_screen(
    request: ScreenAnalyzeRequest,
    current_user=Depends(get_optional_user)
):
    """
    Analyze screen content for educational value and distraction level.
    
    Args:
        request: Screen analysis request with base64 screenshot data
        current_user: Optional authenticated user
        
    Returns:
        ScreenAnalysisResponse: Analysis results with content classification
        
    Raises:
        HTTPException: If analysis fails or input is invalid
    """
    try:
        logger.debug(f"📸 Screen analysis request for user: {request.user_id}")
        
        # Perform screen analysis
        result = await ScreenService.analyze_screen(request.screenshot_data)
        
        # Record event if session exists
        if request.session_id and request.user_id:
            try:
                await SessionService.record_event(
                    session_id=request.session_id,
                    user_id=request.user_id,
                    event_type="screen_analysis",
                    content_type=result.content_type,
                    distraction_score=result.distraction_score,
                    focus_score=result.focus_score
                )
            except Exception as e:
                logger.warning(f"⚠️ Failed to record screen analysis event: {e}")
        
        return ScreenAnalysisResponse(
            success=True,
            analysis_type="screen",
            user_id=request.user_id,
            session_id=request.session_id,
            result=result
        )
        
    except ValueError as e:
        logger.warning(f"⚠️ Invalid screen analysis request: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Screen analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Screen analysis failed")
