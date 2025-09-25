"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { LocationDirectionShowBox, NumberInCar } from "@/app/components/trip_components";

export default function BottomSheet() {
    const [expanded, setExpanded] = useState(false);

    // ความสูงของ Bottom Sheet
    const collapsedHeight = "40vh"; // สูงตอนเริ่มต้น (px)
    const expandedHeight = "70vh";  // สูงตอนขยาย (px)

    return (
        <motion.div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-50 overflow-hidden"
            animate={{ height: expanded ? expandedHeight : collapsedHeight }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >

            {/* Handle bar */}
            <div
                className="w-12 h-1.5 bg-theme-light-gray rounded-full mx-auto mt-2 mb-2 cursor-pointer"
                onClick={() => setExpanded(!expanded)} // คลิกเพื่อขยาย/หด
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

                    <button className="w-full bg-theme-orange text-white py-2 rounded-xl mt-2">
                        ยกเลิกการจองทริป
                    </button>
                </div>

            </div>
        </motion.div>
    );
}
