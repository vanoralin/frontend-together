"use client"

import dynamic from "next/dynamic";
import { useState } from "react";
import BottomSheet from "../components/BottomSheet";
import router from "next/router";
import { BackButton } from "@/app/components/share_component";

const MapComponent = dynamic(() => import("../../components/MapComponent"), {
    ssr: false,
});

export default function TripMapPage() {
    const [showPopup, setShowPopup] = useState(false);

    return (
        <div className="relative w-full h-screen bg-theme-customer">
            <BackButton />

            {/* เปิด popup */}
            {/* <div className="p-4">
                <button
                    onClick={() => setShowPopup(true)}
                    className="px-6 py-2 rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition"
                >
                    เปิด Popup
                </button>
            </div>

            {showPopup && (
                <Popup
                    title="ระบบตรวจพบว่าคุณถึงที่หมายแล้ว"
                    description="กรุณากดยืนยันว่าถึงที่หมายแล้ว"
                    image={<img src="/home_congrat.svg" className="w-30 h-auto" />}
                    onClose={() => setShowPopup(false)}
                    actions={[
                        {
                            label: "ยกเลิก",
                            onClick: () => setShowPopup(false),
                            variant: "secondary",
                        },
                        {
                            label: "ยืนยัน",
                            onClick: () => {
                                setShowPopup(false);
                                console.log("Logout confirmed");
                            },
                            variant: "primary",
                        },
                    ]}
                />
            )} */}

            <MapComponent />
            <BottomSheet status={0} />
        </div>
    );
}

