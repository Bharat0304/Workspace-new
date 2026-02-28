"""
Screen analysis service.

This module handles screen content analysis, OCR, and classification.
It focuses purely on detection and returns structured analysis results
without making any enforcement decisions.
"""

import logging
from typing import Dict, Any, List
from app.models.responses import AnalysisResult

logger = logging.getLogger(__name__)

# Import AI modules (assuming they exist in ai_modules)
try:
    from ai_modules.analyzers import analyze_screen_from_b64
except ImportError:
    logger.warning("⚠️ ai_modules.analyzers not available, using mock implementation")
    
    def analyze_screen_from_b64(image_data: str) -> Dict[str, Any]:
        """Mock implementation when AI modules are not available."""
        # Simple mock based on image data size
        size = len(image_data)
        
        # Mock classification based on size patterns
        if size < 10000:
            content_type = "educational"
            distraction_score = 10.0
            detected_indicators = ["text_content", "structured_layout"]
        elif size < 50000:
            content_type = "neutral"
            distraction_score = 30.0
            detected_indicators = ["mixed_content", "some_images"]
        else:
            content_type = "high_distraction"
            distraction_score = 80.0
            detected_indicators = ["media_heavy", "entertainment_patterns"]
        
        return {
            "content_type": content_type,
            "distraction_score": distraction_score,
            "focus_score": max(0, 100 - distraction_score),
            "detected_indicators": detected_indicators
        }


class ScreenService:
    """Service for screen content analysis."""
    
    @staticmethod
    async def analyze_screen(screenshot_data: str) -> AnalysisResult:
        """
        Analyze screen content from base64 image data.
        
        Args:
            screenshot_data: Base64 encoded screenshot
            
        Returns:
            AnalysisResult: Structured analysis result
            
        Raises:
            ValueError: If screenshot data is invalid
            RuntimeError: If analysis fails
        """
        try:
            logger.debug("🔍 Starting screen analysis")
            
            # Validate input
            if not screenshot_data:
                raise ValueError("Screenshot data cannot be empty")
            
            # Perform AI analysis
            raw_result = analyze_screen_from_b64(screenshot_data)
            
            # Validate and structure the result
            content_type = raw_result.get("content_type", "neutral")
            if content_type not in ["educational", "neutral", "high_distraction"]:
                logger.warning(f"⚠️ Unexpected content_type: {content_type}, defaulting to neutral")
                content_type = "neutral"
            
            distraction_score = float(raw_result.get("distraction_score", 50))
            distraction_score = max(0, min(100, distraction_score))  # Clamp to 0-100
            
            focus_score = raw_result.get("focus_score")
            if focus_score is not None:
                focus_score = float(focus_score)
                focus_score = max(0, min(100, focus_score))  # Clamp to 0-100
            
            detected_indicators = raw_result.get("detected_indicators", [])
            if not isinstance(detected_indicators, list):
                detected_indicators = [str(detected_indicators)]
            
            result = AnalysisResult(
                content_type=content_type,
                distraction_score=distraction_score,
                focus_score=focus_score,
                detected_indicators=detected_indicators
            )
            
            logger.debug(f"✅ Screen analysis completed: {content_type} ({distraction_score:.1f})")
            return result
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"❌ Screen analysis failed: {e}")
            raise RuntimeError(f"Screen analysis failed: {str(e)}")
