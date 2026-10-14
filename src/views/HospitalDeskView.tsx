import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Hospital } from '../types';
import { KonarkWheelIcon } from '../components/OdishaMotifs';
import {
  Hospital as HospIcon,
  Activity,
  HeartPulse,
  Droplet,
  Phone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Bed
} from 'lucide-react';

export const HospitalDeskView: React.FC = () => {
  const { language, showToast } = useApp();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState<Record<number, boolean>>({});

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/hospitals');
      if (res.ok) setHospitals(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleAcknowledge = (hId: number, name: string) => {
    setAcknowledged(prev => ({ ...prev, [hId]: true }));
    showToast(`Emergency readiness acknowledged by ${name} trauma desk`, "success");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-heritage-stone dark:border-heritage-charcoal pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <HospIcon className="w-7 h-7 text-heritage-blue" />
            <h1 className="font-serif font-bold text-2xl text-heritage-maroon dark:text-heritage-gold">
              Hospital Trauma &amp; Bed Availability Network
            </h1>
          </div>
          <p className="text-xs text-heritage-aged dark:text-heritage-stone/80 mt-1 font-sans">
            Real-time critical care capacity, ICU readiness, and 108 ambulance triage across Odisha state hospitals.
          </p>
        </div>

        <button
          onClick={fetchHospitals}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-heritage-stone bg-white dark:bg-heritage-charcoal text-xs font-semibold hover:border-heritage-gold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Capacity</span>
        </button>
      </div>

      {/* Hospitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {hospitals.map(h => (
          <div
            key={h.id}
            className="p-5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-heritage flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-heritage-blue/20 text-heritage-blue border border-heritage-blue/30">
                  {h.trauma_level} TRAUMA CENTER
                </span>
                <span className="text-xs font-mono font-bold text-heritage-green flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-heritage-green inline-block" />
                  <span>ONLINE</span>
                </span>
              </div>

              <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory">
                {h.name}
              </h3>
              <p className="text-xs text-heritage-aged dark:text-heritage-stone/80 mt-0.5">
                {h.location_name}
              </p>

              {/* Bed Metrics */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-heritage-stone/30 dark:bg-heritage-charcoal-dark border border-heritage-stone/60">
                  <span className="text-[10px] font-bold text-heritage-aged uppercase block">Available ICU Beds</span>
                  <p className="text-xl font-serif font-bold text-heritage-red mt-1">
                    {h.available_icu} <span className="text-xs font-normal text-heritage-aged">/ {h.icu_beds}</span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-heritage-stone/30 dark:bg-heritage-charcoal-dark border border-heritage-stone/60">
                  <span className="text-[10px] font-bold text-heritage-aged uppercase block">General Beds</span>
                  <p className="text-xl font-serif font-bold text-heritage-blue mt-1">
                    {h.available_beds} <span className="text-xs font-normal text-heritage-aged">/ {h.total_beds}</span>
                  </p>
                </div>
              </div>

              {/* Blood Bank & Contact */}
              <div className="mt-3 pt-3 border-t border-heritage-stone/60 text-xs space-y-1.5 text-heritage-charcoal dark:text-heritage-stone">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-1 text-heritage-aged">
                    <Droplet className="w-3.5 h-3.5 text-heritage-red" />
                    <span>Blood Bank Reserve:</span>
                  </span>
                  <b className="text-heritage-green">{h.blood_bank_status}</b>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-1 text-heritage-aged">
                    <Phone className="w-3.5 h-3.5 text-heritage-blue" />
                    <span>Emergency Hotline:</span>
                  </span>
                  <b className="font-mono">{h.contact_phone}</b>
                </div>
              </div>
            </div>

            {/* Acknowledge Readiness Button */}
            <button
              onClick={() => handleAcknowledge(h.id, h.name)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-1.5 ${
                acknowledged[h.id]
                  ? 'bg-heritage-green/20 text-heritage-green border border-heritage-green/50'
                  : 'bg-heritage-maroon hover:bg-heritage-maroon-dark text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-heritage-gold" />
              <span>{acknowledged[h.id] ? "Trauma Readiness Acknowledged" : "Acknowledge Inbound Readiness"}</span>
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
