"""
Ultralytics YOLOv8 Base Object Detector with ByteTrack Multi-Object Tracking.
"""
import os
import cv2
import numpy as np
from typing import List, Dict, Any
from ultralytics import YOLO

os.environ["YOLO_CONFIG_DIR"] = "/tmp/Ultralytics"

class YOLODetector:
    def __init__(self, model_path: str = "ai-service/models/yolov8n.pt"):
        if not os.path.exists(model_path):
            if os.path.exists("yolov8n.pt"):
                model_path = "yolov8n.pt"

        self.model = YOLO(model_path)
        self.names = self.model.names
        self.model_name = "Ultralytics YOLOv8n"
        self.model_version = "8.4.177"
        self.vehicle_classes = {"car", "truck", "bus", "motorcycle"}
        self.person_classes = {"person"}

    def detect_and_track(self, frame: np.ndarray, persist: bool = True) -> List[Dict[str, Any]]:
        h, w = frame.shape[:2]
        detections = []

        try:
            results = self.model.track(frame, persist=persist, verbose=False, tracker="bytetrack.yaml")
        except Exception:
            results = self.model.predict(frame, verbose=False)

        if not results or len(results) == 0:
            return detections

        r = results[0]
        boxes = r.boxes
        if boxes is None or len(boxes) == 0:
            return detections

        for box in boxes:
            cls_id = int(box.cls[0].item())
            cls_name = self.names.get(cls_id, f"class_{cls_id}")
            conf = float(box.conf[0].item())

            if conf < 0.25:
                continue

            xyxy = box.xyxy[0].tolist()
            x1, y1, x2, y2 = xyxy
            x1 = max(0, min(w, x1))
            y1 = max(0, min(h, y1))
            x2 = max(0, min(w, x2))
            y2 = max(0, min(h, y2))

            box_w = x2 - x1
            box_h = y2 - y1
            if box_w <= 0 or box_h <= 0:
                continue

            track_id = None
            if box.id is not None:
                track_id = str(int(box.id[0].item()))

            detections.append({
                "class_id": cls_id,
                "class_name": cls_name,
                "confidence": round(conf, 3),
                "box_pixels": (int(x1), int(y1), int(x2), int(y2)),
                "x_pct": round((x1 / w) * 100.0, 2),
                "y_pct": round((y1 / h) * 100.0, 2),
                "w_pct": round((box_w / w) * 100.0, 2),
                "h_pct": round((box_h / h) * 100.0, 2),
                "track_id": track_id
            })

        return detections
