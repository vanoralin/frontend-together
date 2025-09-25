"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { BackButton } from "@/app/components/share_component";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const titleSize = 40;
  const titleSmallSize = 26;
  const buttonSize = 24;
  const baseSize = 16;

  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

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

  const handleGoBank = () => {
    // ✅ สามารถเพิ่ม logic ตรวจสอบ form ก่อนเปลี่ยนหน้าได้ที่นี่
    router.push("/driver/bank");
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
        <div
          className="px-6 pt-6 pb-6 flex flex-col items-center relative z-10 h-full"
          style={{ boxSizing: "border-box" }}
        >
          {/* Header */}
          <div className="w-full flex items-center">
            <BackButton href="/customer/login" className="mr-2" />
            <h1
              className="px-[50px] py-[5px] text-[#191919] font-medium"
              style={{ fontSize: titleSize, lineHeight: 1.3 }}
            >
              ลงทะเบียน
              <span
                className="block font-normal"
                style={{ fontSize: titleSmallSize }}
              >
                คนขับ
              </span>
            </h1>
          </div>

          {/* User Info */}
          <div className="text-center mb-2">
            <div
              className="text-[#191919] font-medium"
              style={{ fontSize: titleSmallSize }}
            >
              สมปอง
            </div>
            <div className="text-[#191919] mt-1" style={{ fontSize: baseSize }}>
              6XXXXXXXX@kmitl.ac.th
            </div>
          </div>

          {/* Upload License */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter") fileRef.current?.click();
            }}
            className="w-80 aspect-[85.6/54] mx-auto flex items-center justify-center bg-white relative cursor-pointer shadow-sm rounded-2xl"
            aria-label="อัปโหลดรูปใบขับขี่"
          >
            <div className="w-full h-full overflow-hidden bg-gray-100 flex items-center justify-center rounded-2xl">
              {preview ? (
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <div className="text-gray-500" style={{ fontSize: baseSize }}>
                    รูปใบขับขี่
                  </div>
                </div>
              )}
            </div>
            <div className="absolute bottom-2 right-2 w-10 h-10 rounded-lg flex items-center justify-center">
              <img src="/camera.svg" alt="icon" className="w-8 h-8" />
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Form */}
          <div style={{ width: 318 }}>
            <label
              className="block text-[#191919]"
              style={{ fontSize: baseSize }}
            >
              พาหนะของฉัน
            </label>
            <div className="relative">
              <select
                className="w-full h-12 bg-white shadow-sm pl-4 pr-10 outline-none appearance-none"
                style={{
                  border: "2px solid #D9D9D9",
                  borderRadius: 20,
                  fontSize: baseSize,
                  boxSizing: "border-box",
                }}
              >
                <option value="car">รถยนต์</option>
                <option value="motorcycle">รถจักรยานยนต์</option>
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
              className="block text-[#191919]"
              style={{ fontSize: baseSize }}
            >
              รุ่น
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
              placeholder="รุ่น"
            />

            <label
              className="block text-[#191919]"
              style={{ fontSize: baseSize }}
            >
              ลักษณะภายนอก
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
              placeholder="สีหนะประกายนอก"
            />

            <label
              className="block text-[#191919]"
              style={{ fontSize: baseSize }}
            >
              จำนวนผู้โดยสารที่รับได้
            </label>
            <input
              type="text"
              className="w-full h-12 bg-white shadow-sm pl-4 pr-4 outline-none mb-6"
              style={{
                border: "2px solid #D9D9D9",
                borderRadius: 20,
                fontSize: baseSize,
                boxSizing: "border-box",
              }}
              placeholder="จำนวนผู้โดยสารที่รับได้"
            />

            {/* Buttons */}
            <div className="flex flex-col space-y-4 mb-4">
              <button
                onClick={handleGoBank}
                className="w-full h-12 bg-white hover:bg-gray-50 transition-colors px-6 flex items-center justify-between"
                style={{
                  boxSizing: "border-box",
                  color: "#191919",
                  border: "2px solid #D9D9D9",
                  borderRadius: 25,
                  fontSize: buttonSize,
                }}
              >
                <span>ผูกบัญชีธนาคาร</span>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className="flex justify-center">
                <button
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
                  ลงทะเบียน
                </button>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
}
