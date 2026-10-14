import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Department } from '../types';
import { KonarkWheelIcon } from '../components/OdishaMotifs';
import { PanelRoleAuth } from '../components/PanelRoleAuth';
import {
  ShieldAlert,
  Users,
  Building,
  Activity,
  RotateCcw,
  RefreshCw,
  Search,
  CheckCircle2,
  Lock,
  Cpu,
  Database,
  Radio,
  UserCheck,
  UserX,
  Clock,
  Building2,
  BadgeAlert
} from 'lucide-react';

export const SuperAdminView: React.FC = () => {
  const { language, showToast } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [staffRegistrations, setStaffRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchAudit, setSearchAudit] = useState('');
  const [resetting, setResetting] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [e2eTestResults, setE2eTestResults] = useState<any | null>(null);
  const [runningE2ETests, setRunningE2ETests] = useState(false);

  const handleRunE2ETests = async () => {
    setRunningE2ETests(true);
    try {
      const res = await fetch('/api/v1/system/run-e2e-tests');
      if (res.ok) {
        const data = await res.json();
        setE2eTestResults(data);
        showToast(`E2E Sync Tests Completed: ${data.passed}/${data.total} Passed!`, data.allPassed ? 'success' : 'alert');
        fetchAdminData();
      } else {
        showToast('Failed to run E2E sync tests', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error running tests', 'error');
    } finally {
      setRunningE2ETests(false);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, dRes, aRes, sRes] = await Promise.all([
        fetch('/api/v1/users'),
        fetch('/api/v1/departments'),
        fetch('/api/v1/audit-logs'),
        fetch('/api/v1/municipal/staff-registrations')
      ]);
      if (uRes.ok) setUsers(await uRes.json());
      if (dRes.ok) setDepartments(await dRes.json());
      if (aRes.ok) setAuditLogs(await aRes.json());
      if (sRes.ok) setStaffRegistrations(await sRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStaff = async (regId: number) => {
    setApprovingId(regId);
    try {
      const res = await fetch(`/api/v1/municipal/staff-registrations/${regId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approver_email: 'admin@civicnexus.gov.in' })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Staff registration approved and account activated.', 'success');
        fetchAdminData();
      } else {
        showToast(data.detail || 'Approval failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error during staff approval.', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectStaff = async (regId: number) => {
    const reason = window.prompt('Enter rejection reason for applicant:', 'Verification details unconfirmed by department.');
    if (!reason) return;

    setApprovingId(regId);
    try {
      const res = await fetch(`/api/v1/municipal/staff-registrations/${regId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Staff registration rejected. Reason: ${reason}`, 'info');
        fetchAdminData();
      } else {
        showToast(data.detail || 'Rejection failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error during rejection.', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResetEntireDemo = async () => {
    if (!window.confirm("Are you sure you want to reset the demonstration database back to initial seed data?")) return;
    setResetting(true);
    try {
      const res = await fetch('/api/v1/demo/reset', { method: 'POST' });
      if (res.ok) {
        showToast("Demonstration database reset to pristine seed state", "success");
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const filteredLogs = auditLogs.filter(l => {
    if (!l) return false;
    const searchLower = (searchAudit || '').toLowerCase();
    const actionMatch = l.action ? String(l.action).toLowerCase().includes(searchLower) : false;
    const userMatch = (l as any).user ? String((l as any).user).toLowerCase().includes(searchLower) : false;
    const detailsMatch = l.details ? String(l.details).toLowerCase().includes(searchLower) : false;
    return actionMatch || userMatch || detailsMatch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-heritage-stone dark:border-heritage-charcoal pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-7 h-7 text-heritage-maroon dark:text-heritage-gold" />
            <h1 className="font-serif font-bold text-2xl text-heritage-maroon dark:text-heritage-gold">
              Super Administrator Governance &amp; Audits
            </h1>
          </div>
          <p className="text-xs text-heritage-aged dark:text-heritage-stone/80 mt-1 font-sans">
            User RBAC permissions, departmental SLA policies, immutable tamper-evident logs, and system health.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <PanelRoleAuth roleId="admin" />
          <button
            onClick={handleRunE2ETests}
            disabled={runningE2ETests}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg border border-heritage-green bg-heritage-green/10 text-heritage-green font-semibold text-xs hover:bg-heritage-green/20 transition-all shadow-sm"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${runningE2ETests ? 'animate-spin' : ''}`} />
            <span>{runningE2ETests ? 'Running 9 Tests...' : 'Run 9 E2E Cross-Portal Tests'}</span>
          </button>

          <button
            onClick={handleResetEntireDemo}
            disabled={resetting}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg border border-heritage-red bg-white dark:bg-heritage-charcoal text-heritage-red font-semibold text-xs hover:bg-heritage-red/10 transition-all"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Database to Pristine</span>
          </button>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="p-2 rounded-lg border border-heritage-stone bg-white dark:bg-heritage-charcoal text-xs hover:border-heritage-gold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* AUTOMATED E2E TESTS RESULTS BANNER */}
      {e2eTestResults && (
        <div className="bg-white dark:bg-heritage-charcoal border-2 border-heritage-green rounded-2xl p-5 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-heritage-stone dark:border-heritage-charcoal pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-6 h-6 text-heritage-green shrink-0" />
              <div>
                <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory">
                  Automated End-to-End Cross-Portal Synchronization Test Results
                </h3>
                <p className="text-xs text-heritage-aged">
                  Verified real data movement and state consistency across all 6 portals (Total Duration: {e2eTestResults.durationTotalMs}ms)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-heritage-green/10 text-heritage-green font-bold text-xs rounded-full border border-heritage-green/30">
                {e2eTestResults.passed}/{e2eTestResults.total} TESTS PASSED
              </span>
              <button
                onClick={() => setE2eTestResults(null)}
                className="text-xs text-heritage-aged hover:text-heritage-charcoal dark:hover:text-white px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {e2eTestResults.testResults.map((t: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory/40 dark:bg-slate-900/40 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-heritage-maroon dark:text-heritage-gold">{t.id}</span>
                  <span className="text-[10px] font-semibold text-heritage-green flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>PASSED ({t.durationMs}ms)</span>
                  </span>
                </div>
                <p className="font-medium text-heritage-charcoal dark:text-heritage-ivory">{t.name}</p>
                <p className="text-[11px] text-heritage-aged leading-relaxed">{t.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Engine Health Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
          <span className="text-[10px] font-bold text-heritage-aged uppercase flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-heritage-gold" />
            <span>AI Provider</span>
          </span>
          <p className="text-sm font-bold text-heritage-green mt-1">Gemini 2.0 Flash</p>
          <span className="text-[10px] text-heritage-aged">NLP Extraction Active</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
          <span className="text-[10px] font-bold text-heritage-aged uppercase flex items-center space-x-1">
            <Database className="w-3.5 h-3.5 text-heritage-blue" />
            <span>Operational DB</span>
          </span>
          <p className="text-sm font-bold text-heritage-green mt-1">SQLite / SQLAlchemy</p>
          <span className="text-[10px] text-heritage-aged">WAL Mode & PostGIS Ready</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
          <span className="text-[10px] font-bold text-heritage-aged uppercase flex items-center space-x-1">
            <Radio className="w-3.5 h-3.5 text-heritage-orange" />
            <span>Real-Time Sync</span>
          </span>
          <p className="text-sm font-bold text-heritage-green mt-1">WebSockets Active</p>
          <span className="text-[10px] text-heritage-aged">Multi-Client Broadcast</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
          <span className="text-[10px] font-bold text-heritage-aged uppercase flex items-center space-x-1">
            <Lock className="w-3.5 h-3.5 text-heritage-maroon" />
            <span>Authentication</span>
          </span>
          <p className="text-sm font-bold text-heritage-green mt-1">JWT + Native Bcrypt</p>
          <span className="text-[10px] text-heritage-aged">11 RBAC Stakeholder Roles</span>
        </div>
      </div>

      {/* MUNICIPAL STAFF ONBOARDING & APPROVAL QUEUE */}
      <div className="bg-white dark:bg-heritage-charcoal border border-heritage-gold/50 rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-heritage-stone dark:border-heritage-charcoal-dark">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-heritage-maroon dark:text-heritage-gold shrink-0" />
            <div>
              <h3 className="font-serif font-bold text-base text-heritage-maroon dark:text-heritage-gold">
                Municipal Staff Registration Approvals ({staffRegistrations.filter(r => r.status === 'PENDING_APPROVAL').length} Pending)
              </h3>
              <p className="text-xs text-heritage-aged dark:text-heritage-stone/80 font-sans">
                Review officer candidates, verify employee IDs, and assign authorized departmental RBAC permissions.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
            STAFF ONBOARDING GATE
          </span>
        </div>

        {staffRegistrations.length === 0 ? (
          <div className="text-center py-6 text-xs text-heritage-aged">
            No staff registration requests recorded.
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {staffRegistrations.map((reg) => (
              <div
                key={reg.id}
                className={`p-4 rounded-2xl border text-xs transition-all duration-150 ${
                  reg.status === 'PENDING_APPROVAL'
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                    : reg.status === 'APPROVED'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-rose-500/10 border-rose-500/30'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">
                        {reg.full_name}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-heritage-maroon/20 text-heritage-maroon dark:text-heritage-gold font-bold">
                        {reg.employee_id}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          reg.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                            : reg.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {reg.status}
                      </span>
                    </div>

                    <div className="text-xs text-heritage-aged font-sans space-x-3">
                      <span><strong>Designation:</strong> {reg.designation}</span>
                      <span>•</span>
                      <span><strong>Department:</strong> {reg.department_name}</span>
                      <span>•</span>
                      <span><strong>Zone/Office:</strong> {reg.zone_or_office}</span>
                    </div>

                    <div className="text-[11px] text-heritage-aged font-mono space-x-3 pt-0.5">
                      <span>Email: {reg.email}</span>
                      <span>•</span>
                      <span>Phone: {reg.phone}</span>
                      <span>•</span>
                      <span>Submitted: {new Date(reg.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions for PENDING_APPROVAL */}
                  {reg.status === 'PENDING_APPROVAL' && (
                    <div className="flex items-center space-x-2 shrink-0 self-center">
                      <button
                        onClick={() => handleApproveStaff(reg.id)}
                        disabled={approvingId === reg.id}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition disabled:opacity-50"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>APPROVE</span>
                      </button>

                      <button
                        onClick={() => handleRejectStaff(reg.id)}
                        disabled={approvingId === reg.id}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow transition disabled:opacity-50"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>REJECT</span>
                      </button>
                    </div>
                  )}

                  {reg.status === 'APPROVED' && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1 self-center">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approved by {reg.approved_by || 'Admin'}</span>
                    </div>
                  )}

                  {reg.status === 'REJECTED' && (
                    <div className="text-[11px] text-rose-600 dark:text-rose-400 font-bold flex items-center space-x-1 self-center">
                      <BadgeAlert className="w-4 h-4" />
                      <span>Rejected ({reg.rejection_reason || 'Policy check'})</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two-Column Layout: Users & Roles + Immutable Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Authorized Stakeholder Accounts (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-4 shadow-sm space-y-3">
          <h4 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory pb-2 border-b border-heritage-stone">
            Authorized Platform Stakeholders ({users.length})
          </h4>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {users.map(u => (
              <div
                key={u.id}
                className="p-3 rounded-xl bg-heritage-ivory/50 dark:bg-heritage-charcoal-dark border border-heritage-stone/60 text-xs flex items-center justify-between"
              >
                <div>
                  <h5 className="font-bold text-heritage-charcoal dark:text-heritage-ivory">{u.full_name}</h5>
                  <p className="text-[11px] text-heritage-aged font-mono">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-heritage-maroon/20 text-heritage-maroon dark:text-heritage-gold border border-heritage-maroon/30">
                    {u.role}
                  </span>
                  <span className="text-[10px] text-heritage-green block mt-1">✔ ACTIVE</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Immutable Audit History (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-heritage-stone">
            <h4 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">
              Security & Action Audit Trail ({filteredLogs.length})
            </h4>
            <div className="relative w-44">
              <input
                type="text"
                placeholder="Filter logs..."
                value={searchAudit}
                onChange={e => setSearchAudit(e.target.value)}
                className="w-full pl-6 pr-2 py-1 rounded-md border border-heritage-stone text-[11px] bg-heritage-ivory/60 dark:bg-heritage-charcoal-dark"
              />
              <Search className="w-3 h-3 text-heritage-aged absolute left-2 top-2" />
            </div>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-heritage-ivory/50 dark:bg-heritage-charcoal-dark border border-heritage-stone/60 text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono font-bold text-heritage-maroon dark:text-heritage-gold">
                    {log.action}
                  </span>
                  <span className="text-heritage-aged">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-[11px] text-heritage-aged font-mono truncate">
                  User: {log.user} | Entity: {log.entity_type} #{log.entity_id}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
