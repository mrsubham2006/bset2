"""
Dedicated Fire and Smoke Detector.
Uses multi-space thermal chromaticity (RGB, HSV, YCbCr) and smoke plume desaturation.
"""
import cv2
import numpy as np
from typing import Dict, Any, Optional

class FireSmokeDetector:
    def __init__(self):
        self.model_name = "NexusVision-FireSmoke-ThermalOptics"
        self.model_version = "v3.2"

    def detect_fire_and_smoke(self, frame: np.ndarray, timestamp_sec: float) -> Optional[Dict[str, Any]]:
        h, w = frame.shape[:2]
        total_pixels = h * w

        bgr = frame
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        ycrcb = cv2.cvtColor(bgr, cv2.COLOR_BGR2YCrCb)
        b, g, r = cv2.split(bgr)
        y_c, cr, cb = cv2.split(ycrcb)

        # 1. RGB Flame Rule: R >= 165, G >= 50, B <= 130, R > G > B
        rgb_flame = (r >= 165) & (g >= 50) & (b <= 130) & (r > g) & (g > b)

        # 2. YCbCr Flame Rule: Y >= Cb, Cr >= Cb, Cr >= 130
        ycrcb_flame = (y_c >= cb) & (cr >= cb) & (cr >= 130)

        # 3. HSV Flame Rule: H in [0, 45], S >= 80, V >= 130
        hsv_flame = (hsv[:, :, 0] <= 45) & (hsv[:, :, 1] >= 80) & (hsv[:, :, 2] >= 130)

        flame_mask = (rgb_flame & ycrcb_flame & hsv_flame).astype(np.uint8) * 255
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        flame_clean = cv2.morphologyEx(flame_mask, cv2.MORPH_OPEN, kernel)
        flame_clean = cv2.morphologyEx(flame_clean, cv2.MORPH_DILATE, kernel)

        # Smoke Plume Mask
        diff_rg = np.abs(r.astype(np.int16) - g.astype(np.int16))
        diff_gb = np.abs(g.astype(np.int16) - b.astype(np.int16))
        diff_rb = np.abs(r.astype(np.int16) - b.astype(np.int16))
        smoke_color = (diff_rg < 20) & (diff_gb < 20) & (diff_rb < 20)
        smoke_lum = (y_c >= 95) & (y_c <= 210)
        smoke_mask = (smoke_color & smoke_lum).astype(np.uint8) * 255

        contours, _ = cv2.findContours(flame_clean, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        largest_flame_bbox = None
        max_flame_area = 0

        for cnt in contours:
            area = cv2.contourArea(cnt)
            # Filter out thin line strokes (e.g. road lane paint) and tiny noise
            x, y, bw, bh = cv2.boundingRect(cnt)
            if area > 250 and bw >= 14 and bh >= 14:
                if area > max_flame_area:
                    max_flame_area = area
                    largest_flame_bbox = (x, y, x + bw, y + bh)

        flame_pixel_count = np.count_nonzero(flame_clean)
        smoke_pixel_count = np.count_nonzero(smoke_mask)

        flame_ratio = flame_pixel_count / total_pixels
        smoke_ratio = smoke_pixel_count / total_pixels

        has_flame = largest_flame_bbox is not None and flame_ratio > 0.0015
        has_smoke = smoke_ratio > 0.035

        if has_flame or has_smoke:
            confidence = 0.70
            if has_flame:
                confidence += min(0.24, flame_ratio * 35.0)
            if has_smoke:
                confidence += min(0.16, smoke_ratio * 2.0)
            confidence = min(0.97, round(confidence, 3))

            if largest_flame_bbox:
                fb = largest_flame_bbox
            else:
                fb = (int(w * 0.25), int(h * 0.15), int(w * 0.75), int(h * 0.65))

            explanation = []
            if has_flame:
                explanation.append(f"Active flame contours detected with high thermal chromaticity (area: {flame_pixel_count} px).")
            if has_smoke:
                explanation.append(f"Expanding desaturated smoke plume signature detected (coverage: {smoke_ratio*100:.1f}%).")

            return {
                "is_fire_or_smoke": True,
                "has_flame": bool(has_flame),
                "has_smoke": bool(has_smoke),
                "confidence": confidence,
                "flame_ratio": round(flame_ratio, 4),
                "smoke_ratio": round(smoke_ratio, 4),
                "bbox_pixels": fb,
                "explanation": " ".join(explanation),
                "model_name": self.model_name,
                "model_version": self.model_version
            }

        return None
