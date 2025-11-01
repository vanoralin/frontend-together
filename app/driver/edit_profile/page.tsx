"use client";

import React, { useEffect, useState, useRef } from "react";
import { BackButton } from "@/app/components/share_component";
import axios from "axios";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

export default function EditProfilePage() {
  const titleSize = 40;
  const titleSmallSize = 26;
  const router = useRouter();

  const [preview, setPreview] = useState<string | null>(null);
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [birthday, setBirthday] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  // ---------- utils: แปลงและตรวจเบอร์ ----------
  const normalizeThaiMobile = (raw: string) => {
    // ตัดทุกอย่างที่ไม่ใช่ตัวเลข
    let digits = raw.replace(/\D/g, "");
    // แปลง +66XXXXXXXXX -> 0XXXXXXXXX
    if (digits.startsWith("66")) {
      digits = "0" + digits.slice(2);
    }
    return digits;
  };

  const validateThaiMobile = (raw: string) => {
    const digits = normalizeThaiMobile(raw);
    // มือถือไทย 10 หลัก เริ่มต้น 06/08/09
    const ok = /^0[6-9]\d{8}$/.test(digits);
    return { ok, digits };
  };

  // ---------- โหลดข้อมูลโปรไฟล์เดิม ----------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("/api/User/profile", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        console.log("📦 Profile data:", res.data); // ✅ ดูข้อมูลจริงที่ส่งกลับมา

        const data = res.data;
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setBirthday(data.birthdate ? data.birthdate.split("T")[0] : ""); // ปรับตามชื่อฟิลด์จริง
        setGender(data.gender || null);
        if (data.profile_picture) setPreview(data.profile_picture);
      } catch (err) {
        console.error(err);
        setMessage("⚠️ โหลดข้อมูลโปรไฟล์ไม่สำเร็จ");
      }
    };
    fetchProfile();
  }, []);

  // ---------- handle เลือกรูป ----------
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // ✅ ตั้งค่าการบีบอัด
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      const compressedBlob = await imageCompression(file, options);

      // ✅ แปลง blob -> File ใหม่ เพื่อใช้กับ DataTransfer
      const compressedFile = new File([compressedBlob], file.name, {
        type: file.type,
        lastModified: Date.now(),
      });

      // ✅ แสดง preview จาก compressedFile
      const url = URL.createObjectURL(compressedFile);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });

      // ✅ แทนค่าไฟล์ใน input ด้วย compressedFile
      if (fileRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(compressedFile);
        fileRef.current.files = dataTransfer.files;
      }

      console.log("📦 Original:", (file.size / 1024).toFixed(1), "KB");
      console.log(
        "✅ Compressed:",
        (compressedFile.size / 1024).toFixed(1),
        "KB"
      );
    } catch (error) {
      console.error("❌ Error compressing image:", error);
      setMessage("❌ บีบอัดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // ---------- handle เบอร์โทร ----------
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setPhone(raw);

    // validate แบบ realtime เบา ๆ (ไม่บังคับให้เตือนถ้าช่องว่าง)
    if (!raw.trim()) {
      setPhoneError("");
      return;
    }
    const { ok } = validateThaiMobile(raw);
    setPhoneError(
      ok ? "" : "กรุณากรอกเบอร์มือถือ 10 หลัก (ขึ้นต้น 06/08/09) หรือ +66..."
    );
  };

  // ---------- handle submit ----------
  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage("");
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ ไม่พบ token กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    // ✅ ตรวจเบอร์ก่อนส่ง
    if (phone.trim()) {
      const { ok, digits } = validateThaiMobile(phone);
      if (!ok) {
        setPhoneError(
          "กรุณากรอกเบอร์มือถือ 10 หลัก (ขึ้นต้น 06/08/09) หรือ +66..."
        );
        setIsLoading(false);
        return;
      }
      // setPhone เป็นรูปแบบมาตรฐาน 0XXXXXXXXX เพื่อให้ UI sync ด้วย
      if (digits !== phone) setPhone(digits);
    }

    try {
      // ✅ 1. อัปโหลดรูปโปรไฟล์ถ้ามีเลือก
      if (fileRef.current?.files?.[0]) {
        const formData = new FormData();
        formData.append("profile_picture", fileRef.current.files[0]);

        const uploadRes = await axios.post(
          "/api/user/profile/edit-picture", // ✅ endpoint ของรูป
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );

        console.log("📸 รูปถูกอัปโหลดแล้ว:", uploadRes.data);

        // ✅ โหลดรูปใหม่หลังอัปโหลดเสร็จ
        const profileRes = await axios.get("/api/User/profile", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        if (profileRes.data?.profile_picture) {
          setPreview(`${profileRes.data.profile_picture}?t=${Date.now()}`);
        }

        if (profileRes.data?.profile_picture) {
          setPreview(profileRes.data.profile_picture);
        }
      }

      // ✅ 2. อัปเดตข้อมูลอื่น
      const payload: any = {};
      if (name.trim()) payload.name = name;
      if (phone.trim()) payload.phone = phone;
      if (gender) payload.gender = gender;
      if (birthday) payload.birthday = birthday;

      if (Object.keys(payload).length === 0 && !fileRef.current?.files?.[0]) {
        setMessage("⚠️ กรุณาแก้ไขอย่างน้อย 1 รายการ");
        setIsLoading(false);
        return;
      }

      const res = await axios.patch("/api/user/profile/edit", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log("✅ Profile updated:", res.data);

      setSuccessOpen(true);
      setTimeout(() => {
        setSuccessOpen(false);
        router.push("/customer/profile");
      }, 1500);
    } catch (err: any) {
      console.error("❌ Update error:", err);
      if (err.response?.status === 401)
        setMessage("⚠️ Token หมดอายุ กรุณาเข้าสู่ระบบใหม่");
      else if (err.response?.status === 404) setMessage("❌ ไม่พบบัญชีผู้ใช้");
      else setMessage("❌ แก้ไขข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen w-full bg-theme-customer flex items-center justify-center">
      <div
        className="relative overflow-y-auto"
        style={{
          width: 390,
          minHeight: 844,
          backgroundColor: "#C5D4E8",
          fontFamily: "'Mitr', sans-serif",
        }}
      >
        <div className="px-6 pt-6 pb-6 flex flex-col items-center">
          {/* Header */}
          <div className="w-full flex items-center">
            <BackButton href="/driver/profile" className="mr-2" />
            <h1
              className="px-[50px] py-[5px] text-[#191919] font-medium"
              style={{ fontSize: titleSize, lineHeight: 1.3 }}
            >
              แก้ไข
              <span
                className="block font-normal"
                style={{ fontSize: titleSmallSize }}
              >
                ข้อมูลผู้ใช้
              </span>
            </h1>
          </div>

          {/* Avatar */}
          <div className="px-6 mb-4 w-full mt-2">
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              className="w-40 h-40 mx-auto rounded-full flex items-center justify-center bg-white relative cursor-pointer shadow-sm"
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
                  >
                    <path
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 
                      1.79-4 4 1.79 4 4 4z"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 21v-1c0-2.21-3.582-4-8-4s-8 
                      1.79-8 4v1"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
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

          {/* Form */}
          <div style={{ width: 318 }}>
            {/* ชื่อผู้ใช้ */}
            <label className="block text-[#191919] mb-2">ชื่อผู้ใช้</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 bg-white pl-4 pr-4 rounded-[20px] border-2 border-[#D9D9D9] shadow-sm outline-none mb-4"
            />

            {/* อีเมล */}
            <label className="block text-[#191919] mb-2">อีเมล</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full h-12 bg-gray-100 pl-4 pr-4 rounded-[20px] border-2 border-[#D9D9D9] shadow-sm outline-none mb-4 text-gray-500"
            />

            {/* เบอร์โทร */}
            <label className="block text-[#191919] mb-2">เบอร์โทรศัพท์</label>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="เช่น 0812345678 หรือ +66812345678"
              value={phone}
              onChange={handlePhoneChange}
              className={`w-full h-12 bg-white pl-4 pr-4 rounded-[20px] border-2 shadow-sm outline-none mb-1 ${
                phoneError ? "border-red-400" : "border-[#D9D9D9]"
              }`}
            />
            {phoneError && (
              <p className="text-red-600 text-sm mb-3">{phoneError}</p>
            )}

            {/* เพศ */}
            <div className="mb-4">
              <label className="block text-[#191919] mb-2">เพศ</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`w-12 h-12 rounded-full border transition ${
                    gender === "male"
                      ? "bg-[#77C4E5] border-black"
                      : "bg-white border-[#D9D9D9]"
                  }`}
                >
                  ♂
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`w-12 h-12 rounded-full border transition ${
                    gender === "female"
                      ? "bg-[#FFA6E0] border-black"
                      : "bg-white border-[#D9D9D9]"
                  }`}
                >
                  ♀
                </button>
              </div>
            </div>

            {/* ปุ่มบันทึก */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="h-12 bg-[#E6A88A] hover:bg-[#B55C32] transition-colors 
                inline-flex items-center justify-center px-8"
                style={{
                  boxSizing: "border-box",
                  color: "#191919",
                  border: "2px solid #B55C32",
                  borderRadius: 25,
                  fontSize: "20px",
                }}
              >
                {isLoading ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>

            {message && (
              <p className="mt-3 text-center text-red-700 text-sm">{message}</p>
            )}

            {successOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div
                  role="alertdialog"
                  aria-live="assertive"
                  className="bg-white rounded-2xl shadow-lg w-[320px] p-6 text-center"
                  style={{ fontFamily: "'Mitr', sans-serif" }}
                >
                  <div className="mx-auto mb-3 flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
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
                    บันทึกโปรไฟล์สำเร็จ
                  </h2>
                  
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
