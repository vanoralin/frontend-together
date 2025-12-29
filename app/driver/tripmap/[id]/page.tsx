'use client';

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BackButton, Popup } from "@/app/components/share_component";
import { LocationShowBox, PinName, PinPath } from "@/app/components/trip_components";
import NavigationMap from "@/app/components/NavigationMap";
import dynamic from "next/dynamic";

const MyLocationMap = dynamic(
    () => import("@/app/components/MyLocationMap"),
    { ssr: false }
);
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

    useEffect(() => {
        if (!showCompletePopup) return;
        if (countdown <= 0) {
            router.push("/driver/home");
            return;
        }

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, showCompletePopup, router]);

    const goNext = () => { //ไปหมุดถัดไป
        if (!trip) return;

        if (currentPinIndex + 1 < trip.path.locations.length - 1) {
            setCurrentPinIndex(prev => prev + 1);
        } else {
            //หมุดสุดท้าย - จบทริป
            finishTrip();
        }
    };

    const finishTrip = () => {
        setShowCompletePopup(true);
        setCountdown(3);
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
            {/* {!started && <BackButton />} */}

            <div className="flex-1 relative">
                {!started ? (
                    // Before starting - แสดงแผนที่แบบธรรมดา
                    // <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    //     <p className="text-gray-500">พร้อมเริ่มต้นการเดินทาง</p>
                    // </div>
                    <div className="flex-1 relative h-full">
                        <MyLocationMap locations={locations} />

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
                        }}
                    />
                )}
            </div>

            <div className="bg-white w-full max-w-[390px] mx-auto p-4 z-50 shadow-lg rounded-t-xl">
                {!started ? (
                    // +++1.ก่อนเริ่มทริป 
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <h2 className="font-semibold text-lg mb-2">จุดออกเดินทาง</h2>
                            {/* <PinName location={currentLocation.name} /> */}
                            <LocationShowBox value={currentLocation.name} />

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
                                <div className="mb-4 rounded-lg bg-gray-200 p-3">
                                    <h2 className="text-lg mb-2 font-semibold">จุดหมาย</h2>
                                    <PinName location={nextLocation.name} />
                                    {/* <LocationShowBox value={nextLocation.name} /> */}

                                    {nextHasAction && (
                                        <div className="mt-2 space-y-1">
                                            {nextPickupCount > 0 && (
                                                <div className="flex items-center gap-2 text-sm p-2 bg-green-50 rounded">
                                                    <img
                                                        src="/icon_nav_profile.svg"
                                                        alt="pickup"
                                                        className="w-4 h-4"
                                                        style={{ filter: "brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)" }}
                                                    />
                                                    <span className="text-green-700">รับผู้โดยสาร: {nextPickupCount} คน</span>
                                                </div>
                                            )}
                                            {nextDropoffCount > 0 && (
                                                <div className="flex items-center gap-2 text-sm p-2  rounded ">
                                                    <img
                                                        src="/icon_nav_profile.svg"
                                                        alt="dropoff"
                                                        className="w-4 h-4"
                                                        style={{ filter: "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)" }}
                                                    />
                                                    <span className="text-red-700">ส่งผู้โดยสาร: {nextDropoffCount} คน</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={startTrip}
                                    className="w-full px-6 py-3 rounded-lg text-white bg-theme-orange hover:bg-theme-second-orange transition-colors"
                                >
                                    เริ่มต้นการเดินทาง
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    //+++2.หลังเริ่มทริป++++
                    <>
                        <div className="mb-3">
                            <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                <span>จุดเดินทางที่</span>
                                <span className="font-medium text-gray-700">
                                    {currentPinIndex + 2}/{locations.length}
                                </span>
                            </div>
                        </div>

                        {nextLocation && routeInfo && (
                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">

                                {/* Location name */}
                                <div className="flex items-start gap-3">
                                    <img src="/icon_pin.svg" alt="" className="h-6 mt-1" />
                                    <div>
                                        <h2 className="text-lg font-bold text-theme-black leading-tight">
                                            {nextLocation.name}
                                        </h2>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {(routeInfo.distance / 1000).toFixed(1)} กม •{" "}
                                            {(routeInfo.duration / 60).toFixed(0)} นาที
                                        </div>
                                    </div>
                                </div>

                                {/* รับส่ง */}
                                {nextHasAction && (
                                    <div className="pt-3 space-y-2">

                                        {/* Pickup */}
                                        {nextPickupCount > 0 && (
                                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                                <img
                                                    src="/icon_nav_profile.svg"
                                                    alt="pickup"
                                                    className="w-5 h-5"
                                                    style={{
                                                        filter:
                                                            "brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)",
                                                    }}
                                                />
                                                <div className="text-green-700 font-medium">
                                                    รับผู้โดยสาร{" "}
                                                    <span className="font-bold">
                                                        {nextPickupCount}
                                                    </span>{" "}
                                                    คน
                                                </div>
                                            </div>
                                        )}

                                        {/* Dropoff */}
                                        {nextDropoffCount > 0 && (
                                            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                                                <img
                                                    src="/icon_nav_profile.svg"
                                                    alt="dropoff"
                                                    className="w-5 h-5"
                                                    style={{
                                                        filter:
                                                            "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)",
                                                    }}
                                                />
                                                <div className="text-red-700 font-medium">
                                                    ส่งผู้โดยสาร{" "}
                                                    <span className="font-bold">
                                                        {nextDropoffCount}
                                                    </span>{" "}
                                                    คน
                                                </div>
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
                                className={`flex-1 py-3 rounded-lg text-white font-medium transition-colors
                                    ${isButtonEnabled
                                        ? (currentPinIndex + 1 >= locations.length - 1
                                            ? "bg-theme-orange hover:bg-theme-second-orange"
                                            : "bg-theme-second-orange hover:bg-theme-light-gray")
                                        : "bg-gray-300 cursor-not-allowed"}
                                `}
                            >
                                {currentPinIndex + 1 >= locations.length - 1
                                    ? "เสร็จสิ้นการเดินทาง"
                                    : "มาถึงหมุดนี้แล้ว"}
                            </button>
                        </div>

                        {showCompletePopup && (
                            <Popup
                                title="การเดินทางเสร็จสิ้น"
                                image={<img src="/home_car.png" />}
                                description={`กำลังนำคุณกลับไปหน้าหลักใน ${countdown} วินาที...`}
                                actions={[]}
                                onClose={() => { }}
                            />

                        )}
                    </>
                )}
            </div>
        </div>
    );
}