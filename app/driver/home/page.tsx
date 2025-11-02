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

export default function HomePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [myTripIds, setMyTripIds] = useState<number[]>([]);
    const [todayTrip, setTodayTrip] = useState<TripData | null>(null);
    const [loading, setLoading] = useState(true);

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

        const fetchMyTrips = async (userId: number) => {
            try {
                const statuses = ["booked", "available", "in_progress"];
                const allTrips: TripData[] = [];

                // ดึงทริปแต่ละสถานะ
                for (const s of statuses) {
                    const res = await axios.get<TripData[]>("/api/trips/view/status", {
                        params: { status: s }
                    });
                    console.log(`Trips for status "${s}":`, res.data);
                    if (res.data) allTrips.push(...res.data);
                }

                console.log("All trips combined:", allTrips);

                // กรองเฉพาะทริปที่ user คนนี้เป็น driver
                const myTrips = allTrips.filter(t => t.driver.id === userId);
                console.log("My trips as driver:", myTrips);

                // เก็บ trip IDs
                const tripIds = myTrips.map(t => t.id);
                setMyTripIds(tripIds);

                // หาทริปวันนี้
                const nowUTC = new Date();

                const upcomingTrips = myTrips.filter(t => {
                    let tripTime = new Date(t.scheduled_start_time).getTime();

                    // ถ้าเป็น booked + instant ให้บวก 30 นาที
                    if (t.status === "booked" && t.trip_type === "instant") {
                        tripTime += 30 * 60 * 1000;
                    }

                    return tripTime > nowUTC.getTime();
                }).sort((a, b) =>
                    new Date(a.scheduled_start_time).getTime() -
                    new Date(b.scheduled_start_time).getTime()
                );

                // ดึงข้อมูลทริปแรก (today trip) จาก API
                if (upcomingTrips.length > 0) {
                    const firstTripId = upcomingTrips[0].id;
                    try {
                        const tripDetail = await axios.get<TripData>(
                            `/api/trips/view/${firstTripId}`
                        );
                        console.log("Today trip detail:", tripDetail.data);
                        setTodayTrip(tripDetail.data);
                    } catch (err) {
                        console.error("Error fetching trip detail:", err);
                    }
                }
            } catch (err) {
                console.error("Error fetching trips:", err);
            } finally {
                setLoading(false);
            }
        };

        const init = async () => {
            const userData = await fetchProfile();
            if (userData) {
                await fetchMyTrips(userData.id);
            } else {
                setLoading(false);
            }
        };

        init();
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
                <h1 className="text-2xl font-medium">ทริปที่กำลังจะมาถึง</h1>

                {loading ? (
                    <p>กำลังโหลดข้อมูล...</p>
                ) : !todayTrip ? (
                    <p>คุณไม่มีทริปสำหรับวันนี้</p>
                ) : (
                    (() => {
                        let hrefLink = `./trip/${todayTrip.id}`;
                        if (todayTrip.status === "available" || todayTrip.status === "booked") {
                            hrefLink = `./trip/${todayTrip.id}`;
                        } else if (todayTrip.status === "in_progress") {
                            hrefLink = `./tripmap/${todayTrip.id}`;
                        }

                        return (
                            <CardTrip
                                key={todayTrip.id}
                                datetime={todayTrip.scheduled_start_time}
                                pickup={todayTrip.path.locations[0]?.name || "-"}
                                dropoff={todayTrip.path.locations[todayTrip.path.locations.length - 1]?.name || "-"}
                                vehicle={todayTrip.driver_vehicle?.vehicle_type || "-"}
                                model_vehicle={todayTrip.driver_vehicle?.model_vehicle || "-"}
                                license_plate={todayTrip.driver_vehicle?.license_plate || "-"}
                                people={todayTrip.reservations?.reduce(
                                    (acc, r) => acc + ((r.status === "confirmed") ? r.seats : 0),
                                    0
                                ) || 0}
                                price={todayTrip.amount}
                                mode="today-dri"
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
                        href="./instant_board"
                    />
                    <TripListCard
                        title="ดูรายการทริป"
                        image="/home_car.png"
                        bgColor="from-white to-[#FFCADB]"
                        href="./home/trip_list"
                    />
                </div>
            </div>

            <Navbar />
        </div>
    );
}