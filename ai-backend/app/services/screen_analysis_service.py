import cv2
import numpy as np
import re
import structlog
from typing import Dict, Any, List, Tuple
from models.responses import ScreenAnalysisResponse, ContentType
from utils.image_utils import image_processor
from core.config import settings

logger = structlog.get_logger()

class ScreenAnalysisService:
    """
    Computer vision-based screen analysis for productivity modeling.
    
    ML Relevance: Extracts key productivity indicators:
    - Content classification: Activity categorization
    - Text density: Information load assessment
    - Code detection: Development activity identification
    - Distraction scoring: Focus disruption analysis
    """
    
    def __init__(self):
        # Code patterns for detection
        self.code_patterns = [
            r'\bdef\s+\w+\s*\(',  # Python functions
            r'\bclass\s+\w+\s*:',  # Python classes
            r'\bfunction\s+\w+\s*\(',  # JavaScript functions
            r'\bimport\s+\w+',  # Import statements
            r'\bfrom\s+\w+\s+import',  # Python imports
            r'\bconst\s+\w+\s*=',  # JavaScript constants
            r'\blet\s+\w+\s*=',  # JavaScript let
            r'\bvar\s+\w+\s*=',  # JavaScript var
            r'\{[\s\S]*\}',  # Code blocks
            r'\([\s\S]*\)\s*\{',  # Function definitions
            r'//.*$',  # Single line comments
            r'/\*[\s\S]*\*/',  # Multi-line comments
        ]
        
        # Compile regex patterns for efficiency
        self.compiled_patterns = [re.compile(pattern, re.MULTILINE) for pattern in self.code_patterns]
        
        # Educational content indicators
        self.educational_keywords = [
            'tutorial', 'course', 'lesson', 'learn', 'study', 'education',
            'university', 'college', 'school', 'academy', 'training',
            'documentation', 'guide', 'manual', 'reference', 'example'
        ]
        
        # Entertainment indicators
        self.entertainment_keywords = [
            'video', 'movie', 'game', 'music', 'stream', 'watch',
            'play', 'entertainment', 'youtube', 'netflix', 'twitch',
            'spotify', 'gaming', 'tv show'
        ]
        
        logger.info(
            "Screen analysis service initialized",
            code_patterns_count=len(self.code_patterns),
            distraction_keywords_count=len(settings.distraction_keywords),
            privacy_mode=True,
            no_raw_storage=True
        )
    
    def extract_text_from_image(self, image: np.ndarray) -> str:
        """
        Extract text from image using basic OCR techniques.
        
        Privacy: Extracted text is analyzed but never stored.
        Only behavioral metrics are preserved.
        """
        try:
            # Convert to grayscale for better text extraction
            gray = image_processor.convert_to_grayscale(image)
            
            # Basic text detection using contour analysis
            # This is a simplified approach - in production, use Tesseract OCR
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Find contours that might be text
            contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Filter contours by size and aspect ratio (text-like regions)
            text_regions = []
            for contour in contours:
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = w / h if h > 0 else 0
                
                # Text typically has aspect ratio between 0.1 and 10
                if 0.1 < aspect_ratio < 10 and w > 10 and h > 5:
                    text_regions.append((x, y, w, h))
            
            # For this implementation, we'll use a simple approach
            # In production, integrate with Tesseract OCR for better accuracy
            extracted_text = "simulated_text_extraction"  # Placeholder
            
            return extracted_text
            
        except Exception as e:
            logger.warning("Error extracting text from image", error=str(e))
            return ""
    
    def calculate_text_density(self, image: np.ndarray) -> float:
        """
        Calculate text density as a measure of information load.
        
        ML Relevance: Higher text density often indicates focused work.
        """
        try:
            # Convert to grayscale
            gray = image_processor.convert_to_grayscale(image)
            
            # Apply edge detection to find text-like regions
            edges = cv2.Canny(gray, 50, 150)
            
            # Calculate density of edges (proxy for text density)
            edge_density = np.sum(edges > 0) / edges.size
            
            # Normalize to 0-1 range
            text_density = min(edge_density * 10, 1.0)  # Scale factor based on experimentation
            
            return text_density
            
        except Exception as e:
            logger.warning("Error calculating text density", error=str(e))
            return 0.0
    
    def detect_code_patterns(self, text: str) -> bool:
        """
        Detect code patterns in extracted text.
        
        ML Relevance: Code detection indicates development activity.
        """
        try:
            for pattern in self.compiled_patterns:
                if pattern.search(text):
                    return True
            return False
            
        except Exception as e:
            logger.warning("Error detecting code patterns", error=str(e))
            return False
    
    def classify_content_type(self, text: str, image: np.ndarray) -> ContentType:
        """
        Classify screen content into productivity categories.
        
        ML Relevance: Content classification enables activity pattern analysis.
        """
        try:
            text_lower = text.lower()
            
            # Check for coding content
            if self.detect_code_patterns(text):
                return ContentType.CODING
            
            # Check for educational content
            educational_score = sum(1 for keyword in self.educational_keywords if keyword in text_lower)
            if educational_score >= 2:
                return ContentType.EDUCATIONAL
            
            # Check for entertainment content
            entertainment_score = sum(1 for keyword in self.entertainment_keywords if keyword in text_lower)
            if entertainment_score >= 2:
                return ContentType.ENTERTAINMENT
            
            # Check for documentation (structured text with headers, lists)
            if self._is_documentation(text):
                return ContentType.DOCUMENTATION
            
            # Default to unknown
            return ContentType.UNKNOWN
            
        except Exception as e:
            logger.warning("Error classifying content type", error=str(e))
            return ContentType.UNKNOWN
    
    def _is_documentation(self, text: str) -> bool:
        """Check if content appears to be documentation."""
        try:
            # Look for documentation patterns
            doc_patterns = [
                r'^#+\s',  # Markdown headers
                r'^\s*[-*+]\s',  # Bullet points
                r'^\d+\.\s',  # Numbered lists
                r'\[.*\]\(.*\)',  # Markdown links
                r'```',  # Code blocks
            ]
            
            pattern_count = 0
            for pattern in doc_patterns:
                if re.search(pattern, text, re.MULTILINE):
                    pattern_count += 1
            
            return pattern_count >= 2
            
        except Exception as e:
            logger.warning("Error checking documentation patterns", error=str(e))
            return False
    
    def detect_social_indicators(self, text: str) -> bool:
        """
        Detect social media and distraction indicators.
        
        Privacy: Only checks for presence, never stores URLs or content.
        """
        try:
            text_lower = text.lower()
            
            # Check for distraction keywords
            for keyword in settings.distraction_keywords:
                if keyword in text_lower:
                    return True
            
            # Check for URL patterns (but don't extract/store them)
            url_pattern = r'https?://[^\s]+'
            if re.search(url_pattern, text):
                return True
            
            # Check for social media indicators
            social_patterns = [
                r'@\w+',  # Mentions
                r'#\w+',  # Hashtags
                r'like|share|comment|follow',  # Social actions
            ]
            
            for pattern in social_patterns:
                if re.search(pattern, text_lower):
                    return True
            
            return False
            
        except Exception as e:
            logger.warning("Error detecting social indicators", error=str(e))
            return False
    
    def calculate_distraction_score(self, content_type: ContentType, has_social: bool, text_density: float) -> float:
        """
        Calculate distraction score based on multiple factors.
        
        ML Relevance: Higher scores indicate potential productivity disruption.
        """
        try:
            score = 0.0
            
            # Base score by content type
            content_scores = {
                ContentType.ENTERTAINMENT: 80.0,
                ContentType.UNKNOWN: 40.0,
                ContentType.EDUCATIONAL: 20.0,
                ContentType.DOCUMENTATION: 10.0,
                ContentType.CODING: 5.0,
            }
            
            score += content_scores.get(content_type, 40.0)
            
            # Social media penalty
            if has_social:
                score += 30.0
            
            # Text density factor (very high or very low can be distracting)
            if text_density < 0.1 or text_density > 0.8:
                score += 10.0
            
            return min(max(score, 0.0), 100.0)
            
        except Exception as e:
            logger.warning("Error calculating distraction score", error=str(e))
            return 50.0  # Default medium distraction
    
    async def analyze_screenshot(self, screenshot_data: str) -> ScreenAnalysisResponse:
        """
        Analyze screenshot for behavioral signals.
        
        Privacy: Processes screenshot in memory only, never stores raw data.
        Returns: Structured behavioral metrics for ML training.
        """
        start_time = cv2.getTickCount()
        
        try:
            # Decode and preprocess image
            image = image_processor.decode_base64_image(screenshot_data)
            if image is None:
                logger.warning("Failed to decode screenshot for analysis")
                return ScreenAnalysisResponse(
                    content_type=ContentType.UNKNOWN,
                    text_density=0.0,
                    has_code=False,
                    has_social_indicator=False,
                    distraction_score=50.0
                )
            
            # Resize for privacy and efficiency
            image = image_processor.resize_image(image)
            
            # Extract text (simulated - in production use OCR)
            extracted_text = self.extract_text_from_image(image)
            
            # Calculate metrics
            text_density = self.calculate_text_density(image)
            content_type = self.classify_content_type(extracted_text, image)
            has_code = self.detect_code_patterns(extracted_text)
            has_social = self.detect_social_indicators(extracted_text)
            distraction_score = self.calculate_distraction_score(content_type, has_social, text_density)
            
            # Calculate processing time
            processing_time = (cv2.getTickCount() - start_time) / cv2.getTickFrequency() * 1000
            
            logger.debug(
                "Screen analysis completed",
                content_type=content_type,
                text_density=text_density,
                has_code=has_code,
                has_social=has_social,
                distraction_score=distraction_score,
                processing_time_ms=processing_time
            )
            
            return ScreenAnalysisResponse(
                content_type=content_type,
                text_density=text_density,
                has_code=has_code,
                has_social_indicator=has_social,
                distraction_score=distraction_score,
                processing_time_ms=processing_time
            )
            
        except Exception as e:
            logger.error("Error in screen analysis", error=str(e))
            return ScreenAnalysisResponse(
                content_type=ContentType.UNKNOWN,
                text_density=0.0,
                has_code=False,
                has_social_indicator=False,
                distraction_score=50.0
            )
        
        finally:
            # Cleanup memory
            if 'image' in locals():
                image_processor.cleanup_image(image)

# Global service instance
screen_service = ScreenAnalysisService()