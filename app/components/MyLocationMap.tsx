"use client";

import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";
import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const pinIcon = new L.Icon({
    iconUrl: "/icon_pin_map.svg",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
});

function FollowMe({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();

    useEffect(() => {
        map.setView([lat, lng], map.getZoom(), { animate: true });
    }, [lat, lng]);

    return null;
}

export default function MyLocationMap() {
    const [pos, setPos] = useState<{
        lat: number;
        lng: number;
        accuracy?: number;
    } | null>(null);

    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("อุปกรณ์ไม่รองรับ GPS");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setPos({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
                setError(null); // เคลียร์ error เมื่อได้ตำแหน่ง
            },
            (err) => {
                console.error("GPS error:", err.code, err.message);
                setError(getErrorMessage(err.code));
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000,
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    return (
        <div className="relative w-full h-full">
            <MapContainer
                center={pos ? [pos.lat, pos.lng] : [13.7563, 100.5018]}
                zoom={16}
                style={{ height: "100%", minHeight: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
                />

                {pos && (
                    <>
                        <Marker position={[pos.lat, pos.lng]} icon={pinIcon} />
                        <Circle
                            center={[pos.lat, pos.lng]}
                            radius={pos.accuracy || 20}
                            pathOptions={{ color: "blue", fillOpacity: 0.2 }}
                        />
                        <FollowMe lat={pos.lat} lng={pos.lng} />
                    </>
                )}
            </MapContainer>

            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow">
                    {error}
                </div>
            )}

            {/* DEBUG PANEL */}
            <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs p-3 rounded-lg space-y-1 z-[9999]">
                <div className="font-semibold">GPS DEBUG</div>

                {pos ? (
                    <>
                        <div>lat: {pos.lat.toFixed(6)}</div>
                        <div>lng: {pos.lng.toFixed(6)}</div>
                        <div>accuracy: {Math.round(pos.accuracy ?? 0)} m</div>
                        <div>time: {new Date().toLocaleTimeString()}</div>
                    </>
                ) : (
                    <div className="text-yellow-300">⏳ รอข้อมูลตำแหน่ง...</div>
                )}

                {error && (
                    <div className="text-red-400">⚠️ {error}</div>
                )}
            </div>

        </div>
    );
}
