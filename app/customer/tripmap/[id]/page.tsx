"use client"

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
// import BottomSheet from "../../components/BottomSheet";
import { motion } from "framer-motion";
import { LocationShowBox, VehicleType } from "@/app/components/trip_components";
import { BackButton } from "@/app/components/share_component";
import NavigationMap from "@/app/components/NavigationMap";
import dynamic from "next/dynamic";

// ✅ Dynamic import NavigationMap เพื่อป้องกัน SSR error
const DynamicNavigationMap = dynamic(
    () => import("@/app/components/NavigationMap"),
    { ssr: false }
);

interface BottomSheetProps {
    trip: TripDetail;
    type?: "page" | "map";
    children?: React.ReactNode;
    showtext?: string;
    routeInfo?: { distance: number; duration: number } | null; // 👈 เพิ่มบรรทัดนี้
}


export function BottomSheet({ trip, type = "map", children, showtext, routeInfo }: BottomSheetProps) {

    const [expanded, setExpanded] = useState(false);

    const content = (
        <div className="p-4">
            {type === "map" && (
                <div className="flex flex-col justify-between items-start">
                    <p className="font-medium text-xl">{showtext}</p>
                    {routeInfo && (
                        <p>
                            {(routeInfo.distance / 1000).toFixed(1)} km | {(routeInfo.duration / 60).toFixed(0)} นาที
                        </p>
                    )}
                </div>
            )}

            <div className="flex justify-between mt-3">
                <div>
                    <p className="font-medium">{trip.vehicle?.license_plate || "ไม่ระบุ"}</p>
                    <p>{trip.vehicle?.model_vehicle || ""}</p>
                    <VehicleType
                        type={trip.vehicle?.vehicle_type || ""}
                        className="text-sm"
                    />
                </div>
                <img src={`/example_${trip.vehicle?.vehicle_type}.png`} alt="veh pic" className="w-35 rounded-md object-cover" />
            </div>

            <div className="flex justify-between items-center mt-4 border-y py-3 border-gray-300 w-full">
                <div className="flex gap-3 items-center">
                    <img
                        src={trip.driver_profile_picture_url || "/null_profile.png"}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/null_profile.png";
                        }}
                    />
                    <div>
                        <p>{trip.driver?.name || "ไม่ระบุคนขับ"}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <img src="/icon_phone_bg.svg" alt="" className="w-8 h-8 object-contain" />
                    <img src="/icon_chat_bg.svg" alt="" className="w-8 h-8 object-contain" />
                </div>
            </div>

            <div className="mt-4 space-y-3 pt-2 text-sm">
                {/* 🔹 แสดง children ก่อน "รายละเอียด" ถ้าย่อ */}
                {!expanded && children}

                <div className="flex justify-between">
                    <h1 className="font-medium text-xl">รายละเอียด</h1>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            {trip.seats}
                            <img
                                src="/icon_nav_profile.svg"
                                alt="profile"
                                className="w-6 h-6 object-contain"
                                style={{ filter: "brightness(0) invert(50%)" }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg space-y-3 mt-6 w-full max-w-md mb-10">
                    <LocationShowBox value={trip.pickup_location.name || ""} />
                    <LocationShowBox value={trip.dropoff_location.name || ""} />
                </div>

                {/* 🔹 แสดง children หลังสุด ถ้าเต็ม */}
                {expanded && children}
            </div>
        </div>
    );


    return (
        <>
            {type === "page" ? (
                <motion.div
                    className="bg-white shadow-lg overflow-auto w-full h-full rounded-none"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {content}
                </motion.div>
            ) : (
                <motion.div
                    className="absolute left-0 right-0 bottom-0 bg-white shadow-lg rounded-t-2xl overflow-hidden"
                    animate={{ height: expanded ? "70vh" : "40vh" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <div
                        className="w-12 h-1.5 bg-theme-light-gray rounded-full mx-auto mt-2 mb-2 cursor-pointer"
                        onClick={() => setExpanded(!expanded)}
                    />
                    {content}
                </motion.div>
            )}
        </>
    );
}


interface TripDetail {
    id: number;
    trip_id: number;
    pickup_location: { name: string; lat: number; lng: number; id: number };
    dropoff_location: { name: string; lat: number; lng: number; id: number };
    scheduled_start_time: string;
    seats: number;
    vehicle?: { vehicle_type?: string; model_vehicle?: string; license_plate?: string };
    driver?: { name: string };
    passenger?: { name?: string };
    driver_profile_picture_url?: string;
    trip_status?: string;
    status?: string;
    amount?: number;
}

interface Location {
    id?: number;
    name: string;
    lat: number;
    lng: number;
}

export default function TripMapPage() {
    const pathname = usePathname();
    const router = useRouter();
    const idFromPath = pathname?.split("/").pop();
    const tripId = Number(idFromPath);

    const [trip, setTrip] = useState<TripDetail | null>(null);
    const [boardingDone, setBoardingDone] = useState(false);
    const [loading, setLoading] = useState(false);
    const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const res = await axios.get("/api/reservations/history");
                const data = Array.isArray(res.data) ? res.data : [];
                const found = data.find((t: any) => t.id === tripId);
                if (found) {
                    setTrip({
                        id: found.id,
                        trip_id: found.trip_id,
                        pickup_location: found.pickup_location,
                        dropoff_location: found.dropoff_location,
                        scheduled_start_time: found.scheduled_start_time,
                        seats: found.seats,
                        vehicle: found.vehicle,
                        driver: found.driver,
                        passenger: found.passenger,
                        driver_profile_picture_url: found.driver_profile_picture_url,
                        trip_status: found.trip_status,
                        status: found.status,
                        amount: found.amount,
                    });
                }
            } catch (err) {
                console.error("Error fetching trip:", err);
            }
        };

        if (tripId) fetchTrip();
    }, [tripId]);

    if (!trip) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">กำลังโหลดทริป...</p>
            </div>
        );
    }

    const handleButtonClick = async () => {
        if (!trip) return;

        setLoading(true);
        try {
            if (!boardingDone) {
                // กดขึ้นรถ
                await axios.post(`/api/reservation/${trip.id}/boarding`);
                setBoardingDone(true);
            } else {
                // กดถึงที่หมาย
                await axios.post(`/api/trips/confirm/${trip.trip_id}/passenger`, {
                    current_location_id: trip.dropoff_location.id
                });

                // redirect ไปหน้า endtrip พร้อมส่ง trip_id
                router.push(`/customer/endtrip?id=${trip.trip_id}`);
            }
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    let statusMessage = "";
    if (trip.status === "confirmed") {
        statusMessage = "คนขับกำลังเดินทางไปยังที่หมาย";
    } else if (trip.status === "in_progress") {
        statusMessage = "คนขับกำลังเดินทางไปยังที่หมาย";
    }

    // ✅ สร้าง pins array สำหรับ NavigationMap
    const pins: Location[] = [
        {
            id: trip.pickup_location.id,
            name: trip.pickup_location.name,
            lat: trip.pickup_location.lat,
            lng: trip.pickup_location.lng,
        },
        {
            id: trip.dropoff_location.id,
            name: trip.dropoff_location.name,
            lat: trip.dropoff_location.lat,
            lng: trip.dropoff_location.lng,
        }
    ];

    return (
        <div className="relative w-full h-screen bg-theme-customer">
            <BackButton />

            {trip && (
                <div className="absolute top-0 left-0 right-0 bottom-32">
                    {/* ✅ ใช้ NavigationMap แทน TripMap */}
                    <DynamicNavigationMap
                        tripId={trip.trip_id}
                        pins={pins}
                        mode="customer"
                        currentPinIndex={0}
                        onRouteUpdate={(distance, duration) => {
                            setRouteInfo({ distance, duration });
                        }}
                        onPinReached={() => {
                            console.log("Driver reached destination");
                        }}
                    />
                </div>
            )}

            <BottomSheet trip={trip} type="map" showtext={statusMessage} routeInfo={routeInfo}>
                {/* ✅ แสดงข้อมูล route (optional) */}
                {/* {routeInfo && (
                    <div className="text-sm text-gray-600 mb-2">
                        ระยะทาง: {(routeInfo.distance / 1000).toFixed(1)} km |
                        เวลา: {(routeInfo.duration / 60).toFixed(0)} นาที
                    </div>
                )} */}

                <button
                    className="w-full bg-theme-orange text-white py-2 rounded-xl mt-2 disabled:opacity-50"
                    onClick={handleButtonClick}
                    disabled={loading}
                >
                    {boardingDone ? "ถึงที่หมายแล้ว" : "ฉันขึ้นรถมาแล้ว"}
                </button>
                <p className="text-sm text-gray-500 mt-1">
                    {boardingDone
                        ? "กดปุ่มเพื่อยืนยันว่าคุณถึงแล้ว"
                        : "กดปุ่มเพื่อยืนยันว่าคุณขึ้นรถแล้ว"}
                </p>
            </BottomSheet>
        </div>
    );
}