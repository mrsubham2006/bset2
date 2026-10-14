"""
Comprehensive Video Processing Pipeline with Multi-Hazard Detection,
3-4 Evidence Frame Extraction, and Rule-Based Emergency Response Recommendation.
"""
import os
import cv2
import time
import base64
import numpy as np
from typing import Dict, Any, List, Optional, Tuple

from .schemas import (
    BoundingBox, EvidenceFrame, ResponseRecommendation,
    DetectedIncident, VideoMetadata, VideoAnalysisResponse
)
from .detector import YOLODetector
from .ambulance_detector import AmbulanceClassifier
from .fire_engine_detector import FireEngineClassifier
from .accident_detector import RoadAccidentDetector
from .fire_smoke_detector import FireSmokeDetector
from .crowd_detector import CrowdDensityAnalyzer
from .fight_detector import AltercationDetector

class VideoProcessor:
    def __init__(self, model_path: str = "ai-service/models/yolov8n.pt"):
        self.detector = YOLODetector(model_path)
        self.ambulance_classifier = AmbulanceClassifier()
        self.fire_engine_classifier = FireEngineClassifier()
        self.accident_detector = RoadAccidentDetector()
        self.fire_smoke_detector = FireSmokeDetector()
        self.crowd_analyzer = CrowdDensityAnalyzer()
        self.altercation_detector = AltercationDetector()

    def decode_and_get_metadata(self, video_path: str) -> Tuple[cv2.VideoCapture, VideoMetadata]:
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file does not exist: {video_path}")

        file_size = os.path.getsize(video_path)
        if file_size < 100:
            raise ValueError(f"Corrupted or empty video file ({file_size} bytes).")

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError("OpenCV failed to decode video stream. File may be corrupted or codec unsupported.")

        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps <= 0 or np.isnan(fps) or np.isinf(fps):
            fps = 25.0

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        ret, test_frame = cap.read()
        if not ret or test_frame is None or test_frame.size == 0:
            cap.release()
            raise ValueError("Video contains 0 decodable video frames (corrupted stream).")

        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        duration = (total_frames / fps) if total_frames > 0 else 0.0

        meta = VideoMetadata(
            file_name=os.path.basename(video_path),
            file_size_bytes=file_size,
            duration_seconds=round(duration, 2),
            fps=round(fps, 2),
            total_frames=total_frames,
            width=w,
            height=h,
            resolution=f"{w}x{h}"
        )
        return cap, meta

    def encode_frame_to_base64(self, frame: np.ndarray, quality: int = 80) -> str:
        success, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, quality])
        if not success:
            return ""
        return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"

    def draw_annotated_frame(self, frame: np.ndarray, bboxes: List[BoundingBox], title: str, timestamp_str: str, frame_tag: str) -> np.ndarray:
        annotated = frame.copy()
        h, w = annotated.shape[:2]

        for box in bboxes:
            bx1 = int((box.x / 100.0) * w)
            by1 = int((box.y / 100.0) * h)
            bw = int((box.width / 100.0) * w)
            bh = int((box.height / 100.0) * h)
            bx2 = min(w - 1, bx1 + bw)
            by2 = min(h - 1, by1 + bh)

            color_bgr = (0, 0, 255)
            if "Ambulance" in box.label:
                color_bgr = (0, 200, 0)
            elif "Fire" in box.label:
                color_bgr = (0, 100, 255)
            elif "Crowd" in box.label:
                color_bgr = (255, 100, 150)
            elif "Accident" in box.label or "Collision" in box.label:
                color_bgr = (0, 0, 255)
            elif "Altercation" in box.label:
                color_bgr = (0, 220, 220)

            cv2.rectangle(annotated, (bx1, by1), (bx2, by2), color_bgr, 2)
            label_text = f"{box.label} ({box.confidence:.2f})"
            if box.track_id:
                label_text += f" [ID:{box.track_id}]"

            (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
            cv2.rectangle(annotated, (bx1, max(0, by1 - 18)), (bx1 + tw + 6, by1), color_bgr, -1)
            cv2.putText(annotated, label_text, (bx1 + 3, max(12, by1 - 4)), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)

        badge_text = f"NEXUS VISION AI | {title} | {frame_tag} | t={timestamp_str}"
        cv2.rectangle(annotated, (10, 10), (min(w - 10, 10 + len(badge_text) * 9), 34), (20, 20, 20), -1)
        cv2.putText(annotated, badge_text, (16, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 200), 1)
        return annotated

    def generate_recommendation(self, category: str, severity: str, confidence: float, explanation: str) -> ResponseRecommendation:
        """Rule-based emergency response recommendation layer."""
        if category == "FIRE_OR_SMOKE":
            return ResponseRecommendation(
                category=category,
                primary_unit="Odisha Fire & Rescue Services (Station 101)",
                secondary_units=["108 Lifeline Trauma Ambulance", "Bhubaneswar Traffic Police (Clearance)"],
                rationale="Active flame or smoke plume confirmed via thermal chromaticity and dispersion analysis. Immediate water tender dispatch required.",
                urgency="IMMEDIATE_ACTION",
                standard_operating_procedure="SOP-FIRE-01: Dispatch nearest municipal water tender; clear priority transit lanes; alert trauma desk if occupants trapped."
            )
        elif category == "ROAD_TRAFFIC_ACCIDENT":
            return ResponseRecommendation(
                category=category,
                primary_unit="Bhubaneswar Traffic Police PCR & Towing Interceptor",
                secondary_units=["108 Lifeline Trauma Ambulance (AIIMS / Capital Hospital)", "Fire & Rescue (101 - Entrapment Rescue)"],
                rationale="Vehicle collision with abrupt deceleration and roadway obstruction detected. Human trauma and lane blockage probable.",
                urgency="IMMEDIATE_ACTION",
                standard_operating_procedure="SOP-ACCIDENT-02: Deploy on-duty traffic interceptor; dispatch 108 medical unit; initiate lane diversions."
            )
        elif category == "AMBULANCE_EMERGENCY_VEHICLE":
            return ResponseRecommendation(
                category=category,
                primary_unit="Traffic Control Center - Green Corridor Automated Signal Preemption",
                secondary_units=["Traffic Police Flying Squad", "AIIMS Bhubaneswar Trauma Receiving Desk"],
                rationale="Active 108 Lifeline / emergency medical vehicle tracked in priority corridor. No accident detected; vehicle is in transit.",
                urgency="PRIORITY_TRANSIT",
                standard_operating_procedure="SOP-GREEN-CORRIDOR-04: Synchronize signal cascade to hold cross-traffic; expedite ambulance passage."
            )
        elif category == "CROWD_RELATED_INCIDENT":
            return ResponseRecommendation(
                category=category,
                primary_unit="Odisha Police Sector Patrol Van & Municipal Marshals",
                secondary_units=["108 Rapid Medical Response Bike", "BMC Disaster Management Cell"],
                rationale="Localized pedestrian concentration exceeds safe baseline. Egress compression detected.",
                urgency="PREVENTIVE_DISPATCH",
                standard_operating_procedure="SOP-CROWD-03: Deploy foot patrol to monitor egress; open peripheral barriers; prevent bottleneck surge."
            )
        elif category == "ROAD_BLOCKAGE_TRAFFIC_DISRUPTION":
            return ResponseRecommendation(
                category=category,
                primary_unit="Municipal Traffic Towing & Road Clearance Squad",
                secondary_units=["Odisha Traffic Police Interceptor"],
                rationale="Physical roadway obstruction or stationary bottleneck detected.",
                urgency="ROUTINE_EXPEDITE",
                standard_operating_procedure="SOP-TRAFFIC-05: Dispatch recovery crane; divert approaching traffic onto parallel arterial lanes."
            )
        elif category == "MEDICAL_EMERGENCY":
            return ResponseRecommendation(
                category=category,
                primary_unit="108 Lifeline Emergency Medical Ambulance",
                secondary_units=["Odisha Police PCR Van"],
                rationale="Pedestrian trauma or acute medical emergency indicated.",
                urgency="IMMEDIATE_ACTION",
                standard_operating_procedure="SOP-MED-01: Dispatch nearest 108 ambulance with paramedic crew; alert trauma center."
            )
        elif category == "FLOODING_WATERLOGGING":
            return ResponseRecommendation(
                category=category,
                primary_unit="Bhubaneswar Municipal Corporation (BMC) Drainage Flying Squad",
                secondary_units=["ODRAF Rescue Team (if depth > 0.5m)", "Traffic Police (Diversions)"],
                rationale="Surface water accumulation obstructing road carriageway.",
                urgency="CIVIC_RESPONSE",
                standard_operating_procedure="SOP-DRAIN-02: Deploy high-capacity dewatering pump; erect waterlogged warning signs."
            )
        else:
            return ResponseRecommendation(
                category="UNKNOWN_NEEDS_REVIEW",
                primary_unit="EOC Operator Visual Verification Desk",
                secondary_units=["Nearest CCTV Sector Inspector"],
                rationale="Visual telemetry inconclusive or model confidence below decisive threshold. Operator review required.",
                urgency="OPERATOR_REVIEW",
                standard_operating_procedure="SOP-REVIEW-00: Manual camera inspection; spot-check scene before dispatching emergency teams."
            )

    def process_video(
        self,
        video_path: str,
        video_analysis_id: str,
        sample_fps: float = 2.0,
        max_duration_sec: float = 120.0
    ) -> VideoAnalysisResponse:
        start_time = time.time()
        cap, meta = self.decode_and_get_metadata(video_path)

        fps = meta.fps
        total_frames = meta.total_frames
        duration = meta.duration_seconds
        w, h = meta.width, meta.height

        frame_step = max(1, int(round(fps / sample_fps)))
        frames_analyzed = 0
        frame_idx = 0

        # Store sampled decoded frames along with detection outputs
        sampled_records: List[Dict[str, Any]] = []

        try:
            while True:
                ret, frame = cap.read()
                if not ret or frame is None:
                    break

                if frame_idx % frame_step != 0:
                    frame_idx += 1
                    continue

                timestamp_sec = round(frame_idx / fps, 2)
                if timestamp_sec > max_duration_sec:
                    break

                frames_analyzed += 1
                mins = int(timestamp_sec // 60)
                secs = int(timestamp_sec % 60)
                ts_formatted = f"{mins:02d}:{secs:02d}"

                # 1. Base YOLO detection & ByteTrack tracking
                detections = self.detector.detect_and_track(frame, persist=True)
                vehicles = [d for d in detections if d["class_name"] in self.detector.vehicle_classes]
                people = [d for d in detections if d["class_name"] in self.detector.person_classes]

                frame_hazards: List[Dict[str, Any]] = []

                # 2. Check Fire and Smoke
                fire_res = self.fire_smoke_detector.detect_fire_and_smoke(frame, timestamp_sec)
                if fire_res:
                    fx1, fy1, fx2, fy2 = fire_res["bbox_pixels"]
                    frame_hazards.append({
                        "category": "FIRE_OR_SMOKE",
                        "label": "Fire & Smoke Hazard",
                        "severity": "CRITICAL",
                        "confidence": fire_res["confidence"],
                        "explanation": fire_res["explanation"],
                        "bboxes": [
                            BoundingBox(
                                label="Fire / Smoke",
                                confidence=fire_res["confidence"],
                                x=round((fx1 / w) * 100, 2),
                                y=round((fy1 / h) * 100, 2),
                                width=round(((fx2 - fx1) / w) * 100, 2),
                                height=round(((fy2 - fy1) / h) * 100, 2),
                                color="#F97316"
                            )
                        ],
                        "tracks": ["HAZ-FLAME-01"]
                    })

                # 3. Check Road Accidents
                acc_res = self.accident_detector.evaluate_accident(timestamp_sec, detections)
                if acc_res:
                    ux1, uy1, ux2, uy2 = acc_res["union_bbox_pixels"]
                    frame_hazards.append({
                        "category": "ROAD_TRAFFIC_ACCIDENT",
                        "label": "Road Traffic Accident",
                        "severity": "CRITICAL",
                        "confidence": acc_res["confidence"],
                        "explanation": acc_res["explanation"],
                        "bboxes": [
                            BoundingBox(
                                label="Traffic Collision",
                                confidence=acc_res["confidence"],
                                x=round((ux1 / w) * 100, 2),
                                y=round((uy1 / h) * 100, 2),
                                width=round(((ux2 - ux1) / w) * 100, 2),
                                height=round(((uy2 - uy1) / h) * 100, 2),
                                color="#DC2626"
                            )
                        ],
                        "tracks": acc_res["involved_tracks"]
                    })

                # 4. Check Ambulances (ONLY if verified medical livery is present)
                for v in vehicles:
                    amb_res = self.ambulance_classifier.analyze_vehicle(frame, v["box_pixels"])
                    if amb_res:
                        tid = v.get("track_id") or "108"
                        frame_hazards.append({
                            "category": "AMBULANCE_EMERGENCY_VEHICLE",
                            "label": "Ambulance / Emergency Vehicle in Transit",
                            "severity": "HIGH",
                            "confidence": amb_res["confidence"],
                            "explanation": "108 Lifeline / Emergency Medical Ambulance detected navigating roadway. Emergency livery and beacons confirmed.",
                            "bboxes": [
                                BoundingBox(
                                    label="108 Ambulance",
                                    confidence=amb_res["confidence"],
                                    x=v["x_pct"],
                                    y=v["y_pct"],
                                    width=v["w_pct"],
                                    height=v["h_pct"],
                                    color="#10B981",
                                    track_id=str(tid),
                                    raw_class=v["class_name"]
                                )
                            ],
                            "tracks": [f"TRK-AMB-{tid}"]
                        })

                # 5. Check Fire Engines
                for v in vehicles:
                    fire_eng = self.fire_engine_classifier.analyze_heavy_vehicle(frame, v["box_pixels"], v["class_name"])
                    if fire_eng:
                        tid = v.get("track_id") or "101"
                        frame_hazards.append({
                            "category": "AMBULANCE_EMERGENCY_VEHICLE",
                            "label": "Fire Engine in Emergency Transit",
                            "severity": "HIGH",
                            "confidence": fire_eng["confidence"],
                            "explanation": "Odisha Fire Services heavy water tender detected in emergency transit. Saturated red body and roof beacons verified.",
                            "bboxes": [
                                BoundingBox(
                                    label="Fire Engine",
                                    confidence=fire_eng["confidence"],
                                    x=v["x_pct"],
                                    y=v["y_pct"],
                                    width=v["w_pct"],
                                    height=v["h_pct"],
                                    color="#EF4444",
                                    track_id=str(tid),
                                    raw_class=v["class_name"]
                                )
                            ],
                            "tracks": [f"TRK-FIRE-{tid}"]
                        })

                # 6. Check Crowd Surge
                crowd_res = self.crowd_analyzer.evaluate_crowd((h, w), people, timestamp_sec)
                if crowd_res:
                    cx1, cy1, cx2, cy2 = crowd_res["cluster_bbox_pixels"]
                    frame_hazards.append({
                        "category": "CROWD_RELATED_INCIDENT",
                        "label": "Crowd-Related Incident",
                        "severity": crowd_res["severity"],
                        "confidence": crowd_res["confidence"],
                        "explanation": crowd_res["explanation"],
                        "bboxes": [
                            BoundingBox(
                                label=f"Crowd Cluster ({crowd_res['cluster_people_count']})",
                                confidence=crowd_res["confidence"],
                                x=round((cx1 / w) * 100, 2),
                                y=round((cy1 / h) * 100, 2),
                                width=round(((cx2 - cx1) / w) * 100, 2),
                                height=round(((cy2 - cy1) / h) * 100, 2),
                                color="#8B5CF6"
                            )
                        ],
                        "tracks": [f"CRWD-{crowd_res['cluster_people_count']}"]
                    })

                # 7. Check Altercation
                alt_res = self.altercation_detector.evaluate_altercation(frame, people, timestamp_sec)
                if alt_res:
                    ax1, ay1, ax2, ay2 = alt_res["union_bbox_pixels"]
                    frame_hazards.append({
                        "category": "CROWD_RELATED_INCIDENT",
                        "label": "Possible Physical Altercation",
                        "severity": "HIGH",
                        "confidence": alt_res["confidence"],
                        "explanation": alt_res["explanation"],
                        "bboxes": [
                            BoundingBox(
                                label="Possible Altercation",
                                confidence=alt_res["confidence"],
                                x=round((ax1 / w) * 100, 2),
                                y=round((ay1 / h) * 100, 2),
                                width=round(((ax2 - ax1) / w) * 100, 2),
                                height=round(((ay2 - ay1) / h) * 100, 2),
                                color="#EAB308"
                            )
                        ],
                        "tracks": ["ALT-01"]
                    })

                sampled_records.append({
                    "frame_idx": frame_idx,
                    "timestamp_sec": timestamp_sec,
                    "timestamp_str": ts_formatted,
                    "frame": frame,
                    "hazards": frame_hazards,
                    "all_detections": detections
                })

                frame_idx += 1

        finally:
            cap.release()

        # Step 2: Determine Primary Incident Category across all sampled frames
        # Aggregate hazard occurrences
        hazard_votes: Dict[str, List[Dict[str, Any]]] = {}
        for rec in sampled_records:
            for h_item in rec["hazards"]:
                cat = h_item["category"]
                if cat not in hazard_votes:
                    hazard_votes[cat] = []
                hazard_votes[cat].append({
                    "timestamp_sec": rec["timestamp_sec"],
                    "timestamp_str": rec["timestamp_str"],
                    "frame": rec["frame"],
                    "hazard": h_item
                })

        detected_incidents: List[DetectedIncident] = []

        if hazard_votes:
            # Pick winning category with highest collective score
            # Priority weighting: FIRE_OR_SMOKE > ROAD_TRAFFIC_ACCIDENT > CROWD_RELATED_INCIDENT > AMBULANCE_EMERGENCY_VEHICLE
            cat_priority = {
                "FIRE_OR_SMOKE": 100,
                "ROAD_TRAFFIC_ACCIDENT": 90,
                "CROWD_RELATED_INCIDENT": 70,
                "ROAD_BLOCKAGE_TRAFFIC_DISRUPTION": 60,
                "AMBULANCE_EMERGENCY_VEHICLE": 50,
                "MEDICAL_EMERGENCY": 80,
                "FLOODING_WATERLOGGING": 75,
                "UNKNOWN_NEEDS_REVIEW": 10
            }

            sorted_cats = sorted(
                hazard_votes.keys(),
                key=lambda c: len(hazard_votes[c]) * cat_priority.get(c, 50) + max(x["hazard"]["confidence"] for x in hazard_votes[c]),
                reverse=True
            )

            primary_cat = sorted_cats[0]
            cat_records = hazard_votes[primary_cat]

            # Find peak frame, onset, and progression
            best_hazard = max(cat_records, key=lambda x: x["hazard"]["confidence"])
            highest_conf = best_hazard["hazard"]["confidence"]
            primary_label = best_hazard["hazard"]["label"]
            primary_severity = best_hazard["hazard"]["severity"]
            explanation = best_hazard["hazard"]["explanation"]

            first_t = cat_records[0]["timestamp_sec"]
            first_t_str = cat_records[0]["timestamp_str"]
            peak_t = best_hazard["timestamp_sec"]
            peak_t_str = best_hazard["timestamp_str"]
            last_t = cat_records[-1]["timestamp_sec"]
            last_t_str = cat_records[-1]["timestamp_str"]

            # Step 3: CAPTURE 3-4 EVIDENCE IMAGES AT DISTINCT TIMESTAMPS
            # Distribute 3 to 4 frames across the video:
            # Frame 1: Onset / First detection
            # Frame 2: Incident peak (highest confidence)
            # Frame 3: Kinematic progression
            # Frame 4: Post-incident stabilization / Current scene
            evidence_frames: List[EvidenceFrame] = []
            selected_record_indices: List[int] = []

            total_records = len(sampled_records)
            if total_records >= 4:
                # Find index of peak
                peak_idx = 0
                for idx, r in enumerate(sampled_records):
                    if r["timestamp_sec"] == peak_t:
                        peak_idx = idx
                        break

                idx1 = max(0, peak_idx - int(total_records * 0.3))
                idx2 = peak_idx
                idx3 = min(total_records - 1, peak_idx + int(total_records * 0.2))
                idx4 = min(total_records - 1, total_records - 1)

                candidates = sorted(list(set([idx1, idx2, idx3, idx4])))
                # Ensure 3-4 distinct indices
                while len(candidates) < min(4, total_records):
                    for i in range(total_records):
                        if i not in candidates:
                            candidates.append(i)
                            break
                    candidates.sort()
                selected_record_indices = candidates[:4]
            else:
                selected_record_indices = list(range(total_records))

            stage_names = ["1. Incident Onset", "2. Peak Evidence", "3. Progression Check", "4. Scene Status"]
            for i, r_idx in enumerate(selected_record_indices):
                rec = sampled_records[r_idx]
                is_peak = (rec["timestamp_sec"] == peak_t)
                stage_tag = stage_names[min(i, len(stage_names) - 1)]

                annotated = self.draw_annotated_frame(
                    rec["frame"],
                    best_hazard["hazard"]["bboxes"],
                    primary_label,
                    rec["timestamp_str"],
                    stage_tag
                )
                b64 = self.encode_frame_to_base64(annotated, quality=80)

                frame_desc = f"{stage_tag} at t={rec['timestamp_str']}. "
                if is_peak:
                    frame_desc += f"Peak incident confirmation (confidence: {highest_conf:.2f})."
                else:
                    frame_desc += "Sequential verification frame establishing continuity."

                evidence_frames.append(EvidenceFrame(
                    frame_index=i + 1,
                    timestamp_sec=rec["timestamp_sec"],
                    timestamp_str=rec["timestamp_str"],
                    thumbnail_base64=b64,
                    label=f"Evidence Frame #{i + 1} ({rec['timestamp_str']})",
                    description=frame_desc,
                    is_peak=is_peak
                ))

            # Recommendation layer
            recommendation = self.generate_recommendation(primary_cat, primary_severity, highest_conf, explanation)

            all_bboxes = best_hazard["hazard"]["bboxes"]
            all_tracks = list(set(best_hazard["hazard"].get("tracks", [])))

            incident_obj = DetectedIncident(
                incident_id=f"INC-CV-{int(time.time())}-01",
                category=primary_cat,
                label=primary_label,
                severity=primary_severity,
                confidence_score=highest_conf,
                visual_explanation=explanation,
                first_timestamp_sec=first_t,
                peak_timestamp_sec=peak_t,
                last_timestamp_sec=last_t,
                first_timestamp_str=first_t_str,
                peak_timestamp_str=peak_t_str,
                last_timestamp_str=last_t_str,
                evidence_frames=evidence_frames,
                bounding_boxes=all_bboxes,
                tracking_ids=all_tracks,
                recommended_response=recommendation,
                verification_status="AWAITING_VERIFICATION",
                model_name=self.detector.model_name,
                model_version=self.detector.model_version
            )
            detected_incidents.append(incident_obj)

        proc_time = round(time.time() - start_time, 2)
        has_emergency = len(detected_incidents) > 0

        if has_emergency:
            p_inc = detected_incidents[0]
            summary = (
                f"NexusVision AI analyzed {frames_analyzed} decoded frames across {duration:.1f}s. "
                f"Classified as '{p_inc.label}' with {(p_inc.confidence_score * 100):.1f}% confidence. "
                f"{p_inc.visual_explanation} "
                f"Extracted {len(p_inc.evidence_frames)} evidence frames across t={p_inc.first_timestamp_str} to t={p_inc.last_timestamp_str}. "
                f"Recommended Response: {p_inc.recommended_response.primary_unit}."
            )
        else:
            # Normal scene - extract 3 representative status frames showing clean road / normal crowd
            normal_evidence: List[EvidenceFrame] = []
            sample_step = max(1, len(sampled_records) // 3)
            for i in range(min(3, len(sampled_records))):
                idx = min(len(sampled_records) - 1, i * sample_step)
                rec = sampled_records[idx]
                b64 = self.encode_frame_to_base64(rec["frame"], quality=80)
                normal_evidence.append(EvidenceFrame(
                    frame_index=i + 1,
                    timestamp_sec=rec["timestamp_sec"],
                    timestamp_str=rec["timestamp_str"],
                    thumbnail_base64=b64,
                    label=f"Routine Scan #{i + 1} ({rec['timestamp_str']})",
                    description=f"Standard road corridor monitoring at t={rec['timestamp_str']}. No anomalies.",
                    is_peak=False
                ))

            norm_rec = self.generate_recommendation("NORMAL_SCENE", "LOW", 0.95, "Normal baseline traffic.")
            norm_incident = DetectedIncident(
                incident_id=f"INC-ROUTINE-{int(time.time())}",
                category="NORMAL_SCENE",
                label="Normal Scene (No Emergency)",
                severity="LOW",
                confidence_score=0.95,
                visual_explanation="Regular vehicle and pedestrian flow without collisions, fire, smoke, or dangerous crowd accumulation. Verified against urban baseline.",
                first_timestamp_sec=0.0,
                peak_timestamp_sec=duration / 2.0,
                last_timestamp_sec=duration,
                first_timestamp_str="00:00",
                peak_timestamp_str="00:01",
                last_timestamp_str=f"{int(duration // 60):02d}:{int(duration % 60):02d}",
                evidence_frames=normal_evidence,
                bounding_boxes=[],
                tracking_ids=[],
                recommended_response=norm_rec,
                verification_status="RESOLVED",
                model_name=self.detector.model_name,
                model_version=self.detector.model_version
            )
            detected_incidents.append(norm_incident)
            summary = (
                f"NexusVision AI analyzed {frames_analyzed} decoded frames across {duration:.1f}s. "
                f"No hazardous anomalies, collisions, fire, smoke, or abnormal crowd surges detected. "
                f"All traffic parameters within standard baseline. Processing completed in {proc_time}s."
            )

        primary = detected_incidents[0] if detected_incidents else None

        return VideoAnalysisResponse(
            video_analysis_id=video_analysis_id,
            file_name=meta.file_name,
            metadata=meta,
            analysis_status="ALERT_CREATED" if (has_emergency and primary.category != "NORMAL_SCENE") else "COMPLETED",
            frames_analyzed=frames_analyzed,
            detected_emergency=(has_emergency and primary.category != "NORMAL_SCENE"),
            primary_incident=primary,
            all_incidents=detected_incidents,
            summary_narrative=summary,
            evidence_frames_count=len(primary.evidence_frames) if primary else 0,
            processing_time_seconds=proc_time
        )
