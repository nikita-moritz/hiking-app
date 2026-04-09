"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Marker {
  id: number;
  lat: number;
  lng: number;
  title: string;
  eventDate: string;
}

interface Props {
  markers: Marker[];
  selectedId: number | null;
  onMarkerClick: (id: number) => void;
  centerLat: number;
  centerLng: number;
  radiusKm: number | null;
}

export default function MapView({ markers, selectedId, onMarkerClick, centerLat, centerLng, radiusKm }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const circleRef = useRef<L.Circle | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = L.map(containerRef.current).setView([centerLat, centerLng], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current.clear();

    markers.forEach(m => {
      const isSelected = m.id === selectedId;
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:${isSelected ? 18 : 14}px;height:${isSelected ? 18 : 14}px;
          background:${isSelected ? "#2563eb" : "#3b82f6"};
          border:2px solid white;border-radius:50%;
          box-shadow:0 2px 6px rgba(0,0,0,0.4);
          transition:all 0.2s;
        "></div>`,
        iconSize: [isSelected ? 18 : 14, isSelected ? 18 : 14],
        iconAnchor: [isSelected ? 9 : 7, isSelected ? 9 : 7],
      });

      const marker = L.marker([m.lat, m.lng], { icon })
        .addTo(map)
        .bindTooltip(`<b>${m.title}</b><br/>${new Date(m.eventDate).toLocaleDateString("ru-RU")}`, { direction: "top" });

      marker.on("click", () => onMarkerClick(m.id));
      markersRef.current.set(m.id, marker);
    });
  }, [markers, selectedId]);

  // Update center + radius circle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([centerLat, centerLng], map.getZoom());

    circleRef.current?.remove();
    if (radiusKm) {
      circleRef.current = L.circle([centerLat, centerLng], {
        radius: radiusKm * 1000,
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.05,
        weight: 1.5,
        dashArray: "6 4",
      }).addTo(map);
    }
  }, [centerLat, centerLng, radiusKm]);

  // Pan to selected marker
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const marker = markersRef.current.get(selectedId);
    if (marker) mapRef.current.panTo(marker.getLatLng());
  }, [selectedId]);

  return <div ref={containerRef} className="h-full w-full" />;
}
