import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload, Video, AlertTriangle, CheckCircle2, Loader2, X, Eye,
  Zap, ShieldAlert, Flame, Car, Users, Siren, BellRing,
  FileVideo, ImageIcon, Cpu, Activity, MapPin, Clock, RadioTower,
  ChevronRight, Info, Sparkles, AlertOctagon, Play, Pause, RotateCcw,
  Camera, Volume2, VolumeX, ArrowRight, ShieldCheck, Check,
  Navigation, CheckCircle, Crosshair, HelpCircle, CornerDownRight,
  Sliders, Compass
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

export interface BoundingBox {
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface VideoFrameSample {
  timestampSeconds: number;
  timestampFormatted: string;
  frameBase64: string;
}

export interface DetectedEventCard {
  eventId: string;
  eventType: string;
  videoTimestamp: string;
  videoTimestampSeconds: number;
  confidenceScore: number;
  evidenceThumbnail: string;
  boundingBoxes: BoundingBox[];
  trackingId?: string;
  trackingStatus?: string;
  description: string;
  verificationStatus: 'AI_CANDIDATE' | 'AWAITING_VERIFICATION' | 'VERIFIED' | 'FALSE_ALARM' | 'RESOLVED';
  recommendedAction: string;
  incidentId?: number;
  alertId?: string;
}

export interface VideoAnalysisSummary {
  videoAnalysisId: string;
  uploadedBy: string;
  storageReference: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  durationSeconds: number;
  resolution: string;
  framesAnalyzed: number;
  analysisStatus: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  processingStartedAt: string;
  processingCompletedAt?: string;
  pipelineVersion: string;
  locationName: string;
  cameraCode?: string;
  recordedAt?: string;
  description?: string;
  summaryNarrative: string;
  detectedEmergency: boolean;
  events: DetectedEventCard[];
  routeVerificationStatus?: 'UNVERIFIED' | 'VERIFIED' | 'NOT_APPLICABLE';
  routeClearanceRequestId?: string;
}

export interface RouteClearanceRequestData {
  requestId: string;
  incidentId: number;
  alertId?: string;
  videoAnalysisId?: string;
  vehicleType: 'AMBULANCE' | 'FIRE_ENGINE' | 'POLICE_ESCORT' | 'DISASTER_RESCUE';
  vehicleCallSign?: string;
  routeReference: string;
  requestedBy: string;
  requestStatus: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'CLEARED' | 'REJECTED';
  originLocation: string;
  destinationHospital: string;
  corridorSegments: { segmentName: string; roadName: string; status: 'CLEAR' | 'CONGESTED' | 'PREEMPTED'; etaMinutes: number }[];
  preemptionSignals: string[];
  trafficClearanceNotice: string;
  createdAt: string;
}

interface VideoIntelligencePanelProps {
  onSosCreated?: (alert: any, incident: any) => void;
  onTriggerSiren?: () => void;
}

// ── Constants ──────────────────────────────────────────────────────────────

const DETECTION_CONFIGS: Record<string, { label: string; icon: string; color: string; bgClass: string; borderClass: string; textClass: string }> = {
  'AMBULANCE_IN_TRANSIT':    { label: 'Ambulance in Transit',        icon: '🚑', color: '#10B981', bgClass: 'bg-emerald-950/70', borderClass: 'border-emerald-500/60', textClass: 'text-emerald-300' },
  'FIRE_ENGINE_IN_TRANSIT':  { label: 'Fire Engine in Transit',      icon: '🚒', color: '#EF4444', bgClass: 'bg-rose-950/70',    borderClass: 'border-rose-500/60',    textClass: 'text-rose-300'    },
  'OTHER_EMERGENCY_VEHICLE': { label: 'Emergency Response Vehicle', icon: '🚔', color: '#3B82F6', bgClass: 'bg-blue-950/70',    borderClass: 'border-blue-500/60',    textClass: 'text-blue-300'    },
  'POSSIBLE_FIRE_OR_SMOKE':  { label: 'Fire & Smoke Detected',       icon: '🔥', color: '#F97316', bgClass: 'bg-orange-950/70',  borderClass: 'border-orange-500/60',  textClass: 'text-orange-300'  },
  'POSSIBLE_ROAD_ACCIDENT':  { label: 'Possible Road Accident',      icon: '💥', color: '#DC2626', bgClass: 'bg-red-950/70',     borderClass: 'border-red-500/60',     textClass: 'text-red-300'     },
  'CROWD_CONGESTION':        { label: 'Unusual Crowd Density',       icon: '👥', color: '#8B5CF6', bgClass: 'bg-purple-950/70',  borderClass: 'border-purple-500/60',  textClass: 'text-purple-300'  },
  'PHYSICAL_ALTERCATION':    { label: 'Possible Physical Altercation', icon: '⚠️', color: '#EAB308', bgClass: 'bg-yellow-950/70', borderClass: 'border-yellow-500/60', textClass: 'text-yellow-300'  },
  'CROWD_SAFETY_EMERGENCY':  { label: 'Potential Crowd Safety Risk', icon: '🆘', color: '#EC4899', bgClass: 'bg-pink-950/70',    borderClass: 'border-pink-500/60',    textClass: 'text-pink-300'    },
};

const REGISTERED_CAMERAS = [
  { code: 'CCTV-OD-101', name: 'Rasulgarh Junction Flyover NH-16', lat: 20.2961, lng: 85.8645 },
  { code: 'CCTV-OD-102', name: 'Vani Vihar Square Underpass', lat: 20.3015, lng: 85.8450 },
  { code: 'CCTV-OD-103', name: 'Unit-1 Daily Market Central Square', lat: 20.2710, lng: 85.8320 },
  { code: 'CCTV-OD-104', name: 'Khandagiri Square NH-16 Junction', lat: 20.2580, lng: 85.7870 },
  { code: 'CCTV-OD-105', name: 'Master Canteen Bus Terminal Exit', lat: 20.2675, lng: 85.8430 },
  { code: 'MANUAL-UPLOAD-INTEL', name: 'Manual Video Upload (Laptop / Local File Feed)', lat: 20.2961, lng: 85.8645 }
];

// Quick Scenario Presets for Instant Testing of All 8 Categories + Normal Footage
const TEST_PRESETS = [
  {
    name: '🚑 108 Ambulance in Traffic',
    category: 'AMBULANCE_IN_TRANSIT',
    location: 'Rasulgarh Junction Flyover NH-16',
    camera: 'CCTV-OD-101',
    description: '108 Lifeline Trauma Unit navigating congested flyover bottleneck.',
    previewImg: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=640'
  },
  {
    name: '🚒 Odisha Fire Engine (101)',
    category: 'FIRE_ENGINE_IN_TRANSIT',
    location: 'Kalpana Square Arterial Corridor',
    camera: 'CCTV-OD-103',
    description: 'Odisha Fire Services heavy water tender in emergency transit.',
    previewImg: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=640'
  },
  {
    name: '🔥 Fire & Expanding Smoke',
    category: 'POSSIBLE_FIRE_OR_SMOKE',
    location: 'Unit-1 Daily Market Central Square',
    camera: 'CCTV-OD-103',
    description: 'Visible flames and dense rising smoke plume in commercial market.',
    previewImg: 'https://images.unsplash.com/photo-1527430253228-e93688616381?w=640'
  },
  {
    name: '💥 Road Collision & Overturn',
    category: 'POSSIBLE_ROAD_ACCIDENT',
    location: 'Khandagiri Square NH-16 Junction',
    camera: 'CCTV-OD-104',
    description: 'Two-vehicle collision with abrupt stoppage blocking lane 1 and 2.',
    previewImg: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=640'
  },
  {
    name: '👥 Crowd Density Surge',
    category: 'CROWD_CONGESTION',
    location: 'Master Canteen Bus Terminal Exit',
    camera: 'CCTV-OD-105',
    description: 'Abnormal passenger crowd surge with severe movement compression.',
    previewImg: 'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=640'
  },
  {
    name: '⚠️ Potential Physical Altercation',
    category: 'PHYSICAL_ALTERCATION',
    location: 'Vani Vihar Square Underpass',
    camera: 'CCTV-OD-102',
    description: 'Aggressive physical motion patterns between multiple individuals.',
    previewImg: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=640'
  },
  {
    name: '✅ Normal Street (No Emergency)',
    category: 'NONE',
    location: 'Janpath Boulevard Central',
    camera: 'CCTV-OD-105',
    description: 'Standard urban traffic flow with zero emergency signatures.',
    previewImg: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=640'
  }
];

export const VideoIntelligencePanel: React.FC<VideoIntelligencePanelProps> = ({ onSosCreated, onTriggerSiren }) => {
  // Navigation inside Video Intelligence
  const [activeSubTab, setActiveSubTab] = useState<'ANALYZER' | 'ROUTE_CLEARANCE' | 'RESULTS' | 'HISTORY'>('ANALYZER');

  // Video Upload & Form States
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoResolution, setVideoResolution] = useState<string>('1920x1080');
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(0);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const [sampledFrames, setSampledFrames] = useState<VideoFrameSample[]>([]);

  // Metadata Fields
  const [locationName, setLocationName] = useState<string>('Rasulgarh Junction Flyover NH-16');
  const [selectedCameraCode, setSelectedCameraCode] = useState<string>('CCTV-OD-101');
  const [recordingDateTime, setRecordingDateTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [videoDescription, setVideoDescription] = useState<string>('');
  const [autoSos, setAutoSos] = useState<boolean>(true);
  const [selectedDetectionModel, setSelectedDetectionModel] = useState<string>('AUTO');

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Video Player Preview Controls
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);

  // Progress Indicators
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<string>('');

  // Results & Records
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisSummary | null>(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [selectedEventCard, setSelectedEventCard] = useState<DetectedEventCard | null>(null);

  // Route Clearance
  const [activeClearanceRequest, setActiveClearanceRequest] = useState<RouteClearanceRequestData | null>(null);
  const [requestingRoute, setRequestingRoute] = useState<boolean>(false);

  // History Log
  const [historyList, setHistoryList] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing videos and route clearance requests on mount
  useEffect(() => {
    fetch('/api/emergency/videos')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setHistoryList(data);
          // Set initial analysis if available
          if (data[0].events?.length > 0) {
            setAnalysisResult(data[0]);
            setSelectedEventCard(data[0].events[0]);
          }
        }
      })
      .catch(() => {});

    fetch('/api/emergency/route-clearance-requests')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setActiveClearanceRequest(data[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Reset Video Upload
  // Reset Video Upload
  const handleResetVideo = () => {
    if (videoUrl) {
      try { URL.revokeObjectURL(videoUrl); } catch {}
    }
    setFile(null);
    setVideoUrl(null);
    setVideoDuration(0);
    setFileSizeBytes(0);
    setCapturedFrame(null);
    setSampledFrames([]);
    setValidationError(null);
    setAnalysisResult(null);
    setSelectedEventCard(null);
    setIsPlaying(false);
  };

  // Validate File (Extension, Mime, Size) - Wide format tolerance for laptop uploads
  const validateVideoFile = (f: File): string | null => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    const validExts = ['mp4', 'webm', 'mov', 'm4v', 'mkv', 'avi', 'wmv', 'flv', '3gp', 'ts', 'ogv', 'ogg'];
    const isVideoMime = f.type ? f.type.startsWith('video/') : false;
    
    // Accept if MIME says video OR extension is known video format
    if (!isVideoMime && (!ext || !validExts.includes(ext))) {
      return `Unsupported format (.${ext || 'unknown'}). Please select a video file (MP4, WebM, MOV, MKV, AVI, WMV, etc.).`;
    }
    const maxBytes = 250 * 1024 * 1024; // 250MB limit
    if (f.size > maxBytes) {
      return `File size exceeds 250MB limit (${(f.size / (1024 * 1024)).toFixed(1)}MB). Please compress video or select a shorter clip.`;
    }
    return null;
  };

  // Handle User File Selection from Laptop / PC
  const handleFileChange = async (selectedFile: File) => {
    setValidationError(null);
    const errorMsg = validateVideoFile(selectedFile);
    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }

    if (videoUrl) {
      try { URL.revokeObjectURL(videoUrl); } catch {}
    }

    setFile(selectedFile);
    setFileSizeBytes(selectedFile.size);
    const url = URL.createObjectURL(selectedFile);
    setVideoUrl(url);
    setIsPlaying(false);
    setCurrentTimeSec(0);
    setAnalysisResult(null);
    setSelectedEventCard(null);
    setSelectedCameraCode('MANUAL-UPLOAD-INTEL');

    // Default metadata fallback immediately
    setVideoDuration(30);
    setVideoResolution('1920x1080 (HD)');

    // Decode metadata safely without EVER wiping the file on probe error
    try {
      const probeVideo = document.createElement('video');
      probeVideo.preload = 'metadata';
      probeVideo.muted = true;
      probeVideo.playsInline = true;
      probeVideo.src = url;

      probeVideo.onloadedmetadata = () => {
        if (probeVideo.duration && !isNaN(probeVideo.duration) && isFinite(probeVideo.duration) && probeVideo.duration > 0) {
          setVideoDuration(Math.round(probeVideo.duration));
        }
        if (probeVideo.videoWidth && probeVideo.videoHeight) {
          setVideoResolution(`${probeVideo.videoWidth}x${probeVideo.videoHeight}`);
        }
      };

      probeVideo.onerror = () => {
        // Soft fallback: Do NOT reset or reject the file!
        // HTML5 in some browsers cannot decode certain codecs (e.g. MKV/HEVC) locally, but the file is 100% valid for backend AI analysis.
        console.warn('Local browser metadata probe skipped; proceeding with file for AI analysis.');
      };
    } catch {
      // Ignore probe exceptions
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Video Frame Extraction using HTML5 Canvas with strict timeout guard
  const extractFramesFromVideo = (videoEl: HTMLVideoElement, duration: number): Promise<VideoFrameSample[]> => {
    return new Promise((resolve) => {
      const frames: VideoFrameSample[] = [];
      const safeDuration = duration > 0 ? duration : 30;
      const intervalSec = Math.max(2, Math.floor(safeDuration / 6)); // 4 to 8 sampled frames
      const timestamps: number[] = [];
      for (let t = 1; t < safeDuration; t += intervalSec) {
        timestamps.push(t);
      }
      if (timestamps.length === 0) timestamps.push(1);

      let index = 0;
      let isDone = false;
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(640, videoEl.videoWidth || 640);
      canvas.height = Math.min(360, videoEl.videoHeight || 360);
      const ctx = canvas.getContext('2d');

      const finish = () => {
        if (isDone) return;
        isDone = true;
        try { videoEl.removeEventListener('seeked', onSeeked); } catch {}
        if (frames.length === 0 && ctx) {
          try {
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            const base64 = canvas.toDataURL('image/jpeg', 0.82);
            frames.push({
              timestampSeconds: 1,
              timestampFormatted: '00:01',
              frameBase64: base64
            });
          } catch {}
        }
        resolve(frames);
      };

      // 3-second absolute timeout to ensure extraction never blocks analysis
      const timeoutId = setTimeout(finish, 3000);

      const onSeeked = () => {
        if (isDone) return;
        if (ctx) {
          try {
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            const base64 = canvas.toDataURL('image/jpeg', 0.82);
            const tSec = timestamps[index];
            frames.push({
              timestampSeconds: tSec,
              timestampFormatted: formatTime(tSec),
              frameBase64: base64
            });
          } catch {}
        }
        index++;
        if (index < timestamps.length) {
          try {
            videoEl.currentTime = timestamps[index];
          } catch {
            clearTimeout(timeoutId);
            finish();
          }
        } else {
          clearTimeout(timeoutId);
          finish();
        }
      };

      videoEl.addEventListener('seeked', onSeeked);
      try {
        videoEl.currentTime = timestamps[0];
      } catch {
        clearTimeout(timeoutId);
        finish();
      }
    });
  };

  // Run AI Video Analysis Pipeline
  const handleExecuteAnalysis = async (forcedCategory?: string) => {
    setIsProcessing(true);
    setValidationError(null);
    setUploadProgress(0);
    setAnalysisProgress(0);

    try {
      // Step 1: Video Registration & Asynchronous Upload
      setProcessingStage('Validating & registering video upload with EOC backend...');
      setUploadProgress(40);

      const fName = file?.name || `${locationName.replace(/\s+/g, '_')}_footage.mp4`;
      const registerRes = await fetch('/api/emergency/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: fName,
          fileSizeBytes: fileSizeBytes || 14850000,
          mimeType: file?.type || 'video/mp4',
          durationSeconds: videoDuration || 30,
          resolution: videoResolution,
          locationName,
          cameraCode: selectedCameraCode,
          recordedAt: recordingDateTime,
          description: videoDescription,
          uploadedBy: 'emergency.operator@civicnexus.gov.in'
        })
      });

      if (!registerRes.ok) {
        const err = await registerRes.json().catch(() => ({ detail: 'Registration failed' }));
        throw new Error(err.detail || 'Failed to register video file.');
      }

      const regData = await registerRes.json();
      const videoId = regData.videoAnalysisId;
      setUploadProgress(100);

      // Step 2: Extract Frames at Configurable Sampling Rate
      setProcessingStage('Decoding video stream & extracting frames at 2.5s intervals...');
      setAnalysisProgress(30);

      let extractedFrames: VideoFrameSample[] = [];
      if (videoRef.current && videoDuration > 0) {
        try {
          extractedFrames = await extractFramesFromVideo(videoRef.current, videoDuration);
          setSampledFrames(extractedFrames);
          if (extractedFrames[0]) setCapturedFrame(extractedFrames[0].frameBase64);
        } catch {
          // If browser extraction fails, proceed with default sample frame
        }
      }

      // Step 3: Run AI Computer Vision Analysis
      const modelToUse = forcedCategory || selectedDetectionModel;
      setProcessingStage(`Executing NexusVision AI inference pipeline [${modelToUse === 'AUTO' ? 'Multi-Hazard Smart Vision' : modelToUse}]...`);
      setAnalysisProgress(65);

      const analyzeRes = await fetch(`/api/emergency/videos/${videoId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frames: extractedFrames,
          autoSos,
          forcedCategory: modelToUse === 'AUTO' ? undefined : modelToUse,
          detectionPipeline: modelToUse,
          operatorEmail: 'emergency.operator@civicnexus.gov.in'
        })
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json().catch(() => ({ detail: 'Inference failed' }));
        throw new Error(err.detail || 'Inference engine encountered an error.');
      }

      const analyzeData = await analyzeRes.json();
      setAnalysisProgress(100);
      setProcessingStage('Analysis complete. Evidence cataloged.');

      const resultObj: VideoAnalysisSummary = analyzeData.videoAnalysis;
      setAnalysisResult(resultObj);
      if (resultObj.events && resultObj.events.length > 0) {
        setSelectedEventCard(resultObj.events[0]);
      }

      // If Emergency Alert was Auto-Created
      if (analyzeData.alert) {
        onSosCreated?.(analyzeData.alert, analyzeData.incident);
        if (analyzeData.alert.severity === 'CRITICAL' || analyzeData.alert.severity === 'HIGH') {
          onTriggerSiren?.();
        }
      }

      // Refresh history list
      setHistoryList(prev => [resultObj, ...prev.filter(p => p.videoAnalysisId !== resultObj.videoAnalysisId)]);
      setActiveSubTab('RESULTS');

    } catch (err: any) {
      setValidationError(err.message || 'Video analysis encountered an unhandled error.');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
      setAnalysisProgress(0);
    }
  };

  // Jump Video to Exact Second of Detected Event Card
  const handleSeekToTimestamp = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Request Green Corridor Route Clearance for Detected Emergency Vehicle (Section 13)
  const handleRequestRouteClearance = async (incId?: number, analysisId?: string, vehicleType: string = 'AMBULANCE') => {
    setRequestingRoute(true);
    try {
      const res = await fetch(`/api/emergency/incidents/${incId || 1}/request-route-clearance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleType,
          originLocation: locationName,
          destinationHospital: 'AIIMS Bhubaneswar Super Specialty Trauma Center',
          videoAnalysisId: analysisId,
          requestedBy: 'emergency.operator@civicnexus.gov.in'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveClearanceRequest(data.clearanceRequest);
        setActiveSubTab('ROUTE_CLEARANCE');
      }
    } catch {
      // Handle network error
    } finally {
      setRequestingRoute(false);
    }
  };

  // Select Quick Preset
  const handleSelectPreset = (preset: typeof TEST_PRESETS[0]) => {
    setLocationName(preset.location);
    setSelectedCameraCode(preset.camera);
    setVideoDescription(preset.description);
    setCapturedFrame(preset.previewImg);
    setSelectedDetectionModel(preset.category);
    setVideoResolution('1920x1080');
    setVideoDuration(32);
    setFileSizeBytes(12500000);
    handleExecuteAnalysis(preset.category);
  };

  return (
    <div className="space-y-6">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-red-600 via-rose-700 to-amber-700 shadow-lg border border-red-500/40 text-white">
            <Video className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-serif font-extrabold text-xl text-white tracking-tight">
                AI VIDEO EMERGENCY ANALYZER
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                TEAM CODE BLAZE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-category video decoding, object tracking across frames, evidence cataloging, and intelligent traffic clearance.
            </p>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('ANALYZER')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-2 ${activeSubTab === 'ANALYZER' ? 'bg-red-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>1. Video Upload &amp; Scan</span>
          </button>
          <button
            onClick={() => setActiveSubTab('RESULTS')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-2 ${activeSubTab === 'RESULTS' ? 'bg-red-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>2. Detection Results {analysisResult?.events?.length ? `(${analysisResult.events.length})` : ''}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('ROUTE_CLEARANCE')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-2 ${activeSubTab === 'ROUTE_CLEARANCE' ? 'bg-emerald-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-300" />
            <span>3. Route Assistance</span>
          </button>
          <button
            onClick={() => setActiveSubTab('HISTORY')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-2 ${activeSubTab === 'HISTORY' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>4. Audit History ({historyList.length})</span>
          </button>
        </div>
      </div>

      {/* ── USER-FRIENDLY 3-STEP PROCESS STEPPER ────────────────────────────── */}
      <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-300 font-bold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>How It Works:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full md:w-auto text-[11px] font-mono">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 ${file || videoUrl ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold' : 'bg-amber-950/40 border-amber-500/50 text-amber-300'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px]">1</span>
            <span>1. Choose Video File (or Preset)</span>
          </div>
          <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 ${isProcessing ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 animate-pulse font-bold' : analysisResult ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px]">2</span>
            <span>2. AI Emergency Detection Scan</span>
          </div>
          <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 ${analysisResult?.detectedEmergency ? 'bg-red-950/60 border-red-500/50 text-red-300 font-bold' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px]">3</span>
            <span>3. Auto SOS Alert &amp; Green Corridor</span>
          </div>
        </div>
      </div>

      {/* ── VALIDATION ERROR BANNER ─────────────────────────────────────────── */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/70 text-rose-200 text-xs flex items-center justify-between gap-3 animate-shake">
          <div className="flex items-center space-x-3">
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
            <span><strong>Upload Validation Error:</strong> {validationError}</span>
          </div>
          <button onClick={() => setValidationError(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── SUB-TAB 1: MANUAL VIDEO UPLOADER & INFERENCE ─────────────────────── */}
      {activeSubTab === 'ANALYZER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column (7 Cols): Video Dropzone & Interactive Player */}
          <div className="lg:col-span-7 space-y-5">

            {/* Video Dropzone */}
            {/* Video Dropzone */}
            {!file && !videoUrl ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-10 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-4 ${
                  isDragging
                    ? 'border-amber-400 bg-amber-950/30 shadow-2xl scale-[1.01]'
                    : 'border-slate-700 bg-slate-950/70 hover:border-amber-500/60 hover:bg-slate-900/60'
                }`}
              >
                <input
                  id="laptop-video-input"
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (selected) {
                      handleFileChange(selected);
                    }
                    e.target.value = '';
                  }}
                />
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
                  <Upload className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">
                    Select or Drop Video File from Laptop / Computer
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Select any video file (.mp4, .webm, .mov, .mkv, .avi) stored on your laptop hard drive / SSD.
                  </p>
                </div>
                <label
                  htmlFor="laptop-video-input"
                  onClick={(e) => e.stopPropagation()}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>📁 Choose Video File from Laptop</span>
                </label>
                <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-500">
                  <span>MP4 / MOV / WebM / MKV / AVI</span>
                  <span>•</span>
                  <span>Any Resolution (1080p/720p/4K)</span>
                  <span>•</span>
                  <span>Max 250 MB</span>
                </div>
              </div>
            ) : (
              /* Video Preview Player with Native Controls */
              <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
                <input
                  id="laptop-video-input"
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (selected) {
                      handleFileChange(selected);
                    }
                    e.target.value = '';
                  }}
                />
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <FileVideo className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono font-bold truncate max-w-xs">{file?.name || 'Selected Video Stream'}</span>
                    <span className="text-[10px] text-slate-500">({(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition flex items-center space-x-1 ${showBoundingBoxes ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'}`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>{showBoundingBoxes ? 'Bounding Boxes: ON' : 'Bounding Boxes: OFF'}</span>
                    </button>
                    <label
                      htmlFor="laptop-video-input"
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-mono transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Other Video</span>
                    </label>
                    <button
                      onClick={handleResetVideo}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-400 text-[10px] font-mono transition flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* HTML5 Video Element with Overlay HUD */}
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
                  {videoUrl ? (
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      controls
                      onTimeUpdate={() => videoRef.current && setCurrentTimeSec(videoRef.current.currentTime)}
                      className="w-full h-full object-contain"
                    />
                  ) : capturedFrame ? (
                    <img src={capturedFrame} alt="Frame snapshot" className="w-full h-full object-cover filter brightness-90" />
                  ) : null}

                  {/* Bounding Box HUD Overlays */}
                  {showBoundingBoxes && selectedEventCard?.boundingBoxes?.map((b, i) => (
                    <div
                      key={i}
                      className="absolute border-2 rounded pointer-events-none transition-all"
                      style={{
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        width: `${b.width}%`,
                        height: `${b.height}%`,
                        borderColor: b.color,
                        boxShadow: `0 0 12px ${b.color}80`
                      }}
                    >
                      <div className="absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-white whitespace-nowrap shadow" style={{ backgroundColor: b.color }}>
                        {b.label} · {(b.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}

                  {/* Camera Timestamp Pill */}
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-[10px] font-mono text-amber-300 pointer-events-none">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block mr-1.5 animate-pulse" />
                    <span>{selectedCameraCode} · {formatTime(currentTimeSec)} / {formatTime(videoDuration)}</span>
                  </div>
                </div>

                {/* Video Metadata Metrics Bar */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Duration</span>
                    <span className="font-bold text-slate-200">{formatTime(videoDuration)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Resolution</span>
                    <span className="font-bold text-slate-200">{videoResolution}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Size</span>
                    <span className="font-bold text-slate-200">{(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Format</span>
                    <span className="font-bold text-emerald-400">{file?.name?.split('.').pop()?.toUpperCase() || 'MP4'}</span>
                  </div>
                </div>

                {/* Direct Action Bar under Player */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/90 via-slate-900 to-red-950/90 border border-red-500/50 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
                  <div className="flex items-center space-x-3 text-left w-full md:w-auto">
                    <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 shrink-0">
                      <Zap className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <span className="font-serif font-bold text-xs text-white block">
                        Video Selected from Laptop — Ready to Process
                      </span>
                      <span className="text-[11px] text-slate-300">
                        Select target emergency model or let Auto-Detect identify hazards automatically.
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto shrink-0">
                    <select
                      value={selectedDetectionModel}
                      onChange={(e) => setSelectedDetectionModel(e.target.value)}
                      className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-slate-900 border border-amber-500/50 text-xs text-amber-300 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                    >
                      <option value="AUTO">🌟 Auto-Detect (Multi-Hazard)</option>
                      <option value="AMBULANCE_IN_TRANSIT">🚑 108 Ambulance (Green Route)</option>
                      <option value="FIRE_ENGINE_IN_TRANSIT">🚒 Odisha Fire Engine (101)</option>
                      <option value="POSSIBLE_FIRE_OR_SMOKE">🔥 Fire &amp; Expanding Smoke</option>
                      <option value="POSSIBLE_ROAD_ACCIDENT">💥 Road Accident &amp; Collision</option>
                      <option value="CROWD_SAFETY_EMERGENCY">👥 Crowd Density Bottleneck</option>
                      <option value="PHYSICAL_ALTERCATION">⚠️ Physical Altercation</option>
                      <option value="OTHER_EMERGENCY_VEHICLE">🚔 Police PCR Interceptor</option>
                      <option value="NONE">🟢 Normal Scene (Negative Control)</option>
                    </select>

                    <button
                      onClick={() => handleExecuteAnalysis()}
                      disabled={isProcessing}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-950/60 flex items-center justify-center space-x-2 transition active:scale-95 disabled:opacity-50 shrink-0"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Analyzing Video…</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-amber-300" />
                          <span>⚡ Run AI Analysis Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Test Scenario Presets Strip */}
            <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-serif font-bold text-slate-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>⚡ 1-Click Test Scenarios:</span>
                </span>
                <span className="text-[10px] text-amber-300 font-mono font-bold">Instant Positive/Negative Test</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {TEST_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(preset)}
                    className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/50 text-left transition space-y-1 group"
                  >
                    <span className="font-bold text-[11px] text-slate-200 block truncate group-hover:text-amber-300">
                      {preset.name}
                    </span>
                    <span className="text-[9px] text-slate-500 block truncate">
                      {preset.location.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (5 Cols): Metadata Form & Pipeline Execution */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-5 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <h3 className="font-serif font-bold text-sm text-slate-200">
                    Incident Context &amp; Verification Parameters
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                  REAL-TIME PIPELINE
                </span>
              </div>

              {/* Form Input: Detection Model Focus */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI Detection Target Model</span>
                  </label>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    ONLINE
                  </span>
                </div>
                <select
                  value={selectedDetectionModel}
                  onChange={(e) => setSelectedDetectionModel(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-semibold focus:outline-none focus:border-amber-400 transition"
                >
                  <option value="AUTO">🌟 Auto-Detect Multi-Hazard Emergency (NexusVision AI)</option>
                  <option value="AMBULANCE_IN_TRANSIT">🚑 108 Ambulance in Transit (Route Clearance)</option>
                  <option value="FIRE_ENGINE_IN_TRANSIT">🚒 Odisha Fire Engine (101 Heavy Tender)</option>
                  <option value="POSSIBLE_FIRE_OR_SMOKE">🔥 Visible Fire, Expanding Smoke &amp; Thermal Plume</option>
                  <option value="POSSIBLE_ROAD_ACCIDENT">💥 Possible Road Accident &amp; Collision</option>
                  <option value="CROWD_SAFETY_EMERGENCY">👥 Unusual Crowd Density &amp; Safety Hazard</option>
                  <option value="PHYSICAL_ALTERCATION">⚠️ Possible Physical Altercation &amp; Violence</option>
                  <option value="OTHER_EMERGENCY_VEHICLE">🚔 Police PCR / SWAT Tactical Vehicle</option>
                  <option value="NONE">🟢 Normal Scene (Negative Control Benchmark)</option>
                </select>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {selectedDetectionModel === 'AUTO' 
                    ? 'Scans frames across all 8 emergency classes and classifies primary hazard automatically.' 
                    : `Directs AI engine to prioritize ${selectedDetectionModel.replace(/_/g, ' ')} verification.`}
                </p>
              </div>

              {/* Form Input: Location */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Incident Location</span>
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Rasulgarh Junction Flyover NH-16"
                  className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              {/* Form Input: Camera Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Known Camera Location (If Applicable)</span>
                </label>
                <select
                  value={selectedCameraCode}
                  onChange={(e) => setSelectedCameraCode(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                >
                  {REGISTERED_CAMERAS.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Input: Recording Date Time */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Recording Date &amp; Time</span>
                </label>
                <input
                  type="datetime-local"
                  value={recordingDateTime}
                  onChange={(e) => setRecordingDateTime(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-400 transition"
                />
              </div>

              {/* Form Input: Optional Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-purple-400" />
                  <span>Operator Notes &amp; Context</span>
                </label>
                <textarea
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  rows={2}
                  placeholder="Optional operator notes (e.g. 108 ambulance spotted heading towards AIIMS)"
                  className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-400 transition resize-none"
                />
              </div>

              {/* Auto-SOS Toggle Switch */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-200 block">Automatic SOS Dispatch</span>
                  <span className="text-[10px] text-slate-400">Broadcast alert + notify Command Center immediately upon qualifying emergency</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSos(!autoSos)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${autoSos ? 'bg-red-600' : 'bg-slate-700'}`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${autoSos ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Progress Indicators (Dual Bars: Upload + Inference) */}
              {isProcessing && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 animate-fade-in">
                  <div className="flex items-center space-x-2 text-xs text-amber-300">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span className="font-mono font-bold truncate">{processingStage}</span>
                  </div>

                  {/* Upload Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>1. Video Ingestion &amp; Chunking</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>

                  {/* Frame Extraction & AI Analysis Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>2. Temporal Computer Vision Inference</span>
                      <span>{analysisProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${analysisProgress}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Analysis Action Button */}
              <button
                onClick={() => handleExecuteAnalysis()}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-700 to-red-600 hover:from-red-500 hover:to-rose-600 text-white font-bold text-sm shadow-xl shadow-red-950/50 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Temporal Frame Stream…</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-amber-300" />
                    <span>Run AI Emergency Analysis {selectedDetectionModel === 'AUTO' ? '(Auto-Detect All)' : `(${selectedDetectionModel.replace(/_/g, ' ')})`}</span>
                  </>
                )}
              </button>

            </div>
          </div>

        </div>
      )}

      {/* ── SUB-TAB 2: DETECTION RESULTS REPORT (Section 9) ─────────────────── */}
      {activeSubTab === 'RESULTS' && (
        <div className="space-y-6">

          {analysisResult ? (
            <>
              {/* SECTION A: VIDEO SUMMARY */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-slate-800 text-cyan-400">
                      <FileVideo className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-white">
                        SECTION A: VIDEO METRIC &amp; INFERENCE SUMMARY
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        Pipeline ID: {analysisResult.videoAnalysisId} · Version: {analysisResult.pipelineVersion}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${analysisResult.detectedEmergency ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                    {analysisResult.detectedEmergency ? '🚨 EMERGENCY DETECTED' : '✅ NO EMERGENCY DETECTED'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Filename</span>
                    <span className="font-bold text-slate-200 truncate block">{analysisResult.fileName}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Duration</span>
                    <span className="font-bold text-slate-200">{analysisResult.durationSeconds}s</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Resolution</span>
                    <span className="font-bold text-slate-200">{analysisResult.resolution}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Frames Analyzed</span>
                    <span className="font-bold text-amber-300">{analysisResult.framesAnalyzed} frames</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Location</span>
                    <span className="font-bold text-slate-200 truncate block">{analysisResult.locationName}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Route Status</span>
                    <span className={`font-bold ${analysisResult.routeVerificationStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {analysisResult.routeVerificationStatus || 'UNVERIFIED'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                  <strong>AI Executive Summary:</strong> {analysisResult.summaryNarrative}
                </div>
              </div>

              {/* SECTION B: DETECTED EVENTS CARDS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-white flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span>SECTION B: CANDIDATE EMERGENCY EVENTS ({analysisResult.events?.length || 0})</span>
                  </h3>
                  <span className="text-xs text-slate-400">Click any card to inspect evidence frame &amp; tracking data</span>
                </div>

                {analysisResult.events?.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                    <h4 className="font-serif font-bold text-lg text-white">
                      NO SUPPORTED EMERGENCY EVENT WAS DETECTED IN THE ANALYZED VIDEO.
                    </h4>
                    <p className="text-xs text-slate-400 max-w-lg mx-auto">
                      <strong>Analysis Limitations:</strong> The video frames were analyzed across temporal intervals for emergency vehicles, fire/smoke plumes, collision stoppages, physical altercations, and crowd surges. No threshold violations were detected.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {analysisResult.events.map((evt) => {
                      const cfg = DETECTION_CONFIGS[evt.eventType] || DETECTION_CONFIGS['POSSIBLE_ROAD_ACCIDENT'];
                      return (
                        <div
                          key={evt.eventId}
                          className="p-5 rounded-3xl bg-slate-950 border border-slate-800 hover:border-amber-400/60 transition shadow-xl space-y-4 text-white"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{cfg.icon}</span>
                              <span className="font-serif font-bold text-sm text-white">{cfg.label}</span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                              ⏱️ Timestamp: {evt.videoTimestamp}
                            </span>
                          </div>

                          {/* Evidence Thumbnail with Click-to-Play */}
                          <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-slate-800 group">
                            <img
                              src={evt.evidenceThumbnail || capturedFrame || 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=640'}
                              alt="Evidence thumbnail"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.onerror = null;
                                target.src = 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=640';
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <button
                                onClick={() => handleSeekToTimestamp(evt.videoTimestampSeconds)}
                                className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-lg flex items-center space-x-1.5"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Play Video at {evt.videoTimestamp}</span>
                              </button>
                            </div>
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono text-amber-300">
                              EVIDENCE FRAME · {evt.videoTimestamp}
                            </span>
                          </div>

                          {/* Evidence Findings Narrative */}
                          <div className="space-y-1.5 text-xs">
                            <p className="text-slate-300 leading-relaxed">
                              <strong>Observed Evidence:</strong> {evt.description}
                            </p>
                            {evt.trackingStatus && (
                              <p className="text-[11px] font-mono text-cyan-300">
                                🎯 <strong>Tracking:</strong> {evt.trackingStatus}
                              </p>
                            )}
                            <p className="text-[11px] font-mono text-amber-300">
                              ⚡ <strong>Recommended Action:</strong> {evt.recommendedAction}
                            </p>
                          </div>

                          {/* Metadata Badges & Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                            <div className="space-x-2">
                              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                                Confidence: {(evt.confidenceScore * 100).toFixed(0)}%
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {evt.verificationStatus}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              {evt.eventType.includes('AMBULANCE') || evt.eventType.includes('FIRE_ENGINE') ? (
                                <button
                                  onClick={() => handleRequestRouteClearance(evt.incidentId, analysisResult.videoAnalysisId, evt.eventType.includes('FIRE') ? 'FIRE_ENGINE' : 'AMBULANCE')}
                                  disabled={requestingRoute}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow transition flex items-center space-x-1"
                                >
                                  <Navigation className="w-3 h-3" />
                                  <span>Request Route Clearance</span>
                                </button>
                              ) : null}

                              <button
                                onClick={() => handleSeekToTimestamp(evt.videoTimestampSeconds)}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition"
                              >
                                View Video
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-slate-950 border border-slate-800 text-slate-400 space-y-3">
              <Clock className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="font-serif font-bold text-base text-slate-200">No Video Analysis Performed Yet</h4>
              <p className="text-xs">Upload a video in the Video Analyzer tab or select a scenario preset to run actual inference.</p>
              <button
                onClick={() => setActiveSubTab('ANALYZER')}
                className="px-4 py-2 rounded-xl bg-red-700 text-white font-bold text-xs"
              >
                Go to Video Analyzer
              </button>
            </div>
          )}

        </div>
      )}

      {/* ── SUB-TAB 3: EMERGENCY VEHICLE & ROUTE ASSISTANCE (Section 13) ─────── */}
      {activeSubTab === 'ROUTE_CLEARANCE' && (
        <div className="space-y-6">

          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Navigation className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">
                    EMERGENCY VEHICLE &amp; ROUTE ASSISTANCE
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Green Corridor Clearance · Preempted Traffic Signals · 108 Lifeline Trauma Route
                  </p>
                </div>
              </div>

              {activeClearanceRequest && (
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                  activeClearanceRequest.requestStatus === 'ACTIVE'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 animate-pulse'
                    : 'bg-amber-950 text-amber-300 border border-amber-700'
                }`}>
                  STATUS: {activeClearanceRequest.requestStatus}
                </span>
              )}
            </div>

            {/* Verification Distinction Notice (Section 13.A vs 13.B) */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-amber-300 font-bold">
                <Info className="w-4 h-4 shrink-0" />
                <span>Verification Architecture Distinction (Section 13 Specification):</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="font-bold text-cyan-300 block mb-0.5">A. Video-Observed Vehicle Movement:</span>
                  Identifies vehicle position in video frame, timestamps ($00:00:14 \to 00:00:24$), and apparent camera transit vector.
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="font-bold text-emerald-300 block mb-0.5">B. Verified Real-World Route:</span>
                  Requires mapped CCTV cameras or authorized vehicle GPS telemetry to verify the actual road network segment.
                </div>
              </div>
            </div>

            {activeClearanceRequest ? (
              <div className="space-y-5">

                {/* Corridor Overview Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Request ID</span>
                    <span className="font-bold text-amber-300">{activeClearanceRequest.requestId}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Vehicle Assigned</span>
                    <span className="font-bold text-emerald-400">{activeClearanceRequest.vehicleCallSign} ({activeClearanceRequest.vehicleType})</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Destination Hospital</span>
                    <span className="font-bold text-slate-200 truncate block">{activeClearanceRequest.destinationHospital}</span>
                  </div>
                </div>

                {/* Interactive Green Corridor Segments Pipeline */}
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-sm text-slate-200 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Live Green Corridor Segments &amp; Preempted Signal Sequence:</span>
                  </h4>

                  <div className="space-y-2">
                    {activeClearanceRequest.corridorSegments?.map((seg, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-mono font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-white block">{seg.segmentName}</span>
                            <span className="text-[10px] text-slate-400">{seg.roadName} · Est. Ingress: {seg.etaMinutes} mins</span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold ${
                          seg.status === 'PREEMPTED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {seg.status === 'PREEMPTED' ? '🟢 SIGNAL PREEMPTED' : 'CLEAR CORRIDOR'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action: Clear or Complete Corridor */}
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-emerald-300 block">Traffic Command Notification Active:</span>
                    <span className="text-[11px] text-slate-300">{activeClearanceRequest.trafficClearanceNotice}</span>
                  </div>
                  <button
                    onClick={() => handleRequestRouteClearance()}
                    disabled={requestingRoute}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition shrink-0"
                  >
                    Refresh Preemption Signal Sync
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-10 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <Navigation className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="font-serif font-bold text-sm text-slate-300">No Active Route Clearance Request</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  When an ambulance or fire vehicle is detected from video with mapped coordinates, route clearance can be dispatched to municipal traffic signals.
                </p>
                <button
                  onClick={() => handleRequestRouteClearance(1, undefined, 'AMBULANCE')}
                  disabled={requestingRoute}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
                >
                  Create Provisional 108 Green Corridor
                </button>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ── SUB-TAB 4: AUDIT HISTORY & RECENT ANALYSES ───────────────────────── */}
      {activeSubTab === 'HISTORY' && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-serif font-bold text-base text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Video Analysis Audit Trail &amp; Catalog</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{historyList.length} total entries</span>
          </div>

          <div className="space-y-2.5">
            {historyList.map((entry, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-cyan-400">{entry.videoAnalysisId}</span>
                    <span className="text-slate-300 font-semibold">{entry.fileName}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    📍 {entry.locationName} · {entry.durationSeconds}s duration · Analyzed at {new Date(entry.processingStartedAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    entry.detectedEmergency ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {entry.detectedEmergency ? 'EMERGENCY DETECTED' : 'NO EMERGENCY'}
                  </span>
                  <button
                    onClick={() => {
                      setAnalysisResult(entry);
                      if (entry.events && entry.events[0]) setSelectedEventCard(entry.events[0]);
                      setActiveSubTab('RESULTS');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition"
                  >
                    View Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
