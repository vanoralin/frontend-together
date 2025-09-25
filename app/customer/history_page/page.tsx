"use client";

import { useState } from "react";

import Link from "next/link";

function Background() {
  return (
    <div className="min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center">
      <Header_history />
      <Block_history />
      <Block_history />
      <Block_history />
      <Block_history />
      <Block_history />
    </div>
  );
}

function Header_history() {
  return (
    <div className="flex flex-col items-center font-playpen">
      <h1 className="text-[32px] font-bold mt-2">ประวัติการเดินทาง</h1>
    </div>
  );
}

function Block_history() {
  return (
    <Link href="/customer/history_page/popup_detail" className="block cursor-pointer">
    <div className="h-[139px] w-[366px] bg-white rounded-[30px] shadow-md mt-5 p-3">
    <div className="flex mt-1 mb-1">
      <div className="flex flex-col items-center">
        <img src="/mood_notdot.svg" alt="icon" className="h-[25px] w-[25px] object-cover mt-1" />
        <div className="h-7 border-l-2 border-dashed border-gray-400"></div>
        <img src="/mood.svg" alt="icon" className="h-[25px] w-[25px] object-cover" />
    </div>


    <div className="ml-2 flex flex-col justify-between">
      <div className="flex items-center">
        <div className="h-[33px] w-[219px] bg-[rgba(139,139,139,0.15)] rounded-2xl flex items-center px-3">
          <p className="ml-1">ฝั่งตรงข้ามเกกี4</p>
        </div>
        <div className="h-[33px] w-[90px] bg-[rgba(181,91,50,0.8)] rounded-[15px] flex justify-center items-center ml-1.5">
          <img src="/coin.svg" alt="icon" className="h-5 w-5 mr-1" />
          <p className="text-[17px]">100.00</p>
        </div>
      </div>


      <div className="flex items-center mt-5">
        <div className="h-[33px] w-[219px] bg-[rgba(139,139,139,0.15)] rounded-2xl flex items-center px-3">
          <p className="ml-1">หน้าตึก ECC</p>
        </div>
        <div className="h-[33px] w-[90px] bg-white rounded-[15px] border-gray-600 border-1 flex justify-center items-center ml-1.5">
          <p className="text-[17px]">3</p>
          <img src="/human.svg" alt="icon" className="h-5 w-5 ml-1" />
        </div>
      </div>
    </div>
  </div>

  <div className="flex mt-2 mb-2">
    <img src="/calendar.svg" className="h-5 w-5 ml-1" />
    <p className="ml-2 text-sm text-gray-500">12/12/2023</p>
  </div>
</div>
</Link>
  );
}

export default Background;
export { Header_history, Block_history };