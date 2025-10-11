"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";
import CalendarComponent from "@/app/components/Calendar";
import { Calendar, ChevronDown } from "lucide-react";

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

// --- VehiclePicker พร้อม click outside ---
function VehiclePicker({
  selectedVehicle,
  setSelectedVehicle,
}: {
  selectedVehicle: "จักรยานยนต์" | "รถยนต์" | "รถยนต์ขนาดใหญ่" | null;
  setSelectedVehicle: (
    v: "จักรยานยนต์" | "รถยนต์" | "รถยนต์ขนาดใหญ่"
  ) => void;
}) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const vehicles = ["จักรยานยนต์", "รถยนต์", "รถยนต์ขนาดใหญ่"] as const;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        className="w-full justify-between bg-gray-100 border border-gray-100 text-[#191919] font-light rounded-3xl px-4 py-2 flex items-center"
        onClick={() => setShow(!show)}
      >
        <span>{selectedVehicle || "เลือกยานพาหนะของคุณ"}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {show && (
        <div className="absolute w-full mt-1 bg-white border rounded shadow-lg z-50 max-h-60 overflow-y-auto">
          {vehicles.map((v) => (
            <button
              key={v}
              className={`w-full text-left font-light px-4 py-2 hover:bg-blue-100 ${
                selectedVehicle === v ? "bg-blue-500 text-white" : "text-gray-700"
              }`}
              onClick={() => {
                setSelectedVehicle(v);
                setShow(false);
              }}
            >
              {v}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- LocationBox พร้อมปุ่มลบ ---
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
        {value && (
          <button onClick={onClear} className="ml-2 text-gray-500 hover:text-gray-700">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// --- หน้า RideBookingPage ---
export default function RideBookingPage() {
  const router = useRouter();

  const [selected, setSelected] = useState<Date[]>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState("12:00");
  const [selectedEndTime, setSelectedEndTime] = useState("12:20");
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<
    "จักรยานยนต์" | "รถยนต์" | "รถยนต์ขนาดใหญ่" | null
  >(null);

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

  const formatThaiDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
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

  useEffect(() => {
    const [startHour, startMin] = selectedStartTime.split(":").map(Number);
    const [endHour, endMin] = selectedEndTime.split(":").map(Number);
    if (startHour > endHour || (startHour === endHour && startMin >= endMin)) {
      setSelectedEndTime(selectedStartTime);
    }
  }, [selectedStartTime, selectedEndTime]);

  const toggleStartPicker = () => {
    setShowStartTimePicker(!showStartTimePicker);
    setShowEndTimePicker(false);
  };
  const toggleEndPicker = () => {
    setShowEndTimePicker(!showEndTimePicker);
    setShowStartTimePicker(false);
  };

  return (
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
      <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-6 font-light">
        <div className="flex flex-col gap-3 relative">
          <LocationBox value={location1} onClear={() => setLocation1("")} showLine />
          <LocationBox value={location2} onClear={() => setLocation2("")} />
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
}
