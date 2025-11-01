'use client';

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

export interface LocationType {
    id?: number;
    name: string;
    lat: number;
    lng: number;
}

interface RouteMapProps {
    tripId: number;
    current: LocationType;
    next: LocationType | null;
    isStarted: boolean;
    isDriver?: boolean;
    onRouteData?: (distance: number, duration: number) => void;
}

const customIcon = new L.Icon({
    iconUrl: "/icon_pin_map.svg",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
});

// Create a custom circular icon like Google Maps
const createDriverIcon = () => {
    return L.divIcon({
        className: 'custom-driver-marker',
        html: `
            <div style="
                width: 20px;
                height: 20px;
                background-color: #4285F4;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
};

function RoutingLayer({
    from,
    to,
    controlRef,
    onRouteFound,
}: {
    from: [number, number];
    to: [number, number];
    controlRef: React.MutableRefObject<any>;
    onRouteFound?: (distance: number, duration: number, coordinates: L.LatLng[]) => void;
}) {
    const map = useMap();
    const isMountedRef = useRef(true);

    useEffect(() => {
        if (!from || !to || !map) return;

        isMountedRef.current = true;

        const routeKey = `${from[0]},${from[1]}-${to[0]},${to[1]}`;
        const previousRouteKey = controlRef.current?._routeKey;

        if (previousRouteKey === routeKey && controlRef.current?._map) {
            return;
        }

        if (controlRef.current && previousRouteKey !== routeKey) {
            try {
                if (controlRef.current._map) {
                    controlRef.current.off();
                    map.removeControl(controlRef.current);
                }
            } catch (error) {
                console.warn("Error removing old routing control:", error);
            }
            controlRef.current = null;
        }

        const control = L.Routing.control({
            waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            show: false,
            createMarker: () => null,
            lineOptions: {
                styles: [{ color: "#007bff", weight: 5, opacity: 0.8 }],
                extendToWaypoints: true,
                missingRouteTolerance: 0
            },
            router: L.Routing.osrmv1({
                serviceUrl: "https://router.project-osrm.org/route/v1"
            }),
        }) as any;

        control._routeKey = routeKey;

        try {
            control.addTo(map);
            controlRef.current = control;

            control.on("routesfound", (e: any) => {
                if (!isMountedRef.current) return;

                const route = e.routes[0];

                console.log("Route found:");
                console.log("Distance (km):", (route.summary.totalDistance / 1000).toFixed(2), "km");
                console.log("Duration (minutes):", (route.summary.totalTime / 60).toFixed(2), "minutes");
                console.log("Total coordinates:", route.coordinates.length);

                if (route && onRouteFound) {
                    onRouteFound(
                        route.summary.totalDistance,
                        route.summary.totalTime,
                        route.coordinates
                    );
                }
            });

            control.on("routingerror", (e: any) => {
                console.error("Routing error:", e);
            });
        } catch (error) {
            console.error("Error adding routing control:", error);
        }

        return () => {
            isMountedRef.current = false;
        };
    }, [from[0], from[1], to[0], to[1], map, onRouteFound]);

    return null;
}

// Component to smoothly follow driver marker
function MapFollower({ position }: { position: [number, number] }) {
    const map = useMap();
    const lastUpdateRef = useRef(Date.now());

    useEffect(() => {
        const now = Date.now();
        // Only update map position every 3 seconds to reduce shaking
        if (now - lastUpdateRef.current > 3000) {
            map.panTo(position, { animate: true, duration: 2 });
            lastUpdateRef.current = now;
        }
    }, [position, map]);

    return null;
}

export default function RouteMap({
    tripId,
    current,
    next,
    isStarted,
    isDriver = false,
    onRouteData
}: RouteMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const routingControlRef = useRef<any>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const routeCoordinatesRef = useRef<L.LatLng[]>([]);
    const currentIndexRef = useRef(0);
    const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [driverPos, setDriverPos] = useState<{ lat: number; lng: number }>({
        lat: current.lat,
        lng: current.lng
    });

    // Handle route found - store coordinates and filter them
    const handleRouteFound = (distance: number, duration: number, coordinates: L.LatLng[]) => {
        console.log("Route coordinates received:", coordinates.length);

        // Filter coordinates - only take every 5th point to skip many points
        const filteredCoordinates = coordinates.filter((_, index) => index % 5 === 0);

        // Make sure we include the last point
        if (coordinates.length > 0 && filteredCoordinates[filteredCoordinates.length - 1] !== coordinates[coordinates.length - 1]) {
            filteredCoordinates.push(coordinates[coordinates.length - 1]);
        }

        console.log("Filtered to:", filteredCoordinates.length, "points");
        routeCoordinatesRef.current = filteredCoordinates;
        currentIndexRef.current = 0;

        // Start simulation immediately
        if (isDriver) {
            startSimulation();
        }

        if (onRouteData) {
            onRouteData(distance, duration);
        }
    };

    // Function to start driver simulation
    const startSimulation = () => {
        // Clear any existing simulation
        if (simulationIntervalRef.current) {
            clearInterval(simulationIntervalRef.current);
        }

        console.log("Starting driver simulation with", routeCoordinatesRef.current.length, "points");

        simulationIntervalRef.current = setInterval(() => {
            const coordinates = routeCoordinatesRef.current;

            if (currentIndexRef.current < coordinates.length) {
                const currentCoord = coordinates[currentIndexRef.current];
                const newPos = {
                    lat: currentCoord.lat,
                    lng: currentCoord.lng
                };

                console.log(`Moving to point ${currentIndexRef.current + 1}/${coordinates.length}:`, newPos);
                setDriverPos(newPos);
                currentIndexRef.current++;
            } else {
                console.log("Reached end of route");
                if (simulationIntervalRef.current) {
                    clearInterval(simulationIntervalRef.current);
                }
            }
        }, 1000);
    };

    // WebSocket for receiving driver location (for passengers)
    useEffect(() => {
        if (isDriver || !tripId) return;

        const ws = new WebSocket(`ws://129.150.62.182:8888/ws/passenger?trip_id=${tripId}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("Passenger WebSocket connected");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.lat && data.lng) {
                    setDriverPos({ lat: data.lat, lng: data.lng });
                    console.log("Driver position updated from WebSocket:", data);
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
            console.log("Passenger WebSocket closed");
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [tripId, isDriver]);

    // WebSocket for sending driver location (for drivers)
    useEffect(() => {
        if (!isDriver || !tripId) return;

        const ws = new WebSocket(`ws://129.150.62.182:8888/ws/driver?trip_id=${tripId}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("Driver WebSocket connected");
        };

        ws.onerror = (error) => {
            console.error("Driver WebSocket error:", error);
        };

        ws.onclose = () => {
            console.log("Driver WebSocket closed");
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [tripId, isDriver]);

    // Send location when driverPos changes
    useEffect(() => {
        if (isDriver && wsRef.current?.readyState === WebSocket.OPEN) {
            const locationData = {
                trip_id: tripId.toString(),
                lat: driverPos.lat,
                lng: driverPos.lng
            };
            try {
                wsRef.current.send(JSON.stringify(locationData));
                console.log("Sent driver location:", locationData);
            } catch (error) {
                console.error("Error sending location:", error);
            }
        }
    }, [driverPos, isDriver, tripId]);

    // Cleanup simulation on unmount
    useEffect(() => {
        return () => {
            if (simulationIntervalRef.current) {
                clearInterval(simulationIntervalRef.current);
            }
        };
    }, []);

    const from: [number, number] = [driverPos.lat, driverPos.lng];
    const to: [number, number] = next ? [next.lat, next.lng] : from;

    return (
        <MapContainer
            center={from}
            zoom={15}
            scrollWheelZoom={false}
            zoomControl={false}
            className="w-full h-full"
            ref={mapRef}
            whenReady={() => console.log("Map is ready")}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Smooth map following */}
            <MapFollower position={from} />

            {/* Circular driver marker like Google Maps */}
            <Marker position={from} icon={createDriverIcon()} />

            {next && <Marker position={to} icon={customIcon} />}

            {next && (
                <RoutingLayer
                    from={from}
                    to={to}
                    controlRef={routingControlRef}
                    onRouteFound={handleRouteFound}
                />
            )}
        </MapContainer>
    );
}