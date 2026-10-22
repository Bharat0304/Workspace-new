import cv2
import mediapipe as mp
import numpy as np
import math
import structlog
from typing import Dict, Any, Optional
from models.responses import FaceAnalysisResponse, GazeDirection
from utils.image_utils import image_processor
from core.config import settings

logger = structlog.get_logger()

class FaceAnalysisService:  
    """
    MediaPipe-based face analysis for productivity modeling.
    
    ML Relevance: Extracts key behavioral indicators:
    - Eye Aspect Ratio (EAR): Blink detection and fatigue
    - Head pose: Engagement and attention
    - Gaze estimation: Focus patterns
    - Fatigue scoring: Cognitive state assessment
    """
    
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_face_detection = mp.solutions.face_detection
        
        # Initialize MediaPipe Face Mesh with privacy settings
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=settings.face_detection_confidence,
            min_tracking_confidence=0.5
        )
        
        # Initialize Face Detection for presence
        self.face_detection = self.mp_face_detection.FaceDetection(
            min_detection_confidence=settings.face_detection_confidence
        )
        
        logger.info(
            "Face analysis service initialized",
            detection_confidence=settings.face_detection_confidence,
            privacy_mode=True,
            no_raw_storage=True
        )
    
    def calculate_eye_aspect_ratio(self, eye_landmarks: np.ndarray) -> float:
        """
        Calculate Eye Aspect Ratio (EAR) for blink detection.
        
        ML Relevance: EAR is a proven indicator of fatigue and engagement.
        Lower EAR values indicate drowsiness or eye closure.
        """
        try:
            # Vertical eye landmarks
            A = np.linalg.norm(eye_landmarks[1] - eye_landmarks[5])
            B = np.linalg.norm(eye_landmarks[2] - eye_landmarks[4])
            
            # Horizontal eye landmarks
            C = np.linalg.norm(eye_landmarks[0] - eye_landmarks[3])
            
            # Eye Aspect Ratio
            ear = (A + B) / (2.0 * C)
            
            return ear
            
        except Exception as e:
            logger.warning("Error calculating EAR", error=str(e))
            return 0.3  # Default normal EAR
    
    def get_eye_landmarks(self, landmarks: list, eye_indices: list) -> np.ndarray:
        """Extract eye landmarks for EAR calculation."""
        try:
            eye_points = []
            for idx in eye_indices:
                landmark = landmarks[idx]
                eye_points.append([landmark.x, landmark.y])
            
            return np.array(eye_points)
            
        except Exception as e:
            logger.warning("Error extracting eye landmarks", error=str(e))
            return np.array([])
    
    def estimate_head_pose(self, landmarks: list) -> Dict[str, float]:
        """
        Estimate head pose (tilt, pan, roll) from facial landmarks.
        
        ML Relevance: Head pose indicates engagement level and attention.
        """
        try:
            # Key facial points for pose estimation
            nose_tip = landmarks[1]
            chin = landmarks[175]
            left_eye = landmarks[33]
            right_eye = landmarks[263]
            
            # Calculate head tilt (rotation around Z-axis)
            eye_center_x = (left_eye.x + right_eye.x) / 2
            eye_center_y = (left_eye.y + right_eye.y) / 2
            
            # Simple tilt calculation based on eye line
            dx = right_eye.x - left_eye.x
            dy = right_eye.y - left_eye.y
            tilt_angle = math.degrees(math.atan2(dy, dx))
            
            return {
                "tilt": tilt_angle,
                "pan": 0.0,  # Simplified for current implementation
                "roll": 0.0   # Simplified for current implementation
            }
            
        except Exception as e:
            logger.warning("Error estimating head pose", error=str(e))
            return {"tilt": 0.0, "pan": 0.0, "roll": 0.0}
    
    def estimate_gaze_direction(self, landmarks: list) -> GazeDirection:
        """
        Estimate gaze direction from eye landmarks.
        
        ML Relevance: Gaze direction indicates focus and attention patterns.
        """
        try:
            # Get eye centers
            left_eye_center = landmarks[33]  # Left eye corner
            right_eye_center = landmarks[263]  # Right eye corner
            nose_tip = landmarks[1]
            
            # Calculate gaze based on eye-nose alignment
            eye_center = (left_eye_center.x + right_eye_center.x) / 2
            nose_x = nose_tip.x
            
            # Simple gaze estimation
            if abs(eye_center - nose_x) < 0.05:
                return GazeDirection.CENTER
            elif eye_center > nose_x:
                return GazeDirection.RIGHT
            else:
                return GazeDirection.LEFT
                
        except Exception as e:
            logger.warning("Error estimating gaze direction", error=str(e))
            return GazeDirection.UNKNOWN
    
    def calculate_fatigue_score(self, ear: float, head_tilt: float) -> float:
        """
        Calculate fatigue score from multiple biometric signals.
        
        ML Relevance: Combines multiple indicators for robust fatigue detection.
        """
        try:
            # EAR-based fatigue (lower EAR = higher fatigue)
            ear_fatigue = max(0, (settings.blink_threshold - ear) / settings.blink_threshold)
            
            # Head tilt-based fatigue (unusual tilt = potential fatigue)
            tilt_fatigue = min(abs(head_tilt) / 30.0, 1.0)  # Normalize to 0-1
            
            # Weighted combination
            fatigue_score = 0.7 * ear_fatigue + 0.3 * tilt_fatigue
            
            return min(max(fatigue_score, 0.0), 1.0)
            
        except Exception as e:
            logger.warning("Error calculating fatigue score", error=str(e))
            return 0.0
    
    async def analyze_frame(self, frame_data: str) -> FaceAnalysisResponse:
        """
        Analyze face frame for behavioral signals.
        
        Privacy: Processes frame in memory only, never stores raw data.
        Returns: Structured behavioral metrics for ML training.
        """
        start_time = cv2.getTickCount()
        
        try:
            # Decode and preprocess image
            image = image_processor.decode_base64_image(frame_data)
            if image is None:
                logger.warning("Failed to decode frame for face analysis")
                return FaceAnalysisResponse(
                    face_present=False,
                    blink_rate=0.0,
                    gaze_direction=GazeDirection.UNKNOWN,
                    head_tilt=0.0,
                    fatigue_score=0.0
                )
            
            # Resize for privacy and efficiency
            image = image_processor.resize_image(image)
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Face detection
            detection_results = self.face_detection.process(image_rgb)
            face_present = len(detection_results.detections) > 0
            
            if not face_present:
                logger.debug("No face detected in frame")
                return FaceAnalysisResponse(
                    face_present=False,
                    blink_rate=0.0,
                    gaze_direction=GazeDirection.UNKNOWN,
                    head_tilt=0.0,
                    fatigue_score=0.0
                )
            
            # Face mesh analysis
            mesh_results = self.face_mesh.process(image_rgb)
            
            if mesh_results.multi_face_landmarks:
                landmarks = mesh_results.multi_face_landmarks[0].landmark
                
                # Eye landmarks indices (MediaPipe Face Mesh)
                left_eye_indices = [33, 7, 163, 144, 145, 153, 154, 155, 133]
                right_eye_indices = [362, 398, 384, 385, 386, 387, 388, 466, 263]
                
                # Calculate EAR for both eyes
                left_ear = self.calculate_eye_aspect_ratio(
                    self.get_eye_landmarks(landmarks, left_eye_indices)
                )
                right_ear = self.calculate_eye_aspect_ratio(
                    self.get_eye_landmarks(landmarks, right_eye_indices)
                )
                avg_ear = (left_ear + right_ear) / 2.0
                
                # Head pose estimation
                head_pose = self.estimate_head_pose(landmarks)
                
                # Gaze direction
                gaze_direction = self.estimate_gaze_direction(landmarks)
                
                # Fatigue scoring
                fatigue_score = self.calculate_fatigue_score(avg_ear, head_pose["tilt"])
                
                # Calculate processing time
                processing_time = (cv2.getTickCount() - start_time) / cv2.getTickFrequency() * 1000
                
                logger.debug(
                    "Face analysis completed",
                    face_present=True,
                    ear=avg_ear,
                    gaze=gaze_direction,
                    head_tilt=head_pose["tilt"],
                    fatigue=fatigue_score,
                    processing_time_ms=processing_time
                )
                
                return FaceAnalysisResponse(
                    face_present=True,
                    blink_rate=avg_ear,
                    gaze_direction=gaze_direction,
                    head_tilt=head_pose["tilt"],
                    fatigue_score=fatigue_score,
                    processing_time_ms=processing_time
                )
            
            else:
                logger.debug("Face detected but mesh analysis failed")
                return FaceAnalysisResponse(
                    face_present=True,
                    blink_rate=0.0,
                    gaze_direction=GazeDirection.UNKNOWN,
                    head_tilt=0.0,
                    fatigue_score=0.0
                )
                
        except Exception as e:
            logger.error("Error in face analysis", error=str(e))
            return FaceAnalysisResponse(
                face_present=False,
                blink_rate=0.0,
                gaze_direction=GazeDirection.UNKNOWN,
                head_tilt=0.0,
                fatigue_score=0.0
            )
        
        finally:
            # Cleanup memory
            if 'image' in locals():
                image_processor.cleanup_image(image)

# Global service instance
face_service = FaceAnalysisService()