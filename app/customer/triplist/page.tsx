"use client";

import Navbar from "../components/navbar";

import Link from "next/link";




export default function Home() {
    return (

        <div className="bg-theme-customer h-full overflow-hidden">
                <h1 className="text-2xl font-medium">รายการทริปปกติของฉัน</h1>
            <Navbar />

        </div>
    );
}
