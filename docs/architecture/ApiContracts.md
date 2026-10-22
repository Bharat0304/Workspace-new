# API Contracts — WorkSpace Cognitive System

This document outlines the standard contracts between the frontend services layer and the backend APIs.

---

## 1. Authentication Module

### POST /api/auth/google
**Description**: Authenticates a user using a Google OAuth token.

**Request Payload (JSON)**:
```json
{
  "idToken": "string"
}
```

**Response Payload (200 OK)**:
```json
{
  "user": {
    "id": "usr_99a8b1",
    "name": "Arjun Mishra",
    "email": "arjun@workspace.io",
    "avatar": "https://lh3.googleusercontent.com/.../photo.jpg"
  },
  "isNewUser": false,
  "accessToken": "eyJhbGciOi...",
  "expiresIn": 3600
}
```

---

## 2. Analytics Module

### GET /api/analytics/growth
**Description**: Returns performance indices, focus metrics, and daily history logs.

**Response Payload (200 OK)**:
```json
{
  "focusScore": 72,
  "weeklyTrend": 18,
  "studyHours": [2.3, 3.8, 5.0, 6.1],
  "baseTargetHours": [2.0, 2.5, 3.0, 3.5]
}
```
