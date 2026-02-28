"""
Simplified FastAPI application for testing.
"""

import logging
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="WorkSpace AI Backend - Test",
    description="Simplified test version",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "python": True,
        "time": "2024-01-15T10:30:00.000Z"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "name": "WorkSpace AI Backend",
        "version": "1.0.0",
        "status": "running",
        "test_mode": True
    }

# Simple screen analysis endpoint (mock)
@app.post("/analyze/screen")
async def analyze_screen(payload: dict):
    try:
        # Mock analysis result
        result = {
            "content_type": "educational",
            "distraction_score": 15.5,
            "focus_score": 84.5,
            "detected_indicators": ["text_content", "structured_layout"]
        }
        
        return {
            "success": True,
            "analysis_type": "screen",
            "user_id": payload.get("user_id"),
            "session_id": payload.get("session_id"),
            "result": result,
            "timestamp": "2024-01-15T10:30:00.000Z"
        }
    except Exception as e:
        logger.error(f"Screen analysis error: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed")

# Simple tab analysis endpoint (mock)
@app.post("/analyze/tab")
async def analyze_tab(payload: dict):
    try:
        url = payload.get("url", "").lower()
        title = payload.get("title", "").lower()
        
        # Simple classification logic
        if "youtube.com" in url and any(keyword in title for keyword in ["tutorial", "learn", "education"]):
            content_type = "educational"
            distraction_score = 10.0
            recommended_action = "none"
        elif any(site in url for site in ["instagram.com", "facebook.com", "tiktok.com"]):
            content_type = "high_distraction"
            distraction_score = 90.0
            recommended_action = "close_tab"
        else:
            content_type = "neutral"
            distraction_score = 40.0
            recommended_action = "show_banner"
        
        result = {
            "content_type": content_type,
            "distraction_score": distraction_score,
            "focus_score": max(0, 100 - distraction_score),
            "is_distraction": distraction_score > 50,
            "severity": "high" if distraction_score > 70 else "medium" if distraction_score > 30 else "low",
            "site_name": url.split("/")[2] if "/" in url else "unknown",
            "warning_level": "high" if distraction_score > 70 else "medium" if distraction_score > 30 else "low",
            "recommended_action": recommended_action,
            "detected_indicators": [content_type]
        }
        
        return {
            "success": True,
            "analysis_type": "browser_tab",
            "result": result,
            "timestamp": "2024-01-15T10:30:00.000Z"
        }
    except Exception as e:
        logger.error(f"Tab analysis error: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed")

# Error handler
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "type": "UnexpectedError"}
    )

if __name__ == "__main__":
    logger.info("🚀 Starting WorkSpace AI Backend (Test Mode) on port 8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
