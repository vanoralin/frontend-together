"use client";

import dynamic from "next/dynamic";
//import BottomSheet from "../components/BottomSheet";
import router from "next/router";
import { BackButton } from "@/app/components/share_component";
import { LocationShowBox } from "@/app/components/trip_components";

export function BottomSheet(){
    return(
        <div className="fixed bottom-0 bg-white h-36 w-[390px] z-50">
            <h1 className="font-medium">จุดหมายถัดไป</h1>
            <LocationShowBox value="exx"/>
            <p>รับผู้โดยสาร: 3 คน</p>
            <p>คาดว่าจะไปถึงใน 12:43</p>
        </div>
    );
}
const MapComponent = dynamic(() => import("../../components/MapComponent"), {
    ssr: false,
});

export default function TripMapPage() {
    return (
        <div className="relative w-full h-screen overflow-clip bg-theme-customer">
            <BackButton />
            <BottomSheet/>
            <MapComponent />


        </div>

    );
}
