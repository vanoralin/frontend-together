"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

// --- Custom SVG icons ---
const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L12 13V7H12.5V12.2L17,14.7L16.2,16.2Z" />
  </svg>
)

const UserIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
)

const ChevronUpIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41-1.41z" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
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
        onClick={() => router.push("/booking/create")}
      >
        <img src="/arrow.png" alt="Back" className="w-6 h-6 filter invert" />
      </button>
      <div className="flex-1 text-center -ml-10">
        <h1 className="text-lg font-medium text-black">การจองทริปใหม่ หน้า 1/3</h1>
        <p className="text-lg font-bold text-black">เลือกจุดรับส่ง</p>
      </div>
    </div>
  )
}

// --- Main Page ---
export default function RideBookingPage() {
  const router = useRouter()

  const [pickup, setPickup] = useState("")
  const [dropoff, setDropoff] = useState("")
  const [passengerCount, setPassengerCount] = useState(2)
  const [selectedVehicle, setSelectedVehicle] = useState("รถยนต์")
  const [selectedDate, setSelectedDate] = useState("27/07/2568")
  const [selectedStartTime, setSelectedStartTime] = useState("12:00")
  const [selectedEndTime, setSelectedEndTime] = useState("12:20")
  const [showDatePicker, setShowDatePicker] = useState(false)

  const timeOptions = [
    "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
    "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
  ]

  const handlePassengerIncrement = () => passengerCount < 6 && setPassengerCount(passengerCount + 1)
  const handlePassengerDecrement = () => passengerCount > 1 && setPassengerCount(passengerCount - 1)
  const handleVehicleSelect = (vehicle: string) => setSelectedVehicle(vehicle)

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value)
    const thaiYear = date.getFullYear() + 543
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    setSelectedDate(`${day}/${month}/${thaiYear}`)
    setShowDatePicker(false)
  }

  const handleStartTimeSelect = (time: string) => setSelectedStartTime(time)
  const handleEndTimeSelect = (time: string) => setSelectedEndTime(time)

  return (
    <div className="bg-[#c5deda] flex flex-col max-w-sm mx-auto rounded-3xl overflow-hidden min-h-[844px]">
      <TripBookingHeader />

      {/* Location Input Fields */}
      <div className="flex-1 px-4 py-3">
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

      {/* Booking Details Card */}
      <div className="flex-1 px-4 py-3">
      <div className="relative bg-white rounded-[1.35rem] p-4 shadow-[0_7px_6px_rgba(0,0,0,0.5)]">
        {/* Date */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[#191919] text-lg">วันที่</span>
          <span className="text-[#191919] text-lg font-medium">{selectedDate}</span>
          <button onClick={() => setShowDatePicker(!showDatePicker)}>
            <CalendarIcon />
          </button>
        </div>

        {showDatePicker && (
          <div className="mb-6">
            <input
              type="date"
              onChange={handleDateChange}
              className="w-full p-3 border border-[#d9d9d9] rounded-lg text-[#191919] focus:outline-none focus:border-[#b55c32]"
            />
          </div>
        )}

        {/* Available Time */}
        <div className="mb-6">
          <p className="text-[#191919] text-lg mb-4">เวลา ที่สามารถจองได้</p>
          <div className="flex justify-between items-center mb-6">
            {/* Start Time */}
            <div className="text-center">
              <p className="text-[#8b8b8b] text-sm mb-2">ตั้งแต่</p>
              <div className="relative">
                <button
                  onClick={() => document.getElementById("start-time-select")?.focus()}
                  className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <span className="text-[#191919] text-xl font-medium">{selectedStartTime}</span>
                  <ClockIcon />
                </button>
                <select
                  id="start-time-select"
                  value={selectedStartTime}
                  onChange={(e) => handleStartTimeSelect(e.target.value)}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* End Time */}
            <div className="text-center">
              <p className="text-[#8b8b8b] text-sm mb-2">ถึง</p>
              <div className="relative">
                <button
                  onClick={() => document.getElementById("end-time-select")?.focus()}
                  className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <span className="text-[#191919] text-xl font-medium">{selectedEndTime}</span>
                  <ClockIcon />
                </button>
                <select
                  id="end-time-select"
                  value={selectedEndTime}
                  onChange={(e) => handleEndTimeSelect(e.target.value)}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Count */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-[#191919] text-lg font-medium mb-1">จำนวนคนนั่ง</p>
            <p className="text-[#8b8b8b] text-sm">หากต้องการนั่มสำหรับขนาดใหญ่</p>
            <p className="text-[#8b8b8b] text-sm">กรุณาเพิ่มจำนวนคนอีก 1</p>
          </div>
          <div className="flex items-center bg-white border-2 border-[#191919] rounded-full px-4 py-2">
            <UserIcon />
            <span className="text-[#191919] text-lg font-medium mx-3">{passengerCount}</span>
            <div className="flex flex-col">
              <button onClick={handlePassengerIncrement} className="hover:bg-gray-100 rounded p-1 transition-colors">
                <ChevronUpIcon />
              </button>
              <button onClick={handlePassengerDecrement} className="hover:bg-gray-100 rounded p-1 transition-colors">
                <ChevronDownIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Vehicle Type Selection */}
        <div>
          <p className="text-[#191919] text-lg font-medium mb-4">เลือกประเภทพาหนะ</p>
          <div className="space-y-3">
            {["จักรยานยนต์","รถยนต์","รถยนต์ขนาดใหญ่"].map((vehicle) => (
              <button
                key={vehicle}
                onClick={() => handleVehicleSelect(vehicle)}
                className="w-full flex items-center justify-between hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full ${selectedVehicle === vehicle ? "bg-[#b55c32] flex items-center justify-center" : "bg-[#d9d9d9]"}`}>
                    {selectedVehicle === vehicle && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <span className={`text-lg ${selectedVehicle === vehicle ? "text-[#191919]" : "text-[#8b8b8b]"}`}>
                    {vehicle}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#8b8b8b] text-lg">
                    {vehicle === "จักรยานยนต์" ? "1" : vehicle === "รถยนต์" ? "1-4" : "1-6"}
                  </span>
                  <UserIcon />
                </div>
              </button>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* Next Step Button */}
      <div className="px-4 pb-8">
        <button
          className="w-full h-12 bg-[#e6a88a] hover:bg-[#e6a88a] text-black font-medium text-lg rounded-2xl border-2 border-[#B55C32]"
          onClick={() => router.push("/booking/mapdetail2")}
        >
          ขั้นตอนถัดไป
        </button>
      </div>
    </div>
  )
}
