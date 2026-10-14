"""
FastAPI Server for AI Video Incident Detection & Evidence Intelligence.
"""
import os
import shutil
import tempfile
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from .schemas import VideoAnalysisResponse
from .video_processor import VideoProcessor

app = FastAPI(
    title="CIVIC NEXUS AI - Computer Vision Emergency Detection Service",
    version="3.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

processor: Optional[VideoProcessor] = None

@app.on_event("startup")
def startup_event():
    global processor
    print("🚀 Initializing NexusVision Computer Vision Engine with Ultralytics YOLOv8n...")
    model_path = os.environ.get("YOLO_MODEL_PATH", "ai-service/models/yolov8n.pt")
    processor = VideoProcessor(model_path)
    print("✅ NexusVision Engine loaded and ready for multi-hazard video inference.")

@app.get("/health")
def health_check():
    global processor
    is_ready = processor is not None
    return {
        "status": "HEALTHY" if is_ready else "INITIALIZING",
        "service": "CivicNexus-Vision-AI",
        "engine": "Ultralytics YOLOv8 + OpenCV",
        "model_loaded": is_ready,
        "categories_supported": [
            "FIRE_OR_SMOKE",
            "ROAD_TRAFFIC_ACCIDENT",
            "AMBULANCE_EMERGENCY_VEHICLE",
            "CROWD_RELATED_INCIDENT",
            "ROAD_BLOCKAGE_TRAFFIC_DISRUPTION",
            "MEDICAL_EMERGENCY",
            "FLOODING_WATERLOGGING",
            "UNKNOWN_NEEDS_REVIEW",
            "NORMAL_SCENE"
        ]
    }

@app.post("/analyze-file-path", response_model=VideoAnalysisResponse)
async def analyze_file_path(
    video_path: str = Form(...),
    video_analysis_id: str = Form("VID-DEFAULT"),
    sample_fps: float = Form(2.0),
    max_duration_sec: float = Form(120.0)
):
    global processor
    if not processor:
        raise HTTPException(status_code=503, detail="AI Vision Engine is still loading.")

    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail=f"File not found: {video_path}")

    try:
        response = processor.process_video(
            video_path=video_path,
            video_analysis_id=video_analysis_id,
            sample_fps=sample_fps,
            max_duration_sec=max_duration_sec
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
