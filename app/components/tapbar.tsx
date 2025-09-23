"use client";
//ไม่ได้ใช้ เก็บไว้เป็นวิธีเขียนเฉยๆ

import { useState } from "react";
import Header from "../components/welcome";
import TripHome from "../customer/components/trip_home";

export default function Home() {
    const [activeTab, setActiveTab] = useState(1);

    const tabs = [
        { id: 1, label: "ทริปของวันนี้" },
        { id: 2, label: "ทั่วไป" },
        { id: 3, label: "ขาประจำ" },
    ];

    const tabContent = [
        { id: 1, content: <TripHome /> },
        { id: 2, content: <p>ทริปทั้งหมด</p> },
        { id: 3, content: <p>ทริปทั้ขาประจำ</p> }
    ];

    return (

        <div className="bg-theme-customer h-full">
            <Header username="โมโมโกะ" role={0} />

            {/* ปุ่มแท็บ */}
            <div className="flex flex-wrap border-b w-full">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 ${activeTab === tab.id
                            ? "border-b-2 border-theme-orange text-theme-orange"
                            : "text-gray-700 hover:text-theme-orange"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* เนื้อหาแท็บ */}
            <div className="w-full max-w-xl mt-4">
                {tabContent.find((item) => item.id === activeTab)?.content}
            </div>
        </div>
    );
}
