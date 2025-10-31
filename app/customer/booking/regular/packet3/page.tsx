"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";
import CalendarComponent from "@/app/components/Calendar";
import { Calendar } from "lucide-react";

// --- ไอคอนนาฬิกา ---
const ClockIcon = () => (
  <svg
    className="w-5 h-5 text-[#b55c32]"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L12 13V7H12.5V12.2L17,14.7L16.2,16.2Z" />
  </svg>
);

// --- กล่องแสดงจุดรับส่ง ---
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

      <div className="relative z-10 flex items-center justify-between bg-[#8B8B8B]/10 rounded-full px-4 py-2 w-full">
        <span className="text-black text-base ml-1">{value}</span>
      </div>
    </div>
  );
}

// --- หน้าเลือกวันที่และสรุปค่าแพ็คเกจ ---
export default function RideBookingPage() {
  const router = useRouter();

  // --- State ---
  const [selected, setSelected] = useState<Date[]>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState("12:00");
  const [selectedEndTime, setSelectedEndTime] = useState("12:20");
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [location1, setLocation1] = useState("ฝั่งตรงข้ามเกกี 4");
  const [location2, setLocation2] = useState("หน้าตึก ECC");
  const [passengerCount] = useState(2);

  const [showPopup, setShowPopup] = useState(false);

  const handleConfirm = () => setShowPopup(true);
  const handleCancelPopup = () => setShowPopup(false);
  const handleAgree = () => {
    setShowPopup(false);
    router.push("/driver/booking/normal/success");
  };

  const timeOptions = [
    "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
    "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
  ];

  // ฟังก์ชันแปลงวันที่เป็นไทย
  const formatThaiDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  // อัปเดต start และ end date
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

  // ตรวจสอบเวลาให้ start < end
  useEffect(() => {
    const [startHour, startMin] = selectedStartTime.split(":").map(Number);
    const [endHour, endMin] = selectedEndTime.split(":").map(Number);
    if (startHour > endHour || (startHour === endHour && startMin >= endMin)) {
      setSelectedEndTime(selectedStartTime);
    }
  }, [selectedStartTime, selectedEndTime]);

  // toggle dropdown เวลา
  const toggleStartPicker = () => {
    setShowStartTimePicker(!showStartTimePicker);
    setShowEndTimePicker(false);
  };
  const toggleEndPicker = () => {
    setShowEndTimePicker(!showEndTimePicker);
    setShowStartTimePicker(false);
  };

  return (
    <div className="bg-[#C5DEDA] min-h-screen w-full flex flex-col items-center pb-20 px-6">
      {/* BackButton */}
      <div className="w-full max-w-md flex items-center mt-4">
        <BackButton />
      </div>

      {/* หัวข้อ */}
      <div className="flex-1 text-center mt-4 py-5">
        <h1 className="text-lg text-black font-light">การจองทริปขาประจำ หน้า 3/3</h1>
        <p className="text-xl font-regular text-black mt-2">ยืนยันการจอง</p>
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
      <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-6 font-light">
        <CalendarComponent selected={selected} setSelected={setSelected} />
        <p className="text-l font-light text-center text-[#B55C32] mt-3">
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
                onClick={toggleEndPicker}
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
        </div>
      </div>

      {/* ค่าแพ็คเกจ */}
      <div className="w-full max-w-md bg-white rounded-2xl p-4 mb-6 flex justify-between items-start shadow-md shadow-black/50 font-light">
        <div>
          <p className="text-[#191919] text-base mb-4">ค่าแพ็คเกจ</p>
          <div className="flex items-center gap-2">
            <img src="/coin.svg" alt="coin" className="w-8 h-8 object-contain" />
            <p className="text-[#191919] text-xl">700 บาท</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[#8b8b8b] text-sm">ยอดในกระเป๋าเงิน</p>
          <div className="flex items-center justify-end gap-1">
            <img src="/coin.svg" alt="coin" className="w-4 h-4 object-contain" />
            <p className="text-[#8b8b8b] text-base">100 บาท</p>
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
}
