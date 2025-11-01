"use client";

import React from "react";
import { useRouter } from "next/navigation";
// import { BackButton } from "@/app/components/share_component"; // ใช้ปุ่ม icon แทน

const API_CONFIRM = "/api/topup/confirm";
const API_CANCEL = "/api/topup/cancel";

type DetailProps = {
  amount: number;
  currencyLabel?: string;
  initialSeconds?: number;
  onExpire?: () => void;
  expired?: boolean;
};

async function confirmTopup(txId: number) {
  const res = await fetch(API_CONFIRM, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ transaction_id: txId }),
  });

  if (res.status === 401) throw new Error("401");
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "ยืนยันไม่สำเร็จ");
  }
  return res.json().catch(() => ({}));
}

async function cancelTopup(txId: number) {
  const res = await fetch(API_CANCEL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ transaction_id: txId }),
  });
  if (res.status === 401) throw new Error("401");
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "ยกเลิกรายการไม่สำเร็จ");
  }
  return res.json().catch(() => ({}));
}

function Background() {
  const router = useRouter();

  const amountInput =
    (typeof window !== "undefined" && localStorage.getItem("topupAmount")) || "0";
  const base64 =
    (typeof window !== "undefined" && localStorage.getItem("topupQrBase64")) || "";
  const txIdStr =
    (typeof window !== "undefined" && localStorage.getItem("topupTxId")) || "";
  const txIdNum = Number(txIdStr || 0);

  React.useEffect(() => {
    if (!base64 || !txIdStr) {
      // alert("ไม่พบข้อมูล QR / transaction_id");
      router.replace("/customer/wallet");
    }
  }, [base64, txIdStr, router]);

  const dataUrl = base64 ? `data:image/png;base64,${base64}` : "/QR.png";
  const [expired, setExpired] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const clearLocal = React.useCallback(() => {
    localStorage.removeItem("topupAmount");
    localStorage.removeItem("topupMessage");
    localStorage.removeItem("topupQrBase64");
    localStorage.removeItem("topupTxId");
  }, []);

  const handleCancelAndGo = React.useCallback(async () => {
    if (busy) return;
    try {
      setBusy(true);
      if (txIdNum) {
        await cancelTopup(txIdNum);
      }
    } catch (e: any) {
      if (e?.message === "401") {
        alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง");
        clearLocal();
        router.replace("/customer/login");
        return;
      }
      console.error(e);
    } finally {
      clearLocal();
      router.replace("/customer/wallet");
      setBusy(false);
    }
  }, [busy, txIdNum, router, clearLocal]);

  return (
    <div className="bg-[#C5DEDA] min-h-screen relative w-full flex flex-col items-center pb-[140px]">
      <Header onBack={handleCancelAndGo} busy={busy} />

      {/* QR */}
      <div className="flex flex-col items-center mt-10 bg-white p-4 rounded-lg shadow-lg">
        <img src={dataUrl} alt="QR Code" className="w-[280px] h-[280px] object-contain" />
      </div>

      {/* รายละเอียด + นับถอยหลัง */}
      <Detail
        amount={Number(amountInput) || 0}
        onExpire={() => {
          // แสดง popup แบบเดิม แล้วให้ผู้ใช้กดปิด/ESC/คลิกพื้นหลัง -> จะ cancel และกลับ
          setExpired(true);
        }}
        expired={expired}
        /* initialSeconds={300}  // production */
        initialSeconds={300}       // ทดสอบเร็ว
      />

      {/* ปุ่มยืนยัน */}
      <Goto_payment expired={expired} />

      {/* ป็อปอัปหมดเวลา (แบบเดิม) */}
      {expired && <ExpiredPopup onClose={handleCancelAndGo} />}
    </div>
  );
}

function Header({ onBack, busy }: { onBack: () => void; busy: boolean }) {
  return (
    <div className="relative mt-10.5 w-full flex items-center justify-center h-12">
  {/* ปุ่ม back (ยึดมุมซ้าย กึ่งกลางแนวตั้ง) */}
  <button
    onClick={onBack}
    disabled={busy}
    className="absolute left-4 top-1/2 -translate-y-1/2 disabled:opacity-50"
    aria-label="ย้อนกลับ"
  >
    <img src="/icon_back_arrow.svg" alt="ย้อนกลับ" className="h-10 w-10" />
  </button>

  {/* หัวข้อกึ่งกลางจริง ๆ */}
  <p className="text-[32px] font-bold leading-none">QR Code</p>
</div>

  );
}

function Detail({
  amount,
  currencyLabel = "บาท",
  initialSeconds = 300, // ค่าเริ่มต้น 5 นาที (ถ้าไม่ได้ส่งมา)
  onExpire,
  expired = false,
}: DetailProps) {
  const [secondsLeft, setSecondsLeft] = React.useState(initialSeconds);
  const firedRef = React.useRef(false);

  React.useEffect(() => {
    firedRef.current = false;
    setSecondsLeft(initialSeconds);
  }, [initialSeconds, amount]);

  React.useEffect(() => {
    if (secondsLeft === 0 && !firedRef.current) {
      firedRef.current = true;
      onExpire?.();
    }
  }, [secondsLeft, onExpire]);

  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const mm = Math.floor(secondsLeft / 60).toString();
  const ss = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <div className="mt-5 text-center">
      <p className="text-2xl">
        ยอดชำระ {amount.toLocaleString()} {currencyLabel}
      </p>
      <p className={`text-xl mt-5 ${expired ? "text-red-600" : "text-[#B55C32]"}`}>
        {expired ? "คิวอาร์โค้ดหมดอายุแล้ว" : `คิวอาร์โค้ดจะหมดอายุภายใน ${mm}:${ss} นาที`}
      </p>
    </div>
  );
}

function Goto_payment({ expired }: { expired: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    if (loading || expired) return;
    const txIdStr = localStorage.getItem("topupTxId");
    if (!txIdStr) return alert("ไม่พบ transaction_id");

    try {
      setLoading(true);
      await confirmTopup(Number(txIdStr));

      localStorage.removeItem("topupAmount");
      localStorage.removeItem("topupMessage");
      localStorage.removeItem("topupQrBase64");
      localStorage.removeItem("topupTxId");

      router.replace("/customer/wallet");
    } catch (e: any) {
      if (e?.message === "401") {
        alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง");
        router.replace("/customer/login");
        return;
      }
      alert(e?.message || "เกิดข้อผิดพลาดในการยืนยัน");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute w-full bottom-0">
      <div className="h-[120px] w-full bg-white rounded-t-2xl shadow-md flex justify-center items-center">
        <div
          onClick={handleConfirm}
          className={`relative h-15 w-80 bg-[#E6A88A] border-[#B55C32] border-2 rounded-[30px] shadow-md flex justify-center items-center mt-7 ${
            loading || expired ? "opacity-60 pointer-events-none" : "opacity-100 cursor-pointer"
          }`}
          role="button"
          aria-label="ยืนยันการเติมเงิน"
        >
          <p className="text-center text-2xl font-medium">
            {loading ? "กำลังยืนยัน..." : expired ? "QR หมดอายุ" : "ยืนยันการเติมเงิน"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========== Expired Popup (แบบเดิม) =========== */
function ExpiredPopup({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  // ปุ่ม Esc => ยกเลิกและกลับ
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      {/* backdrop (คลิกพื้นหลังให้กลับได้) */}
      <button
        aria-label="close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* card ขนาดเล็ก */}
      <div className="relative w-[86%] max-w-sm rounded-xl shadow-xl overflow-hidden scale-95">
        {/* ส่วนหัวพื้นหลังแดง */}
        <div className="bg-[#E9777A] px-4 py-5 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">หมดเวลาแล้ว</h2>
          <p className="mt-1 text-white/90 text-sm leading-snug">
            ไม่ได้ชำระเงินในเวลาที่กำหนด<br />กรุณาทำรายการใหม่อีกครั้ง
          </p>
        </div>

        {/* ปุ่ม */}
        <div className="bg-white px-4 py-4 flex justify-center">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full border border-[#B55C32] px-5 py-2 text-base font-medium shadow-sm hover:shadow active:scale-[0.98]"
            autoFocus
          >
            กลับไปที่กระเป๋าเงิน
          </button>
        </div>
      </div>
    </div>
  );
}

export default Background;
export { Header, Detail, Goto_payment, ExpiredPopup };
