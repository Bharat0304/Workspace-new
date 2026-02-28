"""
Focus analysis service.

This module handles focus detection from video frames,
analyzing user attention and concentration levels.
"""

import logging
from typing import Dict, Any, List
from app.models.responses import AnalysisResult

logger = logging.getLogger(__name__)

# Import AI modules (assuming they exist in ai_modules)
try:
    from ai_modules.analyzers import analyze_focus_from_b64
except ImportError:
    logger.warning("⚠️ ai_modules.analyzers not available, using mock implementation")
    
    def analyze_focus_from_b64(frame_data: str) -> Dict[str, Any]:
        """Mock implementation when AI modules are not available."""
        # Simple mock based on frame data size
        size = len(frame_data)
        
        # Mock focus detection based on patterns
        if size < 20000:
            focus_score = 85.0
            detected_indicators = ["eye_contact", "upright_posture", "minimal_movement"]
        elif size < 80000:
            focus_score = 60.0
            detected_indicators = ["occasional_glance_away", "slight_movement"]
        else:
            focus_score = 25.0
            detected_indicators = ["looking_away", "fidgeting", "distraction_signs"]
        
        return {
            "content_type": "neutral",  # Focus analysis doesn't classify content
            "distraction_score": max(0, 100 - focus_score),
            "focus_score": focus_score,
            "fatigue_score": max(0, 100 - focus_score - 10),  # Mock fatigue
            "detected_indicators": detected_indicators
        }


class FocusService:
    """Service for focus and attention analysis."""
    
    @staticmethod
    async def analyze_focus(frame_data: str) -> AnalysisResult:
        """
        Analyze user focus from video frame data.
        
        Args:
            frame_data: Base64 encoded video frame
            
        Returns:
            AnalysisResult: Structured analysis result with focus metrics
            
        Raises:
            ValueError: If frame data is invalid
            RuntimeError: If analysis fails
        """
        try:
            logger.debug("👁️ Starting focus analysis")
            
            # Validate input
            if not frame_data:
                raise ValueError("Frame data cannot be empty")
            
            # Perform AI analysis
            raw_result = analyze_focus_from_b64(frame_data)
            
            # Extract and validate metrics
            focus_score = raw_result.get("focus_score", 50)
            if focus_score is not None:
                focus_score = float(focus_score)
                focus_score = max(0, min(100, focus_score))
            
            distraction_score = raw_result.get("distraction_score", 50)
            if distraction_score is not None:
                distraction_score = float(distraction_score)
                distraction_score = max(0, min(100, distraction_score))
            
            fatigue_score = raw_result.get("fatigue_score")
            if fatigue_score is not None:
                fatigue_score = float(fatigue_score)
                fatigue_score = max(0, min(100, fatigue_score))
            
            detected_indicators = raw_result.get("detected_indicators", [])
            if not isinstance(detected_indicators, list):
                detected_indicators = [str(detected_indicators)]
            
            # For focus analysis, content_type is always neutral
            result = AnalysisResult(
                content_type="neutral",
                distraction_score=distraction_score,
                focus_score=focus_score,
                fatigue_score=fatigue_score,
                detected_indicators=detected_indicators
            )
            
            logger.debug(f"✅ Focus analysis completed: focus={focus_score:.1f}, distraction={distraction_score:.1f}")
            return result
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"❌ Focus analysis failed: {e}")
            raise RuntimeError(f"Focus analysis failed: {str(e)}")
