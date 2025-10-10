"use client";

import RoleBar from "@/app/components/user_components";
import { BackButton } from "@/app/components/share_component";
import Link from "next/link";
import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { head } from "axios";

type Gender = "male" | "female";

interface HeaderProps {
  name: string;
  role: number;
  gender?: Gender;
  email: string;
  profile_picture?: string;
}

interface ProfileData {
  name: string;
  role: number;
  gender?: Gender;
  email: string;
  balance: number;
  profile_picture?: string;
}


function Background() {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const openLogout = useCallback(() => setIsLogoutOpen(true), []);
  const closeLogout = useCallback(() => setIsLogoutOpen(false), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<ProfileData>("/api/User/profile", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Profile data:", res.data);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        router.replace("/customer/login");
      }
    };
    fetchData();
  }, [router]); 

  const handleLogoutConfirm = useCallback(async () => {
    console.log("[Background] Confirm logout clicked");
    setBusy(true);
    try {
      const out = await postLogout();
      // alert(out?.message || "ออกจากระบบสำเร็จ");
    } catch (err: any) {
      console.warn("[Background] logout error:", err?.message);
      alert("เกิดข้อผิดพลาดในการออกจากระบบ");
    } finally {
      // localStorage.removeItem("topupAmount");
      // localStorage.removeItem("topupMessage");
      // localStorage.removeItem("topupQrBase64");
      // localStorage.removeItem("topupTxId");

      setBusy(false);
      closeLogout();
      router.replace("/customer/login");
    }
  }, [router, closeLogout]);
  return (
    <div className="relative min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center">
      <Header_profile />
      {profile ? (
        <>
          <Block_profileuser profile_picture={profile.profile_picture} name={profile.name} role={profile.role} gender={profile.gender} email={profile.email} />
          <Block_listitem_profile coin={profile.balance} />
        </>
      ) : (
        <div className="h-[198px] w-[366px] rounded-[30px] mt-7 flex items-center justify-center">
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

function Block_profileuser({ profile_picture,name, role, gender = "male", email }: HeaderProps) {
  return (
    <div className="h-[198px] w-[366px] bg-white rounded-[30px] shadow-md mt-7 flex flex-col justify-center">
      <div className="flex items-center">
        <img
          src={profile_picture && profile_picture.trim() !== "" ? profile_picture : "/user.svg"}
          alt="user icon"
          className="h-[125px] w-[125px] rounded-full object-cover"
        />
        <div className="flex flex-col ml-1 mr-1">
          <div className="flex items-center">
        <p className="text-2xl mb-1">{name}</p>
        <img
          src={genderIconMap[gender] ?? "/male.svg"}
          alt={`${gender} icon`}
          className="h-7 w-7 ml-1"
        />
          </div>
          <div className="flex items-center mb-1">
        <RoleBar role={role} />
          </div>
          <p className="text-lg">{email}</p>
        </div>
        <img src="/vector_next.svg" alt="next" className="h-6 w-6 mr-2" />
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
        <div className="h-[82px] w-[366px] bg-white rounded-t-[20px] shadow-md mt-5 flex items-center px-4">
          <p className="text-2xl">กระเป๋าเงิน</p>
          <div className="ml-10 h-[51px] w-[145px] bg-[rgba(181,91,50,0.8)] rounded-[20px] flex justify-center items-center">
            <img src="/coin.svg" alt="coin icon" className="h-6 w-6 mr-2" />
            <p className="text-2xl">{coin.toFixed(2)}</p>
          </div>
          <img src="/vector_next.svg" alt="next" className="h-6 w-6 ml-auto" />
        </div>
      </Link>
      <div className="h-[82px] w-[366px] bg-white shadow-md mt-1 flex items-center px-4">
        <p className="text-2xl">ทริปขาประจำ</p>
        <img src="/vector_next.svg" alt="next" className="h-6 w-6 ml-auto" />
      </div>
      <Link href="/customer/history_page">
        <div className="h-[82px] w-[366px] bg-white shadow-md mt-1 flex items-center px-4">
          <p className="text-2xl">ประวัติการเดินทาง</p>
          <img src="/vector_next.svg" alt="next" className="h-6 w-6 ml-auto" />
        </div>
      </Link>
      <div className="h-[82px] w-[366px] bg-white rounded-b-[20px] shadow-md mt-1 flex items-center px-4">
        <p className="text-2xl">แจ้งปัญหา</p>
        <img src="/help.svg" alt="help" className="h-6 w-6 ml-2" />
        <img src="/vector_next.svg" alt="next" className="h-6 w-6 ml-auto" />
      </div>
    </div>
  );
}
async function postLogout() {
  console.log("[postLogout] start");
  const res = await fetch("/api/User/logout", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
  });

  const raw = await res.text();
  console.log("[postLogout] status:", res.status, "raw:", raw);

  let data: any = {};
  try {
    data = JSON.parse(raw);
  } catch {
    data = { message: raw };
  }

  // if (!res.ok) throw new Error(data?.message || "Logout failed");
  // console.log("[postLogout] success:", data?.message);
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
export { Header_profile, Block_listitem_profile, Block_logout, Block_profileuser, Popup_logout };