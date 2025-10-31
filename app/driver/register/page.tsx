"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { BackButton } from "@/app/components/share_component";
import { useRouter } from "next/navigation";
import axios from "axios";
import imageCompression from "browser-image-compression"; // ✅ ใช้สำหรับบีบอัดภาพ

export default function RegisterPage() {
  const titleSize = 40;
  const titleSmallSize = 26;
  const buttonSize = 24;
  const baseSize = 16;

  const [preview, setPreview] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const [vehicleType, setVehicleType] = useState("motorcycle");
  const [model, setModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [color, setColor] = useState("");
  const [seats, setSeats] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // ✅ เก็บไฟล์จริง
  const [errorMessage, setErrorMessage] = useState("");
  // ---------------- โหลดข้อมูลโปรไฟล์ ----------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("/api/User/profile", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        if (res.data) {
          setProfile({
            name: res.data.name,
            email: res.data.email,
          });
        }
      } catch (err) {
        console.error("❌ โหลดข้อมูลโปรไฟล์ไม่สำเร็จ:", err);
      }
    };

    fetchProfile();
  }, []);

  // ---------------- จัดการอัปโหลดรูป ----------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

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

  // ---------------- ส่งข้อมูลสมัครคนขับ ----------------
  const handleSubmit = async () => {
    if (
      !selectedFile ||
      !vehicleType ||
      !model ||
      !licensePlate ||
      !color ||
      !seats
    ) {
      setErrorMessage("⚠️ กรุณากรอกข้อมูลให้ครบทุกช่องและอัปโหลดรูปใบขับขี่");
      return;
    }

    setErrorMessage(""); // เคลียร์ข้อความเก่า
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("กรุณาเข้าสู่ระบบก่อน");
        setIsLoading(false);
        return;
      }

      // ... (บีบอัดภาพและส่ง API เหมือนเดิม)

      alert("✅ สมัครคนขับสำเร็จ!");
      router.push("/driver/home");
    } catch (error: any) {
      console.error("❌ สมัครคนขับไม่สำเร็จ:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- ไปหน้าผูกบัญชี ----------------
  const handleGoBank = () => {
    router.push("/driver/bank");
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen w-full bg-[#C5D4E8] flex items-center justify-center">
      <div
        className="relative overflow-y-auto"
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
          <div className="text-center mb-3">
            <div
              className="text-[#191919] font-medium"
              style={{ fontSize: titleSmallSize }}
            >
              {profile ? profile.name : "กำลังโหลด..."}
            </div>
            <div className="text-[#191919]" style={{ fontSize: baseSize }}>
              {profile ? profile.email : ""}
            </div>
          </div>

          {/* Upload License */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
            className="w-80 aspect-[85.6/54] mx-auto flex items-center justify-center bg-white relative cursor-pointer shadow-sm rounded-2xl"
            aria-label="อัปโหลดรูปใบขับขี่"
          >
            <div className="w-full h-full overflow-hidden bg-gray-100 flex items-center justify-center rounded-2xl">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-500" style={{ fontSize: baseSize }}>
                  รูปใบขับขี่
                </div>
              )}
            </div>
            <div className="absolute bottom-2 right-2 w-10 h-10 rounded-lg flex items-center justify-center bg-white/70">
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
          <div style={{ width: 318 }} className="mt-4">
            {/* Vehicle Type */}
            <label
              className="block text-[#191919]"
              style={{ fontSize: baseSize }}
            >
              พาหนะของฉัน
            </label>
            <div className="relative mb-3">
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full h-12 bg-white shadow-sm pl-4 pr-10 outline-none appearance-none"
                style={{
                  border: "2px solid #D9D9D9",
                  borderRadius: 20,
                  fontSize: baseSize,
                }}
              >
                <option value="car">รถยนต์</option>
                <option value="motorcycle">รถจักรยานยนต์</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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

            {/* Model */}
            <label
              className="block text-[#191919]"
              style={{ fontSize: baseSize }}
            >
              รุ่น
            </label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              type="text"
              placeholder="เช่น Honda Click"
              className="w-full h-12 bg-white shadow-sm pl-4 pr-4 outline-none mb-3"
              style={{
                border: "2px solid #D9D9D9",
                borderRadius: 20,
                fontSize: baseSize,
              }}
            />

            {/* License Plate */}
            <label
              className="block text-[#191919]"
              style={{ fontSize: baseSize }}
            >
              ป้ายทะเบียน
            </label>
            <input
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              type="text"
              placeholder="เช่น 1234 กทม"
              className="w-full h-12 bg-white shadow-sm pl-4 pr-4 outline-none mb-3"
              style={{
                border: "2px solid #D9D9D9",
                borderRadius: 20,
                fontSize: baseSize,
              }}
            />

            {/* Color */}
            <label
              className="block text-[#191919]"
              style={{ fontSize: baseSize }}
            >
              ลักษณะภายนอก (สี)
            </label>
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              type="text"
              placeholder="เช่น สีดำ"
              className="w-full h-12 bg-white shadow-sm pl-4 pr-4 outline-none mb-3"
              style={{
                border: "2px solid #D9D9D9",
                borderRadius: 20,
                fontSize: baseSize,
              }}
            />

            {/* Seats */}
            <label
              className="block text-[#191919]"
              style={{ fontSize: baseSize }}
            >
              จำนวนผู้โดยสารที่รับได้
            </label>
            <input
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              type="number"
              min="1"
              placeholder="เช่น 3"
              className="w-full h-12 bg-white shadow-sm pl-4 pr-4 outline-none mb-6"
              style={{
                border: "2px solid #D9D9D9",
                borderRadius: 20,
                fontSize: baseSize,
              }}
            />

            {/* แสดงข้อความ error ถ้ามี */}
            {errorMessage && (
              <p className="text-red-600 text-[13px]  mb-4">{errorMessage}</p>
            )}

            {/* Buttons */}
            <div className="flex flex-col space-y-4 mb-4">
              <button
                onClick={handleGoBank}
                className="w-full h-12 bg-white hover:bg-gray-50 transition-colors px-6 flex items-center justify-between"
                style={{
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
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`w-fit h-12 px-5 inline-flex items-center justify-center transition-colors ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#E6A88A] hover:bg-[#B55C32]"
                  }`}
                  style={{
                    color: "#191919",
                    border: "2px solid #B55C32",
                    borderRadius: 25,
                    fontSize: buttonSize,
                    whiteSpace: "nowrap",
                  }}
                >
                  {isLoading ? "กำลังส่ง..." : "ลงทะเบียน"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
}
