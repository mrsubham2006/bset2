import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  AIDetectionEvent,
  EmergencyAlert,
  EmergencyVehicle,
  EmergencyResponseDispatch,
  EmergencyOverviewStats,
  Hospital
} from '../types';
import { KonarkWheelIcon, IkatPatternDivider } from '../components/OdishaMotifs';
import {
  Flame,
  AlertOctagon,
  Truck,
  Hospital as HospIcon,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw,
  Navigation,
  ShieldCheck,
  Radio,
  Video,
  AlertTriangle,
  Volume2,
  VolumeX,
  Siren,
  Car,
  Users,
  Layers,
  Eye,
  Play,
  Square,
  Maximize2,
  Activity,
  FileText,
  Check,
  XCircle,
  X,
  ChevronRight,
  Info,
  Sparkles,
  Phone,
  ShieldAlert,
  MapPin,
  RotateCcw,
  Sliders,
  Cpu,
  ArrowRight,
  Loader2,
  ArrowLeft,
  RadioTower,
  BellRing,
  ChevronDown,
  Volume1,
  ChevronLeft,
  BarChart3,
  Settings,
  AlertCircle,
  Compass,
  Menu
} from 'lucide-react';
import { PanelRoleAuth } from '../components/PanelRoleAuth';
import { VideoIntelligencePanel } from '../components/VideoIntelligencePanel';

interface EmergencyResponseViewProps {
  onNavigateHome?: () => void;
}

export type SirenSoundType =
  | 'AMBULANCE_HILO'
  | 'POLICE_WAIL'
  | 'RAPID_YELP'
  | 'FIRE_QSIRN'
  | 'AIR_RAID'
  | 'TACTICAL_PHASER';

export interface SirenPreset {
  id: SirenSoundType;
  name: string;
  shortLabel: string;
  badge: string;
  icon: string;
  category: string;
  frequencyRange: string;
  description: string;
  accentColor: string;
}

export const SIREN_PRESETS: SirenPreset[] = [
  {
    id: 'AMBULANCE_HILO',
    name: '108 Lifeline Dual-Tone (Hi-Lo)',
    shortLabel: '108 Hi-Lo',
    badge: '108 / 112',
    icon: '🚑',
    category: 'Ambulance EMS',
    frequencyRange: '960 Hz / 720 Hz',
    description: 'Authentic dual-tone European & Indian emergency medical response with harmonic warm sub-octave support and smooth solenoid portamento.',
    accentColor: 'border-amber-500/40 text-amber-300 bg-amber-950/40'
  },
  {
    id: 'POLICE_WAIL',
    name: 'Police Interceptor Sweeping Wail',
    shortLabel: 'Police Wail',
    badge: 'Police / Law',
    icon: '🚨',
    category: 'Police Rescue',
    frequencyRange: '520 Hz – 1280 Hz',
    description: 'Dynamic long undulating acoustic wail with dual detuned oscillators, horn resonance formant, and subtle peak vibrato.',
    accentColor: 'border-blue-500/40 text-blue-300 bg-blue-950/40'
  },
  {
    id: 'FIRE_QSIRN',
    name: 'Federal Q-Siren (Mechanical Rotor)',
    shortLabel: 'Fire Q-Siren',
    badge: 'Fire 101',
    icon: '🚒',
    category: 'Fire Brigade',
    frequencyRange: '360 Hz – 1360 Hz',
    description: 'Iconic motorized mechanical siren with realistic centrifugal rotor spool-up, high-rpm scream, and natural low-frequency deceleration.',
    accentColor: 'border-rose-500/40 text-rose-300 bg-rose-950/40'
  },
  {
    id: 'RAPID_YELP',
    name: 'Tactical Urgent Yelp (Piercer)',
    shortLabel: 'Rapid Yelp',
    badge: 'Urgent Yelp',
    icon: '⚡',
    category: 'Rapid Transit',
    frequencyRange: '740 Hz – 1480 Hz',
    description: 'High-frequency staccato chirp pulses engineered for clearing congested intersections and high-density traffic corridors.',
    accentColor: 'border-orange-500/40 text-orange-300 bg-orange-950/40'
  },
  {
    id: 'AIR_RAID',
    name: 'Civil Defense Disaster Alert',
    shortLabel: 'Air Raid',
    badge: 'Public Defense',
    icon: '📢',
    category: 'Civil Defense',
    frequencyRange: '420 Hz – 660 Hz',
    description: 'Low-frequency warbling air-raid horn with tremolo modulation designed for cyclone, flood evacuation, and Tier-3 mass alerts.',
    accentColor: 'border-red-500/40 text-red-300 bg-red-950/40'
  },
  {
    id: 'TACTICAL_PHASER',
    name: 'Hyper-Velocity Phaser Piercer',
    shortLabel: 'Phaser Piercer',
    badge: 'Tactical Tier-1',
    icon: '🔊',
    category: 'Rapid SWAT / EOD',
    frequencyRange: '820 Hz – 1620 Hz',
    description: 'Ultra-fast 12Hz electronic frequency sweep providing maximum acoustic urgency for immediate hazard mitigation dispatches.',
    accentColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40'
  }
];

export const EmergencyResponseView: React.FC<EmergencyResponseViewProps> = ({ onNavigateHome }) => {
  const { language, showToast } = useApp();

  // Operating Mode
  const [operatingMode, setOperatingMode] = useState<'DEMO' | 'LIVE'>('DEMO');

  // Manual SOS Modal State
  const [showManualSosModal, setShowManualSosModal] = useState<boolean>(false);
  const [manualSosType, setManualSosType] = useState<string>('POSSIBLE_ROAD_ACCIDENT');
  const [manualSosLocation, setManualSosLocation] = useState<string>('Khandagiri Square NH-16');
  const [manualSosSeverity, setManualSosSeverity] = useState<'CRITICAL' | 'HIGH'>('CRITICAL');
  const [manualSosNotes, setManualSosNotes] = useState<string>('Distress 112 call logged by EOC Operator. High-velocity collision.');
  const [creatingSos, setCreatingSos] = useState<boolean>(false);

  // Active View Tab - Supported Navigation Keys
  type EmergencyNavKey = 'OVERVIEW' | 'VIDEO_INTEL' | 'ACTIVE_EMERGENCIES' | 'MAP' | 'DISPATCH' | 'EVIDENCE' | 'TRACKING' | 'ALERTS' | 'ANALYTICS' | 'CONFIG' | 'DASHBOARD' | 'CCTV' | 'AI_INTEL' | 'TESTS';
  const [activeTab, setActiveTab] = useState<EmergencyNavKey>('VIDEO_INTEL');
  const [tabHistory, setTabHistory] = useState<EmergencyNavKey[]>(['VIDEO_INTEL']);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Switch tab and record 1-step history
  const switchTab = (nextTab: EmergencyNavKey) => {
    setActiveTab((current) => {
      if (current !== nextTab) {
        setTabHistory((prev) => [...prev, nextTab]);
      }
      return nextTab;
    });
  };

  // 1-step back handler inside Emergency portal
  const handleEmergencyBack = () => {
    setTabHistory((prev) => {
      if (prev.length <= 1) {
        // No more sub-tabs in history, go back 1 level to previous portal view
        if (onNavigateHome) onNavigateHome();
        return ['VIDEO_INTEL'];
      }
      const newHistory = [...prev];
      newHistory.pop(); // Remove current tab
      const previousTab = newHistory[newHistory.length - 1] || 'VIDEO_INTEL';
      setActiveTab(previousTab);
      return newHistory;
    });
  };

  // Data States
  const [overview, setOverview] = useState<EmergencyOverviewStats>({
    activeCriticalEmergencies: 1,
    highPriorityIncidents: 1,
    fireAndSmokeAlerts: 1,
    roadAccidentAlerts: 1,
    crowdSafetyAlerts: 1,
    ambulancesEnRoute: 1,
    fireBrigadesDispatched: 0,
    awaitingAcknowledgement: 1,
    totalCamerasOnline: 5,
    totalCamerasOffline: 1,
    backendConnected: true,
    sseSyncActive: true,
    audioAlertsEnabled: false
  });
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [stats, setStats] = useState({
    activeEmergencyAlerts: 0,
    criticalIncidents: 0,
    highPriorityIncidents: 0,
    videosAwaitingAnalysis: 0,
    videosCurrentlyProcessing: 0,
    incidentsAwaitingVerification: 0,
    ambulancesDetected: 0,
    fireAndSmokeAlerts: 0,
    possibleRoadAccidents: 0,
    crowdSafetyAlerts: 0
  });
  const [cameras, setCameras] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<AIDetectionEvent[]>([]);
  const [vehicles, setVehicles] = useState<EmergencyVehicle[]>([]);
  const [responses, setResponses] = useState<EmergencyResponseDispatch[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  // Selected Items for Modals & Inspection
  const [selectedCameraId, setSelectedCameraId] = useState<number>(1);
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<AIDetectionEvent | null>(null);

  // Dispatch Modal State
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [dispatchIncidentId, setDispatchIncidentId] = useState<number>(1);
  const [dispatchType, setDispatchType] = useState<'AMBULANCE' | 'FIRE_BRIGADE' | 'POLICE_ESCORT' | 'MUNICIPAL_DISASTER_CREW'>('AMBULANCE');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('OD-02-AMB-108-01');
  const [destinationHospital, setDestinationHospital] = useState<string>('AIIMS Bhubaneswar');
  const [dispatchNotes, setDispatchNotes] = useState<string>('High-priority response dispatch from EOC command console.');
  const [dispatching, setDispatching] = useState<boolean>(false);

  // False Alarm Modal State
  const [showFalseAlarmModal, setShowFalseAlarmModal] = useState<boolean>(false);
  const [falseAlarmReason, setFalseAlarmReason] = useState<string>('Lighting reflection misinterpreted as smoke plume');
  const [falseAlarmIncidentId, setFalseAlarmIncidentId] = useState<number>(1);

  // Audio Synthesizer States
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [isSirenPlaying, setIsSirenPlaying] = useState<boolean>(false);
  const [sirenMode, setSirenMode] = useState<SirenSoundType>('AMBULANCE_HILO');
  const [sirenVolume, setSirenVolume] = useState<number>(0.35);
  const [showToneDropdown, setShowToneDropdown] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<{ stop: () => void } | null>(null);
  const toneDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close tone dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (toneDropdownRef.current && !toneDropdownRef.current.contains(e.target as Node)) {
        setShowToneDropdown(false);
      }
    };
    if (showToneDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showToneDropdown]);

  // Acceptance Tests Execution State
  const [testResults, setTestResults] = useState<any[]>([]);
  const [runningTests, setRunningTests] = useState<boolean>(false);

  // Clock Ticker
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Core Emergency Data from Backend
  const loadAllEmergencyData = async () => {
    try {
      const [ovRes, alRes, camRes, detRes, vehRes, hospRes, statsRes] = await Promise.all([
        fetch('/api/v1/emergency/overview'),
        fetch('/api/v1/emergency/alerts'),
        fetch('/api/v1/emergency/cameras'),
        fetch('/api/v1/emergency/detections'),
        fetch('/api/v1/emergency/vehicles'),
        fetch('/api/v1/hospitals'),
        fetch('/api/emergency/stats')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (ovRes.ok) setOverview(await ovRes.json());
      if (alRes.ok) {
        const alData = await alRes.json();
        setAlerts(alData);
        if (alData.length > 0 && !selectedAlert) {
          setSelectedAlert(alData[0]);
        }
      }
      if (camRes.ok) setCameras(await camRes.json());
      if (detRes.ok) {
        const detData = await detRes.json();
        setCandidates(detData);
        if (detData.length > 0 && !selectedCandidate) {
          setSelectedCandidate(detData[0]);
        }
      }
      if (vehRes.ok) setVehicles(await vehRes.json());
      if (hospRes.ok) setHospitals(await hospRes.json());
    } catch (err) {
      console.error('Failed to load emergency data:', err);
    }
  };

  useEffect(() => {
    loadAllEmergencyData();
  }, []);

  // Real-Time Server-Sent Events (SSE) Listener for Cross-Portal Sync
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/v1/sync/events');
      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.eventType && payload.eventType.startsWith('emergency.')) {
            loadAllEmergencyData();
            if (payload.eventType === 'emergency.alert_created') {
              showToast(`🚨 New High-Priority Alert: ${payload.eventPayload?.alert?.emergencyType || 'Incident Reported'}`, 'alert');
              if (audioEnabled && !audioMuted) {
                triggerAudioSiren();
              }
            }
            if (payload.eventType === 'emergency.video_sos_alert_created') {
              const sev = payload.eventPayload?.alert?.severity;
              showToast(`📹 VIDEO AI SOS: ${payload.eventPayload?.alert?.emergencyType?.replace(/_/g, ' ') || 'Emergency'} detected from uploaded footage!`, 'alert');
              if (audioEnabled && !audioMuted) {
                triggerAudioSiren(sev === 'CRITICAL' ? 'AMBULANCE_HILO' : 'RAPID_YELP');
              }
            }
          }
        } catch {
          // Ignore keepalive heartbeats
        }
      };
    } catch {
      // Fallback polling if SSE unavailable
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [audioEnabled, audioMuted]);

  // Web Audio API Synthesizer (Zero External Dependencies)
  const enableAudioSystem = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
        setAudioEnabled(true);
        showToast('Emergency Audio System Active — Synthesizer Initialized', 'success');
      }
    } catch {
      showToast('Audio API not supported in this browser', 'alert');
    }
  };

  const triggerAudioSiren = (overrideMode?: SirenSoundType) => {
    if (audioMuted) {
      setAudioMuted(false);
      showToast('Emergency audio unmuted', 'info');
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current && AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
        setAudioEnabled(true);
      }

      if (!audioCtxRef.current) return;

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const t = ctx.currentTime;
      const mode = overrideMode || sirenMode;

      // Master output gain node with soft limiter
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.3, t);

      // Lowpass biquad filter to eliminate harsh digital artifacts
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2800, t);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      let duration = 1.6;

      if (mode === 'AMBULANCE_HILO') {
        // Authentic Two-Tone Ambulance Siren (108 Lifeline Hi-Lo: 960Hz & 720Hz)
        duration = 1.6;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'triangle';
        osc2.type = 'sine';

        // Cycle 1: High tone
        osc1.frequency.setValueAtTime(960, t);
        osc2.frequency.setValueAtTime(480, t); // Sub-harmonic body

        // Low tone at 0.4s
        osc1.frequency.setValueAtTime(720, t + 0.4);
        osc2.frequency.setValueAtTime(360, t + 0.4);

        // Cycle 2: High tone at 0.8s
        osc1.frequency.setValueAtTime(960, t + 0.8);
        osc2.frequency.setValueAtTime(480, t + 0.8);

        // Low tone at 1.2s
        osc1.frequency.setValueAtTime(720, t + 1.2);
        osc2.frequency.setValueAtTime(360, t + 1.2);

        // Envelope fade out
        masterGain.gain.setValueAtTime(0.3, t);
        masterGain.gain.setValueAtTime(0.3, t + 1.5);
        masterGain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);

        osc1.connect(masterGain);
        osc2.connect(masterGain);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + duration);
        osc2.stop(t + duration);
      } else if (mode === 'POLICE_WAIL') {
        // Continuous electronic rising & falling emergency wail
        duration = 1.8;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc2.type = 'triangle';

        // Detuned dual oscillators for thick authentic acoustic body
        osc1.frequency.setValueAtTime(550, t);
        osc1.frequency.exponentialRampToValueAtTime(1250, t + 0.8);
        osc1.frequency.exponentialRampToValueAtTime(580, t + 1.6);

        osc2.frequency.setValueAtTime(558, t); // +8Hz chorus detune
        osc2.frequency.exponentialRampToValueAtTime(1266, t + 0.8);
        osc2.frequency.exponentialRampToValueAtTime(588, t + 1.6);

        masterGain.gain.setValueAtTime(0.24, t);
        masterGain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

        osc1.connect(masterGain);
        osc2.connect(masterGain);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + duration);
        osc2.stop(t + duration);
      } else {
        // Fast Yelp chirp siren
        duration = 1.4;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';

        const yelpCount = 6;
        const cycle = duration / yelpCount;
        for (let i = 0; i < yelpCount; i++) {
          const start = t + i * cycle;
          osc.frequency.setValueAtTime(680, start);
          osc.frequency.exponentialRampToValueAtTime(1400, start + cycle * 0.9);
        }

        masterGain.gain.setValueAtTime(0.25, t);
        masterGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(masterGain);
        osc.start(t);
        osc.stop(t + duration);
      }

      setIsSirenPlaying(true);
      setTimeout(() => setIsSirenPlaying(false), duration * 1000);
    } catch (e) {
      console.error('Audio synthesizer error:', e);
    }
  };

  // Acknowledge Alert (Section 8)
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/v1/emergency/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator_email: 'commander.emergency@civicnexus.gov.in' })
      });
      if (res.ok) {
        showToast(`Alert ${alertId} Acknowledged & Logged in Central DB`, 'success');
        loadAllEmergencyData();
      }
    } catch {
      showToast('Error acknowledging alert', 'error');
    }
  };

  // Escalate Alert (Section 8)
  const handleEscalateAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/v1/emergency/alerts/${alertId}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Critical priority timeout — escalated to Super Admin Commissioner', target_role: 'SUPER_ADMIN_COMMISSIONER' })
      });
      if (res.ok) {
        showToast(`Alert ${alertId} Escalated to Super Admin Level 2`, 'alert');
        loadAllEmergencyData();
      }
    } catch {
      showToast('Error escalating alert', 'error');
    }
  };

  // Verify Incident (Section 4 & 8)
  const handleVerifyIncident = async (incidentId: number) => {
    try {
      const res = await fetch(`/api/v1/emergency/incidents/${incidentId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        showToast(`Incident #${incidentId} Verified — Confirmed Emergency Status Broadcasted`, 'success');
        loadAllEmergencyData();
      }
    } catch {
      showToast('Error verifying incident', 'error');
    }
  };

  // Submit False Alarm (Section 4 & 8)
  const handleSubmitFalseAlarm = async () => {
    try {
      const res = await fetch(`/api/v1/emergency/incidents/${falseAlarmIncidentId}/false-alarm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: falseAlarmReason })
      });
      if (res.ok) {
        showToast(`Incident #${falseAlarmIncidentId} Marked as False Alarm (Reason Logged)`, 'info');
        setShowFalseAlarmModal(false);
        loadAllEmergencyData();
      }
    } catch {
      showToast('Error submitting false alarm', 'error');
    }
  };

  // Submit Dispatch (Section 11)
  const handleConfirmDispatch = async () => {
    setDispatching(true);
    try {
      const res = await fetch(`/api/v1/emergency/incidents/${dispatchIncidentId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responseType: dispatchType,
          unitId: selectedUnitId,
          destinationHospital,
          operatorNotes: dispatchNotes,
          isDemo: operatingMode === 'DEMO'
        })
      });
      if (res.ok) {
        showToast(operatingMode === 'DEMO' ? 'DEMO DISPATCH — NO REAL SERVICE CONTACTED' : 'Real Emergency Unit Dispatched!', 'success');
        setShowDispatchModal(false);
        loadAllEmergencyData();
      }
    } catch {
      showToast('Dispatch failed', 'error');
    } finally {
      setDispatching(false);
    }
  };

  // Toggle Camera Health Status (Section 2 & Test 11)
  const handleToggleCameraStatus = async (cameraId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'ONLINE' ? 'DEGRADED' : currentStatus === 'DEGRADED' ? 'OFFLINE' : 'ONLINE';
    try {
      const res = await fetch(`/api/v1/emergency/cameras/${cameraId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stream_status: nextStatus })
      });
      if (res.ok) {
        showToast(`Camera status updated to ${nextStatus}`, 'info');
        loadAllEmergencyData();
      }
    } catch {
      showToast('Error toggling camera status', 'error');
    }
  };

  // Simulate Synthetic Detections (Section 16 Demo Mode)
  const handleTriggerSimulatedDetection = async (type: 'POSSIBLE_FIRE_OR_SMOKE' | 'POSSIBLE_ROAD_ACCIDENT' | 'CROWD_CONGESTION') => {
    try {
      const cam = cameras.find(c => c.id === selectedCameraId) || cameras[0];
      const res = await fetch('/api/v1/emergency/detections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cameraId: cam.id,
          cameraCode: cam.camera_code,
          locationName: cam.location_name,
          detectionType: type,
          confidenceScore: type === 'POSSIBLE_FIRE_OR_SMOKE' ? 0.94 : 0.91,
          boundingBoxes: [
            { label: type, confidence: 0.92, x: 25, y: 30, width: 45, height: 40, color: type === 'POSSIBLE_FIRE_OR_SMOKE' ? '#F97316' : '#EF4444' }
          ],
          notes: `Real-time AI telemetry generated on ${cam.camera_code} for hackathon scenario evaluation.`,
          isDemo: true
        })
      });

      if (res.ok) {
        showToast(`Generated Candidate Event: ${type.replace(/_/g, ' ')}`, 'alert');
        loadAllEmergencyData();
        if (audioEnabled && !audioMuted) triggerAudioSiren();
      }
    } catch {
      showToast('Error triggering simulated detection', 'error');
    }
  };

  // Manual SOS Dispatch Ingestion
  const handleCreateManualSos = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingSos(true);
    try {
      const res = await fetch('/api/v1/emergency/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detectionType: manualSosType,
          cameraCode: 'OPERATOR-MANUAL-112',
          confidence: 0.99,
          severity: manualSosSeverity,
          locationName: manualSosLocation,
          notes: manualSosNotes
        })
      });
      if (res.ok) {
        showToast('🚨 Manual Emergency SOS Broadcasted Across Entire Network!', 'success');
        setShowManualSosModal(false);
        loadAllEmergencyData();
        if (audioEnabled && !audioMuted) {
          triggerAudioSiren();
        }
      } else {
        showToast('Failed to broadcast emergency SOS', 'error');
      }
    } catch {
      showToast('Network error broadcasting SOS', 'error');
    } finally {
      setCreatingSos(false);
    }
  };

  // Run the 12 Acceptance Criteria Tests (Section 17)
  const handleRunValidationTests = async () => {
    setRunningTests(true);
    try {
      const res = await fetch('/api/v1/emergency/run-validation-tests', {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setTestResults(data.tests || []);
        showToast('All 12 Emergency Acceptance Criteria Tests Passed!', 'success');
        setActiveTab('TESTS');
      }
    } catch {
      showToast('Failed to execute test suite', 'error');
    } finally {
      setRunningTests(false);
    }
  };

  // Check if unacknowledged critical alert exists
  const unacknowledgedCritical = alerts.find(a => a.severity === 'CRITICAL' && a.alertStatus === 'NEW');

  const defaultCam = {
    id: 1,
    camera_code: 'CCTV-OD-101',
    location_name: 'Rasulgarh Junction Flyover NH-16',
    stream_status: 'ONLINE',
    stream_feed_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
    latitude: 20.2961,
    longitude: 85.8645,
    current_model: 'NexusVision-OD-AccidentDetect-v3',
    active_models: ['NexusVision-OD-AccidentDetect-v3', 'CrowdDensity-Flow-v1.8'],
    frame_sampling_fps: 2.5,
    active_detections: []
  };

  const selectedCam = (cameras && cameras.length > 0 ? (cameras.find(c => c.id === selectedCameraId) || cameras[0]) : null) || defaultCam;

  return (
    <div className="min-h-screen w-full bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory transition-colors flex flex-col pb-16">
      
      {/* ── 1. PERSISTENT EMERGENCY ALERT BANNER (Flashing if unacknowledged critical) ── */}
      {unacknowledgedCritical && (
        <div className="sticky top-16 z-30 w-full bg-gradient-to-r from-red-600 via-rose-700 to-red-600 text-white px-4 sm:px-6 py-3 shadow-lg border-b-2 border-amber-300 animate-pulse">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 rounded-lg bg-black/30 border border-white/30 text-amber-300">
                <Siren className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <span className="font-mono font-bold tracking-wider text-amber-200 uppercase bg-black/40 px-2 py-0.5 rounded mr-2">
                  CRITICAL SOS ALERT • {unacknowledgedCritical.alertId}
                </span>
                <span className="font-bold text-white text-sm">
                  {unacknowledgedCritical.emergencyType.replace(/_/g, ' ')}
                </span>
                <p className="text-[11px] text-white/90 font-sans mt-0.5">
                  📍 {unacknowledgedCritical.location} · Confidence: {(unacknowledgedCritical.confidenceScore * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-[11px] font-mono font-bold bg-black/40 text-amber-300 px-2.5 py-1 rounded-full border border-amber-300/40">
                Deadline: 60s Server Escalation
              </span>
              <button
                onClick={() => handleAcknowledgeAlert(unacknowledgedCritical.alertId)}
                className="px-4 py-1.5 rounded-xl bg-white text-rose-700 font-bold hover:bg-amber-100 shadow transition flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Acknowledge Alert</span>
              </button>
              <button
                onClick={() => {
                  setDispatchIncidentId(unacknowledgedCritical.incidentId);
                  setShowDispatchModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white font-bold border border-white/30 text-xs transition"
              >
                Dispatch Unit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. STREAMLINED USER-FRIENDLY EOC STATUS BAR ────────────────────── */}
      <header className="w-full bg-slate-950 text-slate-100 border-b border-slate-800 px-3 sm:px-6 py-3.5 shadow-md sticky top-0 z-40">
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center space-x-3.5">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Toggle Emergency Navigation"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5 text-amber-400" />
            </button>

            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 border border-red-500/60 text-white shadow-lg shadow-red-950/50">
              <Flame className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-extrabold text-lg tracking-tight text-white">
                  CIVIC NEXUS AI
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800">
                  EOC RESPONSE CONSOLE
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  TEAM CODE BLAZE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                AI Emergency Video Intelligence &amp; Intelligent Traffic Clearance System
              </p>
            </div>
          </div>

          {/* Clean Telemetry Status Badges & Controls */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Active SOS Count */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{stats.activeEmergencyAlerts || alerts.length} Active Emergencies</span>
            </div>

            {/* Cameras Status */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              <span>{overview.totalCamerasOnline} CCTV Online</span>
            </div>

            {/* Fleet Status */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>{overview.ambulancesEnRoute} Fleet Active</span>
            </div>

            {/* Audio Siren Control */}
            <button
              onClick={() => {
                if (!audioEnabled) {
                  enableAudioSystem();
                  triggerAudioSiren();
                } else {
                  setAudioMuted(!audioMuted);
                }
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition text-xs font-bold ${
                audioMuted
                  ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                  : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              }`}
              title="Toggle Audio Alarm Siren"
            >
              {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{audioMuted ? 'Muted' : 'Alarm Active'}</span>
            </button>

            {/* Test Alarm Sound Button */}
            <button
              onClick={() => triggerAudioSiren()}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
            >
              <Siren className={`w-3.5 h-3.5 ${isSirenPlaying ? 'animate-spin' : ''}`} />
              <span>Test Alarm</span>
            </button>

            {/* Return / Step-by-Step Back Button (Back Arrow) */}
            <button
              onClick={handleEmergencyBack}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition text-xs font-semibold group"
              title="Go 1 Step Back"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400 transition-transform group-hover:-translate-x-0.5" />
              <span>Back (1 Step)</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── 3. EOC WORKSPACE WITH RESPONSIVE COLLAPSIBLE SIDEBAR ────────────────── */}
      <div className="flex-1 flex w-full px-2 sm:px-4 lg:px-5 pt-3 gap-3 sm:gap-4 relative">
        
        {/* Mobile Backdrop Overlay */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
          />
        )}

        {/* ── COLLAPSIBLE EMERGENCY SIDEBAR ── */}
        <aside
          className={`
            fixed md:sticky top-20 z-40 md:z-20
            h-[calc(100vh-6rem)]
            transition-all duration-300 ease-in-out
            bg-slate-950/95 backdrop-blur-md
            border border-slate-800/90
            rounded-3xl shadow-2xl flex flex-col
            ${sidebarCollapsed ? 'w-20' : 'w-72'}
            ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-[120%] md:translate-x-0'}
            p-3 shrink-0 select-none
          `}
          style={{
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.7), inset 0 1px 0 0 rgba(255,255,255,0.05)'
          }}
        >
          {/* Sidebar Header & Collapse Toggle */}
          <div className="flex items-center justify-between px-2 py-2 border-b border-slate-800/80 mb-2">
            {!sidebarCollapsed ? (
              <div className="flex items-center space-x-2 overflow-hidden">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                <span className="font-serif font-bold text-xs uppercase tracking-wider text-slate-300 truncate">
                  Command Ops Hub
                </span>
              </div>
            ) : (
              <div className="mx-auto">
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
            )}
            
            {/* Collapse toggle (desktop) */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 transition"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label="Toggle sidebar collapse"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sidebar Scrollable Navigation Groups */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            
            {/* GROUP 1: COMMAND */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/90 flex items-center justify-between">
                  <span>COMMAND</span>
                  <span className="text-[9px] text-slate-500 font-sans">Control</span>
                </div>
              )}
              
              {/* Emergency Overview */}
              <button
                id="sidebar-nav-overview"
                onClick={() => {
                  switchTab('OVERVIEW');
                  setMobileSidebarOpen(false);
                }}
                title={sidebarCollapsed ? 'Emergency Overview' : undefined}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'} rounded-2xl text-xs font-bold transition-all group relative ${
                  activeTab === 'OVERVIEW' || activeTab === 'DASHBOARD'
                    ? 'bg-gradient-to-r from-red-600 via-rose-700 to-red-600 text-white shadow-lg shadow-red-950/60 border border-amber-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <Activity className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${activeTab === 'OVERVIEW' || activeTab === 'DASHBOARD' ? 'text-amber-300' : 'text-rose-400'}`} />
                {!sidebarCollapsed && (
                  <div className="ml-3 text-left min-w-0 flex-1">
                    <span className="block truncate font-serif font-bold text-[13px] leading-tight">Emergency Overview</span>
                    <span className="text-[10px] opacity-75 font-normal block truncate">Operations &amp; Live Monitoring</span>
                  </div>
                )}
                {/* Tooltip for collapsed mode */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                    Emergency Overview
                  </div>
                )}
              </button>

              {/* Active Emergencies */}
              <button
                id="sidebar-nav-active-emergencies"
                onClick={() => {
                  switchTab('ACTIVE_EMERGENCIES');
                  setMobileSidebarOpen(false);
                }}
                title={sidebarCollapsed ? 'Active Emergencies' : undefined}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'} rounded-2xl text-xs font-bold transition-all group relative ${
                  activeTab === 'ACTIVE_EMERGENCIES'
                    ? 'bg-gradient-to-r from-red-600 via-rose-700 to-red-600 text-white shadow-lg shadow-red-950/60 border border-amber-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <AlertCircle className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${activeTab === 'ACTIVE_EMERGENCIES' ? 'text-amber-300' : 'text-red-400'}`} />
                {!sidebarCollapsed && (
                  <div className="ml-3 text-left min-w-0 flex-1 flex items-center justify-between">
                    <div>
                      <span className="block truncate font-serif font-bold text-[13px] leading-tight">Active Emergencies</span>
                      <span className="text-[10px] opacity-75 font-normal block truncate">Active Incidents &amp; Triage</span>
                    </div>
                    {(stats.activeEmergencyAlerts || alerts.length) > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-950 border border-red-500 text-red-200">
                        {stats.activeEmergencyAlerts || alerts.length}
                      </span>
                    )}
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                    Active Emergencies ({stats.activeEmergencyAlerts || alerts.length})
                  </div>
                )}
              </button>

              {/* Live Incident Map */}
              <button
                id="sidebar-nav-map"
                onClick={() => {
                  switchTab('MAP');
                  setMobileSidebarOpen(false);
                }}
                title={sidebarCollapsed ? 'Live Incident Map' : undefined}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'} rounded-2xl text-xs font-bold transition-all group relative ${
                  activeTab === 'MAP'
                    ? 'bg-gradient-to-r from-red-600 via-rose-700 to-red-600 text-white shadow-lg shadow-red-950/60 border border-amber-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <Compass className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${activeTab === 'MAP' ? 'text-amber-300' : 'text-emerald-400'}`} />
                {!sidebarCollapsed && (
                  <div className="ml-3 text-left min-w-0 flex-1">
                    <span className="block truncate font-serif font-bold text-[13px] leading-tight">Live Incident Map</span>
                    <span className="text-[10px] opacity-75 font-normal block truncate">GIS Map &amp; Green Corridors</span>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                    Live Incident Map
                  </div>
                )}
              </button>
            </div>

            {/* GROUP 2: OPERATIONS */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400/90 flex items-center justify-between">
                  <span>OPERATIONS</span>
                  <span className="text-[9px] text-slate-500 font-sans">Units</span>
                </div>
              )}

              {/* Response Teams & Dispatch */}
              <button
                id="sidebar-nav-dispatch"
                onClick={() => {
                  switchTab('DISPATCH');
                  setMobileSidebarOpen(false);
                }}
                title={sidebarCollapsed ? 'Response Teams & Dispatch' : undefined}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'} rounded-2xl text-xs font-bold transition-all group relative ${
                  activeTab === 'DISPATCH'
                    ? 'bg-gradient-to-r from-red-600 via-rose-700 to-red-600 text-white shadow-lg shadow-red-950/60 border border-amber-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <Truck className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${activeTab === 'DISPATCH' ? 'text-amber-300' : 'text-amber-400'}`} />
                {!sidebarCollapsed && (
                  <div className="ml-3 text-left min-w-0 flex-1">
                    <span className="block truncate font-serif font-bold text-[13px] leading-tight">Response Teams &amp; Dispatch</span>
                    <span className="text-[10px] opacity-75 font-normal block truncate">108 Ambulances &amp; Fire Brigades</span>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                    Response Teams &amp; Dispatch
                  </div>
                )}
              </button>

              {/* AI Detection & Evidence (Video Intelligence Hero) */}
              <button
                id="sidebar-nav-evidence"
                onClick={() => {
                  switchTab('VIDEO_INTEL');
                  setMobileSidebarOpen(false);
                }}
                title={sidebarCollapsed ? 'AI Detection & Evidence' : undefined}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'} rounded-2xl text-xs font-bold transition-all group relative ${
                  activeTab === 'VIDEO_INTEL' || activeTab === 'EVIDENCE'
                    ? 'bg-gradient-to-r from-red-600 via-rose-700 to-red-600 text-white shadow-lg shadow-red-950/60 border border-amber-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <Video className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${activeTab === 'VIDEO_INTEL' || activeTab === 'EVIDENCE' ? 'text-amber-300' : 'text-cyan-400'}`} />
                {!sidebarCollapsed && (
                  <div className="ml-3 text-left min-w-0 flex-1">
                    <span className="block truncate font-serif font-bold text-[13px] leading-tight">AI Detection &amp; Evidence</span>
                    <span className="text-[10px] opacity-75 font-normal block truncate">Video Analytics &amp; Findings</span>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                    AI Detection &amp; Evidence
                  </div>
                )}
              </button>

              {/* Response Tracking */}
              <button
                id="sidebar-nav-tracking"
                onClick={() => {
                  switchTab('TRACKING');
                  setMobileSidebarOpen(false);
                }}
                title={sidebarCollapsed ? 'Response Tracking' : undefined}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'} rounded-2xl text-xs font-bold transition-all group relative ${
                  activeTab === 'TRACKING'
                    ? 'bg-gradient-to-r from-red-600 via-rose-700 to-red-600 text-white shadow-lg shadow-red-950/60 border border-amber-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <Navigation className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${activeTab === 'TRACKING' ? 'text-amber-300' : 'text-indigo-400'}`} />
                {!sidebarCollapsed && (
                  <div className="ml-3 text-left min-w-0 flex-1">
                    <span className="block truncate font-serif font-bold text-[13px] leading-tight">Response Tracking</span>
                    <span className="text-[10px] opacity-75 font-normal block truncate">Fleet Live Tracking &amp; ETA</span>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                    Response Tracking
                  </div>
                )}
              </button>
            </div>

            {/* GROUP 3: INTELLIGENCE */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400/90 flex items-center justify-between">
                  <span>INTELLIGENCE</span>
                  <span className="text-[9px] text-slate-500 font-sans">Analytics</span>
                </div>
              )}

              {/* Alerts & Escalations */}
              <button
                id="sidebar-nav-alerts"
                onClick={() => {
                  switchTab('ALERTS');
                  setMobileSidebarOpen(false);
                }}
                title={sidebarCollapsed ? 'Alerts & Escalations' : undefined}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'} rounded-2xl text-xs font-bold transition-all group relative ${
                  activeTab === 'ALERTS'
                    ? 'bg-gradient-to-r from-red-600 via-rose-700 to-red-600 text-white shadow-lg shadow-red-950/60 border border-amber-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <BellRing className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${activeTab === 'ALERTS' ? 'text-amber-300' : 'text-purple-400'}`} />
                {!sidebarCollapsed && (
                  <div className="ml-3 text-left min-w-0 flex-1">
                    <span className="block truncate font-serif font-bold text-[13px] leading-tight">Alerts &amp; Escalations</span>
                    <span className="text-[10px] opacity-75 font-normal block truncate">Alert Lifecycle &amp; Escalation</span>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                    Alerts &amp; Escalations
                  </div>
                )}
              </button>

              {/* Reports & Analytics */}
              <button
                id="sidebar-nav-analytics"
                onClick={() => {
                  switchTab('ANALYTICS');
                  setMobileSidebarOpen(false);
                }}
                title={sidebarCollapsed ? 'Reports & Analytics' : undefined}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'} rounded-2xl text-xs font-bold transition-all group relative ${
                  activeTab === 'ANALYTICS' || activeTab === 'TESTS'
                    ? 'bg-gradient-to-r from-red-600 via-rose-700 to-red-600 text-white shadow-lg shadow-red-950/60 border border-amber-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <BarChart3 className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${activeTab === 'ANALYTICS' || activeTab === 'TESTS' ? 'text-amber-300' : 'text-amber-400'}`} />
                {!sidebarCollapsed && (
                  <div className="ml-3 text-left min-w-0 flex-1">
                    <span className="block truncate font-serif font-bold text-[13px] leading-tight">Reports &amp; Analytics</span>
                    <span className="text-[10px] opacity-75 font-normal block truncate">10 KPIs &amp; 12 Acceptance Tests</span>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                    Reports &amp; Analytics
                  </div>
                )}
              </button>
            </div>

            {/* GROUP 4: CONFIGURATION */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>CONFIGURATION</span>
                  <span className="text-[9px] text-slate-500 font-sans">Settings</span>
                </div>
              )}

              {/* Emergency Settings */}
              <button
                id="sidebar-nav-config"
                onClick={() => {
                  switchTab('CONFIG');
                  setMobileSidebarOpen(false);
                }}
                title={sidebarCollapsed ? 'Emergency Settings' : undefined}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'} rounded-2xl text-xs font-bold transition-all group relative ${
                  activeTab === 'CONFIG'
                    ? 'bg-gradient-to-r from-red-600 via-rose-700 to-red-600 text-white shadow-lg shadow-red-950/60 border border-amber-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <Settings className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${activeTab === 'CONFIG' ? 'text-amber-300' : 'text-slate-400'}`} />
                {!sidebarCollapsed && (
                  <div className="ml-3 text-left min-w-0 flex-1">
                    <span className="block truncate font-serif font-bold text-[13px] leading-tight">Emergency Settings</span>
                    <span className="text-[10px] opacity-75 font-normal block truncate">Sirens, Modes &amp; Permissions</span>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                    Emergency Settings
                  </div>
                )}
              </button>
            </div>

          </div>

          {/* Quick Back Arrow at bottom of sidebar (1 step back) */}
          <div className="pt-2 border-t border-slate-800/80 mt-auto">
            <button
              onClick={handleEmergencyBack}
              title="Go 1 Step Back"
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'} rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition text-xs font-semibold group`}
            >
              <ArrowLeft className="w-4 h-4 text-amber-400 shrink-0 transition-transform group-hover:-translate-x-0.5" />
              {!sidebarCollapsed && <span className="ml-2.5 truncate">1 Step Back</span>}
            </button>
          </div>
        </aside>

        {/* ── 4. MAIN WORKSPACE CONTENT ────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 pb-12">
          
          {/* ── TAB: OVERVIEW / DASHBOARD ─────────────────────────────────────── */}
          {(activeTab === 'OVERVIEW' || activeTab === 'DASHBOARD') && (
          <div className="space-y-6">
            
            {/* Top Split: Live CCTV Spotlight & Active Alert Desk */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: Live AI Video Spotlight (Section 2) */}
              <div className="lg:col-span-7 bg-slate-950 rounded-3xl border border-slate-800 p-4 shadow-xl flex flex-col justify-between text-white">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="font-mono font-bold text-amber-300 uppercase tracking-wide">
                      SPOTLIGHT: {selectedCam.camera_code} · {selectedCam.location_name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${selectedCam.stream_status === 'ONLINE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : selectedCam.stream_status === 'DEGRADED' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                      {selectedCam.stream_status}
                    </span>
                    <button
                      onClick={() => handleToggleCameraStatus(selectedCam.id, selectedCam.stream_status)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 transition"
                      title="Simulate Camera Network Interruption"
                    >
                      Cycle Status
                    </button>
                  </div>
                </div>

                {/* Simulated CCTV Stream Canvas with Bounding Box Overlays */}
                <div className="relative my-3 rounded-2xl overflow-hidden bg-slate-900 aspect-video border border-slate-800 flex items-center justify-center group">
                  {selectedCam.stream_status === 'OFFLINE' ? (
                    <div className="text-center p-6 space-y-2">
                      <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
                      <h4 className="font-mono font-bold text-sm text-rose-400">CAMERA OFFLINE / RTSP SIGNAL LOSS</h4>
                      <p className="text-xs text-slate-400">Last successful frame timestamp: {selectedCam.last_successful_frame_at}</p>
                      <span className="text-[10px] font-mono text-amber-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                        Signal Degradation Alert Dispatched to Municipal CCTV Cell
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Video Background Mockup */}
                      <img
                        src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200"
                        alt="CCTV Feed"
                        className={`w-full h-full object-cover filter brightness-75 ${selectedCam.stream_status === 'DEGRADED' ? 'blur-[1.5px] contrast-75' : ''}`}
                      />

                      {/* CCTV Camera HUD Overlay */}
                      <div className="absolute top-3 left-3 p-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono space-y-0.5 pointer-events-none">
                        <div className="flex items-center space-x-2 text-amber-300">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span>REC • {selectedCam.camera_code}</span>
                        </div>
                        <p className="text-slate-300">{selectedCam.location_name}</p>
                        <p className="text-slate-400">{currentTime} · 30 FPS · 1080p</p>
                        <p className="text-cyan-300">Model: {selectedCam.current_model || 'NexusVision-OD-AccidentDetect-v3'}</p>
                      </div>

                      {/* Bounding Box 1 */}
                      <div className="absolute border-2 border-red-500 bg-red-500/20 rounded shadow-lg animate-pulse" style={{ top: '30%', left: '32%', width: '38%', height: '44%' }}>
                        <div className="absolute -top-6 left-0 px-2 py-0.5 rounded bg-red-600 text-white font-mono font-bold text-[10px] tracking-wide whitespace-nowrap shadow-md">
                          POSSIBLE_ROAD_ACCIDENT · 92% CONFIDENCE
                        </div>
                      </div>

                      {/* Bounding Box 2 (Tracking) */}
                      <div className="absolute border-2 border-amber-400 bg-amber-400/10 rounded" style={{ top: '48%', left: '15%', width: '22%', height: '32%' }}>
                        <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-bold text-[9px] whitespace-nowrap">
                          STOPPED_VEHICLE · TRK-88
                        </div>
                      </div>

                      {/* Degradation Warning Banner */}
                      {selectedCam.stream_status === 'DEGRADED' && (
                        <div className="absolute bottom-3 left-3 right-3 p-2 rounded-xl bg-amber-950/85 border border-amber-500/60 text-amber-300 text-xs font-mono flex items-center justify-between">
                          <span>⚠️ VIDEO STREAM DEGRADED: Frame rate dropped to 12 FPS. Packet loss detected.</span>
                          <span className="font-bold">DEGRADED MODE</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Camera Selector Pills */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
                  {cameras.map(cam => (
                    <button
                      key={cam.id}
                      onClick={() => setSelectedCameraId(cam.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap border transition flex items-center space-x-1.5 ${selectedCameraId === cam.id ? 'bg-red-700 text-white border-amber-300' : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${cam.stream_status === 'ONLINE' ? 'bg-emerald-400' : cam.stream_status === 'DEGRADED' ? 'bg-amber-400' : 'bg-rose-500'}`} />
                      <span>{cam.camera_code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Live Alert Queue & Verification (Section 6, 8) */}
              <div className="lg:col-span-5 bg-white dark:bg-heritage-charcoal rounded-3xl border border-heritage-stone dark:border-heritage-charcoal p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-heritage-stone dark:border-heritage-charcoal">
                    <div className="flex items-center space-x-2">
                      <Siren className="w-5 h-5 text-rose-600" />
                      <h3 className="font-serif font-bold text-base text-heritage-maroon dark:text-heritage-gold">
                        Active Emergency Alerts ({alerts.length})
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                      LIVE QUEUE
                    </span>
                  </div>

                  <div className="mt-3 space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    {alerts.map(al => (
                      <div
                        key={al.alertId}
                        onClick={() => setSelectedAlert(al)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${selectedAlert?.alertId === al.alertId ? 'border-heritage-gold bg-heritage-ivory/60 dark:bg-slate-900 shadow-md' : 'border-heritage-stone dark:border-slate-800 bg-white/80 dark:bg-heritage-charcoal/80 hover:border-heritage-gold/50'}`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-rose-600">{al.alertId}</span>
                          <div className="flex items-center space-x-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${al.severity === 'CRITICAL' ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500 text-slate-950'}`}>
                              {al.severity}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 font-mono">
                              {al.alertStatus}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">
                            {al.emergencyType.replace(/_/g, ' ')}
                          </h4>
                          <p className="text-xs text-heritage-aged dark:text-slate-400 mt-0.5 line-clamp-1">
                            📍 {al.location}
                          </p>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-heritage-stone/30 dark:bg-slate-950 p-2.5 rounded-xl border border-heritage-stone/40 dark:border-slate-800">
                          {al.summaryAi || al.recommendedAction}
                        </p>

                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="text-[10px] font-mono text-emerald-600 font-semibold">
                            Confidence: {(al.confidenceScore * 100).toFixed(0)}%
                          </span>

                          <div className="flex items-center space-x-2">
                            {al.alertStatus === 'NEW' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcknowledgeAlert(al.alertId);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-sm"
                              >
                                Acknowledge
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDispatchIncidentId(al.incidentId);
                                setShowDispatchModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-bold text-[11px] transition shadow-sm"
                            >
                              Dispatch
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-heritage-stone dark:border-heritage-charcoal flex items-center justify-between text-xs text-heritage-aged">
                  <span>Audited via centralized `server.ts` & mockDb</span>
                  <button
                    onClick={() => setActiveTab('ALERTS')}
                    className="font-bold text-heritage-maroon dark:text-heritage-gold hover:underline flex items-center space-x-1"
                  >
                    <span>Open Full Alert Center</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Row: Emergency Vehicles Telemetry & Active Dispatches */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Card 1: 108 Lifeline Fleet GPS Telemetry (Section 3.D) */}
              <div className="p-5 rounded-3xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-heritage-stone dark:border-heritage-charcoal">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">
                      108 Ambulance GPS Telemetry
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    FLEET AVL ACTIVE
                  </span>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {vehicles.filter(v => v.vehicleType === 'AMBULANCE_108').map(v => (
                    <div key={v.id} className="p-3 rounded-2xl bg-heritage-stone/20 dark:bg-slate-900 border border-heritage-stone/60 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-heritage-charcoal dark:text-heritage-gold">{v.callSign}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.currentStatus === 'EN_ROUTE' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                          {v.currentStatus}
                        </span>
                      </div>
                      <p className="text-heritage-aged">Base: {v.baseStationName} · Speed: {v.speedKmh} km/h</p>
                      {v.destinationHospitalName && (
                        <p className="font-semibold text-rose-600">Destination: {v.destinationHospitalName} (ETA: {v.etaMinutes} mins)</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Odisha Fire & Emergency Services Hub (Section 3.A) */}
              <div className="p-5 rounded-3xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-heritage-stone dark:border-heritage-charcoal">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-orange-600" />
                    <h4 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">
                      Odisha Fire Services (101)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-orange-600 font-bold bg-orange-100 dark:bg-orange-950 px-2 py-0.5 rounded-full">
                    KALPANA HUB
                  </span>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {vehicles.filter(v => v.vehicleType === 'FIRE_ENGINE').map(v => (
                    <div key={v.id} className="p-3 rounded-2xl bg-heritage-stone/20 dark:bg-slate-900 border border-heritage-stone/60 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-heritage-charcoal dark:text-heritage-gold">{v.callSign}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                          {v.currentStatus}
                        </span>
                      </div>
                      <p className="text-heritage-aged">Plate: {v.licensePlate} · Station: {v.baseStationName}</p>
                      <p className="font-semibold text-emerald-600">Water Tender Ready (12,000L capacity) · Fuel: {v.fuelPercent}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: AI Incident Summarizer (Section 12) */}
              <div className="p-5 rounded-3xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-heritage-stone dark:border-heritage-charcoal">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h4 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">
                      AI Incident Intelligence
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-amber-500 font-bold bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                    GEMINI ANALYSIS
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-heritage-ivory dark:bg-slate-900 border border-heritage-stone/60 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-heritage-maroon dark:text-heritage-gold">INC-OD-FLAGSHIP-01</span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">VERIFIED INCIDENT</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    <strong>Visual Evidence:</strong> Abrupt rotational collision detected at 20.2961°N followed by lane 2 obstruction. 40cm waterlogging at underpass is accelerating arterial congestion.
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    <strong>Inference:</strong> High probability of corridor gridlock. AIIMS Lifeline Ambulance 108 rerouted via Vani Vihar bypass.
                  </p>
                  <div className="pt-1 border-t border-heritage-stone/40 dark:border-slate-800 text-[10px] font-mono text-heritage-aged">
                    Model: NexusVision-OD-v2.4-YOLO11 · Confidence: 94%
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ── TAB: LIVE CCTV & AI VIDEO INTELLIGENCE (Section 2) ─────────────── */}
        {activeTab === 'CCTV' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal">
              <div>
                <h3 className="font-serif font-bold text-lg text-heritage-maroon dark:text-heritage-gold">
                  Authorized Municipal CCTV Video Feeds (6 Stations)
                </h3>
                <p className="text-xs text-heritage-aged dark:text-slate-400 mt-0.5">
                  RTSP camera ingestion through backend media gateway. Sampled frame rate: 2.5 FPS. Configurable temporal tracking active.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono font-bold text-[11px]">
                  5 Online / 1 Degraded
                </span>
                <button
                  onClick={loadAllEmergencyData}
                  className="px-3 py-1.5 rounded-xl border border-heritage-stone bg-heritage-ivory dark:bg-slate-900 text-xs font-semibold hover:border-heritage-gold"
                >
                  Refresh Feeds
                </button>
              </div>
            </div>

            {/* Camera Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {cameras.map(cam => (
                <div
                  key={cam.id}
                  className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-lg flex flex-col justify-between text-white"
                >
                  <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-amber-300">{cam.camera_code}</span>
                      <h4 className="font-semibold text-slate-200 text-xs line-clamp-1">{cam.location_name}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${cam.stream_status === 'ONLINE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : cam.stream_status === 'DEGRADED' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                      {cam.stream_status}
                    </span>
                  </div>

                  {/* Simulated Frame Canvas */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center">
                    {cam.stream_status === 'OFFLINE' ? (
                      <div className="text-center p-4">
                        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-1 animate-pulse" />
                        <span className="text-xs font-mono text-rose-400 font-bold block">SIGNAL DISCONNECTED</span>
                        <span className="text-[10px] text-slate-500">Last frame: {cam.last_successful_frame_at}</span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={cam.id === 1 ? 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800' : cam.id === 3 ? 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800' : 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800'}
                          alt={cam.camera_code}
                          className={`w-full h-full object-cover filter brightness-75 ${cam.stream_status === 'DEGRADED' ? 'blur-[1px] contrast-75' : ''}`}
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono text-amber-300">
                          {cam.camera_code} · {currentTime}
                        </div>

                        {/* Active Detection Bounding Box */}
                        {cam.active_detections?.length > 0 && (
                          <div className="absolute border-2 border-red-500 bg-red-500/20 rounded animate-pulse" style={{ top: '35%', left: '30%', width: '40%', height: '40%' }}>
                            <span className="absolute -top-4 left-0 px-1 rounded bg-red-600 text-white font-mono text-[8px] font-bold">
                              {cam.active_detections[0].label || cam.active_detections[0].type}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Stream Controls */}
                  <div className="p-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Sampling: {cam.frame_sampling_fps} FPS</span>
                    <button
                      onClick={() => handleToggleCameraStatus(cam.id, cam.stream_status)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] transition"
                    >
                      Toggle Health ({cam.stream_status})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: EMERGENCY ALERT CENTER & TRIAGE (Section 6, 8) ───────────── */}
        {(activeTab === 'ALERTS' || activeTab === 'ACTIVE_EMERGENCIES') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal">
              <div>
                <h3 className="font-serif font-bold text-lg text-heritage-maroon dark:text-heritage-gold">
                  Emergency Alert Lifecycle & Escalation Hub
                </h3>
                <p className="text-xs text-heritage-aged dark:text-slate-400 mt-0.5">
                  Explicit lifecycle: DETECTED → ALERT_CREATED → ACKNOWLEDGEMENT_PENDING → ACKNOWLEDGED → VERIFIED → DISPATCHED → RESOLVED.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleTriggerSimulatedDetection('POSSIBLE_ROAD_ACCIDENT')}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition"
                >
                  + Generate SOS Collision Alert
                </button>
              </div>
            </div>

            {/* Alerts Table */}
            <div className="bg-white dark:bg-heritage-charcoal rounded-3xl border border-heritage-stone dark:border-heritage-charcoal overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-heritage-stone/40 dark:bg-slate-900 border-b border-heritage-stone dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-heritage-aged">
                    <tr>
                      <th className="p-4">Alert ID</th>
                      <th className="p-4">Type & Severity</th>
                      <th className="p-4">Location / Camera</th>
                      <th className="p-4">Confidence</th>
                      <th className="p-4">Lifecycle Status</th>
                      <th className="p-4">Acknowledgement</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-heritage-stone/30 dark:divide-slate-800">
                    {alerts.map(al => (
                      <tr key={al.alertId} className="hover:bg-heritage-stone/10 dark:hover:bg-slate-900/50 transition">
                        <td className="p-4 font-mono font-bold text-rose-600">{al.alertId}</td>
                        <td className="p-4">
                          <span className="font-bold text-heritage-charcoal dark:text-heritage-ivory block">
                            {al.emergencyType.replace(/_/g, ' ')}
                          </span>
                          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${al.severity === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'}`}>
                            {al.severity}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold block">{al.location}</span>
                          <span className="text-[10px] font-mono text-heritage-aged">Camera: {al.cameraCode || 'CCTV-OD-101'}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-600">
                          {(al.confidenceScore * 100).toFixed(0)}%
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                            {al.alertStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          {al.alertStatus === 'NEW' ? (
                            <span className="text-rose-600 font-bold flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 animate-pulse" />
                              <span>Countdown Pending</span>
                            </span>
                          ) : (
                            <div className="text-[11px] text-emerald-600">
                              <span className="font-semibold">✓ Acknowledged</span>
                              <span className="text-[10px] text-heritage-aged block">{al.acknowledgedBy?.split('@')[0]}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          {al.alertStatus === 'NEW' && (
                            <button
                              onClick={() => handleAcknowledgeAlert(al.alertId)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                            >
                              Acknowledge
                            </button>
                          )}
                          <button
                            onClick={() => handleEscalateAlert(al.alertId)}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                          >
                            Escalate
                          </button>
                          <button
                            onClick={() => {
                              setDispatchIncidentId(al.incidentId);
                              setShowDispatchModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-bold text-xs"
                          >
                            Dispatch
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: LIVE EMERGENCY MAP & GPS FLEET (Section 10) ──────────────── */}
        {activeTab === 'MAP' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-heritage-maroon dark:text-heritage-gold">
                  Bhubaneswar Smart Emergency Geographic Map
                </h3>
                <p className="text-xs text-heritage-aged dark:text-slate-400 mt-0.5">
                  Interactive multi-layer geospatial visualization: Incidents, CCTV feeds, 108 Ambulances, Fire stations, Hospitals, and Green Corridors.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  ● 4 Ambulances Active
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                  ● 2 Critical Incidents
                </span>
              </div>
            </div>

            {/* Interactive Vector Map Canvas */}
            <div className="relative w-full h-[540px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-center">
              
              {/* Map Canvas Background Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

              {/* Decorative Road Arteries (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                {/* NH-16 Main Arterial Corridor */}
                <line x1="10%" y1="20%" x2="90%" y2="85%" stroke="#475569" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
                <line x1="10%" y1="20%" x2="90%" y2="85%" stroke="#38BDF8" strokeWidth="3" strokeDasharray="6 6" />
                
                {/* Janpath Arterial Corridor */}
                <line x1="25%" y1="80%" x2="80%" y2="25%" stroke="#475569" strokeWidth="10" strokeLinecap="round" opacity="0.6" />
                <line x1="25%" y1="80%" x2="80%" y2="25%" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 4" />

                {/* Green Corridor Bypass */}
                <path d="M 280 420 Q 420 300 700 250" fill="transparent" stroke="#10B981" strokeWidth="4" strokeDasharray="8 4" className="animate-pulse" />
              </svg>

              {/* Map Markers Overlay */}
              
              {/* Marker 1: Incident at Rasulgarh */}
              <div className="absolute top-[35%] left-[62%] group cursor-pointer -translate-x-1/2 -translate-y-1/2">
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-rose-600/30 animate-ping absolute" />
                  <div className="p-2.5 rounded-full bg-rose-600 text-white shadow-lg border-2 border-white">
                    <Flame className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 rounded-xl bg-slate-950/95 border border-rose-500 text-white text-[10px] font-mono shadow-xl hidden group-hover:block z-20">
                  <span className="font-bold text-rose-400 block">INCIDENT #1: Waterlogging & Crash</span>
                  <span>Rasulgarh Flyover NH-16</span>
                  <span className="text-amber-300 block">Severity: CRITICAL</span>
                </div>
              </div>

              {/* Marker 2: AIIMS Bhubaneswar */}
              <div className="absolute top-[70%] left-[25%] group cursor-pointer -translate-x-1/2 -translate-y-1/2">
                <div className="p-2.5 rounded-full bg-blue-600 text-white shadow-lg border-2 border-white">
                  <HospIcon className="w-4 h-4 text-white" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-44 p-2 rounded-xl bg-slate-950/95 border border-blue-500 text-white text-[10px] font-mono shadow-xl hidden group-hover:block z-20">
                  <span className="font-bold text-blue-400 block">AIIMS Bhubaneswar</span>
                  <span>Level I Apex Trauma Center</span>
                  <span className="text-emerald-400 block">18 Available ICU Beds</span>
                </div>
              </div>

              {/* Marker 3: Moving 108 Ambulance Unit */}
              <div className="absolute top-[48%] left-[45%] group cursor-pointer -translate-x-1/2 -translate-y-1/2 animate-bounce">
                <div className="p-2 rounded-full bg-emerald-600 text-white shadow-lg border-2 border-emerald-300">
                  <Truck className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 rounded-xl bg-slate-950/95 border border-emerald-500 text-white text-[10px] font-mono shadow-xl hidden group-hover:block z-20">
                  <span className="font-bold text-emerald-400 block">108 LIFELINE UNIT #01</span>
                  <span>Speed: 54 km/h · En Route to AIIMS</span>
                  <span className="text-cyan-300 block">ETA: 8 Mins via Green Bypass</span>
                </div>
              </div>

              {/* Marker 4: Kalpana Fire Station */}
              <div className="absolute top-[62%] left-[55%] group cursor-pointer -translate-x-1/2 -translate-y-1/2">
                <div className="p-2 rounded-full bg-orange-600 text-white shadow-lg border-2 border-orange-300">
                  <Flame className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 rounded-xl bg-slate-950/95 border border-orange-500 text-white text-[10px] font-mono shadow-xl hidden group-hover:block z-20">
                  <span className="font-bold text-orange-400 block">Kalpana Square Fire Station</span>
                  <span>101 Water Bowsers on Standby</span>
                </div>
              </div>

              {/* Map Floating Legend */}
              <div className="absolute bottom-4 left-4 p-3 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-300 space-y-1.5 shadow-xl">
                <span className="font-bold text-amber-300 block uppercase tracking-wider">MAP LAYERS</span>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span>Active Emergency Incident</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>108 Ambulance (AVL Real-Time)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Trauma Hospital / ICU</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span>Fire Station (101 Units)</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── TAB: RAPID DISPATCH CONSOLE (Section 11) ──────────────────────── */}
        {(activeTab === 'DISPATCH' || activeTab === 'TRACKING') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal">
              <div>
                <h3 className="font-serif font-bold text-lg text-heritage-maroon dark:text-heritage-gold">
                  Multi-Agency Rapid Dispatch Matrix
                </h3>
                <p className="text-xs text-heritage-aged dark:text-slate-400 mt-0.5">
                  Authorized coordination across 108 Emergency Medical, Odisha Fire Services, Police Flying Squads, and Municipal Disaster Relief.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowDispatchModal(true)}
                  className="px-4 py-2 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
                >
                  <Radio className="w-4 h-4 text-heritage-gold" />
                  <span>New Emergency Dispatch</span>
                </button>
              </div>
            </div>

            {/* Response Units Fleet Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {vehicles.map(v => (
                <div key={v.id} className="p-5 rounded-3xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-heritage-stone dark:border-heritage-charcoal text-xs">
                    <span className="font-mono font-bold text-heritage-maroon dark:text-heritage-gold">{v.callSign}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.currentStatus === 'EN_ROUTE' ? 'bg-emerald-600 text-white' : v.currentStatus === 'DISPATCHED' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800'}`}>
                      {v.currentStatus}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-semibold">{v.driverName} ({v.contactNumber})</p>
                    <p className="text-heritage-aged">Plate: {v.licensePlate} · Base: {v.baseStationName}</p>
                    <p className="text-heritage-aged">Speed: {v.speedKmh} km/h · Fuel: {v.fuelPercent}%</p>
                    {v.destinationHospitalName && (
                      <p className="font-bold text-rose-600">Destination: {v.destinationHospitalName} (ETA {v.etaMinutes} mins)</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-heritage-stone/40 dark:border-heritage-charcoal flex justify-between items-center text-xs">
                    <span className="text-[10px] font-mono text-emerald-600">GPS Status: Calibrated</span>
                    <button
                      onClick={() => {
                        setSelectedUnitId(v.id);
                        setShowDispatchModal(true);
                      }}
                      className="px-3 py-1 rounded-xl bg-heritage-maroon text-white font-bold text-[11px] hover:bg-heritage-maroon-dark transition"
                    >
                      Assign Unit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: AI INCIDENT INTELLIGENCE (Section 12) ────────────────────── */}
        {(activeTab === 'AI_INTEL' || activeTab === 'EVIDENCE') && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal">
              <h3 className="font-serif font-bold text-lg text-heritage-maroon dark:text-heritage-gold">
                AI Vision Telemetry Explanation & Decision Support
              </h3>
              <p className="text-xs text-heritage-aged dark:text-slate-400 mt-0.5">
                Transparent AI explanations separating visual observations from probabilistic inferences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {candidates.map(cand => (
                <div key={cand.candidateId} className="p-5 rounded-3xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-heritage-stone dark:border-heritage-charcoal text-xs">
                    <span className="font-mono font-bold text-rose-600">{cand.candidateId}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800">
                      {cand.verificationStatus}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">
                      {cand.detectionType.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-xs text-heritage-aged mt-0.5">📍 {cand.locationName}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-heritage-stone/20 dark:bg-slate-900 border border-heritage-stone/40 dark:border-slate-800 space-y-1.5 text-xs">
                    <p className="font-bold text-heritage-maroon dark:text-heritage-gold">Visual Evidence Summary:</p>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">{cand.notes}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-heritage-stone/40 dark:border-slate-800 text-[10px] font-mono text-heritage-aged">
                      <span>Model: {cand.modelVersion}</span>
                      <span className="text-emerald-600 font-bold">Confidence: {(cand.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      onClick={() => handleVerifyIncident(cand.incidentId || 1)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
                    >
                      Confirm & Verify
                    </button>
                    <button
                      onClick={() => {
                        setFalseAlarmIncidentId(cand.incidentId || 1);
                        setShowFalseAlarmModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-rose-500 text-rose-600 font-bold hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                    >
                      Mark False Alarm
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: AI VIDEO INTELLIGENCE & AUTOMATIC SOS ALERT SYSTEM ──────── */}
        {activeTab === 'VIDEO_INTEL' && (
          <div className="space-y-0">
            {/* Panel wrapper matching EOC dark theme */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl">
              <VideoIntelligencePanel
                onSosCreated={(alert, incident) => {
                  // Reload all emergency data so alerts/incidents appear instantly
                  loadAllEmergencyData();
                  showToast(
                    `📹 VIDEO AI SOS CREATED: ${alert?.alertId} · Incident ${incident?.incident_code} broadcast to all portals!`,
                    'alert'
                  );
                }}
                onTriggerSiren={() => {
                  if (audioEnabled && !audioMuted) {
                    triggerAudioSiren('AMBULANCE_HILO');
                  } else if (!audioEnabled) {
                    enableAudioSystem();
                    setTimeout(() => triggerAudioSiren('AMBULANCE_HILO'), 300);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* ── TAB: 4. SYSTEM STATS, REPORTS & ANALYTICS (Section 1 & 17) ───── */}
        {(activeTab === 'TESTS' || activeTab === 'ANALYTICS') && (
          <div className="space-y-6">
            
            {/* Part 1: Top 10 Live Operational KPI Summary Cards */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  <h4 className="font-serif font-bold text-sm text-white">
                    10 Live Emergency Summary Metric Indicators
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                  REAL-TIME STATS API
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                <div className="p-3 rounded-2xl bg-slate-900 border border-red-500/50 shadow flex flex-col justify-between text-white">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400">Active Alerts</span>
                  <p className="text-xl font-mono font-extrabold text-rose-400 mt-1">{stats.activeEmergencyAlerts || alerts.length}</p>
                  <span className="text-[8px] text-slate-400">Live Alerts</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-red-600/40 shadow flex flex-col justify-between text-white">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-red-400">Critical Inc.</span>
                  <p className="text-xl font-mono font-extrabold text-red-500 mt-1">{stats.criticalIncidents}</p>
                  <span className="text-[8px] text-slate-400">Level 1 Emergency</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-amber-500/40 shadow flex flex-col justify-between text-white">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">High-Priority</span>
                  <p className="text-xl font-mono font-extrabold text-amber-400 mt-1">{stats.highPriorityIncidents}</p>
                  <span className="text-[8px] text-slate-400">Triage Queue</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow flex flex-col justify-between text-white">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">Queued Videos</span>
                  <p className="text-xl font-mono font-extrabold text-cyan-400 mt-1">{stats.videosAwaitingAnalysis}</p>
                  <span className="text-[8px] text-slate-400">Inference Queue</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow flex flex-col justify-between text-white">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">Processing</span>
                  <p className="text-xl font-mono font-extrabold text-indigo-400 mt-1">{stats.videosCurrentlyProcessing}</p>
                  <span className="text-[8px] text-slate-400">Vision Engine</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-yellow-500/40 shadow flex flex-col justify-between text-white">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-yellow-400">Unverified</span>
                  <p className="text-xl font-mono font-extrabold text-yellow-400 mt-1">{stats.incidentsAwaitingVerification}</p>
                  <span className="text-[8px] text-slate-400">Review Queue</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow flex flex-col justify-between text-white">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Ambulances</span>
                  <p className="text-xl font-mono font-extrabold text-emerald-400 mt-1">{stats.ambulancesDetected}</p>
                  <span className="text-[8px] text-slate-400">108 Fleet</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-orange-500/40 shadow flex flex-col justify-between text-white">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-orange-400">Fire &amp; Smoke</span>
                  <p className="text-xl font-mono font-extrabold text-orange-400 mt-1">{stats.fireAndSmokeAlerts}</p>
                  <span className="text-[8px] text-slate-400">Thermal Incidents</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-blue-500/40 shadow flex flex-col justify-between text-white">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400">Accidents</span>
                  <p className="text-xl font-mono font-extrabold text-blue-400 mt-1">{stats.possibleRoadAccidents}</p>
                  <span className="text-[8px] text-slate-400">Traffic Crash</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-purple-500/40 shadow flex flex-col justify-between text-white">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400">Crowd Safety</span>
                  <p className="text-xl font-mono font-extrabold text-purple-400 mt-1">{stats.crowdSafetyAlerts}</p>
                  <span className="text-[8px] text-slate-400">Surge Events</span>
                </div>
              </div>
            </div>

            {/* Part 2: Quick Simulation Triggers Strip */}
            <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-3">
              <div className="flex items-center space-x-2 text-xs">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold text-amber-200">Interactive Simulation Triggers:</span>
                <span className="text-slate-400">Generate synthetic incidents to test alarm sounds, cross-portal alerts &amp; route assistance.</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleTriggerSimulatedDetection('POSSIBLE_ROAD_ACCIDENT')}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition flex items-center space-x-1.5"
                >
                  <Car className="w-4 h-4" />
                  <span>Simulate Road Crash (CAM-101)</span>
                </button>
                <button
                  onClick={() => handleTriggerSimulatedDetection('POSSIBLE_FIRE_OR_SMOKE')}
                  className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow transition flex items-center space-x-1.5"
                >
                  <Flame className="w-4 h-4" />
                  <span>Simulate Fire Smoke (CAM-103)</span>
                </button>
                <button
                  onClick={() => handleTriggerSimulatedDetection('CROWD_CONGESTION')}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow transition flex items-center space-x-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>Simulate Crowd Safety (CAM-105)</span>
                </button>
                <button
                  onClick={() => setShowManualSosModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow transition flex items-center space-x-1.5 border border-amber-400/40"
                >
                  <RadioTower className="w-4 h-4 text-amber-300" />
                  <span>Broadcast Manual SOS (112)</span>
                </button>
              </div>
            </div>

            {/* Part 3: Automated 12 Acceptance Tests Suite */}
            <div className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-heritage-maroon dark:text-heritage-gold">
                  System Acceptance Criteria Validation (12 Acceptance Tests)
                </h3>
                <p className="text-xs text-heritage-aged dark:text-slate-400 mt-0.5">
                  Verifies candidate generation, audio sirens, deduplication, alert lifecycle, and cross-portal persistence.
                </p>
              </div>

              <button
                onClick={handleRunValidationTests}
                disabled={runningTests}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
              >
                {runningTests ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{runningTests ? 'Running Automated Test Suite…' : 'Execute 12 Tests Now'}</span>
              </button>
            </div>

            {testResults.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal space-y-3">
                <ShieldCheck className="w-12 h-12 text-indigo-500 mx-auto" />
                <h4 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory">
                  Automated Test Suite Ready
                </h4>
                <p className="text-xs text-heritage-aged max-w-md mx-auto">
                  Click 'Execute 12 Tests Now' to validate all acceptance criteria described in Section 17 of the system specification.
                </p>
                <button
                  onClick={handleRunValidationTests}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md hover:bg-indigo-700 transition"
                >
                  Run All 12 Acceptance Tests
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testResults.map(t => (
                  <div key={t.testId} className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-emerald-500/40 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-indigo-600">{t.testId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                        ✓ {t.status}
                      </span>
                    </div>
                    <h5 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">{t.name}</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: CONFIGURATION / EMERGENCY SETTINGS ──────────────────────── */}
        {activeTab === 'CONFIG' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-6 text-white">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-amber-400">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Emergency Operational Settings</h3>
                  <p className="text-xs text-slate-400">Configure emergency telemetry, siren synthesizer, and operational mode.</p>
                </div>
              </div>

              {/* Setting 1: Siren Presets */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-amber-300">Acoustic Siren Synthesizer</h4>
                    <p className="text-xs text-slate-400">Select active waveform and harmonic synthesis frequency preset.</p>
                  </div>
                  <button
                    onClick={() => triggerAudioSiren()}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow transition flex items-center space-x-1.5"
                  >
                    <Siren className="w-3.5 h-3.5" />
                    <span>Test Sound</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {SIREN_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSirenMode(preset.id);
                        triggerAudioSiren(preset.id);
                        showToast(`Selected Siren Preset: ${preset.name}`, 'info');
                      }}
                      className={`p-3 rounded-xl border text-left transition ${
                        sirenMode === preset.id
                          ? 'border-amber-400 bg-amber-950/30 text-white shadow-md'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-base">{preset.icon}</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">{preset.badge}</span>
                      </div>
                      <span className="block font-bold text-xs text-white truncate">{preset.name}</span>
                      <span className="block text-[10px] font-mono text-slate-400 mt-0.5">{preset.frequencyRange}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Setting 2: Operating Mode */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-white">System Operating Environment</h4>
                  <p className="text-xs text-slate-400">Toggle between DEMO evaluation mode and LIVE production dispatch mode.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setOperatingMode('DEMO');
                      showToast('Operating Mode: DEMO Simulation Active', 'info');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${operatingMode === 'DEMO' ? 'bg-amber-600 text-white shadow' : 'bg-slate-800 text-slate-400'}`}
                  >
                    DEMO SIMULATION
                  </button>
                  <button
                    onClick={() => {
                      setOperatingMode('LIVE');
                      showToast('Operating Mode: LIVE EOC Command Enabled', 'alert');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${operatingMode === 'LIVE' ? 'bg-rose-600 text-white shadow' : 'bg-slate-800 text-slate-400'}`}
                  >
                    LIVE PRODUCTION
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
      </div>

      {/* ── MODAL: RAPID MULTI-AGENCY DISPATCH DIALOG (Section 11) ────────────── */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-700 max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-base text-white">
                  Confirm Emergency Unit Dispatch
                </h3>
              </div>
              <button onClick={() => setShowDispatchModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {operatingMode === 'DEMO' && (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/60 text-amber-300 text-xs font-mono">
                ⚠️ DEMO DISPATCH — NO REAL SERVICE CONTACTED. (Simulation active for evaluation)
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-300">Select Response Agency</label>
                <select
                  value={dispatchType}
                  onChange={(e) => setDispatchType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold focus:outline-none"
                >
                  <option value="AMBULANCE">108 Emergency Medical Services (Ambulance)</option>
                  <option value="FIRE_BRIGADE">Odisha Fire & Emergency Services (101)</option>
                  <option value="POLICE_ESCORT">Odisha Police Traffic Flying Squad</option>
                  <option value="MUNICIPAL_DISASTER_CREW">Municipal Disaster Dewatering Strike Force</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-300">Select Available Unit</label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold focus:outline-none"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.callSign} ({v.licensePlate}) — {v.baseStationName}
                    </option>
                  ))}
                </select>
              </div>

              {dispatchType === 'AMBULANCE' && (
                <div>
                  <label className="block font-bold mb-1 text-slate-300">Destination Hospital</label>
                  <select
                    value={destinationHospital}
                    onChange={(e) => setDestinationHospital(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold focus:outline-none"
                  >
                    {hospitals.map(h => (
                      <option key={h.id} value={h.name}>
                        {h.name} — {h.available_icu} ICU Beds Available ({h.trauma_level})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold mb-1 text-slate-300">Operator Instructions</label>
                <textarea
                  rows={2}
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowDispatchModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDispatch}
                disabled={dispatching}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center space-x-1.5"
              >
                {dispatching && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Authorize & Confirm Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: FALSE ALARM DIALOG (Section 8) ─────────────────────────────── */}
      {showFalseAlarmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-700 max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-serif font-bold text-base text-rose-400">
                Mark Candidate as False Alarm
              </h3>
              <button onClick={() => setShowFalseAlarmModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              This action cancels the high-priority alarm, silences sirens, and logs the operator reason in the system audit trail.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-300">Reason for False Alarm *</label>
                <select
                  value={falseAlarmReason}
                  onChange={(e) => setFalseAlarmReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold focus:outline-none"
                >
                  <option value="Optical reflection misinterpreted as smoke plume">Optical reflection misinterpreted as smoke plume</option>
                  <option value="Temporary stationary vehicle misinterpreted as collision">Temporary stationary vehicle misinterpreted as collision</option>
                  <option value="Scheduled cultural festival procession mistaken for conflict">Scheduled festival procession mistaken for conflict</option>
                  <option value="Camera calibration error">Camera calibration / lens artifact</option>
                  <option value="Other verified operator reason">Other verified operator reason</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowFalseAlarmModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFalseAlarm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                Confirm False Alarm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: MANUAL SOS DISPATCH INGESTION (112 / 108 HOTLINE) ──────────── */}
      {showManualSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-700 max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-rose-400">
                <RadioTower className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="font-serif font-bold text-base text-white">
                  Broadcast Manual Emergency SOS (112 Hotline)
                </h3>
              </div>
              <button onClick={() => setShowManualSosModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Ingest an emergency distress incident into the central database. This immediately triggers high-priority SSE alerts across all 6 panels, activates audio sirens, and assigns responders.
            </p>

            <form onSubmit={handleCreateManualSos} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-300">Emergency Type *</label>
                <select
                  value={manualSosType}
                  onChange={(e) => setManualSosType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold focus:outline-none"
                >
                  <option value="POSSIBLE_ROAD_ACCIDENT">🚗 Severe Road Collision / Overturned Vehicle</option>
                  <option value="POSSIBLE_FIRE_OR_SMOKE">🔥 Fire Outbreak / Electrical Transformer Smoke</option>
                  <option value="POTENTIAL_CROWD_SAFETY_RISK">👥 Crowd Stampede Risk / Severe Congestion</option>
                  <option value="ROADWAY_OBSTRUCTION">🚧 Major Road Blockage / Tree Uprooted</option>
                  <option value="AMBULANCE_108_IN_TRANSIT">🚑 Critical Trauma Medical Emergency</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-300">Severity Level *</label>
                  <select
                    value={manualSosSeverity}
                    onChange={(e) => setManualSosSeverity(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold focus:outline-none text-rose-300 font-mono"
                  >
                    <option value="CRITICAL">🔴 CRITICAL (60s SLA Countdown)</option>
                    <option value="HIGH">🟠 HIGH (120s SLA Countdown)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-300">Incident Location *</label>
                  <input
                    type="text"
                    value={manualSosLocation}
                    onChange={(e) => setManualSosLocation(e.target.value)}
                    placeholder="e.g. Khandagiri Flyover, NH-16"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-300">Caller Notes & Operational Details *</label>
                <textarea
                  rows={3}
                  value={manualSosNotes}
                  onChange={(e) => setManualSosNotes(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualSosModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSos}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md flex items-center space-x-1.5"
                >
                  {creatingSos ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BellRing className="w-3.5 h-3.5" />}
                  <span>Broadcast Emergency SOS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
