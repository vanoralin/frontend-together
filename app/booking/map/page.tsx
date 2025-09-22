"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

// Header
export function TripBookingHeader() {
  const router = useRouter()
  return (
    <div className="w-[390px] bg-[#c5deda] px-6 py-4 mx-auto overflow-hidden">
      <div className="flex items-center relative">
        {/* Back Button */}
        <button
          className="w-12 h-12 bg-[#191919] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          onClick={() => router.push("/booking/create")}
        >
          <img src="/arrow.png" alt="Back" className="w-6 h-6 filter invert" />
        </button>

        {/* Title (จัดกึ่งกลางจริง ๆ ด้วย absolute) */}
        <div className="flex-1 text-center -ml-10">
          <h1 className="text-lg font-medium text-black">การจองทริปใหม่ หน้า 1/3</h1>
          <p className="text-lg font-bold text-black">เลือกจุดรับส่ง</p>
        </div>
      </div>
    </div>
  )
}

// Page
export default function RideBookingPage() {
  const router = useRouter()
  const [pickup, setPickup] = useState("")
  const [dropoff, setDropoff] = useState("")

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-[#c5deda] flex flex-col w-[390px] h-[844px] overflow-hidden rounded-3xl">
        <TripBookingHeader />

        {/* Location Input Fields */}
        <div className="flex-1 px-4 py-3">
          <div className="relative bg-white p-4 rounded-[1.35rem] shadow-[0_7px_6px_rgba(0,0,0,0.5)]">
            <div className="absolute left-7 top-10 h-[38px] w-[2px] bg-black"></div>

            {/* จุดรับ */}
            <div className="flex items-center gap-3 mb-6">
              <img src="/location.png" alt="pickup" className="h-8 w-6 object-contain" />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full h-8 text-base bg-gray-100 text-black rounded-[1.35rem] pl-4 pr-12 placeholder-gray-500"
                  placeholder="ป้อนจุดรับ"
                />
                {pickup && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                    onClick={() => setPickup("")}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* จุดส่ง */}
            <div className="flex items-center gap-3">
              <img src="/location.png" alt="dropoff" className="h-8 w-6 object-contain" />
              <div className="flex-1 relative">
                <input
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="w-full h-8 text-base bg-gray-100 text-black rounded-[1.35rem] pl-4 pr-12 placeholder-gray-500"
                  placeholder="ป้อนจุดส่ง"
                />
                {dropoff && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                    onClick={() => setDropoff("")}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="px-4 mb-6">
          <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border border-black h-[504px]">
            <div
              className="w-full h-full bg-cover bg-center relative"
              style={{ backgroundImage: `url('/map.svg')` }}
            >
              <div className="absolute top-4 left-4 bg-white px-2 py-1 rounded text-xs font-medium">
                100 m
              </div>
            </div>
          </div>
        </div>

        {/* Next Step Button */}
        <div className="px-4 pb-8">
          <button
            className="w-full h-12 bg-[#e6a88a] hover:bg-[#e6a88a] text-black text-lg rounded-2xl border-2 border-[#B55C32]"
            onClick={() => router.push("/booking/mapdetail")}
          >
            ขั้นตอนถัดไป
          </button>
        </div>
      </div>
    </div>
  )
}
