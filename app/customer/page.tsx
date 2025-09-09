"use client";

import Header from "../components/welcome";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <Header username="โมโมโกะ" role={0} />
        </div>
    );
}

