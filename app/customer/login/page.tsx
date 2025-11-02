"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import axios from "axios";

//ban realtime
import {
  checkBannedFromProfile,
  markBannedLocal,
  readBannedLocal,
  isBannedFromName,
} from "@/lib/ban";

export default function LoginPage() {
  const titleSize = 64;
  const baseSize = "16px";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // ✅ รับ token กลับมาทาง query (?token=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const err = params.get("error");

    if (err) {
      setServerError(
        err === "access_denied" ? "ผู้ใช้ยกเลิกการเข้าสู่ระบบ" : err
      );
      return;
    }

    // 1) ถ้ามี token จาก query (กรณีที่ backend เคยส่งมา) → เก็บแล้วไปต่อ
    if (token) {
      (async () => {
        try {
          localStorage.setItem("token", token);
          window.history.replaceState({}, "", window.location.pathname);
          const prof = await axios.get("/api/User/profile", {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          // ตรวจ ban/อีเมล ตามเดิม...
          window.location.replace("/customer/home");
        } catch {
          setServerError("ไม่สามารถอ่านข้อมูลผู้ใช้หลังเข้าสู่ระบบได้");
        }
      })();
      return;
    }

    // 2) ถ้าไม่มี token → ลอง “silent login” ด้วยคุกกี้
    (async () => {
      try {
        const res = await axios.get("/api/User/profile", {
          withCredentials: true, // สำคัญ เพื่อส่งคุกกี้ไปด้วย
        });
        // ถ้ากลับมาได้ → แปลว่ามี AuthToken แล้ว
        // (ถ้าอยาก ก็ set localStorage ให้หน้าอื่นใช้ header แบบ Bearer ได้)
        // localStorage.setItem("token", SOME_VALUE_FROM_COOKIE_IF_NEEDED);
        // ตรวจ ban/อีเมล ตามเดิม...
        window.location.replace("/customer/home");
      } catch {
        // ไม่มีคุกกี้/ยังไม่ล็อกอิน → อยู่หน้า login ต่อไปเฉย ๆ
      }
    })();
  }, []);

  // ✅ Email/Password login เดิม
  // ✅ Email/Password login เดิม
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setServerError("");

    let ok = true;
    if (!email) {
      setEmailError("กรุณากรอกอีเมล");
      ok = false;
    } else if (!email.endsWith("@kmitl.ac.th")) {
      setEmailError("กรุณากรอกอีเมล @kmitl.ac.th เท่านั้น");
      ok = false;
    }
    if (!password) {
      setPasswordError("กรุณากรอกรหัสผ่าน");
      ok = false;
    }
    if (!ok) return;

    setIsLoading(true);
    try {
      interface LoginResponse {
        token: string;
        user: string;
      }
      const res = await axios.post<LoginResponse>(
        "/api/User/login",
        { email, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      const token = res.data.token;
      if (!token) throw new Error("Token not found in response");
      localStorage.setItem("token", token);

      const prof = await axios.get("/api/User/profile", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const isBanned = isBannedFromName(prof.data?.name);
      if (isBanned) {
        markBannedLocal(true); // ✅ บันทึกสถานะแบน
        return (window.location.href = "/customer/ban");
      }

      markBannedLocal(false); // ✅ ล้างสถานะแบน (เผื่อเคยโดนก่อนหน้า)
      window.location.href = "/customer/home";
    } catch (err: any) {
      const status = err?.response?.status;

      // ✅ รองรับทั้งกรณี backend ส่ง string ตรง ๆ หรือ { message: string }
      const raw = err?.response?.data;
      const apiMsg: string | undefined =
        typeof raw === "string" ? raw : raw?.message;

      // ✅ แปลข้อความอังกฤษเป็นไทย
      const lower = (apiMsg || "").toLowerCase();
      const translated =
        lower.includes("invalid email or password") ||
        lower.includes("invalid credentials")
          ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง"
          : apiMsg;

      // ✅ ข้อความ fallback ตาม status code
      let fallback = "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
      if (status === 400) fallback = "ข้อมูลไม่ถูกต้อง กรุณากรอกใหม่อีกครั้ง";
      else if (status === 401)
        fallback = "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง";
      else if (status === 500)
        fallback = "เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ภายหลัง";

      setServerError(translated || fallback);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ ปุ่ม Google → ใช้ path สัมพัทธ์ (proxy ไป backend ตาม rewrites)
  const handleGoogleLogin = () => {
    setServerError("");
    setIsGoogleLoading(true);
    const returnTo = "http://localhost:5173/customer/home";
    window.location.href = `/auth/google/login?redirect=${encodeURIComponent(
      returnTo
    )}`;
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
          fontFamily: "'Mitr', sans-serif",
        }}
      >
        <form
          onSubmit={handleLogin}
          className="px-6 pt-12 pb-6 flex flex-col items-center relative z-10"
          style={{ height: "100%", boxSizing: "border-box" }}
        >
          <h1
            style={{ fontSize: titleSize, color: "#191919", marginBottom: 8 }}
          >
            ไปด้วยกันนะ
          </h1>

          <div style={{ width: 318 }}>
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
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
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
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
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
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}

            {serverError && (
              <p className="text-red-500 text-sm mt-2">{serverError}</p>
            )}

            <div className="flex justify-center mb-4 mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex items-center justify-center h-12 transition-colors px-6 ${
                  isLoading
                    ? "bg-gray-400 border-gray-400 cursor-not-allowed"
                    : "bg-[#E6A88A] hover:bg-[#B55C32] border-[#B55C32]"
                }`}
                style={{
                  boxSizing: "border-box",
                  color: "#191919",
                  border: "2px solid #B55C32",
                  borderRadius: 25,
                  fontSize: baseSize,
                }}
              >
                {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </div>

            <div
              className="text-center text-[#191919] mb-4"
              style={{ fontSize: baseSize }}
            >
              หรือ
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full h-12 bg-white border border-gray-200 rounded-2xl mb-6 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              <img
                src="/google.svg"
                alt=""
                aria-hidden="true"
                className="w-5 h-5"
              />
              <span>
                {isGoogleLoading
                  ? "กำลังไปยัง Google..."
                  : "เข้าสู่ระบบด้วย Google"}
              </span>
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

          <div style={{ flex: 1 }} />
          <img
            src="/login.svg"
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-0"
            style={{ width: 390, height: "auto", userSelect: "none" }}
          />
        </form>
      </div>
    </div>
  );
}
