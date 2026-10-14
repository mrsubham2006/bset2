import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { WeatherData } from '../types';
import { KonarkWheelIcon } from '../components/OdishaMotifs';
import {
  CloudRain,
  Wind,
  Droplets,
  AlertTriangle,
  RefreshCw,
  Compass,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export const WeatherView: React.FC = () => {
  const { language } = useApp();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/weather');
      if (res.ok) setWeather(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-heritage-stone dark:border-heritage-charcoal pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <CloudRain className="w-7 h-7 text-heritage-blue animate-bounce" />
            <h1 className="font-serif font-bold text-2xl text-heritage-maroon dark:text-heritage-gold">
              Weather &amp; Multi-Factor Flood Risk Intelligence
            </h1>
          </div>
          <p className="text-xs text-heritage-aged dark:text-heritage-stone/80 mt-1 font-sans">
            Real-time IMD meteorological telemetry and multi-factor urban inundation predictive models.
          </p>
        </div>

        <button
          onClick={fetchWeather}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-heritage-stone bg-white dark:bg-heritage-charcoal text-xs font-semibold hover:border-heritage-gold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Radar</span>
        </button>
      </div>

      {/* Multi-Factor Predictive Flood Risk Banner */}
      {weather?.predictive_risk && (
        <div className="p-5 rounded-2xl bg-white dark:bg-heritage-charcoal border-2 border-heritage-orange shadow-heritage space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-heritage-orange">
              <ShieldAlert className="w-6 h-6 text-heritage-orange" />
              <h3 className="font-serif font-bold text-base">
                Multi-Factor Urban Inundation Assessment
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-heritage-orange/20 text-heritage-orange border border-heritage-orange/40">
              RISK LEVEL: {weather.predictive_risk.flood_risk_level} (Score: {weather.predictive_risk.risk_score}/100)
            </span>
          </div>

          <p className="text-xs text-heritage-charcoal dark:text-heritage-stone leading-relaxed bg-heritage-ivory/60 dark:bg-heritage-charcoal-dark p-3 rounded-xl border border-heritage-stone">
            <b>Operational Advisory:</b> {weather.predictive_risk.advisory}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-2.5 rounded-lg bg-heritage-stone/20">
              <span className="text-heritage-aged block">Formula Component 1</span>
              <b>Rainfall Forecast (50% weight)</b>
            </div>
            <div className="p-2.5 rounded-lg bg-heritage-stone/20">
              <span className="text-heritage-aged block">Formula Component 2</span>
              <b>Drainage Saturation (40% weight)</b>
            </div>
            <div className="p-2.5 rounded-lg bg-heritage-stone/20">
              <span className="text-heritage-aged block">Formula Component 3</span>
              <b>Culvert Choke Bonus (20 pts)</b>
            </div>
          </div>
        </div>
      )}

      {/* Weather Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {weather?.stations?.map((st, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm text-heritage-maroon dark:text-heritage-gold">
                {st.station_name}
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-heritage-blue/20 text-heritage-blue">
                {st.flood_risk_level}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-heritage-stone/20">
                <span className="text-[10px] text-heritage-aged uppercase flex items-center space-x-1">
                  <CloudRain className="w-3 h-3 text-heritage-blue" />
                  <span>Rainfall</span>
                </span>
                <p className="text-xl font-bold font-mono text-heritage-charcoal dark:text-heritage-ivory mt-1">
                  {st.rainfall_mm} mm
                </p>
              </div>

              <div className="p-3 rounded-xl bg-heritage-stone/20">
                <span className="text-[10px] text-heritage-aged uppercase flex items-center space-x-1">
                  <Wind className="w-3 h-3 text-heritage-orange" />
                  <span>Wind Speed</span>
                </span>
                <p className="text-xl font-bold font-mono text-heritage-charcoal dark:text-heritage-ivory mt-1">
                  {st.wind_speed_kmh} km/h
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-heritage-aged font-semibold">Drainage Sluice Level</span>
                <span className="font-bold text-heritage-maroon dark:text-heritage-gold">{st.drainage_level_percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-heritage-stone overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-heritage-blue to-heritage-red"
                  style={{ width: `${st.drainage_level_percent}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-heritage-aged dark:text-heritage-stone/80 leading-relaxed border-t border-heritage-stone/50 pt-2">
              {st.advisory}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};
