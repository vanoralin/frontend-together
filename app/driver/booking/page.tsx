"use client";
import React, { useState, useEffect } from "react";
import NavBar from "@/app/driver/components/navbar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BackButton } from "@/app/components/share_component";
import { X, Plus,} from "lucide-react"
import { format } from "date-fns"
import MapComponent from "@/app/components/MapComponent";
import CalendarComponent from "@/app/components/Calendar";
import { Calendar, ChevronDown } from "lucide-react";

// --- Icon ---
function CalendarIcon() {
  return (
    <svg className="w-5 h-5 text-[#B55C32]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 4H18V2H16V4H8V2H6V4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM5 7V6H19V7H5Z"/>
    </svg>
  )
}

const ClockIcon = () => (
  <svg className="w-5 h-5 text-[#B55C32]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L12 13V7H12.5V12.2L17,14.7L16.2,16.2Z" />
  </svg>
)

const ProfileIcon = () => <img src="/icon_nav_profile.svg" alt="profile" className="w-5 h-5" style={{ filter: "brightness(0)" }}/>

// --- LocationBox ---
function LocationBox({ value, onClear, showLine = false }: { value: string; onClear: () => void; showLine?: boolean }) {
  return (
    <div className="relative w-full flex items-center">
      <div className="relative z-20 flex-shrink-0 mr-2">
        <img src="/location.png" alt="location" className="w-7 h-7 object-contain" />
      </div>
      {showLine && <div className="absolute left-[13px] top-[30px] bottom-[-25px] border-l-2 border-black z-0" />}
      <div className="relative z-10 flex items-center justify-between bg-[#8B8B8B]/10 rounded-full px-4 py-2 w-full ">
        <span className="text-black text-base ml-1">{value}</span>
        {onClear && (
          <button
            onClick={onClear}
            className="text-gray-500 hover:text-red-500 text-3xl font-light flex items-center justify-center w-8 h-8 "
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

// --- Simple Calendar ---
function SimpleCalendar({ selectedDate, setSelectedDate }: { selectedDate: Date, setSelectedDate: (date: Date) => void }) {
  const [show, setShow] = useState(false)

  const selectDate = (day: number) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
    setSelectedDate(newDate)
    setShow(false)
  }

  const prevMonth = () => {
    const prev = new Date(selectedDate)
    prev.setMonth(prev.getMonth() - 1)
    setSelectedDate(prev)
  }

  const nextMonth = () => {
    const next = new Date(selectedDate)
    next.setMonth(next.getMonth() + 1)
    setSelectedDate(next)
  }

  return (
    <div className="relative flex items-center space-x-2 px-3 py-2 rounded-md">
      <button onClick={() => setShow(!show)} className="flex items-center space-x-2">
        <span>{format(selectedDate, "dd/MM/yyyy")}</span>
        <CalendarIcon />
      </button>

      {show && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-90 max-w-sm">
            <div className="flex justify-between mb-2">
              <button onClick={prevMonth}>{"<"}</button>
              <span>{format(selectedDate, "MMMM yyyy")}</span>
              <button onClick={nextMonth}>{">"}</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => (
                <div key={d} className="text-gray-500">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: 31 }, (_, i) => (
                <button
                  key={i}
                  className={`p-2 rounded-lg hover:bg-blue-100 ${
                    selectedDate.getDate() === i + 1 ? "bg-blue-500 text-white" : "text-gray-700"
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

// --- Time Picker ---
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
        <ClockIcon />
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

// --- Vehicle Picker ---
function VehiclePicker({ selectedVehicle, setSelectedVehicle }: { selectedVehicle: string, setSelectedVehicle: (v: string) => void }) {
  const [show, setShow] = useState(false)
  const vehicles = ["จักรยานยนต์","รถยนต์","รถยนต์ขนาดใหญ่"]

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

// --- Main Home Component ---
export default function Home() {
  const router = useRouter()

// --- Location ---
const [location1, setLocation1] = useState("ฝั่งตรงข้ามเกกี 4");
const [location2, setLocation2] = useState("หน้าตึก ECC");

  return (
    <div className="bg-[#C5D4E8] min-h-screen w-full flex flex-col items-center pb-[140px]">
      <Header
        location1={location1}
        location2={location2}
        clearLocation1={() => setLocation1("")}
        clearLocation2={() => setLocation2("")}
      />
    </div>
  );
}

function Header({
  location1,
  location2,
  clearLocation1,
  clearLocation2,
}: {
  location1: string;
  location2: string;
  clearLocation1: () => void;
  clearLocation2: () => void;
}) {

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
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");

  const [selected, setSelected] = useState<Date[]>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState("08:00");
  const [selectedEndTime, setSelectedEndTime] = useState("17:00");

  const router = useRouter();

  // --- Popup ---
  const [showPopup, setShowPopup] = useState(false);
    
  const timeOptions = [
    "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
    "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
  ];
    
  const formatThaiDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  // --- Next Step ---
  const handleNextStep = () => setPage("confirm");
  const handleConfirm = () => setShowPopup(true);
  const handleCancelPopup = () => setShowPopup(false);
  const handleAgree = () => {
    setShowPopup(false);
    router.push("/customer/home");
  };
    
    useEffect(() => {
    if (selected.length > 0) {
      const sorted = [...selected].sort((a, b) => a.getTime() - b.getTime());
      setStartDate(formatThaiDate(sorted[0]));
      setEndDate(formatThaiDate(sorted[sorted.length - 1]));
    } else {
      setStartDate(null);
      setEndDate(null);
    }
    }, [selected]);
    
      const toggleStartPicker = () => {
        setShowStartTimePicker(!showStartTimePicker);
        setShowEndTimePicker(false);
      };
      const toggleEndPicker = () => {
        setShowEndTimePicker(!showEndTimePicker);
        setShowStartTimePicker(false);
      };
    

  const removeLocation = (index: number) => setLocations(locations.filter((_, i) => i !== index))
  const addLocation = () => setLocations([...locations, "เพิ่มจุดรับ"])

  type PageType = "type" | "create" | "map" | "package" | "package1" | "package2" | "confirm";
  const [page, setPage] = useState<PageType>("type");

  // ================= Pages =================
  const renderTypePage = () => (
      <div className="bg-[#ffffff] min-h-screen w-full flex flex-col items-center pb-[140px] relative">
        <div className="w-full flex items-center justify-start px-6 mt-6" style={{ cursor: "pointer" }}>
          <BackButton />
        </div>
        <div className="flex flex-col mt-20 items-start w-80">
          <h1 className="text-4xl font-semibold text-[#191919] mb-2">สร้างทริป</h1>
          <p className="text-base text-[#191919] leading-relaxed">เพื่อออกเดินทางไปยังที่ที่คุณต้องการได้ง่าย ๆ</p>
        </div>
        <div className="w-full px-6 mt-8 space-y-5">
          <button
            className="w-full bg-[#C5D4E8] rounded-2xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 active:shadow-md"
            onClick={()=>setPage("create")}
          >
            <div className="text-left">
              <h2 className="text-lg font-semibold text-[#191919] mb-1">สร้างทริปแบบปกติ</h2>
              <p className="text-sm text-[#191919]">เดินทางเพียงครั้งเดียว</p>
            </div>
          </button>
          <button
            className="w-full bg-[#C5D4E8] rounded-2xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 active:shadow-md"
            onClick={()=>setPage("package")}
          >
            <div className="text-left">
              <h2 className="text-lg font-semibold text-[#191919] mb-1">สร้างทริปแบบขาประจำ</h2>
              <p className="text-sm text-[#191919] leading-relaxed">เลือกวันและเวลาที่ต้องการเดินทางเป็นประจำ</p>
            </div>
          </button>
        </div>
        <div className="flex justify-center items-end h-[320px] mt-8">
          <img src="/homeBK.png" alt="Booking illustration" className="w-full max-w-[280px] h-auto object-contain" />
        </div>
      </div>
    );
  
  const renderCreatePage = () => (
    <div className="bg-[#C5D4E8] min-h-screen w-full flex flex-col">
      <div className="w-full flex items-center justify-start px-6 mt-6" style={{ cursor: "pointer" }}>
        <BackButton />
      </div>
      <div className="flex flex-col items-center px-6 mb-10 mt-6">
        <h1 className="text-4xl font-regular text-[#191919]">สร้างทริปปกติ</h1>
      </div>
      {/* Route Selection Card */}
            <div className="mx-4 mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-regular text-center mb-6 text-[#191919]">เลือกจุดรับส่ง</h2>
      
                <div className="space-y-4 relative">
                  {locations.map((location, index) => (
                    <div key={index} className="flex items-start space-x-3 relative">
      
                      <div className="flex flex-col items-center relative">
                        <img
                          src="/location.png"
                          alt="pickup"
                          className="h-8 w-6 mt-2 object-contain z-10"
                        />
                        {index < locations.length - 1 && (
                          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[2px] h-12 bg-black" />
                        )}
                      </div>
      
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
                  <SimpleCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
                </div>
      
                {/* Time */}
                <div className="py-2">
                  <span className="text-[#191919] font-light">เวลา ที่สามารถออกรับผู้โดยสารได้</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#191919] font-light">ออกเดินทาง</span>
                  <TimePicker selectedTime={selectedTime} setSelectedTime={setSelectedTime} />
                </div>
      
                {/* Vehicle Type */}
                <div className="pt-2">
                  <span className="text-[#191919] font-light">ยานพาหนะ</span>
                  <div className="mt-2">
                    <VehiclePicker selectedVehicle={selectedVehicle} setSelectedVehicle={setSelectedVehicle} />
                  </div>
                </div>
      
                {/* Passenger Count */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[#191919] font-light">จำนวนคนนั่ง</span>
                  <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                    <ProfileIcon />
                    <span className="text-[#191919] font-light ml-2">{passengerCount}</span>
                    <div className="ml-2 flex flex-col">
                      <button
                        className="h-4 w-4 p-0 flex items-center justify-center"
                        onClick={() => setPassengerCount(passengerCount + 1)}
                      >
                        <img src="/arrow-up.png" alt="up" className="h-3 w-3" />
                      </button>
                      <button
                        className="h-4 w-4 p-0 flex items-center justify-center"
                        onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                      >
                        <img src="/arrow-down.png" alt="down" className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
      
              </div>
      
              {/* Confirm Button */}
              <div className="mt-4 flex justify-center">
                <button
                  className="w-[100%] bg-[#B55C32] text-white font-light py-3 rounded-3xl shadow-lg hover:bg-[#944724]"
                  onClick={() => setPage("map")}
                >
                  ยืนยัน
                </button>
              </div>
            </div>
      <div className="fixed bottom-0 w-full">
        <NavBar />
      </div>
      <div className="h-20" />
    </div>
  );

  const renderMapPage = () => (
    <div className="bg-[#ffffff] min-h-screen w-full flex flex-col items-center pb-[140px] relative">
      <div className="w-full flex flex-col items-center px-6 mt-2">
        <div className="w-full max-w-md flex items-center mt-2">
          <BackButton />
        </div>

        <div className="flex-1 text-center py-9">
        </div>

        {/* แผนที่ */}
        <div className="w-full max-w-md h-[700px] border-[1px] border-[#8B8B8B] rounded-2xl overflow-hidden">
          <MapComponent />
        </div>
      </div>
    </div>
  );

  const renderPackagePage = () => (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-[#FFFFFF] to-[#C5D4E8]">
      <div>
        <div className="w-full flex items-center justify-start px-6 mt-6">
          <BackButton />
        </div>
      
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
              onClick={() => setPage("package1")}
          >
            สร้างแพ็คเกจทริปขาประจำ
          </button>
        </div>
      </div>
    </div>
  );

  const renderPackage1Page = () => ( 
    <div className="w-full flex flex-col items-center px-6 mt-2">
          <div className="w-full max-w-md flex items-center mt-2">
            <BackButton />
          </div>
    
          <div className="flex-1 text-center py-9">
            <h1 className="text-lg text-black font-light">การจองทริปขาประจำ หน้า 1/3</h1>
            <p className="text-xl font-regular text-black">เลือกจุดรับส่ง</p>
          </div>
    
          {/* กล่องจุดรับส่ง */}
          <div className="w-full max-w-md bg-white font-light rounded-2xl p-4 shadow-md shadow-black/50 mb-4">
            <div className="flex flex-col gap-3 relative">
              <LocationBox value={location1} onClear={clearLocation1} showLine />
              <LocationBox value={location2} onClear={clearLocation2} />
            </div>
          </div>
    
          {/* แผนที่ */}
          <div className="w-full max-w-md h-[450px] border-[1px] border-[#8B8B8B] rounded-2xl overflow-hidden">
            <MapComponent />
          </div>
    
          {/* ปุ่มถัดไป */}
          <div className="mt-4 w-full max-w-md">
            <button
              className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl shadow-md hover:bg-[#d9956f] transition-colors duration-200"
              onClick={() => setPage("package2")}
            >
              ขั้นตอนถัดไป
            </button>
          </div>
    </div>
  );

    const renderPackage2Page = () => ( 
    <div className="bg-[#C5D4E8] min-h-screen w-full flex flex-col items-center pb-20 px-1.5">
      <div className="flex flex-col items-center mt-8 w-full max-w-3xl px-4 mx-auto">
        <div className="w-full flex items-center mb-4">
          <BackButton />
        </div>

        <div className="text-center mt-1 mb-6">
          <h1 className="text-lg font-light text-black">
            การจองทริปขาประจำ หน้า 2/3
          </h1>
          <h1 className="text-xl font-regular text-black">
            เลือกวันที่และเวลาที่ต้องการ
          </h1>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <p className="text-sm font-light text-black">ตั้งแต่</p>
          <div className="px-3 py-2 bg-white rounded-2xl shadow text-sm font-light shadow-md shadow-black/50">
            {startDate ?? "--/--/----"}
          </div>
          <p className="text-sm font-light text-black">ถึง</p>
          <div className="px-3 py-2 bg-white rounded-2xl shadow text-sm font-light shadow-md shadow-black/50">
            {endDate ?? "--/--/----"}
          </div>
        </div>

        <div className="font-light w-full bg-white rounded-2xl shadow p-4 mb-6 shadow-md shadow-black/50">
          <CalendarComponent selected={selected} setSelected={setSelected} />
          <p className="text-l font-light text-center text-[#B55C32]">
            จิ้มที่วันที่เพื่อเลือก - จิ้มอีกครั้งเพื่อยกเลิก
          </p>
        </div>

        <div className="w-full bg-white rounded-2xl shadow p-6 mb-6 text-center shadow-md shadow-black/50">
          <p className="text-black font-light mb-2">คุณเลือกไปแล้ว</p>
          <div className="flex justify-center items-center gap-2 text-[#B55C32] text-2xl font-light">
            <Calendar className="h-8 w-8" />
            {selected.length} วัน
          </div>

          <div className="mt-6">
            <p className="text-black font-light mb-2">เวลา ที่ออกเดินทาง</p>
            <div className="flex items-center justify-center gap-8 mb-4">
              {/* เวลาเริ่ม */}
              <div className="relative flex flex-col items-center">
                <span className="text-[#191919] font-light mb-1">ตั้งแต่</span>
                <div
                  className="flex items-center bg-[#8B8B8B]/10 px-3 py-1 rounded-full cursor-pointer"
                  onClick={toggleStartPicker}
                >
                  <ClockIcon />
                  <span className="ml-2 text-[#191919] font-light text-base">
                    {selectedStartTime}
                  </span>
                </div>
                {showStartTimePicker && (
                  <div className="absolute z-50 mt-14 w-20 max-h-40 overflow-y-auto bg-white border rounded shadow-md font-light animate-fadeIn">
                    {timeOptions.map((time) => (
                      <div
                        key={time}
                        className={`px-3 py-1 cursor-pointer hover:bg-gray-200 ${
                          time === selectedStartTime ? "bg-[#b55c32] text-white" : ""
                        }`}
                        onClick={() => {
                          setSelectedStartTime(time);
                          setShowStartTimePicker(false);
                        }}
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* เวลาสิ้นสุด */}
              <div className="relative flex flex-col items-center">
                <span className="text-[#191919] font-light mb-1">ถึง</span>
                <div
                  className="flex items-center bg-[#8B8B8B]/10 px-3 py-1 rounded-full cursor-pointer"
                  onClick={toggleEndPicker}
                >
                  <ClockIcon />
                  <span className="ml-2 text-[#191919] font-light text-base">
                    {selectedEndTime}
                  </span>
                </div>
                {showEndTimePicker && (
                  <div className="absolute z-50 mt-14 w-20 max-h-40 overflow-y-auto bg-white border rounded shadow-md font-light animate-fadeIn">
                    {timeOptions.map((time) => (
                      <div
                        key={time}
                        className={`px-3 py-1 cursor-pointer hover:bg-gray-200 ${
                          time === selectedEndTime ? "bg-[#b55c32] text-white" : ""
                        }`}
                        onClick={() => {
                          setSelectedEndTime(time);
                          setShowEndTimePicker(false);
                        }}
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Picker */}
            <div className="pt-2 w-full">
              <span className="text-[#191919] font-light">ยานพาหนะ</span>
              <div className="mt-2">
                <VehiclePicker
                  selectedVehicle={selectedVehicle}
                  setSelectedVehicle={setSelectedVehicle}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 w-full max-w-3xl px-2">
          <button
            className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl shadow-md hover:bg-[#944724] transition-colors duration-200"
            onClick={() => setPage("confirm")}
          >
            ขั้นตอนถัดไป
          </button>
        </div>
      </div>
    </div>
  );

  const renderConfirmPage = () => ( 
    <div className="bg-[#C5D4E8] min-h-screen w-full flex flex-col items-center pb-20 px-6">
          {/* BackButton */}
          <div className="w-full max-w-md flex items-center mt-4">
            <BackButton />
          </div>
    
          {/* หัวข้อ */}
          <div className="flex-1 text-center mt-4 py-5">
            <h1 className="text-lg text-black font-light">การจองทริปขาประจำ หน้า 3/3</h1>
            <p className="text-xl font-normal text-black mt-2">ยืนยันการจอง</p>
            <p className="text-xl font-light text-[#B55C32] mt-2">กรุณาตรวจสอบรายการเดินทาง</p>
          </div>
    
          {/* กล่องจุดรับส่ง */}
          <div className="w-full max-w-md bg-white font-light rounded-2xl p-4 shadow-md shadow-black/50 mb-4">
            <div className="flex flex-col gap-3 relative">
              <LocationBox value={location1} onClear={clearLocation1} showLine />
              <LocationBox value={location2} onClear={clearLocation2} />
            </div>
          </div>
    
          {/* ปฏิทิน */}
          <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-6 font-light">
            <CalendarComponent selected={selected} setSelected={setSelected} />
            <p className="text-lg font-light text-center text-[#B55C32] mt-3">
              จิ้มที่วันที่เพื่อเลือก - จิ้มอีกครั้งเพื่อยกเลิก
            </p>
          </div>
    
          {/* สรุปผลเลือกแล้ว */}
          <div className="w-full max-w-md bg-white rounded-2xl p-6 mb-6 text-center shadow-md shadow-black/50 font-light">
            <p className="text-black mb-2">คุณเลือกไปแล้ว</p>
            <div className="flex justify-center items-center gap-2 text-[#B55C32] text-2xl">
              <Calendar className="h-8 w-8" />
              {selected.length} วัน
            </div>
    
            {/* เลือกเวลา */}
            <div className="mt-6">
              <p className="text-black mb-2">เวลา ที่ออกเดินทาง</p>
              <div className="flex items-center justify-center gap-8 mb-4">
                
                {/* เวลาเริ่ม */}
                <div className="relative flex flex-col items-center">
                  <span className="text-[#191919] font-light mb-1">ตั้งแต่</span>
                  <div
                    className="flex items-center bg-[#8B8B8B]/10 px-3 py-1 rounded-full cursor-pointer"
                    onClick={toggleStartPicker}
                  >
                    <ClockIcon />
                    <span className="ml-2 text-[#191919] font-light text-base">
                      {selectedStartTime}
                    </span>
                  </div>
                  {showStartTimePicker && (
                    <div className="absolute top-full mt-1 w-20 max-h-40 overflow-y-auto bg-white border rounded shadow-md font-light z-50">
                      {timeOptions.map((time) => (
                        <div
                          key={time}
                          className={`px-3 py-1 cursor-pointer hover:bg-gray-200 ${
                            time === selectedStartTime ? "bg-[#b55c32] text-white" : ""
                          }`}
                          onClick={() => {
                            setSelectedStartTime(time);
                            setShowStartTimePicker(false);
                          }}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
    
                {/* เวลาสิ้นสุด */}
                <div className="relative flex flex-col items-center">
                  <span className="text-[#191919] font-light mb-1">ถึง</span>
                  <div
                    className="flex items-center bg-[#8B8B8B]/10 px-3 py-1 rounded-full cursor-pointer"
                    onClick={toggleEndPicker}
                  >
                    <ClockIcon />
                    <span className="ml-2 text-[#191919] font-light text-base">
                      {selectedEndTime}
                    </span>
                  </div>
                  {showEndTimePicker && (
                    <div className="absolute top-full mt-1 w-20 max-h-40 overflow-y-auto bg-white border rounded shadow-md font-light z-50">
                      {timeOptions.map((time) => (
                        <div
                          key={time}
                          className={`px-3 py-1 cursor-pointer hover:bg-gray-200 ${
                            time === selectedEndTime ? "bg-[#b55c32] text-white" : ""
                          }`}
                          onClick={() => {
                            setSelectedEndTime(time);
                            setShowEndTimePicker(false);
                          }}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
    
              {/* Vehicle Picker */}
              <div className="pt-2 w-full">
                <span className="text-[#191919] font-light">ยานพาหนะ</span>
                <div className="mt-2">
                  <VehiclePicker
                    selectedVehicle={selectedVehicle}
                    setSelectedVehicle={setSelectedVehicle}
                  />
                </div>
              </div>
            </div>
          </div>
    
          {/* ปุ่มยืนยัน */}
          <div className="w-full max-w-md">
            <button
              onClick={handleConfirm}
              className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl hover:bg-[#d9956f] transition-colors duration-200"
            >
              ยืนยันและจ่ายค่าเดินทาง
            </button>
          </div>
    
          {/* Popup ยืนยัน */}
          {showPopup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-lg w-[80%] max-w-[350px] p-6 text-center overflow-y-auto max-h-[90vh]">
    
                {/* ข้อความยืนยัน */}
                <p className="text-[#191919] text-m font-semibold mb-2">
                  เมื่อจองแล้วจะไม่สามารถแก้ไขได้
                </p>
                <p className="text-[#191919] text-sm font-light mb-4">
                  แน่ใจหรือไม่ว่าต้องการทำรายการจองนี้
                </p>
    
                {/* ปุ่มยืนยัน / ยกเลิก */}
                <div className="flex justify-between mt-5">
                  <button
                    onClick={handleCancelPopup}
                    className="flex-1 bg-white border border-[#B5B5B5] text-[#191919] py-2 rounded-3xl mr-2"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleAgree}
                    className="flex-1 bg-[#E6A88A] border border-[#B55C32] text-[#191919] py-2 rounded-3xl ml-2"
                  >
                    ตกลง
                  </button>
                </div>
              </div>
            </div>
             )}
    </div>
  );

  
  return (
    <>
      {page === "type" && renderTypePage()}
      {page === "create" && renderCreatePage()}
      {page === "map" && renderMapPage()}
      {page === "package" && renderPackagePage()}
      {page === "package1" && renderPackage1Page()}
      {page === "package2" && renderPackage2Page()}
      {page === "confirm" && renderConfirmPage()}
    </>
  );
}
