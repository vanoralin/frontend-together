"use client"

import { useRouter } from "next/navigation"

export default function BookingPage() {
  const router = useRouter()

  return (
    <div className="w-[390px] h-[844px] bg-[#ffffff] px-6 py-6 mx-auto overflow-hidden">
      {/* Back Button */}
      <div className="mb-8">
        <button
          className="w-12 h-12 bg-[#191919] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          onClick={() => router.back()}
        >
          <img src="/arrow.png" alt="Back" className="w-6 h-6 filter invert" />
        </button>
      </div>

      {/* Main Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#191919] mb-2">จองทริป</h1>
        <p className="text-base text-[#191919] leading-relaxed">
          เพื่อออกเดินทางไปยังที่ที่คุณต้องการได้ง่าย ๆ
        </p>
      </div>

      {/* Booking Options */}
      <div className="space-y-5 mb-6">
        {/* First Option */}
        <button
          className="w-full bg-[#c5deda] rounded-2xl p-5 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 active:shadow-md"
          onClick={() => router.push("/booking/map")} 
        >
          <div className="text-left">
            <h2 className="text-lg font-semibold text-[#191919] mb-1">
              จองทริปแบบปกติ
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
        <button className="w-full bg-[#c5deda] rounded-2xl p-5 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 active:shadow-md">
          <div className="text-left">
            <h2 className="text-lg font-semibold text-[#191919] mb-1">
              จองทริปแบบประจำ
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
      <div className="flex justify-center items-end h-[320px] -mt-2">
        <img
          src="/homeBK.png"
          alt="Booking illustration"
          className="w-full max-w-[280px] h-auto object-contain"
        />
      </div>
    </div>
  )
}
