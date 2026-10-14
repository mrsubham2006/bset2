"""
CLI Runner for Video Processor.
Allows direct execution:
python3 ai-service/app/cli.py <video_file_path> <analysis_id> [sample_fps]
Outputs JSON to stdout.
"""
import sys
import os
import json

# Ensure parent directories are in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
root_dir = os.path.dirname(parent_dir)
for p in (current_dir, parent_dir, root_dir):
    if p not in sys.path:
        sys.path.insert(0, p)

from app.video_processor import VideoProcessor

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python3 cli.py <video_path> [analysis_id] [sample_fps]"}))
        sys.exit(1)

    video_path = sys.argv[1]
    analysis_id = sys.argv[2] if len(sys.argv) > 2 else "VID-CLI-TEST"
    sample_fps = float(sys.argv[3]) if len(sys.argv) > 3 else 2.0

    model_path = os.environ.get("YOLO_MODEL_PATH", "ai-service/models/yolov8n.pt")
    if not os.path.exists(model_path) and os.path.exists("yolov8n.pt"):
        model_path = "yolov8n.pt"

    try:
        processor = VideoProcessor(model_path)
        result = processor.process_video(
            video_path=video_path,
            video_analysis_id=analysis_id,
            sample_fps=sample_fps
        )
        try:
            print(result.model_dump_json())
        except AttributeError:
            print(result.json())
    except Exception as e:
        print(json.dumps({"error": str(e), "analysis_status": "FAILED"}))
        sys.exit(2)

if __name__ == "__main__":
    main()
