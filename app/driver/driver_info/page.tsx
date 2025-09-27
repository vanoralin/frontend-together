"use client";
import React from "react";
import { BackButton } from "@/app/components/share_component";
import Link from "next/link";

function Background() {
  return (
    <div className="bg-[#C5D4E8] min-h-screen w-full flex flex-col items-center pb-[140px]">
        <Header />
    </div>
  );
}
function Header() {
    return(
    <div className="flex flex-col items-center">
        <p></p>
    </div>
    );
}
    
export default Background;
export {Header};