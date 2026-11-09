"use client";

import { useEffect, useRef } from "react";

export function LeafletMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let active = true;
    const mount = async () => {
      const L = await import("leaflet");
      if (!active || !mapRef.current) return;
      map = L.map(mapRef.current, { scrollWheelZoom: false, zoomControl: true }).setView(
        [lat, lng],
        8,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      const icon = L.icon({
        iconUrl: "/vendor/images/marker-icon.png",
        iconRetinaUrl: "/vendor/images/marker-icon-2x.png",
        shadowUrl: "/vendor/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`<strong>${label}</strong><br>Ubicación aproximada`)
        .openPopup();
    };
    mount();
    return () => {
      active = false;
      map?.remove();
    };
  }, [lat, lng, label]);
  return (
    <div
      className="map-shell"
      ref={mapRef}
      role="img"
      aria-label={`Mapa de ubicación aproximada de ${label}`}
    />
  );
}
