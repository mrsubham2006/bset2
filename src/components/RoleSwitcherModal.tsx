import React from 'react';
import { useApp } from '../context/AppContext';
import { useUnifiedAuth, RoleId, DEMO_USER_PROFILES } from '../context/UnifiedAuthContext';
import { UserRole } from '../types';
import {
  Users,
  HardHat,
  Building,
  UserCheck,
  Navigation,
  Hospital,
  Flame,
  AlertOctagon,
  Compass,
  Crown,
  ShieldAlert,
  X
} from 'lucide-react';
import { KonarkWheelIcon } from './OdishaMotifs';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView?: (view: string) => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose, onSelectView }) => {
  const { role: currentRole, loginAsRole, language } = useApp();
  const { loginRole } = useUnifiedAuth();

  if (!isOpen) return null;

  const rolesConfig: {
    role: UserRole;
    titleEn: string;
    titleOr: string;
    person: string;
    dept: string;
    suggestedView: string;
    icon: any;
    color: string;
  }[] = [
    {
      role: 'CITIZEN',
      titleEn: 'Citizen Portal',
      titleOr: 'ନାଗରିକ ପୋର୍ଟାଲ',
      person: 'Debabrata Mohanty',
      dept: 'Resident of Rasulgarh, Bhubaneswar',
      suggestedView: 'citizen',
      icon: Users,
      color: 'bg-heritage-blue/20 text-heritage-blue border-heritage-blue/40'
    },
    {
      role: 'FIELD_WORKER',
      titleEn: 'Field Worker',
      titleOr: 'କ୍ଷେତ୍ର କର୍ମଚାରୀ',
      person: 'Bikash Mohapatra',
      dept: 'Drainage & Pump Response Crew',
      suggestedView: 'field_worker',
      icon: HardHat,
      color: 'bg-heritage-orange/20 text-heritage-orange border-heritage-orange/40'
    },
    {
      role: 'DEPARTMENT_OFFICER',
      titleEn: 'Department Officer',
      titleOr: 'ବିଭାଗୀୟ ଅଧିକାରୀ',
      person: 'Ananya Patnaik',
      dept: 'Municipal Drainage & Flood Ops',
      suggestedView: 'municipal',
      icon: Building,
      color: 'bg-heritage-maroon/20 text-heritage-maroon dark:text-heritage-gold border-heritage-maroon/40'
    },
    {
      role: 'DEPARTMENT_SUPERVISOR',
      titleEn: 'Department Supervisor',
      titleOr: 'ବିଭାଗୀୟ ତତ୍ତ୍ୱାବଧାରକ',
      person: 'Sanjay Tripathy',
      dept: 'Engineering Approval & Task Verification',
      suggestedView: 'municipal',
      icon: UserCheck,
      color: 'bg-heritage-green/20 text-heritage-green border-heritage-green/40'
    },
    {
      role: 'TRAFFIC_OPERATOR',
      titleEn: 'Traffic Operator',
      titleOr: 'ଟ୍ରାଫିକ ପରିଚାଳକ',
      person: 'Rakesh Behera',
      dept: 'Odisha Police Traffic Control Hub',
      suggestedView: 'traffic',
      icon: Navigation,
      color: 'bg-heritage-blue/20 text-heritage-blue border-heritage-blue/40'
    },
    {
      role: 'HOSPITAL_COORDINATOR',
      titleEn: 'Hospital Coordinator',
      titleOr: 'ଚିକିତ୍ସାଳୟ ସଂଯୋଜକ',
      person: 'Dr. Subhasree Nayak',
      dept: 'AIIMS & Capital Hospital Trauma Desk',
      suggestedView: 'hospitals',
      icon: Hospital,
      color: 'bg-heritage-red/20 text-heritage-red border-heritage-red/40'
    },
    {
      role: 'FIRE_RESCUE_OPERATOR',
      titleEn: 'Fire & Rescue Operator',
      titleOr: 'ଅଗ୍ନିଶମ ବାହିନୀ',
      person: 'Pradeep Jena',
      dept: 'Odisha Fire & Disaster Emergency Unit',
      suggestedView: 'emergency',
      icon: Flame,
      color: 'bg-heritage-red/20 text-heritage-red border-heritage-red/40'
    },
    {
      role: 'EMERGENCY_COORDINATOR',
      titleEn: 'Emergency Coordinator',
      titleOr: 'ଜରୁରୀକାଳୀନ ସଂଯୋଜକ',
      person: 'Manoj Das',
      dept: 'Unified Disaster & Incident Multi-Agency Hub',
      suggestedView: 'emergency',
      icon: AlertOctagon,
      color: 'bg-heritage-gold/20 text-heritage-charcoal dark:text-heritage-gold border-heritage-gold/40'
    },
    {
      role: 'TOURISM_ADMIN',
      titleEn: 'Smart Tourism Admin',
      titleOr: 'ପର୍ଯ୍ୟଟନ ପ୍ରଶାସକ',
      person: 'Swagatika Mishra',
      dept: 'Odisha Tourism & Cultural Heritage Desk',
      suggestedView: 'tourism',
      icon: Compass,
      color: 'bg-heritage-blue/20 text-heritage-blue border-heritage-blue/40'
    },
    {
      role: 'CITY_COMMANDER',
      titleEn: 'City Commander',
      titleOr: 'ମୁଖ୍ୟ ନଗର ଅଧୀକ୍ଷକ',
      person: 'Asit Kumar Rath',
      dept: 'Executive Smart City Operations Hub',
      suggestedView: 'command',
      icon: Crown,
      color: 'bg-heritage-gold/30 text-heritage-maroon dark:text-heritage-gold border-heritage-gold'
    },
    {
      role: 'SUPER_ADMIN',
      titleEn: 'Super Administrator',
      titleOr: 'ସର୍ବୋଚ୍ଚ ପ୍ରଶାସକ',
      person: 'Administrator (Team Code Blaze)',
      dept: 'Full Platform Governance & Audits',
      suggestedView: 'admin',
      icon: ShieldAlert,
      color: 'bg-heritage-maroon text-white border-heritage-gold'
    },
  ];

  const roleIdMap: Partial<Record<UserRole, RoleId>> = {
    CITIZEN: 'citizen',
    FIELD_WORKER: 'field_worker',
    DEPARTMENT_OFFICER: 'municipal',
    DEPARTMENT_SUPERVISOR: 'municipal',
    CITY_COMMANDER: 'command',
    EMERGENCY_COORDINATOR: 'emergency',
    SUPER_ADMIN: 'admin',
  };

  const handleSelect = async (r: UserRole, view: string) => {
    await loginAsRole(r);
    const unifiedRoleId = roleIdMap[r];
    if (unifiedRoleId) {
      const demoUser = DEMO_USER_PROFILES[unifiedRoleId];
      if (demoUser) {
        loginRole(unifiedRoleId, demoUser, `demo_token_${unifiedRoleId}`);
      }
    }
    if (onSelectView) {
      onSelectView(view);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-heritage-ivory dark:bg-heritage-charcoal-dark border border-heritage-stone dark:border-heritage-charcoal rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-heritage-stone dark:border-heritage-charcoal flex items-center justify-between bg-heritage-maroon text-heritage-stone">
          <div className="flex items-center space-x-3">
            <KonarkWheelIcon size={32} className="text-heritage-gold" />
            <div>
              <h3 className="font-serif font-bold text-lg text-white">
                Demonstration Role Switcher (11 Persona Access)
              </h3>
              <p className="text-xs text-heritage-stone/80 font-sans">
                Explore Civic Nexus AI from any authenticated citizen or government stakeholder perspective.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-heritage-maroon-dark text-heritage-stone hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {rolesConfig.map(item => {
            const Icon = item.icon;
            const isCurrent = currentRole === item.role;

            return (
              <div
                key={item.role}
                onClick={() => handleSelect(item.role, item.suggestedView)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left hover:scale-[1.02] flex flex-col justify-between ${
                  isCurrent
                    ? 'border-heritage-gold bg-heritage-gold/15 dark:bg-heritage-gold/10 ring-2 ring-heritage-gold'
                    : 'border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal hover:border-heritage-gold/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-2 rounded-lg border ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-heritage-maroon text-heritage-gold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">
                    {item.titleEn}
                  </h4>
                  <p className="text-xs font-semibold text-heritage-maroon dark:text-heritage-gold mt-0.5">
                    {item.person}
                  </p>
                  <p className="text-[11px] text-heritage-aged dark:text-heritage-stone/70 mt-1 line-clamp-2">
                    {item.dept}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-heritage-stone/40 dark:border-heritage-charcoal/80 flex items-center justify-between text-[11px]">
                  <span className="text-heritage-aged">Opens: {item.suggestedView}</span>
                  <span className="font-semibold text-heritage-maroon dark:text-heritage-gold">Switch Role →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
