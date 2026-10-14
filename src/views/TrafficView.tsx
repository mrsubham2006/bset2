import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RoadRestriction } from '../types';
import { KonarkWheelIcon } from '../components/OdishaMotifs';
import {
  Navigation,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  Trash2,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';

export const TrafficView: React.FC = () => {
  const { language, showToast } = useApp();
  const [restrictions, setRestrictions] = useState<RoadRestriction[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State to add restriction
  const [roadName, setRoadName] = useState('Rasulgarh - Cuttack Road (NH-16)');
  const [segmentDesc, setSegmentDesc] = useState('Rasulgarh Underpass northbound lanes submerged in 40cm water');
  const [restrictionType, setRestrictionType] = useState('FLOOD_BLOCKAGE');

  const fetchRestrictions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/road-restrictions');
      if (res.ok) setRestrictions(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestrictions();
  }, []);

  const handleAddRestriction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/road-restrictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          road_name: roadName,
          segment_description: segmentDesc,
          restriction_type: restrictionType,
          lat_start: 20.2941,
          lng_start: 85.8635,
          lat_end: 20.2991,
          lng_end: 85.8665
        })
      });
      if (res.ok) {
        showToast("Road restriction successfully activated and broadcast to map", "success");
        fetchRestrictions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearRestriction = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/road-restrictions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Road restriction cleared. Normal traffic restored.", "info");
        fetchRestrictions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-heritage-stone dark:border-heritage-charcoal pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Navigation className="w-7 h-7 text-heritage-maroon dark:text-heritage-gold" />
            <h1 className="font-serif font-bold text-2xl text-heritage-maroon dark:text-heritage-gold">
              Traffic Management &amp; Emergency Corridors
            </h1>
          </div>
          <p className="text-xs text-heritage-aged dark:text-heritage-stone/80 mt-1 font-sans">
            Arterial road blockages, real-time detour calculations, and emergency vehicle green corridor authorization.
          </p>
        </div>

        <button
          onClick={fetchRestrictions}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-heritage-stone bg-white dark:bg-heritage-charcoal text-xs font-semibold hover:border-heritage-gold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Restrictions</span>
        </button>
      </div>

      {/* Alternative Route Comparison Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-gold shadow-heritage space-y-4">
        <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory flex items-center justify-between">
          <span>AI Emergency Route Detour Analysis</span>
          <span className="text-xs font-bold text-heritage-green">19 MINUTES SAVED</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          
          {/* Primary Route (Blocked) */}
          <div className="p-4 rounded-xl bg-heritage-red/10 border border-heritage-red/40 space-y-2">
            <div className="flex items-center justify-between text-heritage-red font-bold">
              <span>PRIMARY ARTERIAL ROUTE (BLOCKED)</span>
              <span>ETA: 38 MINS</span>
            </div>
            <p className="text-heritage-charcoal dark:text-heritage-stone text-[11px]">
              Hanspal Junction → Rasulgarh Underpass (NH-16) → Capital Hospital
            </p>
            <div className="p-2 rounded bg-white dark:bg-heritage-charcoal text-heritage-red font-semibold text-[11px] flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>IMPASSABLE: 40cm waterlogging at Rasulgarh Underpass. Vehicles stalled.</span>
            </div>
          </div>

          {/* Recommended Detour (Clear) */}
          <div className="p-4 rounded-xl bg-heritage-green/10 border border-heritage-green/40 space-y-2">
            <div className="flex items-center justify-between text-heritage-green font-bold">
              <span>RECOMMENDED GREEN CORRIDOR (CLEAR)</span>
              <span>ETA: 14 MINS</span>
            </div>
            <p className="text-heritage-charcoal dark:text-heritage-stone text-[11px]">
              Hanspal Junction → Vani Vihar Bypass → Acharya Vihar → Capital Hospital
            </p>
            <div className="p-2 rounded bg-white dark:bg-heritage-charcoal text-heritage-green font-semibold text-[11px] flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>SYNCHRONIZED: Traffic Marshals cleared green lights. Ambulance expedited.</span>
            </div>
          </div>

        </div>
      </div>

      {/* Road Restrictions Table & Creation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Restrictions Table (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-5 shadow-sm space-y-3">
          <h4 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">
            Active Road Restrictions ({restrictions.length})
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-heritage-stone text-heritage-aged">
                  <th className="py-2 px-3 font-semibold">Road Corridor</th>
                  <th className="py-2 px-3 font-semibold">Restriction Cause</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                  <th className="py-2 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-heritage-stone/40 dark:divide-heritage-charcoal">
                {restrictions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-heritage-aged">
                      No active road closures currently reported.
                    </td>
                  </tr>
                ) : (
                  restrictions.map(r => (
                    <tr key={r.id}>
                      <td className="py-3 px-3">
                        <div className="font-bold text-heritage-charcoal dark:text-heritage-ivory">{r.road_name}</div>
                        <div className="text-[11px] text-heritage-aged">{r.segment_description}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[10px] font-bold text-heritage-red uppercase">
                          {r.restriction_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'ACTIVE'
                            ? 'bg-heritage-red/20 text-heritage-red border border-heritage-red/30'
                            : 'bg-heritage-green/20 text-heritage-green'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {r.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleClearRestriction(r.id)}
                            className="px-2.5 py-1 rounded bg-heritage-green text-white text-[11px] font-bold shadow-sm"
                          >
                            Lift Closure
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Road Restriction Form (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-4 shadow-sm space-y-3">
          <h4 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory pb-2 border-b border-heritage-stone">
            Log New Restriction
          </h4>

          <form onSubmit={handleAddRestriction} className="space-y-3 text-xs font-sans">
            <div>
              <label className="block font-semibold mb-1">Roadway Name</label>
              <input
                type="text"
                value={roadName}
                onChange={e => setRoadName(e.target.value)}
                className="w-full p-2 rounded-lg border border-heritage-stone bg-heritage-ivory/60 dark:bg-heritage-charcoal-dark"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Segment & Cause</label>
              <textarea
                rows={2}
                value={segmentDesc}
                onChange={e => setSegmentDesc(e.target.value)}
                className="w-full p-2 rounded-lg border border-heritage-stone bg-heritage-ivory/60 dark:bg-heritage-charcoal-dark"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Hazard Type</label>
              <select
                value={restrictionType}
                onChange={e => setRestrictionType(e.target.value)}
                className="w-full p-2 rounded-lg border border-heritage-stone bg-heritage-ivory/60 dark:bg-heritage-charcoal-dark"
              >
                <option value="FLOOD_BLOCKAGE">Flood Inundation</option>
                <option value="ACCIDENT_COLLISION">Accident Collision</option>
                <option value="ROAD_CONSTRUCTION">Road Repair & Pothole Work</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-bold shadow-md"
            >
              Broadcast Restriction
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
