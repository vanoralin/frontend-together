"use client";

import { MapContainer, TileLayer, Marker, Circle, useMapEvents, Tooltip } from "react-leaflet";
import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

function RouteLine({ locations }: { locations: LocationType[] }) {
    const map = useMap();

    useEffect(() => {
        if (locations.length < 2) return;

        const routingControl = L.Routing.control({
            waypoints: locations.map(loc =>
                L.latLng(loc.lat, loc.lng)
            ),
            lineOptions: {
                styles: [{ color: "#2563eb", weight: 4 }],
            },
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            show: false,

            createMarker: () => null,
        }).addTo(map);

        return () => {
            map.removeControl(routingControl);
        };
    }, [locations, map]);

    return null;
}


export interface LocationType {
    id?: number;
    name: string;
    lat: number;
    lng: number;
    [key: string]: any;
}

const pinIcon = new L.Icon({
    iconUrl: "/icon_pin_map.svg",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    shadowUrl: undefined,
});

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

interface MyLocationMapProps {
    locations?: LocationType[];
}

export default function MyLocationMap({ locations = [] }: MyLocationMapProps) {
    const [userLocation, setUserLocation] = useState<L.LatLngTuple | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(15);

    // แปลง error code เป็นข้อความ
    const getErrorMessage = (code: number) => {
        switch (code) {
            case 1:
                return "กรุณาอนุญาตการเข้าถึงตำแหน่ง";
            case 2:
                return "ไม่สามารถระบุตำแหน่งได้";
            case 3:
                return "ค้นหาตำแหน่งใช้เวลานานเกินไป";
            default:
                return "เกิดข้อผิดพลาดเกี่ยวกับ GPS";
        }
    };

    return (
        <div className="relative w-full h-full">
            <MapContainer
                center={userLocation ? userLocation : [13.7563, 100.5018]}
                zoom={16}
                style={{ height: "100%", minHeight: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
                />
                <ZoomWatcher setZoom={setZoom} />
                {/* {pos && (
                    <>
                        <Marker position={[pos.lat, pos.lng]} icon={pinIcon} />
                        <Circle
                            center={[pos.lat, pos.lng]}
                            radius={pos.accuracy || 20}
                            pathOptions={{ color: "blue", fillOpacity: 0.2 }}
                        />
                        <FollowMe lat={pos.lat} lng={pos.lng} />
                    </>
                )} */}

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

                {locations.map((loc, index) => {
                    const isStart = index === 0;
                    const isEnd = index === locations.length - 1;

                    return (
                        <Marker
                            key={loc.id ?? index}
                            position={[loc.lat, loc.lng]}
                            icon={pinIcon}
                        >
                            {(isStart || isEnd) && (
                                <Tooltip
                                    permanent
                                    direction="top"
                                    offset={[0, -25]}
                                    className="font-medium text-theme-orange"
                                >
                                    {isStart && "จุดเริ่มต้น"}
                                    {isEnd && "จุดสิ้นสุด"}
                                </Tooltip>
                            )}
                        </Marker>
                    );
                })}


                <RouteLine locations={locations} />


            </MapContainer>

            {/* {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow">
                    {error}
                </div>
            )} */}

            {/* DEBUG PANEL */}


            {userLocation ? (
                <>
                    {/* <div>lat: {userLocation[0].toFixed(6)}</div>
                        <div>lng: {userLocation[1].toFixed(6)}</div> */}
                </>
            ) : (
                <div className="text-yellow-300">⏳ รอข้อมูลตำแหน่ง...</div>
            )}

            {error && (
                <div className="text-red-400">⚠️ {error}</div>
            )}


        </div>
    );
}
