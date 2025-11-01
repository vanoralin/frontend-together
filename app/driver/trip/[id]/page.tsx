'use client';

import { useState, useEffect, ReactNode } from 'react';
import { CardTrip, PinName, PinPath } from '@/app/components/trip_components';
import { BackButton, Header, Popup } from '@/app/components/share_component';
import React from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Reservation {
    id: number;
    seats: number;
    status: string;
    passenger: { id: number; name: string; email: string };
    pickup_location_id: number;
    dropoff_location_id: number;

}

interface Location {
    id: number;
    name: string;
}

interface TripData {
    id: number;
    driver: { id: number; name: string; email: string };
    path: { id: number; name: string; locations: Location[] };
    driver_vehicle?: { vehicle_type: string; model_vehicle?: string; license_plate?: string; seats?: number };
    amount: number;
    status: string;
    capacity?: number;
    scheduled_start_time: string;
    reservations?: Reservation[];
    passenger_profile_picture_url?: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

interface PopupAction {
    label: string;
    variant?: "primary" | "secondary";
    onClick: () => void;
}

export default function ViewTripPage({ params }: PageProps) {
    const router = useRouter();
    const { id: tripId } = React.use(params);
    const [trip, setTrip] = useState<TripData | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState<number | null>(null);

    const [popupProps, setPopupProps] = useState<{
        title: string;
        description?: string;
        image?: ReactNode;
        actions: PopupAction[];
    } | null>(null);

    const fetchTrip = async () => {
        try {
            const res = await axios.get<TripData>(`/api/trips/view/${tripId}`);
            setTrip(res.data);
        } catch (err) {
            console.error('Error fetching trip:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrip();
    }, [tripId]);

    const handleConfirm = async (reservationId: number) => {
        setConfirming(reservationId);
        try {
            await axios.post(`/api/trips/reservations/${reservationId}/confirm`, { action: "confirm" });
            await fetchTrip();
        } catch (err) {
            console.error('Error confirming reservation:', err);
        } finally {
            setConfirming(null);
        }
    };

    const [processing, setProcessing] = useState<string | null>(null);

    const cancelTrip = async () => {
        try {
            await axios.post(
                `/api/trips/cancel/${tripId}`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            setPopupProps({
                title: "ยกเลิกทริปสำเร็จ",
                description: "คุณได้ยกเลิกทริปนี้เรียบร้อยแล้ว",
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
                    { label: "ตกลง", variant: "primary", onClick: () => { setPopupProps(null); router.back(); } },
                ],
            });
        }

    };

    const handleAction = (type: string) => {
        if (type === "cancel") {
            setPopupProps({
                title: "ยกเลิกทริป",
                description: "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกทริปนี้?",
                image: <img src="/alarm sign.svg" alt="cancel" className="w-20 h-auto" />,
                actions: [
                    { label: "ย้อนกลับ", variant: "secondary", onClick: () => setPopupProps(null) },
                    { label: "ยืนยัน", variant: "primary", onClick: cancelTrip },
                ],
            });
        }
        else if (type === "start") {
            handleStartTrip();
        }
    };
    // const handleCancelTrip = async () => {
    //     if (!tripId) return;
    //     if (!confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกทริปนี้?')) return;
    //     setProcessing('cancel');
    //     try {
    //         await axios.post(
    //             `/api/trips/cancel/${tripId}`,
    //             {},
    //             {
    //                 withCredentials: true,
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //             }
    //         );
    //         await fetchTrip();
    //     } catch (err) {
    //         console.error('Error cancelling trip:', err);
    //     } finally {
    //         setProcessing(null);
    //     }
    // };

    const handleStartTrip = async () => {
        if (!tripId) return;
        setProcessing('start');
        try {
            await axios.post(`/api/trips/start/${tripId}`);
            setPopupProps({
                title: "เริ่มต้นการเดินทางสำเร็จ",
                description: "คุณได้เริ่มต้นทริปนี้เรียบร้อยแล้ว",
                actions: [
                    {
                        label: "ตกลง",
                        variant: "primary",
                        onClick: () => {
                            setPopupProps(null);
                            router.push(`../tripmap/${tripId}`);
                        },
                    },
                ],
            });
        } catch (err: any) {
            console.error('Error starting trip:', err);
            setPopupProps({
                title: "ไม่สามารถเริ่มต้นทริปได้",
                description: err.response?.data?.message || "กรุณาลองใหม่อีกครั้ง",
                actions: [
                    { label: "ตกลง", variant: "primary", onClick: () => setPopupProps(null) },
                ],
            });
        } finally {
            setProcessing(null);
        }
    };


    if (loading) return <p className="p-4">กำลังโหลดข้อมูล...</p>;
    if (!trip) return <p className="p-4">ไม่พบข้อมูลทริป</p>;

    const pickup = trip.path.locations[0]?.name || '-';
    const dropoff = trip.path.locations[trip.path.locations.length - 1]?.name || '-';
    const currentPassengers = trip.reservations?.reduce((acc, r) => acc + (r.seats || 0), 0) || 0;

    // สร้าง map ของ locations
    const locationMap: Record<number, string> = {};
    trip.path.locations.forEach(loc => {
        locationMap[loc.id] = loc.name;
    });

    const pendingReservations =
        trip.reservations?.filter(r => r.status?.trim() === 'pending_driver_confirmation') || [];
    const confirmedReservations =
        trip.reservations?.filter(r => r.status?.trim() === 'confirmed') || [];

    return (
        <div className="min-h-screen bg-theme-driver px-4 pb-20">
            <BackButton />
            <h1 className="text-2xl font-medium text-center pt-12 pb-6">รายละเอียดทริป</h1>

            <CardTrip
                datetime={trip.scheduled_start_time}

                people={trip.reservations?.reduce(
                    (acc, r) => acc + ((r.status === "confirmed") ? r.seats : 0),
                    0
                ) || 0}
                pickup={pickup}
                dropoff={dropoff}
                vehicle={trip.driver_vehicle?.vehicle_type || '-'}
                model_vehicle={trip.driver_vehicle?.model_vehicle || '-'}
                license_plate={trip.driver_vehicle?.license_plate || '-'}
                status={trip.status === 'available' ? 'ยังว่าง' : 'เต็มแล้ว'}
                price={trip.amount}
                tripType="normal"
                mode="status"
            />



            <div className="mt-4 bg-white p-4 rounded-xl shadow-md">
                <h2 className="font-semibold mb-2">เส้นทางที่ขับผ่าน</h2>
                <ol className="list-decimal list-inside space-y-1">
                    {trip.path.locations.map((loc, index) => (
                        <li key={index}>{loc.name}</li>
                    ))}
                </ol>
            </div>
            {/* Confirmed */}
            {confirmedReservations.length > 0 && (
                <div className="mt-4 bg-white p-4 rounded-xl shadow-md">
                    <h2 className="font-semibold mb-2">ผู้โดยสาร</h2>
                    <ul className="space-y-2">
                        {confirmedReservations.map(r => (
                            <li key={r.id} className="border p-2 rounded-xl">
                                <PinPath from={locationMap[r.pickup_location_id]} to={locationMap[r.dropoff_location_id]} />
                                <p className="">ผู้โดยสาร: {r.passenger.name}</p>
                                <p className='text-theme-gray'>จำนวนที่นั่ง: {r.seats}</p>

                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {/* Pending */}
            {pendingReservations.length > 0 && (
                <div className="mt-4 bg-white p-4 rounded-xl shadow-md">
                    <h2 className="font-semibold mb-2">รอการยืนยันจากคนขับ</h2>
                    <ul className="space-y-2">
                        {pendingReservations.map(r => (
                            <li key={r.id} className="border p-2 rounded-xl flex justify-between items-center">
                                <div>
                                    <PinPath from={locationMap[r.pickup_location_id]} to={locationMap[r.dropoff_location_id]} />
                                    <p className="">ผู้โดยสาร: {r.passenger.name}</p>
                                    <p className='text-theme-gray'>จำนวนที่นั่ง: {r.seats}</p>


                                </div>
                                <button
                                    onClick={() => handleConfirm(r.id)}
                                    disabled={confirming === r.id}
                                    className="px-3 py-1 bg-theme-second-orange border-theme-orange border-2 text-theme-black rounded-full"
                                >
                                    {confirming === r.id ? 'กำลังยืนยัน...' : 'ยืนยัน'}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}



            {trip.reservations?.length === 0 && (
                <p className="mt-4 text-center text-gray-500">ยังไม่มีผู้จองสำหรับทริปนี้</p>
            )}

            <button
                className="w-full bg-theme-second-orange text-theme-black border-2 py-2 rounded-xl mt-4 text-lg"
                onClick={() => handleAction("start")}
            >
                เริ่มต้นการเดินทาง
            </button>

            <div className="space-y-4 mt-2">
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

            {/* <div className="flex justify-end gap-2 mt-2 mb-4">
                <button
                    onClick={handleCancelTrip}
                    disabled={processing === 'cancel'}
                    className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-60"
                >
                    {processing === 'cancel' ? 'กำลังยกเลิก...' : 'ยกเลิกทริป'}
                </button>

                <button
                    onClick={handleStartTrip}
                    disabled={processing === 'start'}
                    className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-60"
                >
                    {processing === 'start' ? 'กำลังเริ่มต้น...' : 'เริ่มต้นทริป'}
                </button>
            </div> */}



        </div>


    );
}
