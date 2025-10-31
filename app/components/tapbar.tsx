"use client";
import React from "react";
import { BackButton } from "@/app/components/share_component";
import MapComponent from "@/app/components/MapComponent";

// กล่อง Location พร้อมไอคอนและปุ่มลบ
function LocationBox({ value, onClear }: { value: string; onClear: () => void }) {
  return (
    <div className="w-full flex items-center justify-between rounded-2xl px-4 py-3 bg-white mb-2">
      <div className="flex items-center gap-2">
        <img src="/public/location.png" alt="Location" className="w-5 h-5" />
        <span className="text-black">{value}</span>
      </div>
      <button
        className="text-gray-500 hover:text-red-500 font-bold"
        onClick={onClear}
      >
        ✕
      </button>
    </div>
  );
}

function Background() {
  const [location1, setLocation1] = React.useState("ฝั่งตรงข้ามเกกี 4");
  const [location2, setLocation2] = React.useState("หน้าตึก ECC");

  return (
    <div className="bg-[#C5D4E8] min-h-screen w-full flex flex-col items-center pb-[140px]">
      <Header
        location1={location1}
        location2={location2}
        clearLocation1={() => setLocation1("")}
        clearLocation2={() => setLocation2("")}
      />
    </div>
  );
}

function Header({
  location1,
  location2,
  clearLocation1,
  clearLocation2,
}: {
  location1: string;
  location2: string;
  clearLocation1: () => void;
  clearLocation2: () => void;
}) {
  return (
    <div className="w-full flex flex-col items-center px-6 mt-2">
      {/* Title */}
      <div className="flex-1 text-center py-12">
        <h1 className="text-xl font-regular text-black">การจองทริปขาประจำ หน้า 1/3</h1>
        <p className="text-lg font-semibold text-black">เลือกจุดรับส่ง</p>
      </div>

      {/* BackButton */}
      <div className="w-full max-w-3xl flex items-center px-2 my-1">
        <BackButton />
      </div>

      {/* กล่อง Location ทั้งสองอยู่ในกรอบสีเทา */}
      <div className="w-full max-w-3xl border-2 border-gray-400 rounded-xl p-4 flex flex-col gap-2 bg-gray-100 mt-2">
        <LocationBox value={location1} onClear={clearLocation1} />
        <LocationBox value={location2} onClear={clearLocation2} />
      </div>

      {/* Map */}
      <div className="w-full max-w-3xl h-[450px] border-2 border-gray-400 rounded-xl overflow-hidden mt-4">
        <MapComponent />
      </div>

      {/* ปุ่มยืนยัน */}
      <div className="mt-4 w-full max-w-3xl px-2">
        <button
          className="w-full bg-[#B55C32] text-white font-regular py-3 rounded-3xl shadow-lg hover:bg-[#944724]"
          onClick={() => {}}
        >
          ขั้นตอนถัดไป
        </button>
      </div>
    </div>
  );
}

export default Background;
export { Header };
