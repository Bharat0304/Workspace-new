# WorkSpace AI Backend - Example Requests & Responses

This document provides example API requests and responses for the WorkSpace AI Backend.

## Table of Contents

1. [Health Check](#health-check)
2. [Screen Analysis](#screen-analysis)
3. [Focus Analysis](#focus-analysis)
4. [Tab Analysis](#tab-analysis)
5. [Posture Analysis](#posture-analysis)
6. [Session Management](#session-management)

---

## Health Check

### Request

```bash
GET /health
```

### Response

```json
{
  "status": "ok",
  "python": true,
  "time": "2024-01-15T10:30:00.000Z"
}
```

---

## Screen Analysis

### Request

```bash
POST /analyze/screen
Content-Type: application/json
Authorization: Bearer <optional_jwt_token>

{
  "screenshot_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "user_id": "user_123",
  "session_id": "session_456"
}
```

### Response

```json
{
  "success": true,
  "analysis_type": "screen",
  "user_id": "user_123",
  "session_id": "session_456",
  "result": {
    "content_type": "educational",
    "distraction_score": 15.5,
    "focus_score": 84.5,
    "fatigue_score": null,
    "detected_indicators": ["text_content", "structured_layout", "educational_patterns"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Screenshot data cannot be empty",
  "error_type": "ValueError",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Focus Analysis

### Request

```bash
POST /analyze/focus
Content-Type: application/json
Authorization: Bearer <optional_jwt_token>

{
  "frame_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "user_id": "user_123",
  "session_id": "session_456"
}
```

### Response

```json
{
  "success": true,
  "analysis_type": "focus",
  "user_id": "user_123",
  "session_id": "session_456",
  "result": {
    "content_type": "neutral",
    "distraction_score": 25.0,
    "focus_score": 75.0,
    "fatigue_score": 30.0,
    "detected_indicators": ["eye_contact", "upright_posture", "minimal_movement"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Tab Analysis

### Educational YouTube Video Request

```bash
POST /analyze/tab
Content-Type: application/json
Authorization: Bearer <optional_jwt_token>

{
  "url": "https://www.youtube.com/watch?v=QiKZtWA7rJc",
  "title": "Calculus 1 - Derivatives Explained",
  "timestamp": 1705316200
}
```

### Educational Response

```json
{
  "success": true,
  "analysis_type": "browser_tab",
  "result": {
    "content_type": "educational",
    "distraction_score": 5.0,
    "focus_score": 95.0,
    "fatigue_score": null,
    "detected_indicators": ["youtube_educational_content"],
    "is_distraction": false,
    "severity": "low",
    "site_name": "youtube.com",
    "warning_level": "none",
    "recommended_action": "none"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Non-Educational YouTube Video Request

```bash
POST /analyze/tab
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "Funny Cat Videos Compilation"
}
```

### High Distraction Response

```json
{
  "success": true,
  "analysis_type": "browser_tab",
  "result": {
    "content_type": "high_distraction",
    "distraction_score": 90.0,
    "focus_score": 10.0,
    "fatigue_score": null,
    "detected_indicators": ["youtube_non_educational_content"],
    "is_distraction": true,
    "severity": "critical",
    "site_name": "youtube.com",
    "warning_level": "high",
    "recommended_action": "close_tab"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Social Media Request

```bash
POST /analyze/tab
Content-Type: application/json

{
  "url": "https://www.instagram.com/explore/",
  "title": "Instagram"
}
```

### Social Media Response

```json
{
  "success": true,
  "analysis_type": "browser_tab",
  "result": {
    "content_type": "high_distraction",
    "distraction_score": 85.0,
    "focus_score": 15.0,
    "fatigue_score": null,
    "detected_indicators": ["social_media", "entertainment_patterns"],
    "is_distraction": true,
    "severity": "high",
    "site_name": "instagram.com",
    "warning_level": "high",
    "recommended_action": "close_tab"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Posture Analysis

### Request

```bash
POST /analyze/posture
Content-Type: application/json
Authorization: Bearer <optional_jwt_token>

{
  "frame_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "user_id": "user_123",
  "session_id": "session_456"
}
```

### Response

```json
{
  "success": true,
  "analysis_type": "posture",
  "user_id": "user_123",
  "session_id": "session_456",
  "result": {
    "posture_status": "poor",
    "analysis_timestamp": "2024-01-15T10:30:00.000Z",
    "recommendations": [
      "Sit upright with back supported",
      "Keep shoulders relaxed",
      "Position monitor at eye level",
      "Take regular stretch breaks"
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Session Management

### Start Session

#### Request

```bash
POST /session/start
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "subject": "Calculus Study",
  "goal_minutes": 120,
  "user_id": "user_123"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session_1705316200000",
      "user_id": "user_123",
      "subject": "Calculus Study",
      "goal_minutes": 120,
      "status": "active",
      "start_time": "2024-01-15T10:30:00.000Z",
      "end_time": null,
      "average_focus": 0.0,
      "scores": [],
      "timeline": [],
      "sites": []
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Get Session

#### Request

```bash
GET /session/session_1705316200000
Authorization: Bearer <jwt_token>
```

#### Response

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session_1705316200000",
      "user_id": "user_123",
      "subject": "Calculus Study",
      "goal_minutes": 120,
      "status": "active",
      "start_time": "2024-01-15T10:30:00.000Z",
      "end_time": null,
      "average_focus": 0.0,
      "scores": [],
      "timeline": [],
      "sites": []
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### End Session

#### Request

```bash
PUT /session/session_1705316200000/end
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "session_id": "session_1705316200000",
  "average_focus": 78.5,
  "scores": [85.0, 75.0, 80.0, 90.0, 70.0],
  "timeline": [
    {
      "timestamp": "2024-01-15T10:30:00.000Z",
      "event": "session_start"
    },
    {
      "timestamp": "2024-01-15T12:30:00.000Z",
      "event": "session_end"
    }
  ],
  "sites": [
    {
      "url": "https://www.youtube.com/watch?v=QiKZtWA7rJc",
      "title": "Calculus 1 - Derivatives Explained",
      "time_spent": 1800
    }
  ],
  "user_id": "user_123"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session_1705316200000",
      "user_id": "user_123",
      "subject": "Calculus Study",
      "goal_minutes": 120,
      "status": "completed",
      "start_time": "2024-01-15T10:30:00.000Z",
      "end_time": "2024-01-15T12:30:00.000Z",
      "average_focus": 78.5,
      "scores": [85.0, 75.0, 0.0, 90.0, 70.0],
      "timeline": [
        {
          "timestamp": "2024-01-15T10:30:00.000Z",
          "event": "session_start"
        },
        {
          "timestamp": "2024-01-15T12:30:00.000Z",
          "event": "session_end"
        }
      ],
      "sites": [
        {
          "url": "https://www.youtube.com/watch?v=QiKZtWA7rJc",
          "title": "Calculus 1 - Derivatives Explained",
          "time_spent": 1800
        }
      ]
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Get User Sessions

#### Request

```bash
GET /session/user/user_123
Authorization: Bearer <jwt_token>
```

#### Response

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session_1705316200000",
        "user_id": "user_123",
        "subject": "Calculus Study",
        "goal_minutes": 120,
        "status": "completed",
        "start_time": "2024-01-15T10:30:00.000Z",
        "end_time": "2024-01-15T12:30:00.000Z",
        "average_focus": 78.5,
        "scores": [85.0, 75.0, 80.0, 90.0, 70.0],
        "timeline": [],
        "sites": []
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Get Current Focus Session

#### Request

```bash
GET /session/focus/current
```

#### Response (Active Session)

```json
{
  "success": true,
  "session_active": true,
  "session_start": "2024-01-15T10:30:00.000Z",
  "elapsed_minutes": 45,
  "target_minutes": 120,
  "distractions_blocked": 3,
  "productivity_score": 78.5
}
```

#### Response (No Active Session)

```json
{
  "success": true,
  "session_active": false,
  "session_start": null,
  "elapsed_minutes": 0,
  "target_minutes": 120,
  "distractions_blocked": 0,
  "productivity_score": 0.0
}
```

---

## Error Handling

### Authentication Error

```json
{
  "success": false,
  "error": "Invalid or missing authentication token",
  "type": "HTTPException",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Validation Error

```json
{
  "success": false,
  "error": "URL must start with http:// or https://",
  "type": "ValueError",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Not Found Error

```json
{
  "success": false,
  "error": "Session not found",
  "type": "HTTPException",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error",
  "type": "UnexpectedError",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Notes

1. **Authentication**: Most endpoints accept optional authentication. If Clerk JWT is configured, authentication will be enforced for protected endpoints.

2. **Base64 Images**: All image data should be provided as base64-encoded strings with appropriate data URI prefixes (e.g., `data:image/png;base64,...`).

3. **Content Types**: The backend classifies content into three categories:
   - `educational`: Learning-focused content
   - `neutral`: Neither clearly educational nor distracting
   - `high_distraction`: Clearly distracting content

4. **Scoring**: All scores are on a scale of 0-100:
   - `distraction_score`: Higher means more distracting
   - `focus_score`: Higher means better focus
   - `fatigue_score`: Higher means more fatigue

5. **Caching**: Tab analysis results are cached for 60 seconds to improve performance.

6. **Rate Limiting**: Consider implementing rate limiting for production deployments.
