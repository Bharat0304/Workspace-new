import os
import base64
from io import BytesIO
from PIL import Image

try:
    from google import genai
    from google.genai import types
    print("Successfully imported genai")
except ImportError as e:
    print(f"ImportError: {e}")
