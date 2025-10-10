'use client';

import Link from "next/link";
import Header from "../../components/welcome";
import Navbar from "../components/navbar";
import { PinName, LocationShowBox } from "../../components/trip_components";
import { useState, useEffect } from "react";
import axios from "axios";

interface Stop {
    id: number;
    name: string;
    pickups?: number;
    dropoffs?: number;
}

interface TripCardProps {
    start: string;
    end: string;
    stops: Stop[];
}

export function TripCard({ start, end, stops }: TripCardProps) {
    const [showDetails, setShowDetails] = useState(true);

    return (
        <div className="relative bg-white rounded-xl shadow-md p-4 mt-2 border-l-6 border-theme-orange">
            <h3 className="text-md font-medium text-theme-black flex justify-between items-center">
                เริ่มออกเดินทาง 12:20
                <button
                    className="text-sm text-theme-orange underline"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    {showDetails ? "ซ่อนรายละเอียด" : "ดูรายละเอียด"}
                </button>
            </h3>

            {/* เส้นทางหลัก */}
            <div className="relative mt-4 ml-3">
                <LocationShowBox value={start} />
                {showDetails &&
                    stops.map((stop) => (
                        <div key={stop.id} className="relative mb-4">
                            <LocationShowBox value={stop.name} />
                            {stop.pickups && (
                                <div className="absolute top-2 right-2 flex items-center gap-1 text-theme-black text-xs">
                                    <img src="/icon_cus_in.svg" alt="" />
                                    {stop.pickups}
                                </div>
                            )}
                            {stop.dropoffs && (
                                <div className="absolute top-2 right-2 flex items-center gap-1 text-theme-gray text-xs">
                                    <img src="/icon_cus_out.svg" alt="" />
                                    {stop.dropoffs}
                                </div>
                            )}
                        </div>
                    ))}
                <LocationShowBox value={end} />
            </div>

            <Link href="./driver/tripmap">
                <button className="mt-6 w-full bg-theme-orange text-white py-2 rounded-lg shadow-md">
                    เริ่มต้นการเดินทาง
                </button>
            </Link>
        </div>
    );
}

interface UserProfile {
    id: number;
    name: string;
    email: string;
    balance: number;
    role: string; // 'user' หรือ 'driver'
}

export default function HomePage() {
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
        <div className="bg-theme-driver h-full">
            <Header 
                username={user?.name || "ไม่ได้เข้าสู่ระบบ"} 
                userRole={user?.role} 
                pageRole="driver" 
            />
            <div className="flex flex-col mx-4 gap-4 mt-4 overflow-scroll">
                <h1 className="text-2xl font-medium">รายการทริป</h1>
                <TripCard
                    start="ฝั่งตรงข้ามเกกี 4"
                    end="หน้าตึก ECC"
                    stops={[
                        { id: 1, name: "AJ Park", pickups: 3 },
                        { id: 2, name: "เกกี 4", dropoffs: 3 },
                        { id: 3, name: "AJ Park", pickups: 2 },
                        { id: 4, name: "เกกี 4", dropoffs: 1 },
                    ]}
                />
            </div>
            <Navbar />
        </div>
    );
}
