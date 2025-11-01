"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { LocationShowBox, VehicleType } from "@/app/components/trip_components";
import { Popup } from "@/app/components/share_component";

interface TripDetail {
    pickup_location: { name: string };
    dropoff_location: { name: string };
    scheduled_start_time: string;
    seats: number;
    vehicle?: { vehicle_type?: string; model_vehicle?: string; license_plate?: string };
    driver?: { name?: string };
    passenger?: { name?: string };
    driver_profile_picture_url?: string;
    amount?: number;
}

interface BottomSheetProps {
    trip: TripDetail;
    type?: "page" | "map";
    children?: React.ReactNode;
    showtext?: string;
}

export default function BottomSheet({ trip, type = "map", children, showtext }: BottomSheetProps) {
    const [expanded, setExpanded] = useState(true);

    const content = (
        <div className="p-4">
            {type === "map" && (
                <div className="flex flex-col justify-between items-start">
                    <p className="font-medium text-xl">{showtext}</p>
                    <p>
                        เวลาเริ่ม:{" "}
                        {new Date(trip.scheduled_start_time).toLocaleString("th-TH", { hour12: false })}
                    </p>
                </div>
            )}

            <div className="flex justify-between mt-3">
                <div>
                    <p className="font-medium">{trip.vehicle?.license_plate || "ไม่ระบุ"}</p>
                    <p>{trip.vehicle?.model_vehicle || ""}</p>
                    <VehicleType
                        type={trip.vehicle?.vehicle_type || ""}
                        className="text-sm"
                    />
                </div>
                <img src={`/example_${trip.vehicle?.vehicle_type}.png`} alt="veh pic" className="w-35 rounded-md object-cover" />
            </div>

            <div className="flex justify-between items-center mt-4 border-y py-3 border-gray-300 w-full">
                <div className="flex gap-3 items-center">
                    <img
                        src={trip.driver_profile_picture_url || "/null_profile.png"}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/null_profile.png";
                        }}
                    />
                    <div>
                        <p>{trip.driver?.name || "ไม่ระบุคนขับ"}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <img src="/icon_phone_bg.svg" alt="" className="w-8 h-8 object-contain" />
                    <img src="/icon_chat_bg.svg" alt="" className="w-8 h-8 object-contain" />
                </div>
            </div>

            <div className="mt-4 space-y-3 pt-2 text-sm">
                {/* 🔹 แสดง children ก่อน "รายละเอียด" ถ้าย่อ */}
                {!expanded && children}

                <div className="flex justify-between">
                    <h1 className="font-medium text-xl">รายละเอียด</h1>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            {trip.seats}
                            <img
                                src="/icon_nav_profile.svg"
                                alt="profile"
                                className="w-6 h-6 object-contain"
                                style={{ filter: "brightness(0) invert(50%)" }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg space-y-3 mt-6 w-full max-w-md mb-10">
                    <LocationShowBox value={trip.pickup_location.name || ""} />
                    <LocationShowBox value={trip.dropoff_location.name || ""} />
                </div>

                {/* 🔹 แสดง children หลังสุด ถ้าเต็ม */}
                {expanded && children}
            </div>
        </div>
    );


    return (
        <>
            {type === "page" ? (
                <motion.div
                    className="bg-white shadow-lg overflow-auto w-full h-full rounded-none"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {content}
                </motion.div>
            ) : (
                <motion.div
                    className="absolute left-0 right-0 bottom-0 bg-white shadow-lg rounded-t-2xl overflow-hidden"
                    animate={{ height: expanded ? "70vh" : "40vh" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <div
                        className="w-12 h-1.5 bg-theme-light-gray rounded-full mx-auto mt-2 mb-2 cursor-pointer"
                        onClick={() => setExpanded(!expanded)}
                    />
                    {content}
                </motion.div>
            )}
        </>
    );
}
