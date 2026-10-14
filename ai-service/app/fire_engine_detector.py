"""
Fire Engine / Emergency Tender Classifier.
Analyzes large vehicle profiles (truck/bus) for intense fire red/lime livery, equipment racks, and beacons.
"""
import cv2
import numpy as np
from typing import Dict, Any, Optional, Tuple

class FireEngineClassifier:
    def __init__(self):
        self.model_name = "NexusVision-FireEngine-Classifier"
        self.model_version = "v3.2"

    def analyze_heavy_vehicle(self, frame: np.ndarray, bbox_pixels: Tuple[int, int, int, int], raw_class: str) -> Optional[Dict[str, Any]]:
        x1, y1, x2, y2 = bbox_pixels
        h, w = frame.shape[:2]

        x1 = max(0, min(w - 1, x1))
        y1 = max(0, min(h - 1, y1))
        x2 = max(x1 + 10, min(w, x2))
        y2 = max(y1 + 10, min(h, y2))

        crop = frame[y1:y2, x1:x2]
        crop_h, crop_w = crop.shape[:2]
        if crop_h < 25 or crop_w < 25:
            return None

        hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)

        # 1. Fire Red coverage
        red_mask1 = cv2.inRange(hsv, np.array([0, 100, 90]), np.array([12, 255, 255]))
        red_mask2 = cv2.inRange(hsv, np.array([168, 100, 90]), np.array([180, 255, 255]))
        fire_red_mask = cv2.bitwise_or(red_mask1, red_mask2)
        red_ratio = np.count_nonzero(fire_red_mask) / (crop_h * crop_w)

        # 2. Fluorescent lime-yellow paint
        lime_mask = cv2.inRange(hsv, np.array([25, 110, 100]), np.array([40, 255, 255]))
        lime_ratio = np.count_nonzero(lime_mask) / (crop_h * crop_w)

        # 3. Emergency roof beacons
        roof_crop = hsv[0:int(crop_h * 0.22), :]
        roof_beacons = cv2.count_nonzero(cv2.inRange(roof_crop, np.array([0, 100, 100]), np.array([15, 255, 255])))
        has_roof_beacon = roof_beacons > 12

        primary_ratio = max(red_ratio, lime_ratio)

        # Heavy chassis bonus
        chassis_bonus = 0.20 if raw_class in ("truck", "bus") else 0.05

        if primary_ratio > 0.28 and (has_roof_beacon or raw_class in ("truck", "bus")):
            score = 0.50 + min(0.35, primary_ratio * 1.2) + chassis_bonus
            conf = min(0.97, max(0.74, round(score, 3)))
            return {
                "is_fire_engine": True,
                "confidence": conf,
                "red_ratio": round(red_ratio, 3),
                "lime_ratio": round(lime_ratio, 3),
                "has_roof_beacon": has_roof_beacon,
                "raw_vehicle_class": raw_class,
                "model_name": self.model_name,
                "model_version": self.model_version
            }

        return None
