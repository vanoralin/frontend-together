"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { LocationDirectionShowBox, NumberInCar } from "@/app/components/trip_components";
import { Popup } from "@/app/components/share_component"; // generic Popup

export default function BottomSheet({ status }: { status: number }) {
    const [expanded, setExpanded] = useState(false);
    const [popupType, setPopupType] = useState<"cancel" | "finish" | null>(null);

    // ความสูงของ Bottom Sheet
    const collapsedHeight = "40vh";
    const expandedHeight = "70vh";

    return (
        <>
            <motion.div
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-50 overflow-hidden"
                animate={{ height: expanded ? expandedHeight : collapsedHeight }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {/* Handle bar */}
                <div
                    className="w-12 h-1.5 bg-theme-light-gray rounded-full mx-auto mt-2 mb-2 cursor-pointer"
                    onClick={() => setExpanded(!expanded)}
                ></div>

                {/* Content */}
                <div className="p-4">
                    <div className="flex flex-col justify-between items-start">
                        <p className="font-medium text-xl">คนขับกำลังไปยังจุดหมาย</p>
                        <p className=" text-theme-gray">อีก 6 นาที</p>
                    </div>

                    <div className="flex justify-between mt-3">
                        <div>
                            <p className="font-medium">กข-555 บุรีรัมย์</p>
                            <p className="text-sm text-theme-gray">TOYOTA HAHAxzz</p>
                            <p className="text-theme-gray">สีขาว</p>
                        </div>
                        <img src="/car.png" alt="Car" className="w-35 h-14 rounded-md object-cover" />
                    </div>

                    <div className="flex justify-between items-center mt-4 border-y py-3 border-theme-light-gray w-full">
                        <div className="flex gap-3 items-center">
                            <img src="/profile_wonyoung.jpg" alt="" className="w-12 h-12 rounded-full object-cover" />
                            <div>
                                <p>วอนยอง</p>
                                <p>099-999-9999</p>
                            </div>
                        </div>
                        <img src="/call_phone.png" alt="" className="w-8 h-8 object-contain" />
                    </div>

                    <div className="mt-4 space-y-3 pt-2 text-sm">
                        <div className="flex justify-between">
                            <h1 className="font-medium text-xl">รายละเอียด</h1>
                            <div className="flex gap-4">
                                <NumberInCar number={3} />
                                <div className="flex gap-2 items-center">
                                    <img src="/coin.svg" alt="" className="h-6" />
                                    <p>32 บาท</p>
                                </div>
                            </div>
                        </div>
                        <p>วันที่: 27/07/2568 เวลา 12:20</p>

                        <LocationDirectionShowBox value1="ฝั่งตรงข้ามเกกี 4" value2="หน้าตึก ECC" />

                        {status === 0 ? (
                            <button
                                className="w-full bg-white text-theme-orange border-2 py-2 rounded-xl mt-2"
                                onClick={() => setPopupType("cancel")}
                            >
                                ยกเลิกการจองทริป
                            </button>
                        ) : (
                            <button
                                className="w-full bg-theme-orange text-white py-2 rounded-xl mt-2"
                                onClick={() => setPopupType("finish")}
                            >
                                เสร็จสิ้นการเดินทาง
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Popup: ยกเลิกการจอง */}
            {popupType === "cancel" && (
                <Popup
                    title="ยกเลิกการจองทริป"
                    description="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองทริปนี้?"
                    image={<img src="/alarm sign.svg" alt="cancel" className="w-20 h-auto" />}
                    onClose={() => setPopupType(null)}
                    actions={[
                        {
                            label: "ย้อนกลับ",
                            onClick: () => setPopupType(null),
                            variant: "secondary",
                        },
                        {
                            label: "ยืนยัน",
                            onClick: () => {
                                setPopupType(null);
                                console.log("Trip cancelled");
                            },
                            variant: "primary",
                        },
                    ]}
                />
            )}

            {/* Popup: เสร็จสิ้นการเดินทาง */}
            {popupType === "finish" && (
                <Popup
                    title="เสร็จสิ้นการเดินทาง"
                    description="กรุณากดยืนยันว่าคุณได้ถึงที่หมายแล้ว"
                    image={<img src="/home_congrat.svg" alt="done" className="w-30 h-auto" />}
                    onClose={() => setPopupType(null)}
                    actions={[
                        {
                            label: "ย้อนกลับ",
                            onClick: () => setPopupType(null),
                            variant: "secondary",
                        },
                        {
                            label: "ยืนยัน",
                            onClick: () => {
                                setPopupType(null);
                                console.log("Trip finished");
                            },
                            variant: "primary",
                        },
                    ]}
                />
            )}
        </>
    );
}
