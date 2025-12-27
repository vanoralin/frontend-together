'use client';

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, Tooltip } from "react-leaflet";
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
    onRouteData?: (distance: number, duration: number, instructions?: any[], currentInstruction?: any) => void;
    allLocations?: LocationType[];
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

const interpolatePoints = (start: L.LatLng, end: L.LatLng, maxDistance: number = 300): L.LatLng[] => {
    const points: L.LatLng[] = [start];

    // Calculate distance in meters
    const distance = start.distanceTo(end);

    // If distance is greater than maxDistance, add intermediate points
    if (distance > maxDistance) {
        const numPoints = Math.ceil(distance / maxDistance);

        for (let i = 1; i < numPoints; i++) {
            const ratio = i / numPoints;
            const lat = start.lat + (end.lat - start.lat) * ratio;
            const lng = start.lng + (end.lng - start.lng) * ratio;
            points.push(L.latLng(lat, lng));
        }
    }

    points.push(end);
    return points;
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
    onRouteFound?: (distance: number, duration: number, coordinates: L.LatLng[], instructions?: any[]) => void;
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
            routeWhileDragging: true,
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

                if (route && onRouteFound) {
                    onRouteFound(
                        route.summary.totalDistance,
                        route.summary.totalTime,
                        route.coordinates,
                        route.instructions
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
    onRouteData,
    allLocations = []
}: RouteMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const routingControlRef = useRef<any>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const instructionsRef = useRef<any[]>([]);
    const instructionPointsRef = useRef<L.LatLng[]>([]);
    const currentInstructionIndexRef = useRef(0);
    const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Store total route distance and time from Leaflet
    const totalRouteDistanceRef = useRef<number>(0);
    const totalRouteTimeRef = useRef<number>(0);

    const [driverPos, setDriverPos] = useState<{ lat: number; lng: number }>({
        lat: current.lat,
        lng: current.lng
    });
    const [currentInstruction, setCurrentInstruction] = useState<any>(null);

    // Determine if location is start or stop
    const isStartLocation = (location: LocationType) => {
        if (allLocations.length === 0) return false;
        return location.id === allLocations[0].id;
    };

    const isStopLocation = (location: LocationType) => {
        if (allLocations.length === 0) return false;
        return location.id === allLocations[allLocations.length - 1].id;
    };

    // Handle route found - extract instruction waypoints
    const handleRouteFound = (distance: number, duration: number, coordinates: L.LatLng[], instructions?: any[]) => {
        console.log("Route coordinates received:", coordinates.length);
        console.log("Instructions received:", instructions?.length);
        console.log("Total route distance from Leaflet:", distance, "meters");
        console.log("Total route time from Leaflet:", duration, "seconds");

        // Store total distance and time from Leaflet routing
        totalRouteDistanceRef.current = distance;
        totalRouteTimeRef.current = duration;

        if (instructions && instructions.length > 0) {
            instructionsRef.current = instructions;

            // Extract key waypoints and add interpolation for long distances
            const keyPoints: L.LatLng[] = [];

            for (let i = 0; i < instructions.length; i++) {
                const instruction = instructions[i];

                if (instruction.index !== undefined && coordinates[instruction.index]) {
                    const currentPoint = coordinates[instruction.index];

                    // If we have a previous point, interpolate between them
                    if (keyPoints.length > 0) {
                        const lastPoint = keyPoints[keyPoints.length - 1];
                        const distanceBetween = lastPoint.distanceTo(currentPoint);

                        // If distance is more than 500m, add intermediate points
                        if (distanceBetween > 500) {
                            console.log(`Large gap detected: ${distanceBetween.toFixed(0)}m between instructions`);
                            const interpolated = interpolatePoints(lastPoint, currentPoint, 500);
                            // Add all except the first (already in keyPoints) and last (will be added below)
                            for (let j = 1; j < interpolated.length - 1; j++) {
                                keyPoints.push(interpolated[j]);
                            }
                        }
                    }

                    keyPoints.push(currentPoint);
                    console.log(`Instruction ${i}: ${instruction.text} at index ${instruction.index}`);
                }
            }

            // Make sure we include the final destination
            if (keyPoints.length > 0 && coordinates.length > 0) {
                const lastPoint = coordinates[coordinates.length - 1];
                const lastKeyPoint = keyPoints[keyPoints.length - 1];
                if (lastKeyPoint.lat !== lastPoint.lat || lastKeyPoint.lng !== lastPoint.lng) {
                    // Check if we need interpolation to destination
                    const distanceToEnd = lastKeyPoint.distanceTo(lastPoint);
                    if (distanceToEnd > 500) {
                        const interpolated = interpolatePoints(lastKeyPoint, lastPoint, 500);
                        for (let j = 1; j < interpolated.length; j++) {
                            keyPoints.push(interpolated[j]);
                        }
                    } else {
                        keyPoints.push(lastPoint);
                    }
                }
            }

            console.log("Total waypoints (with interpolation):", keyPoints.length);
            instructionPointsRef.current = keyPoints;
            currentInstructionIndexRef.current = 0;

            // Set first instruction
            if (instructions.length > 0) {
                setCurrentInstruction(instructions[0]);
            }

            if (isDriver) {
                startSimulation();
            }

            // Send total distance and time from Leaflet routing
            if (onRouteData) {
                onRouteData(distance, duration, instructions, instructions[0]);
            }
        }
    };

    const startSimulation = () => {
        if (simulationIntervalRef.current) {
            clearInterval(simulationIntervalRef.current);
        }

        console.log("Starting driver simulation with", instructionPointsRef.current.length, "instruction points");

        simulationIntervalRef.current = setInterval(() => {
            const points = instructionPointsRef.current;
            const instructions = instructionsRef.current;

            if (currentInstructionIndexRef.current < points.length) {
                const currentPoint = points[currentInstructionIndexRef.current];
                const newPos = {
                    lat: currentPoint.lat,
                    lng: currentPoint.lng
                };

                console.log(`Moving to instruction point ${currentInstructionIndexRef.current + 1}/${points.length}:`, newPos);
                setDriverPos(newPos);

                // Update current instruction display
                // Find which instruction we're currently at
                let currentInstructionForDisplay = instructions[0];
                for (let i = 0; i < instructions.length; i++) {
                    if (currentInstructionIndexRef.current >= i) {
                        currentInstructionForDisplay = instructions[i];
                    }
                }

                console.log("Current instruction:", currentInstructionForDisplay.text);
                setCurrentInstruction(currentInstructionForDisplay);

                // Calculate remaining distance and time based on progress
                // Simple linear interpolation based on waypoint progress
                const totalPoints = points.length;
                const remainingPoints = totalPoints - currentInstructionIndexRef.current;
                const progressRatio = remainingPoints / totalPoints;

                const remainingDistance = totalRouteDistanceRef.current * progressRatio;
                const remainingTime = totalRouteTimeRef.current * progressRatio;

                console.log(`Remaining: ${(remainingDistance / 1000).toFixed(2)} km, ${(remainingTime / 60).toFixed(1)} min`);

                // Send updated route data with total remaining distance and time
                if (onRouteData) {
                    onRouteData(remainingDistance, remainingTime, instructions, currentInstructionForDisplay);
                }

                currentInstructionIndexRef.current++;
            } else {
                console.log("Reached end of route");
                if (simulationIntervalRef.current) {
                    clearInterval(simulationIntervalRef.current);
                }
            }
        }, 3000); // 3 seconds per instruction point (adjust as needed)
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

        let interval: NodeJS.Timeout;

        ws.onopen = () => {
            console.log("✅ Driver WebSocket connected");

            // เริ่มส่งพิกัดซ้ำทุก 5 วิ (เปลี่ยนค่าได้เลย)
            interval = setInterval(() => {
                const data = {
                    trip_id: tripId.toString(),
                    lat: driverPos.lat,
                    lng: driverPos.lng,
                };

                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(data));
                    console.log("📡 ส่งพิกัด driver:", data);
                }
            }, 5000); // 🕒 ส่งทุก 5 วิ
        };

        ws.onerror = (err) => console.error("❌ WebSocket error:", err);

        ws.onclose = () => {
            console.log("⚠️ Driver WebSocket closed");
            clearInterval(interval);
        };

        return () => {
            clearInterval(interval);
            if (ws.readyState === WebSocket.OPEN) ws.close();
        };
    }, [tripId, isDriver, driverPos]);

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

            <MapFollower position={from} />

            {/* Driver marker */}
            <Marker position={from} icon={createDriverIcon()}>
                <Tooltip permanent direction="top" offset={[0, -10]}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>
                        ตำแหน่งคนขับ
                    </div>
                </Tooltip>
            </Marker>

            {/* Current location marker */}
            <Marker position={[current.lat, current.lng]} icon={customIcon}>
                <Tooltip permanent direction="top" offset={[0, -40]}>
                    <div style={{ textAlign: 'center' }}>
                        {isStartLocation(current) && (
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#16a34a' }}>
                                จุดเริ่มต้น
                            </div>
                        )}
                        {isStopLocation(current) && (
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#dc2626' }}>
                                จุดหมาย
                            </div>
                        )}
                        <div style={{ fontSize: '12px', marginTop: '2px' }}>
                            {current.name}
                        </div>
                    </div>
                </Tooltip>
            </Marker>

            {/* Next location marker */}
            {next && (
                <Marker position={[next.lat, next.lng]} icon={customIcon}>
                    <Tooltip permanent direction="top" offset={[0, -40]}>
                        <div style={{ textAlign: 'center' }}>
                            {isStartLocation(next) && (
                                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#16a34a' }}>
                                    จุดเริ่มต้น
                                </div>
                            )}
                            {isStopLocation(next) && (
                                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#dc2626' }}>
                                    จุดหมาย
                                </div>
                            )}
                            <div style={{ fontSize: '12px', marginTop: '2px' }}>
                                {next.name}
                            </div>
                        </div>
                    </Tooltip>
                </Marker>
            )}

            {next && (
                <RoutingLayer
                    from={from}
                    to={to}
                    controlRef={routingControlRef}
                    onRouteFound={handleRouteFound}
                />
            )}
            <style jsx global>{`
  .leaflet-routing-container {
    bottom: 10px !important;  /* ขยับลงจากขอบล่างนิดหน่อย */
    top: auto !important;      /* ยกเลิกการยึดด้านบน */
    background: rgba(255, 255, 255, 0.9) !important; 
    border-radius: 10px !important;
    padding: 8px 12px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
`}</style>
        </MapContainer>


    );
}