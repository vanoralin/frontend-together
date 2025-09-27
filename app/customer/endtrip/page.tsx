"use client";

// import React, { useEffect } from "react";
import { useState } from "react";
import { BackButton } from "@/app/components/share_component";

function Background(){
    return(
        <div className="relative bg-gradient-to-b from-white to-[#C5DEDA] min-h-screen w-full pb-[120px]">
            <Header />
            <InfoTrip />
            <InfoDriver />
            <RatingStar />
            <ReviewDriver />
            <ReportTrip />
            <FinishTrip />
        </div>
    );
}

function Header() {
    return(
    <div className="flex flex-row">
        <BackButton />
        {/* ฝั่งซ้าย: ข้อความ */}
        <p className="text-[42px] font-bold text-shadow-lg items-center mt-15 ml-6">
            การเดินทาง<br />เสร็จสิ้น
        </p>

        {/* ฝั่งขวา: รูป */}
        <div className="flex items-center ml-auto mr-8 mt-15">
            <img
            src="/holdphone.png"
            alt="การเดินทางเสร็จสิ้น"
            className="h-[115px] w-[85px]"
            />
        </div>
    </div>
    );
}

function InfoTrip() {
    return(
        <div>
            <div className="flex flex-row justify-around mt-3">
                <p className="-ml-2.5 text-xl">ข้อมูลการเดินทาง</p>
                <div className="flex flex-row items-center gap-4">
                    <img src="/coin.svg" alt="coin" className="h-[30px] w-[30px]" />
                    <p className="text-xl">32 บาท</p>
                </div>
            </div>
            <div>
                <div className="flex mt-3 ml-6">
          <div className="flex flex-col items-center">
            <img
              src="/icon_pin.svg"
              alt="icon"
              className="h-[25px] w-[25px] object-cover mt-1"
            />
            <div className="h-7.5 border-l-2"></div>
            <img src="/icon_pin.svg" alt="icon" className="h-[25px] w-[25px] object-cover" />
          </div>

          <div className="ml-5 flex flex-col justify-between">
            <div className="flex items-center">
              <div className="h-[33px] w-[270px] bg-[#FFFFFF] rounded-2xl flex items-center px-3 shadow-md">
                <p className="ml-1">ฝั่งตรงข้ามเกกี4</p>
              </div>
            </div>
            <div className="flex items-center mt-5">
              <div className="h-[33px] w-[270px] bg-[#FFFFFF] rounded-2xl flex items-center px-3 shadow-md">
                <p className="ml-1">หน้าตึก ECC</p>
              </div>
            </div>
          </div>
        </div>
            </div>
        </div>
    );
}

function InfoDriver() {
    return (
        <div className="mt-6">
            <div className="flex flex-row">
                <p className="text-xl ml-6.5">ข้อมูลคนขับ</p>
            </div>
            <div className="flex flex-row items-start mt-3 m-5 bg-white border-2 border-gray-400 p-2 rounded-2xl h-auto shadow-md">
                <img src="/icon_car.svg" alt="driver" className="h-[35px] w-[35px] mt-1 justify-center ml-3" />
                <div className="ml-2">
                    {/* รถ + ป้ายทะเบียน */}
                    <div className="flex">
                        <p className="text-lg w-[70px] text-right">รถยนต์:</p>
                        <div>
                            <p className="text-lg ml-2">TOYOTA HAHA สีขาว</p>
                            <p className="text-lg ml-2">กข-555 บุรีรัมย์</p>
                        </div>
                    </div>
                    {/* คนขับ */}
                    <div className="flex mt-1">
                        <p className="text-lg w-[70px] text-right">คนขับ:</p>
                        <p className="text-lg text-orange-800 ml-2">นายโม คนหล่อเท่</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RatingStar() {
  const [rating, setRating] = useState(0);

  const handleClick = (star : number) => {
    if (rating === star) {
      setRating(0); // ถ้ากดซ้ำที่เดิม → ยกเลิก
    } else {
      setRating(star); // เลือกใหม่
    }
  };

  return (
    <div>
      <p className="text-xl font-medium text-center">ให้คะแนนคนขับ</p>
      <div className="flex flex-row justify-center mt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <img
            key={star}
            src={star <= rating ? "/star_filled.svg" : "/star.svg"}
            alt="star"
            className="h-[40px] w-[40px] mx-1 cursor-pointer"
            onClick={() => handleClick(star)}
          />
        ))}
      </div>
    </div>
  );
}


function ReviewDriver() {
  return (
    <div className="flex flex-col mt-6 w-full">
        <p className="text-xl mb-3 ml-6">รีวิวคนขับ</p>
        <div className="flex justify-center">
      <textarea
        className="w-11/12 h-24 rounded-[15px] border-2 border-gray-300 p-4 shadow-md bg-white placeholder-gray-400"
        placeholder="ข้อความรีวิวคนขับ"
      />
      </div>
    </div>
  );
}

function ReportTrip() {
  const [showInput, setShowInput] = useState(false);

  return (
    <div className="flex flex-col mt-2 w-full px-4.5">
      <label className="flex items-center cursor-pointer gap-3">
        <input
          type="checkbox"
          checked={showInput}
          onChange={() => setShowInput(!showInput)}
          className="w-4 h-4 border-2 border-gray-400 rounded-[10px] accent-[#B57452]"
        />
        <span className="text-lg mb-1">ต้องการรายงานทริปหรือไม่</span>
      </label>

      {showInput && (
        <textarea
          className="w- h-24 rounded-[15px] border-2 border-gray-300 p-4 shadow-md bg-white placeholder-gray-400"
          placeholder="กรอกรายละเอียดการรายงาน"
        />
      )}
    </div>
  );
}

function FinishTrip() {
    return (
        <div className="absolute w-full bottom-0">
            <div className="h-[120px] w-full shadow-md flex flex-col items-center justify-center">
                <button className="bg-[#E6A88A] h-[60px] w-80 text-black px-10 py-3 rounded-full hover:opacity-95 active:scale-[0.98] focus:outline-none focus:ring-0 cursor-pointer shadow-md text-center text-2xl font-medium border border-[#B55C32]">
                    บันทึก
                </button>
            </div>
        </div>
    );
}

export default Background;
export {Header, InfoTrip , InfoDriver, RatingStar, ReviewDriver, ReportTrip , FinishTrip};