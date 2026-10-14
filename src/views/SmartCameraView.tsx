import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CameraSource } from '../types';
import { KonarkWheelIcon } from '../components/OdishaMotifs';
import {
  Camera,
  Eye,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Video,
  Layers,
  Cpu
} from 'lucide-react';

export const SmartCameraView: React.FC = () => {
  const { language } = useApp();
  const [cameras, setCameras] = useState<CameraSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCam, setSelectedCam] = useState<CameraSource | null>(null);

  const fetchCameras = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/cameras');
      if (res.ok) {
        const data = await res.json();
        setCameras(data);
        if (data.length > 0 && !selectedCam) setSelectedCam(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-heritage-stone dark:border-heritage-charcoal pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Camera className="w-7 h-7 text-heritage-maroon dark:text-heritage-gold" />
            <h1 className="font-serif font-bold text-2xl text-heritage-maroon dark:text-heritage-gold">
              Smart Camera &amp; Computer Vision Intelligence
            </h1>
          </div>
          <p className="text-xs text-heritage-aged dark:text-heritage-stone/80 mt-1 font-sans">
            Automated YOLO object detection, vehicle flow estimation, and candidate hazard extraction across city corridors.
          </p>
        </div>

        <button
          onClick={fetchCameras}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-heritage-stone bg-white dark:bg-heritage-charcoal text-xs font-semibold hover:border-heritage-gold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feeds</span>
        </button>
      </div>

      {/* Two-Column Layout: Feeds Grid + Active CV Stream Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Municipal Cameras List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory pb-2 border-b border-heritage-stone">
            Authorized CCTV Video Sources ({cameras.length})
          </h3>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {cameras.map(c => {
              const isSelected = selectedCam?.id === c.id;
              const hasAlert = c.active_detections?.some((d: any) => d.detection_type.includes('WATERLOGGING') || d.detection_type.includes('CONGESTION'));

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCam(c)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left space-y-2 ${
                    isSelected
                      ? 'border-heritage-gold bg-white dark:bg-heritage-charcoal shadow-heritage ring-2 ring-heritage-gold'
                      : 'border-heritage-stone/70 dark:border-heritage-charcoal/80 bg-heritage-ivory/50 dark:bg-heritage-charcoal-dark hover:border-heritage-gold'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-heritage-maroon dark:text-heritage-gold">
                      {c.camera_code}
                    </span>
                    <span className="flex items-center space-x-1.5 text-heritage-green font-bold text-[10px]">
                      <span className="w-2 h-2 rounded-full bg-heritage-green animate-pulse" />
                      <span>{c.status}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-heritage-charcoal dark:text-heritage-ivory">
                      {c.location_name}
                    </h4>
                    <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                      {c.supported_types?.map((t: string, idx: number) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-heritage-stone/50 dark:bg-heritage-charcoal text-heritage-aged">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {hasAlert && (
                    <div className="p-1.5 rounded-lg bg-heritage-red/10 border border-heritage-red/30 text-heritage-red text-[11px] font-semibold flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>CV Alert: Candidate Hazard Identified</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Computer Vision Live Inspection Surface (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-5 shadow-heritage space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-heritage-stone">
            <div>
              <span className="text-[10px] font-mono font-bold text-heritage-gold uppercase">
                OPENCV / YOLO DETECTION OVERLAY
              </span>
              <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory">
                {selectedCam?.location_name || "Rasulgarh Junction"}
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-heritage-maroon text-heritage-gold">
              {selectedCam?.camera_code}
            </span>
          </div>

          {/* Simulated Video Frame with Bounding Boxes */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-heritage-stone aspect-video flex items-center justify-center">
            {/* Background frame image */}
            <img
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"
              alt="Live Camera Feed"
              className="w-full h-full object-cover opacity-75"
            />

            {/* Bounding Box Overlay 1 */}
            <div className="absolute top-[45%] left-[25%] w-[40%] h-[35%] border-2 border-heritage-red rounded bg-heritage-red/20 flex flex-col justify-between p-1 text-[10px] text-white font-mono font-bold shadow-lg">
              <span>WATERLOGGING_CLUSTER [0.94]</span>
              <span className="text-[9px] bg-heritage-red px-1 rounded self-start">Depth: ~35cm</span>
            </div>

            {/* Bounding Box Overlay 2 */}
            <div className="absolute top-[50%] left-[38%] w-[18%] h-[24%] border-2 border-heritage-gold rounded bg-heritage-gold/20 p-1 text-[10px] text-white font-mono font-bold">
              <span>STRANDED_CAR [0.91]</span>
            </div>

            {/* Live Camera Watermark */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono text-heritage-stone flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span>LIVE • 24 FPS • OD-POLICE-SURVEILLANCE</span>
            </div>
          </div>

          {/* Inference Findings */}
          <div className="p-4 rounded-xl bg-heritage-ivory/60 dark:bg-heritage-charcoal-dark border border-heritage-stone text-xs space-y-2">
            <h4 className="font-bold text-heritage-maroon dark:text-heritage-gold flex items-center space-x-1.5">
              <Cpu className="w-4 h-4" />
              <span>Real-Time CV Inference Output</span>
            </h4>
            <p className="text-heritage-charcoal dark:text-heritage-stone leading-relaxed">
              Detection model identifies 75% lane obstruction at Rasulgarh Underpass due to stormwater pooling. Candidate incident matched with citizen report REP-OD-2026-001. Human operator verification confirmed.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
