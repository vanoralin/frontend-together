"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";
import MapComponent from "@/app/components/MapComponent";

function LocationBox({
  value,
  onClear,
  showLine = false,
}: {
  value: string;
  onClear: () => void;
  showLine?: boolean;
}) {
  return (
    <div className="relative w-full flex items-center">
      <div className="relative z-20 flex-shrink-0 mr-2">
        <img
          src="/location.png"
          alt="location"
          className="w-7 h-7 object-contain"
        />
      </div>

      {showLine && (
        <div className="absolute left-[13px] top-[30px] bottom-[-20px] border-l-2 border-black z-0" />
      )}

      {/* กล่องข้อความ */}
      <div className="relative z-10 flex items-center justify-between bg-[#8B8B8B]/10 rounded-full px-4 py-1 w-full ">
        <span className="text-black text-base ml-1">{value}</span>
        <button
          onClick={onClear}
          className="text-gray-500 hover:text-red-500 text-3xl font-light flex items-center justify-center w-8 h-8 "
        >
          ×
        </button>
      </div>
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
  const router = useRouter();

  return (
    <div className="w-full flex flex-col items-center px-6 mt-2">
      {/* ปุ่มย้อนกลับ */}
      <div className="w-full max-w-md flex items-center mt-2">
        <BackButton />
      </div>

      {/* หัวข้อ */}
      <div className="flex-1 text-center py-9">
        <h1 className="text-lg text-black font-light">การจองทริปขาประจำ หน้า 1/3</h1>
        <p className="text-xl font-regular text-black">เลือกจุดรับส่ง</p>
      </div>

      {/* กล่องจุดรับส่ง */}
      <div className="w-full max-w-md bg-white font-light rounded-2xl p-4 shadow-md shadow-black/50 mb-4">
        <div className="flex flex-col gap-3 relative">
          <LocationBox value={location1} onClear={clearLocation1} showLine />
          <LocationBox value={location2} onClear={clearLocation2} />
        </div>
      </div>

      {/* แผนที่ */}
      <div className="w-full max-w-md h-[450px] border-[1px] border-[#8B8B8B] rounded-2xl overflow-hidden">
        <MapComponent />
      </div>

      {/* ปุ่มถัดไป */}
      <div className="mt-4 w-full max-w-md">
        <button
          onClick={() => router.push("/driver/booking/regular/packet2")}
          className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl shadow-md hover:bg-[#d9956f] transition-colors duration-200"
        >
          ขั้นตอนถัดไป
        </button>
      </div>
    </div>
  );
}

export default Background;
export { Header };
