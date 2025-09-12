"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface BookingData {
  pickup: string
  dropoff: string
  date: string
  departureTime: string
  arrivalTime: string
  passengers: number
  vehicleType: string
  fare: number
}

export default function BookingSuccessPage() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<BookingData | null>(null)

  useEffect(() => {
    const savedBookingData = localStorage.getItem("bookingData")
    if (savedBookingData) {
      setBookingData(JSON.parse(savedBookingData))
    }
  }, [])

  const handleBackToHome = () => {
    localStorage.removeItem("bookingData")
    router.push("/")
  }

  const handleViewBooking = () => {
    router.push("/booking/history")
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-[390px] mx-auto">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <h1 className="text-lg font-semibold text-center text-gray-900">การจองสำเร็จ</h1>
      </div>

      {/* Success Message */}
      <div className="p-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">จองสำเร็จแล้ว!</h2>
        <p className="text-gray-600 text-sm">การจองของคุณได้รับการยืนยันแล้ว</p>
      </div>

      {/* Booking Details Card */}
      <div className="mx-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">รายละเอียดการจอง</h3>

          {/* Route */}
          <div className="space-y-3 mb-4">
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mt-1"></div>
              <div>
                <p className="text-sm text-gray-500">จุดรับ</p>
                <p className="font-medium text-gray-900">{bookingData.pickup}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full mt-1"></div>
              <div>
                <p className="text-sm text-gray-500">จุดหมาย</p>
                <p className="font-medium text-gray-900">{bookingData.dropoff}</p>
              </div>
            </div>
          </div>

          {/* Trip Info */}
          <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-500">วันที่เดินทาง</p>
              <p className="font-medium text-gray-900">{bookingData.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">เวลา</p>
              <p className="font-medium text-gray-900">{bookingData.departureTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">จำนวนผู้โดยสาร</p>
              <p className="font-medium text-gray-900">{bookingData.passengers} คน</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ประเภทรถ</p>
              <p className="font-medium text-gray-900">{bookingData.vehicleType}</p>
            </div>
          </div>

          {/* Fare */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ค่าเดินทาง</span>
              <span className="text-xl font-bold text-gray-900">{bookingData.fare} บาท</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 space-y-3">
        <button
          onClick={handleViewBooking}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
        >
          ดูรายละเอียดการจอง
        </button>
        <button
          onClick={handleBackToHome}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors"
        >
          กลับหน้าหลัก
        </button>
      </div>

      {/* Support Info */}
      <div className="p-6 text-center">
        <p className="text-sm text-gray-500 mb-2">หากมีปัญหาหรือต้องการความช่วยเหลือ</p>
        <p className="text-sm text-emerald-600 font-medium">โทร 02-123-4567</p>
      </div>
    </div>
  )
}
