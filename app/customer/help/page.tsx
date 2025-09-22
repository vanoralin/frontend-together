"use client";

import { useState } from "react";
import Link from "next/link";

export default function ReportProblemPage() {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    console.log("Report message:", message);
    // TODO: Handle form submission here
  };

  return (
    <div className="min-h-screen bg-[#C5DEDA] flex flex-col">
      {/* Header */}
      <div className="relative flex items-center justify-center h-[60px] border-b border-gray-300">
        {/* Back Button */}
        <Link href="/" className="absolute left-4 text-black text-xl">
          ←
        </Link>

        {/* Title + Help Icon */}
        <div className="flex items-center gap-2 pt-14">
          <h1 className="text-[32px] text-black">แจ้งปัญหา</h1>
          <img src="/help.svg" alt="Help" className="w-8 h-8 object-contain" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center px-6 pt-8 flex-1">
        {/* Greeting */}
        <h2 className="text-2xl font-bold text-black mb-4 text-center leading-snug">
          สวัสดี คุณ เตา อั่งโล่ <br />
          เราพร้อมช่วยเหลือคุณ!
        </h2>

        {/* Description */}
        <div className="text-center mb-8 px-6">
          <p className="text-[#B55C32] text-[14px] leading-relaxed">
            แจ้งปัญหาได้ทุกอย่าง
          </p>
          <p className="text-[#B55C32] text-[14px] leading-relaxed">
            แอดมินจะพยายามติดต่อกลับอย่างรวดเร็ว
          </p>
        </div>

        {/* Message Input */}
        <div className="w-full max-w-md mb-6">
          <textarea
            placeholder="ข้อความ"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full min-h-[300px] bg-white border-0 rounded-2xl shadow-sm text-gray-700 placeholder:text-gray-400 resize-none text-base p-4 focus:outline-none focus:ring-2 focus:ring-[#B55C32]"
          />
        </div>
      </div>

      {/* Bottom White Box */}
      <div className="w-full h-[120px] bg-white flex items-center justify-center shadow-inner px-6 rounded-tl-[20px] rounded-tr-[20px] border-t border-gray-300">
        <button
          onClick={handleSubmit}
          className="w-full h-12 bg-[#E6A88A] hover:bg-[#B55C32] transition-colors inline-flex items-center justify-center"
          style={{
            boxSizing: "border-box",
            color: "#191919",
            border: "2px solid #B55C32",
            borderRadius: 25,
            fontSize: "20px",
          }}
        >
          ยืนยัน
        </button>
      </div>
    </div>
  );
}
