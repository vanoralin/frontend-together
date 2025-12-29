'use client';

import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect, useRef } from "react";


// 🔹 กำหนด type สำหรับ location
export interface LocationType {
  id?: number;
  name: string;
  lat: number;
  lng: number;
  [key: string]: any;
}

interface MapComponentProps {
  locations?: LocationType[];
  mapRef?: React.RefObject<L.Map | null>; // 🔹 อนุญาต null
}

// 🔹 icon หมุด
const customIcon = new L.Icon({
  iconUrl: "/icon_pin_map.svg",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

// 🔹 component สำหรับติดตาม zoom level
function ZoomWatcher({ setZoom }: { setZoom: (zoom: number) => void }) {
  useMapEvents({
    zoomend: (e) => setZoom(e.target.getZoom()),
  });
  return null;
}

function UserLocationWatcher({
  setUserLocation,
}: {
  setUserLocation: (pos: L.LatLngTuple) => void;
}) {
  const map = useMapEvents({
    locationfound(e) {
      setUserLocation([e.latlng.lat, e.latlng.lng]);
    },
  });

  // ขอ location ตอน component mount
  useEffect(() => {
    map.locate({
      watch: true,
      enableHighAccuracy: true,
      setView: false,
    });
  }, [map]);

  return null;
}

// 🔹 main map
export default function MapComponent({ locations = [], mapRef }: MapComponentProps) {
  const [zoom, setZoom] = useState(15);

  const [userLocation, setUserLocation] = useState<L.LatLngTuple | null>(null);

  if (!locations.length) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl shadow-lg">
        <p className="text-gray-600 text-lg">กำลังโหลดแผนที่...</p>
      </div>
    );
  }

  const validLocations = locations.filter((loc) => loc.lat != null && loc.lng != null);

  // 🔹 ใช้ LatLngTuple ให้ TS รู้ว่ามีสอง element
  const initialPosition: L.LatLngTuple = [validLocations[0].lat, validLocations[0].lng];

  const initialZoom = 15;
  const zoomToShowName = 16; // ระดับซูมที่จะเริ่มแสดงชื่อ

  const handleGoToMyLocation = () => {
    if (!userLocation) return;

    const map = mapRef?.current;
    map?.flyTo(userLocation, 17, { duration: 0.8 });
  };

  return (
    <div className="w-full h-full rounded-2xl z-0 overflow-hidden shadow-lg">
      <MapContainer
        center={initialPosition}
        zoom={initialZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        attributionControl={false}
        ref={mapRef} //ref map
      >

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomWatcher setZoom={setZoom} />

        <UserLocationWatcher setUserLocation={setUserLocation} />

        {userLocation && (
          <>
            <Circle
              center={userLocation}
              radius={50}
              pathOptions={{ color: "#2563eb", fillOpacity: 0.15 }}
            />
            <Circle
              center={userLocation}
              radius={4}
              pathOptions={{ color: "#2563eb", fillOpacity: 1 }}
            />
          </>
        )}
        {validLocations.map((loc) => (
          <Marker
            key={loc.id ?? `${loc.lat}-${loc.lng}`}
            position={[loc.lat, loc.lng] as L.LatLngTuple}
            icon={customIcon}
          >
            {/* 🔹 แสดงชื่อเฉพาะตอนซูมใกล้ พร้อม fade animation */}
            {zoom >= zoomToShowName && (
              <Tooltip
                permanent
                direction="right"
                offset={[10, 0]}
                opacity={1}
                className="!bg-white !text-black !px-2 !py-1 !rounded-lg !shadow-md !border transition-opacity duration-500 ease-in-out"
              >
                <span className="font-semibold text-sm">{loc.name}</span>
              </Tooltip>
            )}
          </Marker>
        ))}

        <button
          onClick={handleGoToMyLocation}
          className="absolute top-40 right-4 z-[1000]
               bg-white rounded-full shadow-lg
               px-4 py-2 text-sm font-medium
               hover:bg-gray-100 transition"
        >
          <img src="/icon_my_location.svg" alt="" />
        </button>
      </MapContainer>
    </div>
  );
}
