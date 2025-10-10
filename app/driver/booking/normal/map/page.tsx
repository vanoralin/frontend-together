"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";
import CalendarComponent from "@/app/components/Calendar"; 
import { Calendar, Clock, ChevronDown } from "lucide-react"

export default function Header() {
  const [selected, setSelected] = useState<Date[]>([]);
  const router = useRouter();

  return (
    <div className="bg-[#C5D4E8] min-h-screen w-full flex flex-col items-center pb-[140px]">
      <div className="flex flex-col items-center mt-8 w-full max-w-3xl px-4 mx-auto">
        {/* BackButton */}
        <div className="w-full flex items-center mb-4">
          <BackButton />
        </div>

        {/* Title */}
        <div className="text-center mt-10 mb-6">
          <h1 className="text-xl font-semibold text-black">
            เลือกวันที่และเวลาที่ต้องการ
          </h1>
        </div>

        {/* ส่วนเลือกช่วงวันที่ */}
        <div className="flex items-center gap-4 mb-6">
          <p className="text-sm font-regular text-black">
            ตั้งแต่
          </p>
            <div className="px-3 py-2 bg-white rounded-2xl shadow text-sm font-medium">
              02/07/2568
            </div>
          <p className="text-sm font-regular text-black">
              ถึง 
          </p>
            <div className="px-3 py-2 bg-white rounded-2xl shadow text-sm font-medium">
              23/07/2568
            </div>
        </div>

        {/* ปฏิทิน */}
        <div className="font-regular w-full bg-white rounded-2xl shadow p-4 mb-6">
          <CalendarComponent selected={selected} setSelected={setSelected} />
          <p className="text-l font-regular text-center text-[#B55C32]">
            จิ้มที่วันที่เพื่อเลือก - จิ้มอีกครั้งเพื่อยกเลิก
          </p>
        </div>

        {/* สรุปผลเลือกแล้ว */}
        <div className="w-full bg-white rounded-2xl shadow p-6 mb-6 text-center">
          <p className="text-gray-600 text-base mb-2">คุณเลือกไปแล้ว</p>
          <p className="text-2xl font-semibold text-[#B55C32]">
          <Calendar className="h-10 w-10 mx-12 text-[#B55C32]" />
          {selected.length} วัน
          </p>
          <div className="mt-4">
            <p className="text-gray-600">เวลา ที่ออกเดินทาง</p>
            <div className="mt-2 px-4 py-2 inline-flex items-center gap-2 bg-gray-100 rounded-full">
              <span className="text-black font-medium">12:00</span>
              <Clock className="h-5 w-5 text-[#B55C32]" />
            </div>
          </div>
        </div>
        {/* ปุ่มยืนยัน */}
        <div className="mt-4 w-full max-w-3xl px-2">
          <button
          className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl shadow-md hover:bg-[#944724] transition-colors duration-200"
          onClick={() => router.push("/driver/booking/regular/packet2")}
          >
            ขั้นตอนถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}
