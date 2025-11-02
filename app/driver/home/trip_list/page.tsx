'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import { CardTrip } from "@/app/components/trip_components";
import { BackButton, Header } from "@/app/components/share_component";

interface UserProfile {
    id: number;
    name: string;
    email: string;
    balance: number;
    role: string;
}

interface Location {
    id: number;
    name: string;
    lat: number;
    lng: number;
}

interface Reservation {
    seats: number;
    status: string;
}

interface TripData {
    id: number;
    driver: { id: number; name: string };
    path: {
        id: number;
        name: string;
        locations: Location[];
    };
    driver_vehicle?: {
        vehicle_type: string;
        model_vehicle?: string;
        license_plate?: string;
    };
    amount: number;
    status: string;
    capacity?: number;
    scheduled_start_time: string;
    reservations?: Reservation[];
    trip_type: string;
}

export default function Page() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [myTripIds, setMyTripIds] = useState<number[]>([]);
    const [trips, setTrips] = useState<TripData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<"pending" | "confirmed">("pending");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get<UserProfile>("/api/User/profile");
                setUser(res.data);
                return res.data;
            } catch (err) {
                console.error("Error fetching user profile:", err);
                return null;
            }
        };

        const fetchMyTripIds = async (userId: number) => {
            try {
                const statuses = ["available", "booked"];
                const allTrips: TripData[] = [];

                // ดึงทริปแต่ละสถานะ
                for (const s of statuses) {
                    const res = await axios.get<TripData[]>("/api/trips/view/status", {
                        params: { status: s }
                    });
                    if (res.data) allTrips.push(...res.data);
                }

                // กรองเฉพาะทริปที่ user คนนี้เป็น driver
                const myTrips = allTrips.filter(t => t.driver.id === userId);
                console.log("My trips as driver:", myTrips);

                // เก็บ trip IDs
                const tripIds = myTrips.map(t => t.id);
                setMyTripIds(tripIds);

                return tripIds;
            } catch (err) {
                console.error("Error fetching trip IDs:", err);
                return [];
            }
        };

        const fetchTripDetails = async (tripIds: number[]) => {
            try {
                // ดึงข้อมูลทริปแต่ละ ID
                const tripDetailPromises = tripIds.map(id =>
                    axios.get<TripData>(`/api/trips/view/${id}`)
                );

                const results = await Promise.all(tripDetailPromises);
                const tripDetails = results.map(res => res.data);

                console.log("Trip details:", tripDetails);
                setTrips(tripDetails);
            } catch (err) {
                console.error("Error fetching trip details:", err);
            } finally {
                setLoading(false);
            }
        };

        const init = async () => {
            setLoading(true);
            const userData = await fetchProfile();
            if (userData) {
                const tripIds = await fetchMyTripIds(userData.id);
                if (tripIds.length > 0) {
                    await fetchTripDetails(tripIds);
                } else {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        init();
    }, []);

    const filteredTrips = trips.filter(trip => {
        const hasPending = trip.reservations?.some(r => r.status === "pending_driver_confirmation");
        return filterType === "pending" ? hasPending : !hasPending;
    });

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
                            dropoff={trip.path.locations[trip.path.locations.length - 1]?.name || "-"}
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