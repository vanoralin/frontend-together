"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";

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

export default function RideBookingConfirmPage() {
  const router = useRouter();

  // --- state ต่าง ๆ ---
  const [location1, setLocation1] = useState("ฝั่งตรงข้ามเกกี 4");
  const [location2, setLocation2] = useState("หน้าตึก ECC");
  const [passengerCount] = useState(2);
  const [showPopup, setShowPopup] = useState(false);

  const handleConfirm = () => {
    setShowPopup(true);
  };

  const handleCancelPopup = () => {
    setShowPopup(false);
  };

  const handleAgree = () => {
    setShowPopup(false);
    router.push("/driver/booking/normal/success");
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
          <div className="flex items-center gap-3 mb-3">
            <p className="text-[#191919] font-light text-base">วันที่</p>
            <div className="bg-[#8B8B8B]/10 rounded-full px-3 py-1 text-black font-light">
              27/07/2568
            </div>
          </div>

          <p className="text-[#191919] font-light mt-3">
            เวลา ที่สามารถรอรับได้
          </p>

          <div className="flex justify-center items-center gap-8 mt-2">
            <div className="text-center">
              <p className="text-[#191919] text-sm mb-1">ตั้งแต่</p>
              <div className="bg-[#8B8B8B]/10 px-3 py-1 rounded-full inline-block">12:00</div>
            </div>
            <div className="text-center">
              <p className="text-[#191919] text-sm mb-1">ถึง</p>
              <div className="bg-[#8B8B8B]/10 px-3 py-1 rounded-full inline-block">12:20</div>
            </div>
          </div>


      {/* จำนวนคนนั่ง */}
      <div className="flex justify-between items-center mb-5 mt-5 w-full max-w-md">
        <div>
          <p className="text-[#191919] text-base font-light">จำนวนคนนั่ง</p>
          <p className="text-[#8b8b8b] text-xs font-light">
            หากต้องการขนสัมภาระขนาดใหญ่ 
          </p>
          <p className="text-[#8b8b8b] text-xs font-light">
            กรุณาเพิ่มจำนวนคนอีก 1
          </p>
        </div>
        <div className="flex items-center bg-[#FFFFFF] border border-[#191919] rounded-full px-4 py-1">
          <img src="/icon_nav_profile.svg" alt="profile" className="w-4 h-4 object-contain" style={{ filter: "brightness(0) invert(0%)" }} />
          <span className="text-[#191919] text-l font-light mx-2">{passengerCount}</span>
        </div>
      </div>

      {/* ประเภทพาหนะ */}
      <p className="text-[#191919] text-base font-light mb-2 w-full max-w-md">
        เลือกประเภทพาหนะ
      </p>

      <div className="flex justify-between items-center w-full max-w-md p-3 ">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-[#B55C32] bg-[#B55C32]">
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 13l4 4L19 7"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* ชื่อประเภท */}
          <span className="text-[#B55C32] font-light">รถยนต์</span>
        </div>

          {/* ความจุและไอคอน */}
          <div className="flex items-center gap-2">
            <span className="text-[#8b8b8b] text-sm">1–4</span>
            <img src="/icon_nav_profile.svg" alt="icon" className="w-4 h-4" />
          </div>
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
            <div className="mb-4">
              <div className="w-[80%] mx-auto bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-5">
                <p className="text-[#191919] text-base font-semibold mb-2">ค่าเดินทาง</p>
                <div className="flex justify-center items-center gap-2 mb-4">
                  <img src="/coin.svg" alt="coin" className="w-6 h-6 object-contain" />
                  <p className="text-[#191919] text-lg">32 บาท</p>
                </div>
              </div>

              {/* ข้อความยืนยัน */}
              <p className="text-[#191919] text-m font-semibold mb-4">
                เมื่อจองแล้วจะไม่สามารถแก้ไขได้<br />
                และเงินในกระเป๋าจะถูกหักทันที
              </p>
              <p className="text-[#191919] text-sm font-light">
                แน่ใจหรือไม่ว่าต้องการทำรายการจองนี้
              </p>
            </div>

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
