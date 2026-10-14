import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KonarkWheelIcon } from './OdishaMotifs';
import {
  Bell,
  Globe,
  Sun,
  Moon,
  Shield,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  Info,
  UserCheck,
  Grid,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenFlagship: () => void;
  onOpenRoleSwitcher: () => void;
  activeView: string;
  onSelectView?: (view: string) => void;
  onNavigateBack?: () => void;
}

const MODULE_OPTIONS = [
  { id: 'landing', label: 'Home Landing' },
  { id: 'portal', label: 'Access Portal' },
  { id: 'citizen', label: 'Citizen Portal' },
  { id: 'command', label: 'City Command Center' },
  { id: 'ai_intelligence', label: 'AI Intelligence' },
  { id: 'municipal', label: 'Municipal Operations' },
  { id: 'field_worker', label: 'Field Worker Terminal' },
  { id: 'emergency', label: 'Emergency 108 Dispatch' },
  { id: 'hospitals', label: 'Hospital Trauma Desk' },
  { id: 'traffic', label: 'Traffic & Road Control' },
  { id: 'cameras', label: 'Smart CCTV Cameras' },
  { id: 'weather', label: 'Weather Telemetry' },
  { id: 'tourism', label: 'Smart Tourism Gateway' },
  { id: 'admin', label: 'Super Admin Governance' },
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenFlagship, onOpenRoleSwitcher, activeView, onSelectView, onNavigateBack }) => {
  const { user, role, language, theme, toggleLanguage, toggleTheme, notifications, unreadNotifsCount, markNotifAsRead } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showModules, setShowModules] = useState(false);

  const roleLabels: Record<UserRole, { en: string }> = {
    CITIZEN: { en: "Citizen Portal" },
    FIELD_WORKER: { en: "Field Worker" },
    DEPARTMENT_OFFICER: { en: "Dept Officer" },
    DEPARTMENT_SUPERVISOR: { en: "Supervisor" },
    TRAFFIC_OPERATOR: { en: "Traffic Control" },
    HOSPITAL_COORDINATOR: { en: "Hospital Desk" },
    FIRE_RESCUE_OPERATOR: { en: "Fire & Rescue" },
    EMERGENCY_COORDINATOR: { en: "Emergency Coord" },
    TOURISM_ADMIN: { en: "Tourism Admin" },
    CITY_COMMANDER: { en: "City Commander" },
    SUPER_ADMIN: { en: "Super Admin" },
  };

  return (
    <header className="sticky top-0 z-40 bg-heritage-ivory/95 dark:bg-heritage-charcoal-dark/95 backdrop-blur-md border-b border-heritage-stone dark:border-heritage-charcoal shadow-sm transition-colors duration-200 w-full">
      <div className="w-full px-3 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Brand & Temple Sun Wheel Logo with Step-by-Step Back Arrow */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {activeView !== 'landing' && (
            <button
              onClick={() => {
                if (onNavigateBack) {
                  onNavigateBack();
                } else {
                  onSelectView?.('landing');
                }
              }}
              className="p-1.5 px-2.5 rounded-lg border border-heritage-stone dark:border-heritage-charcoal bg-white/80 dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory hover:text-heritage-gold hover:border-heritage-gold transition-colors flex items-center space-x-1.5 text-xs font-semibold shadow-sm group"
              title="Go 1 Step Back"
            >
              <ArrowLeft className="w-4 h-4 text-heritage-maroon dark:text-heritage-gold transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectView?.('landing')}>
            <div className="p-1.5 rounded-lg bg-heritage-maroon text-heritage-gold shadow-md">
              <KonarkWheelIcon size={28} className="animate-spin-slow text-heritage-gold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-xl tracking-tight text-heritage-maroon dark:text-heritage-gold">
                  CIVIC NEXUS AI
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-heritage-gold/20 text-heritage-charcoal dark:text-heritage-stone border border-heritage-gold/40">
                  ODISHA SMART CITY
                </span>
              </div>
              <p className="text-[11px] text-heritage-aged dark:text-heritage-stone/70 font-sans tracking-wide">
                The AI Nervous System for a Self-Healing City
              </p>
            </div>
          </div>
        </div>

        {/* Right: Controls & Persona Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Active Language Badge (English Only) */}
          <div
            title="Interface Language: English"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md border border-heritage-stone dark:border-heritage-charcoal bg-white/80 dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory text-xs font-medium"
          >
            <Globe className="w-3.5 h-3.5 text-heritage-maroon dark:text-heritage-gold" />
            <span>English</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle Light / Dark mode"
            className="p-1.5 rounded-md border border-heritage-stone dark:border-heritage-charcoal bg-white/80 dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory hover:text-heritage-gold transition-colors"
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-heritage-maroon" /> : <Sun className="w-4 h-4 text-heritage-gold" />}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-1.5 rounded-md border border-heritage-stone dark:border-heritage-charcoal bg-white/80 dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory hover:text-heritage-gold transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-heritage-red text-[10px] font-bold text-white">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-heritage-ivory dark:bg-heritage-charcoal-dark border border-heritage-stone dark:border-heritage-charcoal shadow-heritage-lg z-50 p-3">
                <div className="flex items-center justify-between pb-2 border-b border-heritage-stone dark:border-heritage-charcoal">
                  <h4 className="font-semibold text-xs text-heritage-maroon dark:text-heritage-gold uppercase tracking-wider">
                    City Alerts &amp; Notifications
                  </h4>
                  <span className="text-[11px] text-heritage-aged">{notifications.length} updates</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-heritage-stone/40 dark:divide-heritage-charcoal mt-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-heritage-aged text-center py-4">No recent notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotifAsRead(n.id)}
                        className={`py-2.5 px-2 hover:bg-white/60 dark:hover:bg-heritage-charcoal rounded-lg cursor-pointer transition-colors ${!n.is_read ? 'bg-heritage-stone/30 dark:bg-heritage-charcoal/50' : ''}`}
                      >
                        <div className="flex items-start space-x-2">
                          {n.notification_type === 'CRITICAL' || n.notification_type === 'ALERT' ? (
                            <AlertTriangle className="w-4 h-4 text-heritage-orange shrink-0 mt-0.5" />
                          ) : n.notification_type === 'SUCCESS' ? (
                            <CheckCircle className="w-4 h-4 text-heritage-green shrink-0 mt-0.5" />
                          ) : (
                            <Info className="w-4 h-4 text-heritage-blue shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory">{n.title}</p>
                            <p className="text-[11px] text-heritage-aged dark:text-heritage-stone/80 line-clamp-2 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-heritage-aged mt-1 block">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
