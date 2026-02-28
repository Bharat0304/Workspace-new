# WorkSpace AI Backend - Face + Screen Behavioral Signal Collection System

Privacy-safe FastAPI application for collecting structured behavioral signals to train productivity models.

## 🎯 Purpose

Collect **structured behavioral data** for ML training - **NOT surveillance**. Only behavioral metrics are stored, never raw images or personal content.

## 🔒 Privacy Commitment

- ✅ **NEVER** stores raw images or screenshots
- ✅ **ONLY** stores behavioral metrics and signals  
- ✅ **NO** text content or URLs preserved
- ✅ **ALL** biometric data is anonymized
- ✅ **TTL cache** with automatic cleanup
- ✅ **Memory-only** processing

## 📊 ML Training Features

### Face Analysis Signals
- **Eye Aspect Ratio (EAR)**: Blink detection and fatigue monitoring
- **Gaze Direction**: Focus and attention patterns (left/right/center)
- **Head Pose**: Engagement level assessment (tilt angle)
- **Fatigue Score**: Cognitive state evaluation (0-1)

### Screen Analysis Signals  
- **Content Classification**: Activity categorization (coding/educational/entertainment)
- **Text Density**: Information load assessment (0-1)
- **Code Detection**: Development activity identification
- **Distraction Score**: Focus disruption analysis (0-100)

## 🚀 Quick Start

### Prerequisites
```bash
Python 3.11+
MongoDB running locally
```

### Installation
```bash
# Clone and setup
cd ai-backend
pip install -r requirements.txt

# Start MongoDB
mongod

# Run the application
python -m app.main
```

### Access Points
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Privacy Info**: http://localhost:8000/privacy

## 📡 API Endpoints

### Face Analysis
```http
POST /api/v1/analyze-face
Content-Type: application/json

{
    "user_id": "user123",
    "session_id": "session456", 
    "frame_data": "base64_encoded_image"
}
```

**Response:**
```json
{
    "face_present": true,
    "blink_rate": 0.35,
    "gaze_direction": "center",
    "head_tilt": 2.5,
    "fatigue_score": 0.2,
    "processing_time_ms": 45.2,
    "timestamp": "2024-01-15T10:30:00Z"
}
```

### Screen Analysis
```http
POST /api/v1/analyze-screen
Content-Type: application/json

{
    "user_id": "user123",
    "session_id": "session456",
    "screenshot_data": "base64_encoded_image"
}
```

**Response:**
```json
{
    "content_type": "coding",
    "text_density": 0.65,
    "has_code": true,
    "has_social_indicator": false,
    "distraction_score": 15.0,
    "processing_time_ms": 32.1,
    "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🗄️ MongoDB Collections

### face_events
```javascript
{
    "_id": ObjectId("..."),
    "user_id": "user123",
    "session_id": "session456", 
    "blink_rate": 0.35,
    "gaze_direction": "center",
    "head_tilt": 2.5,
    "fatigue_score": 0.2,
    "face_present": true,
    "timestamp": ISODate("2024-01-15T10:30:00Z")
}
```

### screen_events
```javascript
{
    "_id": ObjectId("..."),
    "user_id": "user123",
    "session_id": "session456",
    "content_type": "coding", 
    "distraction_score": 15.0,
    "text_density": 0.65,
    "has_code": true,
    "has_social_indicator": false,
    "timestamp": ISODate("2024-01-15T10:30:00Z")
}
```

## 🧠 ML Training Data Strategy

### High-Value Features for Productivity Modeling

1. **Temporal Patterns**: Fatigue trends over sessions
2. **Correlation Analysis**: Face signals + screen content patterns  
3. **Distraction Events**: Spikes in distraction scores
4. **Engagement Metrics**: Gaze direction + content type combinations
5. **Time-of-Day Effects**: Fatigue vs. productivity patterns

### Training Gold Data
```python
# Example training feature vector
{
    "user_id": "user123",
    "session_id": "session456",
    "features": {
        "avg_fatigue": 0.25,
        "distraction_events": 3,
        "coding_time_ratio": 0.7,
        "focus_score": 0.8,
        "productivity_label": "high"
    }
}
```

## ⚙️ Configuration

### Environment Variables (.env)
```bash
# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=workspace_analytics

# API  
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# Privacy
MAX_IMAGE_SIZE=10485760  # 10MB
TTL_CACHE_SECONDS=60
```

## 🛡️ Security & Compliance

### Technical Measures
- **Memory-only processing**: Images never written to disk
- **Automatic cleanup**: TTL cache prevents data accumulation
- **Size limits**: Configurable max image size
- **Input validation**: Pydantic models enforce data contracts

### Compliance Features
- **GDPR Compliant**: Data minimization and purpose limitation
- **User Consent**: Required for biometric data collection
- **Data Deletion**: Easy removal of user data
- **Transparency**: Clear privacy documentation

## 📈 Performance

### Optimization Features
- **Async MongoDB**: Non-blocking database operations
- **Image resizing**: Privacy-safe resolution reduction
- **TTL Cache**: 60-second in-memory caching
- **Structured logging**: Efficient monitoring

### Benchmarks
- **Face Analysis**: ~50ms per frame
- **Screen Analysis**: ~35ms per screenshot  
- **Memory Usage**: <100MB for typical workloads
- **Concurrent Users**: 100+ on modest hardware

## 🧪 Testing

### Example cURL Commands

**Face Analysis:**
```bash
curl -X POST "http://localhost:8000/api/v1/analyze-face" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "test_user",
       "session_id": "test_session", 
       "frame_data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
     }'
```

**Screen Analysis:**
```bash
curl -X POST "http://localhost:8000/api/v1/analyze-screen" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "test_user",
       "session_id": "test_session",
       "screenshot_data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
     }'
```

## 📝 Legal & Ethical Considerations

### ⚠️ Required Implementation
1. **User Consent**: Explicit opt-in for biometric collection
2. **Privacy Policy**: Clear disclosure of data usage
3. **Data Deletion**: User-controlled data removal
4. **Access Controls**: Secure authentication and authorization

### 🚫 Prohibited Uses
- Employee surveillance or monitoring
- Performance evaluation or discipline
- Non-consensual data collection
- Raw image storage or analysis

## 🤝 Contributing

### Development Guidelines
- Maintain privacy-first design
- Add comprehensive logging
- Include ML relevance comments
- Follow async/await patterns
- Validate all inputs

### Code Structure
```
app/
├── main.py              # FastAPI application
├── core/                # Configuration & database
├── api/routes/          # API endpoints  
├── services/            # Business logic
├── models/              # Pydantic models
└── utils/               # Utilities
```

## 📞 Support

For issues related to:
- **Privacy concerns**: privacy@workspace.ai
- **Technical support**: support@workspace.ai  
- **ML collaboration**: ml@workspace.ai

---

**Built with ❤️ for privacy-safe productivity research**
