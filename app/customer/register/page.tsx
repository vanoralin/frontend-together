"use client";

import React, { useEffect, useState, useRef } from "react";
import { BackButton } from "@/app/components/share_component";
import Link from "next/link";

export default function RegisterPage() {
  const titleSize = 40;
  const titleSmallSize = 26;
  const buttonSize = 24;
  const baseSize = 16;

  const [preview, setPreview] = useState<string | null>(null);
  const [gender, setGender] = useState<"male" | "female" | null>(null);
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

  return (
    <div className="min-h-screen w-full bg-theme-customer flex items-center justify-center">
      <div
        className="relative overflow-hidden"
        style={{
          width: 390,
          height: 844,
          backgroundColor: "#EAFCFC",
          boxShadow: "rgba(0,0,0,0.1)",
          fontFamily: "'Mitr', sans-serif",
        }}
      >
        <div
          className="px-6 pt-6 pb-6 flex flex-col items-center relative z-10"
          style={{ height: "100%", boxSizing: "border-box" }}
        >
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
                ผู้ใช้งานใหม่
              </span>
            </h1>
          </div>

          {/* avatar */}
          <div className="px-6 mb-4 w-full mt-2">
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter") fileRef.current?.click();
              }}
              className="w-32 h-32 mx-auto rounded-full flex items-center justify-center bg-white relative cursor-pointer shadow-sm"
              aria-label="อัปโหลดรูปโปรไฟล์"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-12 h-12 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 21v-1c0-2.21-3.582-4-8-4s-8 1.79-8 4v1"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow border border-gray-200">
                <svg
                  className="w-4 h-4 text-gray-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="#374151"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div style={{ width: 318 }}>
            <label
              className="block text-[#191919] mb-2"
              style={{ fontSize: baseSize }}
            >
              ชื่อผู้ใช้
            </label>
            <div className="relative mb-4">
              <img
                src="/user.svg"
                alt=""
                aria-hidden="true"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
              />
              <input
                type="text"
                className="w-full h-12 bg-white shadow-sm pl-4 pr-4 outline-none"
                style={{
                  border: "2px solid #D9D9D9",
                  borderRadius: 20,
                  fontSize: baseSize,
                  boxSizing: "border-box",
                }}
                placeholder=""
              />
            </div>

            <label
              className="block text-[#191919] mb-2"
              style={{ fontSize: baseSize }}
            >
              อีเมล (@kmitl.ac.th)
            </label>
            <div className="relative mb-4">
              <img
                src="/email.svg"
                alt=""
                aria-hidden="true"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
              />
              <input
                type="email"
                className="w-full h-12 bg-white shadow-sm pl-4 pr-10 outline-none"
                style={{
                  border: "2px solid #D9D9D9",
                  borderRadius: 20,
                  fontSize: baseSize,
                  boxSizing: "border-box",
                }}
                placeholder=""
              />
            </div>

            <label
              className="block text-[#191919] mb-2"
              style={{ fontSize: baseSize }}
            >
              รหัสผ่าน
            </label>
            <div className="relative mb-4">
              <img
                src="/password.svg"
                alt=""
                aria-hidden="true"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
              />
              <input
                type="password"
                className="w-full h-12 bg-white shadow-sm pl-4 pr-10 outline-none"
                style={{
                  border: "2px solid #D9D9D9",
                  borderRadius: 20,
                  fontSize: baseSize,
                  boxSizing: "border-box",
                }}
                placeholder=""
              />
            </div>

            <label
              className="block text-[#191919] mb-2"
              style={{ fontSize: baseSize }}
            >
              เบอร์โทรศัพท์
            </label>
            <div className="relative mb-4">
              <img
                src="/phone.svg"
                alt=""
                aria-hidden="true"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
              />
              <input
                type="tel"
                className="w-full h-12 bg-white shadow-sm pl-4 pr-4 outline-none"
                style={{
                  border: "2px solid #D9D9D9",
                  borderRadius: 20,
                  fontSize: baseSize,
                  boxSizing: "border-box",
                }}
                placeholder=""
              />
            </div>

            <div className="flex space-x-4 mb-4">
              <div className="flex-1">
                <label
                  className="block text-[#191919] mb-2"
                  style={{ fontSize: baseSize }}
                >
                  วันเกิด
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full h-12 bg-white shadow-sm pl-4 pr-4 outline-none"
                    style={{
                      border: "2px solid #D9D9D9",
                      borderRadius: 20,
                      fontSize: baseSize,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div className="w-28">
                <label
                  className="block text-[#191919] mb-2"
                  style={{ fontSize: baseSize }}
                >
                  เพศ
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center border transition ${
                      gender === "male"
                        ? "bg-[#77C4E5] border-[2px] border-black text-black shadow-md font-bold"
                        : "bg-white border-[2px] border-[#D9D9D9] text-[#8B8B8B] shadow-md"
                    }`}
                  >
                    ♂
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center border transition ${
                      gender === "female"
                        ? "bg-[#FFA6E0] border-[2px] border-black text-black shadow-md"
                        : "bg-white border-[2px] border-[#D9D9D9] text-[#8B8B8B] shadow-md"
                    }`}
                  >
                    ♀
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <button
                className="inline-flex items-center justify-center h-12 bg-[#E6A88A] hover:bg-[#B55C32] transition-colors px-6"
                style={{
                  boxSizing: "border-box",
                  color: "#191919",
                  border: "2px solid #B55C32",
                  borderRadius: 25,
                  fontSize: buttonSize,
                }}
              >
                ลงทะเบียน
              </button>
            </div>

            <div
              className="text-center text-[#191919]"
              style={{ fontSize: baseSize }}
            >
              มีบัญชีแล้ว?{" "}
              <Link
                href="/customer/login"
                className="text-[#E6A78A]"
                style={{ fontSize: baseSize }}
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          </div>

          {/* keep spacer so layout matches login but DO NOT render bottom image */}
          <div style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  );
}
