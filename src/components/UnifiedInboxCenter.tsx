import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, CheckCircle2, Clock, AlertTriangle, MessageSquare, Filter,
  Search, Check, Archive, Eye, Send, ArrowRight, Shield, Sparkles,
  ChevronRight, RefreshCw, X, Sliders, Inbox as InboxIcon, Settings,
  AlertCircle, Briefcase, Users, Compass, Megaphone, Moon, Mail, Phone,
  ExternalLink, ArrowUpRight, Save
} from 'lucide-react';
import { KonarkWheelIcon } from './OdishaMotifs';

interface InboxNotification {
  id: number;
  notification_code: string;
  citizen_id: number;
  category: string;
  title: string;
  odia_title?: string;
  body: string;
  action_required: boolean;
  action_type?: string;
  action_label?: string;
  action_url?: string;
  related_entity_type?: string;
  related_entity_id?: number;
  related_entity_code?: string;
  is_read: boolean;
  is_archived: boolean;
  due_date?: string;
  created_at: string;
}

interface InboxStats {
  unread_count: number;
  needs_action_count: number;
  this_week_count: number;
  total_count: number;
}

interface MessageThread {
  id: number;
  thread_code: string;
  department_code: string;
  department_name: string;
  subject: string;
  related_case_code?: string;
  status: string;
  message_count: number;
  last_message?: {
    sender_name?: string;
    message_text?: string;
    created_at: string;
  };
}

interface ThreadDetail {
  id: number;
  thread_code: string;
  department_code: string;
  department_name: string;
  subject: string;
  related_case_code?: string;
  status: string;
  messages: Array<{
    id: number;
    sender_type: string;
    sender_name: string;
    message_text: string;
    created_at: string;
  }>;
}

export const UnifiedInboxCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'action_required' | 'messages' | 'alerts' | 'preferences'>('all');
  const [lang, setLang] = useState<'en' | 'or'>('en');

  // Telemetry & Feed state
  const [stats, setStats] = useState<InboxStats>({
    unread_count: 4,
    needs_action_count: 2,
    this_week_count: 12,
    total_count: 14
  });
  const [notifications, setNotifications] = useState<InboxNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Notification Detail
  const [selectedNotif, setSelectedNotif] = useState<InboxNotification | null>(null);

  // Message Threads
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [activeThreadDetail, setActiveThreadDetail] = useState<ThreadDetail | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [replySending, setReplySending] = useState<boolean>(false);

  // Notification Preferences
  const [preferences, setPreferences] = useState<any>({
    case_updates: { inapp: true, push: true, email: true, sms: false },
    action_required: { inapp: true, push: true, email: true, sms: true },
    community: { inapp: true, push: false, email: false, sms: false },
    tourism: { inapp: true, push: false, email: false, sms: false },
    announcements: { inapp: true, push: true, email: false, sms: false },
    digest_frequency: 'DAILY',
    quiet_hours_enabled: true
  });
  const [prefSaveMsg, setPrefSaveMsg] = useState<string | null>(null);

  // ───────────────────────────────────────────────────────────────────────────
  // DATA FETCHERS
  // ───────────────────────────────────────────────────────────────────────────

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/citizen/inbox/stats?citizen_id=1');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load inbox stats:', err);
    }
  };

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ citizen_id: '1' });
      if (activeTab === 'action_required') params.append('action_required', 'true');
      if (activeTab === 'alerts') params.append('category', 'ANNOUNCEMENT');
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/citizen/inbox/notifications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  const fetchThreads = async () => {
    try {
      const res = await fetch('/api/citizen/inbox/threads?citizen_id=1');
      if (res.ok) {
        const data = await res.json();
        setThreads(data);
      }
    } catch (err) {
      console.error('Failed to load message threads:', err);
    }
  };

  const fetchThreadDetail = async (threadId: number) => {
    try {
      const res = await fetch(`/api/citizen/inbox/threads/${threadId}?citizen_id=1`);
      if (res.ok) {
        const data = await res.json();
        setActiveThreadDetail(data);
      }
    } catch (err) {
      console.error('Failed to load thread detail:', err);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/citizen/inbox/preferences?citizen_id=1');
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchNotifications();
    fetchThreads();
    fetchPreferences();
  }, [fetchNotifications]);

  // ───────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ───────────────────────────────────────────────────────────────────────────

  const toggleReadStatus = async (notifId: number, currentRead: boolean) => {
    try {
      const res = await fetch(`/api/citizen/inbox/notifications/${notifId}?citizen_id=1`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: !currentRead })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: !currentRead } : n));
        fetchStats();
      }
    } catch (err) {
      console.error('Error toggling read status:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/citizen/inbox/mark-all-read?citizen_id=1', { method: 'POST' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        fetchStats();
      }
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const handleArchiveNotif = async (notifId: number) => {
    try {
      const res = await fetch(`/api/citizen/inbox/notifications/${notifId}/archive?citizen_id=1`, { method: 'POST' });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notifId));
        setSelectedNotif(null);
        fetchStats();
      }
    } catch (err) {
      console.error('Error archiving notification:', err);
    }
  };

  const handleSendThreadReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThreadId || !replyText.trim() || replySending) return;

    setReplySending(true);
    try {
      const res = await fetch(`/api/citizen/inbox/threads/${activeThreadId}/messages?citizen_id=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_text: replyText.trim(),
          sender_name: 'Debabrata Mohanty'
        })
      });
      if (res.ok) {
        setReplyText('');
        fetchThreadDetail(activeThreadId);
        fetchThreads();
      }
    } catch (err) {
      console.error('Error posting thread reply:', err);
    } finally {
      setReplySending(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        case_updates_inapp: preferences.case_updates.inapp,
        case_updates_push: preferences.case_updates.push,
        case_updates_email: preferences.case_updates.email,
        case_updates_sms: preferences.case_updates.sms,
        action_required_inapp: preferences.action_required.inapp,
        action_required_push: preferences.action_required.push,
        action_required_email: preferences.action_required.email,
        action_required_sms: preferences.action_required.sms,
        community_inapp: preferences.community.inapp,
        community_push: preferences.community.push,
        community_email: preferences.community.email,
        community_sms: preferences.community.sms,
        tourism_inapp: preferences.tourism.inapp,
        tourism_push: preferences.tourism.push,
        tourism_email: preferences.tourism.email,
        tourism_sms: preferences.tourism.sms,
        announcements_inapp: preferences.announcements.inapp,
        announcements_push: preferences.announcements.push,
        announcements_email: preferences.announcements.email,
        announcements_sms: preferences.announcements.sms,
        digest_frequency: preferences.digest_frequency,
        quiet_hours_enabled: preferences.quiet_hours_enabled
      };

      const res = await fetch('/api/citizen/inbox/preferences?citizen_id=1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setPrefSaveMsg('Notification channels and settings updated successfully!');
        setTimeout(() => setPrefSaveMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'ACTION_REQUIRED':
        return { label: 'Action Required', bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30' };
      case 'CASE_UPDATE':
        return { label: 'Case Update', bg: 'bg-heritage-maroon/10 text-heritage-maroon dark:text-heritage-gold border-heritage-maroon/20' };
      case 'OFFICIAL_MESSAGE':
        return { label: 'Official Message', bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30' };
      case 'COMMUNITY':
        return { label: 'Community', bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30' };
      case 'TOURISM_ALERT':
        return { label: 'Tourism Advisory', bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' };
      default:
        return { label: 'Announcement', bg: 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/30' };
    }
  };

  return (
    <div className="p-4 sm:p-6 pb-24 lg:pb-8 bg-heritage-ivory dark:bg-heritage-charcoal-dark min-h-screen text-heritage-charcoal dark:text-heritage-ivory">
      
      {/* ── HEADER BANNER ─────────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-r from-heritage-maroon via-[#6b1424] to-[#4a0d18] text-white p-6 sm:p-8 shadow-xl border border-heritage-gold/30">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(#C49A45 1.5px, transparent 1.5px)', backgroundSize: '18px 18px' }} />
        <KonarkWheelIcon size={110} className="absolute -right-5 -bottom-5 text-heritage-gold opacity-15 animate-spin-slow" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-heritage-gold/25 border border-heritage-gold/40 text-heritage-gold text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <Bell className="w-3.5 h-3.5" />
                <span>Unified Citizen Communication Center</span>
              </span>
            </div>
            
            <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight text-white">
              Inbox
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1.5 font-light">
              Updates that matter to you — cases, reviews, official replies, and community decisions.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <Check className="w-3.5 h-3.5 text-heritage-gold" />
              <span>Mark All Read</span>
            </button>
          </div>
        </div>

        {/* Dynamic Singpass-style metric cards */}
        <div className="grid grid-cols-3 gap-3.5 mt-6 pt-5 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-300 flex items-center justify-center font-bold text-lg">
              {String(stats.unread_count).padStart(2, '0')}
            </div>
            <div>
              <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Unread</p>
              <p className="text-xs font-bold text-white mt-0.5">Need attention</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-lg">
              {String(stats.needs_action_count).padStart(2, '0')}
            </div>
            <div>
              <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Needs Action</p>
              <p className="text-xs font-bold text-white mt-0.5">Your input due</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-heritage-gold/20 text-heritage-gold flex items-center justify-center font-bold text-lg">
              {String(stats.this_week_count).padStart(2, '0')}
            </div>
            <div>
              <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">This Week</p>
              <p className="text-xs font-bold text-white mt-0.5">Recent updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS ─────────────────────────────────────────────────── */}
      <div className="flex space-x-2 overflow-x-auto pb-2 mb-6 border-b border-heritage-stone dark:border-heritage-charcoal scrollbar-none">
        {[
          { id: 'all', label: 'All Notifications', icon: InboxIcon, badge: stats.unread_count },
          { id: 'action_required', label: 'Action Required', icon: AlertTriangle, badge: stats.needs_action_count },
          { id: 'messages', label: 'Official Messages', icon: MessageSquare, badge: threads.length },
          { id: 'alerts', label: 'Alerts & Announcements', icon: Megaphone },
          { id: 'preferences', label: 'Notification Settings', icon: Settings },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'messages' && threads.length > 0 && !activeThreadId) {
                  setActiveThreadId(threads[0].id);
                  fetchThreadDetail(threads[0].id);
                }
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-heritage-maroon text-white shadow-heritage'
                  : 'bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory hover:bg-heritage-gold/10 border border-heritage-stone dark:border-heritage-charcoal'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-heritage-gold' : 'text-heritage-maroon dark:text-heritage-gold'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-heritage-gold text-heritage-charcoal' : 'bg-heritage-maroon/10 text-heritage-maroon dark:text-heritage-gold'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TABS 1 & 2: NOTIFICATION STREAM & ACTION REQUIRED ─────────────────── */}
      {(activeTab === 'all' || activeTab === 'action_required' || activeTab === 'alerts') && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notifications by title, case code (CN-2048), department..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
            />
          </div>

          {/* List of Notification Cards */}
          {loading ? (
            <div className="p-12 text-center text-heritage-aged">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-heritage-maroon dark:text-heritage-gold" />
              <p className="text-xs">Loading citizen notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-heritage-charcoal rounded-3xl border border-dashed border-heritage-stone dark:border-heritage-charcoal">
              <Bell className="w-10 h-10 mx-auto text-heritage-aged/40 mb-3" />
              <h3 className="font-bold text-sm">No notifications here</h3>
              <p className="text-xs text-heritage-aged mt-1">You are all caught up with your civic cases and community updates.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notif => {
                const badge = getCategoryBadge(notif.category);
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      setSelectedNotif(notif);
                      if (!notif.is_read) toggleReadStatus(notif.id, false);
                    }}
                    className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      !notif.is_read
                        ? 'bg-white dark:bg-heritage-charcoal border-l-4 border-l-heritage-maroon border-heritage-gold/40 shadow-sm'
                        : 'bg-white/60 dark:bg-heritage-charcoal/60 border-heritage-stone dark:border-heritage-charcoal opacity-90'
                    } hover:border-heritage-gold hover:shadow-md`}
                  >
                    <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                      {/* Left icon pill */}
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        notif.action_required
                          ? 'bg-amber-500/15 text-amber-600'
                          : notif.category === 'CASE_UPDATE'
                          ? 'bg-heritage-maroon/10 text-heritage-maroon dark:text-heritage-gold'
                          : notif.category === 'COMMUNITY'
                          ? 'bg-purple-500/10 text-purple-600'
                          : 'bg-emerald-500/10 text-emerald-600'
                      }`}>
                        {notif.action_required ? <AlertTriangle className="w-5 h-5" /> : notif.category === 'CASE_UPDATE' ? <Briefcase className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                      </div>

                      {/* Content block */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          
                          {notif.related_entity_code && (
                            <span className="text-[10px] font-bold text-heritage-aged bg-heritage-stone/40 dark:bg-heritage-charcoal-dark px-2 py-0.5 rounded-md">
                              Case {notif.related_entity_code}
                            </span>
                          )}

                          {notif.due_date && (
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md flex items-center space-x-1">
                              <Clock className="w-2.5 h-2.5" />
                              <span>Due: {notif.due_date}</span>
                            </span>
                          )}
                        </div>

                        <h4 className={`text-sm font-bold leading-snug ${!notif.is_read ? 'text-heritage-charcoal dark:text-heritage-ivory' : 'text-heritage-aged'}`}>
                          {notif.title}
                        </h4>

                        <p className="text-xs text-heritage-aged line-clamp-2 mt-1 leading-relaxed">
                          {notif.body}
                        </p>

                        <div className="flex items-center space-x-3 mt-2 text-[10px] text-heritage-aged font-medium">
                          <span>{new Date(notif.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          <span>·</span>
                          <span>{notif.notification_code}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right action button */}
                    <div className="flex items-center space-x-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-heritage-stone/40 dark:border-heritage-charcoal">
                      {notif.action_required && notif.action_label && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNotif(notif);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-bold text-xs shadow-heritage transition-all flex items-center space-x-1.5"
                        >
                          <span>{notif.action_label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-heritage-gold" />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReadStatus(notif.id, notif.is_read);
                        }}
                        className="p-2 rounded-xl border border-heritage-stone dark:border-heritage-charcoal text-heritage-aged hover:text-heritage-charcoal text-xs"
                        title={notif.is_read ? 'Mark as Unread' : 'Mark as Read'}
                      >
                        <Check className={`w-3.5 h-3.5 ${notif.is_read ? 'text-emerald-600' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveNotif(notif.id);
                        }}
                        className="p-2 rounded-xl border border-heritage-stone dark:border-heritage-charcoal text-heritage-aged hover:text-heritage-charcoal text-xs"
                        title="Archive notification"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: OFFICIAL MESSAGE THREADS ──────────────────────────────────── */}
      {activeTab === 'messages' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Left: Thread List */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-sm text-heritage-maroon dark:text-heritage-gold">
              Official Department Inquiries
            </h3>

            {threads.length === 0 ? (
              <p className="text-xs text-heritage-aged">No open conversation threads.</p>
            ) : (
              threads.map(th => (
                <div
                  key={th.id}
                  onClick={() => {
                    setActiveThreadId(th.id);
                    fetchThreadDetail(th.id);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    activeThreadId === th.id
                      ? 'bg-heritage-maroon text-white border-heritage-gold shadow-md'
                      : 'bg-white dark:bg-heritage-charcoal border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{th.department_name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      th.status === 'WAITING_CITIZEN' ? 'bg-amber-400 text-black' : 'bg-white/20 text-white'
                    }`}>
                      {th.status === 'WAITING_CITIZEN' ? 'Action Due' : th.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs mt-1.5 line-clamp-1">{th.subject}</h4>
                  
                  {th.last_message && (
                    <p className="text-[11px] opacity-80 mt-1 line-clamp-2">
                      {th.last_message.message_text}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] opacity-70 mt-2 pt-2 border-t border-white/10">
                    <span>Thread: {th.thread_code}</span>
                    <span>{th.message_count} messages</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right: Active Thread Chat View */}
          <div className="md:col-span-2 rounded-3xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal p-5 flex flex-col justify-between shadow-sm min-h-[450px]">
            {activeThreadDetail ? (
              <>
                {/* Thread Header */}
                <div className="pb-3 border-b border-heritage-stone dark:border-heritage-charcoal">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-heritage-maroon dark:text-heritage-gold uppercase tracking-wider">
                      {activeThreadDetail.department_name}
                    </span>
                    <span className="text-[10px] text-heritage-aged font-bold">
                      Case: {activeThreadDetail.related_case_code}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory mt-0.5">
                    {activeThreadDetail.subject}
                  </h3>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-72">
                  {activeThreadDetail.messages.map(m => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.sender_type === 'CITIZEN' ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-heritage-aged font-semibold px-1 mb-0.5">{m.sender_name}</span>
                      <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        m.sender_type === 'CITIZEN'
                          ? 'bg-heritage-maroon text-white font-medium rounded-br-none shadow-sm'
                          : 'bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory border border-heritage-stone dark:border-heritage-charcoal rounded-bl-none shadow-sm'
                      }`}>
                        {m.message_text}
                      </div>
                      <span className="text-[9px] text-heritage-aged mt-0.5 px-1">
                        {new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendThreadReply} className="pt-3 border-t border-heritage-stone dark:border-heritage-charcoal flex space-x-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type official reply or clarification to municipal officer..."
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory/60 dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={replySending || !replyText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-bold text-xs shadow-heritage transition-all disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    <span>Send Reply</span>
                    <Send className="w-3.5 h-3.5 text-heritage-gold" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-heritage-aged">
                <MessageSquare className="w-8 h-8 opacity-40 mb-2" />
                <p className="text-xs">Select a conversation thread to inspect and reply.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── TAB 5: NOTIFICATION PREFERENCES MATRIX ───────────────────────────── */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-6">
            <div>
              <h2 className="font-serif font-black text-xl text-heritage-maroon dark:text-heritage-gold flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Notification Settings & Delivery Channels</span>
              </h2>
              <p className="text-xs text-heritage-aged mt-1">
                Control which updates are delivered to your preferred communication channels.
              </p>
            </div>

            {prefSaveMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                {prefSaveMsg}
              </div>
            )}

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-heritage-stone dark:border-heritage-charcoal text-[11px] uppercase tracking-wider text-heritage-aged font-bold">
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5 text-center">In-App</th>
                    <th className="py-2.5 text-center">Push</th>
                    <th className="py-2.5 text-center">Email</th>
                    <th className="py-2.5 text-center">SMS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-heritage-stone/40 dark:divide-heritage-charcoal-dark font-medium">
                  {[
                    { key: 'case_updates', title: 'Case & Service Updates', desc: 'Status assignments, work dispatch and completion' },
                    { key: 'action_required', title: 'Action-Required Reminders', desc: 'Completion reviews, poll closing notices' },
                    { key: 'community', title: 'Community & Proposals', desc: 'Public proposal votes and milestone updates' },
                    { key: 'tourism', title: 'Tourism & Travel Advisories', desc: 'Road closures, weather warnings, festival alerts' },
                    { key: 'announcements', title: 'Public City Announcements', desc: 'Monsoon desilting schedules and health drives' },
                  ].map(row => (
                    <tr key={row.key} className="hover:bg-heritage-ivory/50 dark:hover:bg-heritage-charcoal-dark/50">
                      <td className="py-3 pr-4">
                        <p className="font-bold text-heritage-charcoal dark:text-heritage-ivory">{row.title}</p>
                        <p className="text-[10px] text-heritage-aged">{row.desc}</p>
                      </td>
                      {['inapp', 'push', 'email', 'sms'].map(channel => (
                        <td key={channel} className="py-3 text-center">
                          <input
                            type="checkbox"
                            checked={preferences[row.key]?.[channel] ?? false}
                            onChange={e => {
                              const checked = e.target.checked;
                              setPreferences((prev: any) => ({
                                ...prev,
                                [row.key]: {
                                  ...prev[row.key],
                                  [channel]: checked
                                }
                              }));
                            }}
                            className="rounded text-heritage-maroon focus:ring-heritage-gold w-4 h-4 cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Digest & Quiet Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-heritage-stone dark:border-heritage-charcoal">
              <div>
                <label className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">
                  Digest Frequency
                </label>
                <select
                  value={preferences.digest_frequency}
                  onChange={e => setPreferences((prev: any) => ({ ...prev, digest_frequency: e.target.value }))}
                  className="w-full p-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory/60 dark:bg-heritage-charcoal-dark font-semibold"
                >
                  <option value="NONE">Instant Notifications Only</option>
                  <option value="DAILY">Daily Summary Digest (8:00 AM)</option>
                  <option value="WEEKLY">Weekly Summary Digest (Monday)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">
                  Quiet Hours (10:00 PM – 7:00 AM)
                </label>
                <label className="flex items-center space-x-2 mt-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={preferences.quiet_hours_enabled}
                    onChange={e => setPreferences((prev: any) => ({ ...prev, quiet_hours_enabled: e.target.checked }))}
                    className="rounded text-heritage-maroon focus:ring-heritage-gold w-4 h-4"
                  />
                  <span>Mute non-critical alerts during night hours</span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-bold text-xs shadow-heritage transition-all flex items-center space-x-2"
              >
                <Save className="w-3.5 h-3.5 text-heritage-gold" />
                <span>Save Notification Preferences</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── MODAL: NOTIFICATION DETAIL & CONTEXT ───────────────────────────────── */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-2xl space-y-4">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadge(selectedNotif.category).bg}`}>
                  {getCategoryBadge(selectedNotif.category).label}
                </span>
                {selectedNotif.action_required && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    Action Required
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedNotif(null)} className="text-heritage-aged hover:text-heritage-charcoal">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory">
                {selectedNotif.title}
              </h3>
              {selectedNotif.odia_title && (
                <p className="text-xs text-heritage-maroon dark:text-heritage-gold font-serif mt-0.5">
                  {selectedNotif.odia_title}
                </p>
              )}
            </div>

            <p className="text-xs text-heritage-aged leading-relaxed">
              {selectedNotif.body}
            </p>

            <div className="p-3 rounded-2xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark border border-heritage-stone/40 dark:border-heritage-charcoal text-[11px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-heritage-aged">Notification Code:</span>
                <span className="font-mono font-bold text-heritage-charcoal dark:text-heritage-ivory">{selectedNotif.notification_code}</span>
              </div>
              {selectedNotif.related_entity_code && (
                <div className="flex justify-between">
                  <span className="text-heritage-aged">Related Record:</span>
                  <span className="font-bold text-heritage-maroon dark:text-heritage-gold">{selectedNotif.related_entity_code}</span>
                </div>
              )}
              {selectedNotif.due_date && (
                <div className="flex justify-between text-amber-700 dark:text-amber-400 font-bold">
                  <span>Action Due Date:</span>
                  <span>{selectedNotif.due_date}</span>
                </div>
              )}
              <div className="flex justify-between text-[10px] text-heritage-aged pt-1 border-t border-heritage-stone/30">
                <span>Timestamp:</span>
                <span>{new Date(selectedNotif.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex space-x-2">
              <button
                onClick={() => handleArchiveNotif(selectedNotif.id)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-heritage-stone text-heritage-aged hover:text-heritage-charcoal"
              >
                Archive
              </button>
              
              {selectedNotif.action_required && selectedNotif.action_label && (
                <button
                  onClick={() => {
                    setSelectedNotif(null);
                    alert(`Navigating to verified case workflow for ${selectedNotif.related_entity_code || 'case'}`);
                  }}
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white shadow-heritage flex items-center justify-center space-x-1.5"
                >
                  <span>{selectedNotif.action_label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-heritage-gold" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
