"use client";

import { useState } from "react";

function Background() {
  return (
    <div className="min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center">
        <Header_wallet />
        <Profile_wallet />
        <Topup />
        <History />
    </div>
  );
}

function Header_wallet() {
  return (
    <div className="flex flex-col items-center mt-8">
        <p className="text-[32px] font-bold">กระเป๋าเงิน</p>
    </div>
    );
}

function Profile_wallet() {
  return (
    <div className="h-[162px] w-[342px] bg-white rounded-[30px] shadow-md mt-8 p-4 flex items-center">
      {/* Avatar */}
      <img
        src="/user.svg"
        alt="icon"
        className="h-[110px] w-[110px] rounded-full object-cover ml-3"
      />

      {/* Right side (name + coin stacked vertically) */}
      <div className="flex flex-col ml-6">
        {/* Name */}
        <p className="text-2xl flex items-center font-medium">
          เตา อั่งโล่
          <img
            src="/male.svg"
            alt="male"
            className="h-7 w-7 inline-block ml-2"
          />
        </p>

        {/* Coin */}
        <div className="mt-3 h-[51px] w-[145px] bg-[rgba(181,91,50,0.8)] rounded-[20px] flex justify-center items-center">
          <img src="/coin.svg" alt="icon" className="h-6 w-6 mr-2" />
          <p className="text-2xl mb-1.5">100.00</p>
        </div>
      </div>
    </div>
  );
}

function Topup() {
    return (
        <div className="h-[51px] w-[339px] bg-white rounded-[30px] shadow-md mt-5 flex justify-center items-center">
            <p className="text-center text-2xl font-medium">เติมเงิน</p>
        </div>
    );
}

function History (){
    return (
        <div className="h-[82px] w-[366px]">
            <p className="text-2xl">ประวัติรายการ</p>
        </div>
    );
}

export default Background;
export { Header_wallet, Profile_wallet, Topup, History };