"use client";

import { useEffect, useState } from "react";
import { BackButton } from "@/app/components/share_component";
import axios from "axios";

export default function EditBankPage() {
  const titleSize = 30;
  const baseSize = 16;
  const buttonSize = 24;

  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // โหลดข้อมูลเดิมจากโปรไฟล์ (หรือจะมี GET เฉพาะ bank ก็ได้)
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("no token");
        const res = await axios.get("/api/User/profile", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        // ปรับ mapping ตามฟิลด์จริงของคุณ
        setAccountName(res.data?.bank_account_name || "");
        setAccountNumber(String(res.data?.bank_account_number || ""));
        setBankName(res.data?.bank_name || "");
        setBankCode(res.data?.bank_code || "");
      } catch (e) {
        setErrorMsg("ไม่สามารถโหลดข้อมูลบัญชีธนาคารได้");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const validate = () => {
    if (!accountName || !accountNumber || !bankName) {
      setErrorMsg("กรุณากรอกข้อมูลให้ครบ");
      return false;
    }
    if (!/^\d{10}$/.test(accountNumber)) {
      setErrorMsg("เลขบัญชีต้องเป็นตัวเลข 10 หลัก");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const save = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      setSuccessMsg("");
      const token = localStorage.getItem("token");
      if (!token) throw new Error("no token");

      await axios.post(
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

      setSuccessMsg("✅ บันทึกบัญชีธนาคารเรียบร้อย");
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = String(err?.response?.data?.message || "").toLowerCase();
      if (
        status === 400 &&
        (msg.includes("duplicate") || msg.includes("exists"))
      ) {
        setErrorMsg("เลขบัญชีนี้ถูกใช้งานแล้ว กรุณาใช้บัญชีอื่น");
      } else if (
        status === 400 &&
        (msg.includes("digit") || msg.includes("length"))
      ) {
        setErrorMsg("เลขบัญชีต้องเป็นตัวเลข 10 หลัก");
      } else {
        setErrorMsg("บันทึกไม่สำเร็จ กรุณาลองใหม่");
      }
    } finally {
      setSaving(false);
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
          fontFamily: "'Mitr', sans-serif",
        }}
      >
        <div className="px-6 pt-6 pb-6 flex flex-col relative z-10 h-full">
          {/* Header */}
          <div className="w-full flex items-center mb-4">
            <BackButton href="/driver/profile" className="mr-2" />
            <h1
              className="px-[55px] py-[10px] text-[#191919] font-medium"
              style={{ fontSize: titleSize }}
            >
              แก้ไขบัญชีธนาคาร
            </h1>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-[#191919]">
              กำลังโหลด...
            </div>
          ) : (
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
                  className="w-full h-12 mb-4 bg-white shadow-sm pl-4 pr-4 outline-none"
                  style={{
                    border: "2px solid #D9D9D9",
                    borderRadius: 20,
                    fontSize: baseSize,
                  }}
                  value={accountNumber}
                  onChange={(e) =>
                    setAccountNumber(
                      e.target.value.replace(/[^\d]/g, "").slice(0, 10)
                    )
                  }
                  placeholder="กรอกเลขบัญชี 10 หลัก"
                />

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
                  }}
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />

                {/* ข้อความแจ้งเตือน */}
                <div className="mt-3 min-h-[24px]">
                  {errorMsg && (
                    <p className="text-red-600 text-sm">{errorMsg}</p>
                  )}
                  {!errorMsg && successMsg && (
                    <p className="text-green-600 text-sm">{successMsg}</p>
                  )}
                </div>

                {/* ปุ่มบันทึก */}
                <div className="flex justify-center mt-3">
                  <button
                    disabled={saving}
                    onClick={save}
                    className="w-fit h-12 bg-[#E6A88A] hover:bg-[#B55C32] transition-colors px-5 inline-flex items-center justify-center disabled:opacity-60"
                    style={{
                      color: "#191919",
                      border: "2px solid #B55C32",
                      borderRadius: 25,
                      fontSize: buttonSize,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
