"use client";
import { MapContainer, TileLayer, Marker, useMap, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

interface MapProps {
  tripId: number;
  pickup: { lat: number; lng: number; name?: string };
  dropoff: { lat: number; lng: number; name?: string };
}

const customIcon = new L.Icon({
  iconUrl: "/icon_pin_map.svg",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

// Function to create driver icon with dynamic size based on zoom
const createDriverIcon = (zoom: number) => {
  const baseSize = 30;
  const minZoom = 10;
  const maxZoom = 20;
  
  const scale = Math.max(0.5, Math.min(2, (zoom - minZoom) / (maxZoom - minZoom) + 0.5));
  const size = baseSize * scale;
  
  return new L.Icon({
    iconUrl: "/map_car1.png",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
};

function Routing({ pickup, dropoff }: { pickup: any; dropoff: any }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    (map as any)._routingControl?.remove();

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(pickup.lat, pickup.lng),
        L.latLng(dropoff.lat, dropoff.lng),
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: "blue", opacity: 0.8, weight: 5 }],
      },
      createMarker: () => null,
    }).addTo(map);

    routingControl.on("routesfound", (e: { routes: any; }) => {
      const routes = e.routes;
      const route = routes[0];

      console.log("Route found:");
      console.log("Distance:", route.summary.totalDistance, "meters");
      console.log("Duration:", route.summary.totalTime, "seconds");
      console.log("Distance (km):", (route.summary.totalDistance / 1000).toFixed(2), "km");
      console.log("Duration (minutes):", (route.summary.totalTime / 60).toFixed(2), "minutes");
    });

    (map as any)._routingControl = routingControl;

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, pickup, dropoff]);

  return null;
}

// Component to handle zoom-responsive driver marker
function DriverMarker({ position }: { position: [number, number] }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const handleZoom = () => {
      setZoom(map.getZoom());
    };

    map.on('zoomend', handleZoom);
    
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map]);

  return (
    <Marker position={position} icon={createDriverIcon(zoom)}>
      <Tooltip permanent direction="top" offset={[0, -10]}>
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
          ตำแหน่งคนขับ
        </div>
      </Tooltip>
    </Marker>
  );
}

export default function TripMap({ tripId, pickup, dropoff }: MapProps) {
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://129.150.62.182:8888/ws/passenger?trip_id=${tripId}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setDriverPos({ lat: data.lat, lng: data.lng });
      } catch { }
    };

    ws.onclose = () => console.log("WS closed");
    return () => ws.close();
  }, [tripId]);

  return (
    <MapContainer
      center={[pickup.lat, pickup.lng]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />
      
      {/* Pickup Marker with Tooltip */}
      <Marker position={[pickup.lat, pickup.lng]} icon={customIcon}>
        <Tooltip permanent direction="top" offset={[0, -40]}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#16a34a' }}>
              จุดเริ่มต้น
            </div>
            <div style={{ fontSize: '12px', marginTop: '2px' }}>
              {pickup.name || "จุดรับผู้โดยสาร"}
            </div>
          </div>
        </Tooltip>
      </Marker>

      {/* Dropoff Marker with Tooltip */}
      <Marker position={[dropoff.lat, dropoff.lng]} icon={customIcon}>
        <Tooltip permanent direction="top" offset={[0, -40]}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#dc2626' }}>
              จุดหมาย
            </div>
            <div style={{ fontSize: '12px', marginTop: '2px' }}>
              {dropoff.name || "จุดส่งผู้โดยสาร"}
            </div>
          </div>
        </Tooltip>
      </Marker>

      {/* Driver Marker */}
      {driverPos && (
        <DriverMarker position={[driverPos.lat, driverPos.lng]} />
      )}

      <Routing pickup={driverPos || pickup} dropoff={dropoff} />
    </MapContainer>
  );
}