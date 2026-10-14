import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task, Department, Report, Incident, AuditLog } from '../types';
import { KonarkWheelIcon } from '../components/OdishaMotifs';
import { SatelliteLocationMap } from '../components/SatelliteLocationMap';
import { SmartCityMap } from '../components/SmartCityMap';
import { PanelRoleAuth } from '../components/PanelRoleAuth';
import {
  Building2,
  CheckCircle2,
  Clock,
  HardHat,
  Filter,
  RefreshCw,
  XCircle,
  AlertCircle,
  UserCheck,
  FileCheck,
  Inbox,
  ListTodo,
  MapPin,
  Wrench,
  Boxes,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  Search,
  ChevronRight,
  ExternalLink,
  Plus,
  Send,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  Navigation,
  X
} from 'lucide-react';

interface MunicipalAsset {
  id: number;
  asset_code: string;
  name: string;
  category: string;
  ward: string;
  condition: string;
  last_inspected: string;
  location: string;
}

interface InventoryItem {
  id: number;
  item_code: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_reorder_level: number;
  status: string;
}

export const MunicipalView: React.FC = () => {
  const { language, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'COMPLAINTS' | 'WORK_ORDERS' | 'MAP' | 'ASSETS' | 'SLA' | 'ANALYTICS'>('COMPLAINTS');
  
  // Data States
  const [reports, setReports] = useState<Report[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [assets, setAssets] = useState<MunicipalAsset[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [routeClearanceRequests, setRouteClearanceRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Filters & Selected Items
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  const [complaintSearch, setComplaintSearch] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [supervisorFeedback, setSupervisorFeedback] = useState<string>('');
  
  // Dispatch Drawer Form State
  const [assignDeptId, setAssignDeptId] = useState<number>(1);
  const [assignPriority, setAssignPriority] = useState<string>('HIGH');
  const [assignInstructions, setAssignInstructions] = useState<string>('Deploy mobile dewatering suction pump to site and clear obstruction.');
  const [verifying, setVerifying] = useState<boolean>(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [rRes, tRes, dRes, iRes, aRes, invRes, auditRes, clrRes] = await Promise.all([
        fetch('/api/v1/reports'),
        fetch('/api/v1/tasks'),
        fetch('/api/v1/departments'),
        fetch('/api/v1/incidents'),
        fetch('/api/v1/municipal/assets'),
        fetch('/api/v1/municipal/inventory'),
        fetch('/api/v1/audit-logs'),
        fetch('/api/emergency/route-clearance-requests')
      ]);

      if (rRes.ok) setReports(await rRes.json());
      if (tRes.ok) setTasks(await tRes.json());
      if (dRes.ok) setDepartments(await dRes.json());
      if (iRes.ok) setIncidents(await iRes.json());
      if (aRes.ok) setAssets(await aRes.json());
      if (invRes.ok) setInventory(await invRes.json());
      if (auditRes.ok) setAuditLogs(await auditRes.json());
      if (clrRes.ok) setRouteClearanceRequests(await clrRes.json());
    } catch (err) {
      console.error('Municipal data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    const handleSync = () => {
      fetchAllData();
    };
    window.addEventListener('civic_sync_event', handleSync);
    return () => {
      window.removeEventListener('civic_sync_event', handleSync);
    };
  }, []);

  // 1-Click Verification & Dispatch Work Order
  const handleVerifyAndDispatch = async (reportCode: string) => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/v1/reports/${reportCode}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_id: assignDeptId,
          priority: assignPriority,
          instructions: assignInstructions
        })
      });

      if (res.ok) {
        showToast(`Complaint ${reportCode} verified & Work Order dispatched!`, 'success');
        setSelectedReport(null);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
      showToast('Error dispatching work order', 'error');
    } finally {
      setVerifying(false);
    }
  };

  // Supervisor Inspection & Quality Verification
  const handleSupervisorVerification = async (approved: boolean) => {
    if (!selectedTask) return;
    try {
      const res = await fetch(`/api/v1/tasks/${selectedTask.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved,
          supervisor_feedback: supervisorFeedback || (approved ? "Work verified on site and quality approved." : "Defect remaining. Corrective re-work required.")
        })
      });
      if (res.ok) {
        showToast(approved ? "Work Order approved & Incident resolved!" : "Returned to field team for rework", approved ? "success" : "alert");
        setSelectedTask(null);
        setSupervisorFeedback('');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Tasks
  const filteredTasks = tasks.filter(t => {
    if (selectedDeptId !== 'ALL' && t.department_id !== parseInt(selectedDeptId)) return false;
    return true;
  });

  // Filtered Reports
  const filteredReports = reports.filter(r => {
    if (!r || !complaintSearch.trim()) return true;
    const searchLower = complaintSearch.toLowerCase();
    const codeMatch = r.report_code ? String(r.report_code).toLowerCase().includes(searchLower) : false;
    const titleMatch = r.title ? String(r.title).toLowerCase().includes(searchLower) : false;
    const addrMatch = r.address ? String(r.address).toLowerCase().includes(searchLower) : false;
    const catMatch = r.category ? String(r.category).toLowerCase().includes(searchLower) : false;
    return codeMatch || titleMatch || addrMatch || catMatch;
  });

  const activeReportsCount = reports.filter(r => r.status !== 'RESOLVED').length;
  const overdueCount = tasks.filter(t => t.priority === 'CRITICAL' || t.priority === 'HIGH').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-heritage-stone dark:border-heritage-charcoal pb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-heritage-maroon text-heritage-gold shadow-md">
              <KonarkWheelIcon size={28} className="text-heritage-gold animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif font-bold text-2xl text-heritage-maroon dark:text-heritage-gold">
                  Municipal Department Operations Workspace
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-heritage-gold/20 text-heritage-maroon dark:text-heritage-gold border border-heritage-gold/40">
                  Command Center
                </span>
              </div>
              <p className="text-xs text-heritage-aged dark:text-heritage-stone/80 mt-0.5 font-sans">
                Unified municipal operations platform linking citizen complaints, field work orders, GIS satellite map telemetry, and quality assurance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PanelRoleAuth roleId="municipal" />
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal text-xs font-semibold hover:border-heritage-gold transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Operations Data</span>
          </button>
        </div>
      </div>

      {/* Active Green Corridor Route Clearance Alert */}
      {routeClearanceRequests.some(r => r.requestStatus === 'ACTIVE') && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/60 shadow-md text-white flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-emerald-300 uppercase tracking-wider block">
                🚨 Municipal Traffic Notice: Active Emergency Green Corridor Route
              </span>
              <p className="text-xs text-slate-200">
                108 Emergency Medical Vehicle Traversing Ward Corridors (Rasulgarh ➔ AIIMS Bhubaneswar). Municipal road crews instructed to maintain lane clearance.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs shrink-0 shadow">
            GREEN CORRIDOR ACTIVE
          </span>
        </div>
      )}

      {/* Top Operational KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-heritage-aged font-semibold">
            <span>Citizen Complaints</span>
            <Inbox className="w-4 h-4 text-heritage-maroon dark:text-heritage-gold" />
          </div>
          <p className="font-serif font-bold text-2xl sm:text-3xl text-heritage-maroon dark:text-heritage-gold">
            {activeReportsCount}
          </p>
          <p className="text-[10px] text-heritage-aged font-mono">Synced from Citizen Portal</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-heritage-aged font-semibold">
            <span>Active Work Orders</span>
            <ListTodo className="w-4 h-4 text-heritage-blue" />
          </div>
          <p className="font-serif font-bold text-2xl sm:text-3xl text-heritage-charcoal dark:text-heritage-ivory">
            {tasks.length}
          </p>
          <p className="text-[10px] text-heritage-blue font-semibold">Field Crews Deployed</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-heritage-aged font-semibold">
            <span>High SLA Risk Cases</span>
            <AlertTriangle className="w-4 h-4 text-heritage-orange" />
          </div>
          <p className="font-serif font-bold text-2xl sm:text-3xl text-heritage-red">
            {overdueCount}
          </p>
          <p className="text-[10px] text-heritage-red font-semibold">Requires Priority Action</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-heritage-aged font-semibold">
            <span>SLA Compliance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-heritage-green" />
          </div>
          <p className="font-serif font-bold text-2xl sm:text-3xl text-heritage-green">
            94.2%
          </p>
          <p className="text-[10px] text-heritage-aged font-mono">Avg Resolution: 4.2 Hours</p>
        </div>
      </div>

      {/* Main Workspace Navigation Sub-Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-heritage-stone dark:border-heritage-charcoal">
        {[
          { id: 'COMPLAINTS', label: '01. Citizen Complaints Queue', icon: Inbox, badge: activeReportsCount },
          { id: 'WORK_ORDERS', label: '02. Work Orders & Field Dispatch', icon: ListTodo, badge: tasks.length },
          { id: 'MAP', label: '03. GIS Satellite City Map', icon: MapPin },
          { id: 'ASSETS', label: '04. Assets & Inventory', icon: Boxes },
          { id: 'SLA', label: '05. SLA & Escalation Center', icon: Clock },
          { id: 'ANALYTICS', label: '06. Analytics & Audit Logs', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-heritage-maroon text-heritage-gold border-heritage-maroon shadow-sm'
                  : 'bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-heritage-gold' : 'text-heritage-aged'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-heritage-gold text-heritage-charcoal font-bold' : 'bg-heritage-stone/40 text-heritage-charcoal'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: CITIZEN COMPLAINTS QUEUE ───────────────────────────────── */}
      {activeTab === 'COMPLAINTS' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-heritage-charcoal p-4 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-heritage-aged absolute left-3 top-2.5" />
              <input
                type="text"
                value={complaintSearch}
                onChange={e => setComplaintSearch(e.target.value)}
                placeholder="Search complaint code, ticket ID, address, category..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
              />
            </div>
            <p className="text-xs text-heritage-aged font-mono">
              Showing {filteredReports.length} reports received from Citizen Portal
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {filteredReports.map(rep => (
              <div
                key={rep.id}
                className="p-5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm hover:border-heritage-gold transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sm text-heritage-maroon dark:text-heritage-gold">
                      {rep.report_code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      {rep.status}
                    </span>
                    <span className="text-[11px] text-heritage-blue font-semibold">
                      Category: {rep.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-heritage-charcoal dark:text-heritage-ivory">
                    {rep.title}
                  </h3>
                  <p className="text-xs text-heritage-aged line-clamp-2">
                    {rep.description}
                  </p>
                  <div className="flex items-center space-x-3 text-[11px] text-heritage-aged pt-1">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-heritage-red" />
                      <span>{rep.address}</span>
                    </span>
                    <span>·</span>
                    <span className="font-mono">Citizen: {rep.citizen_name || 'Anonymous'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setSelectedReport(rep)}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-heritage-maroon text-white text-xs font-bold hover:bg-heritage-maroon-dark shadow-sm transition-all"
                  >
                    <span>Verify & Dispatch</span>
                    <ChevronRight className="w-4 h-4 text-heritage-gold" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: WORK ORDERS & FIELD DISPATCH ───────────────────────────── */}
      {activeTab === 'WORK_ORDERS' && (
        <div className="space-y-4 animate-fade-in">
          {/* Department Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-heritage-charcoal p-3 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal text-xs shadow-sm">
            <span className="font-bold text-heritage-charcoal dark:text-heritage-ivory mr-2">Department Scope:</span>
            <button
              onClick={() => setSelectedDeptId('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedDeptId === 'ALL'
                  ? 'bg-heritage-maroon text-heritage-gold shadow-sm'
                  : 'bg-heritage-stone/30 text-heritage-aged hover:text-heritage-charcoal'
              }`}
            >
              All Departments ({tasks.length})
            </button>
            {departments.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDeptId(d.id.toString())}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  selectedDeptId === d.id.toString()
                    ? 'bg-heritage-maroon text-heritage-gold shadow-sm'
                    : 'bg-heritage-stone/30 text-heritage-aged hover:text-heritage-charcoal'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-5 shadow-sm">
            <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory mb-3">
              Field Work Orders Pipeline ({filteredTasks.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-heritage-stone text-heritage-aged">
                    <th className="py-2.5 px-3 font-semibold">Work Order ID</th>
                    <th className="py-2.5 px-3 font-semibold">Title & Work Instructions</th>
                    <th className="py-2.5 px-3 font-semibold">Priority</th>
                    <th className="py-2.5 px-3 font-semibold">Current State</th>
                    <th className="py-2.5 px-3 font-semibold">Completion Proof</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Supervisor Inspection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-heritage-stone/40 dark:divide-heritage-charcoal">
                  {filteredTasks.map(t => {
                    let statusColor = "bg-heritage-stone text-heritage-charcoal";
                    if (t.status === 'COMPLETED') statusColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
                    else if (t.status === 'PENDING_VERIFICATION') statusColor = "bg-amber-100 text-amber-800 border-amber-300 animate-pulse";
                    else if (t.status === 'IN_PROGRESS' || t.status === 'ACCEPTED') statusColor = "bg-blue-100 text-blue-800 border-blue-300";
                    else if (t.status === 'ASSIGNED') statusColor = "bg-orange-100 text-orange-800 border-orange-300";

                    return (
                      <tr key={t.id} className="hover:bg-heritage-ivory/50 dark:hover:bg-heritage-charcoal-dark">
                        <td className="py-3 px-3 font-mono font-bold text-heritage-maroon dark:text-heritage-gold">
                          TSK-{t.id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-heritage-charcoal dark:text-heritage-ivory">{t.title}</div>
                          <div className="text-[11px] text-heritage-aged">{t.instructions}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-[10px] uppercase text-heritage-maroon dark:text-heritage-gold">
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor}`}>
                            {t.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {t.completion_proof_url ? (
                            <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Photo Uploaded</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-heritage-aged">Pending Worker</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedTask(t)}
                            className="px-3 py-1.5 rounded-xl bg-heritage-maroon text-white font-bold text-xs shadow-sm hover:bg-heritage-maroon-dark transition-all"
                          >
                            Inspect & Sign Off
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: GIS SATELLITE CITY MAP ─────────────────────────────────── */}
      {activeTab === 'MAP' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-heritage-charcoal p-4 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal shadow-sm flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-heritage-maroon dark:text-heritage-gold" />
              <span className="font-bold text-heritage-charcoal dark:text-heritage-ivory">
                Odisha Municipal GIS Command Map
              </span>
            </div>
            <span className="font-mono text-heritage-aged">Ward Layer: BMC Ward 28 North-Central</span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-heritage-stone shadow-heritage">
            <SmartCityMap
              incidents={incidents}
              height="500px"
            />
          </div>
        </div>
      )}

      {/* ── TAB 4: ASSETS & MATERIAL INVENTORY ───────────────────────────── */}
      {activeTab === 'ASSETS' && (
        <div className="space-y-6 animate-fade-in">
          {/* Municipal Assets */}
          <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-heritage-maroon dark:text-heritage-gold" />
                <span>Municipal Infrastructure Assets ({assets.length})</span>
              </h3>
              <span className="text-[10px] font-bold text-heritage-gold uppercase bg-heritage-gold/20 px-2 py-0.5 rounded border border-heritage-gold/40">
                Asset Registry
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assets.map(ast => (
                <div key={ast.id} className="p-4 rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-heritage-maroon dark:text-heritage-gold">{ast.asset_code}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ast.condition === 'GOOD' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ast.condition}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-heritage-charcoal dark:text-heritage-ivory">{ast.name}</h4>
                  <p className="text-[11px] text-heritage-aged">{ast.location} ({ast.ward})</p>
                </div>
              ))}
            </div>
          </div>

          {/* Materials Inventory */}
          <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory flex items-center space-x-2">
                <Boxes className="w-4 h-4 text-heritage-blue" />
                <span>Municipal Material Inventory ({inventory.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {inventory.map(inv => (
                <div key={inv.id} className="p-4 rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-heritage-blue">{inv.item_code}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.status === 'IN_STOCK' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-heritage-charcoal dark:text-heritage-ivory">{inv.name}</h4>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-heritage-stone/30">
                    <span className="text-heritage-aged">Available Stock:</span>
                    <span className="font-bold font-mono text-heritage-maroon dark:text-heritage-gold">{inv.quantity} {inv.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: SLA TIMERS & ESCALATION CENTER ────────────────────────── */}
      {activeTab === 'SLA' && (
        <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-heritage-maroon dark:text-heritage-gold" />
            <h3 className="font-serif font-bold text-lg text-heritage-charcoal dark:text-heritage-ivory">
              Department SLA Timers & Escalation Targets
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {departments.map(d => (
              <div key={d.id} className="p-4 rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark space-y-2">
                <span className="font-mono text-[10px] font-bold text-heritage-aged uppercase">{d.code}</span>
                <h4 className="font-bold text-xs text-heritage-charcoal dark:text-heritage-ivory">{d.name}</h4>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-heritage-stone/30">
                  <span className="text-heritage-aged">Target Resolution SLA:</span>
                  <span className="font-bold font-mono text-emerald-600">{d.sla_hours} Hours</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: ANALYTICS & AUDIT LOGS ─────────────────────────────────── */}
      {activeTab === 'ANALYTICS' && (
        <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-heritage-maroon dark:text-heritage-gold" />
            <h3 className="font-serif font-bold text-lg text-heritage-charcoal dark:text-heritage-ivory">
              Municipal Operational Audit Trail
            </h3>
          </div>

          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-heritage-maroon dark:text-heritage-gold">{log.action}</span>
                  <p className="text-heritage-aged">{log.details}</p>
                </div>
                <div className="text-right text-[10px] font-mono text-heritage-aged">
                  <span>{log.user_email}</span>
                  <br />
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VERIFY & DISPATCH DRAWER MODAL ─────────────────────────────────── */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-heritage-ivory dark:bg-heritage-charcoal-dark border border-heritage-stone dark:border-heritage-charcoal rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-heritage-stone">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-heritage-gold" />
                <h3 className="font-serif font-bold text-lg text-heritage-maroon dark:text-heritage-gold">
                  Verify & Issue Work Order ({selectedReport.report_code})
                </h3>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-1 rounded-lg hover:bg-heritage-stone/40">
                <X className="w-5 h-5 text-heritage-aged" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white dark:bg-heritage-charcoal border border-heritage-stone space-y-1">
                <p className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">{selectedReport.title}</p>
                <p className="text-heritage-aged">{selectedReport.description}</p>
                <p className="text-[11px] font-semibold text-heritage-maroon dark:text-heritage-gold pt-1">
                  Reporter: {selectedReport.citizen_name} ({selectedReport.citizen_phone})
                </p>
              </div>

              {/* Satellite Map Telemetry & Location Stamp */}
              <div>
                <span className="text-[10px] font-bold text-heritage-maroon dark:text-heritage-gold uppercase tracking-wider block mb-1">
                  Location Satellite View & Verified Stamp
                </span>
                <SatelliteLocationMap
                  latitude={selectedReport.latitude || 20.2961}
                  longitude={selectedReport.longitude || 85.8645}
                  address={selectedReport.address}
                  landmark="Rasulgarh Sluice Channel"
                  ward="BMC Ward 28 (North-Central)"
                  city="Bhubaneswar"
                  pincode="751010"
                  captureMode="AUTO_GPS"
                  accuracyMeters={4.2}
                  interactive={false}
                  height="200px"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-heritage-charcoal dark:text-heritage-stone mb-1">Assign Responsible Department</label>
                  <select
                    value={assignDeptId}
                    onChange={e => setAssignDeptId(parseInt(e.target.value))}
                    className="w-full p-2 rounded-xl border border-heritage-stone bg-white dark:bg-heritage-charcoal text-xs"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} (SLA: {d.sla_hours}h)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-heritage-charcoal dark:text-heritage-stone mb-1">Priority Classification</label>
                  <select
                    value={assignPriority}
                    onChange={e => setAssignPriority(e.target.value)}
                    className="w-full p-2 rounded-xl border border-heritage-stone bg-white dark:bg-heritage-charcoal text-xs"
                  >
                    <option value="CRITICAL">CRITICAL (Emergency Hazard)</option>
                    <option value="HIGH">HIGH (Arterial Blockage)</option>
                    <option value="MEDIUM">MEDIUM (Standard Queue)</option>
                    <option value="LOW">LOW (Maintenance)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-heritage-charcoal dark:text-heritage-stone mb-1">Field Work Instructions & Scope</label>
                <textarea
                  rows={2}
                  value={assignInstructions}
                  onChange={e => setAssignInstructions(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-heritage-stone bg-white dark:bg-heritage-charcoal text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-heritage-stone">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl border border-heritage-stone text-xs font-semibold text-heritage-aged hover:text-heritage-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyAndDispatch(selectedReport.report_code)}
                disabled={verifying}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-heritage-maroon text-white font-bold text-xs shadow-heritage hover:bg-heritage-maroon-dark transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-heritage-gold" />
                <span>{verifying ? 'Dispatching Work Order…' : 'Confirm Verification & Issue Work Order'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUPERVISOR INSPECTION & QUALITY SIGN-OFF MODAL ─────────────────── */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-heritage-ivory dark:bg-heritage-charcoal-dark border border-heritage-stone dark:border-heritage-charcoal rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-heritage-stone">
              <h4 className="font-serif font-bold text-base text-heritage-maroon dark:text-heritage-gold">
                Supervisor Quality Inspection (TSK-{selectedTask.id})
              </h4>
              <button onClick={() => setSelectedTask(null)} className="p-1 rounded-lg hover:bg-heritage-stone/40">
                <X className="w-5 h-5 text-heritage-aged" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <p><b>Task Title:</b> {selectedTask.title}</p>
              <p><b>Field Worker Notes:</b> {selectedTask.worker_notes || "Culvert grate cleared. Dewatering pump running at 120 L/min."}</p>

              {/* Satellite Map View */}
              <div>
                <span className="text-[10px] font-bold text-heritage-maroon dark:text-heritage-gold uppercase tracking-wider block mb-1">
                  Location Satellite View & Verified Stamp
                </span>
                <SatelliteLocationMap
                  latitude={20.2961}
                  longitude={85.8645}
                  address="Rasulgarh Junction Underpass, NH-16, Bhubaneswar"
                  landmark="Rasulgarh Overbridge Sluice Channel"
                  ward="BMC Ward 28 (North-Central)"
                  city="Bhubaneswar"
                  pincode="751010"
                  captureMode="AUTO_GPS"
                  accuracyMeters={4.2}
                  interactive={false}
                  height="180px"
                />
              </div>

              {selectedTask.completion_proof_url && (
                <div className="p-2 rounded-xl bg-white dark:bg-heritage-charcoal border border-heritage-stone">
                  <span className="text-[10px] font-bold text-heritage-aged block mb-1">Uploaded Resolution Evidence</span>
                  <img
                    src={selectedTask.completion_proof_url}
                    alt="Proof"
                    className="w-full h-36 object-cover rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">Supervisor Quality Feedback</label>
                <textarea
                  rows={2}
                  value={supervisorFeedback}
                  onChange={e => setSupervisorFeedback(e.target.value)}
                  placeholder="Enter engineering inspection notes..."
                  className="w-full p-2.5 rounded-xl border border-heritage-stone bg-white dark:bg-heritage-charcoal text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-heritage-stone">
              <button
                onClick={() => handleSupervisorVerification(false)}
                className="px-4 py-2 rounded-xl border border-heritage-red text-heritage-red font-semibold text-xs hover:bg-heritage-red/10"
              >
                Reject / Require Rework
              </button>
              <button
                onClick={() => handleSupervisorVerification(true)}
                className="px-5 py-2 rounded-xl bg-heritage-green text-white font-bold text-xs shadow-md hover:brightness-110"
              >
                Approve & Resolve Incident
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
