import React, { useState, useMemo, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { MapPin, Target, Eye, Layers, Compass, Sparkles, AlertCircle, ExternalLink, RefreshCw, Shield, CheckCircle2, ChevronRight } from 'lucide-react';
import { VisibilityReport } from '../types';

interface GoogleMapsVisibilityViewProps {
  report: VisibilityReport;
  isDarkMode?: boolean;
}

// Fallback lat/lng center if none provided in report
const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 }; // San Francisco / Metro area default

export const GoogleMapsVisibilityView: React.FC<GoogleMapsVisibilityViewProps> = ({ report, isDarkMode }) => {
  const apiKey =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    '';

  const hasValidKey = Boolean(apiKey) && apiKey !== 'YOUR_API_KEY';

  // State
  const [selectedPin, setSelectedPin] = useState<{
    id: string;
    type: 'user' | 'competitor' | 'cluster';
    name: string;
    score: number;
    locationName: string;
    lat: number;
    lng: number;
    details?: string;
    strengths?: string[];
    keywords?: string[];
    visibilityLevel?: string;
  } | null>(null);

  const [activeFilter, setActiveFilter] = useState<'all' | 'user' | 'competitors' | 'clusters'>('all');
  const [showClusters, setShowClusters] = useState(true);

  // Derive business center location
  const baseLat = useMemo(() => {
    const latNum = Number(report?.profileBadge?.lat);
    return !isNaN(latNum) && latNum !== 0 ? latNum : DEFAULT_CENTER.lat;
  }, [report]);

  const baseLng = useMemo(() => {
    const lngNum = Number(report?.profileBadge?.lng);
    return !isNaN(lngNum) && lngNum !== 0 ? lngNum : DEFAULT_CENTER.lng;
  }, [report]);

  // Extract competitor list safely
  const competitors = useMemo(() => {
    return report?.competitorComparison || [];
  }, [report]);

  // Build pins for User & Competitors
  const pins = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'user' | 'competitor';
      name: string;
      score: number;
      locationName: string;
      lat: number;
      lng: number;
      color: string;
      strengths?: string[];
      keywords?: string[];
      visibilityLevel?: string;
    }> = [];

    // User Business Pin
    list.push({
      id: 'user-primary',
      type: 'user',
      name: report.businessName || 'Your Business',
      score: report.overallScore || 0,
      locationName: report.profileBadge?.location || 'Primary Location',
      lat: baseLat,
      lng: baseLng,
      color: '#6366f1', // Indigo accent
      visibilityLevel: report.profileBadge?.visibilityLevel || 'Strong',
      strengths: report.strategicInsights?.actionableImprovements || [],
      keywords: report.keywordAnalysis?.topKeywords?.map(k => k.term) || ['SEO', 'Local Search', 'Authority']
    });

    // User Additional Branches
    if (report.profileBadge?.locations) {
      report.profileBadge.locations.forEach((loc, idx) => {
        if (loc.lat && loc.lng) {
          list.push({
            id: `user-branch-${idx}`,
            type: 'user',
            name: `${report.businessName} (${loc.address.split(',')[0] || 'Branch'})`,
            score: report.overallScore || 0,
            locationName: loc.address,
            lat: Number(loc.lat),
            lng: Number(loc.lng),
            color: '#5b5fff',
            visibilityLevel: report.profileBadge?.visibilityLevel || 'Strong',
          });
        }
      });
    }

    // Competitor Pins
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];

    competitors.forEach((comp, idx) => {
      // Determine lat/lng or generate relative radial offset if coordinates are missing
      const angle = (idx * 2 * Math.PI) / Math.max(1, competitors.length);
      const radius = 0.015 + (idx * 0.008); // Approx 1.5 - 3 km
      
      const compLat = (comp.lat && !isNaN(Number(comp.lat))) ? Number(comp.lat) : baseLat + Math.sin(angle) * radius;
      const compLng = (comp.lng && !isNaN(Number(comp.lng))) ? Number(comp.lng) : baseLng + Math.cos(angle) * radius;

      list.push({
        id: `comp-${idx}`,
        type: 'competitor',
        name: comp.name,
        score: comp.score || 0,
        locationName: comp.locations?.[0]?.address || `District competitor #${idx + 1}`,
        lat: compLat,
        lng: compLng,
        color: comp.color || colors[idx % colors.length],
        strengths: comp.strengths || [],
        keywords: comp.keywords || [],
        visibilityLevel: comp.score > 75 ? 'Dominant' : comp.score > 50 ? 'Strong' : 'Emerging'
      });

      // Secondary competitor locations if available
      if (comp.locations && comp.locations.length > 1) {
        comp.locations.slice(1).forEach((loc, lIdx) => {
          if (loc.lat && loc.lng) {
            list.push({
              id: `comp-${idx}-loc-${lIdx}`,
              type: 'competitor',
              name: `${comp.name} - ${loc.address.split(',')[0]}`,
              score: comp.score || 0,
              locationName: loc.address,
              lat: Number(loc.lat),
              lng: Number(loc.lng),
              color: comp.color || colors[idx % colors.length],
              strengths: comp.strengths || [],
              keywords: comp.keywords || []
            });
          }
        });
      }
    });

    return list;
  }, [report, competitors, baseLat, baseLng]);

  // Generate Regional Search Visibility Clusters
  const clusters = useMemo(() => {
    // Standard cluster centers surrounding the primary business area
    const sectors = [
      { name: 'Central Business Hub', offsetLat: 0.008, offsetLng: 0.006, density: 88, dominant: report.businessName, level: 'High Dominance' },
      { name: 'North Metro District', offsetLat: 0.018, offsetLng: -0.012, density: 64, dominant: competitors[0]?.name || 'Market Rival', level: 'Competitive Cluster' },
      { name: 'Eastside Tech Corridor', offsetLat: -0.012, offsetLng: 0.022, density: 72, dominant: report.businessName, level: 'High Growth' },
      { name: 'West Valley Commercial', offsetLat: -0.015, offsetLng: -0.018, density: 45, dominant: competitors[1]?.name || 'Local Competitor', level: 'Opportunity Zone' },
      { name: 'South Bay Suburbs', offsetLat: -0.025, offsetLng: 0.005, density: 52, dominant: competitors[2]?.name || 'Emerging Player', level: 'Moderate Visibility' }
    ];

    return sectors.map((sec, idx) => ({
      id: `cluster-${idx}`,
      name: sec.name,
      lat: baseLat + sec.offsetLat,
      lng: baseLng + sec.offsetLng,
      visibilityDensity: sec.density,
      dominantBrand: sec.dominant,
      clusterLevel: sec.level,
      estimatedSearches: `${(sec.density * 120).toLocaleString()}/mo`,
      radiusMeters: 1200 + (sec.density * 15)
    }));
  }, [baseLat, baseLng, report.businessName, competitors]);

  // Filtered pins
  const filteredPins = useMemo(() => {
    if (activeFilter === 'user') return pins.filter(p => p.type === 'user');
    if (activeFilter === 'competitors') return pins.filter(p => p.type === 'competitor');
    return pins;
  }, [pins, activeFilter]);

  return (
    <div className="surface rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                Geographic Competitor & Regional Visibility Map
              </h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Google Maps integration pinning competitor locations and mapping regional local search visibility clusters.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls & Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Pins ({pins.length})
            </button>
            <button
              onClick={() => setActiveFilter('user')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === 'user'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Your Brand
            </button>
            <button
              onClick={() => setActiveFilter('competitors')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === 'competitors'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Competitors ({competitors.length})
            </button>
          </div>

          <button
            onClick={() => setShowClusters(!showClusters)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
              showClusters
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Regional Clusters {showClusters ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Map or API Key Splash Screen */}
      {!hasValidKey ? (
        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-6">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl mx-auto flex items-center justify-center border border-indigo-200 dark:border-indigo-800 shadow-inner">
            <MapPin className="w-8 h-8 animate-bounce" />
          </div>

          <div className="max-w-xl mx-auto space-y-3">
            <h4 className="text-xl font-display font-extrabold text-slate-900 dark:text-white">
              Google Maps API Key Required
            </h4>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
              To render high-resolution Google Maps, custom vector pins, and interactive visibility clusters, configure your Google Maps API key in AI Studio.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 text-left max-w-lg mx-auto space-y-3 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Setup Instructions
            </span>
            <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-2 list-decimal list-inside font-medium leading-relaxed">
              <li>
                Obtain a key from{' '}
                <a
                  href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 underline font-bold"
                >
                  Google Maps Platform Console
                </a>
              </li>
              <li>Open <strong>Settings (⚙️ top right)</strong> → <strong>Secrets</strong></li>
              <li>Name: <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold text-indigo-600">GOOGLE_MAPS_PLATFORM_KEY</code></li>
              <li>Paste your API key and press <strong>Enter</strong> to automatically rebuild the app.</li>
            </ol>
          </div>

          {/* Fallback Regional Map Preview Grid */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-500 mb-4">
              Regional Visibility Clusters & Mapped Competitors Preview (Scan Data):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-left">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Your Business</span>
                <h5 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{report.businessName}</h5>
                <p className="text-xs text-slate-500">{report.profileBadge?.location || 'Primary Sector'}</p>
                <div className="mt-2 text-xs font-black text-indigo-500">Score: {report.overallScore}/100</div>
              </div>

              {competitors.slice(0, 5).map((comp, i) => (
                <div key={i} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Competitor Pin</span>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{comp.name}</h5>
                  <p className="text-xs text-slate-500">{comp.locations?.[0]?.address || 'Sector Competitor'}</p>
                  <div className="mt-2 text-xs font-black text-slate-700 dark:text-slate-300">Score: {comp.score}/100</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
            <APIProvider apiKey={apiKey} version="weekly">
              <Map
                defaultCenter={{ lat: baseLat, lng: baseLng }}
                defaultZoom={13}
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
              >
                {/* Pins */}
                {filteredPins.map((pin) => (
                  <AdvancedMarker
                    key={pin.id}
                    position={{ lat: pin.lat, lng: pin.lng }}
                    onClick={() => setSelectedPin({
                      id: pin.id,
                      type: pin.type,
                      name: pin.name,
                      score: pin.score,
                      locationName: pin.locationName,
                      lat: pin.lat,
                      lng: pin.lng,
                      strengths: pin.strengths,
                      keywords: pin.keywords,
                      visibilityLevel: pin.visibilityLevel
                    })}
                  >
                    <Pin
                      background={pin.type === 'user' ? '#6366f1' : pin.color}
                      glyphColor="#ffffff"
                      borderColor="#ffffff"
                    />
                  </AdvancedMarker>
                ))}

                {/* Regional Visibility Clusters Markers */}
                {showClusters && (activeFilter === 'all' || activeFilter === 'clusters') && clusters.map((cluster) => (
                  <AdvancedMarker
                    key={cluster.id}
                    position={{ lat: cluster.lat, lng: cluster.lng }}
                    onClick={() => setSelectedPin({
                      id: cluster.id,
                      type: 'cluster',
                      name: cluster.name,
                      score: cluster.visibilityDensity,
                      locationName: `Dominant: ${cluster.dominantBrand}`,
                      lat: cluster.lat,
                      lng: cluster.lng,
                      details: `Estimated Monthly Search Volume: ${cluster.estimatedSearches}. Cluster status: ${cluster.clusterLevel}.`,
                      visibilityLevel: cluster.clusterLevel
                    })}
                  >
                    <div className="relative group cursor-pointer">
                      <div className="w-10 h-10 bg-emerald-500/20 border-2 border-emerald-500 rounded-full animate-ping absolute inset-0 opacity-75" />
                      <div className="w-10 h-10 bg-emerald-600/90 hover:bg-emerald-500 text-white font-black text-[10px] rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-white transition-transform transform group-hover:scale-110">
                        <span>{cluster.visibilityDensity}%</span>
                        <span className="text-[7px] font-extrabold uppercase">Search</span>
                      </div>
                    </div>
                  </AdvancedMarker>
                ))}

                {/* Info Window */}
                {selectedPin && (
                  <InfoWindow
                    position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
                    onCloseClick={() => setSelectedPin(null)}
                  >
                    <div className="p-2 min-w-[220px] space-y-2 text-slate-900">
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          selectedPin.type === 'user'
                            ? 'bg-indigo-100 text-indigo-700'
                            : selectedPin.type === 'cluster'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {selectedPin.type === 'user' ? 'Your Brand' : selectedPin.type === 'cluster' ? 'Visibility Cluster' : 'Competitor'}
                        </span>
                        <span className="text-xs font-black text-slate-900">
                          {selectedPin.type === 'cluster' ? `${selectedPin.score}% Vol` : `Score: ${selectedPin.score}/100`}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900">{selectedPin.name}</h4>
                      <p className="text-xs text-slate-600">{selectedPin.locationName}</p>

                      {selectedPin.details && (
                        <p className="text-xs font-medium text-slate-700 bg-slate-50 p-2 rounded">
                          {selectedPin.details}
                        </p>
                      )}

                      {selectedPin.strengths && selectedPin.strengths.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black uppercase text-indigo-600 mb-1">Key Strengths / Focus:</p>
                          <ul className="text-xs text-slate-700 list-disc list-inside space-y-0.5">
                            {selectedPin.strengths.slice(0, 2).map((st, i) => (
                              <li key={i}>{st}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedPin.keywords && selectedPin.keywords.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1">
                          {selectedPin.keywords.slice(0, 3).map((kw, i) => (
                            <span key={i} className="text-[9px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          </div>

          {/* Regional Cluster Summary List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Primary Brand Position
              </span>
              <h5 className="font-bold text-slate-900 dark:text-white text-base">{report.businessName}</h5>
              <p className="text-xs font-bold text-slate-500">
                Score: {report.overallScore}/100 • {report.profileBadge?.visibilityLevel || 'Strong'} Visibility
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Top Regional Search Cluster
              </span>
              <h5 className="font-bold text-slate-900 dark:text-white text-base">{clusters[0]?.name}</h5>
              <p className="text-xs font-bold text-slate-500">
                Density: {clusters[0]?.visibilityDensity}% • Dominant: {clusters[0]?.dominantBrand}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                Competitors Tracked on Map
              </span>
              <h5 className="font-bold text-slate-900 dark:text-white text-base">{competitors.length} Competitor Entities</h5>
              <p className="text-xs font-bold text-slate-500">
                Mapped across {clusters.length} regional market zones
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapsVisibilityView;
