"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

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

export default function BookingPage() {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<"motorcycle" | "car">("motorcycle")
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#C5DEDA] max-w-sm mx-auto p-6">
      {/* Back Button */}
      <button
        className="w-12 h-12 bg-[#191919] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 mb-6"
        onClick={() => router.back()}
      >
        <img src="/arrow.png" alt="Back" className="w-6 h-6 filter invert" />
      </button>

      <h1 className="text-4xl font-bold text-gray-900 text-center mb-8 leading-tight">
        จองทริปแบบ<br />ขาประจำ
      </h1>

      <div className="flex justify-center mb-8">
        <img src="/notebook with sticker.png" alt="Booking illustration" className="w-full max-w-[180px] h-auto object-contain" />
      </div>

      <p className="text-center text-gray-700 text-medium mb-8">
        จ่าย 1 ครั้ง เดินทางกี่ครั้งก็ได้<br />
        ภายใน 4 สัปดาห์
      </p>

      {/* Options */}
      <div className="space-y-4 mb-6">
        {/* Motorcycle Option */}
        <div className="flex items-center gap-4">
          <div
            className={`w-8 h-8 rounded-full border-3 flex items-center justify-center transition-all cursor-pointer ${
              selectedOption === "motorcycle" ? "bg-[#B8764F] border-[#B8764F]" : "border-[#B8764F] bg-transparent"
            }`}
            onClick={() => setSelectedOption("motorcycle")}
          >
            {selectedOption === "motorcycle" && <Check className="w-5 h-5 text-white stroke-[3]" />}
          </div>

          <div
            className="flex-1 p-6 rounded-3xl cursor-pointer transition-all shadow-lg bg-white border-2 border-gray-200"
            onClick={() => setSelectedOption("motorcycle")}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-medium text-gray-900">เดินทางด้วย</span>
                  <img src="/motorcycle.png" alt="motorcycle" className="w-6 h-6 object-contain" />
                  <span className="text-lg font-medium text-gray-900">จักรยานยนต์</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#F4B942] rounded-full flex items-center justify-center">
                    <span className="text-black text-sm font-bold">฿</span>
                  </div>
                  <span className="text-lg font-medium text-gray-900">เริ่มต้น 650 บาท/4 สัปดาห์</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Car Option */}
        <div className="flex items-center gap-4">
          <div
            className={`w-8 h-8 rounded-full border-3 flex items-center justify-center transition-all cursor-pointer ${
              selectedOption === "car" ? "bg-[#B8764F] border-[#B8764F]" : "border-[#B8764F] bg-transparent"
            }`}
            onClick={() => setSelectedOption("car")}
          >
            {selectedOption === "car" && <Check className="w-5 h-5 text-white stroke-[3]" />}
          </div>

          <div
            className="flex-1 p-6 rounded-3xl cursor-pointer transition-all shadow-lg bg-white border-2 border-gray-200"
            onClick={() => setSelectedOption("car")}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-medium text-gray-900">เดินทางด้วย</span>
                  <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                  </svg>
                  <span className="text-lg font-medium text-gray-900">รถยนต์</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#F4B942] rounded-full flex items-center justify-center">
                    <span className="text-black text-sm font-bold">฿</span>
                  </div>
                  <span className="text-lg font-medium text-gray-900">เริ่มต้น 1000 บาท/4 สัปดาห์</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-[#B8764F] text-center leading-relaxed mb-1">
        หมายเหตุ: จุดรับ/ส่ง และเวลา จะเหมือนเดิมทุกครั้ง<br />
        <div className="bg-white rounded-3xl p-2 mb-3 shadow-lg">
        <div className="flex items-center justify-center gap-8">
          <span className="text-sm text-gray-800">ยอดในกระเป๋าเงิน</span>
          <div className="w-8 h-8 bg-[#F4B942] rounded-full flex items-center justify-center">
            <span className="text-white text-sm">฿</span>
          </div>
          <span className="text-sm text-gray-800">100 บาท</span>
        </div>
      </div>
      </p>

      <button
        className="w-full bg-orange-400 hover:bg-orange-500 text-white font-medium py-4 rounded-2xl text-base"
        onClick={() => setShowConfirmModal(true)}
      >
        ซื้อแพ็คเกจครั้งประจำ
      </button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-bold text-center mb-4">ยืนยันการซื้อแพ็คเกจ</h2>
            <p className="text-gray-700 text-sm text-center mb-6">เมื่อซื้อแล้วจะไม่สามารถแก้ไขได้</p>
            <div className="flex gap-4">
              <button
                className="flex-1 py-3 bg-gray-200 rounded-full text-black"
                onClick={() => setShowConfirmModal(false)}
              >
                ยกเลิก
              </button>
              <button
                className="flex-1 py-3 bg-orange-400 rounded-full text-white"
                onClick={() => {
                  setShowConfirmModal(false)
                  router.push("/success") // redirect page แทน alert
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
