"use client";

import Link from "next/link";
import { useState } from "react";
// import { Menu, X } from "lucide-react";

import { useRouter } from "next/navigation";

export function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="absolute top-10 left-2 z-50 p-2"
        >
            <img src="/icon_back_arrow.svg" alt="ย้อนกลับ" className="w-10" />
        </button>
    );
}




