"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";
import MapComponent from "@/app/components/MapComponent";

function Background() {
  const router = useRouter();

  return (
    <div className="bg-[#C5D4E8] min-h-screen w-full flex flex-col items-center pb-[140px]">
      {/* เนื้อหาหลัก */}
      <div className="w-full flex flex-col items-center px-6 mt-2">
        {/* ปุ่มย้อนกลับ */}
        <div className="w-full max-w-md flex items-center mt-2">
          <BackButton />
        </div>

        {/* หัวข้อ */}
        <div className="flex-1 text-center py-9">
        </div>

        {/* แผนที่ */}
        <div className="w-full max-w-md h-[700px] border-[1px] border-[#8B8B8B] rounded-2xl overflow-hidden">
          <MapComponent />
        </div>
      </div>
    </div>
  );
}

export default Background;
