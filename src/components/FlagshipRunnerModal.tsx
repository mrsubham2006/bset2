import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  X,
  ArrowRight,
  ShieldCheck,
  Truck,
  Droplets,
  Bell,
  MapPin
} from 'lucide-react';
import { KonarkWheelIcon, IkatPatternDivider } from './OdishaMotifs';

interface FlagshipRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const FlagshipRunnerModal: React.FC<FlagshipRunnerModalProps> = ({
  isOpen,
  onClose,
  onRefreshData
}) => {
  const { language, showToast } = useApp();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [runningAll, setRunningAll] = useState(false);
  const [stepLogs, setStepLogs] = useState<{ step: number; msg: string; time: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const stepsInfo = [
    { num: 1, title: "Citizen Report Submission", desc: "Citizen Debabrata Mohanty submits report REP-OD-2026-001 with photo at Rasulgarh Underpass." },
    { num: 2, title: "Backend Persistence & ID", desc: "Backend stores report into SQLite DB and generates provisional incident INC-OD-FLAGSHIP-01." },
    { num: 3, title: "AI Intelligence Classification", desc: "Gemini / AI engine analyzes report: classifies as Waterlogging, recommends Drainage & Flood Management." },
    { num: 4, title: "Nearby Corroborating Reports", desc: "2 additional citizen reports arrive within 150m at Rasulgarh Service Road and Pillar 14." },
    { num: 5, title: "Duplicate Correlation Engine", desc: "Spatial Haversine engine suggests correlation cluster (96% confidence); escalates priority score to 86 (CRITICAL)." },
    { num: 6, title: "Operator Verification", desc: "City Command Center operator verifies incident authenticity and confirms multi-report cluster." },
    { num: 7, title: "Municipal Department Routing", desc: "Incident routed to Drainage Dept. Automated work task generated with 2-hour emergency SLA." },
    { num: 8, title: "Field Worker Acceptance", desc: "Field Worker 'Bikash Mohapatra' accepts task on mobile terminal and activates 50 HP pump team." },
    { num: 9, title: "Traffic Restriction Recorded", desc: "Traffic Police logs active road restriction for NH-16 Rasulgarh Underpass northbound lanes." },
    { num: 10, title: "Command Center Display", desc: "Command Center map renders waterlogging marker, blocked roadway polyline, and live telemetry." },
    { num: 11, title: "Emergency Ambulance Dispatched", desc: "108 Emergency Ambulance Lifeline departs Hanspal carrying cardiac patient to AIIMS Bhubaneswar." },
    { num: 12, title: "Intelligent Detour Recalculation", desc: "Routing engine detects Rasulgarh flood block and recalculates alternative route via Vani Vihar bypass (saves 19 mins)." },
    { num: 13, title: "Emergency Coordinator Authorization", desc: "Emergency Coordinator verifies detour. Traffic Marshals synchronize green corridor." },
    { num: 14, title: "Field Worker Uploads Proof", desc: "Field Worker clears clogged trash grate, runs pumps, and uploads completion photo showing dry pavement." },
    { num: 15, title: "Supervisor Inspection & Approval", desc: "Department Supervisor reviews photographic proof, approves completion, and resolves incident." },
    { num: 16, title: "Road Restriction Cleared", desc: "Traffic control lifts road closure on NH-16 Rasulgarh. Normal traffic flow restored." },
    { num: 17, title: "Citizen Notification Dispatched", desc: "Citizen Debabrata Mohanty receives SMS/app notification with resolution proof and gratitude." },
    { num: 18, title: "Audit Trail & Analytics Synchronized", desc: "Full operational audit log generated. Median response time and departmental KPIs updated." }
  ];

  const runStep = async (stepNum: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/flagship/step/${stepNum}`, { method: 'POST' });
      const data = await res.json();
      setCurrentStep(stepNum);
      const logEntry = {
        step: stepNum,
        msg: data.message || `Step ${stepNum} executed successfully`,
        time: new Date().toLocaleTimeString()
      };
      setStepLogs(prev => [logEntry, ...prev]);
      showToast(logEntry.msg, 'success');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
      showToast(`Error executing Step ${stepNum}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const runAllSequence = async () => {
    setRunningAll(true);
    for (let i = 1; i <= 18; i++) {
      await runStep(i);
      await new Promise(r => setTimeout(r, 700));
    }
    setRunningAll(false);
    showToast("Flagship 18-step demonstration finished successfully!", 'success');
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/v1/flagship/reset', { method: 'POST' });
      setCurrentStep(0);
      setStepLogs([]);
      showToast("Flagship demonstration reset to initial state", 'info');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-heritage-ivory dark:bg-heritage-charcoal-dark border border-heritage-stone dark:border-heritage-charcoal rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-heritage-stone dark:border-heritage-charcoal flex items-center justify-between bg-gradient-to-r from-heritage-maroon to-heritage-red text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-heritage-maroon-dark text-heritage-gold shadow-md">
              <KonarkWheelIcon size={32} className="text-heritage-gold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
                  Flagship End-to-End Smart City Scenario
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-heritage-gold text-heritage-charcoal">
                  18 STEPS
                </span>
              </div>
              <p className="text-xs text-heritage-stone/90 mt-0.5">
                Flooding at Rasulgarh Underpass blocks NH-16 and threatens an emergency ambulance route to AIIMS.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-heritage-maroon-dark text-heritage-stone hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar & Global Controls */}
        <div className="p-4 bg-white/70 dark:bg-heritage-charcoal border-b border-heritage-stone dark:border-heritage-charcoal flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
            <span className="text-xs font-bold text-heritage-maroon dark:text-heritage-gold">
              Progress: Step {currentStep} / 18
            </span>
            <div className="flex-1 h-3 rounded-full bg-heritage-stone dark:bg-heritage-charcoal-dark overflow-hidden border border-heritage-stone dark:border-heritage-charcoal">
              <div
                className="h-full bg-gradient-to-r from-heritage-gold to-heritage-green transition-all duration-300"
                style={{ width: `${(currentStep / 18) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-heritage-aged">
              {Math.round((currentStep / 18) * 100)}%
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={runAllSequence}
              disabled={runningAll || isLoading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-heritage-maroon hover:bg-heritage-maroon-dark text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 text-heritage-gold fill-current" />
              <span>{runningAll ? "Running Sequence..." : "Run All 18 Steps"}</span>
            </button>
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal-dark hover:border-heritage-red text-heritage-charcoal dark:text-heritage-stone text-xs font-medium transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-heritage-red" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Two-Column Layout: Steps List + Live Execution Telemetry */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: 18 Interactive Steps */}
          <div className="lg:col-span-7 p-4 overflow-y-auto max-h-[58vh] divide-y divide-heritage-stone/40 dark:divide-heritage-charcoal">
            {stepsInfo.map(s => {
              const isDone = currentStep >= s.num;
              const isCurrent = currentStep === s.num;

              return (
                <div
                  key={s.num}
                  className={`py-2.5 px-2.5 rounded-xl transition-all flex items-start justify-between gap-3 ${
                    isCurrent
                      ? 'bg-heritage-gold/20 dark:bg-heritage-gold/10 border border-heritage-gold'
                      : isDone
                      ? 'bg-heritage-green/5 dark:bg-heritage-green/10'
                      : 'hover:bg-white/40 dark:hover:bg-heritage-charcoal/40'
                  }`}
                >
                  <div className="flex items-start space-x-2.5 flex-1">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        isDone
                          ? 'bg-heritage-green text-white'
                          : isCurrent
                          ? 'bg-heritage-gold text-heritage-charcoal'
                          : 'bg-heritage-stone dark:bg-heritage-charcoal text-heritage-aged'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                    </span>
                    <div>
                      <h5 className="font-bold text-xs text-heritage-charcoal dark:text-heritage-ivory flex items-center space-x-2">
                        <span>{s.title}</span>
                        {isDone && <span className="text-[10px] text-heritage-green font-semibold">✓ Completed</span>}
                      </h5>
                      <p className="text-[11px] text-heritage-aged dark:text-heritage-stone/80 mt-0.5 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => runStep(s.num)}
                    disabled={isLoading || runningAll}
                    className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      isDone
                        ? 'border border-heritage-stone dark:border-heritage-charcoal text-heritage-aged hover:text-heritage-charcoal'
                        : 'bg-heritage-maroon text-heritage-gold hover:brightness-110 shadow-sm'
                    }`}
                  >
                    {isDone ? "Re-run" : "Run Step"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right Column: Live Operational Telemetry Logs */}
          <div className="lg:col-span-5 p-4 border-t lg:border-t-0 lg:border-l border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory/60 dark:bg-heritage-charcoal/30 flex flex-col justify-between max-h-[58vh]">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-heritage-stone dark:border-heritage-charcoal">
                <h4 className="font-serif font-bold text-xs text-heritage-maroon dark:text-heritage-gold uppercase tracking-wider">
                  Live Execution Telemetry
                </h4>
                <span className="text-[10px] text-heritage-aged">{stepLogs.length} events logged</span>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[46vh] pr-1">
                {stepLogs.length === 0 ? (
                  <div className="text-center py-12 text-heritage-aged text-xs">
                    <Zap className="w-8 h-8 mx-auto text-heritage-gold/50 mb-2" />
                    Click "Run All 18 Steps" or any individual step to begin the real-time operational workflow.
                  </div>
                ) : (
                  stepLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white dark:bg-heritage-charcoal border border-heritage-stone/60 dark:border-heritage-charcoal/80 text-xs shadow-sm"
                    >
                      <div className="flex items-center justify-between text-[10px] text-heritage-aged mb-1">
                        <span className="font-bold text-heritage-maroon dark:text-heritage-gold">
                          STEP {log.step} VERIFIED
                        </span>
                        <span>{log.time}</span>
                      </div>
                      <p className="text-heritage-charcoal dark:text-heritage-stone text-[11px] font-medium leading-relaxed">
                        {log.msg}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-heritage-stone dark:border-heritage-charcoal text-[11px] text-heritage-aged">
              <span className="font-semibold text-heritage-green">✔ Real Database Persistence: </span>
              Every action writes to SQLite tables, computes actual spatial Haversine distances, updates Leaflet markers, and notifies citizens.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
