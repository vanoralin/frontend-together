"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { BackButton } from "@/app/components/share_component";
import { useRouter } from "next/navigation";
import axios from "axios";
import imageCompression from "browser-image-compression";

export default function RegisterPage() {
  const titleSize = 40;
  const titleSmallSize = 26;
  const buttonSize = 24;
  const baseSize = 16;

  const APPLY_ENDPOINT = "/api/apply-driver";

  const compressOptions = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
  };

  const [preview, setPreview] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const [vehicleType, setVehicleType] = useState("car");
  const [model, setModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [description, setDescription] = useState("");
  const [seats, setSeats] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  // โหลดข้อมูลโปรไฟล์
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("/api/User/profile", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        if (res.data)
          setProfile({ name: res.data.name, email: res.data.email });
      } catch (err) {
        console.error("❌ โหลดข้อมูลโปรไฟล์ไม่สำเร็จ:", err);
      }
    };

    fetchProfile();
  }, []);

  // อัปโหลดรูป
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMessage("รองรับเฉพาะ JPG / PNG / WEBP เท่านั้น");
      return;
    }

    setErrorMessage("");
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

  // จำกัดจำนวนผู้โดยสารตามประเภทพาหนะ
  const maxSeats = vehicleType === "motorcycle" ? 1 : 4;

  const validateSeats = (raw: string) => {
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 1) {
      return "กรุณากรอกจำนวนผู้โดยสารเป็นเลขจำนวนเต็มตั้งแต่ 1 ขึ้นไป";
    }
    if (n > maxSeats) {
      return vehicleType === "motorcycle"
        ? "รถจักรยานยนต์รับผู้โดยสารได้ไม่เกิน 1 คน"
        : "รถยนต์รับผู้โดยสารได้ไม่เกิน 4 คน";
    }
    return ""; // ผ่าน
  };

  // ส่งข้อมูลสมัครคนขับ
  const handleSubmit = async () => {
    if (
      !selectedFile ||
      !vehicleType ||
      !model ||
      !licensePlate ||
      !description ||
      !seats
    ) {
      setErrorMessage("⚠️ กรุณากรอกข้อมูลให้ครบทุกช่องและอัปโหลดรูปใบขับขี่");
      return;
    }

    // ✅ ตรวจจำนวนผู้โดยสารตามประเภทรถ
    const seatErr = validateSeats(seats);
    if (seatErr) {
      setErrorMessage(seatErr);
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("กรุณาเข้าสู่ระบบก่อน");
        setIsLoading(false);
        return;
      }

      // บีบอัดภาพ
      let fileToUpload = selectedFile;
      try {
        const compressed = await imageCompression(
          selectedFile,
          compressOptions
        );
        const ext = compressed.type.includes("png")
          ? "png"
          : compressed.type.includes("webp")
          ? "webp"
          : "jpg";
        fileToUpload = new File([compressed], `license.${ext}`, {
          type: compressed.type || "image/jpeg",
        });
      } catch {
        console.warn("⚠️ บีบอัดภาพไม่สำเร็จ ใช้ไฟล์ต้นฉบับแทน");
      }

      // ✅ สร้าง FormData (ตรงตาม API + เพิ่ม description และ seats)
      const form = new FormData();
      form.append("driving_license", fileToUpload);
      form.append("vehicle_type", vehicleType);
      form.append("model_vehicle", model);
      form.append("license_plate", licensePlate);
      form.append("description", description);
      form.append("seats", String(seats));

      const res = await axios.post(APPLY_ENDPOINT, form, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (res.status === 201) {
        setSuccessOpen(true); // ✅ เปิด Popup
        setTimeout(() => {
          router.push("/driver/home"); // ✅ เด้งไปหน้าโฮมอัตโนมัติ
        }, 1500);
        return; // กันโค้ดด้านล่างรันต่อ
      }
    } catch (error: any) {
      const st = error?.response?.status;
      const data = error?.response?.data;
      console.error("สมัครคนขับไม่สำเร็จ:", st, data);

      switch (st) {
        case 400:
          setErrorMessage(
            data?.error || "400: ข้อมูลไม่ถูกต้องหรือฟิลด์ไม่ครบ"
          );
          break;
        case 401:
          setErrorMessage("401: กรุณาเข้าสู่ระบบใหม่");
          break;
        case 404:
          setErrorMessage("404: ไม่พบผู้ใช้");
          break;
        case 409:
          setErrorMessage("409: คุณเป็นคนขับอยู่แล้ว");
          break;
        case 500:
          setErrorMessage("500: เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่");
          break;
        default:
          setErrorMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBank = () => router.push("/driver/bank");

  // ---------- UI ----------
  return (
    <div className="min-h-screen w-full bg-[#C5D4E8] flex items-center justify-center">
      <div
        className="relative overflow-y-auto"
        style={{
          width: 390,
          height: 844,
          backgroundColor: "#C5D4E8",
          fontFamily: "'Mitr', sans-serif",
        }}
      >
        <div className="px-6 pt-6 pb-6 flex flex-col items-center relative z-10 h-full">
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

          {/* Profile */}
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

          {/* Upload license */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
            className="w-80 aspect-[85.6/54] mx-auto flex items-center justify-center bg-white relative cursor-pointer shadow-sm rounded-2xl"
          >
            <div className="w-full h-full overflow-hidden bg-gray-100 flex items-center justify-center rounded-2xl">
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
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
            {/* Vehicle type */}
            <label
              className="block text-[#191919]"
              style={{ fontSize: baseSize }}
            >
              พาหนะของฉัน
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full h-12 bg-white shadow-sm pl-4 pr-4 outline-none mb-3"
              style={{
                border: "2px solid #D9D9D9",
                borderRadius: 20,
                fontSize: baseSize,
              }}
            >
              <option value="car">รถยนต์</option>
              <option value="motorcycle">รถจักรยานยนต์</option>
            </select>

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
              placeholder="เช่น Honda City"
              className="w-full h-12 bg-white shadow-sm pl-4 pr-4 outline-none mb-3"
              style={{
                border: "2px solid #D9D9D9",
                borderRadius: 20,
                fontSize: baseSize,
              }}
            />

            {/* License plate */}
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
              placeholder="เช่น กข 1234"
              className="w-full h-12 bg-white shadow-sm pl-4 pr-4 outline-none mb-3"
              style={{
                border: "2px solid #D9D9D9",
                borderRadius: 20,
                fontSize: baseSize,
              }}
            />

            {/* Description */}
            <label
              className="block text-[#191919]"
              style={{ fontSize: baseSize }}
            >
              ลักษณะภายนอก
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              type="text"
              placeholder="เช่น สีขาว มีลายข้าง"
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
              onChange={(e) => {
                // อนุญาตเฉพาะตัวเลข + clamp ตามประเภทพาหนะ
                const raw = e.target.value.replace(/[^\d]/g, "");
                if (!raw) {
                  setSeats("");
                  return;
                }

                const n = Math.max(1, Math.min(Number(raw), maxSeats));
                setSeats(String(n));

                // ล้าง error ทันทีถ้ากลับมาอยู่ในช่วงที่ถูกต้อง
                const msg = validateSeats(String(n));
                if (!msg) setErrorMessage("");
              }}
              type="tel" // ใช้ tel ให้คียบอร์ดตัวเลขบนมือถือ
              inputMode="numeric"
              min={1}
              max={maxSeats} // ✅ เปลี่ยนตาม vehicleType
              placeholder={
                vehicleType === "motorcycle" ? "สูงสุด 1 คน" : "สูงสุด 4 คน"
              }
              className="w-full h-12 bg-white shadow-sm pl-4 pr-4 outline-none mb-6"
              style={{
                border: "2px solid #D9D9D9",
                borderRadius: 20,
                fontSize: baseSize,
              }}
            />

            {/* Error */}
            {errorMessage && (
              <p className="text-red-600 text-[13px] mb-4">{errorMessage}</p>
            )}

            {/* Buttons */}
            <div className="flex flex-col space-y-4 mb-4">
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

            {successOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div
                  role="alertdialog"
                  aria-live="assertive"
                  className="bg-white rounded-2xl shadow-lg w-[320px] p-6 text-center"
                  style={{ fontFamily: "'Mitr', sans-serif" }}
                >
                  <div className="mx-auto mb-3 flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                    {/* ไอคอนเครื่องหมายถูก */}
                    <svg viewBox="0 0 24 24" className="w-10 h-10">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="currentColor"
                        className="text-green-200"
                      />
                      <path
                        d="M8.5 12.5l2.5 2.5 4.5-5.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        className="text-green-700"
                      />
                    </svg>
                  </div>

                  <h2
                    className="font-medium text-[#191919]"
                    style={{ fontSize: titleSmallSize }}
                  >
                    สมัครคนขับสำเร็จ
                  </h2>
                  {/* <p
                    className="text-[#191919] mt-1"
                    style={{ fontSize: baseSize }}
                  >
                    กำลังพาไปหน้าโฮมของคนขับ...
                  </p>

                  <button
                    onClick={() => router.push("/driver/home")}
                    className="mt-4 w-full h-12 bg-[#E6A88A] hover:bg-[#B55C32] text-[#191919] border-2 border-[#B55C32] rounded-2xl transition-colors"
                    style={{ fontSize: buttonSize }}
                  >
                    ไปตอนนี้เลย
                  </button> */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
