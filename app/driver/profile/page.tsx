"use client";

import RoleBar from "@/app/components/user_components";
import { BackButton } from "@/app/components/share_component";
import Link from "next/link";
import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/navbar";

type Gender = "male" | "female";

interface HeaderProps {
  username: string;
  role: number;
  gender?: Gender;
  email?: string;
}

function Background() {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const router = useRouter();

  const openLogout = useCallback(() => setIsLogoutOpen(true), []);
  const closeLogout = useCallback(() => setIsLogoutOpen(false), []);

  return (
    <div className="relative min-h-screen w-full bg-[#C5D4E8] flex flex-col items-center overflow-y-scroll">
      <Header_profile />
      <Block_profileuser username="โรส แมรี่" role={1} gender="female"  email="66010001@kmtil.ac.th"/>
      <Block_Driver_info />
      <Block_listitem_profile coin={900} />
      <Block_logout onClick={openLogout} />

      {isLogoutOpen && (
        <Popup_logout
          onCancel={closeLogout}
          onConfirm={() => {
            closeLogout();
            // TODO: ใส่ logic logout จริง เช่น clear token, call API
            router.replace("/customer/login");
          }}
        />
      )}
      <div className="mb-20"></div>
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
    <div className="flex flex-col items-center">
      <BackButton />
      <p className="text-[32px] font-bold text-shadow-lg mt-10.5">โปรไฟล์</p>
    </div>
  );
}

function Block_profileuser({ username, role, gender = "male",email }: HeaderProps) {
  return (
    <div className="h-[198px] w-[366px] bg-white rounded-[30px] shadow-md mt-7 flex flex-col justify-center">
      <div className="flex items-center">
        <img
          src="/user.svg"
          alt="user icon"
          className="h-[132px] w-[132px] rounded-full object-cover ml-2"
        />
        <div className="flex flex-col ml-1">
          <div className="flex items-center">
            <p className="text-xl mb-1">{username}</p>
            <img
              src={genderIconMap[gender] ?? "/male.svg"}
              alt={`${gender} icon`}
              className="h-7 w-7 ml-1"
            />
          </div>
          <div className="flex items-center mb-1 w-40 h-13">
            <RoleBar role={role} />
          </div>
          <p className="text-base">{email}</p>
        </div>
        <img src="/vector_next.svg" alt="next" className="h-5 w-5 ml-3" />
      </div>   
    </div>
  );
}

function Block_Driver_info() {
    return (
    <div>
      <Link href="/driver/driver_info">
      <div className="h-[82px] w-[366px] bg-white rounded-[20px] shadow-md mt-5 flex items-center px-4">
        <p className="text-xl">ข้อมูลคนขับ,ยานพาหนะ</p>
        <img src="/vector_next.svg" alt="next" className="h-5 w-5 ml-auto" />
      </div>
      </Link>
    </div>
  );
}

interface ListItemProps {
  coin: number;
}

function Block_listitem_profile({ coin }: ListItemProps) {
  return (
    <div>
      <Link href="/driver/wallet">
        <div className="h-[82px] w-[366px] bg-white rounded-t-[20px] shadow-md mt-5 flex items-center px-4">
          <p className="text-xl">กระเป๋าเงิน</p>
          <div className="ml-10 h-[51px] w-[145px] bg-[rgba(181,91,50,0.8)] rounded-[20px] flex justify-center items-center">
            <img src="/coin.svg" alt="coin icon" className="h-6 w-6 mr-2" />
            <p className="text-xl">{coin.toFixed(2)}</p>
          </div>
          <img src="/vector_next.svg" alt="next" className="h-5 w-5 ml-auto" />
        </div>
      </Link>
      <div className="h-[82px] w-[366px] bg-white shadow-md mt-1 flex items-center px-4">
        <p className="text-xl">ทริปขาประจำ</p>
        <img src="/vector_next.svg" alt="next" className="h-5 w-5 ml-auto" />
      </div>
      <Link href="/driver/history_page">
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
      className="h-[60px] w-[366px] bg-white rounded-full shadow-md mt-5 mb-5 flex items-center justify-center px-6 cursor-pointer hover:shadow-lg transition"
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
export { Header_profile, Block_listitem_profile, Block_logout, Block_profileuser, Popup_logout, Block_Driver_info };