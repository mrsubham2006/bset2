import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Incident, Hospital, CameraSource, RoadRestriction, Department, AnalyticsData } from '../types';
import { SmartCityMap } from '../components/SmartCityMap';
import { KonarkWheelIcon } from '../components/OdishaMotifs';
import { PanelRoleAuth } from '../components/PanelRoleAuth';
import {
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  RefreshCw,
  Eye,
  Shield,
  Building,
  UserCheck,
  Zap,
  ArrowUpRight,
  X,
  FileText
} from 'lucide-react';

export const CommandCenterView: React.FC = () => {
  const { language, showToast } = useApp();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [cameras, setCameras] = useState<CameraSource[]>([]);
  const [restrictions, setRestrictions] = useState<RoadRestriction[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Selected Incident for Detail Drawer
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [incidentDetailData, setIncidentDetailData] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Assignment Modal / State
  const [assignDeptId, setAssignDeptId] = useState<number>(1);
  const [emergencyAlerts, setEmergencyAlerts] = useState<any[]>([]);
  const [clearanceRequests, setClearanceRequests] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [incRes, hospRes, camRes, restRes, deptRes, analRes, emAlertsRes, clrRes] = await Promise.all([
        fetch('/api/v1/incidents'),
        fetch('/api/v1/hospitals'),
        fetch('/api/v1/cameras'),
        fetch('/api/v1/road-restrictions'),
        fetch('/api/v1/departments'),
        fetch('/api/v1/analytics/overview'),
        fetch('/api/emergency/alerts'),
        fetch('/api/emergency/route-clearance-requests')
      ]);

      if (incRes.ok) setIncidents(await incRes.json());
      if (hospRes.ok) setHospitals(await hospRes.json());
      if (camRes.ok) setCameras(await camRes.json());
      if (restRes.ok) setRestrictions(await restRes.json());
      if (emAlertsRes.ok) setEmergencyAlerts(await emAlertsRes.json());
      if (clrRes.ok) setClearanceRequests(await clrRes.json());
      if (deptRes.ok) {
        const d = await deptRes.json();
        setDepartments(d);
        if (d.length > 0) setAssignDeptId(d[0].id);
      }
      if (analRes.ok) setAnalytics(await analRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleSync = () => {
      fetchDashboardData();
    };
    window.addEventListener('civic_sync_event', handleSync);
    return () => {
      window.removeEventListener('civic_sync_event', handleSync);
    };
  }, []);

  const handleSelectIncident = async (inc: Incident) => {
    setSelectedIncident(inc);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/v1/incidents/${inc.id}`);
      if (res.ok) {
        const data = await res.json();
        setIncidentDetailData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleVerifyIncident = async (verified: boolean) => {
    if (!selectedIncident) return;
    try {
      const res = await fetch(`/api/v1/incidents/${selectedIncident.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified })
      });
      if (res.ok) {
        showToast(verified ? "Incident verified successfully" : "Verification flagged for further audit", "success");
        fetchDashboardData();
        handleSelectIncident(selectedIncident);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignDepartment = async () => {
    if (!selectedIncident) return;
    try {
      const res = await fetch(`/api/v1/incidents/${selectedIncident.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department_id: assignDeptId, notes: "Automated routing from City Command Center" })
      });
      if (res.ok) {
        showToast("Assigned to municipal department and task created", "success");
        fetchDashboardData();
        handleSelectIncident(selectedIncident);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered incidents
  const filteredIncidents = incidents.filter(i => {
    if (severityFilter !== 'ALL' && i.severity !== severityFilter) return false;
    if (categoryFilter !== 'ALL' && i.category !== categoryFilter) return false;
    return true;
  });

  const kpis = analytics?.kpis || {
    total_incidents: incidents.length,
    active_incidents: incidents.filter(i => i.status !== 'RESOLVED').length,
    resolved_incidents: incidents.filter(i => i.status === 'RESOLVED').length,
    critical_incidents: incidents.filter(i => i.severity === 'CRITICAL').length,
    total_reports: incidents.length * 2,
    active_road_restrictions: restrictions.filter(r => r.status === 'ACTIVE').length,
    median_assignment_min: 14,
    median_resolution_min: 52
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Title & Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-heritage-stone dark:border-heritage-charcoal pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <KonarkWheelIcon size={26} className="text-heritage-maroon dark:text-heritage-gold" />
            <h1 className="font-serif font-bold text-2xl text-heritage-maroon dark:text-heritage-gold">
              City Command Center (Odisha Urban Ops)
            </h1>
          </div>
          <p className="text-xs text-heritage-aged dark:text-heritage-stone/80 mt-1 font-sans">
            Unified Geospatial Intelligence, Cross-Agency Telemetry, and Real-Time Incident Orchestration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PanelRoleAuth roleId="command" />
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory hover:border-heritage-gold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Operations</span>
          </button>
        </div>
      </div>

      {/* Real-Time Video AI SOS & Green Corridor Banner */}
      {(emergencyAlerts.some(a => a.alertStatus === 'NEW') || clearanceRequests.some(c => c.requestStatus === 'ACTIVE')) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-emerald-950 border border-red-500/60 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-red-600 text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-amber-300 uppercase tracking-wider block">
                🚨 Command Center Priority Alert: AI Video Intelligence &amp; Green Corridor Active
              </span>
              <p className="text-xs text-slate-200">
                {clearanceRequests.some(c => c.requestStatus === 'ACTIVE')
                  ? `Active Green Corridor: 108 Emergency Medical Vehicle Traversing Rasulgarh Bypass. Signal Preemption Active.`
                  : `AI Video Detection: High-Priority Emergency Event Logged via Video Intelligence. Real-time telemetry synchronized.`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <span className="px-3 py-1 rounded-full bg-red-600 text-white font-mono font-bold text-xs shadow">
              {emergencyAlerts.filter(a => a.alertStatus === 'NEW').length} Live Alerts
            </span>
          </div>
        </div>
      )}

      {/* Top Operational Statistics (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
          <span className="text-[10px] font-bold text-heritage-aged uppercase">Active Cases</span>
          <p className="text-2xl font-serif font-bold text-heritage-maroon dark:text-heritage-gold mt-1">
            {kpis.active_incidents}
          </p>
          <span className="text-[10px] text-heritage-aged font-mono">Total {kpis.total_incidents} logged</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-red/40 shadow-sm">
          <span className="text-[10px] font-bold text-heritage-red uppercase">Critical Cases</span>
          <p className="text-2xl font-serif font-bold text-heritage-red mt-1">
            {kpis.critical_incidents}
          </p>
          <span className="text-[10px] text-heritage-red font-semibold">Immediate Priority</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
          <span className="text-[10px] font-bold text-heritage-aged uppercase">Road Closures</span>
          <p className="text-2xl font-serif font-bold text-heritage-orange mt-1">
            {kpis.active_road_restrictions}
          </p>
          <span className="text-[10px] text-heritage-aged font-mono">NH-16 Rasulgarh corridor</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
          <span className="text-[10px] font-bold text-heritage-aged uppercase">Resolved Today</span>
          <p className="text-2xl font-serif font-bold text-heritage-green mt-1">
            {kpis.resolved_incidents}
          </p>
          <span className="text-[10px] text-heritage-green font-semibold">Supervisor Approved</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
          <span className="text-[10px] font-bold text-heritage-aged uppercase">Med. Assignment</span>
          <p className="text-2xl font-serif font-bold text-heritage-blue mt-1">
            {kpis.median_assignment_min}m
          </p>
          <span className="text-[10px] text-heritage-aged">AI Department match</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
          <span className="text-[10px] font-bold text-heritage-aged uppercase">Med. Resolution</span>
          <p className="text-2xl font-serif font-bold text-heritage-charcoal dark:text-heritage-ivory mt-1">
            {kpis.median_resolution_min}m
          </p>
          <span className="text-[10px] text-heritage-green">Full SLA compliance</span>
        </div>
      </div>

      {/* Interactive Map & Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 dark:bg-heritage-charcoal/70 p-3 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal text-xs">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-heritage-maroon dark:text-heritage-gold" />
            <span className="font-semibold text-heritage-charcoal dark:text-heritage-ivory">Filter Map Layers:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5">
              <span className="text-heritage-aged font-medium">Severity:</span>
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="px-2 py-1 rounded-md border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical Only</option>
                <option value="HIGH">High Only</option>
                <option value="MEDIUM">Medium Only</option>
                <option value="LOW">Low Only</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-heritage-aged font-medium">Category:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-2 py-1 rounded-md border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory"
              >
                <option value="ALL">All Categories</option>
                <option value="Waterlogging">Waterlogging</option>
                <option value="Road Damage">Road Damage</option>
                <option value="Streetlight Failure">Streetlight Failure</option>
                <option value="Garbage Accumulation">Garbage Accumulation</option>
              </select>
            </div>
          </div>
        </div>

        {/* Real Smart City Leaflet Map */}
        <SmartCityMap
          incidents={filteredIncidents}
          hospitals={hospitals}
          cameras={cameras}
          restrictions={restrictions}
          onSelectIncident={handleSelectIncident}
          selectedIncidentId={selectedIncident?.id}
          height="480px"
          showEmergencyCorridor={true}
        />
      </div>

      {/* Main Two-Column Layout: Incidents Grid + Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Incident Table (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-heritage-stone/60 dark:border-heritage-charcoal mb-3">
            <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory">
              Active Municipal Incidents ({filteredIncidents.length})
            </h3>
            <span className="text-xs text-heritage-aged">Click incident to open command actions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-heritage-stone/50 dark:border-heritage-charcoal text-heritage-aged">
                  <th className="py-2 px-3 font-semibold">Incident Code</th>
                  <th className="py-2 px-3 font-semibold">Category / Title</th>
                  <th className="py-2 px-3 font-semibold">Severity</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                  <th className="py-2 px-3 font-semibold">Priority Score</th>
                  <th className="py-2 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-heritage-stone/30 dark:divide-heritage-charcoal">
                {filteredIncidents.map(inc => {
                  let sevColor = "bg-heritage-gold/20 text-heritage-gold border-heritage-gold/40";
                  if (inc.severity === 'CRITICAL') sevColor = "bg-heritage-red/20 text-heritage-red border-heritage-red/40";
                  else if (inc.severity === 'HIGH') sevColor = "bg-heritage-orange/20 text-heritage-orange border-heritage-orange/40";
                  else if (inc.severity === 'LOW') sevColor = "bg-heritage-green/20 text-heritage-green border-heritage-green/40";

                  return (
                    <tr
                      key={inc.id}
                      onClick={() => handleSelectIncident(inc)}
                      className={`hover:bg-heritage-ivory/60 dark:hover:bg-heritage-charcoal-dark cursor-pointer transition-colors ${
                        selectedIncident?.id === inc.id ? 'bg-heritage-gold/10 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-heritage-maroon dark:text-heritage-gold">
                        {inc.incident_code}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-heritage-charcoal dark:text-heritage-ivory">{inc.title}</div>
                        <div className="text-[11px] text-heritage-aged truncate max-w-xs">{inc.address}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sevColor}`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-heritage-stone/50 dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-stone">
                          {inc.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">
                        {inc.priority_score.toFixed(1)} / 100
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleSelectIncident(inc);
                          }}
                          className="px-2.5 py-1 rounded bg-heritage-maroon/10 hover:bg-heritage-maroon text-heritage-maroon hover:text-white dark:text-heritage-gold text-[11px] font-semibold transition-colors"
                        >
                          Details →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Live Telemetry Event Feed (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-heritage-stone/60 dark:border-heritage-charcoal">
              <h4 className="font-serif font-bold text-sm text-heritage-maroon dark:text-heritage-gold uppercase tracking-wider">
                Live Telemetry Feed
              </h4>
              <span className="w-2 h-2 rounded-full bg-heritage-green animate-ping inline-block" />
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {[
                { time: "Just now", title: "IMD Weather Sync", desc: "Depression over Bay of Bengal; rainfall 68mm in Khordha.", type: "alert" },
                { time: "4m ago", title: "Rasulgarh AI Correlation", desc: "Correlated 3 citizen reports within 150m radius.", type: "info" },
                { time: "9m ago", title: "108 Ambulance Unit 4", desc: "Rerouted around Rasulgarh flood via Vani Vihar bypass.", type: "success" },
                { time: "18m ago", title: "Field Worker Pump Deployed", desc: "Submersible pump operational at Pillar 14 culvert.", type: "info" },
                { time: "32m ago", title: "Hospital ICU Status", desc: "AIIMS reports 14 emergency ICU trauma beds available.", type: "info" },
              ].map((ev, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-heritage-ivory/50 dark:bg-heritage-charcoal-dark border border-heritage-stone/50 dark:border-heritage-charcoal/80 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-heritage-aged mb-0.5">
                    <span className="font-bold text-heritage-maroon dark:text-heritage-gold">{ev.title}</span>
                    <span>{ev.time}</span>
                  </div>
                  <p className="text-heritage-charcoal dark:text-heritage-stone text-[11px] leading-relaxed">
                    {ev.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-heritage-stone dark:border-heritage-charcoal text-[11px] text-heritage-aged">
            Real-time multi-agency coordination synced with Odisha State Disaster Authority.
          </div>
        </div>

      </div>

      {/* Incident Detail Drawer Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-heritage-ivory dark:bg-heritage-charcoal-dark border border-heritage-stone dark:border-heritage-charcoal rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Drawer Header */}
            <div className="p-4 bg-heritage-maroon text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-heritage-gold font-bold">
                  {selectedIncident.incident_code} • {selectedIncident.category}
                </span>
                <h3 className="font-serif font-bold text-base text-white mt-0.5">
                  {selectedIncident.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-lg bg-heritage-maroon-dark text-heritage-stone hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded bg-white dark:bg-heritage-charcoal border border-heritage-stone">
                  <span className="text-heritage-aged block">Severity</span>
                  <b className="text-heritage-red">{selectedIncident.severity}</b>
                </div>
                <div className="p-2 rounded bg-white dark:bg-heritage-charcoal border border-heritage-stone">
                  <span className="text-heritage-aged block">Status</span>
                  <b>{selectedIncident.status}</b>
                </div>
                <div className="p-2 rounded bg-white dark:bg-heritage-charcoal border border-heritage-stone">
                  <span className="text-heritage-aged block">Priority Score</span>
                  <b className="font-mono">{selectedIncident.priority_score.toFixed(1)} / 100</b>
                </div>
                <div className="p-2 rounded bg-white dark:bg-heritage-charcoal border border-heritage-stone">
                  <span className="text-heritage-aged block">Verified</span>
                  <b className={selectedIncident.is_verified ? "text-heritage-green" : "text-heritage-orange"}>
                    {selectedIncident.is_verified ? "YES" : "PENDING"}
                  </b>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">Description</h5>
                <p className="text-heritage-aged dark:text-heritage-stone leading-relaxed bg-white/70 dark:bg-heritage-charcoal p-3 rounded-lg border border-heritage-stone">
                  {selectedIncident.description}
                </p>
              </div>

              <div>
                <h5 className="font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">Geographic Location</h5>
                <p className="text-heritage-aged dark:text-heritage-stone">
                  {selectedIncident.address} (Lat: {selectedIncident.latitude}, Lng: {selectedIncident.longitude})
                </p>
              </div>

              {/* AI Findings Preview */}
              {incidentDetailData?.ai_analysis && (
                <div className="p-3 rounded-xl bg-heritage-stone/30 dark:bg-heritage-charcoal border border-heritage-gold/50 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-heritage-maroon dark:text-heritage-gold font-bold">
                    <Zap className="w-4 h-4 text-heritage-gold" />
                    <span>AI Incident Intelligence Analysis ({incidentDetailData.ai_analysis.model_version})</span>
                  </div>
                  <p className="text-heritage-charcoal dark:text-heritage-stone text-[11px]">
                    <b>Summary:</b> {incidentDetailData.ai_analysis.summary}
                  </p>
                  <p className="text-heritage-charcoal dark:text-heritage-stone text-[11px]">
                    <b>Recommended Department:</b> {incidentDetailData.ai_analysis.recommended_department} (Confidence: {Math.round(incidentDetailData.ai_analysis.confidence * 100)}%)
                  </p>
                </div>
              )}

              {/* Command Actions */}
              <div className="p-4 rounded-xl bg-white dark:bg-heritage-charcoal border border-heritage-stone space-y-3">
                <h5 className="font-serif font-bold text-sm text-heritage-maroon dark:text-heritage-gold">
                  Operational Command Actions
                </h5>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleVerifyIncident(true)}
                    className="px-3.5 py-2 rounded-lg bg-heritage-green text-white font-semibold flex items-center space-x-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Incident Authenticity</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <select
                      value={assignDeptId}
                      onChange={e => setAssignDeptId(parseInt(e.target.value))}
                      className="px-2.5 py-2 rounded-lg border border-heritage-stone bg-heritage-ivory dark:bg-heritage-charcoal-dark font-medium"
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>

                    <button
                      onClick={handleAssignDepartment}
                      className="px-3.5 py-2 rounded-lg bg-heritage-maroon text-heritage-gold font-semibold flex items-center space-x-1.5 shadow-sm"
                    >
                      <Building className="w-4 h-4" />
                      <span>Assign & Create Task</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
