"""
Working FastAPI application for WorkSpace AI Backend.
Fixed import issues for immediate testing.
"""

import logging
import sys
import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add app directory to Python path
app_dir = Path(__file__).parent
sys.path.insert(0, str(app_dir))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Simple configuration without Pydantic for now
class SimpleConfig:
    def __init__(self):
        self.debug = os.getenv("DEBUG", "false").lower() == "true"
        self.python_port = int(os.getenv("PYTHON_PORT", "8000"))
        self.mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        self.mongodb_db_name = os.getenv("MONGODB_DB_NAME", "workspace_ai")
        self.enable_auth = os.getenv("ENABLE_AUTH", "true").lower() == "true"
        self.enable_rate_limiting = os.getenv("ENABLE_RATE_LIMITING", "true").lower() == "true"
        self.enable_request_logging = os.getenv("ENABLE_REQUEST_LOGGING", "false").lower() == "true"
        self.enable_metrics = os.getenv("ENABLE_METRICS", "false").lower() == "true"
        self.log_level = os.getenv("LOG_LEVEL", "INFO")
        self.allowed_origins = [
            "http://localhost:3000",
            "http://localhost:5000", 
            "http://localhost:8000",
            "https://workspace-frontend-liard.vercel.app",
            "chrome-extension://*"  # Allow all Chrome extensions
        ]

def get_simple_config():
    """Get configuration instance."""
    return SimpleConfig()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("🚀 Starting WorkSpace AI Backend...")
    logger.info("✅ Application started successfully")
    yield
    logger.info("🛑 Shutting down WorkSpace AI Backend...")

# Create FastAPI application
config = get_simple_config()
app = FastAPI(
    title="WorkSpace AI Backend",
    description="Production-grade AI backend for cognitive performance system",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if config.debug else None,
    redoc_url="/redoc" if config.debug else None
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "type": "HTTPException"}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    logger.error(f"❌ Unexpected error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "type": "UnexpectedError"}
    )

# OPTIONS handler for CORS
@app.options("/{full_path:path}")
async def options_handler(request: Request, full_path: str):
    """Handle OPTIONS preflight requests."""
    origin = request.headers.get("origin", "")
    response = Response()
    
    if origin in config.allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    else:
        response.headers["Access-Control-Allow-Origin"] = config.allowed_origins[0]
    
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Max-Age"] = "3600"
    
    return response

# Health check endpoints
@app.get("/health")
async def health():
    """Basic health check."""
    from datetime import datetime
    return {
        "status": "ok",
        "python": True,
        "time": datetime.utcnow().isoformat() + "Z"
    }

@app.get("/health/detailed")
async def detailed_health():
    """Detailed health check."""
    from datetime import datetime
    return {
        "status": "ok",
        "python": True,
        "time": datetime.utcnow().isoformat() + "Z",
        "database": "not_connected",  # Would connect to MongoDB in full version
        "config": {
            "debug": config.debug,
            "auth_enabled": config.enable_auth,
            "rate_limiting": config.enable_rate_limiting,
            "metrics": config.enable_metrics
        }
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with basic information."""
    return {
        "name": "WorkSpace AI Backend",
        "version": "1.0.0",
        "status": "running",
        "debug": config.debug,
        "docs": "/docs" if config.debug else "disabled"
    }

# Screen analysis endpoint (mock implementation)
@app.post("/analyze/screen")
async def analyze_screen(request: dict):
    """Analyze screen content."""
    try:
        screenshot_data = request.get("screenshot_data", "")
        user_id = request.get("user_id")
        session_id = request.get("session_id")
        
        if not screenshot_data:
            raise HTTPException(status_code=400, detail="screenshot_data is required")
        
        # Mock analysis result
        result = {
            "content_type": "educational",
            "distraction_score": 15.5,
            "focus_score": 84.5,
            "detected_indicators": ["text_content", "structured_layout"]
        }
        
        from datetime import datetime
        return {
            "success": True,
            "analysis_type": "screen",
            "user_id": user_id,
            "session_id": session_id,
            "result": result,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Screen analysis error: {e}")
        raise HTTPException(status_code=500, detail="Screen analysis failed")

# Focus analysis endpoint (mock implementation)
@app.post("/analyze/focus")
async def analyze_focus(request: dict):
    """Analyze user focus."""
    try:
        frame_data = request.get("frame_data", "")
        user_id = request.get("user_id")
        session_id = request.get("session_id")
        
        if not frame_data:
            raise HTTPException(status_code=400, detail="frame_data is required")
        
        # Mock analysis result
        result = {
            "content_type": "neutral",
            "distraction_score": 25.0,
            "focus_score": 75.0,
            "fatigue_score": 30.0,
            "detected_indicators": ["eye_contact", "upright_posture"]
        }
        
        from datetime import datetime
        return {
            "success": True,
            "analysis_type": "focus",
            "user_id": user_id,
            "session_id": session_id,
            "result": result,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Focus analysis error: {e}")
        raise HTTPException(status_code=500, detail="Focus analysis failed")

# Tab analysis endpoint (mock implementation)
@app.post("/analyze/tab")
async def analyze_tab(request: dict):
    """Analyze tab content."""
    try:
        url = request.get("url", "")
        title = request.get("title", "")
        
        if not url:
            raise HTTPException(status_code=400, detail="url is required")
        
        # Simple classification logic
        url_lower = url.lower()
        title_lower = title.lower()
        
        # Educational content detection
        educational_keywords = [
            # General education terms
            "tutorial", "learn", "education", "course", "lecture", "educational",
            "study", "studying", "academic", "university", "college", "professor",
            "instructor", "teacher", "explained", "explanation", "guide", "how to",
            "introduction", "basics", "fundamentals", "concepts", "understanding",
            "masterclass", "training", "seminar", "webinar", "revision", "syllabus",
            "roadmap", "prep", "preparation", "summary", "analysis", "crash course",
            "bootcamp", "certification", "degree", "diploma", "syllabus", "notes",
            "worksheet", "assignment", "homework", "exam prep", "test prep", "flashcards",
            
            # Math terms
            "math", "mathematics", "calculus", "algebra", "geometry", "trigonometry",
            "derivative", "integral", "limit", "function", "equation", "theorem",
            "proof", "linear algebra", "vector", "matrix", "statistics", "probability",
            "euler", "pi", "golden ratio", "fibonacci", "prime", "fractal",
            "differential equations", "discrete math", "topology", "number theory",
            "set theory", "combinatorics", "graph theory", "complex analysis", "real analysis",
            "arithmetic", "fractions", "decimals", "percentages", "ratios",
            
            # Science terms
            "physics", "chemistry", "biology", "quantum", "mechanic", "thermodynamics",
            "electromagnetism", "neuroscience", "genetics", "astronomy", "cosmology",
            "organic chemistry", "inorganic chemistry", "biochemistry", "ecology",
            "microbiology", "anatomy", "physiology", "geology", "earth science",
            "meteorology", "oceanography", "paleontology", "zoology", "botany",
            "astrophysics", "particle physics", "relativity", "kinematics", "dynamics",
            
            # History and Humanities
            "history", "geography", "political science", "civics", "economics",
            "sociology", "psychology", "anthropology", "philosophy", "literature",
            "world history", "ancient history", "modern history", "civilization",
            "renaissance", "industrial revolution", "world war", "cold war",
            
            # Languages and Arts
            "english grammar", "vocabulary", "linguistics", "language learning",
            "spanish", "french", "german", "mandarin", "japanese", "korean", "hindi",
            "music theory", "art history", "design principles", "color theory",
            
            # Computer science / programming
            "programming", "coding", "computer science", "algorithm", "data structure",
            "python", "javascript", "machine learning", "neural network", "ai",
            "artificial intelligence", "software engineering", "binary", "algorithmic",
            "react", "node", "typescript", "c++", "java", "golang", "rust", "linux",
            "docker", "kubernetes", "database", "sql", "nosql", "system design",
            "html", "css", "web development", "mobile development", "app development",
            "cybersecurity", "ethical hacking", "cryptography", "blockchain", "cloud computing",
            "aws", "azure", "gcp", "devops", "git", "github", "api", "rest", "graphql",
            
            # Educational channel names (Global)
            "3blue1brown", "3 blue 1 brown", "khan academy", "khanacademy",
            "crash course", "crashcourse", "veritasium", "numberphile", "minutephysics",
            "ted-ed", "ted ed", "smarter every day", "scishow", "sixty symbols",
            "periodic videos", "vsauce", "minuteearth", "kurzgesagt", "cody's lab",
            "mark rober", "steve mould", "tom scott", "computerphile", "freecodecamp",
            "fireship", "traversy media", "programming with mosh", "the organic chemistry tutor",
            "lex fridman", "hosh", "mit opencourseware", "standford online", "harvard course",
            "yale courses", "coursera", "edx", "udacity", "udemy", "pluralsight", "codecademy",
            "bro code", "kevin stratvert", "networkchuck", "david bombal", "andrew ng",
            
            # Indian education (JEE/NEET/UPSC)
            "unacademy", "byju's", "vedantu", "toppr", "kayson education",
            "physics wallah", "chemistry wallah", "biology wallah", "math wallah",
            "jee", "neet", "iit jee", "aiims", "medical entrance", "engineering entrance",
            "jee main", "jee advanced", "neet pg", "neet ug", "iit", "aiims",
            "cbse", "ncert", "state board", "icse", "isc", "igcse", "ib",
            "apni kaksha", "aman dhattarwal", "code with harry", "gate", "upsc",
            "ssc", "banking exams", "nda", "cat exam", "clat", "cuet",
            "magnet brains", "study iq", "drishti ias", "vision ias", "let's tute",
            
            # Indian educational topics
            "electrostatics", "magnetism", "optics", "modern physics", "mechanics",
            "organic chemistry", "physical chemistry", "inorganic chemistry",
            "botany", "zoology", "human physiology", "genetics and evolution",
            "coordinate geometry", "trigonometry", "calculus", "algebra", "statistics",
            "kinematics", "thermodynamics", "polymers", "biomolecules", "environmental issues",
            "p block", "s block", "d block", "f block elements", "haloalkanes", "haloarenes",
            
            # Educational phrases
            "what is", "why does", "how does", "explained simply", "visualized",
            "the math of", "the physics of", "proof", "intuition", "behind the scenes",
            "deep dive", "everything you need to know", "in 10 minutes", "full course",
            "for beginners", "step by step", "from scratch", "crash course",
            "part 1", "part 2", "chapter 1", "chapter 2", "lesson 1", "lesson 2",
            "complete guide", "ultimate guide", "mastering", "learn to code"
        ]
        is_educational = any(keyword in title_lower for keyword in educational_keywords)
        
        # Distraction detection
        distraction_sites = ["instagram.com", "facebook.com", "tiktok.com", "twitter.com", "reddit.com"]
        is_distraction_site = any(site in url_lower for site in distraction_sites)
        
        # Distraction detection - expanded for comprehensive coverage
        distraction_keywords = [
            # General entertainment
            "funny", "meme", "memes", "prank", "pranks", "challenge", "challenges",
            "vlog", "vlogs", "reaction", "reactions", "drama", "celebrity",
            "news", "trending", "viral", "gossip", "entertainment", "hilarious",
            "try not to laugh", "cringe", "epic", "mind blowing", "caught on camera",
            "humor", "joke", "jokes", "comedy sketch", "laugh", "laughing", "weird",
            "crazy", "insane", "unbelievable", "shocking", "exposed", "canceled",
            
            # Music and dance
            "music video", "dance", "song", "album", "track", "remix",
            "concert", "performance", "cover song", "dance challenge",
            "tiktok dance", "reels", "shorts", "lyric video", "karaoke", "rap battle",
            "pop", "hip hop", "beats", "lofi", "dj", "edm", "kpop", "bts", "blackpink",
            "taylor swift", "drake", "weekend", "ariana grande", "justin bieber",
            "billie eilish", "trap", "party mix", "chill mix", "bass boosted",
            
            # Gaming
            "gaming", "gameplay", "lets play", "playthrough", "walkthrough",
            "esports", "tournament", "stream", "live stream", "gamer", "fortnite",
            "minecraft", "gta", "valorant", "roblox", "call of duty", "pubg", "bgmi",
            "speedrun", "mods", "rage quit", "highlights", "montage", "gacha",
            "apex legends", "league of legends", "csgo", "counter strike", "smash bros",
            "nintendo", "playstation", "xbox", "twitch", "discord", "free fire", "among us",
            "funny moments gaming", "glitch", "hacks", "cheats", "let's play",
            
            # Comedy and parody
            "comedy", "parody", "roast", "roasts", "stand up", "funny moments",
            "fail", "fails", "epic fail", "try not to laugh", "funny videos",
            "skit", "sketch", "bloopers", "satire", "spoof", "outtakes",
            
            # Content creators (Global & Indian)
            "bb ki vines", "carryminati", "bhuvan bam", "ashish chanchlani",
            "mumbiker nikhil", "triggered insaan", "round2hell",
            "sourav joshi", "nisha guragain", "mr. beast", "jake paul",
            "logan paul", "david dobrik", "emma chamberlain", "pewdiepie",
            "ishowspeed", "kai cenat", "xqc", "sidemen", "ksi", "elvish yadav",
            "thugesh", "fukra insaan", "technical guruji", "flying beast",
            "harsh", "beniwal", "harsh beniwal", "amit bhadana", "zakir khan", "munawar faruqui",
            "samay raina", "tanmay bhat", "bassi", "andrew tate", "trisha paytas",
            "dream", "tommyinnit", "markiplier", "jacksepticeye", "smosh",
            
            # Indian entertainment
            "bollywood", "movie clip", "movie scene", "trailer", "teaser",
            "behind the scenes", "making of", "interview", "celebrity interview",
            "talk show", "reality show", "web series", "tv show", "kapil sharma",
            "bigg boss", "splitsvilla", "roadies", "tollywood", "kollywood",
            "koffee with karan", "taarak mehta", "tmkoc", "cid", "indian idol",
            "shark tank india", "hustle", "mtv", "amazon prime video", "netflix india",
            
            # Social media trends
            "instagram reels", "tiktok trends", "youtube shorts", "viral video",
            "trending dance", "challenge video", "lip sync", "transition",
            "pov", "storytime", "aesthetic", "grwm", "day in my life",
            "photo dump", "outfit check", "vibes", "glow up",
            
            # Sports entertainment
            "cricket highlights", "football highlights", "sports fails",
            "athlete moments", "best plays", "top 10", "compilation",
            "wwe", "ufc", "boxing", "ipl", "fifa", "nba", "messi", "ronaldo",
            "kohli", "dhoni", "rohit sharma", "sachin", "world cup", "olympics",
            "wrestlemania", "smackdown", "raw", "premier league", "champions league",
            
            # Lifestyle and fashion
            "haul", "lookbook", "fashion", "beauty", "makeup tutorial",
            "lifestyle vlog", "daily routine", "get ready with me",
            "room tour", "house tour", "shopping", "outfit of the day", "ootd",
            "skincare routine", "hair tutorial", "nails", "sneakerhead", "streetwear",
            
            # Food entertainment
            "food porn", "mukbang", "eating show", "cooking show",
            "recipe", "food challenge", "taste test", "street food",
            "eating 10000 calories", "spicy challenge", "asmr eating",
            "food review", "gordon ramsay", "masterchef", "baking fail",
            
            # Tech entertainment (non-educational)
            "unboxing", "tech review", "phone review", "gadget review",
            "drop test", "destruction", "tech entertainment", "iphone vs",
            "samsung vs", "is it worth it", "dont buy this", "buying the most expensive",
            
            # General non-educational
            "top 10", "top 5", "best of", "worst of", "compilation",
            "montage", "super cut", "edit", "funny edit", "meme compilation",
            "satisfying", "asmr", "conspiracy", "scary", "ghost hunt",
            "mrbeast", "mr beast", "tier list", "ranking", "i bought", "i spent",
            "i survived", "hide and seek", "100 days", "in real life", "irl"
        ]
        
        is_distracting = any(keyword in title_lower for keyword in distraction_keywords)
        
        # YouTube handling — "guilty until proven educational"
        is_youtube = "youtube.com" in url_lower or "youtu.be" in url_lower
        is_youtube_educational = is_youtube and is_educational and not is_distracting
        is_youtube_distracting = is_youtube and is_distracting
        
        logger.info(f"📊 Tab analysis: url={url_lower[:80]}, title={title_lower[:80]}")
        logger.info(f"📊 Flags: youtube={is_youtube}, edu={is_educational}, distract={is_distracting}")
        
        if is_youtube_educational:
            content_type = "educational"
            distraction_score = 5.0
            recommended_action = "none"
        elif is_youtube_distracting:
            content_type = "high_distraction"
            distraction_score = 90.0
            recommended_action = "close_tab"
        elif is_distraction_site:
            content_type = "high_distraction"
            distraction_score = 90.0
            recommended_action = "close_tab"
        elif is_youtube:
            # Default: unknown YouTube content = distracting
            content_type = "high_distraction"
            distraction_score = 85.0
            recommended_action = "close_tab"
        else:
            content_type = "neutral"
            distraction_score = 40.0
            recommended_action = "show_banner"
        
        logger.info(f"📊 Result: type={content_type}, score={distraction_score}, action={recommended_action}")
        
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
        
        from datetime import datetime
        return {
            "success": True,
            "analysis_type": "browser_tab",
            "result": result,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Tab analysis error: {e}")
        raise HTTPException(status_code=500, detail="Tab analysis failed")

# Posture analysis endpoint (mock implementation)
@app.post("/analyze/posture")
async def analyze_posture(request: dict):
    """Analyze user posture."""
    try:
        frame_data = request.get("frame_data", "")
        user_id = request.get("user_id")
        session_id = request.get("session_id")
        
        if not frame_data:
            raise HTTPException(status_code=400, detail="frame_data is required")
        
        # Mock analysis result
        result = {
            "posture_status": "good",
            "analysis_timestamp": "2024-01-15T10:30:00.000Z",
            "recommendations": []
        }
        
        from datetime import datetime
        return {
            "success": True,
            "analysis_type": "posture",
            "user_id": user_id,
            "session_id": session_id,
            "result": result,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Posture analysis error: {e}")
        raise HTTPException(status_code=500, detail="Posture analysis failed")

if __name__ == "__main__":
    logger.info(f"🚀 Starting WorkSpace AI Backend on port {config.python_port}")
    logger.info("🔌 AI detection endpoints enabled")
    logger.info("📊 Mock implementations (replace with real AI models)")
    
    import uvicorn
    uvicorn.run(
        "working_main:app",
        host="0.0.0.0",
        port=config.python_port,
        reload=config.debug,
        log_level=config.log_level.lower()
    )
