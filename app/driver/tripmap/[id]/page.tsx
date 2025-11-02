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

interface RouteInstruction {
    text: string;
    distance: number;
    time: number;
    type: string;
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
    const [currentInstruction, setCurrentInstruction] = useState<RouteInstruction | null>(null);

    const [showCompletePopup, setShowCompletePopup] = useState(false);
    const [countdown, setCountdown] = useState(3);

    // Fetch trip data
    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const res = await fetch(`/api/trips/view/${tripId}`);
                const data = await res.json();
                setTrip(data);
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

    const startTrip = async () => {
        if (!trip) return;
        setStarted(true);
        setCurrentIndex(0);

        try {
            await fetch(`/api/trips/${tripId}/start`, { method: 'POST' });
            setTrip(prev => prev ? { ...prev, status: "in_progress" } : prev);
        } catch (error) {
            console.error("Error starting trip:", error);
        }
    };

    const goNext = () => {
        if (!trip) return;

        if (currentIndex + 1 < trip.path.locations.length - 1) {
            setCurrentIndex(currentIndex + 1);
            if (routeInfoRef.current) setRouteInfo(routeInfoRef.current);
            setCurrentInstruction(null);
        } else {
            setShowCompletePopup(true);
            setCountdown(3);

            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        router.push("/driver/home");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };

    if (!trip) return <p>กำลังโหลดข้อมูลทริป...</p>;

    const current = trip.path.locations[currentIndex];
    const next = currentIndex < trip.path.locations.length - 1
        ? trip.path.locations[currentIndex + 1]
        : null;

    // Current location info
    const currentHasAction = hasPickupOrDropoff(current?.id);
    const currentPickupCount = trip.reservations?.filter(r => r.pickup_location_id === current?.id).reduce((sum, r) => sum + (r.seats || 0), 0) || 0;
    const currentDropoffCount = trip.reservations?.filter(r => r.dropoff_location_id === current?.id).reduce((sum, r) => sum + (r.seats || 0), 0) || 0;

    // Next location info
    const nextHasAction = next ? hasPickupOrDropoff(next?.id) : false;
    const nextPickupCount = next
        ? trip.reservations?.filter(r => r.pickup_location_id === next?.id).reduce((sum, r) => sum + (r.seats || 0), 0) || 0
        : 0;
    const nextDropoffCount = next
        ? trip.reservations?.filter(r => r.dropoff_location_id === next?.id).reduce((sum, r) => sum + (r.seats || 0), 0) || 0
        : 0;

    // Get direction icon based on instruction type
    const getDirectionIcon = (type: string) => {
        const types: { [key: string]: string } = {
            'Straight': '⬆️',
            'SlightRight': '↗️',
            'Right': '➡️',
            'SharpRight': '↘️',
            'TurnAround': '🔄',
            'SharpLeft': '↙️',
            'Left': '⬅️',
            'SlightLeft': '↖️',
            'WaypointReached': '📍',
            'Roundabout': '🔁',
            'DestinationReached': '🏁'
        };
        return types[type] || '➡️';
    };

    // FIX #1: Use stable reference for button enable/disable
    // Only enable button when distance is <= 100m
    const isButtonEnabled = routeInfo && routeInfo.distance <= 100;

    return (
        <div className="flex flex-col h-screen">
            {!started && <BackButton />}

            <div className="flex-1 relative">
                {!started ? (
                    <RouteMap
                        tripId={trip.id}
                        current={current}
                        next={current}
                        isStarted={false}
                        isDriver={true}
                        allLocations={trip.path.locations}
                        onRouteData={() => { }}
                    />
                ) : (
                    next && (
                        <>
                            <RouteMap
                                tripId={trip.id}
                                current={current}
                                next={next}
                                isStarted={started}
                                isDriver={true}
                                allLocations={trip.path.locations}
                                onRouteData={(distance, duration, instructions, instruction) => {
                                    // FIX #1: Only update if values actually changed
                                    if (routeInfoRef.current?.distance !== distance ||
                                        routeInfoRef.current?.duration !== duration) {
                                        routeInfoRef.current = { distance, duration };
                                        setRouteInfo({ distance, duration });
                                    }

                                    if (instruction && instruction !== currentInstruction) {
                                        setCurrentInstruction(instruction);
                                    }
                                }}
                            />

                            {/* Google Maps style navigation banner at top */}
                            {currentInstruction && (
                                <div className="absolute top-4 left-4 right-4 z-[1000] max-w-[390px] mx-auto">
                                    <div className="bg-white rounded-lg shadow-xl p-4 flex items-center gap-3">
                                        <div className="text-3xl flex-shrink-0">
                                            {getDirectionIcon(currentInstruction.type)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-lg font-semibold text-gray-900">
                                                {currentInstruction.text}
                                            </p>
                                            {currentInstruction.distance > 0 && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    ใน {currentInstruction.distance < 1000
                                                        ? `${currentInstruction.distance.toFixed(0)} ม.`
                                                        : `${(currentInstruction.distance / 1000).toFixed(1)} กม.`}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )
                )}
            </div>

            <div className="bg-white w-full max-w-[390px] mx-auto p-4 z-50 shadow-lg rounded-t-xl">
                {!started ? (
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <h2 className="font-semibold text-lg mb-2">จุดออกเดินทาง</h2>
                            <PinName location={current.name} />

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
                                <div className="mb-4 bg-blue-50 rounded-lg p-3">
                                    <h2 className="text-lg mb-2 font-semibold">จุดหมาย</h2>
                                    <PinName location={next.name} />

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
                    <>
                        <div className="mb-3">
                            <div className="text-xs text-gray-500">
                                หมุดที่ {currentIndex + 2}/{trip.path.locations.length}
                            </div>
                        </div>

                        {next && routeInfo && (
                            <div className="text-gray-600 bg-gray-50 p-3 rounded">
                                <h2 className="font-semibold text-lg mb-2 text-theme-black">
                                    {`จุดหมาย (${(routeInfo.distance / 1000).toFixed(1)} km | ${(routeInfo.duration / 60).toFixed(0)} นาที)`}
                                </h2>
                                <PinName location={next?.name} />

                                {nextHasAction && (
                                    <div className="mt-2 space-y-2">
                                        {nextPickupCount > 0 && (
                                            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                                                <img
                                                    src="/icon_nav_profile.svg"
                                                    alt="pickup"
                                                    className="w-5 h-5"
                                                    style={{ filter: "brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)" }}
                                                />
                                                <span className="text-green-700 font-medium">รับผู้โดยสาร: {nextPickupCount} คน</span>
                                            </div>
                                        )}
                                        {nextDropoffCount > 0 && (
                                            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                                                <img
                                                    src="/icon_nav_profile.svg"
                                                    alt="dropoff"
                                                    className="w-5 h-5"
                                                    style={{ filter: "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)" }}
                                                />
                                                <span className="text-red-700 font-medium">ส่งผู้โดยสาร: {nextDropoffCount} คน</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-center mt-4">
                            <button
                                onClick={goNext}
                                disabled={!isButtonEnabled}
                                className={`px-6 py-3 rounded-lg text-white font-medium transition-colors
                                    ${isButtonEnabled
                                        ? (currentIndex + 1 >= trip.path.locations.length - 1
                                            ? "bg-green-500 hover:bg-green-600"
                                            : "bg-theme-orange hover:bg-orange-600")
                                        : "bg-gray-300 cursor-not-allowed"}
                                `}
                            >
                                {currentIndex + 1 >= trip.path.locations.length - 1
                                    ? "เสร็จสิ้นการเดินทาง"
                                    : "ถึงที่หมายแล้ว"}
                            </button>
                        </div>

                        {showCompletePopup && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                                <div className="bg-white rounded-lg p-6 shadow-lg text-center">
                                    <h2 className="text-xl font-semibold mb-2">เสร็จสิ้นการเดินทาง</h2>
                                    <p className="text-gray-600">กำลังนำคุณกลับไปหน้าหลักใน {countdown} วินาที...</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}