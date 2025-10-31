"use client";

import React, { useEffect, useState, useRef } from "react";
import { BackButton } from "@/app/components/share_component";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const titleSize = 40;
  const titleSmallSize = 26;
  const buttonSize = 24;
  const baseSize = 16;

  const [preview, setPreview] = useState<string | null>(null);
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [birthday, setBirthday] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  // สมมติ state ของคุณชื่อ birthday

  const validatePassword = (pw: string) => {
    if (!pw) return "กรุณากรอกรหัสผ่าน";
    if (pw.length < 6) return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    // ถ้าต้องการกฎเพิ่ม ให้เปิดคอมเมนต์ด้านล่าง
    // if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw))
    //   return "ต้องมีทั้งตัวอักษรและตัวเลขอย่างน้อยอย่างละ 1 ตัว";
    return "";
  };

  const isPasswordValid = validatePassword(password) === "";
  const isConfirmValid = password === confirmPassword && confirmPassword !== "";

  // เพิ่มตรวจสอบก่อนแปลง
  const formattedBirthday =
    birthday && !isNaN(new Date(birthday).getTime())
      ? new Date(birthday).toISOString().split("T")[0]
      : null;

  // ✅ Preview avatar
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

  // ✅ Register submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setServerError("");

    // 🧩 ตรวจสอบเฉพาะฟิลด์ที่จำเป็น
    if (!name || !email || !password) {
      setServerError("กรุณากรอกชื่อผู้ใช้ อีเมล และรหัสผ่าน");
      return;
    }

    if (!email.endsWith("@kmitl.ac.th")) {
      setServerError("กรุณาใช้อีเมล @kmitl.ac.th เท่านั้น");
      return;
    }

    const pwErr = validatePassword(password);
    if (pwErr) {
      setPasswordError(pwErr);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่อีกครั้ง");
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        name,
        email,
        password,
        confirm_password: confirmPassword,
        phone,
        gender,
      };

      if (formattedBirthday) {
        payload.birthdate = formattedBirthday;
      }

      const res = await axios.post("/api/User/register", payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Register success:", res.data);
      alert("🎉 สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
      router.push("/customer/login");
    } catch (err: any) {
      console.error("❌ Register error:", err.response?.data);

      if (err.response) {
        const data = err.response.data || {};
        const status = err.response.status;
        const dataText = typeof data === "string" ? data : JSON.stringify(data);
        let errorMsg = "";

        // ✅ ตรวจข้อความจาก backend (เช่น duplicate key)
        if (
          dataText.includes("duplicate key value") &&
          dataText.includes("idx_users_email")
        ) {
          errorMsg = "❌ อีเมลนี้มีอยู่ในระบบแล้ว กรุณาเข้าสู่ระบบ";
        } else if (status === 400) {
          errorMsg = "⚠️ ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
        } else if (status === 401) {
          errorMsg = "❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง";
        } else if (status === 409) {
          errorMsg = "❌ อีเมลนี้มีอยู่ในระบบแล้ว กรุณาเข้าสู่ระบบ";
        } else if (status >= 500) {
          errorMsg = "🚨 เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ภายหลัง";
        } else {
          errorMsg =
            data.message ||
            data.error ||
            "❌ ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง";
        }

        setServerError(errorMsg);
      } else if (err.request) {
        setServerError(
          "📡 ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต"
        );
      } else {
        setServerError("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-theme-customer flex items-center justify-center">
      <div
        className="relative overflow-y-auto"
        style={{
          width: 390,
          maxHeight: "100vh",
          backgroundColor: "#EAFCFC",
          boxShadow: "rgba(0,0,0,0.1) 0 0 10px",
          fontFamily: "'Mitr', sans-serif",
          borderRadius: 20,
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="px-6 pt-6 pb-6 flex flex-col items-center relative z-10"
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
                ผู้ใช้งานใหม่
              </span>
            </h1>
          </div>

          {/* Avatar Upload */}
          <div className="px-6 mb-4 w-full mt-2">
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
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
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 
                      1.79-4 4 1.79 4 4 4zM20 21v-1c0-2.21-3.582-4-8-4s-8 
                      1.79-8 4v1"
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

          {/* Input Fields */}
          <div style={{ width: 318 }}>
            {/* Username */}
            <label className="block text-[#191919] mb-2">ชื่อผู้ใช้</label>
            <div className="relative mb-4">
              <img
                src="/user.svg"
                alt="user"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 bg-white shadow-sm pl-4 pr-10 outline-none border-2 border-[#D9D9D9] rounded-[20px]"
              />
            </div>

            {/* Email */}
            <label className="block text-[#191919] mb-2">
              อีเมล (@kmitl.ac.th)
            </label>
            <div className="relative mb-4">
              <img
                src="/email.svg"
                alt="email"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-white shadow-sm pl-4 pr-10 outline-none border-2 border-[#D9D9D9] rounded-[20px]"
              />
            </div>

            {/* Password */}
            <label className="block text-[#191919] mb-2">รหัสผ่าน</label>
            <div className="relative mb-1">
              <img
                src="/password.svg"
                alt="password"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (!passwordTouched) setPasswordTouched(true);
                  // อัปเดต error ทันทีเมื่อพิมพ์
                  const msg = validatePassword(e.target.value);
                  setPasswordError(msg);
                }}
                onBlur={() => {
                  setPasswordTouched(true);
                  setPasswordError(validatePassword(password));
                }}
                className={`w-full h-12 bg-white shadow-sm pl-4 pr-10 outline-none border-2 rounded-[20px] ${
                  passwordTouched && !isPasswordValid
                    ? "border-red-400"
                    : "border-[#D9D9D9]"
                }`}
              />
            </div>
            {passwordTouched && passwordError && (
              <p className="text-red-500 text-sm mb-3">{passwordError}</p>
            )}

            {/* Confirm Password */}
            <label className="block text-[#191919] mb-2">ยืนยันรหัสผ่าน</label>
            <div className="relative mb-1">
              <img
                src="/password.svg"
                alt="confirm"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => {
                  if (password !== confirmPassword) {
                    setPasswordError("รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่อีกครั้ง");
                  } else if (!validatePassword(password)) {
                    setPasswordError("");
                  }
                }}
                className={`w-full h-12 bg-white shadow-sm pl-4 pr-10 outline-none border-2 rounded-[20px] ${
                  confirmPassword && password !== confirmPassword
                    ? "border-red-400"
                    : "border-[#D9D9D9]"
                }`}
              />
            </div>

            {/* Phone */}
            <label className="block text-[#191919] mb-2">เบอร์โทรศัพท์</label>
            <div className="relative mb-4">
              <img
                src="/phone.svg"
                alt="phone"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-12 bg-white shadow-sm pl-4 pr-10 outline-none border-2 border-[#D9D9D9] rounded-[20px]"
              />
            </div>

            {/* Birthday & Gender */}
            <div className="flex space-x-4 mb-4">
              <div className="flex-1">
                <label className="block text-[#191919] mb-2">วันเกิด</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full h-12 bg-white shadow-sm pl-4 pr-4 outline-none border-2 border-[#D9D9D9] rounded-[20px]"
                />
              </div>

              <div className="w-28">
                <label className="block text-[#191919] mb-2">เพศ</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center border transition ${
                      gender === "male"
                        ? "bg-[#77C4E5] border-black text-black shadow-md font-bold"
                        : "bg-white border-[#D9D9D9] text-[#8B8B8B] shadow-md"
                    }`}
                  >
                    ♂
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center border transition ${
                      gender === "female"
                        ? "bg-[#FFA6E0] border-black text-black shadow-md"
                        : "bg-white border-[#D9D9D9] text-[#8B8B8B] shadow-md"
                    }`}
                  >
                    ♀
                  </button>
                </div>
              </div>
            </div>

            {/* Server Error */}
            {serverError && (
              <p className="text-red-500 text-sm mb-2 text-center">
                {serverError}
              </p>
            )}

            {/* Submit */}
            <div className="flex justify-center mb-4">
              <button
                type="submit"
                disabled={
                  isLoading || !isPasswordValid || password !== confirmPassword
                }
                className={`inline-flex items-center justify-center h-12 bg-[#E6A88A] hover:bg-[#B55C32] transition-colors px-6 rounded-[25px] border-2 border-[#B55C32] ${
                  isLoading || !isPasswordValid || password !== confirmPassword
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                style={{ fontSize: buttonSize }}
              >
                {isLoading ? "กำลังสมัครสมาชิก..." : "ลงทะเบียน"}
              </button>
            </div>

            {/* Login link */}
            <div
              className="text-center text-[#191919]"
              style={{ fontSize: baseSize }}
            >
              มีบัญชีแล้ว?{" "}
              <Link href="/customer/login" className="text-[#E6A78A]">
                เข้าสู่ระบบ
              </Link>
            </div>
          </div>

          <div style={{ flex: 1 }} />
        </form>
      </div>
    </div>
  );
}
