"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";

const API_CONFIRM = "/api/topup/confirm"; // ยิงเข้า API Route (ข้อ 1)

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

  if (res.status === 401) {
    throw new Error("401");
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "ยืนยันไม่สำเร็จ");
  }
  return res.json().catch(() => ({}));
}

function Background() {
  const router = useRouter();

  const amountInput =
    (typeof window !== "undefined" && localStorage.getItem("topupAmount")) || "0";
  const base64 =
    (typeof window !== "undefined" && localStorage.getItem("topupQrBase64")) || "";
  const txId =
    (typeof window !== "undefined" && localStorage.getItem("topupTxId")) || "";

  React.useEffect(() => {
    if (!base64 || !txId) {
      alert("ไม่พบข้อมูล QR / transaction_id");
      router.replace("/customer/wallet/topup");
    }
  }, [base64, txId, router]);

  const dataUrl = base64 ? `data:image/png;base64,${base64}` : "/QR.png";
  const [expired, setExpired] = React.useState(false);

  return (
    <div className="bg-[#C5DEDA] min-h-screen relative w-full flex flex-col items-center pb-[140px]">
      <Header />
      <div className="flex flex-col items-center mt-10 bg-white p-4 rounded-lg shadow-lg">
        <img
          src={dataUrl}
          alt="QR Code"
          className="w-[280px] h-[280px] object-contain"
        />
      </div>

      <Detail
        amount={Number(amountInput) || 0}
        onExpire={() => setExpired(true)}
        expired={expired}
      />

      <Goto_payment expired={expired} />
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-col items-center">
      <BackButton />
      <p className="text-[32px] font-bold mt-10.5">QR Code</p>
    </div>
  );
}

function Detail({
  amount,
  currencyLabel = "บาท",
  initialSeconds = 300, // 5 นาที
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
    const id = setInterval(
      () => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)),
      1000
    );
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

export default Background;
export { Header, Detail, Goto_payment };

