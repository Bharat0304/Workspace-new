"""
Tab analysis service.

This module handles tab content classification, focusing on educational
content detection and distraction scoring. It only performs classification
without making blocking decisions.
"""

import logging
import re
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse
from app.models.responses import TabAnalysisResult
from app.core.database import get_collection, Collections
from app.core.config import get_settings

logger = logging.getLogger(__name__)

# Import AI modules (assuming they exist in ai_modules)
try:
    from ai_modules.analyzers import analyze_distraction_from_window
except ImportError:
    logger.warning("⚠️ ai_modules.analyzers not available, using mock implementation")
    
    def analyze_distraction_from_window(window_info: Dict[str, Any]) -> Dict[str, Any]:
        """Mock implementation when AI modules are not available."""
        url = window_info.get("url", "").lower()
        title = window_info.get("title", "").lower()
        
        # Educational keywords
        educational_keywords = [
            "tutorial", "lecture", "course", "class", "lesson", "learn", "learning",
            "education", "educational", "study", "studying", "academic", "university",
            "college", "professor", "instructor", "teacher", "explained", "explanation",
            "guide", "how to", "introduction", "basics", "fundamentals", "concepts",
            "math", "mathematics", "calculus", "algebra", "geometry", "physics",
            "chemistry", "biology", "programming", "coding", "computer science",
            "algorithm", "python", "javascript", "react", "machine learning"
        ]
        
        # Distraction keywords
        distraction_keywords = [
            "instagram", "facebook", "tiktok", "twitter", "reddit", "snapchat",
            "netflix", "youtube", "entertainment", "gaming", "games", "memes"
        ]
        
        # Check for educational content
        has_educational = any(keyword in title or keyword in url for keyword in educational_keywords)
        has_distraction = any(keyword in title or keyword in url for keyword in distraction_keywords)
        
        if has_educational:
            content_type = "educational"
            distraction_score = 10.0
            severity = "low"
        elif has_distraction:
            content_type = "high_distraction"
            distraction_score = 85.0
            severity = "high"
        else:
            content_type = "neutral"
            distraction_score = 40.0
            severity = "medium"
        
        return {
            "content_type": content_type,
            "distraction_score": distraction_score,
            "is_distraction": distraction_score > 50,
            "severity": severity,
            "detected_indicators": [content_type]
        }


class TabService:
    """Service for tab content analysis and classification."""
    
    @staticmethod
    async def analyze_tab(url: str, title: Optional[str] = None) -> TabAnalysisResult:
        """
        Analyze tab content for educational value and distraction level.
        
        Args:
            url: Tab URL to analyze
            title: Optional tab title
            
        Returns:
            TabAnalysisResult: Structured analysis result
            
        Raises:
            ValueError: If URL is invalid
            RuntimeError: If analysis fails
        """
        try:
            logger.debug(f"🔍 Analyzing tab: {url}")
            
            # Validate input
            if not url:
                raise ValueError("URL cannot be empty")
            
            # Check cache first
            cached_result = await TabService._get_cached_analysis(url)
            if cached_result:
                logger.debug(f"📋 Using cached result for {url}")
                return cached_result
            
            # Always allow frontend/localhost URLs
            if TabService._is_frontend_url(url):
                result = TabAnalysisResult(
                    content_type="educational",
                    distraction_score=0.0,
                    is_distraction=False,
                    severity="low",
                    site_name=TabService._extract_site_name(url),
                    warning_level="none",
                    recommended_action="none"
                )
                await TabService._cache_analysis(url, result)
                return result
            
            # Special handling for YouTube
            if TabService._is_youtube_url(url):
                result = await TabService._analyze_youtube(url, title)
                await TabService._cache_analysis(url, result)
                return result
            
            # Create window info for general analysis
            window_info = {
                "title": title or "",
                "url": url,
                "process_name": "chrome.exe",  # Assume Chrome
                "active_time": 30
            }
            
            # Perform AI analysis
            raw_result = analyze_distraction_from_window(window_info)
            
            # Structure the result
            content_type = raw_result.get("content_type", "neutral")
            distraction_score = float(raw_result.get("distraction_score", 50))
            distraction_score = max(0, min(100, distraction_score))
            is_distraction = raw_result.get("is_distraction", distraction_score > 50)
            severity = raw_result.get("severity", "medium")
            
            # Determine warning level and recommended action
            if distraction_score >= 80:
                warning_level = "high"
                recommended_action = "close_tab"
            elif distraction_score >= 60:
                warning_level = "medium"
                recommended_action = "show_overlay"
            elif distraction_score >= 40:
                warning_level = "low"
                recommended_action = "show_banner"
            else:
                warning_level = "none"
                recommended_action = "none"
            
            result = TabAnalysisResult(
                content_type=content_type,
                distraction_score=distraction_score,
                focus_score=max(0, 100 - distraction_score),
                is_distraction=is_distraction,
                severity=severity,
                site_name=TabService._extract_site_name(url),
                warning_level=warning_level,
                recommended_action=recommended_action,
                detected_indicators=raw_result.get("detected_indicators", [content_type])
            )
            
            # Cache the result
            await TabService._cache_analysis(url, result)
            
            logger.debug(f"✅ Tab analysis completed: {content_type} ({distraction_score:.1f})")
            return result
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"❌ Tab analysis failed: {e}")
            raise RuntimeError(f"Tab analysis failed: {str(e)}")
    
    @staticmethod
    async def _get_cached_analysis(url: str) -> Optional[TabAnalysisResult]:
        """Get cached analysis result for URL."""
        try:
            collection = await get_collection(Collections.URL_CACHE)
            cached = await collection.find_one({"url": url})
            
            if cached:
                result_data = cached.get("result")
                if result_data:
                    return TabAnalysisResult(**result_data)
            
            return None
            
        except Exception as e:
            logger.warning(f"⚠️ Failed to get cached analysis: {e}")
            return None
    
    @staticmethod
    async def _cache_analysis(url: str, result: TabAnalysisResult):
        """Cache analysis result for URL."""
        try:
            settings = get_settings()
            collection = await get_collection(Collections.URL_CACHE)
            
            from datetime import datetime, timedelta
            expires_at = datetime.utcnow() + timedelta(seconds=settings.url_cache_ttl)
            
            await collection.update_one(
                {"url": url},
                {
                    "$set": {
                        "url": url,
                        "result": result.dict(),
                        "expires_at": expires_at
                    }
                },
                upsert=True
            )
            
        except Exception as e:
            logger.warning(f"⚠️ Failed to cache analysis: {e}")
    
    @staticmethod
    def _is_frontend_url(url: str) -> bool:
        """Check if URL is a frontend/application URL."""
        url_lower = url.lower()
        return any([
            "workspace-frontend" in url_lower,
            "vercel.app" in url_lower,
            "localhost" in url_lower,
            "127.0.0.1" in url_lower
        ])
    
    @staticmethod
    def _is_youtube_url(url: str) -> bool:
        """Check if URL is a YouTube URL."""
        url_lower = url.lower()
        return "youtube.com" in url_lower or "youtu.be" in url_lower
    
    @staticmethod
    async def _analyze_youtube(url: str, title: Optional[str] = None) -> TabAnalysisResult:
        """Analyze YouTube URL with educational content detection."""
        url_lower = url.lower()
        title_lower = (title or "").lower().strip()
        
        # Check if it's a watch page (not embed, channel, etc.)
        has_watch_pattern = "/watch" in url_lower and "v=" in url_lower
        has_youtube_be_pattern = "youtu.be/" in url_lower
        is_excluded = any(pattern in url_lower for pattern in [
            "/embed", "/channel/", "/playlist", "/user/", "/c/", "/@",
            "/shorts/", "/results", "/feed", "/subscriptions", "/library"
        ])
        
        is_watch_page = (has_watch_pattern or has_youtube_be_pattern) and not is_excluded
        
        if not is_watch_page:
            # Non-watch pages are generally neutral
            return TabAnalysisResult(
                content_type="neutral",
                distraction_score=20.0,
                focus_score=80.0,
                is_distraction=False,
                severity="low",
                site_name="youtube.com",
                warning_level="none",
                recommended_action="none",
                detected_indicators=["youtube_non_watch_page"]
            )
        
        # Educational keywords for YouTube
        educational_keywords = [
            "tutorial", "lecture", "course", "class", "lesson", "learn", "learning",
            "education", "educational", "study", "studying", "academic", "university",
            "college", "professor", "instructor", "teacher", "explained", "explanation",
            "guide", "how to", "introduction", "basics", "fundamentals", "concepts",
            "math", "mathematics", "calculus", "algebra", "geometry", "trigonometry",
            "derivative", "integral", "limit", "function", "equation", "theorem",
            "physics", "chemistry", "biology", "organic chemistry", "quantum",
            "programming", "coding", "computer science", "algorithm", "python",
            "javascript", "react", "machine learning", "neural network", "ai"
        ]
        
        # Educational channel names
        educational_channels = [
            "3blue1brown", "khan academy", "crash course", "veritasium", "numberphile",
            "minutephysics", "ted-ed", "smarter every day", "scishow", "vsauce"
        ]
        
        # Check for educational markers
        has_educational_title = any(keyword in title_lower for keyword in educational_keywords)
        has_educational_channel = any(channel in url_lower or channel in title_lower 
                                     for channel in educational_channels)
        has_playlist = "playlist" in url_lower or "list=" in url_lower
        
        is_educational = has_educational_title or has_educational_channel or has_playlist
        
        if is_educational:
            return TabAnalysisResult(
                content_type="educational",
                distraction_score=5.0,
                focus_score=95.0,
                is_distraction=False,
                severity="low",
                site_name="youtube.com",
                warning_level="none",
                recommended_action="none",
                detected_indicators=["youtube_educational_content"]
            )
        else:
            return TabAnalysisResult(
                content_type="high_distraction",
                distraction_score=90.0,
                focus_score=10.0,
                is_distraction=True,
                severity="critical",
                site_name="youtube.com",
                warning_level="high",
                recommended_action="close_tab",
                detected_indicators=["youtube_non_educational_content"]
            )
    
    @staticmethod
    def _extract_site_name(url: str) -> str:
        """Extract site name from URL."""
        try:
            parsed = urlparse(url)
            return parsed.netloc.replace("www.", "")
        except Exception:
            return "unknown"
