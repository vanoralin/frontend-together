"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";
import CalendarComponent from "@/app/components/Calendar";
import { Calendar } from "lucide-react";

const ClockIcon = () => (
  <svg
    className="w-5 h-5 text-[#b55c32]"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L12 13V7H12.5V12.2L17,14.7L16.2,16.2Z" />
  </svg>
);

export default function Header() {
  const [selected, setSelected] = useState<Date[]>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const router = useRouter();

  const [selectedStartTime, setSelectedStartTime] = useState("12:00");
  const [selectedEndTime, setSelectedEndTime] = useState("12:20");
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const timeOptions = [
    "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
    "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
  ];

  // ฟังก์ชันแปลงวันที่เป็นรูปแบบไทย
  const formatThaiDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  // อัปเดต start และ end เมื่อเลือกวัน
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

  // ปิดอีก dropdown เมื่อเปิด dropdown หนึ่ง
  const toggleStartPicker = () => {
    setShowStartTimePicker(!showStartTimePicker);
    setShowEndTimePicker(false);
  };
  const toggleEndPicker = () => {
    setShowEndTimePicker(!showEndTimePicker);
    setShowStartTimePicker(false);
  };

  return (
    <div className="bg-[#C5DEDA] min-h-screen w-full flex flex-col items-center pb-20 px-1.5">
      <div className="flex flex-col items-center mt-8 w-full max-w-3xl px-4 mx-auto">
        {/* BackButton */}
        <div className="w-full flex items-center mb-4">
          <BackButton />
        </div>

        {/* Title */}
        <div className="text-center mt-1 mb-6">
          <h1 className="text-lg font-light text-black">
            การจองทริปขาประจำ หน้า 2/3
          </h1>
          <h1 className="text-xl font-regular text-black">
            เลือกวันที่และเวลาที่ต้องการ
          </h1>
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
          <CalendarComponent selected={selected} setSelected={setSelected} />
          <p className="text-l font-light text-center text-[#B55C32]">
            จิ้มที่วันที่เพื่อเลือก - จิ้มอีกครั้งเพื่อยกเลิก
          </p>
        </div>

        {/* สรุปผลเลือกแล้ว */}
        <div className="w-full bg-white rounded-2xl shadow p-6 mb-6 text-center shadow-md shadow-black/50">
          <p className="text-black font-light mb-2">คุณเลือกไปแล้ว</p>
          <div className="flex justify-center items-center gap-2 text-[#B55C32] text-2xl font-light">
            <Calendar className="h-8 w-8" />
            {selected.length} วัน
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

        {/* ปุ่มยืนยัน */}
        <div className="mt-4 w-full max-w-3xl px-2">
          <button
            className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl shadow-md hover:bg-[#944724] transition-colors duration-200"
            onClick={() => router.push("/customer/booking/regular/packet3")}
          >
            ขั้นตอนถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}
