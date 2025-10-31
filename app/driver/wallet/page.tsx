"use client";

import Link from "next/link";
import { BackButton } from "@/app/components/share_component";
import Navbar from "../components/navbar";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

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
  type: "topup" | "withdraw" | "paid";
  status: "success" | "failed" | "cancel";
  created_at: string; // ISO: "2025-10-11T12:46:20.693141Z"
}

interface HistoryBlockProps {
  type: "topup" | "withdraw" | "paid";
  date: string; // accepts ISO or "YYYY-MM-DD HH:mm"
  success: "success" | "cancel";
  amount: number;
}

function Background() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [history, setHistory] = useState<HistoryBlockProps[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const openLogout = useCallback(() => setIsLogoutOpen(true), []);
  const closeLogout = useCallback(() => setIsLogoutOpen(false), []);

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

      // ✅ define & use 'mapped' in same block
      const mapped: HistoryBlockProps[] = (res.data ?? []).map((tx) => {
  const success: HistoryBlockProps["success"] =
    tx.status === "success" ? "success" : "cancel";

  return {
    type: tx.type,
    date: tx.created_at,
    success,
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
    <div className="relative min-h-screen w-full bg-[#C5D4E8] flex flex-col items-center">
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
    <div className="flex gap-10">
      <Link href="/driver/wallet/topup">
        <div className="h-[51px] w-[155px] bg-white rounded-[30px] shadow-md mt-5 flex justify-center items-center">
          <p className="text-center text-xl font-medium">เติมเงิน</p>
        </div>
      </Link>
      <Link href="/driver/wallet/withdraw">
        <div className="h-[51px] w-[155px] bg-white rounded-[30px] shadow-md mt-5 flex justify-center items-center">
          <p className="text-center text-xl font-medium">ถอนเงิน</p>
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

/** helper: แปลง Date เป็นฟอร์แมตไทย เช่น "24 ส.ค. 2568, 22.01"
 * รองรับ input เป็น ISO หรือ "YYYY-MM-DD HH:mm"
 */
function formatThaiDate(input: string) {
  const normalized = input.includes("T") ? input : input.replace(" ", "T");
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return input;
  const months = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  const dd = d.getDate();
  const mm = months[d.getMonth()];
  const yyyy = d.getFullYear() + 543;
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd} ${mm} ${yyyy}, ${hh}.${min}`;
}

function Block_history({ history }: { history: HistoryBlockProps[] }) {
  return (
    <div className="w-[366px] h-[370px] bg-white mt-3 rounded-t-[20px] overflow-y-auto shadow-sm ring-1 ring-[#D6E7E2]">
      {history.length === 0 ? (
        <div className="p-6 text-xl text-center text-gray-900">ยังไม่มีประวัติรายการ</div>
      ) : (
        <div className="flex flex-col">
          {history.map((item, idx) => {
            const isSuccess = item.success === "success";
            const labelType =
              item.type === "topup"
                ? "เติมเงิน"
                : item.type === "withdraw"
                ? "ถอนเงิน"
                : "ชำระเงิน";
            const labelStatus = isSuccess ? "สำเร็จ" : "ยกเลิก";

            return (
              <div key={idx} className="px-4 py-3 border-b-[2px] border-[#CFE3DE]">
                <div className="flex items-start justify-between">
                  <p className="text-xl font-semibold">{labelType}</p>
                  <p className="text-xl font-semibold">
                    {(item.type === "withdraw" || item.type === "paid") ? "-" : ""}฿{item.amount.toFixed(2)}
                  </p>
                </div>

                <div className="mt-1 text-sm flex items-center">
                  <span className={isSuccess ? "text-green-600" : "text-red-600"}>{labelStatus}</span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-gray-500">{formatThaiDate(item.date)}</span>
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
