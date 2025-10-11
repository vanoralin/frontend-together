"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";

function Background() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-[#FFFFFF] to-[#C5D4E8]">
      <div>
        {/* ปุ่มย้อนกลับ */}
        <div className="w-full flex items-center justify-start px-6 mt-6">
          <BackButton />
        </div>

        {/* ส่วนหัว */}
        <div className="flex flex-col items-center text-center mt-16 px-10 py-10">
          <h1 className="text-5xl font-regular text-[#191919] mb-20">
            สร้างทริปแบบ ขาประจำ
          </h1>
          <img src="/home_package.png" alt="Home Package" className="w-32 h-20 mb-20"/>
          <p className="text-base font-light text-[#191919]">
            เลือกวันและสถานที่ที่ต้องการ
            <br />
            ล่วงหน้าใน 4 สัปดาห์
          </p>
        </div>
      </div>

      <div>
        {/* หมายเหตุ */}
        <div className="text-center text-sm font-light text-[#B55C32] mb-4">
          หมายเหตุ: จุดรับ/ส่ง และเวลา จะเหมือนเดิมทุกครั้ง
        </div>

        {/* ปุ่มสร้างแพ็คเกจ */}
        <div className="bg-white rounded-t-2xl shadow-inner px-6 pt-4 pb-6">
          <button
            className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl shadow-md hover:bg-[#d9956f] transition-colors duration-200"
            onClick={() => router.push("/driver/booking/regular/packet1")}
          >
            สร้างแพ็คเกจทริปขาประจำ
          </button>
        </div>
      </div>
    </div>
  );
}

export default Background;
