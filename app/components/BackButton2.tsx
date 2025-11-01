"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import React from "react";

interface BackButton2Props {
  onBack?: () => void;
  label?: string;
}

export const BackButton2: React.FC<BackButton2Props> = ({ onBack, label = "ย้อนกลับ" }) => {
  const router = useRouter();

  const handleClick = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
        <button
            onClick={handleClick}
            className="absolute top-10 left-2 z-50 p-2 hover:cursor-pointer"
        >
            <img src="/icon_back_arrow.svg" alt="ย้อนกลับ" className="w-10" />
        </button>
    );
};
