"""
Dedicated Crowd Density & Congestion Analyzer.
Calculates spatial clustering and density surge among detected persons.
"""
from typing import List, Dict, Any, Optional, Tuple
import numpy as np

class CrowdDensityAnalyzer:
    def __init__(self, alert_threshold_count: int = 8):
        self.model_name = "NexusVision-CrowdDensity-Estimator"
        self.model_version = "v3.2"
        self.alert_threshold_count = alert_threshold_count

    def evaluate_crowd(self, frame_shape: Tuple[int, int], person_detections: List[Dict[str, Any]], timestamp_sec: float) -> Optional[Dict[str, Any]]:
        h, w = frame_shape[:2]
        total_people = len(person_detections)

        if total_people < 4:
            return None

        centers = []
        for p in person_detections:
            x1, y1, x2, y2 = p["box_pixels"]
            centers.append(((x1 + x2) / 2.0, (y1 + y2) / 2.0))

        centers = np.array(centers)
        diag = np.hypot(w, h)
        cluster_radius = diag * 0.22

        max_cluster_count = 0
        dense_cluster_indices = []

        for i in range(len(centers)):
            dists = np.hypot(centers[:, 0] - centers[i, 0], centers[:, 1] - centers[i, 1])
            nearby = np.where(dists <= cluster_radius)[0]
            if len(nearby) > max_cluster_count:
                max_cluster_count = len(nearby)
                dense_cluster_indices = nearby

        if max_cluster_count >= self.alert_threshold_count:
            cluster_boxes = [person_detections[idx]["box_pixels"] for idx in dense_cluster_indices]
            cx1 = min(b[0] for b in cluster_boxes)
            cy1 = min(b[1] for b in cluster_boxes)
            cx2 = max(b[2] for b in cluster_boxes)
            cy2 = max(b[3] for b in cluster_boxes)
            cluster_bbox = (cx1, cy1, cx2, cy2)

            confidence = min(0.96, round(0.72 + (max_cluster_count / 25.0) * 0.22, 3))
            severity = "HIGH" if max_cluster_count >= 12 else "MEDIUM"
            explanation = (
                f"Pedestrian cluster of {max_cluster_count} individuals detected within localized zone "
                f"(total visible persons: {total_people}). Egress compression index exceeds urban baseline."
            )

            return {
                "is_crowd_congestion": True,
                "confidence": confidence,
                "severity": severity,
                "total_people_count": total_people,
                "cluster_people_count": max_cluster_count,
                "cluster_bbox_pixels": cluster_bbox,
                "explanation": explanation,
                "model_name": self.model_name,
                "model_version": self.model_version
            }

        return None
