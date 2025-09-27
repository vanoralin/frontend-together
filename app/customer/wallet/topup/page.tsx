// ยังไม่เสร็จ
"use client";
import { BackButton } from "@/app/components/share_component";
import React from "react";
import Link from "next/link";

/** Helper: ทำความสะอาดอินพุตให้รองรับทศนิยม
 * - แทน , เป็น .
 * - เก็บไว้เฉพาะตัวเลขและจุด
 * - อนุญาตให้มีจุดได้แค่ 1 จุด
 * - ถ้าขึ้นต้นด้วย . ให้เติม 0 นำหน้า (".5" -> "0.5")
 * - (ตัวเลือก) หากอยากบังคับทศนิยมไม่เกิน 2 หลัก ให้ปลดคอมเมนต์ส่วนท้าย
 */
function sanitizeDecimal(input: string) {
  let s = input.replace(/,/g, ".");      // รองรับผู้ใช้ที่พิมพ์คอมมา
  s = s.replace(/[^\d.]/g, "");          // เก็บเฉพาะตัวเลขกับจุด

  const parts = s.split(".");
  if (parts.length > 2) {
    // รวมจุดให้เหลือแค่จุดแรก
    s = parts[0] + "." + parts.slice(1).join("");
  }

  if (s.startsWith(".")) s = "0" + s;    // ".5" -> "0.5"

  // // จำกัดทศนิยมไม่เกิน 2 หลัก (ถ้าต้องการ ให้ปลดคอมเมนต์)
  // const [intPart, decPart = ""] = s.split(".");
  // if (decPart.length > 2) s = intPart + "." + decPart.slice(0, 2);

  return s;
}

function Background() {
  const [amountInput, setAmountInput] = React.useState<string>("");

  return (
    <div className="relative min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center pb-[120px]">
      <Header_topup />
      <Detail amountInput={amountInput} setAmountInput={setAmountInput} />
      <Goto_payment amountInput={amountInput} />
    </div>
  );
}

function Header_topup() {
  return (
    <div className="flex flex-col items-center">
      <BackButton />
      <p className="text-[32px] font-bold text-shadow-lg mt-8">เติมเงิน</p>
    </div>
  );
}

function Detail({
  amountInput,
  setAmountInput,
}: {
  amountInput: string;
  setAmountInput: React.Dispatch<React.SetStateAction<string>>;
}) {
  const currentBalance = 20;

  const [selected, setSelected] = React.useState<number | null>(null);
  const amounts: number[] = [20, 50, 100, 200];

  // ถ้าเป็นค่าว่าง หรือเป็น "." ให้ตีเป็น 0 ชั่วคราวเพื่อคำนวณ
  const parsedAmount = amountInput === "" || amountInput === "." ? 0 : Number(amountInput);
  const safeAmount = isNaN(parsedAmount) ? 0 : parsedAmount;
  const afterTopup = currentBalance + safeAmount;

  const handleClickAmount = (amount: number) => {
    if (selected === amount) {
      // toggle: ถ้ากดซ้ำให้กลับเป็นค่าเริ่มต้น
      setSelected(null);
      setAmountInput("");
    } else {
      setSelected(amount);
      setAmountInput(String(amount));
    }
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = sanitizeDecimal(e.target.value);
    setAmountInput(cleaned);

    // เลือกปุ่มอัตโนมัติเมื่อค่าตรงกับตัวเลือกแบบจำนวนเต็มเท่านั้น
    if (cleaned && !cleaned.includes(".")) {
      const n = Number(cleaned);
      setSelected(amounts.includes(n) ? n : null);
    } else {
      setSelected(null);
    }
  };

  return (
    <div className="w-full max-w-[640px] px-5">
      {/* ยอดเงิน */}
      <div className="grid grid-cols-2 gap-6 mt-5">
        <div className="flex flex-col">
          <p className="text-xl text-left">ยอดเงินปัจจุบัน</p>
          <p className="text-xl font-semibold text-left">฿{currentBalance.toFixed(2)}</p>
        </div>
        <div className="flex flex-col">
          <p className="text-xl text-left">ยอดเงินหลังเติม</p>
          <p className="text-xl font-semibold text-left">฿{afterTopup.toFixed(2)}</p>
        </div>
      </div>

      {/* ช่องกรอกจำนวนเงิน */}
      <div className="flex flex-col mt-8">
        <p className="text-xl text-left">จำนวนเงินที่ต้องการเติม</p>
        <input
          type="text"
          inputMode="decimal"
          // หมายเหตุ: pattern ใช้ตอน validate ตอน submit ไม่ได้บล็อกตอนพิมพ์
          pattern="^[0-9]+([.][0-9]*)?$"
          value={amountInput}
          onChange={handleChangeInput}
          className="w-full rounded-[30px] bg-white mt-2 pl-5 py-2 border border-gray-300
                     focus:outline-none focus:ring-0"
          placeholder="กรอกจำนวนเงิน"
        />
      </div>

      {/* ปุ่มเลือกจำนวน */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        {amounts.map((amount) => {
          const isSelected = selected === amount;
          return (
            <button
              key={amount}
              type="button"
              aria-pressed={isSelected}
              onClick={() => handleClickAmount(amount)}
              className={`w-full h-[51px] rounded-[30px] border transition
                ${isSelected ? "bg-[#E6A88A] border-[#B55C32] text-black"
                             : "bg-white border-transparent text-black"}
                hover:opacity-95 active:scale-[0.98] focus:outline-none focus:ring-0 cursor-pointer shadow-md`}
            >
              <span className="text-xl">฿{amount}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Goto_payment({
  amountInput,
}: {
  amountInput: string;
}) {
  // อนุญาตเฉพาะจำนวนเงิน > 0 เท่านั้น
  const parsed = amountInput === "" || amountInput === "." ? 0 : Number(amountInput);
  const canProceed = !isNaN(parsed) && parsed > 0;

  return (
    <div className="absolute w-full bottom-0">
      <div className="h-[120px] w-full bg-white rounded-t-2xl shadow-md flex flex-col items-center justify-center">
        {/* กันที่ข้อความเตือนคงที่ ไม่ให้ปุ่มขยับ */}
        <div className="h-5 mb-2" aria-live="polite">
          {!canProceed && (
            <p className="text-center text-sm text-gray-600 leading-5">
              กรุณากรอกจำนวนเงินให้ถูกต้องเพื่อดำเนินการต่อ
            </p>
          )}
        </div>

        <Link
          href={canProceed ? "/customer/wallet/topup/qr" : "#"}
          aria-disabled={!canProceed}
          className={canProceed ? "" : "pointer-events-none"}
        >
          <div
            className={`relative h-[60px] w-80 bg-[#E6A88A] border-[#B55C32] border-2 rounded-[30px] shadow-md flex justify-center items-center
                       ${canProceed ? "opacity-100" : "opacity-60"}`}
            role="button"
            aria-label="ยืนยันเติมเงิน"
          >
            <p className="text-center text-2xl font-medium">เติมเงิน</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Background;
export { Header_topup, Detail, Goto_payment };
