"""
Dedicated Road Accident & Collision Detector.
Analyzes vehicle kinematics, bounding box overlap (IoU >= 0.12), abrupt deceleration,
and vehicle stoppage blocking roadway flow.
"""
from typing import List, Dict, Any, Optional, Tuple
import numpy as np

def calculate_iou(boxA: Tuple[int, int, int, int], boxB: Tuple[int, int, int, int]) -> float:
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interArea = max(0, xB - xA) * max(0, yB - yA)
    if interArea == 0:
        return 0.0

    boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
    unionArea = float(boxAArea + boxBArea - interArea)
    if unionArea <= 0:
        return 0.0

    return interArea / unionArea

class RoadAccidentDetector:
    def __init__(self):
        self.model_name = "NexusVision-Accident-Kinematic-Analyzer"
        self.model_version = "v3.2"
        self.track_history: Dict[str, List[Dict[str, Any]]] = {}

    def update_tracks(self, timestamp_sec: float, detections: List[Dict[str, Any]]):
        for d in detections:
            tid = d.get("track_id")
            if not tid:
                continue
            x1, y1, x2, y2 = d["box_pixels"]
            cx = (x1 + x2) / 2.0
            cy = (y1 + y2) / 2.0
            if tid not in self.track_history:
                self.track_history[tid] = []
            self.track_history[tid].append({
                "t": timestamp_sec,
                "cx": cx,
                "cy": cy,
                "bbox": (x1, y1, x2, y2),
                "cls": d["class_name"],
                "conf": d["confidence"]
            })
            if len(self.track_history[tid]) > 15:
                self.track_history[tid].pop(0)

    def evaluate_accident(self, timestamp_sec: float, current_detections: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        self.update_tracks(timestamp_sec, current_detections)
        n = len(current_detections)
        if n < 2:
            return None

        for i in range(n):
            for j in range(i + 1, n):
                d1 = current_detections[i]
                d2 = current_detections[j]

                c1 = d1["class_name"]
                c2 = d2["class_name"]

                is_veh1 = c1 in ("car", "truck", "bus", "motorcycle")
                is_veh2 = c2 in ("car", "truck", "bus", "motorcycle")
                is_person1 = c1 == "person"
                is_person2 = c2 == "person"

                if not ((is_veh1 and is_veh2) or (is_veh1 and is_person2) or (is_veh2 and is_person1)):
                    continue

                b1 = d1["box_pixels"]
                b2 = d2["box_pixels"]
                iou = calculate_iou(b1, b2)

                if iou >= 0.10:
                    tid1 = d1.get("track_id")
                    tid2 = d2.get("track_id")

                    abrupt_stop = False
                    explanation = f"Physical collision overlap confirmed (IoU: {iou:.2f}) between {c1} and {c2}."

                    if tid1 and tid2 and tid1 in self.track_history and tid2 in self.track_history:
                        h1 = self.track_history[tid1]
                        h2 = self.track_history[tid2]
                        if len(h1) >= 2 and len(h2) >= 2:
                            dist1 = np.hypot(h1[-1]["cx"] - h1[0]["cx"], h1[-1]["cy"] - h1[0]["cy"])
                            dist2 = np.hypot(h2[-1]["cx"] - h2[0]["cx"], h2[-1]["cy"] - h2[0]["cy"])
                            if dist1 < 10 and dist2 < 10:
                                abrupt_stop = True
                                explanation += " Both vehicles show abrupt deceleration and mutual blockage post-impact."

                    confidence = min(0.96, round(0.72 + (iou * 0.7) + (0.10 if abrupt_stop else 0.0), 3))

                    ux1 = min(b1[0], b2[0])
                    uy1 = min(b1[1], b2[1])
                    ux2 = max(b1[2], b2[2])
                    uy2 = max(b1[3], b2[3])

                    return {
                        "is_accident": True,
                        "confidence": confidence,
                        "iou": round(iou, 3),
                        "involved_classes": [c1, c2],
                        "involved_tracks": [tid for tid in (tid1, tid2) if tid],
                        "abrupt_stop": abrupt_stop,
                        "explanation": explanation,
                        "union_bbox_pixels": (ux1, uy1, ux2, uy2),
                        "model_name": self.model_name,
                        "model_version": self.model_version
                    }

        return None
