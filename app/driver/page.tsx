'use client';
import Link from "next/link";
import Header from "../components/welcome";
import Navbar from "./components/navbar";
import { div } from "framer-motion/client";

export default function NotificationPage() {
    return (
        <div className="bg-theme-driver h-full overflow-hidden">
            <Header username="โมโมโกะ" role={1} />
            <Navbar />
        </div>


    );
}