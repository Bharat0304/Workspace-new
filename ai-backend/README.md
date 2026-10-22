# WorkSpace AI Backend

A production-grade AI backend for cognitive performance system, built with FastAPI and following clean architecture principles.

## 🏗️ Architecture Overview

This backend is designed to be **detection-only and stateless**, focusing purely on AI analysis without making enforcement decisions. It separates concerns clearly:

- **AI Detection**: Screen classification, focus scoring, posture analysis, tab classification
- **No Enforcement**: No blocking decisions, no tab closing, no strictness levels
- **Stateless**: No in-memory session storage, uses MongoDB for persistence
- **Clean Architecture**: Modular structure with proper separation of concerns

## 📁 Project Structure

```
ai-backend/
│
├── app/
│ ├── main.py                 # FastAPI application entrypoint
│ ├── core/                   # Core configuration and infrastructure
│ │ ├── config.py            # Settings and environment configuration
│ │ ├── database.py          # MongoDB connection and collections
│ │ └── auth.py              # Clerk JWT authentication
│ │
│ ├── api/                    # API layer
│ │ └── routes/              # API endpoints
│ │   ├── health.py          # Health check endpoints
│ │   ├── analyze_screen.py  # Screen analysis endpoints
│ │   ├── analyze_focus.py   # Focus analysis endpoints
│ │   ├── analyze_tab.py     # Tab analysis endpoints
│ │   ├── analyze_posture.py # Posture analysis endpoints
│ │   └── session.py         # Session management endpoints
│ │
│ ├── services/               # Business logic layer
│ │ ├── screen_service.py    # Screen content analysis
│ │ ├── focus_service.py     # Focus detection
│ │ ├── tab_service.py       # Tab classification and caching
│ │ ├── posture_service.py   # Posture analysis
│ │   └── session_service.py # Session lifecycle management
│ │
│ ├── models/                 # Data models
│ │ ├── requests.py          # Request Pydantic models
│ │   └── responses.py        # Response Pydantic models
│ │
│ └── utils/                  # Utilities
│   └── cache.py             # URL caching utilities
│
├── requirements.txt           # Python dependencies
├── .env.example              # Environment variables template
└── API_EXAMPLES.md           # API documentation with examples
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- MongoDB 5.0+
- Clerk account (for authentication, optional)

### Installation

1. **Clone and setup**:
```bash
cd ai-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB**:
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:5.0

# Or install locally
mongod
```

4. **Run the application**:
```bash
cd app
python main.py
```

The API will be available at `http://localhost:8000`

### Development Mode

For development with auto-reload:
```bash
# Set DEBUG=true in .env
python main.py
```

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```bash
# Application
DEBUG=false
PYTHON_PORT=8000

# Database
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=workspace_ai

# Authentication (Clerk)
CLERK_JWKS_URL=https://your-domain.clerk.accounts.dev/.well-known/jwks.json
CLERK_JWT_AUDIENCE=your-audience
CLERK_JWT_ISSUER=https://your-domain.clerk.accounts.dev

# CORS
FRONTEND_URL=http://localhost:3000
FRONTEND_VERCEL_URL=https://your-app.vercel.app

# Cache
URL_CACHE_TTL=60
```

### Database Collections

The backend uses MongoDB with these collections:

- **sessions**: Study session data
- **events**: Analytics events and analysis results
- **url_cache**: Cached tab analysis results (TTL 60s)

## 📊 API Endpoints

### Health Check
- `GET /health` - Basic health check
- `GET /health/detailed` - Health check with database connectivity

### Analysis Endpoints
- `POST /analyze/screen` - Screen content analysis
- `POST /analyze/focus` - Focus detection from video frames
- `POST /analyze/tab` - Tab content classification
- `POST /analyze/posture` - Posture analysis

### Session Management
- `POST /session/start` - Start a new study session
- `GET /session/{session_id}` - Get session details
- `PUT /session/{session_id}/end` - End session with results
- `GET /session/user/{user_id}` - Get user sessions
- `GET /session/focus/current` - Get current focus session

## 🎯 Key Features

### Detection-Only Architecture
The backend **only performs AI detection** and returns structured signals:

```json
{
  "content_type": "educational | neutral | high_distraction",
  "distraction_score": 85.0,
  "focus_score": 15.0,
  "fatigue_score": 30.0,
  "detected_indicators": ["social_media", "entertainment_patterns"]
}
```

### Smart Tab Analysis
- **Educational Content Detection**: Advanced YouTube educational content detection
- **URL Caching**: 60-second TTL cache to improve performance
- **Content Classification**: Educational, neutral, or high distraction
- **No Blocking Decisions**: Pure classification without enforcement

### Session Management
- **MongoDB Persistence**: No in-memory session storage
- **Event Tracking**: All analysis events are logged
- **User Isolation**: Users can only access their own sessions

### Authentication
- **Clerk Integration**: JWT-based authentication
- **Optional Auth**: Can run without authentication for development
- **Graceful Fallbacks**: Proper error handling for auth failures

## 🔒 Security Considerations

### CORS Configuration
- Dynamic origin handling for Vercel deployments
- Proper preflight request handling
- Browser extension compatibility

### Input Validation
- Pydantic models for all requests/responses
- Base64 image validation
- URL format validation

### Authentication
- JWT token verification with proper issuer/audience validation
- User session isolation
- Optional authentication for development

## 🧠 AI Modules

The backend expects AI modules in `ai_modules/analyzers.py`:

```python
def analyze_screen_from_b64(image_data: str) -> Dict[str, Any]
def analyze_focus_from_b64(frame_data: str) -> Dict[str, Any]  
def analyze_distraction_from_window(window_info: Dict) -> Dict[str, Any]
```

If these modules are not available, the backend provides mock implementations for development.

## 📈 Performance Features

### Caching Strategy
- **URL Analysis Cache**: 60-second TTL for tab analysis results
- **JWKS Cache**: 5-minute TTL for authentication keys
- **MongoDB Indexes**: Optimized queries for sessions and events

### Async Architecture
- **Motor Driver**: Async MongoDB operations
- **FastAPI**: Async request handling
- **Concurrent Processing**: Multiple simultaneous analyses

## 🔍 Monitoring & Logging

### Structured Logging
```python
logger.info("✅ Session created: session_123")
logger.warning("⚠️ Failed to record event: e")
logger.error("❌ Analysis failed: error")
```

### Health Checks
- Basic service health
- Database connectivity verification
- Detailed diagnostics

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app/main.py"]
```

### Environment-Specific Configs
- **Development**: Debug mode, local MongoDB
- **Staging**: Production-like setup with test data
- **Production**: Full security, monitoring, logging

## 🧪 Testing

Run tests with:
```bash
pytest
```

Test coverage includes:
- API endpoint testing
- Service layer testing
- Database operations
- Authentication flows

## 📚 API Documentation

See `API_EXAMPLES.md` for detailed request/response examples for all endpoints.

## 🤝 Integration Points

This backend is designed to integrate with:
- **Next.js Turborepo Frontend**: Via REST API
- **Browser Extension**: Via CORS-enabled endpoints
- **Express Cognitive Engine**: Via shared MongoDB collections

## 🔄 Migration from Monolith

If migrating from the original monolithic `app.py`:

1. **Data Migration**: Export in-memory sessions to MongoDB
2. **Endpoint Updates**: Update frontend to use new endpoint structure
3. **Authentication**: Configure Clerk JWT properly
4. **CORS**: Update allowed origins for your domains

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection**: Ensure MongoDB is running and accessible
2. **CORS Errors**: Check `FRONTEND_URL` and allowed origins
3. **Authentication**: Verify Clerk configuration and JWT keys
4. **AI Modules**: Ensure `ai_modules` is available or use mock implementations

### Debug Mode

Set `DEBUG=true` in `.env` for:
- Detailed error responses
- API documentation at `/docs`
- Enhanced logging

## 📄 License

This project is part of the WorkSpace AI Cognitive Performance System.

---

**Note**: This backend follows the principle of being "detection-only" - it performs AI analysis and returns structured signals without making any enforcement decisions. All blocking/strictness decisions should be implemented in client applications.
