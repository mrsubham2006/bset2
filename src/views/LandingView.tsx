import React from 'react';
import { useApp } from '../context/AppContext';
import { useUnifiedAuth, RoleId } from '../context/UnifiedAuthContext';
import { useCitizen } from '../context/CitizenContext';
import { KonarkWheelIcon, IkatPatternDivider, TempleSilhouetteIcon } from '../components/OdishaMotifs';
import {
  Shield,
  Activity,
  Cpu,
  Building2,
  HardHat,
  Flame,
  Hospital,
  Navigation,
  Camera,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Users,
  MapPin,
  ShieldCheck,
  Lock,
  KeyRound
} from 'lucide-react';

interface LandingViewProps {
  onExplore: (view: string) => void;
  onOpenFlagship: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onExplore, onOpenFlagship }) => {
  const { language } = useApp();
  const { isRoleAuthenticated } = useUnifiedAuth();
  const { isAuthenticated: isCitizenAuthenticated } = useCitizen();

  const isModuleAuthenticated = (viewId: string) => {
    if (viewId === 'citizen') return isCitizenAuthenticated || isRoleAuthenticated('citizen');
    return isRoleAuthenticated(viewId as RoleId);
  };

  const coreModules = [
    { title: "Citizen Portal", desc: "Citizen complaint reporting with photo, voice recording, and GPS tracking.", icon: Users, view: "citizen", roleBadge: "PUBLIC CITIZEN" },
    { title: "Municipal Department", desc: "Task lifecycle tracking across Drainage, Roads, Sanitation, and Lighting departments.", icon: Building2, view: "municipal", roleBadge: "OFFICER / SUPERVISOR" },
    { title: "Field Worker Panel", desc: "Mobile-optimized terminal for work instructions and before-and-after proof uploads.", icon: HardHat, view: "field_worker", roleBadge: "FIELD CREW / BADGE" },
    { title: "City Command Center", desc: "Unified operational map, live incident feed, and inter-agency dispatch.", icon: Activity, view: "command", roleBadge: "ICCC TELEMETRY" },
    { title: "Emergency Response", desc: "Multi-agency coordination for fire hazards, flooding, and major traffic accidents.", icon: Flame, view: "emergency", roleBadge: "108 MEDICAL & FIRE" },
    { title: "Super Admin Panel", desc: "Privileged system administration, RBAC security policies, and system audit logs.", icon: ShieldCheck, view: "admin", roleBadge: "SYSTEM GOVERNANCE" },
  ];

  return (
    <div className="min-h-screen bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory transition-colors">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-heritage-stone dark:border-heritage-charcoal">
        {/* Subtle decorative Konark radial background */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-heritage-gold/10 pointer-events-none blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-heritage-maroon/10 pointer-events-none blur-3xl" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          
          {/* Odisha Emblem / Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-heritage-stone/70 dark:bg-heritage-charcoal border border-heritage-gold/50 shadow-sm mb-6">
            <KonarkWheelIcon size={20} className="text-heritage-gold" />
            <span className="text-xs font-semibold tracking-wide text-heritage-maroon dark:text-heritage-gold">
              CIVIC NEXUS AI • ODISHA HERITAGE SMART URBAN ECOSYSTEM
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif font-extrabold text-3xl sm:text-5xl lg:text-6xl text-heritage-maroon dark:text-heritage-ivory tracking-tight leading-tight">
            One City. One Intelligence. <br />
            <span className="text-heritage-gold">Faster Response.</span>
          </h1>

          {/* Subheading */}
          <p className="mt-5 max-w-2xl mx-auto text-sm sm:text-base text-heritage-aged dark:text-heritage-stone/90 font-sans leading-relaxed">
            Rooted in Odisha's spirit of community. Powered by artificial intelligence. Built for safer, smarter cities. CIVIC NEXUS AI connects citizens, public services, infrastructure, and emergency responders through one unified operational nervous system.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onExplore('portal')}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-semibold text-sm shadow-heritage transition-all hover:scale-105 border border-heritage-gold/30"
            >
              <span>Secure Access Portal (6 Panels)</span>
              <ArrowRight className="w-4 h-4 text-heritage-gold" />
            </button>

            <button
              onClick={() => onExplore('command')}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-heritage-ivory dark:bg-heritage-charcoal border-2 border-heritage-maroon text-heritage-maroon dark:text-heritage-gold hover:bg-heritage-stone/40 font-semibold text-sm shadow-sm transition-all hover:scale-105"
            >
              <span>Command Center</span>
            </button>

            <button
              onClick={onOpenFlagship}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-heritage-gold to-heritage-orange text-heritage-charcoal-dark font-semibold text-sm shadow-gold-glow hover:brightness-110 transition-all hover:scale-105"
            >
              <Zap className="w-4 h-4 text-heritage-maroon fill-current" />
              <span>18-Step Scenario</span>
            </button>
          </div>

          {/* Command Center Preview Card */}
          <div className="mt-12 p-3 sm:p-4 rounded-3xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-heritage-lg max-w-5xl mx-auto">
            <div className="p-3 bg-heritage-maroon/95 rounded-2xl text-white flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-heritage-green animate-pulse" />
                <span className="font-bold tracking-wide">BHUBANESWAR - CUTTACK - PURI LIVE TELEMETRY</span>
              </div>
              <div className="flex items-center space-x-4 text-heritage-gold font-mono">
                <span>INCIDENTS: 4 ACTIVE</span>
                <span>AMBULANCE UNITS: 14 ON PATROL</span>
                <span>WEATHER: DEPRESSION ACTIVE</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-3 rounded-xl bg-heritage-stone/30 dark:bg-heritage-charcoal-dark border border-heritage-stone/60">
                <span className="text-[10px] text-heritage-aged font-bold uppercase">Average Assignment</span>
                <p className="text-xl font-serif font-bold text-heritage-maroon dark:text-heritage-gold mt-1">14 Mins</p>
                <span className="text-[10px] text-heritage-green">↓ 68% faster with AI</span>
              </div>
              <div className="p-3 rounded-xl bg-heritage-stone/30 dark:bg-heritage-charcoal-dark border border-heritage-stone/60">
                <span className="text-[10px] text-heritage-aged font-bold uppercase">Resolution Time</span>
                <p className="text-xl font-serif font-bold text-heritage-maroon dark:text-heritage-gold mt-1">52 Mins</p>
                <span className="text-[10px] text-heritage-green">Verified by Supervisor</span>
              </div>
              <div className="p-3 rounded-xl bg-heritage-stone/30 dark:bg-heritage-charcoal-dark border border-heritage-stone/60">
                <span className="text-[10px] text-heritage-aged font-bold uppercase">Duplicate Detection</span>
                <p className="text-xl font-serif font-bold text-heritage-maroon dark:text-heritage-gold mt-1">96% Acc</p>
                <span className="text-[10px] text-heritage-blue">Haversine Spatial Mesh</span>
              </div>
              <div className="p-3 rounded-xl bg-heritage-stone/30 dark:bg-heritage-charcoal-dark border border-heritage-stone/60">
                <span className="text-[10px] text-heritage-aged font-bold uppercase">Emergency Reroute</span>
                <p className="text-xl font-serif font-bold text-heritage-maroon dark:text-heritage-gold mt-1">19 Min Saved</p>
                <span className="text-[10px] text-heritage-orange">AIIMS Lifeline Corridor</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Sambalpuri Ikat Border */}
      <IkatPatternDivider />

      {/* 2. THE PROBLEM & THE SOLUTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Fragmented Operations (The Problem) */}
          <div className="p-6 rounded-2xl bg-white/60 dark:bg-heritage-charcoal/40 border border-heritage-red/30 shadow-sm">
            <div className="flex items-center space-x-2 text-heritage-red mb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-serif font-bold text-base uppercase tracking-wider">
                The Problem: Fragmented City Operations
              </h3>
            </div>
            <ul className="space-y-3 text-xs text-heritage-aged dark:text-heritage-stone/80">
              <li className="flex items-start space-x-2">
                <span className="text-heritage-red font-bold">✕</span>
                <span>Disconnected municipal, traffic, and emergency response silos.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-heritage-red font-bold">✕</span>
                <span>Delayed manual complaint routing taking days across bureaucratic desks.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-heritage-red font-bold">✕</span>
                <span>Duplicate reports clogging staff without geographic correlation.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-heritage-red font-bold">✕</span>
                <span>Flooded roads unnoticed by ambulances until stuck in traffic gridlock.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-heritage-red font-bold">✕</span>
                <span>Lack of verified before-and-after evidence for citizen accountability.</span>
              </li>
            </ul>
          </div>

          {/* Unified Intelligence (The Solution) */}
          <div className="p-6 rounded-2xl bg-white/80 dark:bg-heritage-charcoal border border-heritage-gold shadow-heritage">
            <div className="flex items-center space-x-2 text-heritage-maroon dark:text-heritage-gold mb-3">
              <Shield className="w-5 h-5 text-heritage-gold" />
              <h3 className="font-serif font-bold text-base uppercase tracking-wider">
                The Solution: Civic Nexus AI Unified Nervous System
              </h3>
            </div>
            <ul className="space-y-3 text-xs text-heritage-charcoal dark:text-heritage-ivory">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-heritage-green shrink-0 mt-0.5" />
                <span>Single shared operational database connecting citizens, police, hospitals, and municipal crews.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-heritage-green shrink-0 mt-0.5" />
                <span>AI incident intelligence for instant classification and automated departmental assignment.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-heritage-green shrink-0 mt-0.5" />
                <span>Haversine distance spatial clustering to merge duplicate citizen complaints without data loss.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-heritage-green shrink-0 mt-0.5" />
                <span>Dynamic rerouting for emergency ambulances when arterial roads are flooded.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-heritage-green shrink-0 mt-0.5" />
                <span>Supervisor-verified photographic proof before an incident is marked resolved.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* 3. VISUAL WORKFLOW: HOW IT WORKS */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-heritage-stone/30 dark:bg-heritage-charcoal/20 border-y border-heritage-stone dark:border-heritage-charcoal">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="font-serif font-bold text-2xl text-heritage-maroon dark:text-heritage-gold">
            How Civic Nexus AI Coordinates Urban Incidents
          </h2>
          <p className="text-xs text-heritage-aged mt-1 max-w-xl mx-auto">
            From citizen mobile report to multi-agency verification and verified physical resolution.
          </p>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { step: "01", name: "Citizen Report", icon: Users },
              { step: "02", name: "Data Validation", icon: Shield },
              { step: "03", name: "AI Analysis", icon: Cpu },
              { step: "04", name: "Duplicate Correl.", icon: Activity },
              { step: "05", name: "Priority Score", icon: Zap },
              { step: "06", name: "Dept Assign", icon: Building2 },
              { step: "07", name: "Field Work", icon: HardHat },
              { step: "08", name: "Verified Close", icon: CheckCircle2 }
            ].map((st, idx) => {
              const Icon = st.icon;
              return (
                <div key={idx} className="p-3 rounded-xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal/80 flex flex-col items-center text-center shadow-sm">
                  <span className="text-[10px] font-mono font-bold text-heritage-gold">{st.step}</span>
                  <div className="my-2 p-2 rounded-lg bg-heritage-maroon/10 dark:bg-heritage-gold/10 text-heritage-maroon dark:text-heritage-gold">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-heritage-charcoal dark:text-heritage-ivory">{st.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. CORE MODULES SHOWCASE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-serif font-bold text-2xl text-heritage-maroon dark:text-heritage-gold">
            6 Core Operational Panels
          </h2>
          <p className="text-xs text-heritage-aged mt-1">
            Every department operates on one shared real-time database with tailored role permissions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreModules.map((m, i) => {
            const Icon = m.icon;
            const isAuth = isModuleAuthenticated(m.view);
            return (
              <div
                key={i}
                onClick={() => onExplore(m.view)}
                className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-heritage group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-heritage-maroon text-heritage-gold group-hover:scale-110 transition-transform shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory group-hover:text-heritage-maroon dark:group-hover:text-heritage-gold transition-colors">
                          {m.title}
                        </h4>
                        <span className="text-[10px] text-heritage-aged font-mono uppercase tracking-wider block">
                          {m.roleBadge}
                        </span>
                      </div>
                    </div>

                    {isAuth ? (
                      <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shrink-0">
                        <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>Login Req.</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-heritage-aged dark:text-heritage-stone/80 leading-relaxed mb-3">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-heritage-stone/40 dark:border-heritage-charcoal-dark flex items-center justify-between text-xs font-semibold text-heritage-maroon dark:text-heritage-gold">
                  <span>{isAuth ? 'Open Dashboard' : 'Sign In / Sign Up to Enter'}</span>
                  <div className="p-1 rounded-full bg-heritage-maroon/10 dark:bg-heritage-gold/10 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-heritage-maroon to-heritage-maroon-dark text-white text-center">
        <div className="max-w-4xl mx-auto">
          <KonarkWheelIcon size={40} className="mx-auto text-heritage-gold mb-4" />
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-white">
            "When the City Thinks, Every Life Matters."
          </h2>
          <p className="mt-3 text-sm text-heritage-stone/90 max-w-xl mx-auto font-sans">
            Build a city that responds as one. Join Odisha's unified urban intelligence platform and experience self-healing smart infrastructure.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onExplore('citizen')}
              className="px-6 py-3 rounded-xl bg-heritage-gold hover:bg-heritage-gold-light text-heritage-charcoal-dark font-bold text-sm shadow-heritage transition-all"
            >
              Submit a Citizen Complaint
            </button>
            <button
              onClick={onOpenFlagship}
              className="px-6 py-3 rounded-xl border border-heritage-gold/50 bg-heritage-maroon-dark hover:bg-heritage-maroon text-heritage-stone font-semibold text-sm transition-all"
            >
              Launch Flagship 18-Step Scenario
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
