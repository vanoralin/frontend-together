"use client";

import Link from "next/link";
import { BackButton } from "@/app/components/share_component";
import Navbar from "../components/navbar";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";

type Gender = "male" | "female";

/** ใช้ props จากข้อมูลจริงที่ดึงได้ */
interface ProfileWalletProps {
  profile_picture: string;
  username: string;
  gender?: Gender; // เผื่อ API ไม่ส่งมา
  coin: number;
}

interface ProfileData {
  balance: number;
  name: string;
  profile_picture: string;
  gender?: Gender;
}

/** RAW response from /api/transactions/history */
interface TransactionDTO {
  id: number;
  user_id: number;
  amount: number;
  type:
    | "topup"
    | "withdraw"
    | "refund_to_user"
    | "driver_penalty"
    | "payment_to_escrow"
    | "release_to_driver"
    | "passenger_cancellation_compensation";
  status: "success" | "pending" | "cancelled";
  created_at: string; // ISO string เช่น "2025-10-30T04:50:53.080238Z"
}

interface HistoryBlockProps {
  type:
    | "topup"
    | "withdraw"
    | "refund_to_user"
    | "driver_penalty"
    | "payment_to_escrow"
    | "release_to_driver"
    | "passenger_cancellation_compensation";
  date: string; // จะแปลงเป็น DD/MM/YYYY
  status: "success" | "pending" | "cancelled";
  amount: number;
}

function Background() {
  const router = useRouter();

  // mock history (คุณจะสลับไปดึงจาก API ก็ได้)
  const historyData: HistoryBlockProps[] = [
    { type: "topup", date: "2024-08-24 22:01", success: "success", amount: 50 },
    { type: "paid", date: "2024-08-18 12:00", success: "success", amount: 35 },
    { type: "topup", date: "2024-08-15 09:15", success: "cancel", amount: 100 },
    { type: "withdraw", date: "2024-08-10 18:45", success: "success", amount: 30 },
    { type: "paid", date: "2024-08-18 12:00", success: "success", amount: 35 },
    { type: "withdraw", date: "2024-07-30 16:20", success: "success", amount: 10 },
    { type: "topup", date: "2024-07-25 08:10", success: "cancel", amount: 150 },
    { type: "withdraw", date: "2024-07-20 19:55", success: "success", amount: 40 },
    { type: "withdraw", date: "2024-08-20 14:30", success: "cancel", amount: 20 },
    { type: "paid", date: "2024-08-18 12:00", success: "success", amount: 35 },
  ];

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);


  const [history, setHistory] = useState<HistoryBlockProps[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);


  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get<ProfileData>("/api/User/profile", {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
        setProfile(res.data);
      } catch (err: any) {
        console.error(err);
        if (err?.response?.status === 401) {
          router.replace("/customer/login");
          return;
        }
        // fallback ป้องกัน UI ว่างเปล่า
        setProfile({
          balance: 0,
          name: "ผู้ใช้",
          profile_picture: "/user.svg",
          gender: "male",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);


  useEffect(() => {
    (async () => {
      try {
        setHistoryLoading(true);
        const res = await axios.get<TransactionDTO[]>("/api/transactions/history", {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });

        const mapped: HistoryBlockProps[] = (res.data ?? []).map((tx) => {
          // สำหรับ topup: แสดง status จริง (success/pending/cancelled)
          // สำหรับประเภทอื่น ๆ: แสดงเป็น success ตามระบบปัจจุบัน
          const status: HistoryBlockProps["status"] =
            tx.type === "topup"
              ? tx.status
              : "success";

          return {
            type: tx.type,
            date: formatShortDate(tx.created_at),
            status,
            amount: tx.amount,
          };
        });

        setHistory(mapped);
      } catch (err) {
        console.error(err);
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    })();
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center">
      <Header_wallet />

      {loading ? (
        <div className="h-[162px] w-[366px] bg-white/70 rounded-[30px] shadow-md mt-8 animate-pulse" />
      ) : profile ? (
        <>
          <Profile_wallet
            profile_picture={profile.profile_picture}
            username={profile.name}
            gender={profile.gender}
            coin={profile.balance}
          />
          <Topup />

          {historyLoading ? (
            <div className="w-[366px] h-[370px] bg-white/70 mt-10 rounded-[20px] animate-pulse" />
          ) : (
            <History history={history ?? []} />
          )}
        </>
      ) : (
        <div className="h-[162px] w-[366px] bg-white rounded-[30px] shadow-md mt-8 flex items-center justify-center">
          <p className="text-gray-600">โหลดโปรไฟล์ไม่สำเร็จ</p>
        </div>
      )}

      <div className="mb-10" />
      <Navbar />
    </div>
  );
}

function Header_wallet() {
  return (
    <div className="flex flex-col items-center">
      <BackButton />
      <p className="text-[32px] font-bold text-shadow-lg mt-10.5">กระเป๋าเงิน</p>
    </div>
  );
}

function Profile_wallet({
  profile_picture,
  username,
  gender = "male",
  coin,
}: ProfileWalletProps) {
  return (
    <div className="h-[162px] w-[366px] bg-white rounded-[30px] shadow-md mt-8 p-4 flex items-center">
      <img
        src={profile_picture && profile_picture.trim() !== "" ? profile_picture : "/user.svg"}
        alt="icon"
        className="h-[130px] w-[130px] rounded-full object-cover ml-3"
      />
      <div className="flex flex-col ml-4">
        <div className="flex items-center">
          <p className="text-xl font-medium">{username}</p>
          <img
            src={gender === "male" ? "/male.svg" : "/female.svg"}
            alt={gender}
            className="h-7 w-7 ml-2"
          />
        </div>
        <div className="mt-3 h-[51px] w-fit px-2 bg-[rgba(181,91,50,0.8)] rounded-[20px] flex justify-center items-center">
          <img src="/coin.svg" alt="icon" className="h-6 w-6 mr-2" />
          <p className="text-xl">{coin.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

function Topup() {
  return (
    <div>
      <Link href="/customer/wallet/topup">
        <div className="h-[51px] w-[366px] bg-white rounded-[30px] shadow-md mt-5 flex justify-center items-center">
          <p className="text-center text-2xl font-medium">เติมเงิน</p>
        </div>
      </Link>
    </div>
  );
}

function History({ history }: { history: HistoryBlockProps[] }) {
  return (
    <div className="w-[366px] mt-10">
      <p className="text-2xl font-bold text-shadow-lg">ประวัติรายการ</p>
      <Block_history history={history} />
    </div>
  );
}

/** แปลง ISO -> DD/MM/YYYY ในเขตเวลาไทย */
function formatShortDate(input: string): string {
  const d = new Date(input);
  if (isNaN(d.getTime())) return input;

  const parts = new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(d);

  const dd = parts.find(p => p.type === "day")?.value ?? "";
  const mm = parts.find(p => p.type === "month")?.value ?? "";
  const yyyy = parts.find(p => p.type === "year")?.value ?? "";
  return `${dd}/${mm}/${yyyy}`;
}


function Block_history({ history }: { history: HistoryBlockProps[] }) {
  return (
    <div className="w-[366px] h-[370px] bg-white mt-3 rounded-t-[20px] overflow-y-auto shadow-sm ring-1 ring-[#D6E7E2]">
      {history.length === 0 ? (
        <div className="p-6 text-xl text-center text-gray-900">ยังไม่มีประวัติรายการ</div>
      ) : (
        <div className="flex flex-col">
          {history.map((item, idx) => {
            const labelType =
              item.type === "topup"
                ? "เติมเงิน"
                : item.type === "withdraw"
                ? "ถอนเงิน"
                : item.type === "refund_to_user"
                ? "คืนเงินให้ผู้โดยสาร"
                : item.type === "driver_penalty"
                ? "หักค่าปรับคนขับ"
                : item.type === "payment_to_escrow"
                ? "ชำระเงิน"
                : item.type === "release_to_driver"
                ? "เงินเข้าคนขับ"
                : "ค่าชดเชยจากผู้โดยสาร";

            const isSuccess = item.status === "success";
            const isPending = item.status === "pending";
            const isCancelled = item.status === "cancelled";

            const labelStatus = isSuccess
              ? "สำเร็จ"
              : isPending
              ? "รอดำเนินการ"
              : "ยกเลิก";

            const statusClass = isSuccess
              ? "text-green-600"
              : isPending
              ? "text-amber-600"
              : "text-red-600";

            const isDebit = [
              "withdraw",
              "driver_penalty",
              "payment_to_escrow",
              "refund_to_user",
            ].includes(item.type);

            return (
              <div key={idx} className="px-4 py-3 border-b-[2px] border-[#CFE3DE]">
                <div className="flex items-start justify-between">
                  <p className="text-xl font-semibold">{labelType}</p>
                  <p className="text-xl font-semibold">
                    {isDebit ? "-" : ""}฿{item.amount.toFixed(2)}
                  </p>
                </div>

                <div className="mt-1 text-sm flex items-center">
                  <span className={statusClass}>{labelStatus}</span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-gray-500">{item.date}</span>
                </div>
              </div>
            );
          })}
          <div className="mb-15" />
        </div>
      )}
    </div>
  );
}

export default Background;
