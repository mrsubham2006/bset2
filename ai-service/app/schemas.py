"""
Schemas for Video Incident Detection & Evidence Intelligence Pipeline.
Supports all required emergency categories, multi-frame evidence collection (3-4 frames),
rule-based response recommendations, and verification tracking.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class BoundingBox(BaseModel):
    label: str
    confidence: float
    x: float          # Normalized percentage (0-100)
    y: float          # Normalized percentage (0-100)
    width: float      # Normalized percentage (0-100)
    height: float     # Normalized percentage (0-100)
    color: str
    track_id: Optional[str] = None
    raw_class: Optional[str] = None

class EvidenceFrame(BaseModel):
    frame_index: int
    timestamp_sec: float
    timestamp_str: str
    thumbnail_base64: str
    label: str
    description: str
    is_peak: bool = False

class ResponseRecommendation(BaseModel):
    category: str
    primary_unit: str
    secondary_units: List[str] = []
    rationale: str
    urgency: str
    standard_operating_procedure: str

class DetectedIncident(BaseModel):
    incident_id: str
    category: str  # FIRE_OR_SMOKE, ROAD_TRAFFIC_ACCIDENT, AMBULANCE_EMERGENCY_VEHICLE, MEDICAL_EMERGENCY, ROAD_BLOCKAGE_TRAFFIC_DISRUPTION, CROWD_RELATED_INCIDENT, FLOODING_WATERLOGGING, UNKNOWN_NEEDS_REVIEW, NORMAL_SCENE
    label: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    confidence_score: float
    visual_explanation: str
    first_timestamp_sec: float
    peak_timestamp_sec: float
    last_timestamp_sec: float
    first_timestamp_str: str
    peak_timestamp_str: str
    last_timestamp_str: str
    evidence_frames: List[EvidenceFrame] = []
    bounding_boxes: List[BoundingBox] = []
    tracking_ids: List[str] = []
    recommended_response: ResponseRecommendation
    verification_status: str = "AWAITING_VERIFICATION"
    model_name: str
    model_version: str

class VideoMetadata(BaseModel):
    file_name: str
    file_size_bytes: int
    duration_seconds: float
    fps: float
    total_frames: int
    width: int
    height: int
    resolution: str

class VideoAnalysisResponse(BaseModel):
    video_analysis_id: str
    file_name: str
    metadata: VideoMetadata
    analysis_status: str  # UPLOADED, QUEUED, PROCESSING, DETECTION_CANDIDATE_FOUND, ALERT_CREATED, COMPLETED, FAILED
    frames_analyzed: int
    detected_emergency: bool
    primary_incident: Optional[DetectedIncident] = None
    all_incidents: List[DetectedIncident] = []
    summary_narrative: str
    evidence_frames_count: int
    processing_time_seconds: float
    pipeline_version: str = "NexusVision-MultiHazard-v3.2"
    error_detail: Optional[str] = None
