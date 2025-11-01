"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";
import Navbar from "../components/navbar";

type Gender = "male" | "female";

/** ─ Tx Types (รวมชุดใหม่) ─ */
type TxType =
  | "topup"
  | "withdraw"
  | "paid"
  | "refund_to_user"
  | "driver_penalty"
  | "payment_to_escrow"
  | "release_to_driver"
  | "passenger_cancellation_compensation";

/** ─ Status เหลือ success / pending ─ */
type TxStatus = "success" | "pending";

interface ProfileData {
  profile_picture: string;
  name: string;
  gender?: Gender;
  balance: number;
}

interface TransactionDTO {
  id: number;
  user_id: number;
  amount: number;
  type: TxType;
  status: TxStatus; // ถ้า backend ยังมี "cancel" จะ map เป็น "pending" ด้านล่าง
  created_at: string; // ISO
}

/** ใช้แสดงจริงใน UI */
interface HistoryBlockProps {
  type: TxType;
  date: string;   // ISO or "YYYY-MM-DD HH:mm"
  status: TxStatus;
  amount: number;
}

function Background() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [history, setHistory] = useState<HistoryBlockProps[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const openLogout = useCallback(() => setIsLogoutOpen(true), []);
  const closeLogout = useCallback(() => setIsLogoutOpen(false), []);

  // ───── fetch profile ─────
  useEffect(() => {
    (async () => {
      try {
        setProfileLoading(true);
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
        setProfile({
          name: "ผู้ใช้",
          balance: 0,
          gender: "male",
          profile_picture: "/user.svg",
        });
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [router]);

  // ───── fetch history (เหมือนหน้าแจ้งเตือน = ใช้การ์ด) ─────
  useEffect(() => {
    (async () => {
      try {
        setHistoryLoading(true);
        const res = await axios.get<TransactionDTO[]>("/api/transactions/history", {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });

        const mapped: HistoryBlockProps[] = (res.data ?? []).map((tx) => {
          const status: TxStatus =
            tx.status === "success" ? "success" : "pending"; // รวมกรณี "cancel" เก่า → pending
          return {
            type: tx.type,
            date: tx.created_at,
            status,
            amount: tx.amount,
          };
        });

        // อยากให้ใหม่สุดอยู่บน? เรียง DESC ตามวันที่
        mapped.sort((a, b) => +new Date(b.date) - +new Date(a.date));
        setHistory(mapped);
      } catch (err) {
        console.error(err);
        setHistory([]); // empty state
      } finally {
        setHistoryLoading(false);
      }
    })();
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center">
      <Header_wallet />

      {/* Profile Card */}
      {profileLoading ? (
        <div className="h-[170px] w-[366px] bg-white/70 rounded-[30px] shadow-md mt-8 animate-pulse" />
      ) : profile ? (
        <Profile_wallet
          profile_picture={profile.profile_picture}
          username={profile.name}
          gender={profile.gender}
          coin={profile.balance}
        />
      ) : (
        <div className="h-[170px] w-[366px] bg-white rounded-[30px] shadow-md mt-8 flex items-center justify-center">
          <p className="text-gray-600">โหลดโปรไฟล์ไม่สำเร็จ</p>
        </div>
      )}

      {/* Topup button */}
      <Topup />

      {/* History cards (สไตล์เหมือน NotificationBlock) */}
      <History history={history} loading={historyLoading} />

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
}: {
  profile_picture: string;
  username: string;
  gender?: Gender;
  coin: number;
}) {
  return (
    <div className="h-[170px] w-[366px] bg-white rounded-[30px] shadow-md mt-8 p-4 flex items-center">
      <img
        src={profile_picture?.trim() ? profile_picture : "/user.svg"}
        alt="user icon"
        className="h-[125px] w-[125px] rounded-full object-cover"
      />
      <div className="flex flex-col ml-4">
        <div className="flex items-center">
          <p className="text-xl truncate max-w-[150px]">{username}</p>
          <img
            src={gender === "male" ? "/male.svg" : "/female.svg"}
            alt={gender}
            className={`ml-2 ${gender === "female" ? "h-5 w-6" : "h-6 w-6"}`}
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

/* ───────── Helper formats ───────── */
function formatDDMMYYYY(input: string) {
  const src = input.includes("T") ? input : input.replace(" ", "T");
  const d = new Date(src);
  if (isNaN(d.getTime())) return input;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}
function formatHHmm(input: string) {
  const src = input.includes("T") ? input : input.replace(" ", "T");
  const d = new Date(src);
  if (isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mi}`;
}

/* ───────── Mapping ───────── */
function txTypeLabel(type: TxType): string {
  switch (type) {
    case "topup": return "เติมเงิน";
    case "withdraw": return "ถอนเงิน";
    case "paid": return "ชำระเงิน";
    case "refund_to_user": return "คืนเงินให้ผู้โดยสาร";
    case "driver_penalty": return "ปรับคนขับ";
    case "payment_to_escrow": return "โอนไปกองกลาง";
    case "release_to_driver": return "โอนเงินให้คนขับ";
    case "passenger_cancellation_compensation": return "ค่าปรับผู้โดยสารยกเลิก";
    default: return type;
  }
}

/** ฝั่งผู้โดยสาร อะไรคือ “เงินออก” */
const NEGATIVE_TYPES_FOR_PASSENGER: Set<TxType> = new Set([
  "withdraw",
  "paid",
  "payment_to_escrow",
  "passenger_cancellation_compensation",
]);

function statusPill(status: TxStatus) {
  const label = status === "success" ? "สำเร็จ" : "รอดำเนินการ";
  const cls =
    status === "success"
      ? "text-green-700 bg-green-50 ring-green-200"
      : "text-amber-700 bg-amber-50 ring-amber-200";
  return { label, cls };
}

/* ───────── History (การ์ดเหมือนหน้าแจ้งเตือน) ───────── */
function History({
  history,
  loading,
}: {
  history: HistoryBlockProps[];
  loading: boolean;
}) {
  return (
    <div className="w-full max-w-md mt-10 px-4">
      <p className="text-2xl font-bold text-shadow-lg mb-4">ประวัติรายการ</p>
      <Block_history history={history} loading={loading} />
    </div>
  );
}

function Block_history({
  history,
  loading,
}: {
  history: HistoryBlockProps[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/80 shadow-sm ring-1 ring-black/5 rounded-2xl p-4 animate-pulse">
            <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-28 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center text-sm text-gray-600 py-6">
        ยังไม่มีประวัติรายการ
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-16">
      {history.map((item, idx) => {
        const title = txTypeLabel(item.type);
        const isNegative = NEGATIVE_TYPES_FOR_PASSENGER.has(item.type);
        const signedAmount = `${isNegative ? "-" : "+"}฿${item.amount.toFixed(2)}`;
        const amountClass = isNegative ? "text-red-600" : "text-green-600";
        const { label: statusLabel, cls: statusCls } = statusPill(item.status);
        const dateStr = formatDDMMYYYY(item.date);
        const timeStr = formatHHmm(item.date);

        return (
          <div
            key={idx}
            className="bg-white/80 w-full shadow-sm ring-1 ring-black/5 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <p className="text-base font-semibold text-gray-800">{title}</p>
              <p className={`text-base font-semibold ${amountClass}`}>{signedAmount}</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full ring-1 ${statusCls}`}>
                {statusLabel}
              </span>
              <div className="flex items-center gap-2 text-gray-500">
                <span>{dateStr}</span>
                <span>•</span>
                <span>{timeStr}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Background;
