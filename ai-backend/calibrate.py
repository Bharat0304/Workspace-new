"""
Calibration Script — Extracts MediaPipe landmark ratios from reference images.
Generates calibration.json with per-category thresholds tuned to the user's face.

Run: python calibrate.py
Input: ../public/{fatigue,focus,happy,sad,stress}/*.jpg
Output: calibration.json
"""
import cv2
import numpy as np
import json
import os
import math
import glob

import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

model_path = os.path.join(os.path.dirname(__file__), 'face_landmarker.task')
if not os.path.exists(model_path):
    print("Error: face_landmarker.task not found! Please download it.")
    exit(1)

base_options = python.BaseOptions(model_asset_path=model_path)
options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    output_face_blendshapes=False,
    output_facial_transformation_matrixes=False,
    num_faces=1
)
detector = vision.FaceLandmarker.create_from_options(options)

CATEGORIES = ["fatigue", "focus", "happy", "sad", "stress"]
IMG_DIR = os.path.join(os.path.dirname(__file__), "..", "public")


def extract_features(img_path: str) -> dict | None:
    """Extract all landmark-based features from a single image."""
    mp_image = mp.Image.create_from_file(img_path)
    result = detector.detect(mp_image)

    if not result.face_landmarks:
        print(f"  [SKIP] no face: {img_path}")
        return None

    lm = result.face_landmarks[0]

    # EAR (Eye Aspect Ratio)
    def ear(idx):
        pts = np.array([[lm[i].x, lm[i].y] for i in idx])
        A = np.linalg.norm(pts[1] - pts[5])
        B = np.linalg.norm(pts[2] - pts[4])
        C = np.linalg.norm(pts[0] - pts[3])
        return (A + B) / (2.0 * C) if C > 0 else 0.25

    left_ear = ear([33, 7, 163, 144, 145, 153])
    right_ear = ear([362, 398, 384, 385, 387, 263])
    avg_ear = (left_ear + right_ear) / 2.0

    # Head pose
    nose = lm[1]; forehead = lm[10]; chin = lm[152]
    face_h = abs(chin.y - forehead.y)
    nose_pos = (nose.y - forehead.y) / face_h if face_h > 0 else 0.5

    # Roll
    le = lm[33]; re = lm[263]
    roll = math.degrees(math.atan2(re.y - le.y, re.x - le.x))

    # Mouth
    mouth_w = abs(lm[291].x - lm[61].x)
    mouth_h = abs(lm[14].y - lm[13].y)
    mouth_ratio = mouth_h / mouth_w if mouth_w > 0 else 0
    lip_stretch = abs(lm[291].x - lm[61].x)
    mouth_open = lm[14].y - lm[13].y

    # Brow
    left_brow = (lm[107].y + lm[66].y) / 2
    right_brow = (lm[336].y + lm[296].y) / 2
    avg_brow = (left_brow + right_brow) / 2
    nose_bridge = lm[6].y
    brow_raise = nose_bridge - avg_brow

    # Inner brow distance
    brow_furrow = abs(lm[107].y - lm[336].y)

    return {
        "ear": round(avg_ear, 4),
        "nose_pos": round(nose_pos, 4),
        "roll": round(abs(roll), 4),
        "mouth_ratio": round(mouth_ratio, 4),
        "lip_stretch": round(lip_stretch, 4),
        "mouth_open": round(mouth_open, 5),
        "brow_raise": round(brow_raise, 4),
        "brow_furrow": round(brow_furrow, 4),
    }


def main():
    calibration = {}

    for cat in CATEGORIES:
        cat_dir = os.path.join(IMG_DIR, cat)
        if not os.path.isdir(cat_dir):
            print(f"[WARN] no dir: {cat_dir}")
            continue

        images = glob.glob(os.path.join(cat_dir, "*.jpg")) + glob.glob(os.path.join(cat_dir, "*.png"))
        print(f"\n{'='*50}")
        print(f"[{cat.upper()}] — {len(images)} images")
        print(f"{'='*50}")

        features_list = []
        for img_path in sorted(images):
            fname = os.path.basename(img_path)
            feats = extract_features(img_path)
            if feats:
                features_list.append(feats)
                print(f"  ✓ {fname}: EAR={feats['ear']:.3f} nose={feats['nose_pos']:.3f} mouth={feats['mouth_ratio']:.3f} brow={feats['brow_raise']:.4f}")

        if not features_list:
            print(f"  [WARN] no valid faces for {cat}")
            continue

        # Compute average and range for each feature
        avg = {}
        ranges = {}
        for key in features_list[0].keys():
            vals = [f[key] for f in features_list]
            avg[key] = round(sum(vals) / len(vals), 4)
            ranges[key] = {"min": round(min(vals), 4), "max": round(max(vals), 4)}

        calibration[cat] = {
            "sample_count": len(features_list),
            "avg": avg,
            "range": ranges,
            "all_samples": features_list,
        }

        print(f"  AVG: {avg}")

    # Save calibration
    out_path = os.path.join(os.path.dirname(__file__), "calibration.json")
    with open(out_path, "w") as f:
        json.dump(calibration, f, indent=2)

    print(f"\n✅ Saved calibration.json ({len(calibration)} categories)")
    print(f"   Path: {out_path}")

    # Print summary thresholds
    print("\n" + "="*60)
    print("CALIBRATED THRESHOLDS")
    print("="*60)

    if "fatigue" in calibration and "focus" in calibration:
        fat = calibration["fatigue"]["avg"]
        foc = calibration["focus"]["avg"]
        print(f"\nFatigue EAR avg: {fat['ear']:.3f} vs Focus EAR avg: {foc['ear']:.3f}")
        print(f"  → Fatigue threshold: EAR < {round((fat['ear'] + foc['ear'])/2, 3)}")
        print(f"\nFatigue nose_pos avg: {fat['nose_pos']:.3f} vs Focus: {foc['nose_pos']:.3f}")
        print(f"  → Head-down threshold: nose_pos > {round((fat['nose_pos'] + foc['nose_pos'])/2, 3)}")

    if "happy" in calibration:
        hap = calibration["happy"]["avg"]
        print(f"\nHappy mouth_ratio avg: {hap['mouth_ratio']:.3f}")
        print(f"  → Smile threshold: mouth_ratio > {round(hap['mouth_ratio'] * 0.7, 3)}")

    if "sad" in calibration:
        sad = calibration["sad"]["avg"]
        print(f"\nSad brow_raise avg: {sad['brow_raise']:.4f}")
        print(f"  → Sad threshold: brow_raise < {round(sad['brow_raise'] * 1.2, 4)}")


if __name__ == "__main__":
    main()
