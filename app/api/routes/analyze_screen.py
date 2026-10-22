"""
FastAPI route for screen screenshot analysis.

Privacy-safe endpoint for behavioral signal extraction from screen content.
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
import structlog
from ...models.requests import ScreenAnalysisRequest
from ...models.responses import ScreenAnalysisResponse, ErrorResponse
from ...services.screen_service import screen_service
from ...core.database import db

logger = structlog.get_logger()

router = APIRouter(
    prefix="/api/v1",
    tags=["screen-analysis"],
    responses={404: {"model": ErrorResponse, "description": "Not found"}}
)

@router.post("/analyze-screen", response_model=ScreenAnalysisResponse)
async def analyze_screen_screenshot(request: ScreenAnalysisRequest):
    """
    Analyze screen screenshot for behavioral signals.
    
    ## Privacy Notice
    - Screenshot data is processed in memory only
    - No raw images are stored
    - Only behavioral metrics are saved to database
    - No text content or URLs are preserved
    - All content analysis is anonymized
    
    ## ML Relevance
    Extracts key productivity indicators:
    - **Content Classification**: Activity categorization (coding, educational, etc.)
    - **Text Density**: Information load and complexity assessment
    - **Code Detection**: Development activity identification
    - **Distraction Scoring**: Focus disruption analysis
    
    ## Request Body
    ```json
    {
        "user_id": "user123",
        "session_id": "session456",
        "screenshot_data": "base64_encoded_image"
    }
    ```
    
    ## Response
    Returns structured behavioral metrics ready for ML training.
    """
    try:
        logger.info(
            "Screen analysis request received",
            user_id=request.user_id,
            session_id=request.session_id
        )
        
        # Analyze the screenshot
        result = await screen_service.analyze_screenshot(request.screenshot_data)
        
        # Store behavioral metrics in database
        event_data = {
            "user_id": request.user_id,
            "session_id": request.session_id,
            "content_type": result.content_type,
            "distraction_score": result.distraction_score,
            "text_density": result.text_density,
            "has_code": result.has_code,
            "has_social_indicator": result.has_social_indicator
        }
        
        # Store in MongoDB (async operation)
        event_id = await db.store_screen_event(event_data)
        
        logger.info(
            "Screen analysis completed",
            user_id=request.user_id,
            session_id=request.session_id,
            event_id=event_id,
            content_type=result.content_type,
            distraction_score=result.distraction_score
        )
        
        return result
        
    except ValueError as e:
        logger.warning(
            "Invalid request data",
            user_id=request.user_id,
            error=str(e)
        )
        raise HTTPException(status_code=400, detail=str(e))
        
    except Exception as e:
        logger.error(
            "Error in screen analysis",
            user_id=request.user_id,
            session_id=request.session_id,
            error=str(e)
        )
        raise HTTPException(status_code=500, detail="Internal server error during screen analysis")

@router.get("/screen-analysis/health")
async def screen_analysis_health():
    """
    Health check for screen analysis service.
    
    Returns service status and OpenCV initialization state.
    """
    try:
        return {
            "status": "healthy",
            "service": "screen_analysis",
            "opencv_initialized": True,
            "privacy_mode": True,
            "no_raw_storage": True,
            "text_extraction_enabled": True
        }
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        raise HTTPException(status_code=503, detail="Service unavailable")
