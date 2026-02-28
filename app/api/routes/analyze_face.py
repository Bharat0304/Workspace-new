"""
FastAPI route for face frame analysis.

Privacy-safe endpoint for behavioral signal extraction from face frames.
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
import structlog
from ...models.requests import FaceAnalysisRequest
from ...models.responses import FaceAnalysisResponse, ErrorResponse
from ...services.face_service import face_service
from ...core.database import db

logger = structlog.get_logger()

router = APIRouter(
    prefix="/api/v1",
    tags=["face-analysis"],
    responses={404: {"model": ErrorResponse, "description": "Not found"}}
)

@router.post("/analyze-face", response_model=FaceAnalysisResponse)
async def analyze_face_frame(request: FaceAnalysisRequest):
    """
    Analyze face frame for behavioral signals.
    
    ## Privacy Notice
    - Frame data is processed in memory only
    - No raw images are stored
    - Only behavioral metrics are saved to database
    - All biometric data is anonymized
    
    ## ML Relevance
    Extracts key productivity indicators:
    - **Eye Aspect Ratio**: Blink detection and fatigue monitoring
    - **Gaze Direction**: Focus and attention patterns
    - **Head Pose**: Engagement level assessment
    - **Fatigue Score**: Cognitive state evaluation
    
    ## Request Body
    ```json
    {
        "user_id": "user123",
        "session_id": "session456",
        "frame_data": "base64_encoded_image"
    }
    ```
    
    ## Response
    Returns structured behavioral metrics ready for ML training.
    """
    try:
        logger.info(
            "Face analysis request received",
            user_id=request.user_id,
            session_id=request.session_id
        )
        
        # Analyze the frame
        result = await face_service.analyze_frame(request.frame_data)
        
        # Store behavioral metrics in database
        event_data = {
            "user_id": request.user_id,
            "session_id": request.session_id,
            "blink_rate": result.blink_rate,
            "gaze_direction": result.gaze_direction,
            "head_tilt": result.head_tilt,
            "fatigue_score": result.fatigue_score,
            "face_present": result.face_present
        }
        
        # Store in MongoDB (async operation)
        event_id = await db.store_face_event(event_data)
        
        logger.info(
            "Face analysis completed",
            user_id=request.user_id,
            session_id=request.session_id,
            event_id=event_id,
            face_present=result.face_present,
            fatigue_score=result.fatigue_score
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
            "Error in face analysis",
            user_id=request.user_id,
            session_id=request.session_id,
            error=str(e)
        )
        raise HTTPException(status_code=500, detail="Internal server error during face analysis")

@router.get("/face-analysis/health")
async def face_analysis_health():
    """
    Health check for face analysis service.
    
    Returns service status and MediaPipe initialization state.
    """
    try:
        return {
            "status": "healthy",
            "service": "face_analysis",
            "mediapipe_initialized": face_service.face_mesh is not None,
            "privacy_mode": True,
            "no_raw_storage": True
        }
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        raise HTTPException(status_code=503, detail="Service unavailable")
