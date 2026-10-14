import React, { useState, useEffect } from 'react';
import { useCitizen } from '../context/CitizenContext';
import { KonarkWheelIcon, IkatPatternDivider } from './OdishaMotifs';
import {
  User, Shield, Lock, MapPin, Globe, Sparkles, Sliders, Archive, Bookmark,
  Download, Trash2, Smartphone, Monitor, Tablet, CheckCircle2, AlertCircle,
  ExternalLink, Search, RefreshCw, Eye, EyeOff, Check, X, ChevronRight,
  Filter, FileText, Compass, Users, MessageSquare, AlertTriangle, Clock,
  ArrowUpRight, Info, Heart, Calendar, ShieldCheck, ShieldAlert, LogOut
} from 'lucide-react';

interface ProfileData {
  id: number;
  full_name: string;
  display_name: string;
  masked_email: string;
  masked_mobile: string;
  raw_email?: string;
  raw_mobile?: string;
  email_verified: boolean;
  mobile_verified: boolean;
  preferred_language: string;
  default_area: string;
  community_visibility: string;
  account_status: string;
  locality?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  created_at: string;
  stats: {
    total_reports: number;
    resolved_reports: number;
    community_contributions: number;
    saved_places: number;
    active_sessions: number;
  };
}

interface CivicRecord {
  record_id: string;
  source_module: string;
  category: string;
  code: string;
  title: string;
  odia_title?: string;
  description?: string;
  status: string;
  status_color: string;
  created_at: string;
  action_url: string;
  action_label: string;
  meta: Record<string, any>;
}

interface SavedPlace {
  id: number;
  place_type: string;
  place_id?: string;
  place_name: string;
  place_category: string;
  address: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  created_at: string;
}

interface ConsentItem {
  id: number;
  consent_type: string;
  title: string;
  description: string;
  status: string;
  version: string;
  is_mandatory: boolean;
  updated_at: string;
}

interface SessionItem {
  id: number;
  session_id: string;
  device_name: string;
  device_type: string;
  ip_address: string;
  location_city: string;
  is_current: boolean;
  last_active_at: string;
  created_at: string;
}

interface ProfileAndRecordsCenterProps {
  initialTab?: 'overview' | 'profile' | 'records' | 'saved' | 'preferences' | 'security';
}

export const ProfileAndRecordsCenter: React.FC<ProfileAndRecordsCenterProps> = ({
  initialTab = 'overview'
}) => {
  const { citizenUser, isAuthenticated, navigateTo, setShowAuthModal, setAuthMode, logoutCitizen } = useCitizen();

  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'records' | 'saved' | 'preferences' | 'security'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Profile Edit State
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editLang, setEditLang] = useState('or');
  const [editArea, setEditArea] = useState('');
  const [editVisibility, setEditVisibility] = useState('LIMITED');
  const [profileSaveLoading, setProfileSaveLoading] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState<string | null>(null);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);

  // Civic Records State
  const [recordsCategory, setRecordsCategory] = useState<string>('ALL');
  const [recordsQuery, setRecordsQuery] = useState('');
  const [records, setRecords] = useState<CivicRecord[]>([]);
  const [recordCounts, setRecordCounts] = useState({ all: 0, reports: 0, community: 0, trips: 0, feedback: 0 });
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CivicRecord | null>(null);

  // Saved Places State
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [savedPlacesLoading, setSavedPlacesLoading] = useState(false);
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceCategory, setNewPlaceCategory] = useState('Health Clinic');
  const [newPlaceAddress, setNewPlaceAddress] = useState('');
  const [newPlaceType, setNewPlaceType] = useState('FACILITY');

  // Preferences State
  const [themeMode, setThemeMode] = useState('HERITAGE');
  const [highContrast, setHighContrast] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [prefSaveSuccess, setPrefSaveSuccess] = useState<string | null>(null);

  // Privacy & Consents State
  const [consents, setConsents] = useState<ConsentItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [deletionScheduled, setDeletionScheduled] = useState<boolean>(false);
  const [deletionGraceDate, setDeletionGraceDate] = useState<string | null>(null);
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [deletionReason, setDeletionReason] = useState('Personal preference');

  const citizenId = citizenUser?.id || 1;

  // ─────────────────────────────────────────────────────────────────────────
  // FETCHERS
  // ─────────────────────────────────────────────────────────────────────────

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/api/citizen/profile?citizen_id=${citizenId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditDisplayName(data.display_name || '');
        setEditLang(data.preferred_language || 'or');
        setEditArea(data.default_area || '');
        setEditVisibility(data.community_visibility || 'LIMITED');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async (cat = recordsCategory, q = recordsQuery) => {
    try {
      setRecordsLoading(true);
      let url = `http://127.0.0.1:8000/api/citizen/records?citizen_id=${citizenId}&category=${cat}`;
      if (q.trim()) url += `&query=${encodeURIComponent(q.trim())}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.items || []);
        if (data.counts) setRecordCounts(data.counts);
      }
    } catch (err) {
      console.error('Failed to load civic records:', err);
    } finally {
      setRecordsLoading(false);
    }
  };

  const loadSavedPlaces = async () => {
    try {
      setSavedPlacesLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/api/citizen/saved-places?citizen_id=${citizenId}`);
      if (res.ok) {
        const data = await res.json();
        setSavedPlaces(data);
      }
    } catch (err) {
      console.error('Failed to load saved places:', err);
    } finally {
      setSavedPlacesLoading(false);
    }
  };

  const loadConsentsAndSessions = async () => {
    try {
      const [consRes, sessRes, prefRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/citizen/privacy/consents?citizen_id=${citizenId}`),
        fetch(`http://127.0.0.1:8000/api/citizen/security/sessions?citizen_id=${citizenId}`),
        fetch(`http://127.0.0.1:8000/api/citizen/preferences?citizen_id=${citizenId}`)
      ]);
      if (consRes.ok) setConsents(await consRes.json());
      if (sessRes.ok) setSessions(await sessRes.json());
      if (prefRes.ok) {
        const p = await prefRes.json();
        setThemeMode(p.theme_mode || 'HERITAGE');
        setHighContrast(!!p.high_contrast);
        setScreenReader(!!p.screen_reader_optimized);
      }
    } catch (err) {
      console.error('Failed to load security and privacy info:', err);
    }
  };

  useEffect(() => {
    loadProfile();
    loadRecords();
    loadSavedPlaces();
    loadConsentsAndSessions();
  }, [citizenId]);

  // Sync tab from props if it changes
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaveLoading(true);
    setProfileSaveSuccess(null);
    setProfileSaveError(null);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/citizen/profile?citizen_id=${citizenId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: editDisplayName,
          preferred_language: editLang,
          default_area: editArea,
          community_visibility: editVisibility
        })
      });

      if (!res.ok) throw new Error('Failed to update profile settings.');
      const updated = await res.json();
      setProfile(updated);
      setProfileSaveSuccess('Your civic profile preferences have been successfully updated.');
    } catch (err: any) {
      setProfileSaveError(err.message || 'Error updating profile.');
    } finally {
      setProfileSaveLoading(false);
    }
  };

  const handleAddSavedPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName.trim() || !newPlaceAddress.trim()) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/citizen/saved-places?citizen_id=${citizenId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_name: newPlaceName.trim(),
          place_category: newPlaceCategory,
          place_type: newPlaceType,
          address: newPlaceAddress.trim(),
          notes: 'Bookmarked by citizen from City Explorer.'
        })
      });
      if (res.ok) {
        setShowAddPlaceModal(false);
        setNewPlaceName('');
        setNewPlaceAddress('');
        loadSavedPlaces();
      }
    } catch (err) {
      console.error('Failed to save place:', err);
    }
  };

  const handleDeleteSavedPlace = async (id: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/citizen/saved-places/${id}?citizen_id=${citizenId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSavedPlaces(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete saved place:', err);
    }
  };

  const handleToggleConsent = async (consentId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'GRANTED' ? 'REVOKED' : 'GRANTED';
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/citizen/privacy/consents/${consentId}?citizen_id=${citizenId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setConsents(prev => prev.map(c => c.id === consentId ? { ...c, status: nextStatus } : c));
      } else {
        const data = await res.json();
        alert(data.detail || 'Could not change consent');
      }
    } catch (err) {
      console.error('Failed to toggle consent:', err);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!window.confirm('Terminate this remote device session immediately?')) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/citizen/security/sessions/${sessionId}?citizen_id=${citizenId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.session_id !== sessionId));
      } else {
        const data = await res.json();
        alert(data.detail || 'Cannot revoke session');
      }
    } catch (err) {
      console.error('Failed to revoke session:', err);
    }
  };

  const handleSavePreferences = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/citizen/preferences?citizen_id=${citizenId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme_mode: themeMode,
          high_contrast: highContrast,
          screen_reader_optimized: screenReader
        })
      });
      if (res.ok) {
        setPrefSaveSuccess('Display & accessibility preferences saved successfully!');
        setTimeout(() => setPrefSaveSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  };

  const handleDataExport = async () => {
    try {
      setExportLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/api/citizen/data-export-requests?citizen_id=${citizenId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        setExportNotice(`Export bundle ${data.request_code} generated (${data.file_size_formatted}). Opening download...`);
        // Trigger download
        window.open(`http://127.0.0.1:8000${data.download_url}?citizen_id=${citizenId}`, '_blank');
      }
    } catch (err) {
      console.error('Failed to export data:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const handleScheduleDeletion = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/citizen/account-deletion-requests?citizen_id=${citizenId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: deletionReason })
      });
      if (res.ok) {
        const data = await res.json();
        setDeletionScheduled(true);
        setDeletionGraceDate(new Date(data.scheduled_purge_date).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'long', year: 'numeric'
        }));
        setShowDeletionModal(false);
      }
    } catch (err) {
      console.error('Failed to schedule account deletion:', err);
    }
  };

  if (!isAuthenticated && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-heritage-ivory dark:bg-heritage-charcoal-dark">
        <div className="w-16 h-16 rounded-3xl bg-heritage-maroon/10 dark:bg-heritage-gold/10 flex items-center justify-center mb-4 text-heritage-maroon dark:text-heritage-gold">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-heritage-maroon dark:text-heritage-gold">Civic Identity & Records</h2>
        <p className="text-xs text-heritage-aged mt-2 max-w-sm leading-relaxed">
          Sign in to view verified civic records, update language and accessibility preferences, manage saved locations, and configure Digital Personal Data Protection controls.
        </p>
        <button
          onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
          className="mt-6 px-6 py-2.5 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-semibold text-xs shadow-md transition-all flex items-center space-x-2"
        >
          <span>Sign In to Civic Nexus</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-28">
      {/* ── HEADER BANNER (Odisha Heritage Aesthetic) ────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-heritage-maroon via-heritage-maroon-dark to-[#2b0f15] text-white p-6 sm:p-8 shadow-heritage border border-heritage-gold/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10 pointer-events-none">
          <KonarkWheelIcon className="w-72 h-72 text-heritage-gold" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4 sm:space-x-5">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-heritage-gold to-amber-600 text-heritage-maroon-dark flex items-center justify-center font-serif font-bold text-2xl sm:text-3xl shadow-lg border-2 border-white/40">
                {profile?.display_name ? profile.display_name.charAt(0) : 'D'}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-heritage-green rounded-full border-2 border-white text-white" title="Account Active">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white tracking-wide">
                  {profile?.display_name || 'Debabrata Mohanty'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-heritage-gold/20 text-heritage-gold border border-heritage-gold/40">
                  {profile?.account_status || 'Active Citizen'}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-1 flex items-center space-x-2 flex-wrap">
                <span>{profile?.default_area || 'Saheed Nagar, Ward 32, Bhubaneswar'}</span>
                <span>•</span>
                <span className="text-heritage-gold">
                  English
                </span>
              </p>
              <div className="flex items-center space-x-3 mt-2 text-[11px] text-white/70">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-heritage-gold" />
                  <span>OTP Verified Identity</span>
                </span>
                <span>•</span>
                <span>DPDP Act 2023 Compliant</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-black/25 backdrop-blur-md p-3 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center px-3 py-1">
              <span className="block font-mono font-bold text-lg text-heritage-gold">{profile?.stats.total_reports ?? 3}</span>
              <span className="text-[10px] text-white/70 uppercase tracking-wider">Reports</span>
            </div>
            <div className="text-center px-3 py-1 border-l border-white/10">
              <span className="block font-mono font-bold text-lg text-emerald-400">{profile?.stats.resolved_reports ?? 2}</span>
              <span className="text-[10px] text-white/70 uppercase tracking-wider">Resolved</span>
            </div>
            <div className="text-center px-3 py-1 border-l border-white/10">
              <span className="block font-mono font-bold text-lg text-cyan-300">{profile?.stats.saved_places ?? 4}</span>
              <span className="text-[10px] text-white/70 uppercase tracking-wider">Bookmarks</span>
            </div>
            <div className="text-center px-3 py-1 border-l border-white/10">
              <span className="block font-mono font-bold text-lg text-purple-300">{profile?.stats.active_sessions ?? 2}</span>
              <span className="text-[10px] text-white/70 uppercase tracking-wider">Sessions</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-white/15 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'overview' as const, label: 'Overview', labelOr: 'ସାରାଂଶ', icon: Sparkles },
            { id: 'profile' as const, label: 'Edit Profile', labelOr: 'ପ୍ରୋଫାଇଲ ସମ୍ପାଦନ', icon: User },
            { id: 'records' as const, label: 'My Civic Records', labelOr: 'ନାଗରିକ ଦଲିଲ', icon: Archive, count: records.length },
            { id: 'saved' as const, label: 'Saved Places', labelOr: 'ସଂରକ୍ଷିତ ସ୍ଥାନ', icon: Bookmark, count: savedPlaces.length },
            { id: 'preferences' as const, label: 'Language & Access', labelOr: 'ଭାଷା ଓ ପ୍ରବେଶ', icon: Sliders },
            { id: 'security' as const, label: 'Privacy & Security', labelOr: 'ଗୋପନୀୟତା', icon: Lock },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-heritage-gold text-heritage-maroon-dark shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isActive ? 'bg-heritage-maroon text-heritage-gold' : 'bg-white/20 text-white'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB 1: OVERVIEW ─────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Deletion Grace Warning if Scheduled */}
          {deletionScheduled && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 flex items-start justify-between gap-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wide">Account Deletion Grace Period Active</h4>
                  <p className="text-xs mt-1 text-amber-800 dark:text-amber-300">
                    Your account is scheduled for permanent purge on <strong>{deletionGraceDate}</strong>. You may cancel this request anytime before that date.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeletionScheduled(false)}
                className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 shrink-0"
              >
                Cancel Deletion
              </button>
            </div>
          )}

          {/* Quick Hub Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Civic Records Summary */}
            <div
              onClick={() => setActiveTab('records')}
              className="p-5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold shadow-sm cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-heritage-maroon/10 dark:bg-heritage-gold/15 text-heritage-maroon dark:text-heritage-gold flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Archive className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory">Civic Records</h3>
                <ArrowUpRight className="w-4 h-4 text-heritage-aged group-hover:text-heritage-gold transition-colors" />
              </div>
              <p className="text-xs text-heritage-aged mt-1">Cross-module case timeline, surveys, and travel records.</p>
              <div className="mt-4 pt-3 border-t border-heritage-stone/30 dark:border-heritage-charcoal flex justify-between text-xs text-heritage-charcoal dark:text-heritage-stone font-medium">
                <span>{recordCounts.all || records.length} Total records</span>
                <span className="text-heritage-maroon dark:text-heritage-gold font-bold">View History</span>
              </div>
            </div>

            {/* Card 2: Saved Places */}
            <div
              onClick={() => setActiveTab('saved')}
              className="p-5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold shadow-sm cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Bookmark className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory">Saved Places</h3>
                <ArrowUpRight className="w-4 h-4 text-heritage-aged group-hover:text-heritage-gold transition-colors" />
              </div>
              <p className="text-xs text-heritage-aged mt-1">Fav public clinics, heritage sites, and community projects.</p>
              <div className="mt-4 pt-3 border-t border-heritage-stone/30 dark:border-heritage-charcoal flex justify-between text-xs text-heritage-charcoal dark:text-heritage-stone font-medium">
                <span>{savedPlaces.length} Saved spots</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Manage</span>
              </div>
            </div>

            {/* Card 3: Language & Accessibility */}
            <div
              onClick={() => setActiveTab('preferences')}
              className="p-5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold shadow-sm cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory">Language & Access</h3>
                <ArrowUpRight className="w-4 h-4 text-heritage-aged group-hover:text-heritage-gold transition-colors" />
              </div>
              <p className="text-xs text-heritage-aged mt-1">Odia, Hindi & English script, high contrast, screen reader.</p>
              <div className="mt-4 pt-3 border-t border-heritage-stone/30 dark:border-heritage-charcoal flex justify-between text-xs text-heritage-charcoal dark:text-heritage-stone font-medium">
                <span>ଓଡ଼ିଆ Active</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">Configure</span>
              </div>
            </div>

            {/* Card 4: Privacy & Security */}
            <div
              onClick={() => setActiveTab('security')}
              className="p-5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold shadow-sm cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory">Privacy & Security</h3>
                <ArrowUpRight className="w-4 h-4 text-heritage-aged group-hover:text-heritage-gold transition-colors" />
              </div>
              <p className="text-xs text-heritage-aged mt-1">Active devices, DPDP consent ledger, data export bundle.</p>
              <div className="mt-4 pt-3 border-t border-heritage-stone/30 dark:border-heritage-charcoal flex justify-between text-xs text-heritage-charcoal dark:text-heritage-stone font-medium">
                <span>{sessions.length} Devices linked</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">Inspect</span>
              </div>
            </div>
          </div>

          {/* Masked Sensitive Credentials Notice */}
          <div className="p-5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
            <h3 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory mb-3 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-heritage-maroon dark:text-heritage-gold" />
              <span>Verified Account Protections & Privacy Masking</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark border border-heritage-stone/30 dark:border-heritage-charcoal">
                <span className="text-[11px] text-heritage-aged block font-semibold mb-1">Masked Mobile</span>
                <span className="font-mono font-bold text-heritage-charcoal dark:text-heritage-ivory">{profile?.masked_mobile}</span>
                <span className="inline-block mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">✓ Verified via OTP</span>
              </div>
              <div className="p-3.5 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark border border-heritage-stone/30 dark:border-heritage-charcoal">
                <span className="text-[11px] text-heritage-aged block font-semibold mb-1">Masked Email</span>
                <span className="font-mono font-bold text-heritage-charcoal dark:text-heritage-ivory">{profile?.masked_email}</span>
                <span className="inline-block mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">✓ Verified</span>
              </div>
              <div className="p-3.5 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark border border-heritage-stone/30 dark:border-heritage-charcoal">
                <span className="text-[11px] text-heritage-aged block font-semibold mb-1">Community Display Visibility</span>
                <span className="font-semibold text-heritage-charcoal dark:text-heritage-ivory">{profile?.community_visibility}</span>
                <span className="inline-block mt-1 text-[10px] text-heritage-aged">Legal name is kept private</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: EDIT PERSONAL PROFILE ───────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-heritage-charcoal rounded-3xl border border-heritage-stone dark:border-heritage-charcoal p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-heritage-stone/40 dark:border-heritage-charcoal mb-6">
            <div>
              <h2 className="font-serif font-bold text-xl text-heritage-charcoal dark:text-heritage-ivory">Personal Information</h2>
              <p className="text-xs text-heritage-aged mt-0.5">
                Customize your civic display identity and default neighborhood filter.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('overview')}
              className="text-xs text-heritage-aged hover:text-heritage-maroon dark:hover:text-heritage-gold font-semibold"
            >
              Back to Overview
            </button>
          </div>

          {profileSaveSuccess && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{profileSaveSuccess}</span>
            </div>
          )}

          {profileSaveError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{profileSaveError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleSaveProfile} className="lg:col-span-2 space-y-5">
              <div>
                <label className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={e => setEditDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none"
                  placeholder="e.g. Debabrata M."
                  required
                />
                <span className="text-[10px] text-heritage-aged mt-1 block">
                  Shown on community proposals and approved forum contributions. Keeps your legal name private.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-2">
                  Preferred Language
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'or', label: 'ଓଡ଼ିଆ', sub: 'Odia' },
                    { id: 'hi', label: 'हिन्दी', sub: 'Hindi' },
                    { id: 'en', label: 'English', sub: 'Default' },
                  ].map(lang => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setEditLang(lang.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        editLang === lang.id
                          ? 'border-heritage-maroon dark:border-heritage-gold bg-heritage-maroon/5 dark:bg-heritage-gold/10'
                          : 'border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold/50'
                      }`}
                    >
                      <span className="block font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">{lang.label}</span>
                      <span className="text-[10px] text-heritage-aged">{lang.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">
                  Default Area Filter (Optional)
                </label>
                <input
                  type="text"
                  value={editArea}
                  onChange={e => setEditArea(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none"
                  placeholder="e.g. Saheed Nagar, Ward 32, Bhubaneswar"
                />
                <span className="text-[10px] text-heritage-aged mt-1 block">
                  Used as default filter in civic map and reports. You can report incidents in any ward.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">
                  Community Profile Visibility
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'LIMITED', title: 'Limited (Recommended)', desc: 'Show chosen display name on eligible civic contributions' },
                    { id: 'PRIVATE', title: 'Private', desc: 'Hide display name; contributions marked as Anonymous Citizen' },
                    { id: 'PUBLIC', title: 'Public', desc: 'Show display name and ward on all community comments' },
                  ].map(v => (
                    <label
                      key={v.id}
                      className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        editVisibility === v.id
                          ? 'border-heritage-maroon dark:border-heritage-gold bg-heritage-maroon/5 dark:bg-heritage-gold/10'
                          : 'border-heritage-stone dark:border-heritage-charcoal'
                      }`}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value={v.id}
                        checked={editVisibility === v.id}
                        onChange={() => setEditVisibility(v.id)}
                        className="mt-0.5 text-heritage-maroon focus:ring-heritage-gold"
                      />
                      <div>
                        <span className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">{v.title}</span>
                        <span className="text-[11px] text-heritage-aged">{v.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={profileSaveLoading}
                  className="px-6 py-2.5 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-semibold text-xs shadow-md transition-colors flex items-center space-x-2"
                >
                  {profileSaveLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Live Interactive Preview Card */}
            <div className="bg-heritage-stone/20 dark:bg-heritage-charcoal-dark p-6 rounded-2xl border border-heritage-stone/30 dark:border-heritage-charcoal space-y-4">
              <span className="text-[10px] font-bold text-heritage-aged uppercase tracking-wider block">Live Civic Card Preview</span>
              <div className="p-4 rounded-xl bg-white dark:bg-heritage-charcoal border border-heritage-gold/30 shadow-sm space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-heritage-maroon text-heritage-gold flex items-center justify-center font-serif font-bold text-xl">
                    {editDisplayName ? editDisplayName.charAt(0) : 'C'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">
                      {editDisplayName || 'Citizen User'}
                    </h4>
                    <span className="text-[10px] text-heritage-aged">
                      {editLang === 'or' ? 'ଓଡ଼ିଆ' : editLang === 'hi' ? 'हिन्दी' : 'English'} · {editArea.split(',')[0] || 'Saheed Nagar'}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-heritage-stone/30 dark:border-heritage-charcoal text-[11px] text-heritage-aged flex items-center justify-between">
                  <span>Visibility:</span>
                  <span className="font-bold text-heritage-maroon dark:text-heritage-gold">{editVisibility}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-heritage-maroon/5 dark:bg-heritage-maroon/10 border border-heritage-maroon/15 text-[11px] text-heritage-aged leading-relaxed">
                <strong className="text-heritage-charcoal dark:text-heritage-ivory block mb-1">Identity Safety Rules:</strong>
                Changing your display name never alters your legal records on complaints or formal tax receipts. Sensitive contact info is never rendered in public discussion threads.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: MY CIVIC RECORDS (CROSS-MODULE AGGREGATOR) ───────────────── */}
      {activeTab === 'records' && (
        <div className="bg-white dark:bg-heritage-charcoal rounded-3xl border border-heritage-stone dark:border-heritage-charcoal p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold">My Civic Records</h2>
              <p className="text-xs text-heritage-aged mt-0.5">
                Consolidated cross-module participation history. Source of truth connects directly to Cases, Community, and Smart Tourism.
              </p>
            </div>
            <button
              onClick={() => loadRecords(recordsCategory, recordsQuery)}
              className="px-3.5 py-1.5 rounded-xl border border-heritage-stone dark:border-heritage-charcoal text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone hover:border-heritage-gold flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${recordsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Records</span>
            </button>
          </div>

          {/* Category Tabs & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'ALL', label: 'All Records', count: recordCounts.all },
                { id: 'REPORTS', label: 'Reports & Cases', count: recordCounts.reports },
                { id: 'COMMUNITY', label: 'Community & Polls', count: recordCounts.community },
                { id: 'TRIPS', label: 'Trips & Tourism', count: recordCounts.trips },
                { id: 'FEEDBACK', label: 'Official Feedback', count: recordCounts.feedback },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setRecordsCategory(cat.id);
                    loadRecords(cat.id, recordsQuery);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    recordsCategory === cat.id
                      ? 'bg-heritage-maroon text-white shadow-sm'
                      : 'bg-heritage-stone/20 dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-stone hover:bg-heritage-stone/40'
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.count > 0 && <span className="ml-1.5 opacity-80 font-mono text-[10px]">({cat.count})</span>}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-heritage-aged" />
              <input
                type="text"
                value={recordsQuery}
                onChange={e => {
                  setRecordsQuery(e.target.value);
                  loadRecords(recordsCategory, e.target.value);
                }}
                placeholder="Search ticket ID, title, date..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none"
              />
            </div>
          </div>

          {/* Record Items Feed */}
          {recordsLoading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-heritage-gold mx-auto mb-3" />
              <p className="text-xs text-heritage-aged">Aggregating records across municipal modules...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-heritage-stone dark:border-heritage-charcoal rounded-2xl">
              <Archive className="w-10 h-10 text-heritage-aged opacity-40 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">No civic records found</h4>
              <p className="text-xs text-heritage-aged mt-1">Try resetting the filter or submit your first issue report.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map(rec => (
                <div
                  key={rec.record_id}
                  className="p-4 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal hover:border-heritage-gold/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start space-x-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark text-heritage-maroon dark:text-heritage-gold shrink-0">
                      {rec.category === 'REPORTS' ? <FileText className="w-4 h-4" /> :
                       rec.category === 'COMMUNITY' ? <Users className="w-4 h-4" /> :
                       rec.category === 'TRIPS' ? <Compass className="w-4 h-4" /> :
                       <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-heritage-maroon dark:text-heritage-gold">
                          {rec.code}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-heritage-stone/30 dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory">
                          {rec.status}
                        </span>
                        <span className="text-[10px] text-heritage-aged">
                          {new Date(rec.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-heritage-charcoal dark:text-heritage-ivory mt-1 truncate">
                        {rec.title}
                      </h4>
                      {rec.odia_title && (
                        <p className="text-[11px] text-heritage-aged/90 mt-0.5 font-serif">
                          {rec.odia_title}
                        </p>
                      )}
                      <p className="text-[11px] text-heritage-aged mt-1 line-clamp-1">
                        {rec.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => setSelectedRecord(rec)}
                      className="px-3 py-1.5 rounded-xl bg-heritage-stone/20 hover:bg-heritage-stone/40 dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory text-xs font-semibold transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => {
                        // Dispatch to owning module view
                        if (rec.source_module === 'CASES') navigateTo('cases');
                        else if (rec.source_module === 'COMMUNITY') navigateTo('community');
                        else if (rec.source_module === 'TOURNISM') navigateTo('tourism');
                        else if (rec.source_module === 'INBOX') navigateTo('inbox');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1"
                    >
                      <span>Open Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Record Detail Modal */}
          {selectedRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-heritage-charcoal rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-heritage-gold/40 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-heritage-stone/30 dark:border-heritage-charcoal">
                  <div>
                    <span className="font-mono text-xs font-bold text-heritage-gold">{selectedRecord.code}</span>
                    <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory">{selectedRecord.title}</h3>
                  </div>
                  <button onClick={() => setSelectedRecord(null)} className="p-1.5 rounded-full hover:bg-heritage-stone/30 text-heritage-aged">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs text-heritage-charcoal dark:text-heritage-ivory">
                  <div>
                    <span className="text-[10px] text-heritage-aged font-bold uppercase block mb-1">Source Module</span>
                    <span className="font-semibold text-heritage-maroon dark:text-heritage-gold">{selectedRecord.source_module}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-heritage-aged font-bold uppercase block mb-1">Description</span>
                    <p className="text-heritage-aged leading-relaxed">{selectedRecord.description}</p>
                  </div>
                  {selectedRecord.meta && (
                    <div className="p-3 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark border border-heritage-stone/30 dark:border-heritage-charcoal space-y-1">
                      <span className="text-[10px] text-heritage-aged font-bold uppercase block mb-1">Metadata</span>
                      {Object.entries(selectedRecord.meta).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[11px]">
                          <span className="text-heritage-aged capitalize">{k.replace('_', ' ')}:</span>
                          <span className="font-semibold">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button onClick={() => setSelectedRecord(null)} className="px-4 py-2 rounded-xl border border-heritage-stone text-xs font-semibold">
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRecord(null);
                      if (selectedRecord.source_module === 'CASES') navigateTo('cases');
                      else if (selectedRecord.source_module === 'COMMUNITY') navigateTo('community');
                      else if (selectedRecord.source_module === 'TOURNISM') navigateTo('tourism');
                      else if (selectedRecord.source_module === 'INBOX') navigateTo('inbox');
                    }}
                    className="px-4 py-2 rounded-xl bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon-dark"
                  >
                    Open in Source Module
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: SAVED PLACES & INTERESTS ─────────────────────────────────── */}
      {activeTab === 'saved' && (
        <div className="bg-white dark:bg-heritage-charcoal rounded-3xl border border-heritage-stone dark:border-heritage-charcoal p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold">Saved Places & Interests</h2>
              <p className="text-xs text-heritage-aged mt-0.5">
                Bookmarked primary healthcare clinics, heritage temples, and active ward improvement projects.
              </p>
            </div>
            <button
              onClick={() => setShowAddPlaceModal(true)}
              className="px-4 py-2 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white text-xs font-semibold shadow-md transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmark New Place</span>
            </button>
          </div>

          {savedPlacesLoading ? (
            <div className="py-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-heritage-gold mx-auto mb-2" />
              <p className="text-xs text-heritage-aged">Loading saved amenities...</p>
            </div>
          ) : savedPlaces.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-heritage-stone dark:border-heritage-charcoal rounded-2xl">
              <Bookmark className="w-10 h-10 text-heritage-aged opacity-40 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">No saved locations yet</h4>
              <p className="text-xs text-heritage-aged mt-1">Save facilities from City Explorer or heritage monuments from Smart Tourism.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedPlaces.map(place => (
                <div
                  key={place.id}
                  className="p-5 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal hover:border-heritage-gold transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                        <MapPin className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-heritage-gold block">
                          {place.place_category}
                        </span>
                        <h4 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">
                          {place.place_name}
                        </h4>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSavedPlace(place.id)}
                      className="p-1.5 rounded-lg text-heritage-aged hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-heritage-aged flex items-start space-x-1.5">
                    <span className="mt-0.5">•</span>
                    <span>{place.address}</span>
                  </p>

                  {place.notes && (
                    <p className="text-[11px] text-heritage-charcoal/80 dark:text-heritage-ivory/80 italic bg-heritage-stone/20 dark:bg-heritage-charcoal-dark p-2 rounded-xl">
                      "{place.notes}"
                    </p>
                  )}

                  <div className="pt-2 border-t border-heritage-stone/30 dark:border-heritage-charcoal flex justify-between items-center text-xs">
                    <span className="text-[10px] text-heritage-aged">
                      Saved {new Date(place.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <button
                      onClick={() => navigateTo('city_map')}
                      className="text-heritage-maroon dark:text-heritage-gold font-semibold hover:underline flex items-center space-x-1"
                    >
                      <span>Locate on Map</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Place Modal */}
          {showAddPlaceModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <form onSubmit={handleAddSavedPlace} className="bg-white dark:bg-heritage-charcoal rounded-3xl max-w-md w-full p-6 shadow-2xl border border-heritage-gold/40 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-heritage-stone/30 dark:border-heritage-charcoal">
                  <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory">Save a Public Amenity</h3>
                  <button type="button" onClick={() => setShowAddPlaceModal(false)} className="p-1.5 rounded-full hover:bg-heritage-stone/30 text-heritage-aged">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">Facility Name</label>
                    <input
                      type="text"
                      value={newPlaceName}
                      onChange={e => setNewPlaceName(e.target.value)}
                      placeholder="e.g. Utkal Hospital Trauma Centre"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">Category</label>
                    <select
                      value={newPlaceCategory}
                      onChange={e => setNewPlaceCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none"
                    >
                      <option value="Health Clinic">Health & Hospital</option>
                      <option value="Civic Administration">Municipal Office</option>
                      <option value="Heritage Monument">Heritage Monument</option>
                      <option value="Green Infrastructure">Park & Environment</option>
                      <option value="Transit Station">Transit & Bus Stop</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">Address / Landmark</label>
                    <input
                      type="text"
                      value={newPlaceAddress}
                      onChange={e => setNewPlaceAddress(e.target.value)}
                      placeholder="e.g. Near Kalpana Square, Bhubaneswar"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowAddPlaceModal(false)} className="px-4 py-2 rounded-xl border border-heritage-stone text-xs font-semibold">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon-dark">
                    Save to Places
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: PREFERENCES & ACCESSIBILITY ──────────────────────────────── */}
      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-heritage-charcoal rounded-3xl border border-heritage-stone dark:border-heritage-charcoal p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-heritage-stone/40 dark:border-heritage-charcoal">
            <div>
              <h2 className="font-serif font-bold text-xl text-heritage-charcoal dark:text-heritage-ivory">Language & Accessibility Settings</h2>
              <p className="text-xs text-heritage-aged mt-0.5">
                Configure visual contrast, screen reader aids, and theme palettes.
              </p>
            </div>
            {prefSaveSuccess && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>{prefSaveSuccess}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual Theme Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">
                Platform Visual Palette
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'HERITAGE', label: 'Odisha Heritage', desc: 'Warm ivory, maroon & brass gold' },
                  { id: 'SYSTEM', label: 'System Default', desc: 'Follows operating system mode' },
                  { id: 'LIGHT', label: 'High Clarity Light', desc: 'Crisp bright modern contrast' },
                  { id: 'DARK', label: 'Sleek Charcoal Dark', desc: 'Reduced glare for nighttime' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setThemeMode(t.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      themeMode === t.id
                        ? 'border-heritage-maroon dark:border-heritage-gold bg-heritage-maroon/5 dark:bg-heritage-gold/10'
                        : 'border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold/40'
                    }`}
                  >
                    <span className="block font-bold text-xs text-heritage-charcoal dark:text-heritage-ivory">{t.label}</span>
                    <span className="text-[10px] text-heritage-aged mt-0.5 block">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accessibility Toggles */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">
                Assistive Accessibility Controls
              </label>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal cursor-pointer">
                  <div>
                    <span className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">High Contrast Mode</span>
                    <span className="text-[11px] text-heritage-aged">Increases visual border definitions and text legibility.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={e => setHighContrast(e.target.checked)}
                    className="w-4 h-4 text-heritage-maroon rounded focus:ring-heritage-gold"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal cursor-pointer">
                  <div>
                    <span className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">Screen Reader Optimization</span>
                    <span className="text-[11px] text-heritage-aged">Injects ARIA descriptors and simplifies tab index traversal.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={screenReader}
                    onChange={e => setScreenReader(e.target.checked)}
                    className="w-4 h-4 text-heritage-maroon rounded focus:ring-heritage-gold"
                  />
                </label>
              </div>

              {/* Notification Preferences Shortcut */}
              <div className="p-4 rounded-2xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark border border-heritage-stone/30 dark:border-heritage-charcoal flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">Notification Preferences</span>
                  <span className="text-[11px] text-heritage-aged">Managed through Unified Citizen Communication Center (Module 7).</span>
                </div>
                <button
                  onClick={() => navigateTo('inbox')}
                  className="px-3 py-1.5 rounded-xl bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon-dark transition-colors flex items-center space-x-1"
                >
                  <span>Open Inbox Settings</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-heritage-stone/30 dark:border-heritage-charcoal flex justify-end">
            <button
              onClick={handleSavePreferences}
              className="px-6 py-2.5 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white text-xs font-semibold shadow-md transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 6: PRIVACY & SECURITY CENTER ────────────────────────────────── */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-heritage-charcoal rounded-3xl border border-heritage-stone dark:border-heritage-charcoal p-6 sm:p-8 shadow-sm space-y-8">
          <div>
            <h2 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold">Privacy & Security Center</h2>
            <p className="text-xs text-heritage-aged mt-0.5">
              Comprehensive transparency on data stored, active authenticated sessions, and citizen statutory rights under the DPDP Act 2023.
            </p>
          </div>

          {/* Section A: Active Sessions and Devices */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-heritage-maroon dark:text-heritage-gold" />
                <span>Active Sessions & Connected Devices</span>
              </h3>
              <span className="text-xs text-heritage-aged">{sessions.length} Active sessions</span>
            </div>

            <div className="space-y-3">
              {sessions.map(sess => (
                <div
                  key={sess.session_id}
                  className="p-4 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory">
                      {sess.device_type === 'MOBILE' ? <Smartphone className="w-5 h-5" /> :
                       sess.device_type === 'TABLET' ? <Tablet className="w-5 h-5" /> :
                       <Monitor className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-heritage-charcoal dark:text-heritage-ivory">
                          {sess.device_name}
                        </span>
                        {sess.is_current && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Current Device
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-heritage-aged mt-0.5">
                        {sess.location_city} • IP: <span className="font-mono">{sess.ip_address}</span>
                      </p>
                    </div>
                  </div>

                  {!sess.is_current ? (
                    <button
                      onClick={() => handleRevokeSession(sess.session_id)}
                      className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 dark:border-red-900/60 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <span className="text-[11px] text-heritage-aged italic">This browser</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Consent Ledger (DPDP Act) */}
          <div className="space-y-4 pt-4 border-t border-heritage-stone/30 dark:border-heritage-charcoal">
            <div>
              <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-heritage-maroon dark:text-heritage-gold" />
                <span>Explicit Consent & Purpose Ledger</span>
              </h3>
              <p className="text-xs text-heritage-aged mt-0.5">
                Revoking an optional permission stops future tracking without erasing previously resolved civic records.
              </p>
            </div>

            <div className="space-y-3">
              {consents.map(c => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-heritage-charcoal dark:text-heritage-ivory">{c.title}</span>
                      {c.is_mandatory && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-heritage-stone/30 text-heritage-aged">
                          Mandatory
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-heritage-aged leading-relaxed">{c.description}</p>
                    <span className="text-[10px] text-heritage-aged/80 block">Version {c.version}</span>
                  </div>

                  <button
                    onClick={() => handleToggleConsent(c.id, c.status)}
                    disabled={c.is_mandatory}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 self-end sm:self-auto ${
                      c.status === 'GRANTED'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-heritage-stone/30 text-heritage-aged hover:bg-heritage-stone/50'
                    } ${c.is_mandatory ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {c.status === 'GRANTED' ? 'Granted ✓' : 'Revoked ✗'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Data Export (Right to Access) */}
          <div className="space-y-4 pt-4 border-t border-heritage-stone/30 dark:border-heritage-charcoal">
            <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-serif font-bold text-sm text-indigo-950 dark:text-indigo-200 flex items-center space-x-2">
                  <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Request Secure Personal Data Export</span>
                </h4>
                <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 mt-1">
                  Download an authorized JSON package containing your profile, reports, community votes, and saved itineraries.
                </p>
                {exportNotice && (
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold mt-2">
                    {exportNotice}
                  </p>
                )}
              </div>
              <button
                onClick={handleDataExport}
                disabled={exportLoading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-colors flex items-center space-x-2 shrink-0 self-start sm:self-auto"
              >
                {exportLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>Generate Export Bundle</span>
              </button>
            </div>
          </div>

          {/* Section D: Account Deletion (30-day grace period) */}
          <div className="space-y-4 pt-4 border-t border-heritage-stone/30 dark:border-heritage-charcoal">
            <div className="p-5 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-serif font-bold text-sm text-red-950 dark:text-red-200 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>Close Account & Schedule Data Purge</span>
                </h4>
                <p className="text-xs text-red-800/80 dark:text-red-300/80 mt-1 max-w-lg">
                  Initiates a 30-day grace period. Statutory audit records (such as completed civil work disputes) are retained anonymously for municipal compliance.
                </p>
              </div>
              <button
                onClick={() => setShowDeletionModal(true)}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md transition-colors shrink-0 self-start sm:self-auto"
              >
                Request Account Deletion
              </button>
            </div>
          </div>

          {/* Deletion Modal */}
          {showDeletionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-heritage-charcoal rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-400 space-y-4">
                <div className="flex items-center space-x-3 text-red-600">
                  <AlertCircle className="w-6 h-6" />
                  <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory">Confirm Account Deletion</h3>
                </div>

                <p className="text-xs text-heritage-aged leading-relaxed">
                  Are you sure you want to schedule your account for permanent closure? A 30-day grace period begins immediately, during which you can cancel at any time simply by signing in.
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">Reason (Optional)</label>
                  <input
                    type="text"
                    value={deletionReason}
                    onChange={e => setDeletionReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button onClick={() => setShowDeletionModal(false)} className="px-4 py-2 rounded-xl border border-heritage-stone text-xs font-semibold">
                    Cancel
                  </button>
                  <button onClick={handleScheduleDeletion} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold">
                    Confirm 30-Day Deletion
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
