"use client";


import { useState, FormEvent } from "react";
import Link from "next/link";
import axios from "axios";

export default function LoginPage() {
  const titleSize = 64;
  const baseSize = "16px";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let isValid = true;

    setEmailError("");
    setPasswordError("");
    setServerError("");

    if (!email) {
      setEmailError("กรุณากรอกอีเมล");
      isValid = false;
    }
    if (!password) {
      setPasswordError("กรุณากรอกรหัสผ่าน");
      isValid = false;
    }

    if (!isValid) return;

    try {
      interface LoginResponse {
        user: string;
        token: string;
      }

      const res = await axios.post<LoginResponse>(
        "/api/User/login",
        { email, password },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Login success:", res.data);

      window.location.href = "/customer";
    } catch (err: any) {
      console.error(err);
      if (err.response) {
        setServerError(err.response.data?.Message || "เกิดข้อผิดพลาด");
      } else {
        setServerError("ไม่สามารถเชื่อมต่อ server ได้");
      }
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
        <form
          onSubmit={handleLogin}
          className="px-6 pt-12 pb-6 flex flex-col items-center relative z-10"
          style={{ height: "100%", boxSizing: "border-box" }}
        >
          <h1 style={{ fontSize: titleSize, color: "#191919", marginBottom: 8 }}>
            ไปด้วยกันนะ
          </h1>

          <div style={{ width: 318 }}>
            <label className="block text-[#191919] pt-6" style={{ fontSize: baseSize }}>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}

            <label className="block text-[#191919] mt-2" style={{ fontSize: baseSize }}>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}

            {serverError && <p className="text-red-500 text-sm mt-2">{serverError}</p>}

            <div className="flex justify-center mb-4 mt-4">
              <button
                type="submit"
                className="inline-flex items-center justify-center h-12 bg-[#E6A88A] hover:bg-[#B55C32] transition-colors px-6"
                style={{
                  boxSizing: "border-box",
                  color: "#191919",
                  border: "2px solid #B55C32",
                  borderRadius: 25,
                  fontSize: baseSize,
                }}
              >
                เข้าสู่ระบบ
              </button>
            </div>

            <div className="text-center text-[#191919] mb-4" style={{ fontSize: baseSize }}>
              หรือ
            </div>

            <button
              type="button"
              className="w-full h-12 bg-white border border-gray-200 rounded-2xl mb-6 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <span>เข้าสู่ระบบด้วย Google</span>
            </button>

            <div className="text-center text-[#191919]" style={{ fontSize: baseSize }}>
              ยังไม่ได้เป็นสมาชิก?{" "}
              <Link href="/customer/register" className="text-[#E6A78A]" style={{ fontSize: baseSize }}>
                ลงทะเบียน
              </Link>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <img
            src="/login.svg"
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-none z-0"
            style={{ width: 390, height: "auto", userSelect: "none" }}
          />
        </form>
      </div>
    </div>
  );
}
