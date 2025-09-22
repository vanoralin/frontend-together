"use client";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import React, { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const titleSize = 64;
  const baseSize = "16px";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    let isValid = true;

    // Reset errors
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("กรุณากรอกอีเมล");
      isValid = false;
    }

    // Check if password is empty
    if (!password) {
      setPasswordError("กรุณากรอกรหัสผ่าน");
      isValid = false;
    }

    if (isValid) {
      console.log("เข้าสู่ระบบสำเร็จ:", { email, password });
    }
  };

  return (
    <div className="min-h-screen w-full bg-theme-customer flex items-center justify-center">
      <div
        className="relative overflow-hidden"
        style={{
          width: 390,
          height: 844,
          backgroundColor: "#EAFCFC",
          boxShadow: "rgba(0,0,0,0.1)",
        }}
      >
        <div
          className="px-6 pt-12 pb-6 flex flex-col items-center relative z-10"
          style={{ height: "100%", boxSizing: "border-box" }}
        >
          <h1
            style={{ fontSize: titleSize, color: "#191919", marginBottom: 8 }}
          >
            ไปด้วยกันนะ
          </h1>

          <div style={{ width: 318 }}>
            {" "}
            {/* center column width inside card (matches common design margins) */}
            <label
              className="block text-[#191919] pt-6"
              style={{ fontSize: baseSize }}
            >
              อีเมล (@kmitl.ac.th)
            </label>
            <div className="relative">
              <img
                src="/email.svg"
                alt=""
                aria-hidden="true"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
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
                value={email} // เชื่อมต่อกับ state
                onChange={(e) => setEmail(e.target.value)} // อัปเดต state เมื่อค่าเปลี่ยน
              />
            </div>
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
            <label
              className="block text-[#191919] mt-2"
              style={{ fontSize: baseSize }}
            >
              รหัสผ่าน
            </label>
            <div className="relative">
              <img
                src="/password.svg"
                alt=""
                aria-hidden="true"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
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
                value={password} // เชื่อมต่อกับ state
                onChange={(e) => setPassword(e.target.value)} // อัปเดต state เมื่อค่าเปลี่ยน
              />
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
            <div className="flex justify-center mb-4 mt-4">
              <button
                className="inline-flex items-center justify-center h-12 bg-[#E6A88A] hover:bg-[#B55C32] transition-colors px-6"
                style={{
                  boxSizing: "border-box",
                  color: "#191919",
                  border: "2px solid #B55C32",
                  borderRadius: 25,
                  fontSize: baseSize,
                }}
                onClick={handleLogin} // เรียกใช้ฟังก์ชัน
              >
                เข้าสู่ระบบ
              </button>
            </div>
            <div
              className="text-center text-[#191919] mb-4"
              style={{ fontSize: baseSize }}
            >
              หรือ
            </div>
            <button
              className="w-full h-12 bg-white border border-gray-200 rounded-2xl mb-6 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              style={{ width: "100%" }}
            >
              <span>เข้าสู่ระบบด้วย Google</span>
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                aria-hidden
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>
            <div
              className="text-center text-[#191919]"
              style={{ fontSize: baseSize }}
            >
              ยังไม่ได้เป็นสมาชิก?{" "}
              <Link
                href="/customer/register"
                className="text-[#E6A78A]"
                style={{ fontSize: baseSize }}
              >
                ลงทะเบียน
              </Link>
            </div>
          </div>

          {/* spacer to push background image to bottom but keep everything within 844px */}
          <div style={{ flex: 1 }} />

          <img
            src="/login.svg"
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-none z-0"
            style={{ width: 390, height: "auto", userSelect: "none" }}
          />
        </div>
      </div>
    </div>
  );
}
