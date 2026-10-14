import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, ExternalLink, Compass, Eye, Waves, Landmark, Trees, Footprints } from 'lucide-react';

export interface MapDestination {
  id: number;
  destination_code: string;
  name: string;
  odia_name: string;
  category: string;
  district: string;
  tagline?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  timings?: string;
  entry_fee?: string;
  rating?: number;
  safety_status?: string;
}

interface BalasoreTouristMapProps {
  destinations: MapDestination[];
  onSelectDestination: (id: number) => void;
  selectedDestId?: number | null;
  height?: string;
}

export const BalasoreTouristMap: React.FC<BalasoreTouristMapProps> = ({
  destinations = [],
  onSelectDestination,
  selectedDestId,
  height = '620px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<number, L.Marker>>(new Map());

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedPinId, setSelectedPinId] = useState<number | null>(selectedDestId || null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'BEACHES_COAST': return '#0891b2'; // Cyan / Ocean
      case 'HERITAGE_TEMPLE': return '#d97706'; // Amber / Gold
      case 'NATURE_WILDLIFE': return '#059669'; // Emerald / Forest
      case 'HERITAGE_TOWN': return '#7c3aed'; // Purple / Royal
      default: return '#8B1E3F'; // Heritage Maroon
    }
  };

  const getCategoryIconSvg = (category: string) => {
    switch (category) {
      case 'BEACHES_COAST':
        return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M2 12c2.5-2.5 5-2.5 7.5 0s5 2.5 7.5 0 5-2.5 7.5 0"/><path d="M2 18c2.5-2.5 5-2.5 7.5 0s5 2.5 7.5 0 5-2.5 7.5 0"/></svg>';
      case 'HERITAGE_TEMPLE':
        return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5a3 3 0 0 1 6 0v5"/></svg>';
      case 'NATURE_WILDLIFE':
        return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.8"/></svg>';
      default:
        return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12Z"/></svg>';
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Balasore District Center Coordinates: 21.4927° N, 86.9315° E
      const map = L.map(mapContainerRef.current, {
        center: [21.4927, 86.9315],
        zoom: 10,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Balasore Smart Tourism Platform',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      // Map instance preserved
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    markerMapRef.current.clear();

    const filtered = destinations.filter(d =>
      activeCategory === 'ALL' ? true : d.category === activeCategory
    );

    filtered.forEach(d => {
      const color = getCategoryColor(d.category);
      const iconSvg = getCategoryIconSvg(d.category);

      const customIcon = L.divIcon({
        className: 'custom-tourist-pin',
        html: `
          <div style="
            position: relative;
            width: 38px;
            height: 38px;
            background: ${color};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            border: 2px solid #ffffff;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
              ${iconSvg}
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38]
      });

      const marker = L.marker([d.latitude, d.longitude], { icon: customIcon });

      // Interactive popup
      const popupContent = `
        <div style="font-family: inherit; width: 240px; padding: 2px;">
          <div style="position: relative; height: 110px; border-radius: 12px; overflow: hidden; margin-bottom: 8px;">
            <img src="${d.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'}"
                 style="width: 100%; height: 100%; object-fit: cover;"
                 alt="${d.name}" />
            <div style="position: absolute; top: 6px; left: 6px; background: rgba(0,0,0,0.65); color: #C49A45; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 6px; text-transform: uppercase;">
              ${d.category.replace(/_/g, ' ')}
            </div>
          </div>
          <h4 style="margin: 0; font-size: 13px; font-weight: 700; color: #8B1E3F;">${d.name}</h4>
          <p style="margin: 2px 0 6px 0; font-size: 11px; color: #666; font-family: serif;">${d.odia_name}</p>
          <div style="font-size: 11px; color: #444; margin-bottom: 8px;">
            <strong>Timings:</strong> ${d.timings ? d.timings.substring(0, 45) + '...' : 'Open daily'}
          </div>
          <div style="display: flex; gap: 6px;">
            <button id="view-dest-btn-${d.id}" style="
              flex: 1;
              background: #8B1E3F;
              color: white;
              border: none;
              border-radius: 8px;
              padding: 6px 8px;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
            ">View Details</button>
            <a href="https://maps.google.com/?q=${d.latitude},${d.longitude}" target="_blank" rel="noopener noreferrer" style="
              background: #f4ece4;
              color: #8B1E3F;
              border: 1px solid #d4c2b2;
              border-radius: 8px;
              padding: 6px 8px;
              font-size: 11px;
              display: flex;
              align-items: center;
              justify-content: center;
              text-decoration: none;
            ">Directions</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        setSelectedPinId(d.id);
        const btn = document.getElementById(`view-dest-btn-${d.id}`);
        if (btn) {
          btn.onclick = () => onSelectDestination(d.id);
        }
      });

      marker.addTo(markersLayerRef.current!);
      markerMapRef.current.set(d.id, marker);
    });
  }, [destinations, activeCategory, onSelectDestination]);

  // Handle selected destination pan
  useEffect(() => {
    if (!selectedDestId || !mapInstanceRef.current) return;
    const marker = markerMapRef.current.get(selectedDestId);
    const dest = destinations.find(d => d.id === selectedDestId);
    if (marker && dest) {
      mapInstanceRef.current.flyTo([dest.latitude, dest.longitude], 13, { duration: 1.2 });
      marker.openPopup();
      setSelectedPinId(dest.id);
    }
  }, [selectedDestId, destinations]);

  const handleSelectFromList = (d: MapDestination) => {
    setSelectedPinId(d.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([d.latitude, d.longitude], 13, { duration: 1.2 });
      const marker = markerMapRef.current.get(d.id);
      if (marker) marker.openPopup();
    }
  };

  const categories = [
    { id: 'ALL', label: 'All Sites', icon: Compass },
    { id: 'BEACHES_COAST', label: 'Beaches', icon: Waves },
    { id: 'HERITAGE_TEMPLE', label: 'Temples', icon: Landmark },
    { id: 'NATURE_WILDLIFE', label: 'Wildlife', icon: Trees },
    { id: 'HERITAGE_TOWN', label: 'Towns', icon: Footprints },
  ];

  return (
    <div className="bg-white dark:bg-heritage-charcoal rounded-3xl border border-heritage-stone dark:border-heritage-charcoal overflow-hidden shadow-lg">
      
      {/* Map Control Header */}
      <div className="p-4 border-b border-heritage-stone dark:border-heritage-charcoal flex flex-wrap items-center justify-between gap-3 bg-heritage-ivory/50 dark:bg-heritage-charcoal-dark/50">
        <div>
          <h3 className="font-serif font-bold text-base text-heritage-maroon dark:text-heritage-gold flex items-center space-x-2">
            <Compass className="w-5 h-5 text-heritage-gold" />
            <span>Interactive Balasore Tourism Map</span>
          </h3>
          <p className="text-xs text-heritage-aged">
            Explore 8 verified attractions across Balasore district with live GPS coordinates &amp; directions
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map(c => {
            const Icon = c.icon;
            const isSelected = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-heritage-maroon text-white shadow-sm'
                    : 'bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory border border-heritage-stone hover:bg-heritage-gold/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Map + Side Destination Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-4">
        
        {/* Leaflet Container (3 columns on lg) */}
        <div className="lg:col-span-3 relative">
          <div ref={mapContainerRef} style={{ height, width: '100%' }} />

          {/* Map Overlay Legend */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/90 dark:bg-heritage-charcoal/90 backdrop-blur-md p-3 rounded-2xl border border-heritage-stone shadow-md text-[11px] space-y-1.5">
            <p className="font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">Legend</p>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-cyan-600 shrink-0" />
              <span>Beaches &amp; Coast (Chandipur, Talsari)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-600 shrink-0" />
              <span>Temples &amp; Sacred Shrines</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
              <span>Nature &amp; Wildlife (Kuldiha)</span>
            </div>
          </div>
        </div>

        {/* Side Destination Directory (1 column) */}
        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-heritage-stone dark:border-heritage-charcoal h-[320px] lg:h-[620px] overflow-y-auto p-3 space-y-2 bg-heritage-ivory/30 dark:bg-heritage-charcoal-dark/30">
          <p className="text-[11px] font-bold uppercase tracking-wider text-heritage-aged px-1">
            Balasore Destinations ({destinations.length})
          </p>

          {destinations.map(d => {
            const isSelected = selectedPinId === d.id;
            const color = getCategoryColor(d.category);

            return (
              <div
                key={d.id}
                onClick={() => handleSelectFromList(d)}
                className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-white dark:bg-heritage-charcoal border-heritage-maroon dark:border-heritage-gold shadow-md'
                    : 'bg-white/80 dark:bg-heritage-charcoal/80 border-heritage-stone dark:border-heritage-charcoal hover:bg-white'
                }`}
              >
                <div className="flex space-x-2.5">
                  <img
                    src={d.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'}
                    alt={d.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-xs text-heritage-charcoal dark:text-heritage-ivory truncate">{d.name}</h5>
                    <p className="text-[10px] text-heritage-maroon dark:text-heritage-gold font-serif truncate">{d.odia_name}</p>
                    <span
                      className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase"
                      style={{ backgroundColor: color }}
                    >
                      {d.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-heritage-stone/60 dark:border-heritage-charcoal flex items-center justify-between text-[10px]">
                  <span className="text-heritage-aged flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-heritage-maroon" />
                    <span>Fly to Pin</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDestination(d.id);
                    }}
                    className="font-bold text-heritage-maroon dark:text-heritage-gold hover:underline flex items-center space-x-0.5"
                  >
                    <span>Details</span>
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
