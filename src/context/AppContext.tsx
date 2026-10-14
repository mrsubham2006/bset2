import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, NotificationItem } from '../types';

interface AppContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  language: 'en' | 'or';
  theme: 'light' | 'dark';
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  toast: { message: string; type: 'info' | 'success' | 'alert' | 'error' } | null;
  liveSyncConnected: boolean;
  lastSyncEvent: any | null;
  loginAsRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  showToast: (message: string, type?: 'info' | 'success' | 'alert' | 'error') => void;
  markNotifAsRead: (id: number) => void;
  triggerGlobalRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('civic_token'));
  const [user, setUser] = useState<User | null>(null);
  const [language] = useState<'en' | 'or'>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'alert' | 'error' } | null>(null);
  const [liveSyncConnected, setLiveSyncConnected] = useState<boolean>(false);
  const [lastSyncEvent, setLastSyncEvent] = useState<any | null>(null);

  // Default commander profile on start for smooth presentation
  useEffect(() => {
    loginAsRole('CITY_COMMANDER');
    fetchNotifications();

    // Setup Real-Time Server-Sent Events (SSE) Bus
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/v1/sync/events');

      eventSource.onopen = () => {
        setLiveSyncConnected(true);
      };

      eventSource.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          setLastSyncEvent(parsed);
          fetchNotifications();

          // Dispatch window-level event for any active view to auto-refresh
          window.dispatchEvent(new CustomEvent('civic_sync_event', { detail: parsed }));

          // Show subtle notification for critical cross-portal events
          if (parsed.eventType && parsed.eventType !== 'connection.established') {
            const label = parsed.eventType.replace('_', ' ').toUpperCase();
            showToast(`Live Sync: ${label}`, 'info');
          }
        } catch (err) {
          console.warn("SSE parse error:", err);
        }
      };

      eventSource.onerror = () => {
        setLiveSyncConnected(false);
      };
    } catch (err) {
      console.warn("EventSource setup skipped:", err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const triggerGlobalRefresh = () => {
    fetchNotifications();
    window.dispatchEvent(new CustomEvent('civic_sync_event', { detail: { eventType: 'manual.refresh' } }));
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/v1/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Notifications fetch error:", err);
    }
  };

  const loginAsRole = async (targetRole: UserRole) => {
    try {
      const res = await fetch(`/api/v1/auth/switch-role/${targetRole}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem('civic_token', data.access_token);
        showToast(`Signed in as ${targetRole.replace('_', ' ')} (${data.user.full_name})`, 'success');
      }
    } catch (err) {
      console.error("Role switch error:", err);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('civic_token');
    showToast("Signed out successfully", 'info');
  };

  const toggleLanguage = () => {
    // English is the designated primary and sole interface language
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const showToast = (message: string, type: 'info' | 'success' | 'alert' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const markNotifAsRead = async (id: number) => {
    try {
      await fetch(`/api/v1/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadNotifsCount = notifications.filter(n => !n.is_read).length;

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        role: user ? user.role : 'CITY_COMMANDER',
        language,
        theme,
        notifications,
        unreadNotifsCount,
        toast,
        loginAsRole,
        logout,
        toggleLanguage,
        toggleTheme,
        showToast,
        markNotifAsRead,
        liveSyncConnected,
        lastSyncEvent,
        triggerGlobalRefresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
