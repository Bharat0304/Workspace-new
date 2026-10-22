"""
Production deployment script for WorkSpace AI Backend.

This script provides deployment utilities and configuration
for production environments.
"""

import os
import sys
import subprocess
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def check_python_version():
    """Check if Python version meets requirements."""
    if sys.version_info < (3, 11):
        logger.error("❌ Python 3.11+ is required")
        return False
    
    logger.info(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True


def install_dependencies():
    """Install required Python packages."""
    logger.info("📦 Installing dependencies...")
    
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ])
        logger.info("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Failed to install dependencies: {e}")
        return False


def setup_environment():
    """Set up environment configuration."""
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if not env_file.exists() and env_example.exists():
        logger.info("📝 Creating .env file from template...")
        try:
            with open(env_example, 'r') as f:
                env_content = f.read()
            
            with open(env_file, 'w') as f:
                f.write(env_content)
            
            logger.info("✅ .env file created. Please review and update configuration.")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to create .env file: {e}")
            return False
    
    if env_file.exists():
        logger.info("✅ .env file exists")
        return True
    
    logger.warning("⚠️ No .env file found. Please create one from .env.example")
    return False


def check_mongodb_connection():
    """Check MongoDB connection."""
    logger.info("🗄️ Checking MongoDB connection...")
    
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        from app.core.config import get_settings
        
        settings = get_settings()
        client = AsyncIOMotorClient(settings.mongodb_url, serverSelectionTimeoutMS=5000)
        
        # Test connection
        client.admin.command('ping')
        logger.info("✅ MongoDB connection successful")
        return True
        
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        logger.error("Please ensure MongoDB is running and accessible")
        return False


def create_directories():
    """Create necessary directories."""
    directories = [
        "logs",
        "uploads",
        "temp"
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        logger.info(f"📁 Directory ensured: {directory}")
    
    return True


def run_database_migrations():
    """Run database setup and migrations."""
    logger.info("🗄️ Running database setup...")
    
    try:
        import asyncio
        from app.core.database import create_indexes
        
        # Run async database setup
        asyncio.run(create_indexes())
        logger.info("✅ Database setup completed")
        return True
        
    except Exception as e:
        logger.error(f"❌ Database setup failed: {e}")
        return False


def validate_configuration():
    """Validate application configuration."""
    logger.info("⚙️ Validating configuration...")
    
    try:
        from app.core.config import get_settings
        
        settings = get_settings()
        
        # Check required settings
        required_settings = [
            "mongodb_url",
            "mongodb_db_name"
        ]
        
        missing_settings = []
        for setting in required_settings:
            if not getattr(settings, setting, None):
                missing_settings.append(setting)
        
        if missing_settings:
            logger.error(f"❌ Missing required settings: {missing_settings}")
            return False
        
        logger.info("✅ Configuration validation passed")
        return True
        
    except Exception as e:
        logger.error(f"❌ Configuration validation failed: {e}")
        return False


def run_health_check():
    """Run application health check."""
    logger.info("🏥 Running health check...")
    
    try:
        import asyncio
        from app.main import app
        
        # Test application startup
        async def test_startup():
            async with app.router.lifespan_context(app):
                logger.info("✅ Application startup successful")
                return True
        
        return asyncio.run(test_startup())
        
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        return False


def main():
    """Main deployment function."""
    logger.info("🚀 Starting WorkSpace AI Backend deployment...")
    
    # Deployment steps
    steps = [
        ("Python Version Check", check_python_version),
        ("Dependency Installation", install_dependencies),
        ("Environment Setup", setup_environment),
        ("Directory Creation", create_directories),
        ("Configuration Validation", validate_configuration),
        ("MongoDB Connection", check_mongodb_connection),
        ("Database Setup", run_database_migrations),
        ("Health Check", run_health_check)
    ]
    
    failed_steps = []
    
    for step_name, step_func in steps:
        logger.info(f"\n🔄 Running: {step_name}")
        try:
            if not step_func():
                failed_steps.append(step_name)
        except Exception as e:
            logger.error(f"❌ {step_name} failed with exception: {e}")
            failed_steps.append(step_name)
    
    # Summary
    logger.info("\n" + "="*50)
    logger.info("📊 DEPLOYMENT SUMMARY")
    logger.info("="*50)
    
    if not failed_steps:
        logger.info("🎉 All deployment steps completed successfully!")
        logger.info("🚀 Your WorkSpace AI Backend is ready for production!")
        logger.info("\n📋 Next steps:")
        logger.info("1. Review and update .env configuration")
        logger.info("2. Start the application: python app/main.py")
        logger.info("3. Visit http://localhost:8000/health to verify")
        logger.info("4. Check /docs for API documentation (if DEBUG=true)")
        return True
    else:
        logger.error("❌ Deployment failed!")
        logger.error(f"Failed steps: {', '.join(failed_steps)}")
        logger.error("\n🔧 Please resolve the issues above and try again.")
        return False


if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    success = main()
    sys.exit(0 if success else 1)
