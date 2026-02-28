"""
MongoDB connection and collection management.

Privacy-safe database operations for behavioral signal storage.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
from typing import Dict, Any, Optional
import structlog
from datetime import datetime
from .config import settings

logger = structlog.get_logger()

class Database:
    """Async MongoDB client with privacy-safe operations."""
    
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.database = None
        
    async def connect(self):
        """Initialize MongoDB connection."""
        try:
            self.client = AsyncIOMotorClient(settings.mongodb_url)
            # Test connection
            await self.client.admin.command('ping')
            self.database = self.client[settings.database_name]
            
            # Create indexes for performance
            await self._create_indexes()
            
            logger.info(
                "Connected to MongoDB",
                database=settings.database_name,
                collections=["face_events", "screen_events"]
            )
        except ConnectionFailure as e:
            logger.error("Failed to connect to MongoDB", error=str(e))
            raise
    
    async def disconnect(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")
    
    async def _create_indexes(self):
        """Create database indexes for optimal query performance."""
        try:
            # Face events indexes
            face_collection = self.database.face_events
            await face_collection.create_index([("user_id", 1), ("timestamp", -1)])
            await face_collection.create_index([("session_id", 1)])
            
            # Screen events indexes
            screen_collection = self.database.screen_events
            await screen_collection.create_index([("user_id", 1), ("timestamp", -1)])
            await screen_collection.create_index([("session_id", 1)])
            
            logger.info("Database indexes created successfully")
        except Exception as e:
            logger.warning("Failed to create indexes", error=str(e))
    
    async def store_face_event(self, event_data: Dict[str, Any]):
        """
        Store face analysis event.
        
        Privacy: Only stores behavioral metrics, never raw images.
        """
        try:
            event_data["timestamp"] = datetime.utcnow()
            result = await self.database.face_events.insert_one(event_data)
            
            logger.debug(
                "Face event stored",
                event_id=str(result.inserted_id),
                user_id=event_data.get("user_id"),
                session_id=event_data.get("session_id")
            )
            return str(result.inserted_id)
        except Exception as e:
            logger.error("Failed to store face event", error=str(e))
            raise
    
    async def store_screen_event(self, event_data: Dict[str, Any]):
        """
        Store screen analysis event.
        
        Privacy: Only stores behavioral metrics, never raw screenshots.
        """
        try:
            event_data["timestamp"] = datetime.utcnow()
            result = await self.database.screen_events.insert_one(event_data)
            
            logger.debug(
                "Screen event stored",
                event_id=str(result.inserted_id),
                user_id=event_data.get("user_id"),
                session_id=event_data.get("session_id")
            )
            return str(result.inserted_id)
        except Exception as e:
            logger.error("Failed to store screen event", error=str(e))
            raise

# Global database instance
db = Database()
