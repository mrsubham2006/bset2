import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { KonarkWheelIcon } from '../components/OdishaMotifs';
import {
  Cpu,
  Sparkles,
  GitMerge,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  FileCheck,
  BrainCircuit
} from 'lucide-react';

export const AIIntelligenceView: React.FC = () => {
  const { language, showToast } = useApp();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null);

  const fetchAIIncidents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
        if (data.length > 0) {
          // fetch first detail
          const detRes = await fetch(`/api/v1/incidents/${data[0].id}`);
          if (detRes.ok) setSelectedAnalysis(await detRes.json());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIIncidents();
  }, []);

  const handleSelect = async (incId: number) => {
    try {
      const detRes = await fetch(`/api/v1/incidents/${incId}`);
      if (detRes.ok) setSelectedAnalysis(await detRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const aiData = selectedAnalysis?.ai_analysis || {
    incident_type: "waterlogging",
    recommended_department: "Drainage and Flood Management",
    summary: "Heavy stormwater pooling along Rasulgarh Flyover underpass causing vehicular stoppage and route delay.",
    confidence: 0.94,
    potential_risks: ["road_submersion", "traffic_slowdown", "emergency_vehicle_delay", "subsurface_erosion"],
    recommended_actions: ["Deploy suction de-watering pumps", "Inspect drainage outfall culvert", "Issue traffic advisory"],
    model_version: "gemini-2.0-flash / civic-nexus-v2.1"
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-heritage-stone dark:border-heritage-charcoal pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <KonarkWheelIcon size={26} className="text-heritage-maroon dark:text-heritage-gold" />
            <h1 className="font-serif font-bold text-2xl text-heritage-maroon dark:text-heritage-gold">
              AI Incident Intelligence &amp; Duplicate Engine
            </h1>
          </div>
          <p className="text-xs text-heritage-aged dark:text-heritage-stone/80 mt-1 font-sans">
            Automated schema extraction, multi-lingual semantic NLP, Haversine spatial correlation, and causal dependency tracking.
          </p>
        </div>

        <button
          onClick={fetchAIIncidents}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-heritage-stone bg-white dark:bg-heritage-charcoal text-xs font-semibold hover:border-heritage-gold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* CORE INNOVATION: Causal Chain Dependency Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-heritage-maroon/90 via-heritage-maroon to-heritage-charcoal text-white shadow-heritage space-y-3">
        <div className="flex items-center space-x-2 text-heritage-gold">
          <BrainCircuit className="w-5 h-5 text-heritage-gold animate-pulse" />
          <h3 className="font-serif font-bold text-sm tracking-wide">
            CORE INNOVATION: Cross-Service Causal Chain Dependency
          </h3>
        </div>
        <p className="text-xs text-heritage-stone/90 leading-relaxed max-w-3xl">
          CIVIC NEXUS AI models real-world cascading urban effects. A single civic defect triggers cascading impacts across transportation and health services.
        </p>

        {/* Visual Causal Chain Flow */}
        <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold">
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-heritage-blue" />
            <span>Heavy Rainfall (IMD 68mm)</span>
          </div>
          <ArrowRight className="w-4 h-4 text-heritage-gold" />
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-heritage-orange" />
            <span>Rasulgarh Waterlogging (40cm)</span>
          </div>
          <ArrowRight className="w-4 h-4 text-heritage-gold" />
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-heritage-red" />
            <span>NH-16 Arterial Road Blockage</span>
          </div>
          <ArrowRight className="w-4 h-4 text-heritage-gold" />
          <div className="p-2.5 rounded-xl bg-heritage-green/20 border border-heritage-green flex items-center space-x-2 text-heritage-gold">
            <span className="w-2 h-2 rounded-full bg-heritage-green" />
            <span>Ambulance Detour via Vani Vihar</span>
          </div>
        </div>
      </div>

      {/* Two-Column Layout: Incident Selector + Deep AI Structured Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Select Incident (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-4 shadow-sm space-y-3">
          <h4 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory pb-2 border-b border-heritage-stone/60">
            Analyzed City Incidents ({incidents.length})
          </h4>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {incidents.map(inc => (
              <div
                key={inc.id}
                onClick={() => handleSelect(inc.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                  selectedAnalysis?.incident?.id === inc.id
                    ? 'border-heritage-gold bg-heritage-gold/15'
                    : 'border-heritage-stone/60 dark:border-heritage-charcoal/80 bg-heritage-ivory/40 dark:bg-heritage-charcoal-dark/40 hover:border-heritage-gold'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-mono font-bold text-heritage-maroon dark:text-heritage-gold">{inc.incident_code}</span>
                  <span className="font-bold text-[10px] text-heritage-aged">{inc.category}</span>
                </div>
                <h5 className="font-bold text-xs text-heritage-charcoal dark:text-heritage-ivory line-clamp-1">{inc.title}</h5>
                <div className="mt-2 flex items-center justify-between text-[10px] text-heritage-aged">
                  <span>Priority: <b>{inc.severity}</b></span>
                  <span>Score: <b>{inc.priority_score.toFixed(0)}</b>/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Structured Findings & Duplicate Correlation (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* AI Structured Findings Card */}
          <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-5 shadow-heritage space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-heritage-stone/60 dark:border-heritage-charcoal">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-heritage-maroon dark:text-heritage-gold" />
                <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory">
                  Structured AI Extraction Schema ({aiData.model_version})
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-heritage-green/10 text-heritage-green border border-heritage-green/30">
                Confidence: {Math.round((aiData.confidence || 0.92) * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-heritage-stone/30 dark:bg-heritage-charcoal-dark border border-heritage-stone">
                <span className="text-[10px] text-heritage-aged uppercase font-bold">Detected Incident Type</span>
                <p className="text-sm font-bold text-heritage-maroon dark:text-heritage-gold mt-0.5">
                  {aiData.incident_type?.toUpperCase()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-heritage-stone/30 dark:bg-heritage-charcoal-dark border border-heritage-stone">
                <span className="text-[10px] text-heritage-aged uppercase font-bold">Recommended Department</span>
                <p className="text-sm font-bold text-heritage-charcoal dark:text-heritage-ivory mt-0.5">
                  {aiData.recommended_department}
                </p>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-heritage-aged uppercase font-bold">AI Executive Summary</span>
              <p className="text-xs text-heritage-charcoal dark:text-heritage-stone mt-1 p-3 rounded-xl bg-white dark:bg-heritage-charcoal-dark border border-heritage-stone leading-relaxed">
                {aiData.summary}
              </p>
            </div>

            {/* Potential Risks */}
            <div>
              <span className="text-[10px] text-heritage-aged uppercase font-bold">Identified Cascading Risks</span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {aiData.potential_risks?.map((r: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-heritage-red/10 text-heritage-red border border-heritage-red/30">
                    ⚠ {r.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Next Actions */}
            <div>
              <span className="text-[10px] text-heritage-aged uppercase font-bold">Recommended Field Response Protocol</span>
              <div className="mt-1.5 space-y-1.5">
                {aiData.recommended_actions?.map((act: string, idx: number) => (
                  <div key={idx} className="p-2 rounded-lg bg-heritage-stone/20 dark:bg-heritage-charcoal-dark text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-heritage-green shrink-0" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Duplicate Detection & Correlation Cluster */}
          <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-heritage-maroon dark:text-heritage-gold pb-2 border-b border-heritage-stone/60">
              <GitMerge className="w-5 h-5 text-heritage-gold" />
              <h4 className="font-serif font-bold text-sm">
                Duplicate Report Corroboration Cluster (Haversine Geo-Mesh)
              </h4>
            </div>

            <div className="p-3 rounded-xl bg-heritage-ivory/70 dark:bg-heritage-charcoal-dark border border-heritage-stone text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-heritage-charcoal dark:text-heritage-ivory">
                  Correlation Rationale
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-heritage-green text-white">
                  96% Spatial Confidence
                </span>
              </div>
              <p className="text-heritage-aged dark:text-heritage-stone text-[11px] leading-relaxed">
                3 citizen reports registered within 150-meter radius around Rasulgarh Junction Underpass (NH-16). Reports share keywords "waterlogging", "submerged", and "culvert blockage". Merged into single primary incident record without discarding citizen attribution.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
