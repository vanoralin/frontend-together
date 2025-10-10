// // ไม่รู้ว่า QR ครบ 5 นาทีจะเป็นยังไงต่อ ตอนนี้ทำ popup alert แทน , บันทึก QR แล้วยังไงต่อ

// "use client";
// import React from "react";
// import { BackButton } from "@/app/components/share_component";
// import Link from "next/link";

// type DetailProps = {
//   amount: number;  
//   currencyLabel?: string;  
//   initialSeconds?: number; 
//   onExpire?: () => void;  
// };

// function Background() {
//   const amountInput = localStorage.getItem("topupAmount");
//   return (
//     <div className="bg-[#C5DEDA] min-h-screen relative w-full flex flex-col items-center pb-[140px]">
//       <Header />
//       <QRCode />
//       <Detail amount={Number(amountInput)} onExpire={() => alert("Expired")} />
//       <Goto_payment />
//     </div>
//   );
// }

// function Header() {
//   return (
    
//     <div className="flex flex-col items-center">
//       <BackButton />
//       <p className="text-[32px] font-bold text-shadow-lg mt-10.5">QR Code</p>
//     </div>
//   );
// }

// function QRCode() {
//   return (
//     <div className="flex flex-col items-center mt-10 bg-white p-4 rounded-lg shadow-lg">
//       {/* Tailwind ไม่มี w-70/h-70 → ใช้ขนาดแบบกำหนดเองแทน */}
//       <img src="/QR.png" alt="QR Code" className="w-[280px] h-[280px] object-contain" />
//       {/* <p className="text-lg">สแกน QR Code เพื่อเติมเงิน</p> */}
//     </div>
//   );
// }

// function Detail({
//   amount,
//   currencyLabel = "บาท",
//   initialSeconds = 300,
//   onExpire,
// }: DetailProps) {
//   const [secondsLeft, setSecondsLeft] = React.useState(initialSeconds);

//   // ป้องกัน onExpire ถูกเรียกซ้ำเมื่อ secondsLeft === 0 หลายครั้ง
//   const expiredRef = React.useRef(false);

//   // รีเซ็ตเวลาเมื่อ amount หรือ initialSeconds เปลี่ยน
//   React.useEffect(() => {
//     expiredRef.current = false;
//     setSecondsLeft(initialSeconds);
//   }, [initialSeconds, amount]);

//   // เรียก onExpire แค่ครั้งเดียว ตอนเปลี่ยนผ่านมาที่ 0
//   React.useEffect(() => {
//     if (secondsLeft === 0 && !expiredRef.current) {
//       expiredRef.current = true;
//       onExpire?.();
//     }
//   }, [secondsLeft, onExpire]);

//   // นับถอยหลัง (สร้าง interval เฉพาะตอนยังมีเวลาคงเหลือ)
//   React.useEffect(() => {
//     if (secondsLeft <= 0) return;
//     const id = setInterval(() => {
//       setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
//     }, 1000);
//     return () => clearInterval(id);
//   }, [secondsLeft]);

//   // แปลงวินาทีเป็น mm:ss
//   const mm = Math.floor(secondsLeft / 60).toString(); // ต้องการแสดงแบบ 5:00 (ไม่เติม 0 ข้างหน้า)
//   const ss = (secondsLeft % 60).toString().padStart(2, "0");

//   return (
//     <div className="mt-5 text-center">
//       <p className="text-2xl">
//         ยอดชำระ {amount.toLocaleString()} {currencyLabel}
//       </p>
//       <p className="text-xl text-[#B55C32] mt-5">
//         คิวอาร์โค้ดจะหมดอายุภายใน {mm}:{ss} นาที
//       </p>
//     </div>
//   );
// }

// function Goto_payment() {
//   return (
//     <div className="absolute w-full bottom-0">
//       <div className="h-[120px] w-full bg-white rounded-t-2xl shadow-md flex justify-center items-center">
//         <Link href="/customer/wallet">
//         <div className="relative h-15 w-80 bg-[#E6A88A] border-[#B55C32] border-2 rounded-[30px] shadow-md flex justify-center items-center mt-7"
//             onClick={() => {
//               localStorage.setItem("topupAmount", "0");
//             }}>
//           <p className="text-center text-2xl font-medium">บันทึก QR Code</p>
//         </div>
//         </Link>
//       </div>
//     </div>
//   );
// }

// export default Background;
// export { Header, QRCode, Detail, Goto_payment };
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";

/* =============== Config/Helper =============== */
const API_BASE = "http://129.150.62.182:8888";

function getCleanToken(): string {
  if (typeof window === "undefined") return "";
  const raw =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    "";
  return raw.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
}

async function postStrictRAW(url: string, body: any): Promise<Response> {
  const token = getCleanToken();
  if (!token) throw new Error("ไม่พบ token (localStorage: token/authToken)");
  console.log("[token preview]", token.slice(0, 16), "… len=", token.length);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token, // ❗ RAW
    },
    body: JSON.stringify(body),
  });

  const txt = await res.text().catch(() => "");
  console.log("[postStrictRAW]", url, "status=", res.status, "body=", txt);
  return new Response(txt, { status: res.status, headers: res.headers });
}

/* =============== UI =============== */
type DetailProps = {
  amount: number;
  currencyLabel?: string;
  initialSeconds?: number;
  onExpire?: () => void;
};

function Background() {
  const router = useRouter();

  const amountInput = localStorage.getItem("topupAmount") || "0";
  const base64 = localStorage.getItem("topupQrBase64");
  const txId = localStorage.getItem("topupTxId");

  React.useEffect(() => {
    if (!base64 || !txId) {
      alert("ไม่พบข้อมูล QR / transaction_id");
      router.replace("/customer/wallet/topup");
    }
  }, [base64, txId, router]);

  const dataUrl = base64 ? `data:image/png;base64,${base64}` : "";

  return (
    <div className="bg-[#C5DEDA] min-h-screen relative w-full flex flex-col items-center pb-[140px]">
      <Header />
      <div className="flex flex-col items-center mt-10 bg-white p-4 rounded-lg shadow-lg">
        <img src={dataUrl || "/QR.png"} alt="QR Code" className="w-[280px] h-[280px] object-contain" />
      </div>
      <Detail amount={Number(amountInput) || 0} onExpire={() => alert("Expired")} />
      <Goto_payment />
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
  initialSeconds = 300,
  onExpire,
}: DetailProps) {
  const [secondsLeft, setSecondsLeft] = React.useState(initialSeconds);
  const ref = React.useRef(false);

  React.useEffect(() => {
    ref.current = false;
    setSecondsLeft(initialSeconds);
  }, [initialSeconds, amount]);

  React.useEffect(() => {
    if (secondsLeft === 0 && !ref.current) {
      ref.current = true;
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
      <p className="text-2xl">ยอดชำระ {amount.toLocaleString()} {currencyLabel}</p>
      <p className="text-xl text-[#B55C32] mt-5">คิวอาร์โค้ดจะหมดอายุภายใน {mm}:{ss} นาที</p>
    </div>
  );
}

function Goto_payment() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    if (loading) return;

    const txIdStr = localStorage.getItem("topupTxId");
    if (!txIdStr) return alert("ไม่พบ transaction_id");

    try {
      setLoading(true);
      const res = await postStrictRAW(`${API_BASE}/topup/confirm`, {
        transaction_id: Number(txIdStr),
      });
      if (!res.ok) throw new Error(await res.text());

      alert("ยืนยันสำเร็จ");
      localStorage.removeItem("topupQrBase64");
      localStorage.removeItem("topupTxId");
      localStorage.setItem("topupAmount", "0");
      router.replace("/customer/wallet");
    } catch (e: any) {
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
            loading ? "opacity-60 pointer-events-none" : "opacity-100 cursor-pointer"
          }`}
          role="button"
          aria-label="บันทึก QR Code"
        >
          <p className="text-center text-2xl font-medium">
            {loading ? "กำลังยืนยัน..." : "บันทึก QR Code"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Background;
export { Header, Detail, Goto_payment };
