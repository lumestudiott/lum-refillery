'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';

const hotspots = [
  { lat: 10.6549, lng: -61.5019, city: 'Port of Spain', waste: '~850 tons/wk' },
  { lat: 10.5167, lng: -61.4000, city: 'Chaguanas', waste: '~420 tons/wk' },
  { lat: 10.2833, lng: -61.4667, city: 'San Fernando', waste: '~610 tons/wk' },
  { lat: 10.6333, lng: -61.2833, city: 'Arima', waste: '~310 tons/wk' },
  { lat: 11.1833, lng: -60.7333, city: 'Scarborough', waste: '~180 tons/wk' },
  { lat: 10.1833, lng: -61.6833, city: 'Point Fortin', waste: '~190 tons/wk' },
  { lat: 10.5833, lng: -61.1333, city: 'Sangre Grande', waste: '~250 tons/wk' },
  { lat: 10.1500, lng: -61.5000, city: 'Siparia', waste: '~170 tons/wk' },
];

const TrinidadMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const pulseIntervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current || mapRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      // @ts-ignore - Leaflet CSS is handled by the bundler
      await import('leaflet/dist/leaflet.css');

      // Create map instance
      const map = L.map(containerRef.current!, {
        center: [10.5, -61.3],
        zoom: 9,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      mapRef.current = map;

      // Dark CartoDB tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 15,
      }).addTo(map);

      // Fit bounds to T&T
      const bounds = L.latLngBounds(
        L.latLng(10.04, -61.95),
        L.latLng(11.36, -60.47)
      );
      map.fitBounds(bounds, { padding: [30, 30] });

      // Custom pulsing icon
      const createPulsingIcon = (active: boolean) => {
        return L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
              <div style="width:${active ? '10' : '8'}px;height:${active ? '10' : '8'}px;background:${active ? '#fff' : '#00754A'};border-radius:50%;opacity:${active ? '0.95' : '0.8'};transition:all 0.3s;"></div>
              ${active ? `<div style="position:absolute;width:24px;height:24px;border:1.5px solid #00754A;border-radius:50;animation:pulse-out 1.5s ease-out;"></div>` : ''}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
      };

      // Add markers
      hotspots.forEach((spot, index) => {
        const marker = L.marker([spot.lat, spot.lng], {
          icon: createPulsingIcon(false),
        }).addTo(map);

        // Custom popup styling
        marker.bindPopup(
          `<div style="font-family:Inter,sans-serif;padding:2px 0;">
            <strong style="font-size:13px;color:#1E3932;">${spot.city}</strong><br/>
            <span style="font-size:11px;color:#666;">${spot.waste}</span>
          </div>`,
          {
            className: 'tt-popup',
            closeButton: true,
          }
        );

        // Pulse animation cycle
        const pulseInterval = setInterval(() => {
          marker.setIcon(createPulsingIcon(true));
          setTimeout(() => {
            marker.setIcon(createPulsingIcon(false));
          }, 1500);
        }, 3000 + index * 500);

        pulseIntervalsRef.current.push(pulseInterval);
      });
    };

    initMap();

    // Cleanup
    return () => {
      pulseIntervalsRef.current.forEach(clearInterval);
      pulseIntervalsRef.current = [];

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mounted]);

  return (
    <>
      <style>{`
        .tt-popup .leaflet-popup-content-wrapper {
          background: rgba(30,57,50,0.95) !important;
          color: white !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
        }
        .tt-popup .leaflet-popup-tip {
          background: rgba(30,57,50,0.95) !important;
        }
        .tt-popup .leaflet-popup-content {
          margin: 10px 14px !important;
          color: white !important;
        }
        .tt-popup .leaflet-popup-content strong { color: white !important; }
        .tt-popup .leaflet-popup-content span { color: rgba(255,255,255,0.6) !important; }
        .tt-popup .leaflet-popup-close-button { color: rgba(255,255,255,0.4) !important; }
        .leaflet-control-zoom { border: none !important; box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important; }
        .leaflet-control-zoom a {
          background: rgba(30,57,50,0.9) !important;
          color: rgba(255,255,255,0.7) !important;
          border: none !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-size: 14px !important;
        }
        .leaflet-control-zoom a:hover { background: rgba(30,57,50,1) !important; color: white !important; }
        .leaflet-control-attribution {
          background: rgba(30,57,50,0.8) !important;
          color: rgba(255,255,255,0.25) !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a { color: rgba(255,255,255,0.35) !important; }
        .custom-marker { background: none !important; border: none !important; }
        @keyframes pulse-out {
          0% { transform: scale(0.5); opacity: 0.6; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
      <div
        ref={containerRef}
        className="overflow-hidden rounded-[8px]"
        style={{ height: '420px', background: '#1E3932' }}
      />
    </>
  );
};

export default TrinidadMap;
