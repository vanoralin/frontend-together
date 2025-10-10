"use client";

import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";


const customIcon = new L.Icon({
  iconUrl: "/icon_pin_map.svg",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

const locations = [
  //ดึงข้อมูลจริงมาใช้
  { id: 1, name: "หน้าตึก ECC", position: [13.729225415175016, 100.77557451289746] },
  { id: 2, name: "ตึกโหล", position: [13.72750903143394, 100.77244430550411] },
];

export default function MapComponent() {
  const initialPosition = locations[0].position; //ใช้ pin แรกเป็นจุดเริ่มต้น
  const initialZoom = 15; //zoom ใกล้ๆ pin
  return (
    <div className="w-full h-full rounded-2xl z-0 overflow-hidden shadow-lg">

      <MapContainer
        center={initialPosition}
        zoom={initialZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker พร้อมชื่อข้างๆ */}
        {locations.map((loc) => (
          <Marker key={loc.id} position={loc.position} icon={customIcon}>
            <Tooltip
              permanent
              direction="right"
              offset={[10, 0]}
              opacity={1}
              className="!bg-white !text-black !px-2 !py-1 !rounded-lg !shadow-md !border"
            >
              <span className="font-semibold text-sm">{loc.name}</span>
            </Tooltip>

          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
