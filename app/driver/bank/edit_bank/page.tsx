"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";
import { useBankAccount } from "@/lib/useBankAccount";

/* ----------------- Types & Utils ----------------- */
type BankCode = "" | "kbank" | "scb" | "bbl";

// โลโก้/ชื่อ/สีของแต่ละธนาคาร (ไฟล์อยู่ใน /public)
const BANKS: Record<
  Exclude<BankCode, "">,
  { name: string; logo: string; bg: string; accent: string }
> = {
  kbank: {
    name: "กสิกรไทย",
    logo: "/kbank.png",
    bg: "#E9F7EF",
    accent: "#138F4E",
  },
  scb: {
    name: "ไทยพาณิชย์",
    logo: "/scb.jpg",
    bg: "#F3EEFC",
    accent: "#4E2A84",
  },
  bbl: { name: "กรุงเทพ", logo: "/bbl.jpg", bg: "#EEF4FF", accent: "#1E3A8A" },
};

// map code จาก BE → code ภายในฟรอนต์
const normalizeBankCode = (raw?: string): BankCode => {
  const v = String(raw || "")
    .trim()
    .toLowerCase();
  if (v === "kbank" || v === "004") return "kbank";
  if (v === "scb" || v === "014") return "scb";
  if (v === "bbl" || v === "002") return "bbl";
  return "";
};

// รูปแบบตำแหน่งขีดของเลขบัญชีตามธนาคาร
const ACCOUNT_GROUPS: Record<Exclude<BankCode, "">, number[]> = {
  kbank: [3, 1, 5, 1], // 090-2-64665-5
  bbl: [3, 1, 5, 1], // 088-0-08598-3
  scb: [3, 6, 1], // 406-790718-2
};

// เก็บเฉพาะเลข และบีบให้เหลือ 10 หลัก
const only10Digits = (s: string) =>
  String(s || "")
    .replace(/\D/g, "")
    .slice(0, 10);

// แปลง "เลขล้วน" -> "มีขีด" ตามธนาคาร
const formatAccount = (numDigits: string, bank: BankCode): string => {
  const digits = only10Digits(numDigits);
  const groups =
    bank && bank in ACCOUNT_GROUPS
      ? ACCOUNT_GROUPS[bank as Exclude<BankCode, "">]
      : [3, 1, 5, 1];
  let out: string[] = [];
  let idx = 0;
  for (const g of groups) {
    const part = digits.slice(idx, idx + g);
    if (!part) break;
    out.push(part);
    idx += g;
  }
  return out.join("-");
};

// mask โดยคงเครื่องหมายขีดไว้ (โชว์เฉพาะ 4 ตัวท้าย)
const maskWithHyphen = (formatted: string) => {
  const digits = formatted.replace(/\D/g, "");
  let toMask = Math.max(0, digits.length - 4);
  let res = "";
  for (const ch of formatted) {
    if (/\d/.test(ch)) res += toMask-- > 0 ? "•" : ch;
    else res += ch;
  }
  return res;
};

/* ----------------- Page ----------------- */
export default function EditBankPage() {
  const router = useRouter();

  const titleSize = 35;
  const titleSmallSize = 26;
  const baseSize = 16;
  const buttonSize = 24;

  // ดึงสถานะ/ข้อมูลปัจจุบัน
  const { loading: loadingBank, hasLinked, data } = useBankAccount();

  const [saving, setSaving] = useState(false);

  const [bankCode, setBankCode] = useState<BankCode>("");
  const [bankName, setBankName] = useState("");
  const [accountNumberRaw, setAccountNumberRaw] = useState(""); // เลขล้วน 10 หลัก
  const [accountNumberView, setAccountNumberView] = useState(""); // แสดงมีขีด
  const [accountName, setAccountName] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (!successOpen) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setSuccessOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [successOpen]);

  // ถ้ายังไม่เคยผูก → พาไปหน้า /driver/bank
  useEffect(() => {
    if (!loadingBank && !hasLinked) router.replace("/driver/bank");
  }, [loadingBank, hasLinked, router]);

  // พรีฟิลเมื่อ hook ส่งข้อมูลมา
  useEffect(() => {
    if (loadingBank || !data) return;
    const code = normalizeBankCode(
      (data as any).bank_code || (data as any).bankCode || (data as any).code
    );
    const name =
      (data as any).bank_name ||
      (code ? BANKS[code]?.name : "") ||
      (data as any).bankName ||
      "";

    const digits = only10Digits(
      (data as any).bank_account_number || (data as any).account_number || ""
    );
    setBankCode(code);
    setBankName(name);
    setAccountName(
      (data as any).bank_account_name || (data as any).account_name || ""
    );
    setAccountNumberRaw(digits);
    setAccountNumberView(formatAccount(digits, code));
  }, [loadingBank, data]);

  // เปลี่ยนธนาคาร → ปรับชื่อ/รูปแบบขีดทันที
  useEffect(() => {
    setAccountNumberView(formatAccount(accountNumberRaw, bankCode));
    if (bankCode) setBankName(BANKS[bankCode].name);
    else setBankName("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankCode]);

  const selectedBankLogo = useMemo(() => {
    if (!bankCode) return "/bank.svg";
    return BANKS[bankCode].logo;
  }, [bankCode]);

  const validateAccountNumber = (numDigits: string) =>
    /^\d{10}$/.test(only10Digits(numDigits));

  const onSave = async () => {
    setErrorMsg("");

    if (!bankCode || !bankName || !accountName.trim() || !accountNumberRaw) {
      setErrorMsg("⚠️ กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (!validateAccountNumber(accountNumberRaw)) {
      setErrorMsg("เลขบัญชีต้องเป็นตัวเลข 10 หลัก");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("⚠️ ไม่พบ token กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      // /driver/linkbank: ใช้สำหรับทั้งผูกครั้งแรกและอัปเดต
      await axios.post(
        "/api/driver/linkbank",
        {
          bank_account_name: accountName.trim(),
          bank_account_number: accountNumberRaw, // ส่งเลขล้วน
          bank_code: bankCode, // ส่ง code ภายใน
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

      // อัปเดต cache ฝั่ง client แบบเร็ว
      localStorage.setItem("has_linked_bank", "1");
      localStorage.setItem("bank_name", bankName.trim());
      localStorage.setItem("bank_code", bankCode);
      localStorage.setItem("bank_account_name", accountName.trim());
      localStorage.setItem("bank_account_number", accountNumberRaw);

      setSuccessOpen(true);
      setTimeout(() => {
        setSuccessOpen(false);
      }, 1500);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = String(
        err?.response?.data?.message || err?.response?.data?.detail || ""
      ).toLowerCase();

      if (status === 400) {
        if (
          msg.includes("10") ||
          msg.includes("length") ||
          msg.includes("digit")
        ) {
          setErrorMsg("เลขบัญชีต้องเป็นตัวเลข 10 หลัก");
        } else if (
          msg.includes("duplicate") ||
          msg.includes("exists") ||
          msg.includes("already")
        ) {
          setErrorMsg("เลขบัญชีนี้ถูกใช้งานแล้ว กรุณาใช้บัญชีอื่น");
        } else {
          setErrorMsg("❌ ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
        }
      } else if (status === 409) {
        setErrorMsg("เลขบัญชีนี้มีอยู่ในระบบแล้ว");
      } else if (status === 401) {
        setErrorMsg("⚠️ หมดสิทธิ์การเข้าถึง กรุณาเข้าสู่ระบบใหม่");
      } else if (status === 500) {
        setErrorMsg("⚠️ เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ภายหลัง");
      } else {
        setErrorMsg("❌ เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loadingBank) {
    return (
      <div className="min-h-screen w-full bg-[#C5D4E8] flex items-center justify-center">
        <div className="animate-pulse text-[#191919]">
          กำลังโหลดข้อมูลบัญชี…
        </div>
      </div>
    );
  }

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
                ข้อมูลบัญชีธนาคาร
              </span>
            </h1>
          </div>

          {/* การ์ดสรุป */}
          <div className="flex justify-center">
            <div
              className="w-[366px] rounded-[20px] shadow-md p-4 mt-8"
              style={{
                backgroundColor: bankCode ? BANKS[bankCode].bg : "#ffffff",
              }}
            >
              <div className="flex items-center">
                <img
                  src={selectedBankLogo}
                  alt="banklogo"
                  className="h-15 w-15 mr-6 object-contain"
                />
                <div className="flex flex-col">
                  <p
                    className="text-[20px] mb-1"
                    style={{
                      color: bankCode ? BANKS[bankCode].accent : "#191919",
                    }}
                  >
                    {bankName || "ยังไม่ได้เลือกธนาคาร"}
                  </p>
                  <p className="text-[18px] text-[#555]">
                    {accountNumberView
                      ? maskWithHyphen(accountNumberView)
                      : "— — — — — — — — — —"}
                  </p>
                  <p className="text-[18px] text-[#555]">
                    {accountName || "ชื่อบัญชี —"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ฟอร์ม */}
          <div className="flex-1 flex items-start justify-center">
            <div style={{ width: 318 }} className="mt-5">
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
                  onChange={(e) => setBankCode(e.target.value as BankCode)}
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

              {/* เลขบัญชี (มีขีดอัตโนมัติ) */}
              <label
                className="block text-[#191919] mb-2"
                style={{ fontSize: baseSize }}
              >
                เลขบัญชี
              </label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full h-12 mb-4 bg-white shadow-sm pl-4 pr-4 outline-none"
                style={{
                  border: "2px solid #D9D9D9",
                  borderRadius: 20,
                  fontSize: baseSize,
                  boxSizing: "border-box",
                }}
                placeholder={
                  bankCode === "scb"
                    ? "ตัวอย่าง 406-790718-2"
                    : "ตัวอย่าง 090-2-64665-5"
                }
                value={accountNumberView}
                onChange={(e) => {
                  const raw = only10Digits(e.target.value);
                  setAccountNumberRaw(raw);
                  setAccountNumberView(formatAccount(raw, bankCode));
                  if (errorMsg) setErrorMsg("");
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData("text");
                  const raw = only10Digits(text);
                  setAccountNumberRaw(raw);
                  setAccountNumberView(formatAccount(raw, bankCode));
                }}
              />

              {/* ชื่อบัญชี */}
              <label
                className="block text-[#191919] mb-2"
                style={{ fontSize: baseSize }}
              >
                ชื่อบัญชี (ชื่อ-นามสกุล)
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
                placeholder="กรอกชื่อบัญชี"
                value={accountName}
                onChange={(e) => {
                  setAccountName(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
              />
            </div>
          </div>

          {/* แจ้งเตือนเหนือปุ่ม */}
          <div className="flex flex-col items-center mt-4 min-h-[24px]">
            {errorMsg && (
              <p
                className="text-red-600 text-sm text-center"
                style={{ fontSize: baseSize }}
              >
                {errorMsg}
              </p>
            )}
          </div>

          {/* ปุ่มบันทึก */}
          <div className="flex flex-col items-center">
            <button
              onClick={onSave}
              disabled={saving || loadingBank}
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
              {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
          </div>

          {successOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div
                role="alertdialog"
                aria-live="assertive"
                className="bg-white rounded-2xl shadow-lg w-[320px] p-6 text-center"
                style={{ fontFamily: "'Mitr', sans-serif" }}
                onClick={(e) => e.stopPropagation()}
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

                <h2 className="font-medium text-[#191919] text-[26px]">
                  บันทึกข้อมูลบัญชีสำเร็จ
                </h2>
                <p className="text-[#4b5563] mt-4 text-[16px]">
                  อัปเดตบัญชีของคุณเรียบร้อยแล้ว
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
