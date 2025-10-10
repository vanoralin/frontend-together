"use client";

import Link from "next/link";
import { useState } from "react";
// import { Menu, X } from "lucide-react";

import { useRouter } from "next/navigation";
import React from "react";

interface BackButtonProps {
  href?: string; // 🆕 ให้ส่ง path ได้ ถ้าไม่ส่งจะใช้ router.back()
  className?: string;
}

export function BackButton({ href, className }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href); // ไป path ที่กำหนด
    } else {
      router.back(); // ย้อนกลับถ้าไม่กำหนด path
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`absolute top-[30px] left[5px] z-50 p-2 ${className ?? ""}`}
    >
      <img src="/icon_back_arrow.svg" alt="ย้อนกลับ" className="w-10" />
    </button>
  );
}




