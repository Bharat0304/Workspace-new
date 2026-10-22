"""
Database configuration and connection management.

This module handles MongoDB connections using Motor (async driver)
and provides database dependency injection for FastAPI.
"""

import logging
from typing import AsyncGenerator
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import get_settings

logger = logging.getLogger(__name__)

# Global database client and instance
_motor_client: AsyncIOMotorClient = None
_database: AsyncIOMotorDatabase = None


async def get_database() -> AsyncIOMotorDatabase:
    """
    Get database instance using dependency injection pattern.
    
    Returns:
        AsyncIOMotorDatabase: MongoDB database instance
        
    Raises:
        ConnectionError: If database connection fails
    """
    global _database
    
    if _database is None:
        settings = get_settings()
        
        # Skip MongoDB if URL is empty (demo mode)
        if not settings.mongodb_url or settings.mongodb_url.strip() == "":
            logger.info("🔧 Running in demo mode without MongoDB")
            # Create a mock database-like object
            class MockDatabase:
                def __getitem__(self, name):
                    return MockCollection()
            
            class MockCollection:
                async def insert_one(self, data):
                    logger.info(f"📝 Mock insert: {data}")
                    return type('MockResult', (), {'inserted_id': 'mock_id'})()
                
                async def find(self, filter=None):
                    logger.info(f"📋 Mock find: {filter}")
                    return []
                
                async def aggregate(self, pipeline):
                    logger.info(f"📊 Mock aggregate: {pipeline}")
                    return []
                
                async def create_index(self, index_spec, **kwargs):
                    logger.info(f"🔍 Mock create_index: {index_spec}")
                    return type('MockResult', (), {})()
                
                async def create_indexes(self, index_specs):
                    logger.info(f"🔍 Mock create_indexes: {index_specs}")
                    return type('MockResult', (), {})()
            
            _database = MockDatabase()
            return _database
        
        try:
            # Create client with connection pooling
            client = AsyncIOMotorClient(
                settings.mongodb_url,
                maxPoolSize=10,
                minPoolSize=1,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
            )
            
            # Test connection
            await client.admin.command('ping')
            
            _database = client[settings.mongodb_db_name]
            logger.info(f"✅ Connected to MongoDB: {settings.mongodb_db_name}")
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to MongoDB: {e}")
            raise ConnectionError(f"Database connection failed: {e}")
    
    return _database


async def get_collection(collection_name: str):
    """
    Get a specific collection from the database.
    
    Args:
        collection_name: Name of the collection
        
    Returns:
        Collection: MongoDB collection instance
    """
    db = await get_database()
    return db[collection_name]


# Collection names constants
class Collections:
    """MongoDB collection names."""
    SESSIONS = "sessions"
    EVENTS = "events"
    URL_CACHE = "url_cache"


async def create_indexes():
    """
    Create database indexes for optimal performance.
    
    This should be called during application startup.
    """
    try:
        db = await get_database()
        
        # Sessions indexes
        await db[Collections.SESSIONS].create_index("user_id")
        await db[Collections.SESSIONS].create_index("status")
        await db[Collections.SESSIONS].create_index("start_time")
        
        # Events indexes
        await db[Collections.EVENTS].create_index("user_id")
        await db[Collections.EVENTS].create_index("session_id")
        await db[Collections.EVENTS].create_index("timestamp")
        await db[Collections.EVENTS].create_index([("user_id", 1), ("timestamp", -1)])
        
        # URL cache indexes with TTL
        await db[Collections.URL_CACHE].create_index(
            "expires_at", 
            expireAfterSeconds=0
        )
        await db[Collections.URL_CACHE].create_index("url", unique=True)
        
        logger.info("✅ Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to create database indexes: {e}")
        raise


async def close_database_connection():
    """Close the database connection."""
    global _motor_client, _database
    
    if _motor_client:
        _motor_client.close()
        _motor_client = None
        _database = None
        logger.info("🔌 Database connection closed")
