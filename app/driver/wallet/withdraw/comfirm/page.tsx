"use client";
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BackButton } from "@/app/components/share_component";

// Helper ฟังก์ชัน
function formatAmount(n: number) {
  if (!isFinite(n)) return "0.00";
  return n.toFixed(2);
}
function maskAccount(acc?: string) {
  if (!acc) return "******1234";
  if (acc.length <= 4) return "******" + acc;
  return "******" + acc.slice(-4);
}

/* -------------------- Component หลัก -------------------- */
export default function ConfirmWithdrawPage() {
  const search = useSearchParams();

  const rawAmount = search.get("amount");
  const account = search.get("account") ?? "0123456789";
  const nextHref = "/driver/wallet"; // ไปหน้าต่อไป

  const amountNum = rawAmount ? Number(rawAmount) : NaN;
  const isValid = !isNaN(amountNum) && amountNum > 0;
  const amountDisplay = localStorage.getItem("withdrawAmount") || "0.00";
  return (
    <div className="relative bg-[#C5D4E8] min-h-screen w-full flex flex-col items-center pb-[140px]">
      <HeaderWithdraw />

      <main className="w-full max-w-[640px] px-5 mt-6">
        <section className="space-y-6">
          <DisplayAmount amount={amountDisplay} />

          <div className="flex items-center justify-between">
            <p className="text-base">เข้าบัญชีหมายเลข</p>
            <p className="text-base font-medium tracking-wider">
              {maskAccount(account)}
            </p>
          </div>
        </section>
      </main>

      <GotoPayment nextHref={nextHref} />
    </div>
  );
}

/* -------------------- Header -------------------- */
export function HeaderWithdraw() {
  return (
    <div className="flex flex-col items-center">
      <BackButton />
      <p className="text-[32px] font-bold text-shadow-lg mt-8">ถอนเงิน</p>
    </div>
  );
}

/* -------------------- DisplayAmount -------------------- */
export function DisplayAmount({ amount }: { amount: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-base">ถอนเงิน</label>
      <div className="relative w-full rounded-[20px] bg-white px-4 py-3 text-[#E6A88A] text-xl font-semibold shadow-sm border border-transparent">
        ฿{amount}
      </div>
    </div>
  );
}

/* -------------------- GotoPayment -------------------- */
export function GotoPayment({ nextHref }: { nextHref: string }) {
  return (
    <div className="absolute w-full bottom-0">
      <div className="h-[120px] w-full bg-white rounded-t-2xl shadow-md flex flex-col items-center justify-center">
        <Link href={nextHref}>
          <div
            className="relative h-[56px] w-80 bg-[#E6A88A] border-[#B55C32] border-2 rounded-[30px] shadow-md flex justify-center items-center opacity-100  mt-7"
            role="button"
            aria-label="ยืนยันถอนเงิน"
            onClick={() => {
              localStorage.setItem("withdrawAmount", "0");
            }}
          >
            <p className="text-center text-2xl font-medium">ยืนยัน</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

