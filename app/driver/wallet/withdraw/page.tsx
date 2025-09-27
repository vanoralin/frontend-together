"use client";
import { BackButton } from "@/app/components/share_component";
import React from "react";
import Link from "next/link";

/** Helper: ทำความสะอาดอินพุตให้รองรับทศนิยม */
function sanitizeDecimal(input: string) {
  let s = input.replace(/,/g, ".");
  s = s.replace(/[^\d.]/g, "");

  const parts = s.split(".");
  if (parts.length > 2) {
    s = parts[0] + "." + parts.slice(1).join("");
  }

  if (s.startsWith(".")) s = "0" + s;

  return s;
}

function Background() {
  const currentBalance = 200; // TODO: bind real data
  const [amountInput, setAmountInput] = React.useState<string>("");
  const [selected, setSelected] = React.useState<number | null>(null);

  const amounts: number[] = [20, 50, 100, 200];


  const parsedAmount = amountInput === "" || amountInput === "." ? 0 : Number(amountInput);
  const safeAmount = isNaN(parsedAmount) ? 0 : parsedAmount;
  const afterWithdraw = Math.max(0, currentBalance - safeAmount);

  const handleClickAmount = (amount: number) => {
    if (amount > currentBalance) return;
    if (selected === amount) {
      setSelected(null);
      setAmountInput("");
    } else {
      setSelected(amount);
      setAmountInput(String(amount));
    }
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = sanitizeDecimal(e.target.value);
    const num = cleaned === "" || cleaned === "." ? 0 : Number(cleaned);

    if (!isNaN(num) && num > currentBalance) {
      return; // ไม่อัปเดตค่า ถ้าเกินยอดคงเหลือ
    }

    setAmountInput(cleaned);

    if (cleaned && !cleaned.includes(".")) {
      const n = Number(cleaned);
      setSelected(amounts.includes(n) ? n : null);
    } else {
      setSelected(null);
    }
  };

  const exceedsBalance = safeAmount > currentBalance;
  const isZeroOrInvalid = safeAmount <= 0 || isNaN(safeAmount);
  const canProceed = !exceedsBalance && !isZeroOrInvalid;

  return (
    <div className="relative min-h-screen w-full bg-[#C5D4E8] flex flex-col items-center pb-[120px]">
      <Header_withdraw />

      <div className="w-full max-w-[640px] px-5">
        <div className="grid grid-cols-2 gap-6 mt-5">
          <div className="flex flex-col">
            <p className="text-xl text-left">ยอดเงินปัจจุบัน</p>
            <p className="text-xl font-semibold text-left">฿{currentBalance.toFixed(2)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-xl text-left">ยอดเงินหลังถอน</p>
            <p className="text-xl font-semibold text-left">฿{afterWithdraw.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex flex-col mt-8">
          <p className="text-xl text-left">จำนวนเงินที่ต้องการถอน</p>
          <input
            type="text"
            inputMode="decimal"
            pattern="^[0-9]+([.][0-9]*)?$"
            value={amountInput}
            onChange={handleChangeInput}
            className={`w-full rounded-[30px] bg-white mt-2 pl-5 py-2 border focus:outline-none focus:ring-0
                        ${exceedsBalance ? "border-red-500" : "border-gray-300"}`}
            placeholder={`กรอกจำนวนเงิน (สูงสุด ฿${currentBalance})`}
            aria-invalid={exceedsBalance}
            aria-describedby="amountHelp"
          />
          <div id="amountHelp" className="mt-1 text-sm">
            {exceedsBalance ? (
              <span className="text-red-600">จำนวนเงินเกินยอดคงเหลือใส่ไม่ได้</span>
            ) : (
              <span className="text-gray-600">สูงสุดถอนได้ ฿{currentBalance}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          {amounts.map((amount) => {
            const isSelected = selected === amount;
            const disabled = amount > currentBalance;
            return (
              <button
                key={amount}
                type="button"
                aria-pressed={isSelected}
                disabled={disabled}
                onClick={() => handleClickAmount(amount)}
                className={`w-full h-[51px] rounded-[30px] border transition shadow-md
                  ${disabled ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white text-black hover:opacity-95 active:scale-[0.98]"}
                  ${isSelected ? "!bg-[#E6A88A] border-[#B55C32] text-black" : "border-transparent"}
                  focus:outline-none focus:ring-0`}
                aria-label={`เลือกถอน ฿${amount}${disabled ? " (เกินยอดคงเหลือ)" : ""}`}
              >
                <span className="text-xl">฿{amount}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Goto_payment currentBalance={currentBalance} amountInput={amountInput} />
    </div>
  );
}

function Header_withdraw() {
  return (
    <div className="flex flex-col items-center">
      <BackButton />
      <p className="text-[32px] font-bold text-shadow-lg mt-10.5">ถอนเงิน</p>
    </div>
  );
}

function Goto_payment({
  currentBalance,
  amountInput,
}: {
  currentBalance: number;
  amountInput: string;
}) {
  const parsedAmount = amountInput === "" || amountInput === "." ? 0 : Number(amountInput);
  const safeAmount = isNaN(parsedAmount) ? 0 : parsedAmount;
  const exceedsBalance = safeAmount > currentBalance;
  const isZeroOrInvalid = safeAmount <= 0 || isNaN(safeAmount);
  const canProceed = !exceedsBalance && !isZeroOrInvalid;

  return (
    <div className="absolute w-full bottom-0">
      <div className="h-[120px] w-full bg-white rounded-t-2xl shadow-md flex flex-col items-center justify-center">
        <div className="h-5 mb-2" aria-live="polite">
          {!canProceed && (
            <p className="text-center text-sm text-gray-600">
              กรอกจำนวนเงินให้ถูกต้องเพื่อดำเนินการต่อ
            </p>
          )}
        </div>
        <Link
          href={canProceed ? "/driver/wallet/withdraw/comfirm" : "#"}
          aria-disabled={!canProceed}
          className={canProceed ? "" : "pointer-events-none"}
        >
          <div
            className={`relative h-15 w-80 bg-[#E6A88A] border-[#B55C32] border-2 rounded-[30px] shadow-md flex justify-center items-center
                       ${canProceed ? "opacity-100" : "opacity-60"}`}
            role="button"
            aria-label="ยืนยันถอนเงิน"
            onClick={() => {localStorage.setItem("withdrawAmount", String(safeAmount));}}
          >
            <p className="text-center text-2xl font-medium">ถอนเงิน</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Background;
export { Header_withdraw, Goto_payment };