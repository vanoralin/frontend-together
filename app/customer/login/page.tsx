"use client";

import { useState, useEffect, FormEvent } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // ✅ รับ token กลับมาทาง query (?token=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const err = params.get("error");

    if (err)
      setServerError(
        err === "access_denied" ? "ผู้ใช้ยกเลิกการเข้าสู่ระบบ" : err
      );
    if (!token) return;

    localStorage.setItem("token", token);
    window.history.replaceState({}, "", window.location.pathname); // ล้าง query

    (async () => {
      try {
        const prof = await axios.get("/api/User/profile", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        const nameVal = String(prof.data?.name ?? "");
        const isBanned = nameVal.startsWith("[BANNED]");
        if (isBanned) return window.location.replace("/customer/ban");

        // (ทางเลือก) บังคับโดเมนเมล
        if (
          prof.data?.email &&
          !String(prof.data.email).endsWith("@kmitl.ac.th")
        ) {
          localStorage.removeItem("token");
          setServerError("อนุญาตเฉพาะอีเมล @kmitl.ac.th เท่านั้น");
          return;
        }

        window.location.replace("/customer/home");
      } catch {
        setServerError("ไม่สามารถอ่านข้อมูลผู้ใช้หลังเข้าสู่ระบบได้");
      }
    })();
  }, []);

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

      const nameVal = String(prof.data?.name ?? "");
      if (nameVal.startsWith("[BANNED]"))
        return (window.location.href = "/customer/ban");

      window.location.href = "/customer/home";
    } catch (err: any) {
      const status = err?.response?.status;
      const apiMsg = err?.response?.data?.message;
      let msg = "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
      if (status === 400) msg = "ข้อมูลไม่ถูกต้อง กรุณากรอกใหม่อีกครั้ง";
      else if (status === 401)
        msg = "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง";
      else if (status === 500) msg = "เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ภายหลัง";
      setServerError(apiMsg || msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ ปุ่ม Google → ใช้ path สัมพัทธ์ (proxy ไป backend ตาม rewrites)
  const handleGoogleLogin = () => {
    setServerError("");
    setIsGoogleLoading(true);
    const returnTo = window.location.origin + "/customer/login";
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
