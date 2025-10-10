"use client"

import NavBar from "@/app/driver/components/navbar";
import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, Plus, Calendar, Clock, User, ChevronDown } from "lucide-react"
import { BackButton } from "@/app/components/share_component";
import { format, getDaysInMonth } from "date-fns"

function SimpleCalendar({ selectedDate, setSelectedDate }: { selectedDate: Date, setSelectedDate: (date: Date) => void }) {
  const [show, setShow] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth())
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear())

  const selectDate = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day)
    setSelectedDate(newDate)
    setShow(false)
  }

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  return (
    <div className="relative flex items-center space-x-2 px-3 py-2 rounded-md">
      <button onClick={() => setShow(!show)} className="flex items-center space-x-2">
        <span>{format(selectedDate, "dd/MM/yyyy")}</span>
        <Calendar className="h-5 w-5 text-[#B55C32]" />
      </button>

      {show && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-90 max-w-sm">
            <div className="flex justify-between mb-2">
              <button onClick={prevMonth}>{"<"}</button>
              <span>{format(new Date(currentYear, currentMonth), "MMMM yyyy")}</span>
              <button onClick={nextMonth}>{">"}</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => (
                <div key={d} className="text-gray-500">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: getDaysInMonth(new Date(currentYear, currentMonth)) }, (_, i) => (
                <button
                  key={i}
                  className={`p-2 rounded-lg hover:bg-blue-100 ${
                    selectedDate.getDate() === i + 1 &&
                    selectedDate.getMonth() === currentMonth &&
                    selectedDate.getFullYear() === currentYear
                      ? "bg-blue-500 text-white"
                      : "text-gray-700"
                  }`}
                  onClick={() => selectDate(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button className="mt-2 px-4 py-2 bg-gray-200 rounded-md" onClick={() => setShow(false)}>ปิด</button>
          </div>
        </div>
      )}
    </div>
  )
}

function TimePicker({ selectedTime, setSelectedTime }: { selectedTime: string, setSelectedTime: (time: string) => void }) {
  const [show, setShow] = useState(false)
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
  const minutes = ["00", "15", "30", "45"]

  const times = hours.flatMap(h => minutes.map(m => `${h}:${m}`))

  return (
    <div className="relative flex items-center">
      <button
        className="flex items-center bg-gray-100 rounded-full px-4 py-2"
        onClick={() => setShow(!show)}
      >
        <span className="mr-2">{selectedTime}</span>
        <Clock className="h-5 w-5 text-[#B55C32]" />
      </button>

      {show && (
        <div className="absolute top-full mt-2 bg-white border rounded shadow-lg z-50 max-h-60 overflow-y-auto">
          {times.map(time => (
            <button
              key={time}
              className={`w-full text-left px-4 py-2 hover:bg-blue-100 ${
                selectedTime === time ? "bg-blue-500 text-white" : "text-gray-700"
              }`}
              onClick={() => {
                setSelectedTime(time)
                setShow(false)
              }}
            >
              {time}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function VehiclePicker({ selectedVehicle, setSelectedVehicle }: { selectedVehicle: string, setSelectedVehicle: (v: string) => void }) {
  const [show, setShow] = useState(false)
  const vehicles = ["จักรยานยนต์","รถยนต์", "รถยนต์ขนาดใหญ่"]

  return (
    <div className="relative w-full">
      <button
        className="w-full justify-between bg-gray-100 border border-gray-100 text-[#191919] rounded-3xl px-4 py-2 flex items-center"
        onClick={() => setShow(!show)}
      >
        <span>{selectedVehicle || "เลือกยานพาหนะของคุณ"}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {show && (
        <div className="absolute w-full mt-2 bg-white border rounded shadow-lg z-50 max-h-60 overflow-y-auto">
          {vehicles.map(v => (
            <button
              key={v}
              className={`w-full text-left px-4 py-2 hover:bg-blue-100 ${
                selectedVehicle === v ? "bg-blue-500 text-white" : "text-gray-700"
              }`}
              onClick={() => {
                setSelectedVehicle(v)
                setShow(false)
              }}
            >
              {v}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


export default function Home() {
  const router = useRouter()
  const [locations, setLocations] = useState([
    "ฝั่งตรงข้ามเกกี 4",
    "หน้าตึก ECC",
    "ฝั่งตรงข้ามเกกี 4",
    "หน้าตึก ECC",
    "ฝั่งตรงข้ามเกกี 4",
  ])

  const [passengerCount, setPassengerCount] = useState(2)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState("12:00")
  const [selectedVehicle, setSelectedVehicle] = useState("")

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index))
  }

  const addLocation = () => {
    setLocations([...locations, "เพิ่มจุดรับ"])
  }

  return (
    <div className="bg-[#C5D4E8] min-h-screen w-full flex flex-col">

      {/* Back Button ด้านบนซ้าย */}
      <div className="w-full flex items-center justify-start px-6 mt-6">
          <BackButton />
      </div>

      {/* Header */}
      <div className="flex flex-col items-center px-6 mb-10 mt-6">
        <h1 className="text-4xl font-regular text-[#191919]">สร้างทริปปกติ</h1>
      </div>

      {/* Route Selection Card */}
      <div className="mx-4 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-regular text-center mb-6 text-[#191919]">เลือกจุดรับส่ง</h2>

          <div className="space-y-4">
            {locations.map((location, index) => (
              <div key={index} className="flex items-center space-x-3">
                {/* Icon Location */}
                <img
                  src="/location.png"
                  alt="pickup"
                  className="h-8 w-6 object-contain"
                />

                {/* จุดรับส่ง */}
                <div className="flex-1 bg-gray-100 rounded-3xl px-4 py-3 flex items-center justify-between">
                  <span className="text-[#191919]">{location}</span>
                  <button
                    className="h-6 w-6 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                    onClick={() => removeLocation(index)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add Location Button */}
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-black rounded-full flex-shrink-0" />
              <button
                className="flex-1 bg-gray-100 rounded-3xl px-4 py-3 flex items-center justify-between text-gray-500 hover:bg-gray-200"
                onClick={addLocation}
              >
                <span>เพิ่มจุดรับ</span>
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Date, Time, Vehicle, Passenger Card */}
      <div className="mx-4 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">

          {/* Date */}
          <div className="flex items-center justify-between">
            <span className="text-[#191919] font-light">วันที่</span>
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <SimpleCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            </div>
          </div>

          {/* Time */}
          <div className="py-2">
            <span className="text-[#191919] font-medium">เวลา ที่สามารถออกรับผู้โดยสารได้</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#191919] font-medium">ออกเดินทาง</span>
            <TimePicker selectedTime={selectedTime} setSelectedTime={setSelectedTime} />
          </div>

          {/* Vehicle Type */}
          <div className="pt-2">
            <span className="text-[#191919] font-medium">ยานพาหนะ</span>
            <div className="mt-2">
              <VehiclePicker selectedVehicle={selectedVehicle} setSelectedVehicle={setSelectedVehicle} />
            </div>
          </div>

          {/* Passenger Count */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[#191919] font-medium">จำนวนคนนั่ง</span>
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <User className="h-4 w-4 mr-2 text-[#191919]" />
              <span className="text-[#191919] font-medium">{passengerCount}</span>
              <div className="ml-2 flex flex-col">
                <button
                  className="h-4 w-4 p-0 text-[#191919] flex items-center justify-center"
                  onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                >
                  <ChevronDown className="h-3 w-3 rotate-180" />
                </button>
                <button
                  className="h-4 w-4 p-0 text-[#191919] flex items-center justify-center"
                  onClick={() => setPassengerCount(passengerCount + 1)}
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ปุ่มยืนยัน ใต้กล่องนี้ */}
        <div className="mt-4 flex justify-center">
          <button
            className="w-[100%] bg-[#B55C32] text-white font-regular py-3 rounded-3xl shadow-lg hover:bg-[#944724]"
            onClick={() => {
              // ใส่ logic ยืนยันข้อมูลที่นี่
              console.log("ยืนยัน:", { locations, selectedDate, selectedTime, selectedVehicle, passengerCount });
              router.push("/driver/booking/normal/map");
            }}
          >
            ยืนยัน
          </button>
        </div>
      </div>

      {/* Navbar ด้านล่าง */}
      <div className="fixed bottom-0 w-full">
        <NavBar />
      </div>
      <div className="h-20" />
    </div>
  )
}
