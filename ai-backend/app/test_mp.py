import sys
print(sys.executable)
import mediapipe as mp
print(hasattr(mp, 'solutions'))
import mediapipe.python.solutions.face_mesh
print("Imported face_mesh successfully")
