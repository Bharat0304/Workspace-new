import cv2
import numpy as np
import base64
import mediapipe as mp
import math
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

try:
    # Initialize MediaPipe Face Mesh explicitly
    import mediapipe.python.solutions.face_mesh as mp_face_mesh
    face_mesh = mp_face_mesh.FaceMesh(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
        max_num_faces=1
    )
except (AttributeError, ImportError) as e:
    logger.error(f"MediaPipe initialization failed: {e}. Ensure you are running inside the venv.")
    face_mesh = None

# 3D model points for head pose estimation
# Generic 3D face model points
model_points = np.array([
    (0.0, 0.0, 0.0),             # Nose tip
    (0.0, -330.0, -65.0),        # Chin
    (-225.0, 170.0, -135.0),     # Left eye left corner
    (225.0, 170.0, -135.0),      # Right eye right corner
    (-150.0, -150.0, -125.0),    # Left Mouth corner
    (150.0, -150.0, -125.0)      # Right mouth corner
], dtype=np.float64)

def decode_b64_image(b64_string: str) -> np.ndarray:
    """Decodes a base64 string to a cv2 image."""
    try:
        if "," in b64_string:
            b64_string = b64_string.split(",")[1]
        
        img_data = base64.b64decode(b64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        logger.error(f"Error decoding base64 image: {e}")
        return None

def analyze_focus_from_b64(frame_data: str) -> Dict[str, Any]:
    """
    Analyzes a base64 encoded frame using OpenCV and MediaPipe 
    to determine the user's focus score based on presence and head pose.
    """
    img = decode_b64_image(frame_data)
    
    if img is None:
        return {
            "content_type": "neutral",
            "distraction_score": 100.0,
            "focus_score": 0.0,
            "fatigue_score": 0.0,
            "detected_indicators": ["invalid_frame"]
        }

    if face_mesh is None:
        return {
            "content_type": "neutral",
            "distraction_score": 100.0,
            "focus_score": 0.0,
            "fatigue_score": 0.0,
            "detected_indicators": ["mediapipe_error"]
        }

    # Convert the color space from BGR to RGB for MediaPipe
    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Process the image with Face Mesh
    results = face_mesh.process(rgb_img)
    
    focus_score = 0.0
    detected_indicators = []
    
    if not results.multi_face_landmarks:
        # No face detected - User is absent
        focus_score = 0.0
        detected_indicators.append("absence")
    else:
        # Face detected - Calculate Head Pose
        face_landmarks = results.multi_face_landmarks[0]
        h, w, c = img.shape
        
        # Extract 2D image points of specific landmarks
        # MediaPipe landmark indices:
        # 1: Nose tip
        # 152: Chin
        # 33: Left eye left corner
        # 263: Right eye right corner
        # 61: Left mouth corner
        # 291: Right mouth corner
        
        image_points = np.array([
            (face_landmarks.landmark[1].x * w, face_landmarks.landmark[1].y * h),
            (face_landmarks.landmark[152].x * w, face_landmarks.landmark[152].y * h),
            (face_landmarks.landmark[33].x * w, face_landmarks.landmark[33].y * h),
            (face_landmarks.landmark[263].x * w, face_landmarks.landmark[263].y * h),
            (face_landmarks.landmark[61].x * w, face_landmarks.landmark[61].y * h),
            (face_landmarks.landmark[291].x * w, face_landmarks.landmark[291].y * h)
        ], dtype=np.float64)
        
        # Camera internals (approximate)
        focal_length = w
        center = (w / 2, h / 2)
        camera_matrix = np.array(
            [[focal_length, 0, center[0]],
             [0, focal_length, center[1]],
             [0, 0, 1]], dtype="double"
        )
        dist_coeffs = np.zeros((4, 1)) # Assuming no lens distortion
        
        # Solve PnP to get rotation vector
        success, rotation_vector, translation_vector = cv2.solvePnP(
            model_points, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE
        )
        
        # Convert rotation vector to rotation matrix
        rotation_matrix, _ = cv2.Rodrigues(rotation_vector)
        
        # Get Euler angles (yaw, pitch, roll) from rotation matrix
        angles, _, _, _, _, _ = cv2.RQDecomp3x3(rotation_matrix)
        pitch = angles[0]
        yaw = angles[1]
        roll = angles[2]
        
        # Base score for being present
        focus_score = 100.0
        
        # Evaluate Pitch (looking down at phone?)
        if pitch < -15:
            focus_score -= 40
            detected_indicators.append("looking_down")
        elif pitch > 20:
            focus_score -= 20
            detected_indicators.append("looking_up")
            
        # Evaluate Yaw (looking away?)
        if yaw < -20 or yaw > 20:
            focus_score -= 30
            detected_indicators.append("looking_away")
            
        if not detected_indicators:
            detected_indicators.append("looking_forward")
            
        # Floor focus score at 0
        focus_score = max(0.0, focus_score)

    return {
        "content_type": "neutral",
        "distraction_score": max(0.0, 100.0 - focus_score),
        "focus_score": float(focus_score),
        "fatigue_score": 0.0, # Mock fatigue for now
        "detected_indicators": detected_indicators
    }
