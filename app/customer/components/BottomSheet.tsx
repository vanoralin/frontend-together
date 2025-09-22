"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function BottomSheet() {
    const [expanded, setExpanded] = useState(false);

    // ความสูงของ Bottom Sheet
    const collapsedHeight = "30vh"; // สูงตอนเริ่มต้น (px)
    const expandedHeight = "60vh";  // สูงตอนขยาย (px)

    return (
        <motion.div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-50 overflow-hidden"
            animate={{ height: expanded ? expandedHeight : collapsedHeight }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >

            {/* Handle bar */}
            <div
                className="w-12 h-1.5 bg-theme-gray rounded-full mx-auto mt-2 mb-2 cursor-pointer"
                onClick={() => setExpanded(!expanded)} // คลิกเพื่อขยาย/หด
            ></div>

            {/* Content */}
            <div className="p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-bold">คนขับกำลังไปยังจุดหมาย</p>
                        <p className="text-sm text-theme-gray">หน้าตึก ECC</p>
                    </div>
                    <span className="font-bold text-lg text-orange-600">6 นาที</span>
                </div>

                <div className="flex justify-between mt-3">
                    <div>
                        <p className="font-semibold">กข-555 บุรีรัมย์</p>
                        <p className="text-sm text-theme-gray">TOYOTA HAHA</p>
                        <p className="text-sm text-theme-gray">สีขาว</p>
                    </div>
                    <img src="/car.png" alt="Car" className="w-35 h-14 rounded-md object-cover" />
                </div>


                <div className="flex justify-between items-center mt-4">
                    <div className="flex gap-3 items-center">
                        <img src="/profile_wonyoung.jpg" alt="" className="w-12 h-12 rounded-full object-cover" />
                        <div>
                            <p>วอนยอง</p>
                            <p>099-999-9999</p>
                        </div>
                    </div>

                    <img src="/call_phone.png" alt="" className="w-8 h-8 object-contain" />
                </div>


                {expanded && (
                    <div className="mt-4 space-y-3 border-t pt-2 text-sm">
                        <p>วันที่: 27/07/2568 เวลา 12:20</p>
                        <p>📍 ฝั่งตรงข้ามเกกี 4</p>
                        <p>📍 หน้าตึก ECC</p>

                        <button className="w-full bg-orange-500 text-white font-semibold py-2 rounded-xl mt-2">
                            ยกเลิกการจองทริป
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
