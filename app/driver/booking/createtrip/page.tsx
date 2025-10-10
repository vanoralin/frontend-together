"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";

export default function Background() {
  const router = useRouter();

  return (
    <div className="bg-[#ffffff] min-h-screen w-full flex flex-col items-center pb-[140px] relative">
      
      {/* Back Button ด้านบนซ้าย */}
      <div className="w-full flex items-center justify-start px-6 mt-6">
        <BackButton />
      </div>

      {/* Title อยู่กลาง */}
      <div className="flex flex-col mt-20 items-start w-80">
        <h1 className="text-4xl font-semibold text-[#191919] mb-2">สร้างทริป</h1>
        <p className="text-base text-[#191919] leading-relaxed">
          เพื่อออกเดินทางไปยังที่ที่คุณต้องการได้ง่าย ๆ
        </p>
      </div>

      {/* Booking Options (เลื่อนลงมาอีก) */}
      <div className="w-full px-6 mt-8 space-y-5">
        {/* First Option */}
        <button
          className="w-full bg-[#C5D4E8] rounded-2xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 active:shadow-md"
          onClick={() => router.push("/driver/booking/normal/create")}
        >
          <div className="text-left">
            <h2 className="text-lg font-semibold text-[#191919] mb-1">
              สร้างทริปแบบปกติ
            </h2>
            <p className="text-sm text-[#191919]">เดินทางเพียงครั้งเดียว</p>
          </div>
          <svg
            className="w-5 h-5 text-[#191919]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Second Option */}
        <button
          className="w-full bg-[#C5D4E8] rounded-2xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 active:shadow-md"
          onClick={() => router.push("/driver/booking/regular/create")}
        >
          <div className="text-left">
            <h2 className="text-lg font-semibold text-[#191919] mb-1">
              สร้างทริปแบบขาประจำ
            </h2>
            <p className="text-sm text-[#191919] leading-relaxed">
              เลือกวันและเวลาที่ต้องการเดินทางเป็นประจำ
            </p>
          </div>
          <svg
            className="w-5 h-5 text-[#191919]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Bottom Illustration */}
      <div className="flex justify-center items-end h-[320px] mt-8">
        <img
          src="/homeBK.png"
          alt="Booking illustration"
          className="w-full max-w-[280px] h-auto object-contain"
        />
      </div>
    </div>
  );
}