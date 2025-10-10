"use client";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { BackButton } from "@/app/components/share_component";

/* ---------- Helpers ---------- */
function maskAccount(acc?: string) {
  if (!acc) return "******1234";
  if (acc.length <= 4) return "******" + acc;
  return "******" + acc.slice(-4);
}

/* ---------- API: ใช้ api/withdraw และส่ง cookies ---------- */
async function postWithdraw(amount: number) {
  const res = await axios.post(
    "/api/withdraw",
    { amount },
    {
      withCredentials: true, // << สำคัญ: ส่ง cookies ไปด้วย
      headers: { "Content-Type": "application/json", accept: "application/json" },
    }
  );
  return res.data;
}

/* -------------------- Component หลัก -------------------- */
export default function ConfirmWithdrawPage() {
  const router = useRouter();
  const search = useSearchParams();

  const account = search.get("account") ?? "0123456789";
  const nextHref = "/driver/wallet";

  // อ่านจำนวนเงินจาก localStorage เพื่อแสดงบน UI
  const [amountDisplay, setAmountDisplay] = React.useState<string>("0.00");
  React.useEffect(() => {
    const s = localStorage.getItem("withdrawAmount") || "0";
    const n = Number(s);
    setAmountDisplay(isNaN(n) ? "0.00" : n.toFixed(2));
  }, []);

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
      <p className="text-[32px] font-bold text-shadow-lg mt-10.5">ถอนเงิน</p>
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
      await postWithdraw(amount); // เรียก /api/withdraw พร้อม cookies

      // เคลียร์ค่าใน localStorage เมื่อสำเร็จ
      localStorage.removeItem("withdrawAmount");

      // ไปหน้ากระเป๋าเงิน
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

        {/* ถ้าอยากมีลิงก์กลับหน้า wallet เพิ่มเติม */}
        {/* <Link href={nextHref} className="mt-3 text-sm underline">กลับไปหน้ากระเป๋าเงิน</Link> */}
      </div>
    </div>
  );
}
