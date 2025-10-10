"use client";

import Link from "next/link";
import { useState } from "react";
import { useEffect, ReactNode } from "react";
// import { Menu, X } from "lucide-react";

import { useRouter } from "next/navigation";

export function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="absolute top-10 left-2 z-50 p-2 hover:cursor-pointer"
        >
            <img src="/icon_back_arrow.svg" alt="ย้อนกลับ" className="w-10" />
        </button>
    );
}

type PopupAction = {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary"; // style แยก
};

export function Popup({
    title,
    description,
    image,
    actions,
    onClose,
}: {
    title: string;
    description?: string;
    image?: ReactNode; // เช่น <img src="..." /> หรือ <Icon />
    actions: PopupAction[];
    onClose: () => void;
}) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            {/* background มืด */}
            <div className="absolute inset-0 bg-black/40" />

            {/* กล่อง popup */}
            <div
                className="relative w-[366px] bg-white rounded-[30px] shadow-md p-6 flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
            >
                {/* รูปด้านบน (ถ้ามี) */}
                {image && <div className="mb-3">{image}</div>}

                {/* ข้อความ */}
                <p className="text-lg text-center text-theme-black">{title}</p>
                {description && (
                    <p className="text-sm text-center text-theme-gray mt-2">
                        {description}
                    </p>
                )}

                {/* ปุ่ม */}
                <div className="flex justify-center space-x-4 mt-6">
                    {actions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={action.onClick}
                            className={`px-6 py-2 rounded-full shadow-md transition text-base
                                ${action.variant === "primary"
                                    ? "bg-theme-second-orange border-2 border-theme-orange text-theme-black hover:bg-theme-orange hover:text-white"
                                    : "bg-white border-2 border-theme-gray text-theme-gray hover:bg-theme-light-gray"
                                }`}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

//ตัวอย่างการใช้งาน Popup
// {/* ปุ่มทดสอบเปิด popup */}
//             <div className="p-4">
//                 <button
//                     onClick={() => setShowPopup(true)}
//                     className="px-6 py-2 rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition"
//                 >
//                     เปิด Popup
//                 </button>
//             </div>

//             {showPopup && (
//                 <Popup
//                     title="ระบบตรวจพบว่าคุณถึงที่หมายแล้ว"
//                     description="กรุณากดยืนยันว่าถึงที่หมายแล้ว"
//                     image={<img src="/home_congrat.svg" className="w-30 h-auto" />}
//                     onClose={() => setShowPopup(false)}
//                     actions={[
//                         {
//                             label: "ยกเลิก",
//                             onClick: () => setShowPopup(false),
//                             variant: "secondary",
//                         },
//                         {
//                             label: "ยืนยัน",
//                             onClick: () => {
//                                 setShowPopup(false);
//                                 console.log("Logout confirmed");
//                             },
//                             variant: "primary",
//                         },
//                     ]}
//                 />
//             )}




