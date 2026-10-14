import React, { useState, useEffect, useRef } from 'react';
import { CitizenProvider, useCitizen, CitizenCase } from '../context/CitizenContext';
import { CitizenAuthModal } from '../components/CitizenAuthModal';
import { PanelRoleAuth } from '../components/PanelRoleAuth';
import { KonarkWheelIcon, IkatPatternDivider } from '../components/OdishaMotifs';
import {
  Home, FileText, Briefcase, Map, Users, Compass, Bell, Archive, User,
  HelpCircle, PlusCircle, Search, ChevronRight, AlertTriangle, CheckCircle,
  Clock, Flame, MapPin, Camera, Mic, Send, RefreshCw, Eye, Loader,
  ArrowLeft, Star, Download, MessageSquare, ThumbsUp, ThumbsDown,
  Shield, Phone, LogOut, Settings, X, Filter, SortAsc, Circle,
  Info, Zap, Navigation, Droplets, CloudRain, TreePine, Landmark,
  ChevronDown, ChevronUp, Copy, ExternalLink, BookOpen, LifeBuoy,
  Edit3, Image as ImageIcon, CheckCircle2, AlertCircle, Wifi,
  Globe
} from 'lucide-react';
import { ReportAndRequestCenter } from '../components/ReportAndRequestCenter';
import { CaseTrackingCenter } from '../components/CaseTrackingCenter';
import { ExploreCityCenter } from '../components/ExploreCityCenter';
import { CommunityHub } from '../components/CommunityHub';
import { SmartTourismCenter } from '../components/SmartTourismCenter';
import { UnifiedInboxCenter } from '../components/UnifiedInboxCenter';
import { ProfileAndRecordsCenter } from '../components/ProfileAndRecordsCenter';
import { HelpAndSupportCenter } from '../components/HelpAndSupportCenter';

// ─────────────────────────────────────────────────────────────────────────────
// INNER COMPONENT (wrapped by provider at the bottom)
// ─────────────────────────────────────────────────────────────────────────────
const CitizenPortalInner: React.FC = () => {
  const {
    citizenUser, isAuthenticated, showAuthModal, setShowAuthModal, setAuthMode,
    activeSection, navigateTo, cases, citizenNotifs, unreadCitizenNotifs, markNotifRead,
    logoutCitizen,
  } = useCitizen();

  const openLogin = () => { setAuthMode('login'); setShowAuthModal(true); };
  const openRegister = () => { setAuthMode('register'); setShowAuthModal(true); };

  // Nav items for the left sidebar
  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'report' as const, label: 'Report / Request', icon: PlusCircle },
    { id: 'cases' as const, label: 'My Cases', icon: Briefcase, badge: cases.filter(c => c.unread_updates > 0).length },
    { id: 'city_map' as const, label: 'City Map', icon: Map },
    { id: 'community' as const, label: 'Community', icon: Users },
    { id: 'tourism' as const, label: 'Smart Tourism', icon: Compass },
    { id: 'inbox' as const, label: 'Inbox', icon: Bell, badge: unreadCitizenNotifs },
    { id: 'records' as const, label: 'My Records', icon: Archive },
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'help' as const, label: 'Help & Support', icon: HelpCircle },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'home': return <HomeDashboard />;
      case 'report':
      case 'report_details':
      case 'report_location':
      case 'report_evidence':
      case 'report_review': return <ReportAndRequestCenter />;
      case 'cases':
      case 'case_detail': return <CaseTrackingCenter />;
      case 'city_map': return <ExploreCityCenter />;
      case 'city_alerts': return <CityAlerts />;
      case 'community': return <CommunityHub />;
      case 'tourism': return <SmartTourismCenter />;
      case 'inbox': return <UnifiedInboxCenter />;
      case 'records': return <ProfileAndRecordsCenter initialTab="records" />;
      case 'profile': return <ProfileAndRecordsCenter initialTab="overview" />;
      case 'help': return <HelpAndSupportCenter />;
      default: return <HomeDashboard />;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-7.5rem)] bg-heritage-ivory dark:bg-heritage-charcoal-dark">
      {/* ── Left Sidebar ───────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal sticky top-[7.5rem] h-[calc(100vh-7.5rem)] overflow-y-auto">
        {/* Profile pill */}
        <div className="p-4 border-b border-heritage-stone dark:border-heritage-charcoal flex flex-col gap-2">
          <PanelRoleAuth roleId="citizen" />
          {isAuthenticated && citizenUser ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-heritage-maroon text-heritage-gold flex items-center justify-center font-bold text-xs shrink-0">
                {citizenUser.avatar_initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory truncate">{citizenUser.name}</p>
                <p className="text-[10px] text-heritage-aged truncate">{citizenUser.ward}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] text-heritage-aged">Or use citizen fast-login:</p>
              <div className="flex space-x-2">
                <button onClick={openLogin} className="flex-1 py-1 text-[11px] font-semibold rounded-lg bg-heritage-maroon/20 text-heritage-maroon dark:text-heritage-gold border border-heritage-maroon/30 hover:bg-heritage-maroon/30 transition-colors">Sign In</button>
                <button onClick={openRegister} className="flex-1 py-1 text-[11px] font-semibold rounded-lg border border-heritage-maroon/30 text-heritage-maroon dark:text-heritage-gold hover:bg-heritage-maroon/5 transition-colors">Register</button>
              </div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id || (activeSection === 'case_detail' && item.id === 'cases');
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-heritage-maroon text-white shadow-sm'
                    : 'text-heritage-charcoal dark:text-heritage-stone hover:bg-heritage-stone/40 dark:hover:bg-heritage-charcoal-dark/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-heritage-gold' : 'text-heritage-aged'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-heritage-red text-white text-[9px] font-bold">{item.badge}</span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Logout / divider */}
        {isAuthenticated && (
          <div className="p-3 border-t border-heritage-stone dark:border-heritage-charcoal">
            <button onClick={logoutCitizen} className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-heritage-aged hover:text-heritage-red hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {renderSection()}
      </main>

      {/* Auth Modal */}
      <CitizenAuthModal />

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-heritage-charcoal border-t border-heritage-stone dark:border-heritage-charcoal flex justify-around py-2 px-1">
        {[
          { id: 'home' as const, label: 'Home', icon: Home },
          { id: 'cases' as const, label: 'Cases', icon: Briefcase },
          { id: 'report' as const, label: 'Report', icon: PlusCircle, primary: true },
          { id: 'city_map' as const, label: 'City', icon: Map },
          { id: 'profile' as const, label: 'Profile', icon: User },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`flex flex-col items-center space-y-0.5 px-2 py-1 rounded-xl transition-all ${
                item.primary
                  ? 'bg-heritage-maroon text-white px-4 -mt-3 shadow-heritage'
                  : isActive ? 'text-heritage-maroon dark:text-heritage-gold' : 'text-heritage-aged'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: HOME DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
const HomeDashboard: React.FC = () => {
  const { citizenUser, isAuthenticated, setShowAuthModal, setAuthMode, navigateTo, cases, citizenNotifs } = useCitizen();
  const actionRequired = cases.filter(c => c.status === 'AWAITING_CITIZEN');
  const active = cases.filter(c => !['CLOSED', 'COMPLETED'].includes(c.status));
  const resolved = cases.filter(c => c.status === 'CLOSED' || c.status === 'COMPLETED');

  const cityUpdates = [
    { icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Water Supply Disruption', detail: 'Saheed Nagar — 14 Oct, 6 AM–12 PM', type: 'official' },
    { icon: CloudRain, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'Cyclone Yellow Alert', detail: 'Coastal Odisha — IMD Advisory', type: 'warning' },
    { icon: Navigation, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', label: 'Road Closure — Janpath', detail: 'Storm drain repair till 15 Oct', type: 'official' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-24 lg:pb-6">
      {/* Welcome & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <KonarkWheelIcon size={22} className="text-heritage-maroon dark:text-heritage-gold" />
            <h1 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold">
              {isAuthenticated && citizenUser ? `Welcome, ${citizenUser.name.split(' ')[0]}` : 'Citizen Portal'}
            </h1>
          </div>
          <p className="text-xs text-heritage-aged mt-0.5">
            {isAuthenticated ? `${citizenUser?.ward} · ${citizenUser?.city}` : 'Sign in to report issues, track cases & access city services'}
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-heritage-aged" />
          <input
            type="text"
            placeholder="Search reports, ticket ID or services…"
            className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none"
          />
        </div>
      </div>

      <IkatPatternDivider />

      {/* 4 Primary Actions */}
      <div>
        <h2 className="text-xs font-bold text-heritage-aged uppercase tracking-widest mb-3">How can we help?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Flame, color: 'bg-heritage-maroon', textColor: 'text-white', title: 'Report a Problem', subtitle: 'Something is broken or unsafe', section: 'report' as const },
            { icon: Briefcase, color: 'bg-heritage-blue', textColor: 'text-white', title: 'Track a Case', subtitle: 'Check your complaint status', section: 'cases' as const },
            { icon: Map, color: 'bg-heritage-green', textColor: 'text-white', title: 'Explore City', subtitle: 'Map, facilities & alerts', section: 'city_map' as const },
            { icon: Users, color: 'bg-heritage-orange', textColor: 'text-white', title: 'Community', subtitle: 'Suggestions & consultations', section: 'community' as const },
          ].map(a => {
            const Icon = a.icon;
            return (
              <button
                key={a.title}
                onClick={() => navigateTo(a.section)}
                className="group flex flex-col items-start p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold shadow-sm hover:shadow-heritage transition-all text-left"
              >
                <div className={`p-2.5 rounded-xl ${a.color} mb-3 shadow-sm`}>
                  <Icon className={`w-4 h-4 ${a.textColor}`} />
                </div>
                <p className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">{a.title}</p>
                <p className="text-[10px] text-heritage-aged mt-0.5 leading-relaxed">{a.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Row */}
      {isAuthenticated && (
        <div className="grid grid-cols-3 gap-3">
          <div onClick={() => navigateTo('cases')} className="cursor-pointer p-3.5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm hover:border-heritage-gold transition-all text-center">
            <p className="text-2xl font-serif font-bold text-heritage-maroon dark:text-heritage-gold">{active.length}</p>
            <p className="text-[10px] text-heritage-aged font-semibold uppercase mt-0.5">Active Cases</p>
          </div>
          <div onClick={() => navigateTo('cases')} className="cursor-pointer p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 shadow-sm hover:border-heritage-gold transition-all text-center">
            <p className="text-2xl font-serif font-bold text-amber-600 dark:text-amber-400">{actionRequired.length}</p>
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase mt-0.5">Action Needed</p>
          </div>
          <div onClick={() => navigateTo('cases')} className="cursor-pointer p-3.5 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 shadow-sm hover:border-heritage-gold transition-all text-center">
            <p className="text-2xl font-serif font-bold text-green-600 dark:text-green-400">{resolved.length}</p>
            <p className="text-[10px] text-green-700 dark:text-green-400 font-semibold uppercase mt-0.5">Resolved</p>
          </div>
        </div>
      )}

      {/* Action Required Queue */}
      {isAuthenticated && actionRequired.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory uppercase tracking-widest mb-3 flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Action Required</span>
          </h2>
          <div className="space-y-2">
            {actionRequired.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800">
                <div>
                  <p className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">{c.ticket_id}</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">{c.last_event}</p>
                </div>
                <button
                  onClick={() => navigateTo('case_detail', { caseId: c.id })}
                  className="px-3 py-1.5 rounded-lg bg-heritage-maroon text-white text-[11px] font-semibold hover:bg-heritage-maroon-dark transition-colors flex items-center space-x-1"
                >
                  <span>Review</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {isAuthenticated && cases.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory uppercase tracking-widest">Recent Cases</h2>
            <button onClick={() => navigateTo('cases')} className="text-[11px] text-heritage-maroon dark:text-heritage-gold font-semibold hover:underline flex items-center space-x-0.5">
              <span>View all</span><ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {cases.slice(0, 3).map(c => <CaseCard key={c.id} c={c} />)}
          </div>
        </div>
      )}

      {/* City Updates */}
      <div>
        <h2 className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory uppercase tracking-widest mb-3">City Updates</h2>
        <div className="space-y-2">
          {cityUpdates.map((u, i) => {
            const Icon = u.icon;
            return (
              <div key={i} className={`flex items-start space-x-3 p-3.5 rounded-2xl border ${u.bg} ${u.type === 'warning' ? 'border-yellow-200 dark:border-yellow-800' : 'border-blue-100 dark:border-blue-900'}`}>
                <div className={`p-1.5 rounded-lg bg-white dark:bg-heritage-charcoal shadow-sm shrink-0`}>
                  <Icon className={`w-4 h-4 ${u.color}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">{u.label}</p>
                  <p className="text-[11px] text-heritage-aged mt-0.5">{u.detail}</p>
                  <span className="inline-flex items-center space-x-0.5 mt-1 text-[10px] font-semibold text-green-600 dark:text-green-400">
                    <Shield className="w-2.5 h-2.5" />
                    <span>Official Notice</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA for guests */}
      {!isAuthenticated && (
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-heritage-maroon to-heritage-maroon-dark text-white">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #C49A45 0px, #C49A45 1px, transparent 1px, transparent 12px)' }} />
          <KonarkWheelIcon size={40} className="absolute right-4 top-4 text-heritage-gold opacity-20" />
          <div className="relative z-10">
            <p className="font-serif font-bold text-lg">Join Civic Nexus AI</p>
            <p className="text-white/80 text-xs mt-1 max-w-sm">Report civic issues, track resolutions, and participate in building a smarter Odisha.</p>
            <div className="flex space-x-2 mt-4">
              <button onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
                className="px-4 py-2 rounded-xl bg-heritage-gold text-heritage-charcoal-dark font-bold text-xs shadow-md hover:brightness-110 transition-all">
                Create Account
              </button>
              <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/30 text-white font-semibold text-xs hover:bg-white/20 transition-all">
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: Case Card
// ─────────────────────────────────────────────────────────────────────────────
const statusMeta: Record<string, { label: string; color: string; dot: string }> = {
  SUBMITTED:       { label: 'Submitted',        color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',       dot: 'bg-gray-400' },
  UNDER_REVIEW:    { label: 'Under Review',      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
  ASSIGNED:        { label: 'Assigned',          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',    dot: 'bg-blue-500' },
  IN_PROGRESS:     { label: 'Work in Progress',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',    dot: 'bg-blue-500 animate-pulse' },
  AWAITING_CITIZEN:{ label: 'Action Needed',     color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500 animate-pulse' },
  COMPLETED:       { label: 'Completed',         color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500' },
  DISPUTED:        { label: 'Disputed',          color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',        dot: 'bg-red-500' },
  CLOSED:          { label: 'Closed',            color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',       dot: 'bg-gray-400' },
};

const CaseCard: React.FC<{ c: CitizenCase }> = ({ c }) => {
  const { navigateTo } = useCitizen();
  const meta = statusMeta[c.status] || statusMeta['SUBMITTED'];
  return (
    <button
      onClick={() => navigateTo('case_detail', { caseId: c.id })}
      className="w-full text-left p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold shadow-sm hover:shadow-heritage transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-mono text-[10px] font-bold text-heritage-maroon dark:text-heritage-gold">{c.ticket_id}</span>
            {c.unread_updates > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-heritage-red text-white text-[9px] font-bold">{c.unread_updates} new</span>
            )}
          </div>
          <h4 className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory line-clamp-1">{c.title}</h4>
          <p className="text-[11px] text-heritage-aged mt-0.5 line-clamp-1">{c.last_event}</p>
        </div>
        <div className="flex flex-col items-end space-y-2 shrink-0">
          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${meta.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            <span>{meta.label}</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-heritage-aged group-hover:text-heritage-gold transition-colors" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 text-[10px] text-heritage-aged">
        <span className="flex items-center space-x-0.5"><MapPin className="w-2.5 h-2.5" /><span className="truncate max-w-[180px]">{c.address}</span></span>
        <span>{new Date(c.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
      </div>
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: REPORT CENTER (Multi-step wizard)
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { group: 'Roads & Infrastructure', items: ['Road Damage / Pothole', 'Road Collapse', 'Footpath Issue', 'Bridge Damage'] },
  { group: 'Water & Drainage', items: ['Waterlogging', 'Flooding', 'Sewage Overflow', 'Water Supply Failure'] },
  { group: 'Cleanliness', items: ['Garbage Accumulation', 'Open Defecation Site', 'Drain Blockage'] },
  { group: 'Utilities', items: ['Streetlight Failure', 'Power Outage', 'Transformer Issue'] },
  { group: 'Safety & Hazard', items: ['Public Safety Hazard', 'Fire Risk', 'Illegal Encroachment', 'Tree Fall'] },
  { group: 'Public Facilities', items: ['Public Toilet Issue', 'Park Damage', 'Bus Stop Damage'] },
];

const ReportCenter: React.FC = () => {
  const { isAuthenticated, setShowAuthModal, setAuthMode, reportDraft, updateReportDraft, clearReportDraft, submitReport, submitting, navigateTo } = useCitizen();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [catSearch, setCatSearch] = useState('');
  const [isVoice, setIsVoice] = useState(false);
  const [voiceDone, setVoiceDone] = useState(false);
  const [gettingGPS, setGettingGPS] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const filteredCats = CATEGORIES.map(g => ({
    ...g,
    items: g.items.filter(i => !catSearch || (i ? String(i).toLowerCase().includes(catSearch.toLowerCase()) : false))
  })).filter(g => g.items.length > 0);

  const handleGPS = () => {
    setGettingGPS(true);
    navigator.geolocation.getCurrentPosition(
      pos => { updateReportDraft({ latitude: pos.coords.latitude.toFixed(4), longitude: pos.coords.longitude.toFixed(4) }); setGettingGPS(false); },
      () => { setGettingGPS(false); }
    );
  };

  const handleVoice = () => {
    setIsVoice(true);
    setTimeout(() => { setIsVoice(false); setVoiceDone(true); }, 2500);
  };

  const handleSubmitReport = async () => {
    const result = await submitReport();
    if (result.success) {
      setSubmitted(result.ticket_id || 'CNX-DEMO');
      setStep(1);
    }
  };

  const copyTicketId = (id: string) => {
    navigator.clipboard.writeText(id).catch(() => {});
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1500);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="p-4 rounded-full bg-heritage-maroon/10 mb-4"><PlusCircle className="w-8 h-8 text-heritage-maroon" /></div>
        <h2 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold">Sign in to Report</h2>
        <p className="text-xs text-heritage-aged mt-2 max-w-xs">You need to be signed in to file a civic complaint or service request.</p>
        <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="mt-5 px-6 py-2.5 rounded-xl bg-heritage-maroon text-white font-semibold text-sm hover:bg-heritage-maroon-dark transition-colors">Sign In</button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 animate-fade-in">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-heritage-maroon dark:text-heritage-gold">Report Submitted!</h2>
        <p className="text-xs text-heritage-aged mt-2">Your civic complaint has been registered successfully.</p>
        <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
          <p className="text-[10px] text-heritage-aged uppercase font-bold tracking-wider">Your Ticket ID</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="font-mono text-lg font-bold text-heritage-maroon dark:text-heritage-gold">{submitted}</span>
            <button onClick={() => copyTicketId(submitted)} className="p-1 rounded-md hover:bg-heritage-stone/40 transition-colors" title="Copy">
              {showCopied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-heritage-aged" />}
            </button>
          </div>
          <p className="text-[10px] text-heritage-aged mt-2">Save this ID to track your complaint anytime.</p>
        </div>
        <div className="flex space-x-3 mt-6">
          <button onClick={() => navigateTo('cases')} className="px-4 py-2 rounded-xl bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon-dark transition-colors">View My Cases</button>
          <button onClick={() => setSubmitted(null)} className="px-4 py-2 rounded-xl border border-heritage-stone dark:border-heritage-charcoal text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory hover:border-heritage-gold transition-colors">Report Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-5">
        <div className="p-2 rounded-xl bg-heritage-maroon/10"><PlusCircle className="w-5 h-5 text-heritage-maroon" /></div>
        <div>
          <h1 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold">Report a Problem</h1>
          <p className="text-xs text-heritage-aged">File a civic complaint or service request</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center mb-6">
        {['Category', 'Describe', 'Location', 'Evidence', 'Review'].map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                step === i + 1 ? 'border-heritage-maroon bg-heritage-maroon text-white'
                : step > i + 1 ? 'border-heritage-green bg-heritage-green text-white'
                : 'border-heritage-stone dark:border-heritage-charcoal text-heritage-aged bg-white dark:bg-heritage-charcoal'
              }`}>
                {step > i + 1 ? <CheckCircle className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-[9px] mt-1 font-medium hidden sm:block ${step === i + 1 ? 'text-heritage-maroon dark:text-heritage-gold' : 'text-heritage-aged'}`}>{s}</span>
            </div>
            {i < 4 && <div className={`flex-1 h-0.5 mx-1 transition-all ${step > i + 1 ? 'bg-heritage-green' : 'bg-heritage-stone dark:bg-heritage-charcoal'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-5 shadow-sm">

        {/* Step 1: Category */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">What problem are you facing?</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-heritage-aged" />
              <input value={catSearch} onChange={e => setCatSearch(e.target.value)}
                placeholder="Search category…" className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none" />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {filteredCats.map(g => (
                <div key={g.group}>
                  <p className="text-[10px] font-bold text-heritage-aged uppercase tracking-wider mb-1.5">{g.group}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {g.items.map(item => (
                      <button key={item} onClick={() => { updateReportDraft({ category: item }); }}
                        className={`px-3 py-2 rounded-xl text-[11px] font-medium text-left transition-all border ${
                          reportDraft.category === item
                            ? 'border-heritage-maroon bg-heritage-maroon/10 text-heritage-maroon dark:text-heritage-gold font-semibold'
                            : 'border-heritage-stone dark:border-heritage-charcoal text-heritage-charcoal dark:text-heritage-stone hover:border-heritage-gold'
                        }`}>{item}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-heritage-aged p-3 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark/50">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Not sure of the category? AI will assist in the next step.</span>
            </div>
          </div>
        )}

        {/* Step 2: Describe */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">Describe the issue</h3>
            <div>
              <label className="block text-[11px] font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">Issue Title *</label>
              <input value={reportDraft.title} onChange={e => updateReportDraft({ title: e.target.value })}
                placeholder="e.g., Large pothole near Rasulgarh underpass"
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">Detailed Description *</label>
              <textarea rows={4} value={reportDraft.description} onChange={e => updateReportDraft({ description: e.target.value })}
                placeholder="Explain the hazard, severity, and impact on commuters or residents…"
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none resize-none" />
              <p className="text-[10px] text-heritage-aged mt-1 text-right">{reportDraft.description?.length || 0} chars</p>
            </div>
            <button onClick={handleVoice}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all w-full justify-center ${
                isVoice ? 'bg-heritage-red text-white animate-pulse'
                : voiceDone ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300'
                : 'bg-heritage-stone/30 dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-stone border border-heritage-stone dark:border-heritage-charcoal'}`}>
              <Mic className="w-4 h-4" />
              <span>{isVoice ? 'Recording…' : voiceDone ? 'Voice Note Saved ✓' : 'Or Record a Voice Description'}</span>
            </button>
            <div className="flex items-center space-x-2 text-[11px] text-heritage-aged p-3 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark/50">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <span>Avoid including personal phone numbers or identifying faces in your description.</span>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">Pin the exact location</h3>
            <div>
              <label className="block text-[11px] font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">Address / Landmark *</label>
              <input value={reportDraft.address} onChange={e => updateReportDraft({ address: e.target.value })}
                placeholder="e.g., Rasulgarh Underpass, NH-16, Bhubaneswar"
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none" />
            </div>
            <button onClick={handleGPS} disabled={gettingGPS}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-heritage-blue/10 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-semibold hover:bg-heritage-blue/20 transition-all w-full justify-center disabled:opacity-60">
              {gettingGPS ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
              <span>{gettingGPS ? 'Getting GPS…' : 'Use My Current Location'}</span>
            </button>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-heritage-aged mb-1">Latitude</label>
                <input type="number" value={reportDraft.latitude} onChange={e => updateReportDraft({ latitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-heritage-aged mb-1">Longitude</label>
                <input type="number" value={reportDraft.longitude} onChange={e => updateReportDraft({ longitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none" />
              </div>
            </div>
            <div className="h-32 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark/50 border border-heritage-stone dark:border-heritage-charcoal flex items-center justify-center text-xs text-heritage-aged">
              <div className="text-center">
                <MapPin className="w-6 h-6 text-heritage-maroon mx-auto mb-1" />
                <p>Map pin at: {reportDraft.latitude}, {reportDraft.longitude}</p>
                <p className="text-[10px] mt-0.5 text-heritage-aged/70">Interactive map in production build</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Evidence */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">Attach evidence (optional)</h3>
            <div className="border-2 border-dashed border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-6 text-center hover:border-heritage-gold transition-colors cursor-pointer">
              <Camera className="w-8 h-8 text-heritage-aged mx-auto mb-2" />
              <p className="text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory">Take a photo or upload from gallery</p>
              <p className="text-[11px] text-heritage-aged mt-1">JPG, PNG, WebP · Max 10MB each</p>
              <button className="mt-3 px-4 py-2 rounded-xl bg-heritage-maroon/10 text-heritage-maroon dark:text-heritage-gold text-xs font-semibold hover:bg-heritage-maroon/20 transition-colors">Choose Files</button>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-heritage-aged p-3 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark/50">
              <Shield className="w-3.5 h-3.5 shrink-0 text-heritage-maroon" />
              <span>Your photos are stored securely. Faces in public spaces may be blurred in public views.</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-heritage-aged p-3 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark/50">
              <Wifi className="w-3.5 h-3.5 shrink-0 text-blue-500" />
              <span>On slow connections, photos are compressed automatically. Upload failures do not discard your report.</span>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">Review & Submit</h3>
            <div className="space-y-3">
              {[
                { label: 'Category', value: reportDraft.category, step: 1 },
                { label: 'Title', value: reportDraft.title, step: 2 },
                { label: 'Description', value: reportDraft.description, step: 2 },
                { label: 'Location', value: `${reportDraft.address} (${reportDraft.latitude}, ${reportDraft.longitude})`, step: 3 },
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between p-3 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark/50">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-heritage-aged uppercase tracking-wide">{row.label}</p>
                    <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory mt-0.5 line-clamp-2">{row.value || <span className="italic text-heritage-aged">Not set</span>}</p>
                  </div>
                  <button onClick={() => setStep(row.step)} className="text-[10px] text-heritage-maroon dark:text-heritage-gold font-semibold hover:underline ml-2">Edit</button>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark/50 text-[11px] text-heritage-aged">
              <p className="font-semibold text-heritage-charcoal dark:text-heritage-ivory mb-1">Before you submit:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Your report will be assigned a unique ticket ID.</li>
                <li>AI will verify category and route to the correct department.</li>
                <li>You'll receive notifications for every major update.</li>
                <li>Your identity is visible only to authorized department staff.</li>
              </ul>
            </div>
            <button onClick={handleSubmitReport} disabled={submitting || !reportDraft.title || !reportDraft.description}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-heritage-maroon to-heritage-maroon-dark text-white font-semibold text-sm shadow-heritage hover:brightness-110 transition-all disabled:opacity-50">
              {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-heritage-gold" />}
              <span>{submitting ? 'Submitting…' : 'Submit Report'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-4">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigateTo('home')}
          className="flex items-center space-x-1 px-4 py-2 rounded-xl border border-heritage-stone dark:border-heritage-charcoal text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory hover:border-heritage-gold transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{step === 1 ? 'Cancel' : 'Back'}</span>
        </button>
        {step < 5 && (
          <button onClick={() => setStep(step + 1)}
            disabled={step === 1 && !reportDraft.category || step === 2 && (!reportDraft.title || !reportDraft.description)}
            className="flex items-center space-x-1 px-5 py-2 rounded-xl bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon-dark transition-colors disabled:opacity-50">
            <span>Continue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: MY CASES
// ─────────────────────────────────────────────────────────────────────────────
const MyCases: React.FC = () => {
  const { cases, isAuthenticated, setShowAuthModal, setAuthMode, navigateTo } = useCitizen();
  const [filter, setFilter] = useState('ALL');

  const filters = [
    { key: 'ALL', label: 'All' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'AWAITING_CITIZEN', label: 'Action Needed' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'CLOSED', label: 'Closed' },
  ];

  const filtered = cases.filter(c =>
    filter === 'ALL' ? true :
    filter === 'ACTIVE' ? !['CLOSED', 'COMPLETED'].includes(c.status) :
    c.status === filter
  );

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <Briefcase className="w-10 h-10 text-heritage-aged mb-3" />
        <h2 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold">My Cases</h2>
        <p className="text-xs text-heritage-aged mt-2 max-w-xs">Sign in to view and track all your complaint cases.</p>
        <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="mt-5 px-6 py-2.5 rounded-xl bg-heritage-maroon text-white font-semibold text-sm">Sign In</button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 pb-24 lg:pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold">My Cases</h1>
        <button onClick={() => navigateTo('report')} className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon-dark transition-colors">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Report</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-1.5 mb-5 overflow-x-auto pb-1">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
              filter === f.key ? 'bg-heritage-maroon text-white' : 'bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal text-heritage-charcoal dark:text-heritage-stone hover:border-heritage-gold'
            }`}>
            {f.label} {f.key === 'ALL' ? `(${cases.length})` : f.key === 'AWAITING_CITIZEN' ? `(${cases.filter(c => c.status === 'AWAITING_CITIZEN').length})` : ''}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Briefcase className="w-10 h-10 text-heritage-aged mb-3 opacity-40" />
          <p className="font-semibold text-sm text-heritage-charcoal dark:text-heritage-ivory">No cases in this category</p>
          <p className="text-xs text-heritage-aged mt-1">Try changing your filter or report a new issue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => <CaseCard key={c.id} c={c} />)}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: CASE DETAIL
// ─────────────────────────────────────────────────────────────────────────────
const CaseDetail: React.FC = () => {
  const { cases, selectedCaseId, navigateTo } = useCitizen();
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'evidence' | 'messages'>('overview');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, from: 'Citizen', text: 'When will the pothole be fixed? It is causing accidents daily.', time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 2, from: 'Department', text: 'Thank you for reporting. Our team is scheduled for repair on 14 Oct. We apologize for the inconvenience.', time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  ]);

  const c = cases.find(x => x.id === selectedCaseId) || cases[0];
  if (!c) return null;

  const meta = statusMeta[c.status] || statusMeta['SUBMITTED'];
  const tabs = ['overview', 'timeline', 'evidence', 'messages'] as const;

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), from: 'Citizen', text: message, time: new Date().toISOString() }]);
    setMessage('');
  };

  return (
    <div className="p-4 sm:p-6 pb-24 lg:pb-6 max-w-3xl">
      {/* Back + Header */}
      <button onClick={() => navigateTo('cases')} className="flex items-center space-x-1 text-[11px] text-heritage-aged hover:text-heritage-maroon dark:hover:text-heritage-gold mb-4 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to My Cases</span>
      </button>

      <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-5 mb-4 shadow-sm">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-mono text-xs font-bold text-heritage-maroon dark:text-heritage-gold">{c.ticket_id}</span>
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${meta.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                <span>{meta.label}</span>
              </span>
            </div>
            <h2 className="font-serif font-bold text-lg text-heritage-charcoal dark:text-heritage-ivory">{c.title}</h2>
            <p className="text-[11px] text-heritage-aged mt-0.5 flex items-center space-x-1">
              <MapPin className="w-2.5 h-2.5" /><span>{c.address}</span>
            </p>
          </div>
          <div className="text-right text-[10px] text-heritage-aged">
            <p>Filed: {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p>Updated: {new Date(c.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
          </div>
        </div>

        {/* Action Required Banner */}
        {c.status === 'AWAITING_CITIZEN' && !confirmed && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /><span>Your action is required</span>
            </p>
            <p className="text-[11px] text-amber-600 dark:text-amber-500 mt-1">{c.last_event}</p>
            {!showConfirm ? (
              <button onClick={() => setShowConfirm(true)} className="mt-2 px-4 py-1.5 rounded-lg bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon-dark transition-colors">
                Review Resolution
              </button>
            ) : (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Was the issue resolved?</p>
                {[
                  { key: 'resolved', label: '✓ Issue is fully resolved', color: 'border-green-400 text-green-700 hover:bg-green-50' },
                  { key: 'partial', label: '~ Partially resolved', color: 'border-amber-400 text-amber-700 hover:bg-amber-50' },
                  { key: 'not_resolved', label: '✗ Issue still exists', color: 'border-red-400 text-red-700 hover:bg-red-50' },
                  { key: 'wrong', label: '? Wrong location / wrong issue', color: 'border-gray-400 text-gray-700 hover:bg-gray-50' },
                ].map(opt => (
                  <button key={opt.key} onClick={() => setConfirmed(opt.key)}
                    className={`w-full p-2 rounded-lg border text-xs font-medium text-left transition-all dark:bg-heritage-charcoal-dark dark:text-heritage-stone ${opt.color}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {confirmed && (
          <div className="mt-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-xs text-green-700 dark:text-green-400 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Your response "<b>{confirmed.replace('_', ' ')}</b>" has been recorded. A receipt will be generated.</span>
          </div>
        )}

        {/* Next step */}
        <div className="mt-4 p-3 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark/50">
          <p className="text-[10px] font-bold text-heritage-aged uppercase tracking-wide">Next Step</p>
          <p className="text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory mt-0.5">{c.last_event}</p>
          {c.department && <p className="text-[11px] text-heritage-aged mt-0.5">Responsible: {c.department}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-4 overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all capitalize ${
              activeTab === t ? 'bg-heritage-maroon text-white' : 'bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal text-heritage-charcoal dark:text-heritage-stone hover:border-heritage-gold'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-5 shadow-sm">
          <h4 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory mb-3">Case Details</h4>
          <div className="space-y-3 text-xs">
            {[
              { label: 'Category', value: c.category },
              { label: 'Description', value: c.description },
              { label: 'Department', value: c.department || 'Pending assignment' },
              { label: 'Filed', value: new Date(c.created_at).toLocaleString('en-IN') },
              { label: 'Last Update', value: new Date(c.updated_at).toLocaleString('en-IN') },
            ].map(row => (
              <div key={row.label} className="grid grid-cols-3 gap-2 border-b border-heritage-stone/30 dark:border-heritage-charcoal pb-2">
                <span className="font-semibold text-heritage-aged">{row.label}</span>
                <span className="col-span-2 text-heritage-charcoal dark:text-heritage-ivory">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-heritage-stone dark:border-heritage-charcoal text-[11px] font-semibold text-heritage-charcoal dark:text-heritage-stone hover:border-heritage-gold transition-colors">
              <Download className="w-3 h-3" /><span>Download Receipt</span>
            </button>
            <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 dark:text-red-400 text-[11px] font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
              <AlertCircle className="w-3 h-3" /><span>Report Wrong Status</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab: Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-5 shadow-sm">
          <h4 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory mb-4">Complete Activity Timeline</h4>
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-heritage-stone dark:bg-heritage-charcoal" />
            <div className="space-y-5">
              {c.timeline.map((ev, i) => (
                <div key={ev.id} className="relative">
                  <div className={`absolute -left-4 w-3 h-3 rounded-full border-2 ${i === c.timeline.length - 1 ? 'border-heritage-maroon bg-heritage-maroon' : 'border-heritage-stone bg-white dark:border-heritage-charcoal dark:bg-heritage-charcoal-dark'}`} />
                  <div className="ml-1">
                    <p className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">{ev.event}</p>
                    <p className="text-[11px] text-heritage-aged mt-0.5">{ev.description}</p>
                    <div className="flex items-center space-x-2 mt-1 text-[10px] text-heritage-aged">
                      <span>{new Date(ev.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="px-1.5 py-0.5 rounded bg-heritage-stone/40 dark:bg-heritage-charcoal-dark">{ev.source}</span>
                      {ev.action_required && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Action needed</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Evidence */}
      {activeTab === 'evidence' && (
        <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-5 shadow-sm">
          <h4 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory mb-3">Evidence Gallery</h4>
          {c.evidence_urls.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {c.evidence_urls.map((url, i) => (
                <img key={i} src={url} alt={`Evidence ${i + 1}`} className="w-full h-32 object-cover rounded-xl border border-heritage-stone dark:border-heritage-charcoal" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 text-center">
              <ImageIcon className="w-10 h-10 text-heritage-aged opacity-40 mb-2" />
              <p className="text-xs text-heritage-aged">No evidence attached to this case.</p>
              <button className="mt-3 px-4 py-1.5 rounded-xl border border-heritage-stone dark:border-heritage-charcoal text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone hover:border-heritage-gold transition-colors">Upload Evidence</button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Messages */}
      {activeTab === 'messages' && (
        <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-5 shadow-sm">
          <h4 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory mb-4">Case Messages</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.from === 'Citizen' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${m.from === 'Citizen' ? 'bg-heritage-maroon text-white rounded-tr-sm' : 'bg-heritage-stone/30 dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory rounded-tl-sm'}`}>
                  <p className="text-[10px] font-bold opacity-70 mb-0.5">{m.from}</p>
                  <p className="text-xs">{m.text}</p>
                  <p className="text-[9px] opacity-60 mt-1">{new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask the department a question…"
              className="flex-1 px-3 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none" />
            <button onClick={sendMessage} className="p-2.5 rounded-xl bg-heritage-maroon text-white hover:bg-heritage-maroon-dark transition-colors">
              <Send className="w-3.5 h-3.5 text-heritage-gold" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: CITY MAP
// ─────────────────────────────────────────────────────────────────────────────
const CityMap: React.FC = () => {
  const { navigateTo } = useCitizen();
  const layers = [
    { icon: Circle, color: 'text-red-500', label: 'Active Hazards', count: 3 },
    { icon: Navigation, color: 'text-orange-500', label: 'Road Closures', count: 2 },
    { icon: Droplets, color: 'text-blue-500', label: 'Waterlogging', count: 1 },
    { icon: TreePine, color: 'text-green-500', label: 'Parks & Recreation', count: 12 },
    { icon: Landmark, color: 'text-heritage-maroon', label: 'Civic Offices', count: 8 },
  ];

  const points = [
    { lat: 20.296, lng: 85.824, label: 'Rasulgarh – Pothole (IN PROGRESS)', type: 'hazard' },
    { lat: 20.269, lng: 85.840, label: 'Master Canteen – Streetlight (ACTION NEEDED)', type: 'action' },
    { lat: 20.280, lng: 85.842, label: 'Unit-4 Market – Garbage (CLOSED)', type: 'closed' },
  ];

  return (
    <div className="p-4 sm:p-6 pb-24 lg:pb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold">Explore My City</h1>
          <p className="text-xs text-heritage-aged">Civic map, public facilities & verified alerts</p>
        </div>
        <button onClick={() => navigateTo('city_alerts')} className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" /><span>City Alerts</span>
        </button>
      </div>

      {/* Layer Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {layers.map(l => {
          const Icon = l.icon;
          return (
            <button key={l.label} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal text-xs font-medium hover:border-heritage-gold transition-colors">
              <Icon className={`w-3.5 h-3.5 ${l.color}`} />
              <span className="text-heritage-charcoal dark:text-heritage-stone">{l.label}</span>
              <span className="px-1 py-0.5 rounded bg-heritage-stone/40 dark:bg-heritage-charcoal-dark text-[9px] font-bold">{l.count}</span>
            </button>
          );
        })}
      </div>

      {/* Map placeholder */}
      <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden border border-heritage-stone dark:border-heritage-charcoal bg-heritage-stone/20 dark:bg-heritage-charcoal-dark/50 mb-4">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Map className="w-12 h-12 text-heritage-maroon/30 mx-auto mb-2" />
            <p className="text-xs text-heritage-aged font-semibold">Interactive Map (Leaflet/MapLibre)</p>
            <p className="text-[10px] text-heritage-aged/70 mt-1">Live map with incident markers loads in production</p>
          </div>
        </div>
        {/* Simulated markers */}
        {points.map((p, i) => (
          <div key={i}
            className={`absolute flex flex-col items-center cursor-pointer group`}
            style={{ left: `${20 + i * 30}%`, top: `${30 + (i % 2) * 25}%` }}>
            <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md ${p.type === 'hazard' ? 'bg-red-500' : p.type === 'action' ? 'bg-amber-500' : 'bg-green-500'}`} />
            <div className="hidden group-hover:block absolute -top-8 bg-heritage-charcoal text-white text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap shadow-lg z-10">{p.label}</div>
          </div>
        ))}
      </div>

      {/* Nearby Facilities */}
      <h3 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory mb-3">Nearby Public Facilities</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { icon: Landmark, name: 'BMC Ward Office – Zone 2', dist: '0.8 km', hours: 'Mon–Sat, 10 AM–5 PM', accessible: true },
          { icon: TreePine, name: 'Ekamra Park', dist: '1.2 km', hours: 'Open all week, 5 AM–9 PM', accessible: true },
          { icon: Globe, name: 'Public Library – Bhubaneswar', dist: '1.5 km', hours: 'Mon–Fri, 9 AM–7 PM', accessible: false },
          { icon: Phone, name: 'Emergency Control Room', dist: '2.1 km', hours: '24/7', accessible: true },
        ].map(f => {
          const Icon = f.icon;
          return (
            <div key={f.name} className="p-3.5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold transition-all">
              <div className="flex items-start space-x-3">
                <div className="p-1.5 rounded-xl bg-heritage-maroon/10"><Icon className="w-4 h-4 text-heritage-maroon" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory line-clamp-1">{f.name}</p>
                  <p className="text-[10px] text-heritage-aged mt-0.5">{f.dist} · {f.hours}</p>
                  {f.accessible && <span className="text-[9px] text-green-600 font-semibold">♿ Accessible</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: CITY ALERTS
// ─────────────────────────────────────────────────────────────────────────────
const CityAlerts: React.FC = () => {
  const alerts = [
    { type: 'OFFICIAL', icon: Droplets, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', title: 'Water Supply Disruption — Saheed Nagar', area: 'Saheed Nagar, Bhubaneswar', time: '14 Oct, 6 AM – 12 PM', authority: 'BMC Water Supply Dept', detail: 'Scheduled maintenance work. Store water in advance.' },
    { type: 'WARNING', icon: CloudRain, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20', title: 'Cyclone Yellow Alert', area: 'Coastal Odisha', time: '13–15 Oct', authority: 'India Meteorological Department', detail: 'Heavy rainfall expected. Avoid low-lying areas and travel near flooded roads.' },
    { type: 'CLOSURE', icon: Navigation, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20', title: 'Road Closure — Janpath', area: 'Janpath Bhubaneswar', time: '12–16 Oct', authority: 'Public Works Department', detail: 'Storm drain repair work in progress. Use Ashok Nagar flyover route.' },
  ];

  return (
    <div className="p-4 sm:p-6 pb-24 lg:pb-6">
      <h1 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold mb-1">City Disruption Centre</h1>
      <p className="text-xs text-heritage-aged mb-4">Official notices and verified alerts only</p>
      <div className="space-y-3">
        {alerts.map((a, i) => {
          const Icon = a.icon;
          return (
            <div key={i} className={`p-4 rounded-2xl border ${a.color.includes('blue') ? 'border-blue-200 dark:border-blue-800' : a.color.includes('yellow') ? 'border-yellow-200 dark:border-yellow-800' : 'border-orange-200 dark:border-orange-800'} ${a.color.split(' ')[1]} ${a.color.split(' ')[2] || ''}`}>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-white dark:bg-heritage-charcoal shadow-sm shrink-0"><Icon className={`w-4 h-4 ${a.color.split(' ')[0]}`} /></div>
                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-1">
                    <h4 className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">{a.title}</h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${a.type === 'OFFICIAL' ? 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : a.type === 'WARNING' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-300'}`}>{a.type}</span>
                  </div>
                  <p className="text-[11px] text-heritage-aged mt-1">{a.detail}</p>
                  <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-heritage-aged">
                    <span><MapPin className="w-2.5 h-2.5 inline" /> {a.area}</span>
                    <span><Clock className="w-2.5 h-2.5 inline" /> {a.time}</span>
                  </div>
                  <p className="text-[10px] text-heritage-aged/70 mt-1 flex items-center space-x-0.5"><Shield className="w-2.5 h-2.5" /><span>Source: {a.authority}</span></p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: COMMUNITY
// ─────────────────────────────────────────────────────────────────────────────
const Community: React.FC = () => {
  const [tab, setTab] = useState<'suggestions' | 'consultations'>('suggestions');
  const suggestions = [
    { id: 'sg1', title: 'Add cycle lane on Rasulgarh–BBSR stretch', theme: 'Mobility', votes: 128, status: 'UNDER_REVIEW', author: 'Community Member' },
    { id: 'sg2', title: 'Install waste segregation bins at Unit-4 Market', theme: 'Cleanliness', votes: 94, status: 'ACCEPTED', author: 'Eco Odisha Group' },
    { id: 'sg3', title: 'Accessible ramp at Ekamra Park entrance', theme: 'Accessibility', votes: 67, status: 'DEFERRED', author: 'Disability Rights Forum' },
  ];
  const consultations = [
    { id: 'c1', title: 'Smart Parking Policy — Bhubaneswar 2027', open: true, authority: 'BMC Planning Dept', closes: '25 Oct 2026', responses: 342 },
    { id: 'c2', title: 'Green Cover Expansion Plan — Infocity Corridor', open: false, authority: 'Forest & Environment Dept', closes: '10 Oct 2026 (Closed)', responses: 892 },
  ];

  return (
    <div className="p-4 sm:p-6 pb-24 lg:pb-6">
      <h1 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold mb-1">Community & Participation</h1>
      <p className="text-xs text-heritage-aged mb-4">Submit suggestions, vote on ideas, and participate in city consultations</p>

      <div className="flex space-x-1 mb-5">
        {(['suggestions', 'consultations'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-[11px] font-semibold capitalize transition-all ${tab === t ? 'bg-heritage-maroon text-white' : 'bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal text-heritage-charcoal dark:text-heritage-stone hover:border-heritage-gold'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'suggestions' && (
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl border-2 border-dashed border-heritage-stone dark:border-heritage-charcoal text-xs font-semibold text-heritage-maroon dark:text-heritage-gold hover:border-heritage-gold transition-colors">
            <PlusCircle className="w-4 h-4" /><span>Submit a new suggestion</span>
          </button>
          {suggestions.map(s => (
            <div key={s.id} className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">{s.title}</h4>
                  <p className="text-[10px] text-heritage-aged mt-0.5">Theme: {s.theme} · By {s.author}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${s.status === 'ACCEPTED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : s.status === 'DEFERRED' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>{s.status.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center space-x-3 mt-3">
                <button className="flex items-center space-x-1 text-[11px] text-heritage-aged hover:text-heritage-maroon transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5" /><span>{s.votes} support</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'consultations' && (
        <div className="space-y-3">
          {consultations.map(c => (
            <div key={c.id} className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold transition-all">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">{c.title}</h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${c.open ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{c.open ? 'OPEN' : 'CLOSED'}</span>
              </div>
              <p className="text-[10px] text-heritage-aged mt-1">{c.authority} · Closes: {c.closes}</p>
              <p className="text-[10px] text-heritage-aged">{c.responses} responses submitted</p>
              {c.open && <button className="mt-3 px-4 py-1.5 rounded-xl bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon-dark transition-colors">Participate</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: TOURISM
// ─────────────────────────────────────────────────────────────────────────────
const Tourism: React.FC = () => {
  const places = [
    { name: 'Konark Sun Temple', odia: 'କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର', cat: 'Heritage Site', dist: '65 km from Bhubaneswar', hours: '6 AM – 8 PM', accessible: true, img: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400' },
    { name: 'Puri Jagannath Temple', odia: 'ଜଗନ୍ନାଥ ମନ୍ଦିର', cat: 'Pilgrimage', dist: '60 km', hours: '5 AM – 11 PM', accessible: false, img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
    { name: 'Chilika Lake', odia: 'ଚିଲିକା ହ୍ରଦ', cat: 'Natural Heritage', dist: '90 km', hours: 'Sunrise – Sunset', accessible: true, img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400' },
    { name: 'Ratnagiri Buddhist Ruins', odia: 'ରତ୍ନଗିରି ବୌଦ୍ଧ ସ୍ଥଳ', cat: 'Archaeological Site', dist: '100 km', hours: '9 AM – 5 PM', accessible: false, img: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=400' },
  ];

  return (
    <div className="p-4 sm:p-6 pb-24 lg:pb-6">
      <div className="relative rounded-2xl overflow-hidden mb-5 bg-heritage-maroon p-6">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(60deg, #C49A45 0px, #C49A45 1px, transparent 1px, transparent 15px)' }} />
        <KonarkWheelIcon size={48} className="absolute right-4 top-4 text-heritage-gold opacity-30" />
        <div className="relative z-10">
          <h1 className="font-serif font-bold text-2xl text-white">Odisha Smart Tourism</h1>
          <p className="text-heritage-gold/80 text-xs mt-1">Heritage Explorer · Culture & Crafts · Trip Planner</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-heritage-aged" />
        <input placeholder="Search attractions by name, district or interest…" className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none" />
      </div>

      <div className="flex space-x-1.5 mb-5 overflow-x-auto pb-1">
        {['All', 'Heritage', 'Nature', 'Pilgrimage', 'Culture', 'Adventure'].map(tag => (
          <button key={tag} className="px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal text-heritage-charcoal dark:text-heritage-stone hover:border-heritage-gold transition-all">
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {places.map(p => (
          <div key={p.name} className="rounded-2xl overflow-hidden bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm hover:shadow-heritage hover:border-heritage-gold transition-all group">
            <div className="relative h-36 overflow-hidden">
              <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-heritage-charcoal/70 to-transparent" />
              <div className="absolute bottom-2 left-3">
                <span className="text-[10px] font-bold text-heritage-gold bg-heritage-maroon/80 px-2 py-0.5 rounded-md">{p.cat}</span>
              </div>
              {p.accessible && <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-green-500/80 text-white text-[9px] font-bold">♿ Accessible</div>}
            </div>
            <div className="p-3.5">
              <h4 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">{p.name}</h4>
              <p className="text-[10px] text-heritage-maroon dark:text-heritage-gold font-medium">{p.odia}</p>
              <div className="flex items-center justify-between mt-2 text-[10px] text-heritage-aged">
                <span><MapPin className="w-2.5 h-2.5 inline" /> {p.dist}</span>
                <span><Clock className="w-2.5 h-2.5 inline" /> {p.hours}</span>
              </div>
              <div className="flex space-x-2 mt-3">
                <button className="flex-1 py-1.5 rounded-lg bg-heritage-maroon text-white text-[11px] font-semibold hover:bg-heritage-maroon-dark transition-colors">Explore</button>
                <button className="flex-1 py-1.5 rounded-lg border border-heritage-stone dark:border-heritage-charcoal text-heritage-charcoal dark:text-heritage-stone text-[11px] font-semibold hover:border-heritage-gold transition-colors">Save</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: INBOX
// ─────────────────────────────────────────────────────────────────────────────
const Inbox: React.FC = () => {
  const { citizenNotifs, markNotifRead, navigateTo } = useCitizen();
  const [tab, setTab] = useState<'ALL' | 'CASE' | 'CITY' | 'MESSAGE'>('ALL');

  const filtered = citizenNotifs.filter(n => tab === 'ALL' ? true : n.type === tab);

  return (
    <div className="p-4 sm:p-6 pb-24 lg:pb-6">
      <h1 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold mb-1">Notifications & Inbox</h1>
      <p className="text-xs text-heritage-aged mb-4">{citizenNotifs.filter(n => !n.is_read).length} unread notifications</p>

      <div className="flex space-x-1 mb-5">
        {(['ALL', 'CASE', 'CITY', 'MESSAGE'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${tab === t ? 'bg-heritage-maroon text-white' : 'bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal text-heritage-charcoal dark:text-heritage-stone hover:border-heritage-gold'}`}>
            {t === 'ALL' ? 'All' : t === 'CASE' ? 'Cases' : t === 'CITY' ? 'City' : 'Messages'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Bell className="w-10 h-10 text-heritage-aged opacity-30 mb-2" />
            <p className="text-sm font-semibold text-heritage-charcoal dark:text-heritage-ivory">No notifications here</p>
          </div>
        ) : (
          filtered.map(n => (
            <button key={n.id} onClick={() => {
              markNotifRead(n.id);
              if (n.case_id) navigateTo('case_detail', { caseId: n.case_id });
            }}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${!n.is_read ? 'bg-white dark:bg-heritage-charcoal border-heritage-gold/40' : 'bg-heritage-ivory/40 dark:bg-heritage-charcoal-dark/40 border-heritage-stone dark:border-heritage-charcoal'} hover:border-heritage-gold`}>
              <div className="flex items-start space-x-3">
                <div className={`p-1.5 rounded-xl shrink-0 ${n.type === 'CASE' ? 'bg-heritage-maroon/10' : n.type === 'CITY' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                  {n.type === 'CASE' ? <Briefcase className="w-3.5 h-3.5 text-heritage-maroon" /> : n.type === 'CITY' ? <Bell className="w-3.5 h-3.5 text-blue-600" /> : <MessageSquare className="w-3.5 h-3.5 text-green-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs font-bold truncate ${!n.is_read ? 'text-heritage-charcoal dark:text-heritage-ivory' : 'text-heritage-aged'}`}>{n.title}</p>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-heritage-red shrink-0" />}
                  </div>
                  <p className="text-[11px] text-heritage-aged mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-heritage-aged/70 mt-1">{new Date(n.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: RECORDS
// ─────────────────────────────────────────────────────────────────────────────
const Records: React.FC = () => {
  const { cases, isAuthenticated, setShowAuthModal, setAuthMode } = useCitizen();
  if (!isAuthenticated) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <Archive className="w-10 h-10 text-heritage-aged mb-3" />
      <h2 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold">My Civic Records</h2>
      <p className="text-xs text-heritage-aged mt-2 max-w-xs">Sign in to access all your submitted reports and downloadable receipts.</p>
      <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="mt-5 px-6 py-2.5 rounded-xl bg-heritage-maroon text-white font-semibold text-sm">Sign In</button>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 pb-24 lg:pb-6">
      <h1 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold mb-1">My Civic Records</h1>
      <p className="text-xs text-heritage-aged mb-4">All submitted reports, receipts and participation history</p>
      <div className="space-y-3">
        {cases.map(c => (
          <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal">
            <div>
              <p className="font-mono text-[11px] font-bold text-heritage-maroon dark:text-heritage-gold">{c.ticket_id}</p>
              <p className="text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory">{c.title}</p>
              <p className="text-[10px] text-heritage-aged mt-0.5">{new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <button className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-heritage-stone dark:border-heritage-charcoal text-[11px] font-semibold text-heritage-charcoal dark:text-heritage-stone hover:border-heritage-gold transition-colors">
              <Download className="w-3 h-3" /><span>Receipt</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: PROFILE
// ─────────────────────────────────────────────────────────────────────────────
const Profile: React.FC = () => {
  const { citizenUser, isAuthenticated, setShowAuthModal, setAuthMode, logoutCitizen, updateCitizenProfile } = useCitizen();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editLocality, setEditLocality] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPostalCode, setEditPostalCode] = useState('');
  const [editLang, setEditLang] = useState('en');
  const [editMobile, setEditMobile] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (citizenUser) {
      setEditName(citizenUser.name || '');
      setEditAddress(citizenUser.address_line || '');
      setEditLocality(citizenUser.locality || '');
      setEditCity(citizenUser.city || 'Bhubaneswar');
      setEditPostalCode(citizenUser.postal_code || '');
      setEditLang(citizenUser.preferred_language || 'en');
      setEditMobile(citizenUser.phone || '');
      setEditEmail(citizenUser.email || '');
    }
  }, [citizenUser]);

  if (!isAuthenticated) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <User className="w-10 h-10 text-heritage-aged mb-3" />
      <h2 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold">My Profile</h2>
      <p className="text-xs text-heritage-aged mt-2 max-w-xs">Sign in to manage your profile, security settings, and preferences.</p>
      <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="mt-5 px-6 py-2.5 rounded-xl bg-heritage-maroon text-white font-semibold text-sm">Sign In</button>
    </div>
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);
    setSaveLoading(true);

    const payload: any = {
      full_name: editName.trim(),
      address_line: editAddress.trim() || undefined,
      locality: editLocality.trim() || undefined,
      city: editCity.trim() || undefined,
      postal_code: editPostalCode.trim() || undefined,
      preferred_language: editLang,
    };

    if (editMobile.trim() && editMobile.trim() !== citizenUser?.phone) {
      payload.mobile = editMobile.trim();
      if (mobileOtp.trim()) payload.mobile_otp = mobileOtp.trim();
    }
    if (editEmail.trim() !== citizenUser?.email) {
      payload.email = editEmail.trim();
    }

    const res = await updateCitizenProfile(payload);
    setSaveLoading(false);

    if (res.otpRequired) {
      setOtpSent(true);
      if (res.dev_otp) setDevOtp(res.dev_otp);
      setSaveSuccess('OTP sent to new mobile number. Please enter the OTP below and click Save Changes again.');
      return;
    }

    if (!res.success) {
      setSaveError(res.error || 'Failed to update profile.');
      return;
    }

    setSaveSuccess('Profile updated successfully!');
    setIsEditing(false);
    setOtpSent(false);
    setDevOtp(null);
    setMobileOtp('');
  };

  return (
    <div className="p-4 sm:p-6 pb-24 lg:pb-6 max-w-xl">
      {/* Avatar */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-heritage-maroon text-heritage-gold flex items-center justify-center font-serif font-bold text-2xl shadow-heritage">
          {citizenUser?.avatar_initials}
        </div>
        <div>
          <h2 className="font-serif font-bold text-xl text-heritage-charcoal dark:text-heritage-ivory">{citizenUser?.name}</h2>
          <p className="text-xs text-heritage-aged">{citizenUser?.ward} · {citizenUser?.city}</p>
          <span className="text-[10px] font-bold text-heritage-maroon dark:text-heritage-gold flex items-center space-x-0.5 mt-0.5">
            <Shield className="w-2.5 h-2.5" />
            <span>Verified Citizen Account</span>
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 text-green-700 dark:text-green-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-heritage-green" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 dark:text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-heritage-red" />
          <span>{saveError}</span>
        </div>
      )}

      {devOtp && (
        <div className="mb-4 p-2.5 rounded-xl bg-heritage-gold/20 text-xs text-heritage-charcoal dark:text-heritage-ivory flex items-center justify-between">
          <span>Dev Mobile OTP: <strong>{devOtp}</strong></span>
          <button type="button" onClick={() => setMobileOtp(devOtp)} className="text-[11px] underline font-bold">Fill OTP</button>
        </div>
      )}

      <div className="space-y-4">
        {/* Personal Information */}
        <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">Personal Information</h3>
            <button
              onClick={() => { setIsEditing(!isEditing); setSaveError(null); setSaveSuccess(null); }}
              className="text-[11px] text-heritage-maroon dark:text-heritage-gold font-semibold hover:underline flex items-center space-x-0.5"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>

          {!isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-heritage-stone/30 dark:border-heritage-charcoal pb-2">
                <span className="text-heritage-aged font-semibold">Full Name</span>
                <span className="text-heritage-charcoal dark:text-heritage-ivory">{citizenUser?.name || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-heritage-stone/30 dark:border-heritage-charcoal pb-2">
                <span className="text-heritage-aged font-semibold">Registered Mobile</span>
                <span className="text-heritage-charcoal dark:text-heritage-ivory">{citizenUser?.phone || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-heritage-stone/30 dark:border-heritage-charcoal pb-2">
                <span className="text-heritage-aged font-semibold">Email Address</span>
                <span className="text-heritage-charcoal dark:text-heritage-ivory">{citizenUser?.email || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-heritage-stone/30 dark:border-heritage-charcoal pb-2">
                <span className="text-heritage-aged font-semibold">Address</span>
                <span className="text-heritage-charcoal dark:text-heritage-ivory">{citizenUser?.address_line || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-heritage-stone/30 dark:border-heritage-charcoal pb-2">
                <span className="text-heritage-aged font-semibold">Locality / Ward</span>
                <span className="text-heritage-charcoal dark:text-heritage-ivory">{citizenUser?.ward || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-heritage-stone/30 dark:border-heritage-charcoal pb-2">
                <span className="text-heritage-aged font-semibold">City</span>
                <span className="text-heritage-charcoal dark:text-heritage-ivory">{citizenUser?.city || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="text-heritage-aged font-semibold">PIN Code</span>
                <span className="text-heritage-charcoal dark:text-heritage-ivory">{citizenUser?.postal_code || '—'}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-heritage-aged mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-1 focus:ring-heritage-gold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-heritage-aged mb-1">Mobile Number (Requires verification)</label>
                <input
                  type="tel"
                  value={editMobile}
                  onChange={e => setEditMobile(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-1 focus:ring-heritage-gold focus:outline-none"
                  required
                />
              </div>

              {otpSent && (
                <div>
                  <label className="block text-[11px] font-semibold text-heritage-aged mb-1">Enter OTP sent to new mobile</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={mobileOtp}
                    onChange={e => setMobileOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit OTP"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-gold bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory font-mono text-center tracking-widest focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-heritage-aged mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-1 focus:ring-heritage-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-heritage-aged mb-1">Address Line</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-1 focus:ring-heritage-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-heritage-aged mb-1">Locality</label>
                  <input
                    type="text"
                    value={editLocality}
                    onChange={e => setEditLocality(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-1 focus:ring-heritage-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-heritage-aged mb-1">PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={editPostalCode}
                    onChange={e => setEditPostalCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-1 focus:ring-heritage-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex-1 py-2 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-semibold text-xs shadow-sm transition-colors"
                >
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-heritage-stone text-heritage-aged text-xs font-semibold hover:bg-heritage-stone/20"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory mb-3">Preferences</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-heritage-stone/30 dark:border-heritage-charcoal pb-2">
              <span className="text-heritage-aged font-semibold">Preferred Language</span>
              <span className="text-heritage-charcoal dark:text-heritage-ivory">
                English
              </span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-heritage-stone/30 dark:border-heritage-charcoal pb-2">
              <span className="text-heritage-aged font-semibold">Notification Channel</span>
              <span className="text-heritage-charcoal dark:text-heritage-ivory">In-App + SMS / Email</span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory mb-3">Security & Privacy</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-heritage-stone/20 text-xs">
              <span className="text-heritage-charcoal dark:text-heritage-stone">Assigned Role</span>
              <span className="font-bold text-heritage-maroon dark:text-heritage-gold font-mono">CITIZEN</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-heritage-stone/20 text-xs">
              <span className="text-heritage-charcoal dark:text-heritage-stone">Multi-Factor Authentication</span>
              <span className="text-heritage-green font-semibold">SMS OTP Protected</span>
            </div>
          </div>
        </div>

        <button onClick={logoutCitizen} className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: HELP & SUPPORT
// ─────────────────────────────────────────────────────────────────────────────
const HelpSupport: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    { q: 'How do I track my complaint?', a: 'Go to "My Cases" from the sidebar. Each case has a unique ticket ID and full activity timeline showing department actions, status updates, and your next steps.' },
    { q: 'How long will my complaint take?', a: 'Response times vary by category. Road damage: 7 days. Waterlogging: 3 days. Streetlight: 5 days. You can see the expected timeline in your case overview.' },
    { q: 'Can I reopen a closed complaint?', a: 'Yes. If the issue recurs or was incorrectly marked closed, go to your case and use the "Report Wrong Status" or "Request Reinspection" option.' },
    { q: 'My photo upload is failing. What do I do?', a: 'Your report is NOT lost. The app saves your form data as a draft. Check your connection and retry the upload. The report will only submit after the upload succeeds.' },
    { q: 'Is my personal information safe?', a: 'Your name and contact details are visible only to authorized department staff. Your home address is never shown publicly on the civic map.' },
    { q: 'How do I dispute a resolution?', a: 'Open the case, review the completion evidence, and select "Issue still exists" or "Evidence insufficient". Your dispute is routed to a supervisor for review.' },
  ];

  return (
    <div className="p-4 sm:p-6 pb-24 lg:pb-6 max-w-2xl">
      <h1 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold mb-1">Help & Support</h1>
      <p className="text-xs text-heritage-aged mb-5">Find answers, track your support tickets, and contact us</p>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-heritage-aged" />
        <input placeholder="Search FAQs or topics…" className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {[
          { icon: BookOpen, label: 'How tracking works' },
          { icon: AlertCircle, label: 'Dispute a resolution' },
          { icon: RefreshCw, label: 'Reopen a complaint' },
          { icon: Phone, label: 'Emergency contacts' },
          { icon: Shield, label: 'Privacy & data' },
          { icon: LifeBuoy, label: 'Technical support' },
        ].map(l => {
          const Icon = l.icon;
          return (
            <button key={l.label} className="flex items-center space-x-2 p-3 rounded-xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold text-xs font-medium text-heritage-charcoal dark:text-heritage-stone transition-all">
              <Icon className="w-3.5 h-3.5 text-heritage-maroon dark:text-heritage-gold shrink-0" />
              <span>{l.label}</span>
            </button>
          );
        })}
      </div>

      {/* FAQs */}
      <h3 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory mb-3">Frequently Asked Questions</h3>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory hover:bg-heritage-stone/20 dark:hover:bg-heritage-charcoal-dark/40 transition-colors">
              <span className="text-left">{faq.q}</span>
              {openFaq === i ? <ChevronUp className="w-3.5 h-3.5 text-heritage-aged shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-heritage-aged shrink-0" />}
            </button>
            {openFaq === i && (
              <div className="px-4 pb-4 text-[11px] text-heritage-aged leading-relaxed border-t border-heritage-stone/30 dark:border-heritage-charcoal pt-2">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact support */}
      <div className="mt-5 p-4 rounded-2xl bg-heritage-maroon/5 dark:bg-heritage-maroon/10 border border-heritage-maroon/20">
        <p className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">Still need help?</p>
        <p className="text-[11px] text-heritage-aged mb-3">Contact our civic support team. We respond within 24 hours on working days.</p>
        <button className="px-4 py-2 rounded-xl bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon-dark transition-colors">Open Support Ticket</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT EXPORT — wraps everything in the CitizenProvider
// ─────────────────────────────────────────────────────────────────────────────
export const CitizenPortalView: React.FC = () => (
  <CitizenPortalInner />
);
