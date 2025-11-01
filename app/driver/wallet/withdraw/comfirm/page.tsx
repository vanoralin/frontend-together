"use client";

import React from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { BackButton } from "@/app/components/share_component";

/* ============== Types ============== */
type WithdrawResponse = {
  message?: string;
  transaction_id?: number | string;
};

interface BankAccountData {
  bank_account_name: string;
  bank_account_number: string;
  bank_code?: string;
  bank_name: string;
}

/* ============== API Caller ============== */
async function postWithdraw(amount: number) {
  const res = await axios.post<WithdrawResponse>(
    "/api/withdraw",
    { amount: Math.round(amount) },
    {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.data;
}

/* ============== Components ============== */
export default function ConfirmWithdrawPage() {
  const router = useRouter();
  const nextHref = "/driver/wallet";

  const [amountDisplay, setAmountDisplay] = React.useState<string>("0.00");
  const [bankInfo, setBankInfo] = React.useState<BankAccountData | null>(null);
  const [loadingBank, setLoadingBank] = React.useState<boolean>(true);

  React.useEffect(() => {
    const s = localStorage.getItem("withdrawAmount") || "0";
    const n = Number(s);
    setAmountDisplay(isNaN(n) ? "0.00" : n.toFixed(2));
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingBank(true);
        const res = await axios.get<BankAccountData>("/api/driver/bank-account", {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
        if (!mounted) return;
        setBankInfo(res.data ?? null);
      } catch {
        if (!mounted) return;
        setBankInfo(null);
      } finally {
        if (mounted) setLoadingBank(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
<div className="relative min-h-screen w-full flex flex-col items-center bg-gradient-to-b from-[#C5D4E8] to-[#EAF0F8] pb-[140px]">
  <HeaderWithdraw />

  <main className="w-full max-w-[640px] px-5 mt-6">
    <section className="space-y-6">
      <DisplayAmount amount={amountDisplay} />

      {/* Card: Bank destination */}
      <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.05)] px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* bank icon */}
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3 10.5 12 4l9 6.5V12H3v-1.5Zm0 3.5h18v6H3v-6Zm2 1.5v3h3v-3H5Zm5 0v3h4v-3h-4Zm6 0v3h3v-3h-3Z" />
            </svg>
            <p className="text-base font-semibold tracking-wide">เข้าบัญชีธนาคาร</p>
          </div>

        </div>

        {loadingBank ? (
          // Skeleton loading
          <div className="animate-pulse space-y-3">
          </div>
        ) : bankInfo ? (
          <div className="mt-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base text-slate-500">ธนาคาร</span>
              <div className="text-base tracking-wide">
                {bankInfo.bank_name}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">ชื่อบัญชี</span>
              <span className="text-base tracking-wide">
                {bankInfo.bank_account_name}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">เลขที่บัญชี</span>
              <span className="text-base tracking-wider">
                {bankInfo.bank_account_number}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-base text-red-500">ไม่พบบัญชีธนาคาร</p>
        )}
      </div>
    </section>
  </main>

  <GotoPayment nextHref={nextHref} />
</div>

  );
}

export function HeaderWithdraw() {
  return (
    <div className="flex flex-col items-center">
      <BackButton />
      <p className="text-[32px] font-bold text-shadow-lg mt-10.5">ยืนยันการถอน</p>
    </div>
  );
}

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

export function GotoPayment({ nextHref }: { nextHref: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    if (loading) return;

    const amountStr = localStorage.getItem("withdrawAmount") || "0";
    const amount = Number(amountStr);
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("จำนวนเงินไม่ถูกต้อง");
      return;
    }

    try {
      setLoading(true);
      await postWithdraw(amount);
      localStorage.removeItem("withdrawAmount");
      router.replace(nextHref);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "เกิดข้อผิดพลาดในการถอนเงิน";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute w-full bottom-0">
      <div className="h-[120px] w-full bg-white rounded-t-2xl shadow-md flex flex-col items-center justify-center">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className={`relative h-[56px] w-80 bg-[#E6A88A] border-[#B55C32] border-2 rounded-[30px] shadow-md flex justify-center items-center mt-7 ${
            loading ? "opacity-60 pointer-events-none" : "opacity-100"
          }`}
          aria-label="ยืนยันถอนเงิน"
          type="button"
        >
          <p className="text-center text-2xl font-medium">
            {loading ? "กำลังดำเนินการ..." : "ยืนยัน"}
          </p>
        </button>
      </div>
    </div>
  );
}
