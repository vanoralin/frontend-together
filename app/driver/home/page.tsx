'use client';

import Link from "next/link";
import Header from "../../components/welcome";
import Navbar from "../components/navbar";
import { CardTrip, TripListCard } from "../../components/trip_components";
import { useState, useEffect } from "react";
import axios from "axios";


export function PostBanner() {
    return (
        <Link
            href="/driver/instant_board"
            className="flex justify-around items-center bg-white rounded-xl shadow-md py-4 pr-4 hover:shadow-lg transition-shadow duration-200"
        >
            <img src="/home_banner.png" alt="banner" className="w-20 h-20 object-contain" />
            <div className="flex flex-col justify-center text-theme-black">
                <p className="font-medium">มีลูกค้าที่ต้องการหาคนขับด่วน !</p>
                <p className="text-theme-orange text-sm">กดเพื่อดูรายการทั้งหมด</p>
            </div>
        </Link>
    );
}

interface UserProfile {
    id: number;
    name: string;
    email: string;
    balance: number;
    role: string;
}

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
    trip_type: string;
}

export default function HomePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [trips, setTrips] = useState<TripData[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get<UserProfile>("/api/User/profile");
                setUser(res.data);
            } catch (err) {
                console.error("Error fetching user profile:", err);
            }
        };

        const fetchTrips = async () => {
            try {
                const statuses = ["booked", "available"];

                const allTrips: TripData[] = [];

                for (const s of statuses) {
                    const res = await axios.get<TripData[]>("/api/trips/view/status", { params: { status: s } });
                    console.log(`Trips for status "${s}":`, res.data); // Log ข้อมูลแต่ละ status
                    if (res.data) allTrips.push(...res.data);
                }

                console.log("All trips combined:", allTrips); // Log หลังรวมทั้งหมด

                const nowUTC = new Date();

                const upcomingTrips = allTrips.filter(t => {
                    let tripTime = new Date(t.scheduled_start_time).getTime();

                    // ถ้าเป็น booked + instant ให้บวก 30 นาที
                    if (t.status === "booked" && t.trip_type === "instant") {
                        tripTime += 30 * 60 * 1000; // 30 นาทีเป็น milliseconds
                    }

                    return tripTime > nowUTC.getTime();
                }).sort((a, b) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime());


                setTrips(upcomingTrips);
            } catch (err) {
                console.error("Error fetching trips:", err);
            } finally {
                setLoading(false);
            }
        };


        fetchProfile();
        fetchTrips();
    }, []);

    return (
        <div className="bg-theme-driver h-full">
            <Header
                username={user?.name || "ไม่ได้เข้าสู่ระบบ"}
                userRole={user?.role}
                pageRole="driver"
            />


            <div className="flex flex-col mx-4 gap-4 mt-4">
                {/* <PostBanner /> */}
                <h1 className="text-2xl font-medium">ทริปของวันนี้</h1>

                {loading ? (
                    <p>กำลังโหลดข้อมูล...</p>
                ) : trips.length === 0 ? (
                    <p>คุณไม่มีทริปสำหรับวันนี้</p>
                ) : (
                    (() => {
                        const trip = trips[0];
                        let hrefLink = `./trip/${trip.id}`;
                        if (trip.status === "available" || trip.status === "booked") {
                            hrefLink = `./trip/${trip.id}`;
                        } else if (trip.status === "in_progress") {
                            hrefLink = `./tripmap/${trip.id}`;
                        }

                        return (
                            <CardTrip
                                key={trip.id}
                                datetime={trip.scheduled_start_time}
                                pickup={trip.path.locations[0]?.name || "-"}
                                dropoff={trip.path.locations[1]?.name || "-"}
                                vehicle={trip.driver_vehicle?.vehicle_type || "-"}
                                model_vehicle={trip.driver_vehicle?.model_vehicle || "-"}
                                license_plate={trip.driver_vehicle?.license_plate || "-"}
                                people={trip.reservations?.reduce(
                                    (acc, r) => acc + ((r.status === "confirmed") ? r.seats : 0),
                                    0
                                ) || 0}
                                price={trip.amount}
                                mode="link"
                                href={hrefLink}
                            />
                        );
                    })()
                )}

                <h1 className="text-2xl font-medium">รายการ</h1>
                <div className="flex gap-4">

                    <TripListCard
                        title="ทริปด่วน"
                        image="/home_banner.png"
                        bgColor="from-white to-[#F0B599]"
                        // bgColor="from-white to-[#FFCADB]"
                        href="./instant_board" // 🔹 route ไปหน้า /trip_list

                    />
                    <TripListCard
                        title="ดูรายการทริป"
                        image="/home_car.png"
                        bgColor="from-white to-[#FFCADB]"
                        href="./home/trip_list" // 🔹 route ไปหน้า /trip_list
                    />
                </div>
            </div>

            <Navbar />
        </div>
    );
}
