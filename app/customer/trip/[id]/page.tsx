"use client";

import { useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { BackButton, Header, Popup } from "@/app/components/share_component";
import { LocationShowBox } from "@/app/components/trip_components";

interface TripDetail {
    id: number;
    pickup_location: { name: string; lat?: number; lng?: number };
    dropoff_location: { name: string; lat?: number; lng?: number };
    scheduled_start_time: string;
    seats: number;
    vehicle?: { vehicle_type?: string; model_vehicle?: string; license_plate?: string };
    driver?: { name?: string };
    passenger?: { name?: string };
    amount?: number;
    status: string;
    driver_profile_picture_url?: string;
}

interface PopupAction {
    label: string;
    variant?: "primary" | "secondary";
    onClick: () => void;
}

export default function TripDetailPage() {
    const pathname = usePathname();
    const router = useRouter();
    const idFromPath = pathname?.split("/").pop();
    const tripId = Number(idFromPath);

    const [trip, setTrip] = useState<TripDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [popupProps, setPopupProps] = useState<{
        title: string;
        description?: string;
        image?: ReactNode;
        actions: PopupAction[];
    } | null>(null);

    useEffect(() => {
        if (!tripId) return;

        const fetchTrip = async () => {
            try {
                const res = await axios.get("/api/reservations/history", {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                });


                const data = Array.isArray(res.data) ? res.data : [];
                const found = data.find((t: any) => t.id === tripId);
                if (found) {
                    setTrip({
                        id: found.id,
                        pickup_location: found.pickup_location,
                        dropoff_location: found.dropoff_location,
                        scheduled_start_time: found.scheduled_start_time,
                        seats: found.seats,
                        vehicle: found.vehicle,
                        driver: found.driver,
                        passenger: found.passenger,
                        amount: found.amount,
                        status: found.status,
                        driver_profile_picture_url: found.driver_profile_picture_url
                    });
                }
            } catch (err) {
                console.error("Error fetching trip:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrip();
    }, [tripId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">กำลังโหลดทริป...</p>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-gray-500">ไม่พบข้อมูลทริปนี้</p>
                <BackButton />
            </div>
        );
    }

    const cancelTrip = async () => {
        try {
            await axios.post(`/api/trips/cancel_reservation/${tripId}`);
            setPopupProps({
                title: "ยกเลิกการจองสำเร็จ",
                description: "คุณได้ยกเลิกการจองทริปนี้เรียบร้อยแล้ว",
                actions: [
                    {
                        label: "ตกลง",
                        variant: "primary",
                        onClick: () => {
                            setPopupProps(null);
                            router.back();
                        },
                    },
                ],
            });
        } catch (err: any) {
            setPopupProps({
                title: "ไม่สามารถยกเลิกทริปได้",
                description: err.response?.data?.message || "กรุณาลองใหม่อีกครั้ง",
                actions: [
                    { label: "ตกลง", variant: "primary", onClick: () => setPopupProps(null) },
                ],
            });
        }

    };

    const handleAction = (type: "cancel") => {
        if (type === "cancel") {
            setPopupProps({
                title: "ยกเลิกการจองทริป",
                description: "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองทริปนี้?",
                image: <img src="/alarm sign.svg" alt="cancel" className="w-20 h-auto" />,
                actions: [
                    { label: "ย้อนกลับ", variant: "secondary", onClick: () => setPopupProps(null) },
                    { label: "ยืนยัน", variant: "primary", onClick: cancelTrip },
                ],
            });
        }
    };

    const displayTime = (datetime: string) => {
        const d = new Date(datetime);
        const tzOffset = 7; // Thailand timezone (UTC+7)
        let hours = d.getUTCHours() + tzOffset;
        let dayOffset = 0;
        if (hours >= 24) {
            hours -= 24;
            dayOffset = 1;
        }
        const minutes = d.getUTCMinutes();
        const day = d.getUTCDate() + dayOffset;
        const month = d.getUTCMonth() + 1;
        const year = d.getFullYear();

        const displayDate = `${day.toString().padStart(2, "0")}/${month
            .toString()
            .padStart(2, "0")}/${year}`;
        const displayTime = `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;

        return `${displayDate}, ${displayTime} น.`;
    };

    const getVehicleTypeName = (type?: string) => {
        switch (type) {
            case "motorcycle":
                return "จักรยานยนต์";
            case "car":
                return "รถยนต์";
            case "suv":
                return "รถยนต์ขนาดใหญ่";
            default:
                return "ไม่ระบุประเภท";
        }
    };

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <BackButton />
            <h1 className="text-2xl font-medium text-center pt-12 pb-6">รายละเอียดการจอง</h1>
            <h1 className="font-medium text-xl m-4 ">การเดินทาง</h1>
            <div className="flex-1 overflow-auto mx-4 space-y-6">
                <div className="flex flex-col justify-between items-start">
                    <p>ออกเดินทาง: {displayTime(trip.scheduled_start_time)}</p>
                    <p>จำนวนคน: {trip.seats}</p>
                    <p>ประเภท: {getVehicleTypeName(trip.vehicle?.vehicle_type)}</p>

                </div>

                <div className="bg-white rounded-lg space-y-3 w-full max-w-md">
                    <LocationShowBox value={trip.pickup_location.name || ""} />
                    <LocationShowBox value={trip.dropoff_location.name || ""} />
                </div>


                <div className="flex gap-2 justify-end">
                    <p>ค่าโดยสาร</p>
                    <img src="/coin.svg" alt="" className="h-6" />
                    <p>{trip.amount}</p>
                </div>


                <h1 className="font-medium text-xl mb-4">คนขับ</h1>
                {trip.status === "pending_driver_confirmation" ? (
                    <p className="text-gray-600">กำลังรอการยืนยันจากคนขับ...</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center w-full">
                            <div className="flex gap-3 items-center">
                                <img
                                    src={trip.driver_profile_picture_url || "/null_profile.png"}
                                    alt=""
                                    className="w-12 h-12 rounded-full object-cover"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = "/null_profile.png";
                                    }}
                                />

                                <p>{trip.driver?.name || "ไม่ระบุคนขับ"}</p>
                            </div>
                            <div className="flex gap-2">
                                <img src="/icon_phone_bg.svg" alt="" className="w-8 h-8 object-contain" />
                                <img src="/icon_chat_bg.svg" alt="" className="w-8 h-8 object-contain" />
                            </div>
                        </div>

                        <div className="flex justify-between mt-3">
                            <div>
                                <p className="font-medium">
                                    ป้ายทะเบียน: {trip.vehicle?.license_plate || "ไม่ระบุ"}
                                </p>
                                <p>{trip.vehicle?.model_vehicle || ""}</p>
                            </div>
                            <img
                                src="/car.png"
                                alt="Car"
                                className="w-35 h-14 rounded-md object-cover"
                            />
                        </div>
                    </div>
                )}


                <div className="space-y-4 mt-12">
                    {/* ปุ่มยกเลิกทริป */}
                    <button
                        className="w-full bg-white text-theme-orange border-2 py-2 rounded-xl mt-2"
                        onClick={() => handleAction("cancel")}
                    >
                        ยกเลิกทริป
                    </button>

                    <p className="text-sm text-gray-500 mt-1">
                        กรุณายกเลิกก่อนเวลาออกเดินทางอย่างน้อย 30 นาที มิฉะนั้นจะถูกยึดเงินค่าเดินทางทั้งหมด
                    </p>
                </div>
            </div>

            {/* Popup */}
            {popupProps && (
                <Popup
                    title={popupProps.title}
                    description={popupProps.description}
                    image={popupProps.image}
                    actions={popupProps.actions}
                    onClose={() => setPopupProps(null)}
                />
            )}
        </div>
    );
}
