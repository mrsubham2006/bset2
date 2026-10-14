"""
Altercation / Physical Disorder Motion Turbulence Detector.
Analyzes optical flow and motion gradients between entangled persons.
"""
import cv2
import numpy as np
from typing import List, Dict, Any, Optional

class AltercationDetector:
    def __init__(self):
        self.model_name = "NexusVision-ActionTurbulence-Analyzer"
        self.model_version = "v3.2"
        self.prev_gray: Optional[np.ndarray] = None

    def evaluate_altercation(self, frame: np.ndarray, person_detections: List[Dict[str, Any]], timestamp_sec: float) -> Optional[Dict[str, Any]]:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        if self.prev_gray is None:
            self.prev_gray = gray
            return None

        n = len(person_detections)
        if n < 2:
            self.prev_gray = gray
            return None

        interacting_pairs = []
        for i in range(n):
            for j in range(i + 1, n):
                b1 = person_detections[i]["box_pixels"]
                b2 = person_detections[j]["box_pixels"]
                cx1, cy1 = (b1[0] + b1[2]) / 2, (b1[1] + b1[3]) / 2
                cx2, cy2 = (b2[0] + b2[2]) / 2, (b2[1] + b2[3]) / 2
                dist = np.hypot(cx1 - cx2, cy1 - cy2)
                avg_w = ((b1[2] - b1[0]) + (b2[2] - b2[0])) / 2
                if dist < avg_w * 1.3:
                    interacting_pairs.append((b1, b2))

        if not interacting_pairs:
            self.prev_gray = gray
            return None

        flow = cv2.calcOpticalFlowFarneback(
            self.prev_gray, gray, None,
            pyr_scale=0.5, levels=3, winsize=15, iterations=3, poly_n=5, poly_sigma=1.2, flags=0
        )
        self.prev_gray = gray

        max_turbulence = 0.0
        best_union_bbox = None

        for b1, b2 in interacting_pairs:
            ux1 = max(0, min(b1[0], b2[0]))
            uy1 = max(0, min(b1[1], b2[1]))
            ux2 = min(frame.shape[1], max(b1[2], b2[2]))
            uy2 = min(frame.shape[0], max(b1[3], b2[3]))

            roi_flow = flow[uy1:uy2, ux1:ux2]
            if roi_flow.size == 0:
                continue

            mag, ang = cv2.cartToPolar(roi_flow[..., 0], roi_flow[..., 1])
            avg_mag = np.mean(mag)
            std_mag = np.std(mag)
            ang_std = np.std(ang)

            turbulence_score = (avg_mag * 0.4) + (std_mag * 0.4) + (ang_std * 0.2)
            if turbulence_score > max_turbulence:
                max_turbulence = turbulence_score
                best_union_bbox = (ux1, uy1, ux2, uy2)

        if max_turbulence >= 2.2 and best_union_bbox is not None:
            confidence = min(0.91, round(0.66 + min(0.24, max_turbulence * 0.05), 3))
            return {
                "is_altercation": True,
                "confidence": confidence,
                "turbulence_score": round(max_turbulence, 2),
                "union_bbox_pixels": best_union_bbox,
                "explanation": "High directional velocity gradients and rapid opposing physical movement observed between entangled individuals. Cautious classification: possible altercation requiring on-scene operator review.",
                "model_name": self.model_name,
                "model_version": self.model_version
            }

        return None
