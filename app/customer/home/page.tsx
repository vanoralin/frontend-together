"use client";

import Header from "../../components/welcome";
import Navbar from "../components/navbar";
import { NumberInCar } from "../../components/trip_components";
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
    return (
        <>
            <h1 className="text-2xl font-medium">ทริปของวันนี้</h1>
            <div className="relative bg-white rounded-xl shadow-md p-4 mt-2 border-l-6 border-theme-orange">
                <h3 className="text-md font-medium text-theme-black flex justify-between items-center">
                    คนขับกำลังไปยังจุดหมาย
                </h3>
                <p className="text-sm text-gray-600 mt-1">คาดว่าจะไปถึงใน 12:04</p>
                <PinName location="เกกี 4 - หน้าตึก ECC" />
                <div className="absolute top-4 right-4">
                    <NumberInCar number={3} />
                </div>

                <p className="absolute bottom-4 right-4 text-xs text-theme-gray mt-2">กดเพื่อดูรายละเอียด</p>


                {/* Progress */}
                {/* <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <span>ออกเดินทาง</span>
                <span>ใกล้ถึงแล้ว</span>
                <span>จุดรับ</span>
                <span>จุดหมาย</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mt-1">
                <div className="h-2 bg-orange-500 rounded-full w-2/3"></div>
            </div> */}



            </div>
        </>
    );
}

export function PostBanner() {
    return (
        <div className="flex justify-around flex-center bg-white rounded-xl shadow-md py-4 pr-4">
            <img src="/home_banner.png" alt="" />
            <div className="flex flex-col justify-center">
                <p>ต้องการหารถด่วนตอนนี้เลย ?</p>
                <p>เขียนโพสต์เพื่อหารถ</p>
            </div>
        </div>
    )
}

interface TripListCardProps {
    title: string;
    image: string;
    bgColor: string;
    href?: string;
}

export function TripListCard({ title, image, bgColor, href }: TripListCardProps) {
    const cardContent = (
        <div
            className={`flex-1 rounded-xl shadow-md p-4 bg-gradient-to-b ${bgColor} flex flex-col items-center justify-center`}
        >
            <img src={image} alt={title} className="w-16 h-16 mb-2" />
            <p className="text-sm font-medium text-theme-black">{title}</p>
        </div>
    );

    return href ? <Link href={href}>{cardContent}</Link> : cardContent;
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
            <div className="flex flex-col  mx-4 gap-4 mt-4">

                <PostBanner />

                <Link href="./tripmap">
                    <TripTodayCard />
                </Link>

                <div className="flex gap-4">
                    <TripListCard
                        title="ทริปปกติ"
                        image="/home_car.png"
                        bgColor="from-white to-[#F0B599]"
                        href="./home/trip_list" // 🔹 route ไปหน้า /trip_list
                    />
                    <TripListCard
                        title="ทริปประจำ"
                        image="/home_package.png"
                        bgColor="from-white to-[#FFCADB]"
                        href="./home/trip_list" // 🔹 route ไปหน้า /trip_list
                    />
                </div>
            </div>
            <Navbar />

        </div>
    );
}
