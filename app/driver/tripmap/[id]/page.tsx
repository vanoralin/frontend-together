'use client';

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";
import { PinName } from "@/app/components/trip_components";
import NavigationMap from "@/app/components/NavigationMap";

interface LocationType {
    id?: number;
    name: string;
    lat: number;
    lng: number;
}

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
    const tripId = Number(params.id);

    const [trip, setTrip] = useState<TripData | null>(null);
    const [currentPinIndex, setCurrentPinIndex] = useState(0);
    const [started, setStarted] = useState(false);
    const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);

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
        setCurrentPinIndex(0);

        try {
            // await fetch(`/api/trips/${tripId}/start`, { method: 'POST' });
            setTrip(prev => prev ? { ...prev, status: "in_progress" } : prev);
        } catch (error) {
            console.error("Error starting trip:", error);
        }
    };

    const goNext = () => {
        if (!trip) return;

        if (currentPinIndex + 1 < trip.path.locations.length - 1) {
            // ไปหมุดถัดไป
            setCurrentPinIndex(prev => prev + 1);
        } else {
            // หมุดสุดท้าย - จบทริป
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

    const locations = trip.path.locations;
    const currentLocation = locations[currentPinIndex];
    const nextLocation = currentPinIndex < locations.length - 1
        ? locations[currentPinIndex + 1]
        : null;

    // Current location info
    const currentHasAction = hasPickupOrDropoff(currentLocation?.id);
    const currentPickupCount = trip.reservations?.filter(r => r.pickup_location_id === currentLocation?.id).reduce((sum, r) => sum + (r.seats || 0), 0) || 0;
    const currentDropoffCount = trip.reservations?.filter(r => r.dropoff_location_id === currentLocation?.id).reduce((sum, r) => sum + (r.seats || 0), 0) || 0;

    // Next location info
    const nextHasAction = nextLocation ? hasPickupOrDropoff(nextLocation?.id) : false;
    const nextPickupCount = nextLocation
        ? trip.reservations?.filter(r => r.pickup_location_id === nextLocation?.id).reduce((sum, r) => sum + (r.seats || 0), 0) || 0
        : 0;
    const nextDropoffCount = nextLocation
        ? trip.reservations?.filter(r => r.dropoff_location_id === nextLocation?.id).reduce((sum, r) => sum + (r.seats || 0), 0) || 0
        : 0;

    // Enable button when distance <= 100m
    const isButtonEnabled = routeInfo && routeInfo.distance <= 100;

    return (
        <div className="flex flex-col h-screen">
            {!started && <BackButton />}

            <div className="flex-1 relative">
                {!started ? (
                    // Before starting - แสดงแผนที่แบบธรรมดา
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <p className="text-gray-500">พร้อมเริ่มต้นการเดินทาง</p>
                    </div>
                ) : (
                    // After starting - ใช้ NavigationMap
                    <NavigationMap
                        tripId={tripId}
                        pins={locations}
                        mode="driver"
                        currentPinIndex={currentPinIndex}
                        onRouteUpdate={(distance, duration) => {
                            setRouteInfo({ distance, duration });
                        }}
                        onPinReached={() => {
                            console.log("Reached pin!");
                            // ไม่ต้องทำอะไร - รอให้ driver กดปุ่ม
                        }}
                    />
                )}
            </div>

            <div className="bg-white w-full max-w-[390px] mx-auto p-4 z-50 shadow-lg rounded-t-xl">
                {!started ? (
                    // ก่อนเริ่มทริป
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <h2 className="font-semibold text-lg mb-2">จุดออกเดินทาง</h2>
                            <PinName location={currentLocation.name} />

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

                        {nextLocation && (
                            <>
                                <div className="mb-4 bg-blue-50 rounded-lg p-3">
                                    <h2 className="text-lg mb-2 font-semibold">จุดหมาย</h2>
                                    <PinName location={nextLocation.name} />

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
                    // หลังเริ่มทริป
                    <>
                        <div className="mb-3">
                            <div className="text-xs text-gray-500">
                                หมุดที่ {currentPinIndex + 2}/{locations.length}
                            </div>
                        </div>

                        {nextLocation && routeInfo && (
                            <div className="text-gray-600 bg-gray-50 p-3 rounded">
                                <h2 className="font-semibold text-lg mb-2 text-theme-black">
                                    {`จุดหมายถัดไป (${(routeInfo.distance / 1000).toFixed(1)} km | ${(routeInfo.duration / 60).toFixed(0)} นาที)`}
                                </h2>
                                <PinName location={nextLocation.name} />

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
                                        ? (currentPinIndex + 1 >= locations.length - 1
                                            ? "bg-green-500 hover:bg-green-600"
                                            : "bg-theme-orange hover:bg-orange-600")
                                        : "bg-gray-300 cursor-not-allowed"}
                                `}
                            >
                                {currentPinIndex + 1 >= locations.length - 1
                                    ? "เสร็จสิ้นการเดินทาง"
                                    : "มาถึงหมุดนี้แล้ว"}
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