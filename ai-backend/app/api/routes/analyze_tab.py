"""
Tab analysis endpoint.

This module handles tab content classification, focusing on educational
content detection and distraction scoring without making blocking decisions.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from app.models.requests import TabAnalyzeRequest
from app.models.responses import TabAnalysisResponse
from app.services.tab_service import TabService
from app.services.session_service import SessionService
from app.core.auth import get_optional_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyze", tags=["Analysis"])


@router.post("/tab", response_model=TabAnalysisResponse)
async def analyze_tab(
    request: TabAnalyzeRequest,
    current_user=Depends(get_optional_user)
):
    """
    Analyze tab content for educational value and distraction level.
    
    This endpoint performs classification only and returns structured
    analysis results. No blocking decisions are made here.
    
    Args:
        request: Tab analysis request with URL and title
        current_user: Optional authenticated user
        
    Returns:
        TabAnalysisResponse: Analysis results with classification and recommendations
        
    Raises:
        HTTPException: If analysis fails or input is invalid
    """
    try:
        logger.debug(f"🔍 Tab analysis request: {request.url}")
        
        # Perform tab analysis
        result = await TabService.analyze_tab(request.url, request.title)
        
        # Record event if session exists
        if current_user and request.session_id:
            try:
                await SessionService.record_event(
                    session_id=request.session_id,
                    user_id=current_user.get("sub", request.user_id),
                    event_type="tab_analysis",
                    content_type=result.content_type,
                    distraction_score=result.distraction_score,
                    focus_score=result.focus_score
                )
            except Exception as e:
                logger.warning(f"⚠️ Failed to record tab analysis event: {e}")
        
        return TabAnalysisResponse(
            success=True,
            analysis_type="browser_tab",
            result=result
        )
        
    except ValueError as e:
        logger.warning(f"⚠️ Invalid tab analysis request: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Tab analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Tab analysis failed")
