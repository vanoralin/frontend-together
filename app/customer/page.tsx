"use client";


import Header from "../components/welcome";
import TripTodayCard from "./components/triptodaycard";
import TripListCard from "./components/triplistcard";
import BottomSheet from "./components/BottomSheet";
import Link from "next/link";

export default function Home() {
    return (

        <div className="bg-theme-customer h-full">
            <Header username="โมโมโกะ" role={0} />
            <div className="p-4 mt-4">
                <Link href="./customer/tripmap">
                    <TripTodayCard />
                </Link>

            </div>
           
            <h1 className="text-2xl">ดูรายการทริป</h1>

            {/* Trip List */}
            <div className="px-4 mt-6">

                <div className="flex gap-4 mt-2">
                    <TripListCard
                        title="ทริปปกติ"
                        image="/home_car.png"
                        bgColor="from-white to-[#F0B599]"
                    />
                    <TripListCard
                        title="ทริปประจำ"
                        image="/home_package.png"
                        bgColor="from-white to-[#FFCADB]"
                    />
                </div>
            </div>

        </div>
    );
}
