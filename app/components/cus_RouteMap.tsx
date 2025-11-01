"use client";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

interface MapProps {
  tripId: number;
  pickup: { lat: number; lng: number };
  dropoff: { lat: number; lng: number };
}

const customIcon = new L.Icon({
  iconUrl: "/icon_pin_map.svg",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

const driverIcon = new L.Icon({
    iconUrl: "/icon_car.svg",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

function Routing({ pickup, dropoff }: { pickup: any; dropoff: any }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // ลบ routing เดิมก่อนถ้ามี
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

    // Listen to the routesfound event
    routingControl.on("routesfound", (e: { routes: any; }) => {
      const routes = e.routes;
      const route = routes[0]; // Get the first (best) route

      console.log("Route found:");
      console.log("Distance:", route.summary.totalDistance, "meters");
      console.log("Duration:", route.summary.totalTime, "seconds");
      console.log("Distance (km):", (route.summary.totalDistance / 1000).toFixed(2), "km");
      console.log("Duration (minutes):", (route.summary.totalTime / 60).toFixed(2), "minutes");
      console.log("Coordinates:", route.coordinates); // Array of all route coordinates
      console.log("Instructions:", route.instructions); // Turn-by-turn instructions
      console.log("Full route object:", route);
    });

    (map as any)._routingControl = routingControl;

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, pickup, dropoff]);

  return null;
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
      <Marker position={[pickup.lat, pickup.lng]} icon={customIcon} />
      <Marker position={[dropoff.lat, dropoff.lng]} icon={customIcon} />
      {driverPos && (
        <Marker
          position={[driverPos.lat, driverPos.lng]}
          icon={driverIcon}
        />
      )}
      <Routing pickup={pickup} dropoff={dropoff} />
    </MapContainer>
  );
}