"use client";

import RoleBar from "@/app/components/user_components";
import { BackButton } from "@/app/components/share_component";
import Link from "next/link";
import { useEffect, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/navbar";

type Gender = "male" | "female";

interface HeaderProps {
  username: string;
  role: number;
  gender?: Gender;
  email: string;
}

interface ListItemProps {
  coin: number;
}

type ApiGender = "male" | "female" | "MALE" | "FEMALE" | string;

interface ApiProfile {
  username?: string;
  name?: string; // sometimes APIs use name instead of username
  email?: string;
  role?: number;
  gender?: ApiGender;
  coin?: number;
  wallet?: number; // safety: some APIs name it differently
}

const API_URL = "http://129.150.62.182:8888/User/profile";

function normalizeGender(g?: ApiGender): Gender {
  const val = String(g ?? "").toLowerCase();
  return val === "female" ? "female" : "male";
}

function pickNumber(...values: Array<number | undefined | null>): number {
  for (const v of values) {
    if (typeof v === "number" && !Number.isNaN(v)) return v;
  }
  return 0;
}

const genderIconMap: Record<Gender, string> = {
  male: "/male.svg",
  female: "/female.svg",
};

function Background() {
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<number>(0);
  const [gender, setGender] = useState<Gender>("male");
  const [coin, setCoin] = useState<number>(0);

  const openLogout = useCallback(() => setIsLogoutOpen(true), []);
  const closeLogout = useCallback(() => setIsLogoutOpen(false), []);

  // Fetch profile on mount
  useEffect(() => {
    const abort = new AbortController();

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage (adjust key name if yours is different)
        const token = localStorage.getItem("token");

        const res = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
          signal: abort.signal,
        });

        if (res.status === 401 || res.status === 403) {
          // Not authenticated -> send to login
          router.replace("/customer/login");
          return;
        }

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with ${res.status}`);
        }

        const data: ApiProfile = await res.json();

        // Map fields safely
        const name = data.username ?? data.name ?? "";
        const g = normalizeGender(data.gender);
        const c = pickNumber(data.coin, data.wallet);

        setUsername(name);
        setEmail(data.email ?? "");
        setRole(typeof data.role === "number" ? data.role : 0);
        setGender(g);
        setCoin(c);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setError(err?.message ?? "เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
    return () => abort.abort();
  }, [router]);

  const canShowProfile = useMemo(
    () => !loading && !error && username && email,
    [loading, error, username, email]
  );

  return (
    <div className="relative min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center">
      <Header_profile />

      {/* Loading state */}
      {loading && (
        <div className="h-[198px] w-[366px] bg-white/70 rounded-[30px] shadow-md mt-7 animate-pulse" />
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="h-auto w-[366px] bg-white rounded-[20px] shadow-md mt-7 p-4 text-center text-red-600">
          <p className="text-lg font-medium">ไม่สามารถโหลดโปรไฟล์ได้</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => location.reload()}
            className="mt-3 px-4 py-2 rounded-full bg-[#E6A88A] border-2 border-[#B55C32] font-medium shadow-md hover:brightness-95 transition text-base"
          >
            ลองใหม่
          </button>
        </div>
      )}

      {/* Profile block when data ready (fallback to minimal content if some fields missing) */}
      {canShowProfile && (
        <Block_profileuser
          username={username}
          role={role}
          gender={gender}
          email={email}
        />
      )}

      {/* Wallet / list items */}
      <Block_listitem_profile coin={coin} />

      {/* Logout */}
      <Block_logout onClick={openLogout} />

      {isLogoutOpen && (
        <Popup_logout
          onCancel={closeLogout}
          onConfirm={() => {
            closeLogout();
            // Clear auth + go to login
            try {
              localStorage.removeItem("token"); // adjust if you store other keys
              sessionStorage.clear();
            } catch {}
            // Optionally call a logout API here if you have one
            router.replace("/customer/login");
          }}
        />
      )}

      <Navbar />
    </div>
  );
}

function Header_profile() {
  return (
    <div className="flex flex-col items-center">
      <BackButton />
      <p className="text-[32px] text-center font-bold text-shadow-lg mt-10">
        โปรไฟล์
      </p>
    </div>
  );
}

function Block_profileuser({ username, role, gender = "male", email }: HeaderProps) {
  return (
    <div>
      <Link href="/customer/edit_profile">
        <div className="h-[198px] w-[366px] bg-white rounded-[30px] shadow-md mt-7 flex flex-col justify-center">
          <div className="flex items-center">
            <img
              src="/user.svg"
              alt="user icon"
              className="h-[132px] w-[132px] rounded-full object-cover ml-2"
            />
            <div className="flex flex-col ml-1">
              <div className="flex items-center">
                <p className="text-xl mb-1 break-all">{username}</p>
                <img
                  src={genderIconMap[gender] ?? "/male.svg"}
                  alt={`${gender} icon`}
                  className="h-7 w-7 ml-1"
                />
              </div>
              <div className="flex items-center mb-1 w-45 h-13">
                <RoleBar role={role} />
              </div>
              <p className="text-base break-all">{email}</p>
            </div>
            <img src="/vector_next.svg" alt="next" className="h-5 w-5 ml-1" />
          </div>
        </div>
      </Link>
    </div>
  );
}

function Block_listitem_profile({ coin }: ListItemProps) {
  return (
    <div>
      <Link href="/customer/wallet">
        <div className="h-[82px] w-[366px] bg-white rounded-t-[20px] shadow-md mt-5 flex items-center px-4">
          <p className="text-xl">กระเป๋าเงิน</p>
          <div className="ml-10 h-[51px] w-[145px] bg-[rgba(181,91,50,0.8)] rounded-[20px] flex justify-center items-center">
            <img src="/coin.svg" alt="coin icon" className="h-6 w-6 mr-2" />
            <p className="text-xl">{coin.toFixed(2)}</p>
          </div>
          <img src="/vector_next.svg" alt="next" className="h-5 w-5 ml-auto" />
        </div>
      </Link>
      <Link href="/customer">
        <div className="h-[82px] w-[366px] bg-white shadow-md mt-1 flex items-center px-4">
          <p className="text-xl">ทริปขาประจำ</p>
          <img src="/vector_next.svg" alt="next" className="h-5 w-5 ml-auto" />
        </div>
      </Link>
      <Link href="/customer/history_page">
        <div className="h-[82px] w-[366px] bg-white shadow-md mt-1 flex items-center px-4">
          <p className="text-xl">ประวัติการเดินทาง</p>
          <img src="/vector_next.svg" alt="next" className="h-5 w-5 ml-auto" />
        </div>
      </Link>
      <div className="h-[82px] w-[366px] bg-white rounded-b-[20px] shadow-md mt-1 flex items-center px-4">
        <p className="text-xl">แจ้งปัญหา</p>
        <img src="/help.svg" alt="help" className="h-5 w-5 ml-2" />
        <img src="/vector_next.svg" alt="next" className="h-5 w-5 ml-auto" />
      </div>
    </div>
  );
}

function Block_logout({ onClick }: { onClick?: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className="h-[60px] w-[366px] bg-white rounded-full shadow-md mt-5 mb-20 flex items-center justify-center px-6 cursor-pointer hover:shadow-lg transition"
    >
      <p className="text-center text-red-600 text-xl">ออกจากระบบ</p>
    </div>
  );
}

function Popup_logout({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative h-[164px] w-[366px] bg-white rounded-[30px] shadow-md p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg text-center mt-2">แน่ใจไหมว่าต้องการออกจากระบบ?</p>
        <div className="flex justify-center space-x-6 mt-5">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-full bg-[#FFFFFF] border-2 border-[#8B8B8B] font-medium shadow-md hover:bg-gray-100 transition text-xl"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-2 rounded-full bg-[#E6A88A] border-2 border-[#B55C32] font-medium shadow-md hover:brightness-95 transition text-xl"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
}

export default Background;
export { Header_profile, Block_listitem_profile, Block_logout, Block_profileuser, Popup_logout };
