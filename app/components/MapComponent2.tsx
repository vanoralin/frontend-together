"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export type MapMarker = {
  id: number | string;
  position: { lat: number; lng: number };
  label?: string;
};

type Props = {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (id: number | string) => void;
  selectedIds?: (number | string)[];  
};

export default function MapComponent2({
  center = { lat: 13.736717, lng: 100.523186 },
  zoom = 15,
  markers = [],
  onMapClick,
  onMarkerClick,
  selectedIds = [], 
  
}: Props) {
  // เรียก Hooks เสมอทุกครั้ง (อย่า return ก่อน)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // ไอคอนหมุด (ปลอดภัยเพราะไฟล์นี้เป็น client component)
  const customIcon = useMemo(
    () =>
      L.icon({
        iconUrl: "/icon_pin_map.svg",   
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
      }),
    []
  );

  const selectedIcon = useMemo(
  () =>
    L.icon({
      iconUrl: "/icon_pin_map_selected.svg", 
      iconAnchor: [24, 48],
      popupAnchor: [0, -48],
    }),
  []
);


  // ดักคลิกบนแผนที่
  function ClickCatcher() {
    useMapEvents({
      click(e) {
        onMapClick?.(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {mounted && (
        <MapContainer
          key={`${center.lat},${center.lng},${zoom}`}
          center={[center.lat, center.lng]}
          zoom={zoom}
          scrollWheelZoom
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickCatcher />

          {markers.map((m) => (
            <Marker
              key={m.id}
              position={[m.position.lat, m.position.lng]}
              icon={customIcon}
              eventHandlers={{ click: () => onMarkerClick?.(m.id) }}
            >
              {m.label && <Popup>{m.label}</Popup>}
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
