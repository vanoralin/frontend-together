"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";

// --- ไอคอน ---
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

function LocationBox({
  value,
  onClear,
  showLine = false,
}: {
  value: string;
  onClear: () => void;
  showLine?: boolean;
}) {
  return (
    <div className="relative w-full flex items-center">
      <div className="relative z-20 flex-shrink-0 mr-2">
        <img src="/location.png" alt="location" className="w-7 h-7 object-contain" />
      </div>

      {showLine && (
        <div className="absolute left-[13px] top-[30px] bottom-[-20px] border-l-2 border-black z-0" />
      )}

      <div className="relative z-10 flex items-center justify-between bg-[#8B8B8B]/10 rounded-full px-4 py-1 w-full ">
        <span className="text-black text-base ml-1">{value}</span>
        <button
          onClick={onClear}
          className="text-gray-500 hover:text-red-500 text-3xl font-light flex items-center justify-center w-8 h-8"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default function RideBookingDetailPage() {
  const router = useRouter();

  // State
  const [location1, setLocation1] = useState("ฝั่งตรงข้ามเกกี 4");
  const [location2, setLocation2] = useState("หน้าตึก ECC");
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

  const timeOptions = [
    "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
    "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
  ];

  // ฟังก์ชันช่วยเหลือ
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      const buddhistYear = year + 543;

      const isCurrentMonth = month === currentMonth;
      const isToday = date.toDateString() === today.toDateString();
      const isSelected =
        selectedDate === `${day.toString().padStart(2, "0")}/${(month + 1).toString().padStart(2, "0")}/${buddhistYear}`;

      days.push({
        date,
        day,
        month,
        year,
        buddhistYear,
        dateString: `${day.toString().padStart(2, "0")}/${(month + 1)
          .toString()
          .padStart(2, "0")}/${buddhistYear}`,
        isCurrentMonth,
        isToday,
        isSelected,
      });
    }
    return days;
  };

  const getThaiMonthName = (month: number) => {
    const thaiMonths = [
      "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
      "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
    ];
    return thaiMonths[month];
  };

  const handleNextStep = () => {
    console.log("Next step:", { location1, location2, passengerCount, selectedVehicle, selectedDate, selectedStartTime, selectedEndTime });
    router.push("/driver/booking/normal/confirm");
  };

  return (
    <div className="bg-[#C5DEDA] min-h-screen w-full flex flex-col items-center pb-20 px-6">

      {/* ปุ่มย้อนกลับ */}
      <div className="w-full max-w-md flex items-center mt-4">
        <BackButton />
      </div>

      {/* หัวข้อ */}
      <div className="flex-1 text-center py-9">
        <h1 className="text-lg text-black font-light">การจองทริปใหม่ หน้า 2/3</h1>
        <p className="text-xl font-regular text-black">เลือกจุดรับส่ง</p>
      </div>

      {/* กล่องจุดรับส่ง */}
      <div className="w-full max-w-md bg-white font-light rounded-2xl p-4 shadow-md shadow-black/50 mb-4">
        <div className="flex flex-col gap-3 relative">
          <LocationBox value={location1} onClear={() => setLocation1("")} showLine />
          <LocationBox value={location2} onClear={() => setLocation2("")} />
        </div>
      </div>

      {/* กล่อง 2 */}
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
              let maxPassengers = v === "จักรยานยนต์" ? 1 : v === "รถยนต์" ? 4 : 6;
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
                    {v === "จักรยานยนต์" ? "1" : v === "รถยนต์" ? "1–4" : "1–6"}
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

      {/* ค่าเดินทาง */}
      <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-5 flex justify-between items-center">
        <div>
          <p className="text-[#191919] text-base font-light mb-1">ค่าเดินทาง</p>
          <div className="flex items-center gap-2">
            <img src="/coin.svg" alt="coin" className="w-8 h-8 object-contain" />
            <p className="text-[#191919] text-xl font-light">32 บาท</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[#8b8b8b] text-sm font-light">ยอดในกระเป๋าเงิน</p>
          <div className="flex items-center justify-end gap-1">
            <img src="/coin.svg" alt="coin" className="w-4 h-4 object-contain" />
            <p className="text-[#8b8b8b] text-base font-light">100 บาท</p>
          </div>
        </div>
      </div>

      {/* ปุ่มถัดไป */}
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push("/driver/booking/normal/mapdetail2")}
          className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl hover:bg-[#d9956f] transition-colors duration-200"
        >
          ขั้นตอนถัดไป
        </button>
      </div>
    </div>
  );
}
