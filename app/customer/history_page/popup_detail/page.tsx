"use client";

import { useState } from "react";

function Background() {
  return (
    <div className="min-h-screen w-full bg-[#8A9694] flex flex-col items-center">
        <Popup_detail />
    </div>
  );
}

function Popup_detail() {
  return (
    <div className="w-[390px] h-[702px] bg-[#EFEFEF] rounded-t-[50px] mt-20 border-b-5 border-[#D9D9D9] flex flex-col items-center overflow-y-auto relative">
      <img src="/x.svg" alt="Close" className="h-[35px] w-[35px] absolute mt-4 right-4" />
      <Block_history />
      <div className="flex items-center mt-6">
        <div className="flex-grow border-t-2 border-[#8B8B8B] w-[90px]"></div>
        <p className="mx-3 text-base whitespace-nowrap">รายละเอียดการเดินทาง</p>
        <div className="flex-grow border-t-2 border-[#8B8B8B] w-[90px]"></div>
    </div>
    <div>
      <Profile_driver />
      </div>
      <div>
      <Detail />
      </div>
        <img src="/car_popup_detail.svg" alt="Map" className="mt-3 mb-3" />
    </div>
  );
}

function Block_history() {
  return (
    <div className="h-[139px] w-[366px] bg-white rounded-[30px] shadow-md mt-15 p-3">
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
  );
}

function Profile_driver() {
    return (
        <div className="h-[105px] w-[363px] bg-white rounded-[30px] shadow-md mt-6 flex items-center px-4">
            <img
                src="/user.svg"
                alt="icon"
                className="h-16 w-16 rounded-full object-cover mb-3.5"
            />

            <div className="ml-5 flex flex-col self-start mt-4">
                <p className="text-base">
                    โรส แมรี่
                    <img
                        src="/female.svg"
                        alt="icon"
                        className="h-4 w-4 inline-block ml-2 mb-1"
                    />
                </p>
                <p className="text-base mt-1.5">คนขับ</p>
            </div>

            <div className="ml-auto flex flex-col text-left self-start mt-4">
                <p className="text-base">Toyota Camry, ดำ</p>
                <p className="text-base mt-1.5">
                    4ขอ 3500 <br />
                    ประจวบคีรีขันธ์
                </p>
            </div>
        </div>
    );
}

function Detail(){
  return (
    <div className="w-[363px] h-[400px] bg-white rounded-[30px] shadow-md mt-6 p-6">
      <h2 className="text-lg font-semibold">รายละเอียดการเดินทาง</h2>
      <p className="mt-2">ข้อมูลเพิ่มเติมเกี่ยวกับการเดินทาง</p>
    </div>
  );
}
export default Background;
export { Popup_detail, Block_history, Profile_driver, Detail   };
