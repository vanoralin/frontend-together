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

interface RouteSegment {
    fromPin: LocationType;
    toPin: LocationType;
    coordinates: L.LatLng[];
    distance: number;
    duration: number;
}

interface NavigationMapProps {
    tripId: number;
    pins: LocationType[];
    mode: 'driver' | 'customer';
    currentPinIndex: number;
    onRouteUpdate?: (distance: number, duration: number) => void;
    onPinReached?: () => void;
}

const pinIcon = new L.Icon({
    iconUrl: "/icon_pin_map.svg",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
});

const driverIcon = () => {
    return L.divIcon({
        className: 'driver-marker',
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

// Component สำหรับสร้าง routing
function RoutingLayer({
    from,
    to,
    onRouteFound,
}: {
    from: [number, number];
    to: [number, number];
    onRouteFound: (coords: L.LatLng[], distance: number, duration: number) => void;
}) {
    const map = useMap();
    const controlRef = useRef<any>(null);
    const isLoadingRef = useRef<boolean>(false);
    const isInitializedRef = useRef<boolean>(false);

    useEffect(() => {
        if (!map || !from || !to) return;

        // ถ้ากำลังโหลดอยู่ ให้รอ
        if (isLoadingRef.current) {
            console.log("Still loading route, skipping update...");
            return;
        }

        // ลบ control เก่า (เฉพาะเมื่อไม่ได้กำลังโหลด)
        if (controlRef.current && isInitializedRef.current) {
            isLoadingRef.current = true;
            try {
                if (map && map.removeControl) {
                    map.removeControl(controlRef.current);
                }
            } catch (e) {
                // Silently ignore
            } finally {
                controlRef.current = null;
                isLoadingRef.current = false;
            }
        }

        // ตั้งค่าว่ากำลังโหลด
        isLoadingRef.current = true;

        const control = L.Routing.control({
            waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            show: false,
            createMarker: () => null,
            lineOptions: {
                styles: [{ color: "#007bff", weight: 5, opacity: 0.8 }],
            },
            router: L.Routing.osrmv1({
                serviceUrl: "https://router.project-osrm.org/route/v1"
            }),
        }) as any;

        control.on("routesfound", (e: any) => {
            const route = e.routes[0];
            if (route) {
                onRouteFound(
                    route.coordinates,
                    route.summary.totalDistance,
                    route.summary.totalTime
                );
                // โหลดเสร็จแล้ว
                isLoadingRef.current = false;
                isInitializedRef.current = true;
                console.log("Route loaded successfully");
            }
        });

        control.on("routingerror", (e: any) => {
            console.error("Routing error:", e);
            isLoadingRef.current = false;
        });

        try {
            control.addTo(map);
            controlRef.current = control;
        } catch (error) {
            console.error("Error adding control:", error);
            isLoadingRef.current = false;
        }

        return () => {
            // Cleanup: รอให้โหลดเสร็จก่อนลบ
            if (controlRef.current && !isLoadingRef.current) {
                const controlToRemove = controlRef.current;

                // ใช้ setTimeout เพื่อให้แน่ใจว่า routing เสร็จแล้ว
                setTimeout(() => {
                    try {
                        if (map && map.removeControl && controlToRemove) {
                            map.removeControl(controlToRemove);
                        }
                    } catch (e) {
                        // Silently ignore
                    }
                }, 100);

                controlRef.current = null;
            }
        };
    }, [from[0], from[1], to[0], to[1], map]);

    return null;
}

// Component สำหรับ center map
function MapCenter({ position }: { position: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        if (map && position) {
            map.panTo(position, { animate: true });
        }
    }, [position, map]);

    return null;
}

// Helper function to load route segment
async function loadRouteSegment(
    from: LocationType,
    to: LocationType
): Promise<RouteSegment> {
    return new Promise((resolve, reject) => {
        const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
                    reject(new Error('No route found'));
                    return;
                }

                const route = data.routes[0];
                const coordinates = route.geometry.coordinates.map((coord: number[]) =>
                    L.latLng(coord[1], coord[0])
                );

                resolve({
                    fromPin: from,
                    toPin: to,
                    coordinates: coordinates,
                    distance: route.distance,
                    duration: route.duration,
                });
            })
            .catch(reject);
    });
}

// Helper function to get real-time route from current position
async function getRealTimeRoute(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number
): Promise<{ distance: number; duration: number }> {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            throw new Error('No route found');
        }

        const route = data.routes[0];
        return {
            distance: route.distance,
            duration: route.duration,
        };
    } catch (error) {
        console.error("Error fetching real-time route:", error);
        throw error;
    }
}

export default function NavigationMap({
    tripId,
    pins,
    mode,
    currentPinIndex,
    onRouteUpdate,
    onPinReached,
}: NavigationMapProps) {
    const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
    const [driverPosition, setDriverPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<L.LatLng[]>([]);
    const [currentCoordIndex, setCurrentCoordIndex] = useState(0);
    const [isRoutingReady, setIsRoutingReady] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const wsHeartbeatRef = useRef<NodeJS.Timeout | null>(null);
    const movementIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastRouteUpdateRef = useRef<number>(0);

    const [isAtDestination, setIsAtDestination] = useState(false);


    // ✅ เพิ่ม ref เก็บตำแหน่งล่าสุด (อิสระจาก state)
    const latestPositionRef = useRef<{ lat: number; lng: number } | null>(null);

    // สร้าง route segments ทั้งหมดตั้งแต่แรก
    useEffect(() => {
        if (pins.length < 2) return;

        const loadAllSegments = async () => {
            try {
                const segments: RouteSegment[] = [];
                for (let i = 0; i < pins.length - 1; i++) {
                    const segment = await loadRouteSegment(pins[i], pins[i + 1]);
                    segments.push(segment);
                    console.log(`Loaded segment ${i} -> ${i + 1}:`, segment.coordinates.length, "points");
                }
                setRouteSegments(segments);
                console.log("All segments loaded:", segments.length);
            } catch (error) {
                console.error("Error loading segments:", error);
            }
        };

        loadAllSegments();
    }, [pins]);

    // ตั้งค่า route coordinates เมื่อเปลี่ยน pin - ปรับให้เหมาะสมกับระยะทาง
    useEffect(() => {
        if (routeSegments.length === 0 || currentPinIndex >= routeSegments.length) return;

        setIsAtDestination(false);

        const segment = routeSegments[currentPinIndex];
        const coords = segment.coordinates;

        // คำนวณจำนวนจุดที่เหมาะสม: ระยะทาง(km) * 3 points/km
        const distanceKm = segment.distance / 1000;
        const targetPoints = Math.max(10, Math.min(50, Math.floor(distanceKm * 3)));
        const skipInterval = Math.max(1, Math.floor(coords.length / targetPoints));

        // ✅ กรองจุดให้น้อยลง แต่รับประกันว่ามีจุดสุดท้ายเสมอ
        const filteredCoords = coords.filter((_, idx) => idx % skipInterval === 0);
        if (coords.length > 0 && filteredCoords[filteredCoords.length - 1] !== coords[coords.length - 1]) {
            filteredCoords.push(coords[coords.length - 1]);
        }


        setRouteCoordinates(filteredCoords);
        setCurrentCoordIndex(0);
        setIsRoutingReady(true);
        lastRouteUpdateRef.current = 0;

        console.log(`Set route for pin ${currentPinIndex} -> ${currentPinIndex + 1}: ${filteredCoords.length} points (distance: ${distanceKm.toFixed(2)} km)`);
    }, [currentPinIndex, routeSegments]);

    // ✅ WebSocket Setup + Heartbeat (อิสระจาก movement)
    useEffect(() => {
        if (mode !== 'driver' || !tripId) return;

        const ws = new WebSocket(`ws://129.150.62.182:8888/ws/driver?trip_id=${tripId}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("Driver WebSocket connected");

            // ✅ Heartbeat อิสระ - ส่งทุก 5 วินาที ไม่ว่าอะไร
            wsHeartbeatRef.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    // ✅ ใช้ latestPositionRef แทน state
                    const currentPos = latestPositionRef.current ||
                        (pins[currentPinIndex] ? { lat: pins[currentPinIndex].lat, lng: pins[currentPinIndex].lng } : null);

                    if (currentPos) {
                        const data = {
                            trip_id: tripId.toString(),
                            lat: currentPos.lat,
                            lng: currentPos.lng,
                        };
                        ws.send(JSON.stringify(data));
                        console.log("❤️ Heartbeat sent:", data);
                    } else {
                        console.warn("⚠️ No position to send");
                    }
                }
            }, 2000); // ทุก 5 วินาที
        };

        ws.onerror = (error) => console.error("Driver WebSocket error:", error);

        ws.onclose = () => {
            console.log("Driver WebSocket closed");
            if (wsHeartbeatRef.current) {
                clearInterval(wsHeartbeatRef.current);
                wsHeartbeatRef.current = null;
            }
        };

        return () => {
            if (wsHeartbeatRef.current) {
                clearInterval(wsHeartbeatRef.current);
                wsHeartbeatRef.current = null;
            }
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [tripId, mode, pins, currentPinIndex]); // ✅ ไม่ depend on driverPosition

    // Customer mode: รับตำแหน่งจาก WebSocket
    useEffect(() => {
        if (mode !== 'customer' || !tripId) return;

        const ws = new WebSocket(`ws://129.150.62.182:8888/ws/passenger?trip_id=${tripId}`);
        wsRef.current = ws;

        ws.onopen = () => console.log("✅ Customer WS connected");

        ws.onmessage = (event) => {
            console.log("📨 [WS MESSAGE] Raw data:", event.data);

            try {
                const data = JSON.parse(event.data);
                console.log("✅ [WS PARSED]", data);

                if (data.lat && data.lng) {
                    console.log(`📍 Driver position updated → lat=${data.lat}, lng=${data.lng}`);
                    const newPos = { lat: data.lat, lng: data.lng };
                    setDriverPosition(newPos);
                    latestPositionRef.current = newPos; // ✅ อัพเดท ref ด้วย
                } else {
                    console.warn("⚠️ Received message does not contain lat/lng keys:", data);
                }
            } catch (err) {
                console.error("❌ [WS PARSE ERROR]:", err);
            }
        };

        ws.onerror = (err) => console.error("❌ [WS ERROR]:", err);
        ws.onclose = (e) => console.log("❌ [WS CLOSED]:", e.code, e.reason);

        const heartbeat = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "ping" }));
                console.log("💓 [WS PING] Sent heartbeat");
            }
        }, 30000);

        return () => {
            clearInterval(heartbeat);
            if (ws.readyState === WebSocket.OPEN) ws.close();
        };
    }, [tripId, mode]);

    // Function to update real-time route info
    const updateRealTimeRoute = async (currentPos: { lat: number; lng: number }) => {
        if (!onRouteUpdate || currentPinIndex >= pins.length - 1) return;

        const destination = pins[currentPinIndex + 1];

        try {
            const routeInfo = await getRealTimeRoute(
                currentPos.lat,
                currentPos.lng,
                destination.lat,
                destination.lng
            );

            console.log(`Real-time route: ${(routeInfo.distance / 1000).toFixed(2)} km, ${(routeInfo.duration / 60).toFixed(1)} min`);
            onRouteUpdate(routeInfo.distance, routeInfo.duration);
        } catch (error) {
            console.error("Error updating real-time route:", error);
        }
    };

    // ✅ Movement Interval (แยกสมบูรณ์ - อัพเดทเฉพาะ state และ ref)
    useEffect(() => {
        if (mode !== 'driver' || !isRoutingReady || routeCoordinates.length === 0) return;

        if (movementIntervalRef.current) {
            clearInterval(movementIntervalRef.current);
        }

        movementIntervalRef.current = setInterval(() => {
            if (currentCoordIndex < routeCoordinates.length) {
                const coord = routeCoordinates[currentCoordIndex];
                const newPos = { lat: coord.lat, lng: coord.lng };

                // ✅ อัพเดททั้ง state และ ref
                setDriverPosition(newPos);
                latestPositionRef.current = newPos; // ✅ อัพเดท ref ทันที

                console.log("🚗 Movement update:", newPos);

                // อัพเดทระยะทางและเวลาที่เหลือ (ทุก 10 วินาที)
                const now = Date.now();
                if (now - lastRouteUpdateRef.current > 5000) {
                    updateRealTimeRoute(newPos);
                    lastRouteUpdateRef.current = now;
                }

                setCurrentCoordIndex(prev => prev + 1);
            } else {
                console.log(`Reached pin ${currentPinIndex + 1}`);
                setIsAtDestination(true);
                if (onPinReached) {
                    onPinReached();
                }
                if (movementIntervalRef.current) {
                    clearInterval(movementIntervalRef.current);
                    movementIntervalRef.current = null;
                }
            }
        }, 2000); // เคลื่อนที่ทุก 2 วินาที

        return () => {
            if (movementIntervalRef.current) {
                clearInterval(movementIntervalRef.current);
                movementIntervalRef.current = null;
            }
        };
    }, [mode, isRoutingReady, routeCoordinates, currentCoordIndex, currentPinIndex, tripId]);

    // อัพเดท route info เมื่อ customer mode รับตำแหน่งใหม่
    useEffect(() => {
        if (mode !== 'customer' || !driverPosition) return;

        const now = Date.now();
        if (now - lastRouteUpdateRef.current > 10000) {
            updateRealTimeRoute(driverPosition);
            lastRouteUpdateRef.current = now;
        }
    }, [driverPosition, mode]);

    // ตั้งตำแหน่งเริ่มต้น
    useEffect(() => {
        if (pins.length > 0 && !driverPosition && mode === 'driver') {
            const startPin = pins[currentPinIndex] || pins[0];
            const startPos = { lat: startPin.lat, lng: startPin.lng };
            setDriverPosition(startPos);
            latestPositionRef.current = startPos; // ✅ ตั้งค่า ref ด้วย
        }
    }, [pins, currentPinIndex, mode]);

    if (pins.length === 0) {
        return <div>No pins provided</div>;
    }

    const mapCenter: [number, number] = driverPosition
        ? [driverPosition.lat, driverPosition.lng]
        : [pins[0].lat, pins[0].lng];

    const currentDestination = currentPinIndex < pins.length - 1
        ? pins[currentPinIndex + 1]
        : pins[pins.length - 1];

    return (
        <MapContainer
            center={mapCenter}
            zoom={15}
            scrollWheelZoom={false}
            zoomControl={false}
            className="w-full h-full"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {driverPosition && <MapCenter position={[driverPosition.lat, driverPosition.lng]} />}

            {/* ✅ แสดงเฉพาะหมุดปลายทาง (หมุดที่กำลังจะไป) */}
            {currentDestination && (
                <Marker position={[currentDestination.lat, currentDestination.lng]} icon={pinIcon}>
                    <Tooltip permanent direction="top" offset={[0, -40]}>
                        <div style={{ textAlign: 'center', fontSize: '12px' }}>
                            {currentPinIndex + 1 === pins.length - 1 ? (
                                <div style={{ color: '#dc2626', fontWeight: 'bold' }}>🔴 ปลายทาง</div>
                            ) : (
                                <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>📍 จุดถัดไป</div>
                            )}
                            <div>{currentDestination.name}</div>
                        </div>
                    </Tooltip>
                </Marker>
            )}

            {/* ✅ แสดงตำแหน่งคนขับ */}
            {driverPosition && (
                <Marker position={[driverPosition.lat, driverPosition.lng]} icon={driverIcon()}>
                    <Tooltip permanent direction="top" offset={[0, -10]}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                            {mode === 'driver' ? 'คุณ' : 'คนขับ'}
                        </div>
                    </Tooltip>
                </Marker>
            )}

            {/* แสดง routing ไปยังหมุดถัดไป */}
            {driverPosition && currentDestination && !isAtDestination && (
                <RoutingLayer
                    from={[driverPosition.lat, driverPosition.lng]}
                    to={[currentDestination.lat, currentDestination.lng]}
                    onRouteFound={(coords, distance, duration) => {
                        if (onRouteUpdate) {
                            onRouteUpdate(distance, duration);
                        }
                    }}
                />
            )}
        </MapContainer>
    );
}