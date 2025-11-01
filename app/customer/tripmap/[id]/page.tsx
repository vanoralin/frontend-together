"use client"

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import BottomSheet from "../../components/BottomSheet";
import { BackButton } from "@/app/components/share_component";
import TripMap from "@/app/components/cus_RouteMap";

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

export default function TripMapPage() {
    const pathname = usePathname();
    const idFromPath = pathname?.split("/").pop();
    const tripId = Number(idFromPath);

    const [trip, setTrip] = useState<TripDetail | null>(null);
    const [boardingDone, setBoardingDone] = useState(false); // track if passenger boarded
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
                // redirect หลังจากถึงที่หมาย
                router.push("/driver/home"); // เปลี่ยนเป็นหน้า overview หรือหน้าที่ต้องการ
            }
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    let statusMessage = "";
    if (trip.status === "confirmed") {
        statusMessage = "คนขับกำลังไปรับคุณ";
    } else if (trip.status === "in_progress") {
        statusMessage = "คนขับกำลังเดินทางไปยังที่หมาย";
    }

    return (
        <div className="relative w-full h-screen bg-theme-customer">
            <BackButton />
           
            {trip && (
                <div className="absolute top-0 left-0 right-0 bottom-32">
                    <TripMap
                        tripId={trip.trip_id}
                        pickup={trip.pickup_location}
                        dropoff={trip.dropoff_location}
                    />
                </div>
            )}

            <BottomSheet trip={trip} type="map" showtext={statusMessage}>
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
