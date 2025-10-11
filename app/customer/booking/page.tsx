"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";
import MapComponent from "@/app/components/MapComponent";
import { FaMotorcycle, FaCar } from "react-icons/fa";
import CalendarComponent from "@/app/components/Calendar";

// --- Icon ---
const CalendarIcon = () => (
  <svg className="w-5 h-5 text-[#b55c32]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5 text-[#b55c32]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L12 13V7H12.5V12.2L17,14.7L16.2,16.2Z" />
  </svg>
);

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


// --- Main Component ---
export default function BookingMain() {
  const router = useRouter();


  const [selected, setSelected] = useState<"bike" | "car" | null>(null);

  type PageType = "type" | "location" | "rideDetail" | "confirm" | "package" | "package1" | "package2" | "package3";
  const [page, setPage] = useState<PageType>("type");

  // --- Location ---
  const [location1, setLocation1] = useState("ฝั่งตรงข้ามเกกี 4");
  const [location2, setLocation2] = useState("หน้าตึก ECC");

  // --- Ride Detail ---
  const [passengerCount, setPassengerCount] = useState(2);
  const [selectedVehicle, setSelectedVehicle] = useState("รถยนต์");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" })
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedStartTime, setSelectedStartTime] = useState("12:00");
  const [selectedEndTime, setSelectedEndTime] = useState("12:20");
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  
  const timeOptions = [
    "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
    "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
  ];

  // --- Popup ---
  const [showPopup, setShowPopup] = useState(false);

  // --- Package (ขาประจำ) ---
  const [selectedPackage, setSelectedPackage] = useState<"bike" | "car" | null>(null);

  // --- Calendar helpers ---
  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay); startDate.setDate(startDate.getDate() - firstDay.getDay());
    const days = [];
    const today = new Date();
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate); date.setDate(startDate.getDate() + i);
      const day = date.getDate(); const month = date.getMonth(); const year = date.getFullYear();
      const buddhistYear = year + 543;
      const isCurrentMonth = month === currentMonth;
      const isToday = date.toDateString() === today.toDateString();
      const dateString = `${day.toString().padStart(2,"0")}/${(month+1).toString().padStart(2,"0")}/${buddhistYear}`;
      const isSelected = selectedDate === dateString;
      days.push({ date, day, month, year, buddhistYear, dateString, isCurrentMonth, isToday, isSelected });
    }
    return days;
  };
  const getThaiMonthName = (month: number) => {
    const thaiMonths = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
    return thaiMonths[month];
  };

  // --- Next Step ---
  const handleNextStep = () => setPage("confirm");
  const handleConfirm = () => setShowPopup(true);
  const handleCancelPopup = () => setShowPopup(false);
  const handleAgree = () => {
    setShowPopup(false);
    router.push("/customer/home");
  };

    const formatThaiDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear() + 543;
      return `${day}/${month}/${year}`;
    };
  
    useEffect(() => {
      if (selectedDates.length > 0) {
        const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
        setStartDate(formatThaiDate(sorted[0]));
        setEndDate(formatThaiDate(sorted[sorted.length - 1]));
      } else {
        setStartDate(null);
        setEndDate(null);
      }
    }, [selectedDates]);

    const toggleStartPicker = () => {
      setShowStartTimePicker(!showStartTimePicker);
      setShowEndTimePicker(false);
    };
    const toggleEndPicker = () => {
      setShowEndTimePicker(!showEndTimePicker);
      setShowStartTimePicker(false);
    };
  

  // ================= Pages =================

  const renderTypePage = () => (
    <div className="bg-[#ffffff] min-h-screen w-full flex flex-col items-center pb-[140px] relative">
      <div className="w-full flex items-center justify-start px-6 mt-6" style={{ cursor: "pointer" }}>
        <BackButton />
      </div>
      <div className="flex flex-col mt-20 items-start w-80">
        <h1 className="text-4xl font-semibold text-[#191919] mb-2">จองทริป</h1>
        <p className="text-base text-[#191919] leading-relaxed">เพื่อออกเดินทางไปยังที่ที่คุณต้องการได้ง่าย ๆ</p>
      </div>
      <div className="w-full px-6 mt-8 space-y-5">
        <button
          className="w-full bg-[#C5DEDA] rounded-2xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 active:shadow-md"
          onClick={()=>setPage("location")}
        >
          <div className="text-left">
            <h2 className="text-lg font-semibold text-[#191919] mb-1">จองทริปแบบปกติ</h2>
            <p className="text-sm text-[#191919]">เดินทางเพียงครั้งเดียว</p>
          </div>
        </button>
        <button
          className="w-full bg-[#C5DEDA] rounded-2xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 active:shadow-md"
          onClick={()=>setPage("package")}
        >
          <div className="text-left">
            <h2 className="text-lg font-semibold text-[#191919] mb-1">จองทริปแบบขาประจำ</h2>
            <p className="text-sm text-[#191919] leading-relaxed">เลือกวันและเวลาที่ต้องการเดินทางเป็นประจำ</p>
          </div>
        </button>
      </div>
      <div className="flex justify-center items-end h-[320px] mt-8">
        <img src="/homeBK.png" alt="Booking illustration" className="w-full max-w-[280px] h-auto object-contain" />
      </div>
    </div>
  );

  const renderPackagePage = () => (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-[#FFFFFF] to-[#C5DEDA]">
      {/* Back Button */}
      <div className="w-full flex items-center justify-start px-6 mt-6" style={{ cursor: "pointer" }}>
        <BackButton />
      </div>

      {/* Header */}
      <div className="flex flex-col items-center text-center mt-16 px-10 py-10">
        <h1 className="text-5xl font-regular text-[#191919] mb-4">
          จองทริปแบบ ขาประจำ
        </h1>
        <img src="/home_package.png" alt="Home Package" className="w-30 h-20 mb-6" />
        <p className="text-base font-light text-[#191919]">
          จ่าย 1 ครั้ง เดินทางกี่ครั้งก็ได้
          <br />
          ภายใน 4 สัปดาห์
        </p>
      </div>

    <div className="flex flex-col gap-6 -mt-2">
      {/* ตัวเลือกจักรยานยนต์/รถยนต์ */}
      <div className="flex flex-col gap-6 mt-6">
        {["bike", "car"].map((v) => {
          const Icon = v === "bike" ? FaMotorcycle : FaCar;
          const title = v === "bike" ? "จักรยานยนต์" : "รถยนต์";
          const price = v === "bike" ? "650 บาท/4 สัปดาห์" : "1000 บาท/4 สัปดาห์";

          return (
            <div key={v} className="flex items-center justify-center gap-1">
              {/* ปุ่มเลือก */}
              <div onClick={() => setSelected(v as "bike" | "car")} className="cursor-pointer mx-6 -mr-1">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center border-[#B55C32] ${selected === v ? "bg-[#B55C32]" : "bg-white"}`}>
                  {selected === v && (
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* กล่องข้อมูล */}
              <div
                onClick={() => setSelected(v as "bike" | "car")}
                className={`bg-white rounded-xl shadow-md px-6 py-4 w-[280px] mx-auto flex flex-col items-center text-center cursor-pointer transition-all duration-200 ${
                  selected === v ? "border-2 border-[#B55C32]" : "border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 justify-center">
                  <p className="text-sm font-light text-[#191919]">เดินทางด้วย</p>
                  <Icon className="text-xl text-[#B55C32]" />
                  <p className="text-sm font-light text-[#191919]">{title}</p>
                </div>
                <div className="flex items-center gap-2 justify-center mt-1">
                  <img src="/coin.svg" alt="coin" className="w-4 h-4" />
                  <p className="text-sm font-light text-[#191919]">เริ่มต้น {price}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

      {/* หมายเหตุ */}
      <div className="flex-grow" />
      <div className="text-center text-sm font-light text-[#B55C32] mb-4">
        หมายเหตุ: จุดรับ/ส่ง และเวลา จะเหมือนเดิมทุกครั้ง
      </div>

      {/* ปุ่มซื้อแพ็คเกจ */}
      <div className="bg-white rounded-t-2xl shadow-inner px-6 pt-4 pb-6">
        <div className="flex items-center gap-2 justify-center mb-3 -mt-1">
          <p className="text-sm font-light text-[#191919]">ยอดในกระเป๋าเงิน</p>
          <img src="/coin.svg" alt="coin" className="w-4 h-4" />
          <p className="text-sm font-light text-[#191919]">100 บาท</p>
        </div>

        <button
          className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl shadow-md hover:bg-[#d9956f] transition-colors duration-200"
          onClick={() => setPage("package1")}
        >
          ซื้อแพ็คเกจทริปขาประจำ
        </button>
      </div>
    </div>
  );

  const renderLocationPage = () => (
    <div className="bg-[#C5DEDA] min-h-screen w-full flex flex-col items-center pb-[140px]">
      <div className="w-full flex flex-col items-center px-6 mt-2">
        <div className="w-full max-w-md flex items-center mt-2" style={{ cursor: "pointer" }}>
          <BackButton />
        </div>
        <div className="flex-1 text-center py-9">
          <h1 className="text-lg text-black font-light">การจองทริปใหม่ หน้า 1/3</h1>
          <p className="text-xl font-regular text-black">เลือกจุดรับส่ง</p>
        </div>
        <div className="w-full max-w-md bg-white font-light rounded-2xl p-4 shadow-md shadow-black/50 mb-4">
          <div className="flex flex-col gap-3 relative">
            <LocationBox value={location1} onClear={()=>setLocation1("")} showLine/>
            <LocationBox value={location2} onClear={()=>setLocation2("")}/>
          </div>
        </div>
        <div className="w-full max-w-md h-[450px] border-[1px] border-[#8B8B8B] rounded-2xl overflow-hidden">
          <MapComponent />
        </div>
        <div className="mt-4 w-full max-w-md">
          <button
            className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl hover:bg-[#d9956f] transition-colors duration-200"
            onClick={()=>setPage("rideDetail")}
          >
            ขั้นตอนถัดไป
          </button>
        </div>
      </div>
    </div>
  );

  const renderRideDetailPage = () => (
    <div className="bg-[#C5DEDA] min-h-screen w-full flex flex-col items-center pb-20 px-6">
      <div className="w-full max-w-md flex items-center mt-4" style={{ cursor: "pointer" }}>
        <BackButton />
      </div>
      <div className="flex-1 text-center py-9">
        <h1 className="text-lg text-black font-light">การจองทริปใหม่ หน้า 2/3</h1>
        <p className="text-xl font-regular text-black">รายละเอียดการเดินทาง</p>
      </div>
      {/* Location Box */}
      <div className="w-full max-w-md bg-white font-light rounded-2xl p-4 shadow-md shadow-black/50 mb-4">
        <div className="flex flex-col gap-3 relative">
          <LocationBox value={location1} onClear={()=>setLocation1("")} showLine/>
          <LocationBox value={location2} onClear={()=>setLocation2("")}/>
        </div>
      </div>

      {/* Ride Details */}
      <div className="w-full max-w-md bg-white font-light rounded-2xl p-4 shadow-md shadow-black/50 mb-4">
        {/* วันที่และเวลา */}
        <div className="px-3">
            <div className="flex items-center mb-4">
              <span className="text-[#191919] font-light text-base mr-3">วันที่</span>
              <div
                className="flex items-center bg-[#8B8B8B]/10 px-3 py-1 rounded-full cursor-pointer"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <span className="text-[#191919] font-light text-base mr-2">{selectedDate}</span>
                <CalendarIcon />
              </div>

              {showDatePicker && (
                <div className="absolute z-50 mt-2 bg-white border rounded shadow-md p-5">
                  <div className="flex justify-between items-center mb-2">
                    <button onClick={handlePrevMonth}>{"<"}</button>
                    <span className="font-light">{getThaiMonthName(currentMonth)} {currentYear + 543}</span>
                    <button onClick={handleNextMonth}>{">"}</button>
                  </div>
                  <div className="grid grid-cols-7 text-center mb-1">
                    {["อา","จ","อ","พ","พฤ","ศ","ส"].map((d) => (
                      <div key={d} className="font-light">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center font-light">
                    {generateCalendarDays().map((day) => (
                      <div
                        key={day.date.toString()}
                        className={`p-1 rounded cursor-pointer ${day.isSelected ? "bg-[#b55c32] text-white" : ""} ${day.isCurrentMonth ? "" : "text-gray-400"}`}
                        onClick={() => { setSelectedDate(day.dateString); setShowDatePicker(false); }}
                      >
                        {day.day}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* เวลา */}
            <p className="text-[#191919] font-light text-base mb-1">
              เวลาที่สามารถรอรับได้
            </p>

            <div className="flex items-center justify-center gap-8 mb-4">
              {/* เวลาเริ่ม */}
              <div className="relative flex flex-col items-center">
                <span className="text-[#191919] font-light mb-1">ตั้งแต่</span>
                <div
                  className="flex items-center bg-[#8B8B8B]/10 px-3 py-1 rounded-full cursor-pointer"
                  onClick={() => setShowStartTimePicker(!showStartTimePicker)}
                >
                  <ClockIcon />
                  <span className="ml-2 text-[#191919] font-light text-base">
                    {selectedStartTime}
                  </span>
                </div>

                {showStartTimePicker && (
                  <div className="absolute z-50 mt-14 w-20 max-h-40 overflow-y-auto bg-white border rounded shadow-md font-light">
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
                  onClick={() => setShowEndTimePicker(!showEndTimePicker)}
                >
                  <ClockIcon />
                  <span className="ml-2 text-[#191919] font-light text-base">
                    {selectedEndTime}
                  </span>
                </div>

                {showEndTimePicker && (
                  <div className="absolute z-50 mt-14 w-20 max-h-40 overflow-y-auto bg-white border rounded shadow-md font-light">
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

            {/* จำนวนคนนั่ง */}
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <p className="text-[#191919] text-base font-light">จำนวนคนนั่ง</p>
                <div className="flex items-center bg-[#F9F9F9] border border-[#191919] rounded-full px-4 py-1">
                  <img src="/icon_nav_profile.svg" alt="profile" className="w-4 h-4 object-contain" style={{ filter: "brightness(0) invert(0%)" }}/>
                  <span className="text-[#191919] text-l font-light mx-3">{passengerCount}</span>
                  <div className="flex flex-col">
                    <button
                      onClick={() => passengerCount < 6 && setPassengerCount(passengerCount + 1)}
                      className="text-[#191919] text-lg leading-none"
                    >
                      <img src="/arrow-up.png" alt="arrow-up" className="w-3 h-3 object-contain" />
                    </button>
                    <button
                      onClick={() => passengerCount > 1 && setPassengerCount(passengerCount - 1)}
                      className="text-[#191919] text-lg leading-none"
                    >
                      <img src="/arrow-down.png" alt="arrow-down" className="w-3 h-3 object-contain" />
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[#8b8b8b] font-light text-xs mt-0 w-45">
                หากต้องการขนสัมภาระขนาดใหญ่ กรุณาเพิ่มจำนวนคนอีก 1
              </p>
            </div>

          {/* ประเภทรถ */}
          <div className="space-y-2">
            {["จักรยานยนต์", "รถยนต์", "รถยนต์ขนาดใหญ่"].map((v) => {
              let maxPassengers = v === "จักรยานยนต์" ? 1 : v === "รถยนต์ขนาดใหญ่" ? 6 : 4;
              const disabled = passengerCount > maxPassengers;

              return (
                <button
                  key={v}
                  onClick={() => !disabled && setSelectedVehicle(v)}
                  className={`w-full flex justify-between items-center bg-[#FFFFFF] px-4 py-2 rounded-full font-light
                    ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedVehicle === v ? "border-[#b55c32] bg-[#b55c32]" : "border-gray-400 bg-white"
                      }`}
                    >
                      {selectedVehicle === v && (
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-base ${
                        selectedVehicle === v ? "text-[#191919] font-light" : "text-[#8b8b8b]"
                      }`}
                    >
                      {v}
                    </span>
                  </div>
                  <span className="text-[#8b8b8b] text-sm font-light flex items-center gap-1">
                    {v === "จักรยานยนต์" ? "1" : v === "รถยนต์ขนาดใหญ่" ? "1–6" : "1–4"}
                    <img
                      src="/icon_nav_profile.svg" alt="profile" className="w-4 h-4 object-contain"
                      style={{ filter: "brightness(0) invert(50%)" }}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ค่าแพ็คเกจ */}
      <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-5 flex justify-between items-start">
        <div>
          <p className="text-[#191919] text-base font-light mb-5">ค่าเดินทาง</p>
          <div className="flex items-center gap-2">
            <img src="/coin.svg" alt="coin" className="w-8 h-8 object-contain" />
            <p className="text-[#191919] text-xl font-light">32 บาท</p>
          </div>
        </div>

        <div className="text-right self-start">
          <p className="text-[#8b8b8b] text-sm font-light">ยอดในกระเป๋าเงิน</p>
          <div className="flex items-center justify-end gap-1">
            <img src="/coin.svg" alt="coin" className="w-4 h-4 object-contain" />
            <p className="text-[#8b8b8b] text-base font-light">100 บาท</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mt-4">
        <button
          onClick={handleNextStep}
          className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl hover:bg-[#d9956f] transition-colors duration-200"
        >
          ขั้นตอนถัดไป
        </button>
      </div>
    </div>
  );

  const renderConfirmPage = () => (
    <div className="bg-[#C5DEDA] min-h-screen w-full flex flex-col items-center pb-[140px] px-6">
      <div className="w-full max-w-md flex items-center mt-4" style={{ cursor: "pointer" }}>
        <BackButton />
      </div>
      <div className="flex-1 text-center py-9">
        <h1 className="text-lg text-black font-light">การจองทริปใหม่ หน้า 3/3</h1>
        <p className="text-xl font-regular text-black">ยืนยันการจอง</p>
      </div>

      {/* Location Box */}
      <div className="w-full max-w-md bg-white font-light rounded-2xl p-4 shadow-md shadow-black/50 mb-4">
        <div className="flex flex-col gap-3 relative">
          <LocationBox value={location1} onClear={()=>setLocation1("")} showLine/>
          <LocationBox value={location2} onClear={()=>setLocation2("")}/>
        </div>
      </div>

      {/* กล่องสรุปรายละเอียด */}
      <div className="w-full max-w-md bg-white font-light rounded-2xl p-4 shadow-md shadow-black/50 mb-4">
        {/* วันที่และเวลา */}
        <div className="px-3">
          <div className="flex items-center gap-3 mb-3">
            <p className="text-[#191919] font-light text-base">วันที่</p>
            <div className="bg-[#8B8B8B]/10 rounded-full px-3 py-1 text-black font-light">
              {selectedDate}
            </div>
          </div>

          <p className="text-[#191919] font-light mt-3">เวลา ที่สามารถรอรับได้</p>
          <div className="flex justify-center items-center gap-8 mt-2">
            <div className="text-center">
              <p className="text-[#191919] text-sm mb-1">ตั้งแต่</p>
              <div className="bg-[#8B8B8B]/10 px-3 py-1 rounded-full inline-block">{selectedStartTime}</div>
            </div>
            <div className="text-center">
              <p className="text-[#191919] text-sm mb-1">ถึง</p>
              <div className="bg-[#8B8B8B]/10 px-3 py-1 rounded-full inline-block">{selectedEndTime}</div>
            </div>
          </div>

          {/* จำนวนคนนั่ง */}
          <div className="flex justify-between items-center mb-5 mt-5 w-full max-w-md">
            <div>
              <p className="text-[#191919] text-base font-light">จำนวนคนนั่ง</p>
              <p className="text-[#8b8b8b] text-xs font-light">หากต้องการขนสัมภาระขนาดใหญ่ กรุณาเพิ่มจำนวนคนอีก 1</p>
            </div>
            <div className="flex items-center bg-[#FFFFFF] border border-[#191919] rounded-full px-4 py-1">
              <img src="/icon_nav_profile.svg" alt="profile" className="w-4 h-4 object-contain" style={{ filter: "brightness(0) invert(0%)" }} />
              <span className="text-[#191919] text-l font-light mx-2">{passengerCount}</span>
            </div>
          </div>

          {/* ประเภทพาหนะ */}
          <p className="text-[#191919] text-base font-light mb-2 w-full max-w-md">เลือกประเภทพาหนะ</p>
          <div className="flex justify-between items-center w-full max-w-md p-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-[#B55C32] bg-[#B55C32]">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[#B55C32] font-light">รถยนต์</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#8b8b8b] text-sm">1–4</span>
              <img src="/icon_nav_profile.svg" alt="icon" className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

        {/* ค่าแพ็คเกจ */}
        <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-5 flex justify-between items-start">
          <div>
            <p className="text-[#191919] text-base font-light mb-5">ค่าเดินทาง</p>
            <div className="flex items-center gap-2">
              <img src="/coin.svg" alt="coin" className="w-8 h-8 object-contain" />
              <p className="text-[#191919] text-xl font-light">32 บาท</p>
            </div>
          </div>
          <div className="text-right self-start">
            <p className="text-[#8b8b8b] text-sm font-light">ยอดในกระเป๋าเงิน</p>
            <div className="flex items-center justify-end gap-1">
              <img src="/coin.svg" alt="coin" className="w-4 h-4 object-contain" />
              <p className="text-[#8b8b8b] text-base font-light">100 บาท</p>
            </div>
          </div>
        </div>

        {/* ปุ่มยืนยัน */}
        <div className="w-full max-w-md mt-4">
          <button
            onClick={handleConfirm}
            className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl hover:bg-[#d9956f] transition-colors duration-200"
          >
            ยืนยันการจอง
          </button>
        </div>

          {/* --- Popup --- */}
          {showPopup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-lg w-[80%] max-w-[350px] p-6 text-center">
                <div className="mb-4">
                  <div className="w-[80%] mx-auto bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-5">
                    <p className="text-[#191919] text-base font-semibold mb-2">ค่าเดินทาง</p>
                    <div className="flex justify-center items-center gap-2 mb-4">
                      <img src="/coin.svg" alt="coin" className="w-6 h-6 object-contain" />
                      <p className="text-[#191919] text-lg">32 บาท</p>
                    </div>
                  </div>
                  <p className="text-[#191919] text-m font-semibold mb-4">
                    เมื่อจองแล้วจะไม่สามารถแก้ไขได้<br />
                    และเงินในกระเป๋าจะถูกหักทันที
                  </p>
                  <p className="text-[#191919] text-sm font-light">
                    แน่ใจหรือไม่ว่าต้องการทำรายการจองนี้
                  </p>
                </div>
                <div className="flex justify-between mt-5">
                  <button onClick={handleCancelPopup} className="flex-1 bg-white border border-[#B5B5B5] text-[#191919] py-2 rounded-3xl mr-2">
                    ยกเลิก
                  </button>
                  <button onClick={handleAgree} className="flex-1 bg-[#E6A88A] border border-[#B55C32] text-[#191919] py-2 rounded-3xl ml-2">
                    ตกลง
                  </button>
                </div>
              </div>
            </div>
          )}
    </div>
  );

  const renderPackage1Page = () => (
    <div className="bg-[#C5DEDA] min-h-screen w-full flex flex-col items-center pb-[140px]">
      <div className="w-full flex flex-col items-center px-6 mt-2">
        <div className="w-full max-w-md flex items-center mt-2" style={{ cursor: "pointer" }}>
          <BackButton />
        </div>
        <div className="flex-1 text-center py-9">
          <h1 className="text-lg text-black font-light">การจองทริปขาประจำ หน้า 1/3</h1>
          <p className="text-xl font-regular text-black">เลือกจุดรับส่ง</p>
        </div>
        <div className="w-full max-w-md bg-white font-light rounded-2xl p-4 shadow-md shadow-black/50 mb-4">
          <div className="flex flex-col gap-3 relative">
            <LocationBox value={location1} onClear={()=>setLocation1("")} showLine/>
            <LocationBox value={location2} onClear={()=>setLocation2("")}/>
          </div>
        </div>
        <div className="w-full max-w-md h-[450px] border-[1px] border-[#8B8B8B] rounded-2xl overflow-hidden">
          <MapComponent />
        </div>
        <div className="mt-4 w-full max-w-md">
          <button
            className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl hover:bg-[#d9956f] transition-colors duration-200"
            onClick={()=>setPage("package2")}
          >
            ขั้นตอนถัดไป
          </button>
        </div>
      </div>
    </div>
  );

  const renderPackage2Page = () => (
    <div className="bg-[#C5DEDA] min-h-screen w-full flex flex-col items-center pb-[140px]">
      <div className="w-full flex flex-col items-center px-6 mt-10">
        <div className="w-full max-w-md flex items-center mt-2" style={{ cursor: "pointer" }}>
          <BackButton />
        </div>
        <div className="text-center mt-1 mb-6">
          <h1 className="text-lg text-black font-light">การจองทริปขาประจำ หน้า 2/3</h1>
          <p className="text-xl font-regular text-black">เลือกวันที่และเวลาที่ต้องการ</p>
        </div>
        {/* ส่วนเลือกช่วงวันที่ */}
        <div className="flex items-center gap-4 mb-6 ">
          <p className="text-sm font-light text-black">ตั้งแต่</p>
          <div className="px-3 py-2 bg-white rounded-2xl shadow text-sm font-light shadow-md shadow-black/50">
            {startDate ?? "--/--/----"}
          </div>
          <p className="text-sm font-light text-black">ถึง</p>
          <div className="px-3 py-2 bg-white rounded-2xl shadow text-sm font-light shadow-md shadow-black/50">
            {endDate ?? "--/--/----"}
          </div>
        </div>

        {/* ปฏิทิน */}
       <div className="font-light w-full bg-white rounded-2xl shadow p-4 mb-6 shadow-md shadow-black/50">
          <CalendarComponent selected={selectedDates} setSelected={setSelectedDates} />
          <p className="text-l font-light text-center text-[#B55C32]">
            จิ้มที่วันที่เพื่อเลือก - จิ้มอีกครั้งเพื่อยกเลิก
          </p>
        </div>

        {/* สรุปผลเลือกแล้ว */}
        <div className="w-full bg-white rounded-2xl shadow p-6 mb-6 text-center shadow-md shadow-black/50">
          <p className="text-black font-light mb-2">คุณเลือกไปแล้ว</p>
          <div className="flex justify-center items-center gap-2 text-[#B55C32] text-2xl font-light">
            {selectedDates.length} วัน
          </div>

          {/* ส่วนเลือกเวลา */}
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
                          time === selectedStartTime
                            ? "bg-[#b55c32] text-white"
                            : ""
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
                          time === selectedEndTime
                            ? "bg-[#b55c32] text-white"
                            : ""
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
          </div>
        </div>

      {/* ค่าแพ็คเกจ */}
      <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-5 flex justify-between items-center">
        <div>
          <p className="text-[#191919] text-base font-light mb-5">ค่าแพ็คเกจ</p>
          <div className="flex items-center gap-2">
            <img src="/coin.svg" alt="coin" className="w-8 h-8 object-contain" />
            <p className="text-[#191919] text-xl font-light">700 บาท</p>
          </div>
        </div>
        <div className="text-right self-start">
          <p className="text-[#8b8b8b] text-sm font-light">ยอดในกระเป๋าเงิน</p>
          <div className="flex items-center justify-end gap-1">
            <img src="/coin.svg" alt="coin" className="w-4 h-4 object-contain" />
            <p className="text-[#8b8b8b] text-base font-light">100 บาท</p>
          </div>
        </div>
      </div>
          <button
            className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl hover:bg-[#d9956f] transition-colors duration-200"
            onClick={()=>setPage("package3")}
          >
            ขั้นตอนถัดไป
          </button>
        </div>
      </div>
  );

  const renderPackage3Page = () => (
  <div className="bg-[#C5DEDA] min-h-screen w-full flex flex-col items-center pb-[140px]">
    <div className="w-full flex flex-col items-center px-6 mt-10">
      
      {/* ปุ่มกลับ */}
      <div
        className="w-full max-w-md flex items-center mt-2"
        style={{ cursor: "pointer" }}
      >
        <BackButton />
      </div>

      {/* หัวข้อ */}
      <div className="text-center mt-1 mb-5">
        <h1 className="text-lg text-black font-light">การจองทริปขาประจำ หน้า 3/3</h1>
        <p className="text-xl font-regular text-black">ยืนยันการจอง</p>
        <p className="text-xl font-light text-[#B55C32] mt-2">กรุณาตรวจสอบรายการเดินทาง</p>
      </div>

      {/* กล่องจุดรับส่ง */}
      <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-6 font-light">
        <div className="flex flex-col gap-3 relative">
          <LocationBox value={location1} onClear={() => setLocation1("")} showLine />
          <LocationBox value={location2} onClear={() => setLocation2("")} />
        </div>
      </div>

      {/* ปฏิทิน */}
      <div className="font-light w-full bg-white rounded-2xl shadow p-4 mb-6 shadow-md shadow-black/50">
        <CalendarComponent selected={selectedDates} setSelected={setSelectedDates} />
        <p className="text-l font-light text-center text-[#B55C32]">
          จิ้มที่วันที่เพื่อเลือก - จิ้มอีกครั้งเพื่อยกเลิก
        </p>
      </div>

      {/* สรุปผลเลือกแล้ว */}
      <div className="w-full bg-white rounded-2xl shadow p-6 mb-6 text-center shadow-md shadow-black/50">
        <p className="text-black font-light mb-2">คุณเลือกไปแล้ว</p>
        <div className="flex justify-center items-center gap-2 text-[#B55C32] text-2xl font-light">
          {selectedDates.length} วัน
        </div>

        {/* ส่วนเลือกเวลา */}
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
                <span className="ml-2 text-[#191919] font-light text-base">{selectedStartTime}</span>
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
                <span className="ml-2 text-[#191919] font-light text-base">{selectedEndTime}</span>
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
        </div>
      </div>

      {/* ค่าแพ็คเกจ */}
      <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-5 flex justify-between items-center">
        <div>
          <p className="text-[#191919] text-base font-light mb-5">ค่าแพ็คเกจ</p>
          <div className="flex items-center gap-2">
            <img src="/coin.svg" alt="coin" className="w-8 h-8 object-contain" />
            <p className="text-[#191919] text-xl font-light">700 บาท</p>
          </div>
        </div>
        <div className="text-right self-start">
          <p className="text-[#8b8b8b] text-sm font-light">ยอดในกระเป๋าเงิน</p>
          <div className="flex items-center justify-end gap-1">
            <img src="/coin.svg" alt="coin" className="w-4 h-4 object-contain" />
            <p className="text-[#8b8b8b] text-base font-light">100 บาท</p>
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
          <div className="bg-white rounded-2xl shadow-lg w-[80%] max-w-[350px] p-6 text-center">

            {/* ค่าเดินทาง */}
            <div className="w-[80%] mx-auto bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-5">
              <p className="text-[#191919] text-base font-semibold mb-2">ค่าเดินทาง</p>
              <div className="flex justify-center items-center gap-2 mb-4">
                <img src="/coin.svg" alt="coin" className="w-6 h-6 object-contain" />
                <p className="text-[#191919] text-lg">700 บาท</p>
              </div>
            </div>

            {/* ข้อความยืนยัน */}
            <p className="text-[#191919] text-m font-semibold mb-4">
              เมื่อจองแล้วจะไม่สามารถแก้ไขได้<br />
              และเงินในกระเป๋าจะถูกหักทันที
            </p>
            <p className="text-[#191919] text-sm font-light mb-4">
              แน่ใจหรือไม่ว่าต้องการทำรายการจองนี้
            </p>

            {/* ปุ่มยืนยัน / ยกเลิก */}
            <div className="flex justify-between mt-5">
              <button onClick={handleCancelPopup} className="flex-1 bg-white border border-[#B5B5B5] text-[#191919] py-2 rounded-3xl mr-2">
                ยกเลิก
              </button>
              <button onClick={handleAgree} className="flex-1 bg-[#E6A88A] border border-[#B55C32] text-[#191919] py-2 rounded-3xl ml-2">
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div> 
  </div> 
);

  return (
    <>
      {page === "type" && renderTypePage()}
      {page === "package" && renderPackagePage()}
      {page === "package1" && renderPackage1Page()}
      {page === "package2" && renderPackage2Page()}
      {page === "package3" && renderPackage3Page()}
      {page === "location" && renderLocationPage()}
      {page === "rideDetail" && renderRideDetailPage()}
      {page === "confirm" && renderConfirmPage()}
    </>
  );
}
