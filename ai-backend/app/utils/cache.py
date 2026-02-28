"""
URL caching utility for tab analysis results.

This module provides caching functionality for URL analysis results
to improve performance and reduce redundant AI processing.
"""

import logging
from typing import Optional, Dict, Any
from ..core.database import get_collection, Collections
from ..models.responses import TabAnalysisResult

logger = logging.getLogger(__name__)


class URLCache:
    """Utility class for caching URL analysis results."""
    
    @staticmethod
    async def get(url: str) -> Optional[TabAnalysisResult]:
        """
        Get cached analysis result for URL.
        
        Args:
            url: URL to retrieve cached result for
            
        Returns:
            TabAnalysisResult: Cached result if found and valid, None otherwise
        """
        try:
            if not url:
                return None
            
            collection = await get_collection(Collections.URL_CACHE)
            cached = await collection.find_one({"url": url})
            
            if cached:
                result_data = cached.get("result")
                if result_data:
                    return TabAnalysisResult(**result_data)
            
            return None
            
        except Exception as e:
            logger.warning(f"⚠️ Failed to get cached URL analysis: {e}")
            return None
    
    @staticmethod
    async def set(url: str, result: TabAnalysisResult, ttl_seconds: int = 60) -> bool:
        """
        Cache analysis result for URL.
        
        Args:
            url: URL to cache result for
            result: Analysis result to cache
            ttl_seconds: Time-to-live in seconds
            
        Returns:
            bool: True if cached successfully, False otherwise
        """
        try:
            if not url or not result:
                return False
            
            collection = await get_collection(Collections.URL_CACHE)
            
            from datetime import datetime, timedelta
            expires_at = datetime.utcnow() + timedelta(seconds=ttl_seconds)
            
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
            
            logger.debug(f"📋 Cached analysis result for {url}")
            return True
            
        except Exception as e:
            logger.warning(f"⚠️ Failed to cache URL analysis: {e}")
            return False
    
    @staticmethod
    async def clear_expired() -> int:
        """
        Clear expired cache entries.
        
        Returns:
            int: Number of entries cleared
        """
        try:
            collection = await get_collection(Collections.URL_CACHE)
            
            from datetime import datetime
            result = await collection.delete_many({
                "expires_at": {"$lt": datetime.utcnow()}
            })
            
            if result.deleted_count > 0:
                logger.info(f"🧹 Cleared {result.deleted_count} expired cache entries")
            
            return result.deleted_count
            
        except Exception as e:
            logger.error(f"❌ Failed to clear expired cache: {e}")
            return 0
    
    @staticmethod
    async def clear_all() -> int:
        """
        Clear all cache entries.
        
        Returns:
            int: Number of entries cleared
        """
        try:
            collection = await get_collection(Collections.URL_CACHE)
            result = await collection.delete_many({})
            
            logger.info(f"🧹 Cleared all {result.deleted_count} cache entries")
            return result.deleted_count
            
        except Exception as e:
            logger.error(f"❌ Failed to clear cache: {e}")
            return 0
