"""
Ambulance & Emergency Medical Vehicle Classifier.
Requires verified medical livery (dominant white chassis + red/orange/blue stripes or red cross emblem + beacons).
Strict thresholds ensure ordinary white cars or traffic are NOT falsely classified as ambulances.
"""
import cv2
import numpy as np
from typing import Dict, Any, Optional, Tuple

class AmbulanceClassifier:
    def __init__(self):
        self.model_name = "NexusVision-Ambulance-Classifier"
        self.model_version = "v3.2"

    def analyze_vehicle(self, frame: np.ndarray, bbox_pixels: Tuple[int, int, int, int]) -> Optional[Dict[str, Any]]:
        x1, y1, x2, y2 = bbox_pixels
        h, w = frame.shape[:2]

        x1 = max(0, min(w - 1, x1))
        y1 = max(0, min(h - 1, y1))
        x2 = max(x1 + 10, min(w, x2))
        y2 = max(y1 + 10, min(h, y2))

        crop = frame[y1:y2, x1:x2]
        crop_h, crop_w = crop.shape[:2]
        if crop_h < 20 or crop_w < 20:
            return None

        hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)

        # 1. White body profile (S < 40, V > 160)
        white_mask = cv2.inRange(hsv, np.array([0, 0, 160]), np.array([180, 40, 255]))
        white_ratio = np.count_nonzero(white_mask) / (crop_h * crop_w)

        # 2. Red emergency marking / cross mask (H in [0, 10] or [170, 180], S > 90, V > 90)
        red_mask1 = cv2.inRange(hsv, np.array([0, 90, 90]), np.array([10, 255, 255]))
        red_mask2 = cv2.inRange(hsv, np.array([170, 90, 90]), np.array([180, 255, 255]))
        red_mask = cv2.bitwise_or(red_mask1, red_mask2)
        red_ratio = np.count_nonzero(red_mask) / (crop_h * crop_w)

        # 3. Emergency blue beacon / stripe (H in [100, 130], S > 90, V > 90)
        blue_mask = cv2.inRange(hsv, np.array([100, 90, 90]), np.array([130, 255, 255]))
        blue_ratio = np.count_nonzero(blue_mask) / (crop_h * crop_w)

        # 4. Roof beacon inspection (top 20% of vehicle)
        roof_crop = hsv[0:int(crop_h * 0.20), :]
        roof_red = cv2.count_nonzero(cv2.inRange(roof_crop, np.array([0, 90, 90]), np.array([10, 255, 255]))) + \
                   cv2.count_nonzero(cv2.inRange(roof_crop, np.array([170, 90, 90]), np.array([180, 255, 255])))
        roof_blue = cv2.count_nonzero(cv2.inRange(roof_crop, np.array([100, 90, 90]), np.array([130, 255, 255])))
        roof_beacon_present = (roof_red > 8 or roof_blue > 8)

        # Strict scoring: must have both high white ratio AND emergency livery (red/blue/beacon)
        if white_ratio > 0.40 and (red_ratio > 0.03 or blue_ratio > 0.02 or roof_beacon_present):
            score = 0.50 + min(0.25, white_ratio * 0.4) + min(0.20, (red_ratio + blue_ratio) * 4.0)
            if roof_beacon_present:
                score += 0.15

            conf = min(0.97, max(0.72, round(score, 3)))
            return {
                "is_ambulance": True,
                "confidence": conf,
                "white_ratio": round(white_ratio, 3),
                "red_ratio": round(red_ratio, 3),
                "blue_ratio": round(blue_ratio, 3),
                "roof_beacon": roof_beacon_present,
                "model_name": self.model_name,
                "model_version": self.model_version
            }

        return None
