"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

// Custom SVG components
const UserIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
)

const Check = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    {...props} // ส่ง props ต่อ
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

// --- Header Component ---
function TripBookingHeader() {
  const router = useRouter()
  return (
    <div className="flex items-center p-4 bg-[#c5deda] font-[var(--font-playpen)]">
      {/* Back Button */}
      <button
        className="w-12 h-12 bg-[#191919] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
        onClick={() => router.push("/booking/mapdetail")}
      >
        <img src="/arrow.png" alt="Back" className="w-6 h-6 filter invert" />
      </button>
      <div className="flex-1 text-center -ml-10">
        <h1 className="text-lg font-medium text-black">การจองทริปใหม่ หน้า 3/3</h1>
        <p className="text-lg font-bold text-black">ยืนยันการจอง</p>
      </div>
    </div>
  )
}

export default function BookingConfirmationPage() {
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const [tripData, setTripData] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tripData")
      return saved
        ? JSON.parse(saved)
        : {
            pickup: "",
            dropoff: "",
            selectedDate: "27/07/2568",
            selectedStartTime: "12:00",
            selectedEndTime: "12:20",
            passengerCount: 2,
            selectedVehicle: "รถยนต์",
          }
    }
    return {
      pickup: "",
      dropoff: "",
      selectedDate: "27/07/2568",
      selectedStartTime: "12:00",
      selectedEndTime: "12:20",
      passengerCount: 2,
      selectedVehicle: "รถยนต์",
    }
  })

  const [pickup, setPickup] = useState(tripData.pickup)
  const [dropoff, setDropoff] = useState(tripData.dropoff)

  return (
    <div className="bg-[#c5deda] flex flex-col max-w-sm mx-auto rounded-3xl overflow-hidden min-h-[844px]">
      <TripBookingHeader />

      {/* Subtitle */}
      <p className="text-[#B55C32] text-center mb-1 text-lg">กรุณาตรวจสอบรายการเดินทาง</p>

      {/* Location Input Fields */}
      <div className="flex-1 px-4 py-1">
        <div className="relative bg-white rounded-[1.35rem] p-4 shadow-[0_7px_6px_rgba(0,0,0,0.5)]">
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

      {/* Date and Time Card */}
      <div className="flex-1 px-4 py-1">
        <div className="bg-white rounded-[1.35rem] p-6 shadow-[0_7px_6px_rgba(0,0,0,0.5)]">
          {/* วันที่ */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-gray-900 font-medium text-sm">วันที่</span>
            <div className="bg-gray-100 rounded-full px-3 py-2">
              <span className="text-gray-900 text-sm">{tripData.selectedDate}</span>
            </div>
          </div>
          {/* เวลา */}
          <div>
            <p className="text-gray-900 font-medium mb-4 text-sm">เวลา ที่สามารถรอรับได้</p>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-gray-600 text-xs mb-1">ตั้งแต่</p>
                <div className="bg-gray-100 rounded-full px-3 py-2">
                  <span className="text-gray-900 font-medium text-sm">{tripData.selectedStartTime}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-xs mb-1">ถึง</p>
                <div className="bg-gray-100 rounded-full px-3 py-2">
                  <span className="text-gray-900 font-medium text-sm">{tripData.selectedEndTime}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex-1">
              <p className="text-gray-900 font-medium mb-1 text-sm">จำนวนคนนั่ง</p>
              <p className="text-gray-500 text-xs">หากต้องการขนสัมภาระขนาดใหญ่</p>
              <p className="text-gray-500 text-xs">กรุณาเพิ่มจำนวนคนอีก 1</p>
            </div>
            <div className="bg-white text-black rounded-full px-5 py-2 flex items-center gap-2 border-2 border-[#191919]">
              <UserIcon />
              <span className="font-medium">{tripData.passengerCount}</span>
            </div>
          </div>

          <div>
            <p className="text-gray-900 font-medium mb-3 text-sm mt-4">เลือกประเภทยานพาหนะ</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-900 font-medium text-sm">{tripData.selectedVehicle}</span>
              </div>
              <div className="flex items-center gap-1 text-black">
                <span className="text-sm">1-4</span>
                <UserIcon />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fare Card */}
      <div className="flex-1 px-4 py-2">
        <div className="relative bg-white rounded-[1.35rem] p-4 shadow-[0_7px_6px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-start">
            {/* ซ้าย */}
            <span className="text-[#191919] text-lg">ค่าเดินทาง</span>

            {/* ขวา */}
            <div className="flex flex-col items-end gap-1">
              <p className="text-[#8b8b8b] text-sm">ยอดในกระเป๋าเงิน</p>
              <div className="flex items-center gap-1">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/coin-OUznJyh5R9daRMCJS7DeYOrevKOvTX.png"
                  alt="coin"
                  className="w-5 h-5"
                />
                <span className="text-[#8b8b8b] text-base">100 บาท</span>
              </div>
            </div>
          </div>

          {/* ค่าเดินทางจริง */}
          <div className="flex items-center gap-3 mt-0.1">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/coin-OUznJyh5R9daRMCJS7DeYOrevKOvTX.png"
              alt="coin"
              className="w-10 h-10"
            />
            <span className="text-[#191919] text-xl">32 บาท</span>
          </div>
        </div>
      </div>

      {/* Next Step Button */}
      <div className="px-4 pb-8">
        <button
          className="w-full h-12 bg-[#e6a88a] hover:bg-[#e6a88a] text-black font-medium text-lg rounded-2xl border-2 border-[#B55C32]"
          onClick={() => setShowConfirmModal(true)}
        >
          ยืนยันและจ่ายค่าเดินทาง
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-full max-w-[180px] bg-white rounded-2xl p-4 mb-6 border-2 border-gray-400 shadow-md mx-auto">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-xl text-black">ค่าเดินทาง</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/coin-OUznJyh5R9daRMCJS7DeYOrevKOvTX.png"
                      alt="coin"
                      className="w-10 h-10"
                    />
                  <span className="text-2xl text-black">32 บาท</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-lg font-semibold text-black mb-2 leading-tight">เมื่อจองแล้วจะไม่สามารถแก้ไขได้</p>
                <p className="text-lg font-semibold text-black mb-6 leading-tight">และเงินในกระเป๋าจะถูกหักทันที</p>
              </div>

              <p className="text-base text-gray-700 font-medium">แน่ใจหรือไม่ว่าต้องการทำรายการจองนี้</p>
            </div>

            <div className="flex gap-6">
              <button
                className="flex-1 py-4 px-8 bg-white text-black rounded-full text-lg border-2 border-gray-400 transition-colors shadow-md"
                onClick={() => setShowConfirmModal(false)}
              >
                ยกเลิก
              </button>
              <button
                className="flex-1 py-4 px-8 bg-[#e6a88a] text-black rounded-full text-lg border-2 border-[#B55C32] transition-colors shadow-md"
                onClick={() => {
                  setShowConfirmModal(false)
                  router.push("/booking/success1")
                }}
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
