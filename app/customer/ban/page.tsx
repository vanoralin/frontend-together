"use client";

import { useState } from "react";

export default function BanNotificationPage() {
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = () => {
    console.log("Appeal message:", message);
    setShowPopup(true); // เปิด popup
  };

  return (
    <div className="relative min-h-screen bg-[#C5DEDA] flex flex-col">
      {/* Main Content */}
      <div className="flex flex-col items-center px-6 pt-14 flex-1">
        {/* Ban Title */}
        <h1 className="text-[32px] text-black mb-4 text-center">คุณโดนแบน!!</h1>

        {/* Warning Icon */}
        <div className="mb-4">
          <img
            src="/alarm sign.svg"
            alt="Warning"
            className="w-44 h-44 object-contain"
          />
        </div>

        {/* Ban Description */}
        <div className="text-center mb-8 px-4">
          <p className="text-[#B55C32] text-[14px] leading-relaxed">
            เนื่องจากระบบตรวจพบการยกเลิกทริป
          </p>
          <p className="text-[#B55C32] text-[14px] leading-relaxed">
            กรุณาระบุเหตุผลด้านล่าง เพื่อส่งคำร้องขอปลดแบน
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
          className="w-full h-12 bg-[#E6A88A] hover:bg-[#B55C32] transition-colors inline-flex items-center justify-center"
          style={{
            boxSizing: "border-box",
            color: "#191919",
            border: "2px solid #B55C32",
            borderRadius: 25,
            fontSize: "24px",
          }}
          onClick={handleSubmit}
        >
          ยืนยัน
        </button>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-72 text-center">
            <h2 className="text-lg font-bold text-[#B55C32] mb-3">
              ส่งแล้ว ✅
            </h2>
            <p className="text-gray-700 mb-5">ระบบได้รับข้อความของคุณแล้ว</p>
            <button
              className="w-full h-10 bg-[#E6A88A] hover:bg-[#B55C32] text-black font-semibold rounded-xl transition-colors"
              onClick={() => setShowPopup(false)}
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
