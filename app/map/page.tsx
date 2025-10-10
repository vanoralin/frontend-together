"use client"

import dynamic from "next/dynamic";
import { BackButton } from "@/app/components/share_component";
import { LocationSearchInput } from "@/app/components/trip_components";
import { useState } from "react";
import Navbar from "../customer/components/navbar";

const MapComponent = dynamic(() => import("../components/MapComponent"), {
    ssr: false,
});

export default function TripMapPage() {
    const [start, setStart] = useState("");
    return (
        <div className="relative w-full h-screen bg-theme-customer">
            <div className="fixed top-10 z-10 w-80 px-4 py-2">
                <LocationSearchInput
                    value={start}
                    onChange={setStart}
                    placeholder="ค้นหาหมุด"
                />
            </div>
            <MapComponent />
            <Navbar />

        </div>

    );
}