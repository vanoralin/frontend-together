'use client';

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { LocationType } from "../../../components/RouteMap";
import { useParams, useRouter } from "next/navigation";
import { BackButton, Header } from "@/app/components/share_component";
import { PinName } from "@/app/components/trip_components";

const RouteMap = dynamic(() => import("../../../components/RouteMap"), { ssr: false });

interface TripData {
    id: number;
    path: { locations: LocationType[] };
    driver_vehicle?: { vehicle_type: string; model_vehicle?: string; license_plate?: string };
    status: string;
    capacity?: number;
    reservations?: { seats?: number, pickup_location_id: number, dropoff_location_id: number }[];
    amount: number;
    trip_type: string;
    scheduled_start_time: string;
}

export default function TripMapPage() {
    const params = useParams();
    const router = useRouter();
    const tripId = params.id;

    const [trip, setTrip] = useState<TripData | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [started, setStarted] = useState(false);
    const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
    const routeInfoRef = useRef<{ distance: number; duration: number } | null>(null);

    // Fetch trip data
    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const res = await fetch(`/api/trips/view/${tripId}`);
                const data = await res.json();
                setTrip(data);
                // Don't auto-start, let user click button
                setStarted(false);
            } catch (err) {
                console.error("Error fetching trip:", err);
            }
        };
        fetchTrip();
    }, [tripId]);

    // Check if a location has pickup or dropoff
    const hasPickupOrDropoff = (locationId: number | undefined) => {
        if (!trip?.reservations || !locationId) return false;
        return trip.reservations.some(
            r => r.pickup_location_id === locationId || r.dropoff_location_id === locationId
        );
    };

    // Auto-advance when driver reaches a location without pickup/dropoff
    useEffect(() => {
        if (!started || !trip || currentIndex === 0) return; // Don't auto-advance at start

        const currentLocation = trip.path.locations[currentIndex];

        // Check if current location has no pickup/dropoff and is not the last location
        if (currentIndex < trip.path.locations.length - 1 &&
            !hasPickupOrDropoff(currentLocation.id)) {

            console.log(`Location ${currentLocation.name} has no pickup/dropoff, auto-advancing...`);

            // Auto-advance to next location after simulation reaches it
            const timer = setTimeout(() => {
                console.log(`Auto-advancing from ${currentIndex} to ${currentIndex + 1}`);
                setCurrentIndex(currentIndex + 1);
                if (routeInfoRef.current) setRouteInfo(routeInfoRef.current);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [currentIndex, started, trip]);

    const startTrip = async () => {
        if (!trip) return;
        setStarted(true);
        setCurrentIndex(0); // Start at first location

        // Update trip status
        try {
            await fetch(`/api/trips/${tripId}/start`, { method: 'POST' });
            setTrip(prev => prev ? { ...prev, status: "in_progress" } : prev);
        } catch (error) {
            console.error("Error starting trip:", error);
        }
    };

    const goNext = () => {
        if (!trip) return;

        if (currentIndex < trip.path.locations.length - 1) {
            setCurrentIndex(currentIndex + 1);
            if (routeInfoRef.current) setRouteInfo(routeInfoRef.current);
        } else {
            alert("เสร็จสิ้นการเดินทาง!");
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            if (routeInfoRef.current) setRouteInfo(routeInfoRef.current);
        }
    };

    if (!trip) return <p>กำลังโหลดข้อมูลทริป...</p>;

    const fromName = trip.path.locations[0]?.name || "-";
    const toName = trip.path.locations[trip.path.locations.length - 1]?.name || "-";

    const current = trip.path.locations[currentIndex];
    const next = currentIndex < trip.path.locations.length - 1
        ? trip.path.locations[currentIndex + 1]
        : null;

    // Current location info
    const currentHasAction = hasPickupOrDropoff(current?.id);
    const currentPickupCount = trip.reservations?.filter(r => r.pickup_location_id === current?.id).reduce((sum, r) => sum + (r.seats || 0), 0) || 0;
    const currentDropoffCount = trip.reservations?.filter(r => r.dropoff_location_id === current?.id).reduce((sum, r) => sum + (r.seats || 0), 0) || 0;

    // For display purposes (during movement)
    const displayLocation = started ? (currentIndex === 0 ? next : current) : current;
    const displayHasAction = started && currentIndex > 0 ? hasPickupOrDropoff(current?.id) : false;
    const displayPickupCount = started && currentIndex > 0
        ? trip.reservations?.filter(r => r.pickup_location_id === current?.id).reduce((sum, r) => sum + (r.seats || 0), 0) || 0
        : 0;
    const displayDropoffCount = started && currentIndex > 0
        ? trip.reservations?.filter(r => r.dropoff_location_id === current?.id).reduce((sum, r) => sum + (r.seats || 0), 0) || 0
        : 0;

    // Next location info
    const nextHasAction = next ? hasPickupOrDropoff(next?.id) : false;
    const nextPickupCount = next
        ? trip.reservations?.filter(r => r.pickup_location_id === next?.id).reduce((sum, r) => sum + (r.seats || 0), 0) || 0
        : 0;
    const nextDropoffCount = next
        ? trip.reservations?.filter(r => r.dropoff_location_id === next?.id).reduce((sum, r) => sum + (r.seats || 0), 0) || 0
        : 0;

    return (
        <div className="flex flex-col h-screen">
            <BackButton />

            <div className="flex-1">
                {!started ? (
                    // Before start
                    <RouteMap
                        tripId={trip.id}
                        current={current}
                        next={current}
                        isStarted={false}
                        isDriver={true}
                        onRouteData={() => { }}
                    />
                ) : (
                    // After start
                    next && (
                        <RouteMap
                            tripId={trip.id}
                            current={current}
                            next={next}
                            isStarted={started}
                            isDriver={true}
                            onRouteData={(distance, duration) => {
                                routeInfoRef.current = { distance, duration };
                                setRouteInfo({ distance, duration });
                            }}
                        />
                    )
                )}
            </div>

            <div className="bg-white w-full max-w-[390px] mx-auto p-4 z-50 shadow-lg rounded-t-xl">
                {!started ? (
                    // Before starting
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <h2 className="font-semibold text-lg mb-2">จุดออกเดินทาง</h2>
                            <PinName location={current.name} />

                            {/* Show pickup/dropoff at starting location */}
                            {currentHasAction && (
                                <div className="mt-2 space-y-1">
                                    {currentPickupCount > 0 && (
                                        <div className="flex items-center gap-2 text-sm p-2 bg-green-50 rounded">
                                            <img
                                                src="/icon_nav_profile.svg"
                                                alt="pickup"
                                                className="w-4 h-4"
                                                style={{ filter: "brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)" }}
                                            />
                                            <span className="text-green-700">รับผู้โดยสาร: {currentPickupCount} คน</span>
                                        </div>
                                    )}
                                    {currentDropoffCount > 0 && (
                                        <div className="flex items-center gap-2 text-sm p-2 bg-red-50 rounded">
                                            <img
                                                src="/icon_nav_profile.svg"
                                                alt="dropoff"
                                                className="w-4 h-4"
                                                style={{ filter: "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)" }}
                                            />
                                            <span className="text-red-700">ส่งผู้โดยสาร: {currentDropoffCount} คน</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {next && (
                            <>
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <div className="text-sm text-gray-600 mb-1">หมุดถัดไป:</div>
                                    <div className="font-medium text-blue-900">{next.name}</div>

                                    {nextHasAction && (
                                        <div className="mt-2 space-y-1">
                                            {nextPickupCount > 0 && (
                                                <div className="flex items-center gap-2 text-sm text-green-700">
                                                    <img
                                                        src="/icon_nav_profile.svg"
                                                        alt="pickup"
                                                        className="w-4 h-4"
                                                        style={{ filter: "brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)" }}
                                                    />
                                                    <span>รับ: {nextPickupCount} คน</span>
                                                </div>
                                            )}
                                            {nextDropoffCount > 0 && (
                                                <div className="flex items-center gap-2 text-sm text-red-700">
                                                    <img
                                                        src="/icon_nav_profile.svg"
                                                        alt="dropoff"
                                                        className="w-4 h-4"
                                                        style={{ filter: "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)" }}
                                                    />
                                                    <span>ส่ง: {nextDropoffCount} คน</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={startTrip}
                                    className="w-full px-6 py-3 rounded-lg text-white bg-theme-orange hover:bg-orange-600 transition-colors"
                                >
                                    เริ่มต้นการเดินทาง
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    // After starting
                    <>
                        <div className="mb-3">
                            <div className="text-xs text-gray-500">
                                หมุดที่ {currentIndex + 1} จาก {trip.path.locations.length}
                            </div>
                            <h2 className="font-semibold text-lg">
                                {displayHasAction ? "หมุดปัจจุบัน" : "กำลังผ่าน"}
                            </h2>
                            <PinName location={displayLocation?.name || current.name} />
                        </div>

                        {displayHasAction ? (
                            <>
                                {displayPickupCount > 0 && (
                                    <div className="flex items-center gap-2 mt-2 p-3 bg-green-50 rounded-lg">
                                        <img
                                            src="/icon_nav_profile.svg"
                                            alt="profile"
                                            className="w-5 h-5"
                                            style={{ filter: "brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)" }}
                                        />
                                        <div className="font-medium text-green-700">
                                            รับผู้โดยสาร: {displayPickupCount} คน
                                        </div>
                                    </div>
                                )}

                                {displayDropoffCount > 0 && (
                                    <div className="flex items-center gap-2 mt-2 p-3 bg-red-50 rounded-lg">
                                        <img
                                            src="/icon_nav_profile.svg"
                                            alt="profile"
                                            className="w-5 h-5"
                                            style={{ filter: "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)" }}
                                        />
                                        <div className="font-medium text-red-700">
                                            ส่งผู้โดยสาร: {displayDropoffCount} คน
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : currentIndex > 0 && (
                            <div className="flex items-center gap-2 mt-2 p-3 bg-blue-50 rounded-lg">
                                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div className="text-blue-700 text-sm">
                                    ผ่านจุดนี้ไปยังหมุดถัดไป...
                                </div>
                            </div>
                        )}

                        {next && routeInfo && (
                            <div className="mt-3 text-gray-600 text-sm bg-gray-50 p-2 rounded">
                                📍 หมุดถัดไป: <span className="font-medium">{next.name}</span>
                                <br />
                                ระยะทาง {(routeInfo.distance / 1000).toFixed(1)} km • {Math.ceil(routeInfo.duration / 60)} นาที

                                {/* Show next location pickup/dropoff */}
                                {nextHasAction && (
                                    <div className="mt-1 flex gap-2 flex-wrap">
                                        {nextPickupCount > 0 && (
                                            <span className="text-xs text-green-600">รับ: {nextPickupCount} คน</span>
                                        )}
                                        {nextDropoffCount > 0 && (
                                            <span className="text-xs text-red-600">ส่ง: {nextDropoffCount} คน</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {(displayHasAction || currentIndex === 0) && (
                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={goPrev}
                                    disabled={currentIndex === 0}
                                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                                >
                                    ก่อนหน้า
                                </button>
                                <button
                                    onClick={goNext}
                                    className={`px-4 py-2 rounded text-white ${currentIndex >= trip.path.locations.length - 1 ? "bg-green-500" : "bg-theme-orange"}`}
                                >
                                    {currentIndex >= trip.path.locations.length - 1 ? "เสร็จสิ้นการเดินทาง" : "ดำเนินการเสร็จสิ้น"}
                                </button>
                            </div>
                        )}

                        {!next && displayHasAction && (
                            <div className="text-center mt-2 text-green-600 font-medium">
                                🎉 นี่คือหมุดสุดท้าย
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}