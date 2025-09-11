"use client";

import RoleBar from "@/app/components/user_components";
import { BackButton } from "@/app/components/share_component";
import Link from "next/link";
type Gender = "male" | "female";

interface HeaderProps {
  username: string;
  role: number;
  gender?: Gender; 
}

function Background() {
  return (
    <div className="min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center">
      <Header_profile />
      <Block_profileuser username="เตา อั่งโล่" role={1} gender="female"/>
      <Block_listitem_profile coin={100} />
      <Block_logout />
    </div>
  );
}

const genderIconMap: Record<Gender, string> = {
  male: "/male.svg",
  female: "/female.svg",
};

function Header_profile() {
  return (
    <div className="flex flex-col items-center mt-8">
      <BackButton />
      <p className="text-[32px] font-bold text-shadow-md">โปรไฟล์</p>
    </div>
  );
}

function Block_profileuser({ username, role, gender = "male"}: HeaderProps) {
  return (
    <div className="h-[198px] w-[366px] bg-white rounded-[30px] shadow-md mt-7 flex flex-col justify-center">
      <div className="flex items-center">
        {/* Left: user avatar */}
        <img
          src="/user.svg"
          alt="user icon"
          className="h-[132px] w-[132px] rsounded-full object-cover ml-2"
        />

        {/* Middle */}
        <div className="flex flex-col ml-1 mr-2">
          {/* username + gender */}
          <div className="flex items-center">
            <p className="text-2xl mb-1">{username}</p>
            <img
              src={genderIconMap[gender] ?? "/male.svg"}
              alt={`${gender} icon`}
              className="h-7 w-7 ml-1"
            />
          </div>

          {/* role */}
          <div className="flex items-center mb-1">
            <RoleBar role={role} />
          </div>

          {/* email */}
          <p className="text-lg">6xxxxxxx@kmitl.ac.th</p>
        </div>

        {/* Right: next arrow */}
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

function Block_logout() {
  return (
    <div className="h-[60px] w-[366px] bg-white rounded-full shadow-md mt-5 mb-3 flex items-center justify-center px-6">
      <p className="text-center text-red-600 text-2xl">ออกจากระบบ</p>
    </div>
  );
}

export default Background;
export { Header_profile , Block_listitem_profile, Block_logout, Block_profileuser };
