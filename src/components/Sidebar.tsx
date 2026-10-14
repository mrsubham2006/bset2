import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  FileText,
  Activity,
  Cpu,
  Building2,
  HardHat,
  Flame,
  Hospital,
  Navigation,
  Camera,
  CloudRain,
  Compass,
  ShieldCheck,
  Zap,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  collapsed,
  setCollapsed
}) => {
  const { language, role } = useApp();

  const navigationItems = [
    { id: 'landing', labelEn: 'Public Landing', labelOr: 'ମୁଖ୍ୟ ପୃଷ୍ଠା', icon: Home, roles: ['ALL'] },
    { id: 'citizen', labelEn: 'Citizen Portal', labelOr: 'ନାଗରିକ ପୋର୍ଟାଲ', icon: FileText, roles: ['ALL', 'CITIZEN'] },
    { id: 'command', labelEn: 'City Command Center', labelOr: 'ନଗର ନିୟନ୍ତ୍ରଣ କକ୍ଷ', icon: Activity, roles: ['CITY_COMMANDER', 'SUPER_ADMIN', 'DEPARTMENT_SUPERVISOR', 'ALL'] },
    { id: 'ai_intelligence', labelEn: 'AI Intelligence & Duplicates', labelOr: 'AI ବୁଦ୍ଧିମତା ଓ ପ୍ରତିଲିପି', icon: Cpu, roles: ['CITY_COMMANDER', 'SUPER_ADMIN', 'ALL'] },
    { id: 'municipal', labelEn: 'Municipal Departments', labelOr: 'ପୌର ବିଭାଗ କାର୍ଯ୍ୟ', icon: Building2, roles: ['DEPARTMENT_OFFICER', 'DEPARTMENT_SUPERVISOR', 'SUPER_ADMIN', 'ALL'] },
    { id: 'field_worker', labelEn: 'Field Worker Panel', labelOr: 'କ୍ଷେତ୍ର କର୍ମଚାରୀ କକ୍ଷ', icon: HardHat, roles: ['FIELD_WORKER', 'DEPARTMENT_SUPERVISOR', 'ALL'] },
    { id: 'emergency', labelEn: 'Emergency Response', labelOr: 'ଜରୁରୀକାଳୀନ ପ୍ରତିକ୍ରିୟା', icon: Flame, roles: ['EMERGENCY_COORDINATOR', 'FIRE_RESCUE_OPERATOR', 'ALL'] },
    { id: 'hospitals', labelEn: 'Hospital Trauma Desk', labelOr: 'ଚିକିତ୍ସାଳୟ ସମନ୍ୱୟ', icon: Hospital, roles: ['HOSPITAL_COORDINATOR', 'EMERGENCY_COORDINATOR', 'ALL'] },
    { id: 'traffic', labelEn: 'Traffic & Detour Control', labelOr: 'ଟ୍ରାଫିକ ଓ ପଥ ନିୟନ୍ତ୍ରଣ', icon: Navigation, roles: ['TRAFFIC_OPERATOR', 'CITY_COMMANDER', 'ALL'] },
    { id: 'cameras', labelEn: 'Smart Camera Vision', labelOr: 'ସ୍ମାର୍ଟ କ୍ୟାମେରା ଦୃଷ୍ଟି', icon: Camera, roles: ['CITY_COMMANDER', 'SUPER_ADMIN', 'ALL'] },
    { id: 'weather', labelEn: 'Weather & Flood Risk', labelOr: 'ପାଣିପାଗ ଓ ବନ୍ୟା ବିପଦ', icon: CloudRain, roles: ['ALL'] },
    { id: 'tourism', labelEn: 'Smart Tourism Gateway', labelOr: 'ଐତିହ୍ୟ ପର୍ଯ୍ୟଟନ', icon: Compass, roles: ['TOURISM_ADMIN', 'ALL'] },
    { id: 'admin', labelEn: 'Super Admin Governance', labelOr: 'ସର୍ବୋଚ୍ଚ ପ୍ରଶାସନ', icon: ShieldCheck, roles: ['SUPER_ADMIN', 'ALL'] },
  ];

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 z-30 transition-all duration-300 ease-in-out border-r border-heritage-stone dark:border-heritage-charcoal bg-heritage-maroon text-heritage-stone flex flex-col justify-between shadow-heritage ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header & Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        <div className="flex items-center justify-between px-2 mb-3">
          {!collapsed && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-heritage-gold">
              OPERATIONAL MODULES
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded bg-heritage-maroon-dark hover:text-heritage-gold transition-colors text-heritage-stone"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="space-y-1">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const label = item.labelEn;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                title={collapsed ? label : undefined}
                className={`w-full flex items-center space-x-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-heritage-gold text-heritage-charcoal-dark font-semibold shadow-md translate-x-1'
                    : 'text-heritage-stone/90 hover:bg-heritage-maroon-light hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-heritage-charcoal-dark' : 'text-heritage-gold'}`} />
                {!collapsed && (
                  <span className="truncate text-left flex-1">{label}</span>
                )}
                {!collapsed && isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-heritage-charcoal-dark" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sticky Flagship Trigger */}
      <div className="p-2 border-t border-heritage-maroon-dark bg-heritage-maroon-dark/60">
        <button
          onClick={() => setActiveView('flagship')}
          className={`w-full flex items-center space-x-2 p-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-heritage-gold to-heritage-orange text-heritage-charcoal shadow-gold-glow transition-all hover:brightness-110 ${
            activeView === 'flagship' ? 'ring-2 ring-white' : ''
          }`}
          title="Flagship 18-Step Scenario"
        >
          <Zap className="w-4 h-4 text-heritage-charcoal shrink-0" />
          {!collapsed && (
            <span className="truncate">
              Flagship 18-Step Run
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
