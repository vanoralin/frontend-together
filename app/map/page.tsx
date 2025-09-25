"use client"

import dynamic from "next/dynamic";
import { BackButton } from "@/app/components/share_component";

const MapComponent = dynamic(() => import("../components/MapComponent"), {
    ssr: false,
});

export default function TripMapPage() {
    return (
        <div className="relative w-full h-screen bg-theme-customer">
            <BackButton />
            <MapComponent />

        </div>

    );
}