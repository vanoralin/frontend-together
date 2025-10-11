"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";
import { FaMotorcycle, FaCar } from "react-icons/fa";

function Background() {
  const router = useRouter();
  const [selected, setSelected] = useState<"bike" | "car" | null>(null);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-[#FFFFFF] to-[#C5DEDA]">
      {/* ปุ่มย้อนกลับ */}
      <div className="w-full flex items-center justify-start px-6 mt-6">
        <BackButton />
      </div>

      {/* ส่วนหัว */}
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

        {/* ตัวเลือก */}
        <div className="flex flex-col gap-6 mt-6">
          {/* --- จักรยานยนต์ --- */}
          <div className="flex items-center justify-center gap-3">
            {/* ปุ่มกลมอยู่นอกกล่อง */}
            <div
              onClick={() => setSelected("bike")}
              className="cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center border-[#B55C32]
                  ${selected === "bike" ? "bg-[#B55C32]" : "bg-white"}`}
              >
                {selected === "bike" && (
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
              onClick={() => setSelected("bike")}
              className={`bg-white rounded-xl shadow-md px-6 py-4 w-[280px] mx-auto flex flex-col items-center text-center cursor-pointer transition-all duration-200 ${
                selected === "bike"
                  ? "border-2 border-[#B55C32]"
                  : "border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <p className="text-sm font-light text-[#191919]">เดินทางด้วย</p>
                <FaMotorcycle className="text-xl text-[#B55C32]" />
                <p className="text-sm font-light text-[#191919]">จักรยานยนต์</p>
              </div>
              <div className="flex items-center gap-2 justify-center mt-1">
                <img src="/coin.svg" alt="coin" className="w-4 h-4" />
                <p className="text-sm font-light text-[#191919]">
                  เริ่มต้น 650 บาท/4 สัปดาห์
                </p>
              </div>
            </div>
          </div>

          {/* --- รถยนต์ --- */}
          <div className="flex items-center justify-center gap-3">
            {/* ปุ่มกลมอยู่นอกกล่อง */}
            <div
              onClick={() => setSelected("car")}
              className="cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center border-[#B55C32]
                  ${selected === "car" ? "bg-[#B55C32]" : "bg-white"}`}
              >
                {selected === "car" && (
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
              onClick={() => setSelected("car")}
              className={`bg-white rounded-xl shadow-md px-6 py-4 w-[280px] mx-auto flex flex-col items-center text-center cursor-pointer transition-all duration-200 ${
                selected === "car"
                  ? "border-2 border-[#B55C32]"
                  : "border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <p className="text-sm font-light text-[#191919]">เดินทางด้วย</p>
                <FaCar className="text-xl text-[#B55C32]" />
                <p className="text-sm font-light text-[#191919]">รถยนต์</p>
              </div>
              <div className="flex items-center gap-2 justify-center mt-1">
                <img src="/coin.svg" alt="coin" className="w-4 h-4" />
                <p className="text-sm font-light text-[#191919]">
                  เริ่มต้น 1000 บาท/4 สัปดาห์
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* หมายเหตุ */}
      <div className="flex-grow" />
      <div className="text-center text-sm font-light text-[#B55C32] mb-4">
        หมายเหตุ: จุดรับ/ส่ง และเวลา จะเหมือนเดิมทุกครั้ง
      </div>

      {/* ปุ่มสร้างแพ็คเกจ */}
      <div className="bg-white rounded-t-2xl shadow-inner px-6 pt-4 pb-6">
        {/* ยอดในกระเป๋าเงิน */}
        <div className="flex items-center gap-2 justify-center mb-3 -mt-1">
          <p className="text-sm font-light text-[#191919]">ยอดในกระเป๋าเงิน</p>
          <img src="/coin.svg" alt="coin" className="w-4 h-4" />
          <p className="text-sm font-light text-[#191919]">100 บาท</p>
        </div>
        
        <button
          className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl shadow-md hover:bg-[#d9956f] transition-colors duration-200"
          onClick={() => router.push("/customer/booking/regular/packet1")}
        >
          ซื้อแพ็คเกจทริปขาประจำ
        </button>
      </div>
    </div>
  );
}

export default Background;
