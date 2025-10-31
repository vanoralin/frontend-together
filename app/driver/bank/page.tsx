"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { BackButton } from "@/app/components/share_component";
import axios from "axios";

export default function RegisterPage() {
  const titleSize = 30;
  const buttonSize = 24;
  const baseSize = 16;

  const [preview, setPreview] = useState<string | null>(null);
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // ⬅️ ข้อความ error (สีแดง, เหนือปุ่ม)
  const [successMsg, setSuccessMsg] = useState(""); // ⬅️ ข้อความสำเร็จ (สีเขียว)
  const [accountNumberError, setAccountNumberError] = useState("");

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

  // ------- ตรวจรูปแบบเลขบัญชี (10 หลัก ตัวเลขเท่านั้น) -------
  const validateAccountNumber = (num: string) => {
    if (!/^\d{10}$/.test(num)) {
      setAccountNumberError("เลขบัญชีไม่ถูกต้อง กรุณากรอกให้ครบ 10 หลัก");
      return false;
    }
    setAccountNumberError("");
    return true;
  };

  // ------- ส่งข้อมูลไป backend -------
  const handleSubmit = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    // ตรวจ input เบื้องต้น
    if (!bankName || !bankCode || !accountNumber || !accountName) {
      setErrorMsg("⚠️ กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (!validateAccountNumber(accountNumber)) {
      setErrorMsg("เลขบัญชีไม่ถูกต้อง กรุณากรอกให้ครบ 10 หลัก");
      return;
    }

    try {
      setIsLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("⚠️ ไม่พบ token กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      const res = await axios.post(
        "/api/driver/linkbank",
        {
          bank_account_name: accountName.trim(),
          bank_account_number: accountNumber.trim(),
          bank_code: bankCode || null,
          bank_name: bankName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      setSuccessMsg("✅ ผูกบัญชีธนาคารสำเร็จ!");
      console.log("response:", res.data);
      // setTimeout(() => { window.location.href = "/driver/profile"; }, 1200);
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const msg = String(data?.message || data?.detail || "").toLowerCase();

      if (status === 400) {
        if (
          msg.includes("10") ||
          msg.includes("length") ||
          msg.includes("digit")
        ) {
          setAccountNumberError("เลขบัญชีไม่ถูกต้อง กรุณากรอกให้ครบ 10 หลัก");
          setErrorMsg("เลขบัญชีไม่ถูกต้อง กรุณากรอกให้ครบ 10 หลัก");
        } else if (
          msg.includes("duplicate") ||
          msg.includes("exists") ||
          msg.includes("already")
        ) {
          setAccountNumberError("เลขบัญชีนี้ถูกใช้งานแล้ว กรุณาใช้บัญชีอื่น");
          setErrorMsg("เลขบัญชีนี้ถูกใช้งานแล้ว กรุณาใช้บัญชีอื่น");
        } else {
          setErrorMsg("❌ ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
        }
      } else if (status === 409) {
        setAccountNumberError("เลขบัญชีนี้มีอยู่ในระบบแล้ว");
        setErrorMsg("เลขบัญชีนี้มีอยู่ในระบบแล้ว");
      } else if (status === 401) {
        setErrorMsg("⚠️ หมดสิทธิ์การเข้าถึง กรุณาเข้าสู่ระบบใหม่");
      } else if (status === 500) {
        setErrorMsg("⚠️ เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ภายหลัง");
      } else {
        setErrorMsg("❌ เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
      }

      console.error("linkbank error:", { status, data });
    } finally {
      setIsLoading(false);
    }
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
        <div className="px-6 pt-6 pb-6 flex flex-col relative z-10 h-full">
          {/* Header */}
          <div className="w-full flex items-center mb-4">
            <BackButton href="/driver/register" className="mr-2" />
            <h1
              className="px-[55px] py-[20px] text-[#191919] font-medium"
              style={{ fontSize: titleSize, lineHeight: 1.3 }}
            >
              ผูกบัญชีธนาคาร
            </h1>
          </div>

          {/* Hidden input สำหรับอัปโหลด (ถ้าจะใช้แนบรูปสมุดบัญชี) */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Form */}
          <div className="flex-1 flex items-center justify-center">
            <div style={{ width: 318 }}>
              {/* ธนาคาร */}
              <label
                className="block text-[#191919] mb-2"
                style={{ fontSize: baseSize }}
              >
                ธนาคาร
              </label>
              <div className="relative mb-4">
                <select
                  className="w-full h-12 bg-white shadow-sm pl-4 pr-10 outline-none appearance-none"
                  style={{
                    border: "2px solid #D9D9D9",
                    borderRadius: 20,
                    fontSize: baseSize,
                    boxSizing: "border-box",
                  }}
                  value={bankCode}
                  onChange={(e) => {
                    const v = e.target.value;
                    setBankCode(v);
                    if (v === "kbank") setBankName("กสิกรไทย");
                    if (v === "scb") setBankName("ไทยพาณิชย์");
                    if (v === "bbl") setBankName("กรุงเทพ");
                    if (v === "") setBankName("");
                  }}
                >
                  <option value="">เลือกธนาคาร</option>
                  <option value="kbank">กสิกรไทย</option>
                  <option value="scb">ไทยพาณิชย์</option>
                  <option value="bbl">กรุงเทพ</option>
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

              {/* เลขบัญชี */}
              <label
                className="block text-[#191919] mb-2"
                style={{ fontSize: baseSize }}
              >
                เลขบัญชี
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                className={`w-full h-12 ${
                  accountNumberError ? "mb-1" : "mb-4"
                } bg-white shadow-sm pl-4 pr-4 outline-none`}
                style={{
                  border: "2px solid #D9D9D9",
                  borderRadius: 20,
                  fontSize: baseSize,
                  boxSizing: "border-box",
                }}
                placeholder="กรอกเลขบัญชี 10 หลัก"
                value={accountNumber}
                onChange={(e) => {
                  const onlyDigits = e.target.value
                    .replace(/[^\d]/g, "")
                    .slice(0, 10);
                  setAccountNumber(onlyDigits);
                  if (accountNumberError) setAccountNumberError("");
                  if (errorMsg) setErrorMsg("");
                }}
                onBlur={() => validateAccountNumber(accountNumber)}
              />
              {accountNumberError && (
                <p className="text-red-600 text-sm mb-3">
                  {accountNumberError}
                </p>
              )}

              {/* ชื่อบัญชี */}
              <label
                className="block text-[#191919] mb-2"
                style={{ fontSize: baseSize }}
              >
                ชื่อ-นามสกุล
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
                placeholder="กรอกชื่อ-นามสกุล"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
          </div>

          {/* ✅ โซนข้อความแจ้งเตือน (อยู่เหนือปุ่ม) */}
          <div className="flex flex-col items-center mt-2 min-h-[24px]">
            {errorMsg && (
              <p
                className="text-red-600 text-sm text-center"
                style={{ fontSize: baseSize }}
              >
                {errorMsg}
              </p>
            )}
            {!errorMsg && successMsg && (
              <p
                className="text-green-600 text-sm text-center"
                style={{ fontSize: baseSize }}
              >
                {successMsg}
              </p>
            )}
          </div>

          {/* ปุ่มด้านล่าง */}
          <div className="flex flex-col items-center">
            <img src="/bank.svg" alt="bank logo" className="w-86 h-86 mb-2" />

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-fit h-12 bg-[#E6A88A] hover:bg-[#B55C32] transition-colors px-5 inline-flex items-center justify-center disabled:opacity-60"
              style={{
                boxSizing: "border-box",
                color: "#191919",
                border: "2px solid #B55C32",
                borderRadius: 25,
                fontSize: buttonSize,
                whiteSpace: "nowrap",
              }}
            >
              {isLoading ? "กำลังผูกบัญชี..." : "ผูกบัญชีธนาคาร"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
