"use client";

import RoleBar from "@/app/components/user_components";
import { BackButton } from "@/app/components/share_component";
import Link from "next/link";
import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "../components/navbar";

type Gender = "male" | "female";
type Role = "user" | "driver";

/* ---------- helper: normalize role จากหลายรูปแบบของ API ---------- */
function normalizeRole(input?: unknown): Role | undefined {
  if (typeof input === "boolean") return input ? "driver" : "user";
  if (typeof input === "string") {
    const s = input.trim().toLowerCase();
    if (s === "driver") return "driver";
    if (s === "user") return "user";
  }
  return undefined;
}

interface HeaderProps {
  name: string;
  userRole?: string; // จะใส่ "driver" | "user" ที่ normalize แล้ว
  pageRole: string;
  gender?: Gender;
  email: string;
  profile_picture?: string;
}

interface ProfileData {
  name: string;
  userRole?: string; // บาง API ให้เป็น "Driver" / "USER"
  role?: string; // หรือ field อื่น
  is_driver?: boolean; // หรือ boolean
  has_driver?: boolean; // หรือ boolean
  gender?: Gender;
  email: string;
  balance: number;
  profile_picture?: string;
}

function Background() {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const openLogout = useCallback(() => setIsLogoutOpen(true), []);
  const closeLogout = useCallback(() => setIsLogoutOpen(false), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<ProfileData>("/api/User/profile", {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("[/api/User/profile] error:", err);
        router.replace("/customer/login");
      }
    };
    fetchData();
  }, [router]);

  const handleLogoutConfirm = useCallback(async () => {
    setBusy(true);
    try {
      await postLogout();
    } catch (err: any) {
      console.warn("[Background] logout error:", err?.message);
      alert("เกิดข้อผิดพลาดในการออกจากระบบ");
    } finally {
      setBusy(false);
      closeLogout();
      router.replace("/customer/login");
    }
  }, [router, closeLogout]);

  /* ---- สร้างค่าบทบาทที่ normalize แล้วจากหลาย field ที่อาจมาจาก API ---- */
  const normalizedUserRole: Role | undefined = normalizeRole(
    profile?.userRole ??
      profile?.role ??
      profile?.is_driver ??
      profile?.has_driver
  );

  return (
    <div className="relative min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center">
      <Header_profile />

      {profile ? (
        <>
          <Block_profileuser
            profile_picture={profile.profile_picture}
            name={profile.name}
            // ✅ ส่งค่า role หลัง normalize (ถ้าไม่มีให้ fallback เป็น "user")
            userRole={normalizedUserRole ?? "user"}
            gender={profile.gender || "male"}
            email={profile.email || "-"}
            pageRole="user"
          />
          <Block_listitem_profile coin={Number(profile.balance) || 0} />
        </>
      ) : (
        <div
          className="h-[198px] w-[366px] rounded-[30px] mt-7 flex items-center justify-center"
          aria-live="polite"
        >
          <p>กำลังโหลด...</p>
        </div>
      )}

      <Block_logout onClick={openLogout} />

      {/* Popup ยืนยัน */}
      {isLogoutOpen && (
        <Popup_logout
          onCancel={closeLogout}
          onConfirm={handleLogoutConfirm}
          busy={busy}
        />
      )}
      <div className="mb-15"></div>
      <Navbar />
    </div>
  );
}

const genderIconMap: Record<Gender, string> = {
  male: "/male.svg",
  female: "/female.svg",
};

function Header_profile() {
  return (
    <div className="flex flex-col items-center ">
      <BackButton />
      <p className="text-[32px] font-bold text-shadow-lg mt-10.5">โปรไฟล์</p>
    </div>
  );
}

function Block_profileuser({
  profile_picture,
  name,
  userRole, // ← จะเป็น "driver" | "user" ที่ normalize มาแล้ว
  pageRole = "user",
  gender = "male",
  email,
}: HeaderProps) {
  const avatarSrc =
    profile_picture && profile_picture.trim() !== ""
      ? profile_picture
      : "/user.svg";
  const genderIcon = genderIconMap[gender] ?? "/male.svg";

  return (
    <div className="h-[170px] w-[366px] bg-white rounded-[30px] shadow-md mt-7 flex flex-col justify-center px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={avatarSrc}
            alt="user avatar"
            className="h-[125px] w-[125px] rounded-full object-cover"
          />

          <div className="flex flex-col ml-2 mr-2">
            <div className="flex items-center">
              <p className="text-xl mb-1 truncate max-w-[150px]" title={name}>
                {name}
              </p>
              <img
                src={genderIcon}
                alt={`${gender} icon`}
                className={`ml-1 ${
                  gender === "female" ? "h-5 w-6 mb-1" : "h-6 w-6 mb-1"
                }`}
              />
            </div>

            <div className="flex items-center mb-1">
              <RoleBar userRole={userRole} pageRole={pageRole} />
            </div>

            <p className="text-sm break-all">{email}</p>
          </div>
        </div>

        <Link href="/customer/edit_profile">
          <img src="/vector_next.svg" alt="next" className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}

interface ListItemProps {
  coin: number;
}

function Block_listitem_profile({ coin }: ListItemProps) {
  return (
    <div>
      <Link href="/customer/wallet">
        <div className="h-[82px] w-[366px] bg-white rounded-t-[20px] shadow-md mt-5 flex items-center justify-between px-4">
          <div className="flex items-center">
            <p className="text-xl">กระเป๋าเงิน</p>
            <div className="ml-7 h-[51px] w-fit px-2 bg-[rgba(181,91,50,0.8)] rounded-[20px] flex justify-center items-center">
              <img src="/coin.svg" alt="coin icon" className="h-6 w-6 mr-2" />
              <p className="text-xl">{coin.toFixed(2)}</p>
            </div>
          </div>
          <img src="/vector_next.svg" alt="next" className="h-5 w-5" />
        </div>
      </Link>

      <div className="h-[82px] w-[366px] bg-white shadow-md mt-1 flex items-center justify-between px-4">
        <p className="text-xl">ทริปขาประจำ</p>
        <img src="/vector_next.svg" alt="next" className="h-5 w-5" />
      </div>

      <Link href="/customer/history_page">
        <div className="h-[82px] w-[366px] bg-white shadow-md mt-1 flex items-center justify-between px-4">
          <p className="text-xl">ประวัติการเดินทาง</p>
          <img src="/vector_next.svg" alt="next" className="h-5 w-5" />
        </div>
      </Link>

      <div className="h-[82px] w-[366px] bg-white rounded-b-[20px] shadow-md mt-1 flex items-center justify-between px-4">
        <div className="flex items-center">
          <p className="text-xl">แจ้งปัญหา</p>
          <img src="/help.svg" alt="help" className="h-6 w-6 ml-2" />
        </div>
        <Link href="/customer/help">
          <img src="/vector_next.svg" alt="next" className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}

/* ======================= API: Logout ======================= */
async function postLogout() {
  const res = await fetch("/api/User/logout", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
  });

  const raw = await res.text();
  let data: any = {};
  try {
    data = JSON.parse(raw);
  } catch {
    data = { message: raw };
  }
  return data;
}

function Block_logout({ onClick }: { onClick?: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className="h-[60px] w-[366px] bg-white rounded-full shadow-md mt-5 mb-3 
                 flex items-center justify-center px-6 cursor-pointer 
                 hover:shadow-lg transition"
    >
      <p className="text-center text-red-600 text-2xl">ออกจากระบบ</p>
    </div>
  );
}

/* ======================= Popup logout ======================= */
function Popup_logout({
  onCancel,
  onConfirm,
  busy,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative h-[164px] w-[366px] bg-white rounded-[30px] shadow-md p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg text-center mt-2">
          แน่ใจไหมว่าต้องการออกจากระบบ?
        </p>
        <div className="flex justify-center space-x-6 mt-5">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-6 py-2 rounded-full bg-white border-2 border-[#8B8B8B] 
                       font-medium shadow-md hover:bg-gray-100 transition text-xl"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`px-8 py-2 rounded-full bg-[#E6A88A] border-2 border-[#B55C32] 
                        font-medium shadow-md hover:brightness-95 transition text-xl 
                        ${busy ? "opacity-60" : ""}`}
          >
            {busy ? "กำลังออกจากระบบ..." : "ตกลง"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Background;
export {
  Header_profile,
  Block_listitem_profile,
  Block_logout,
  Block_profileuser,
  Popup_logout,
};
