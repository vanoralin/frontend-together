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
        onClick={() => router.push("/bookcus/map")}
      >
        <img src="/arrow.png" alt="Back" className="w-6 h-6 filter invert" />
      </button>
      <div className="flex-1 text-center -ml-10">
        <h1 className="text-lg font-medium text-black">การจองทริปใหม่ หน้า 2/3</h1>
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
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const timeOptions = [
    "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
    "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
  ]

  const handlePassengerIncrement = () => {
    if (passengerCount < 6) {
      setPassengerCount(passengerCount + 1)
    }
  }

  const handlePassengerDecrement = () => {
    if (passengerCount > 1) {
      setPassengerCount(passengerCount - 1)
    }
  }

  const handleVehicleSelect = (vehicle: string) => {
    setSelectedVehicle(vehicle)
  }

  const handleStartTimeSelect = (time: string) => {
    setSelectedStartTime(time)
  }

  const handleEndTimeSelect = (time: string) => {
    setSelectedEndTime(time)
  }
  
  const handleNextStep = () => {
    console.log("[v0] Next step clicked with:", {
      passengerCount,
      selectedVehicle,
      selectedDate,
      selectedStartTime,
      selectedEndTime,
    })
    // Navigate to next step logic would go here
  }

  const handleCalendarClick = () => {
    setShowDatePicker(!showDatePicker)
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setShowDatePicker(false)
  }

  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const today = new Date()

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const day = date.getDate()
      const month = date.getMonth()
      const year = date.getFullYear()
      const buddhistYear = year + 543

      const isCurrentMonth = month === currentMonth
      const isToday = date.toDateString() === today.toDateString()
      const isSelected =
        selectedDate === `${day.toString().padStart(2, "0")}/${(month + 1).toString().padStart(2, "0")}/${buddhistYear}`

      days.push({
        date: date,
        day: day,
        month: month,
        year: year,
        buddhistYear: buddhistYear,
        dateString: `${day.toString().padStart(2, "0")}/${(month + 1).toString().padStart(2, "0")}/${buddhistYear}`,
        isCurrentMonth: isCurrentMonth,
        isToday: isToday,
        isSelected: isSelected,
      })
    }

    return days
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const getThaiMonthName = (month: number) => {
    const thaiMonths = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ]
    return thaiMonths[month]
  }

  const getThaiDayName = (day: number) => {
    const thaiDays = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]
    return thaiDays[day]
  }

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
            <button onClick={handleCalendarClick} className="hover:bg-gray-100 p-1 rounded transition-colors">
              <CalendarIcon />
            </button>
          </div>

          {showDatePicker && (
            <div className="absolute top-20 left-6 right-6 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
              <div className="p-4">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                  </button>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-[#191919]">
                      {getThaiMonthName(currentMonth)} {currentYear + 543}
                    </h3>
                  </div>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                    </svg>
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-[#8b8b8b] py-2">
                      {getThaiDayName(day)}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays().map((dayObj, index) => (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(dayObj.dateString)}
                      className={`
                        aspect-square flex items-center justify-center text-sm rounded-lg transition-colors
                        ${
                          dayObj.isSelected
                            ? "bg-[#b55c32] text-white font-semibold"
                            : dayObj.isToday
                              ? "bg-[#e6a88a] text-[#191919] font-semibold"
                              : !dayObj.isCurrentMonth
                                ? "text-[#8b8b8b] hover:bg-[#f5f5f5]"
                                : "text-[#191919] hover:bg-[#f5f5f5]"
                        }
                      `}
                    >
                      {dayObj.day}
                    </button>
                  ))}
                </div>

                {/* Calendar Footer */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-[#8b8b8b]">
                    <span>
                      วันนี้: {new Date().getDate()}/{(new Date().getMonth() + 1).toString().padStart(2, "0")}/
                      {new Date().getFullYear() + 543}
                    </span>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="text-[#b55c32] hover:text-[#191919] transition-colors"
                    >
                      ปิด
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Available Time */}
        <div className="mb-6">
          <p className="text-[#191919] text-lg mb-4">เวลา ที่สามารถรอรับได้</p>
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
            <p className="text-[#8b8b8b] text-sm">หากต้องการขนสัมภาระขนาดใหญ่</p>
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
          <p className="text-[#191919] text-lg font-medium mb-4">เลือกประเภทยานพาหนะ</p>
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

      {/* Fare Card */}
      <div className="flex-1 px-4 py-3">
      <div className="relative bg-white rounded-[1.35rem] p-4 shadow-[0_7px_6px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/coin-OUznJyh5R9daRMCJS7DeYOrevKOvTX.png"
                alt="coin"
                className="w-12 h-12"
              />
              <span className="text-[#191919] text-2xl font-medium">32 บาท</span>
            </div>
            <div className="text-right">
              <p className="text-[#8b8b8b] text-sm">ยอดในกระเป๋าเงิน</p>
              <div className="flex items-center gap-2">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/coin-OUznJyh5R9daRMCJS7DeYOrevKOvTX.png"
                  alt="coin"
                  className="w-6 h-6"
                />
                <span className="text-[#8b8b8b] text-lg">100 บาท</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Step Button */}
      <div className="px-4 pb-8">
        <button
          className="w-full h-12 bg-[#e6a88a] hover:bg-[#e6a88a] text-black font-medium text-lg rounded-2xl border-2 border-[#B55C32]"
          onClick={() => router.push("/bookcus/mapdetail2")}
        >
          ขั้นตอนถัดไป
        </button>
      </div>
    </div>
  )
}
