'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import { CardTrip } from "@/app/components/trip_components";
import { BackButton, Header } from "@/app/components/share_component";

interface Reservation {
    seats: number;
    status: string; // เช่น "pending_driver_confirmation", "confirmed" ฯลฯ
}

interface TripData {
    id: number;
    driver: { id: number; name: string };
    path: { id: number; name: string; locations: { id: number; name: string }[] };
    driver_vehicle?: { vehicle_type: string; model_vehicle?: string; license_plate?: string };
    amount: number;
    status: string;
    capacity?: number;
    scheduled_start_time: string;
    reservations?: Reservation[];
}

export default function Page() {
    const [trips, setTrips] = useState<TripData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<"pending" | "confirmed">("pending");

    useEffect(() => {
        const fetchTrips = async () => {
            setLoading(true);
            try {
                const statuses: TripData["status"][] = ["available", "booked"];
                const requests = statuses.map(status =>
                    axios.get<TripData[]>("/api/trips/view/status", { params: { status } })
                );

                const results = await Promise.all(requests);
                const combinedTrips = results.flatMap(res => res.data); // รวม array
                setTrips(combinedTrips);
            } catch (err) {
                console.error("Error fetching trips:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, []);

    const filteredTrips = trips.filter(trip => {
        const hasPending = trip.reservations?.some(r => r.status === "pending_driver_confirmation");
        return filterType === "pending" ? hasPending : !hasPending;
    });

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    };

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleTimeString("th-TH", { hour12: false, hour: "2-digit", minute: "2-digit" });
    };



    return (
        <main className="min-h-screen bg-theme-driver">
            <div className="px-4 pb-20">
                <BackButton />
                <h1 className="text-2xl font-medium text-center pt-12 pb-6">รายการทริปของฉัน</h1>

                {/* ตัวเลือก filter type */}
                <div className="flex gap-2 mb-4">
                    <button
                        className={`px-3 py-1 rounded ${filterType === "pending" ? "bg-theme-orange text-white" : "bg-theme-light-gray text-theme-gray"}`}
                        onClick={() => setFilterType("pending")}
                    >
                        รอการยืนยัน
                    </button>
                    <button
                        className={`px-3 py-1 rounded ${filterType === "confirmed" ? "bg-theme-orange text-white" : "bg-theme-light-gray text-theme-gray"}`}
                        onClick={() => setFilterType("confirmed")}
                    >
                        ยืนยันแล้ว
                    </button>
                </div>

                {loading ? (
                    <p>กำลังโหลด...</p>
                ) : filteredTrips.length === 0 ? (
                    <p>ไม่มีทริปในรายการนี้</p>
                ) : (
                    filteredTrips.map((trip) => (
                        <CardTrip
                            key={trip.id}
                            datetime={trip.scheduled_start_time}
                            pickup={trip.path.locations[0]?.name || "-"}
                            dropoff={trip.path.locations[1]?.name || "-"}
                            vehicle={trip.driver_vehicle?.vehicle_type || "-"}
                            model_vehicle={trip.driver_vehicle?.model_vehicle || "-"}
                            license_plate={trip.driver_vehicle?.license_plate || "-"}
                            status={trip.reservations?.some(r => r.status === "pending_driver_confirmation") ? "รอการยืนยัน" : "ยืนยันแล้ว"}
                            people={trip.reservations?.reduce(
                                (acc, r) => acc + ((r.status === "confirmed") ? r.seats : 0),
                                0
                            ) || 0}
                            price={trip.amount}
                            mode="link"
                            href={`../trip/${trip.id}`}
                        />
                    ))
                )}
            </div>
        </main>
    );
}
