"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { BackButton } from "@/app/components/share_component";
import axios from "axios";

export default function RegisterPage() {
  const titleSize = 30;
  const buttonSize = 24;
  const baseSize = 16;

  const [preview, setPreview] = useState<string | null>(null);
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // ✅ ฟังก์ชันส่งข้อมูลไป backend
  const handleSubmit = async () => {
    if (!bankName || !bankCode || !accountNumber || !accountName) {
      setMessage("⚠️ กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("⚠️ ไม่พบ token กรุณาเข้าสู่ระบบใหม่");
        setIsLoading(false);
        return;
      }

      const res = await axios.post(
        "https://your-api-url.com/api/driver/linkbank",
        {
          bank_account_name: accountName,
          bank_account_number: accountNumber,
          bank_code: bankCode,
          bank_name: bankName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("✅ ผูกบัญชีธนาคารสำเร็จ!");
      console.log("response:", res.data);
    } catch (err: any) {
      console.error(err);
      setMessage(
        err.response?.data?.message ||
          "❌ เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#C5D4E8] flex items-center justify-center">
      <div
        className="relative overflow-hidden"
        style={{
          width: 390,
          height: 844,
          backgroundColor: "#C5D4E8",
          boxShadow: "rgba(0,0,0,0.1)",
          fontFamily: "'Mitr', sans-serif",
        }}
      >
        <div className="px-6 pt-6 pb-6 flex flex-col relative z-10 h-full">
          {/* Header */}
          <div className="w-full flex items-center mb-4">
            <BackButton href="/driver/register" className="mr-2" />
            <h1
              className="px-[55px] py-[10px] text-[#191919] font-medium"
              style={{ fontSize: titleSize, lineHeight: 1.3 }}
            >
              ผูกบัญชีธนาคาร
            </h1>
          </div>

          {/* Hidden input สำหรับอัปโหลด */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Form */}
          <div className="flex-1 flex items-center justify-center">
            <div style={{ width: 318 }}>
              <label
                className="block text-[#191919] mt-4 mb-2"
                style={{ fontSize: baseSize }}
              >
                ธนาคาร
              </label>
              <div className="relative mb-4">
                <select
                  className="w-full h-12 bg-white shadow-sm pl-4 pr-10 outline-none appearance-none"
                  style={{
                    border: "2px solid #D9D9D9",
                    borderRadius: 20,
                    fontSize: baseSize,
                    boxSizing: "border-box",
                  }}
                  onChange={(e) => {
                    setBankCode(e.target.value);
                    if (e.target.value === "kbank") setBankName("กสิกรไทย");
                    if (e.target.value === "scb") setBankName("ไทยพาณิชย์");
                    if (e.target.value === "bbl") setBankName("กรุงเทพ");
                  }}
                >
                  <option value="">เลือกธนาคาร</option>
                  <option value="kbank">กสิกรไทย</option>
                  <option value="scb">ไทยพาณิชย์</option>
                  <option value="bbl">กรุงเทพ</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <label
                className="block text-[#191919] mb-2"
                style={{ fontSize: baseSize }}
              >
                เลขบัญชี
              </label>
              <input
                type="text"
                className="w-full h-12 mb-4 bg-white shadow-sm pl-4 pr-4 outline-none"
                style={{
                  border: "2px solid #D9D9D9",
                  borderRadius: 20,
                  fontSize: baseSize,
                  boxSizing: "border-box",
                }}
                placeholder="กรอกเลขบัญชี"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />

              <label
                className="block text-[#191919] mb-2"
                style={{ fontSize: baseSize }}
              >
                ชื่อ-นามสกุล
              </label>
              <input
                type="text"
                className="w-full h-12 bg-white shadow-sm pl-4 pr-4 outline-none"
                style={{
                  border: "2px solid #D9D9D9",
                  borderRadius: 20,
                  fontSize: baseSize,
                  boxSizing: "border-box",
                }}
                placeholder="กรอกชื่อ-นามสกุล"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
          </div>

          {/* ปุ่มด้านล่าง */}
          <div className="flex flex-col items-center mb-6">
            <img src="/bank.svg" alt="bank logo" className="w-86 h-86 mb-3" />

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-fit h-12 bg-[#E6A88A] hover:bg-[#B55C32] transition-colors px-5 inline-flex items-center justify-center"
              style={{
                boxSizing: "border-box",
                color: "#191919",
                border: "2px solid #B55C32",
                borderRadius: 25,
                fontSize: buttonSize,
                whiteSpace: "nowrap",
              }}
            >
              {isLoading ? "กำลังผูกบัญชี..." : "ผูกบัญชีธนาคาร"}
            </button>

            {message && (
              <p
                className="text-center mt-3 text-[#191919]"
                style={{ fontSize: baseSize }}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
