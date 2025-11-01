"use client";

import Header from "../../components/welcome";
import Navbar from "../components/navbar";
import { CardTrip, NumberInCar, TripListCard } from "../../components/trip_components";
import Link from "next/link";
import axios from "axios";

// TripHome.tsx
import { PinName } from "../../components/trip_components";
import { useEffect, useState } from "react";

interface UserProfile {
    id: number;
    name: string;
    email: string;
    balance: number;
    role: string;
}

interface TripHome {
    name: string;
}

interface Passenger {
    id: number;
    name: string;
    email: string;
}

interface Driver {
    id: number;
    name: string;
    email: string;
}

interface Vehicle {
    model_vehicle?: string;
    license_plate?: string;
    vehicle_type?: string;
}

interface Location {
    id: number;
    name: string;
}

interface Reservation {
    id: number;
    status: string;
    trip_type?: 'normal' | 'instant';
    scheduled_start_time: string;
    seats: number;
    amount: number;
    passenger?: Passenger;
    driver?: Driver;
    vehicle?: Vehicle;
    pickup_location?: Location;
    dropoff_location?: Location;
    trip_status: string;
}

export function TripHome() {

    return (
        <div className="text-start border-2 p-4 rounded-3xl border-theme-orange flex flex-col gap-4">
            <div className="">
                <p>คนขับมารับคุณแล้ว</p>
                <p>คาดว่าจะไปถึงจุดหมายตอน 08:30</p>
            </div>

            <PinName location="เกสี่" />
        </div>
    );
}

export function TripTodayCard() {
    const [trip, setTrip] = useState<Reservation | null>(null);

    useEffect(() => {
        const fetchTodayTrip = async () => {
            try {
                const res = await axios.get("/api/reservations/history");
                const data = Array.isArray(res.data) ? res.data : [];

                const now = new Date();
                const todayTrips = data.filter((t: any) =>
                    new Date(t.scheduled_start_time).toDateString() === now.toDateString()
                );

                if (todayTrips.length > 0) {
                    const latest = todayTrips.sort(
                        (a: any, b: any) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime()
                    )[0];

                    setTrip(latest);
                }
            } catch (err) {
                console.error("Error fetching today's trip:", err);
            }
        };
        fetchTodayTrip();
    }, []);

    if (!trip) {
        return (
            <>
                <h1 className="text-2xl font-medium">ทริปของวันนี้</h1>
                <p className="text-gray-500 mt-2">คุณไม่มีทริปสำหรับวันนี้</p>
            </>
        );
    }

    // กำหนดข้อความตามสถานะ
    let statusMessage = "";
    let hrefLink = "";
    if (trip.trip_status === "available" || trip.trip_status === "booked") {
        statusMessage = "คนขับยังไม่เริ่มเดินทาง";
        hrefLink = `./trip/${trip.id}`;
    } else if (trip.trip_status === "in_progress") {
        statusMessage = "กำลังเดินทางมา";
        hrefLink = `./tripmap/${trip.id}`;
    }

    return (
        <>
            <h1 className="text-2xl font-medium">ทริปของวันนี้</h1>

            <CardTrip
                key={trip.id}
                datetime={trip.scheduled_start_time}
                pickup={trip.pickup_location?.name ?? "-"}
                dropoff={trip.dropoff_location?.name ?? "-"}
                vehicle={trip.vehicle?.vehicle_type ?? "-"}
                model_vehicle={trip.vehicle?.model_vehicle ?? "-"}
                license_plate={trip.vehicle?.license_plate ?? "-"}
                people={trip.seats}
                status={statusMessage}
                role="customer"
                tripType={trip.trip_type}
                price={trip.amount}
                href={hrefLink}
                showText={statusMessage}
                mode="today-cus"
            />
        </>
    );
}



export function PostBanner() {
    return (
        <Link href="./instant_trip">
            <div className="flex justify-around flex-center bg-white rounded-xl shadow-md py-4 pr-4">
                <img src="/home_banner.png" alt="" />
                <div className="flex flex-col justify-center">
                    <p className="font-medium">ต้องการหารถด่วนตอนนี้เลย ?</p>
                    <p className="text-sm text-theme-orange">สร้างทริปด่วนเพื่อหาคนขับทันที</p>
                </div>
            </div>
        </Link>
    )

}


export default function Home() {
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get<UserProfile>("/api/User/profile");
                setUser(res.data);
            } catch (err) {
                console.error("Error fetching user profile:", err);
            }
        };
        fetchProfile();
    }, []);
    return (

        <div className="bg-theme-customer h-full overflow-hidden">
            <Header username={user?.name || "ไม่ได้เข้าสู่ระบบ"} userRole={user?.role} pageRole={'user'} />
            <div className="flex flex-col mx-4 gap-4 mt-4">

                <PostBanner />
                <TripTodayCard />

                <h1 className="text-2xl font-medium">รายการจองทริป</h1>
                {/* <TripListCard
                        title="ทริปทั่วไป"
                        image="/home_car.png"
                        bgColor="from-white to-[#FFCADB]"
                        href="./home/trip_list" // 🔹 route ไปหน้า /trip_list
                    /> */}
                <Link href="./home/trip_list" className="block h-full w-full">
                    <div className="flex-1 rounded-xl shadow-md p-4 bg-gradient-to-b from-white to-[#FFCADB] flex  items-center justify-around">
                        <img src="/home_car.png" alt="ทริปทั่วไป" className=" h-16 mb-2" />
                        <p className="font-medium text-theme-black">ดูรายการจองทั้งหมด</p>
                    </div>
                </Link>

            </div>
            <Navbar />

        </div>
    );
}
