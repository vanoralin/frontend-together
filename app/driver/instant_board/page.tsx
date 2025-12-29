'use client';
import { useEffect, useState } from 'react';
import { CardTrip, PinPath } from '@/app/components/trip_components';
import { BackButton, Header } from '@/app/components/share_component';
import axios from 'axios';

interface Location { id: number; name: string; }
interface Reservation {
    id: number;
    expiry_time: string;
    vehicle_type: string;
    price: number;
    pickup_location_id: number;
    dropoff_location_id: number;
}

export default function ReservationList() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const locRes = await fetch('/api/locations');
                setLocations(await locRes.json());

                const res = await fetch('/api/instant-trips/board');
                setReservations(await res.json());
            } catch (error) {
                console.error(error);
            } finally { setLoading(false); }
        }
        fetchData();
    }, []);

    const getLocationName = (id: number) => locations.find(l => l.id === id)?.name ?? '-';

    const handleAccept = async (reservation: Reservation) => {
        setAccepting(true);
        try {
            await axios.post(`/api/instant-trips/${reservation.id}/accept`);
            //alert('รับงานเรียบร้อยแล้ว');
            setReservations(prev => prev.filter(r => r.id !== reservation.id));
            setSelectedReservation(null);
        } catch (err) {
            console.error(err);
            alert('รับงานไม่สำเร็จ ลองใหม่');
        } finally { setAccepting(false); }
    };

    if (loading) return <p className="p-4 text-gray-500">กำลังโหลดข้อมูล...</p>;

    return (
        <div className="min-h-screen bg-theme-driver">
            <div className="px-4 pb-20">
                <BackButton />
                <h1 className="text-2xl font-medium text-center pt-12 pb-6">รายการทริปด่วน</h1>

                {reservations.length === 0 ? (
                    <p>ยังไม่มีรายการทริปด่วนในขณะนี้</p>
                ) : (
                    <div className="space-y-3">
                        {reservations.map(r => (
                            <CardTrip
                                key={r.id}
                                datetime={r.expiry_time}
                                people={1}
                                currentPassengers={1}
                                pickup={getLocationName(r.pickup_location_id)}
                                dropoff={getLocationName(r.dropoff_location_id)}
                                vehicle={r.vehicle_type}
                                tripType="instant"
                                price={r.price}
                                mode="instant"
                                href="#" //ใช้ popup link เอา
                                onClick={() => setSelectedReservation(r)}
                            />
                        ))}
                    </div>
                )}

                {selectedReservation && (
                    <div className="absolute inset-0 bg-gray-200/60 backdrop-blur-sm flex justify-center items-center z-50">
                        <div className="bg-white rounded-xl p-6 w-[90%] max-w-md gap-4 flex flex-col items-center">
                            <h2 className="text-lg">ยืนยันการรับงานทริปด่วน</h2>
                            <PinPath from={getLocationName(selectedReservation.pickup_location_id)} to={getLocationName(selectedReservation.dropoff_location_id)} />
                            <div className="flex justify-center gap-2">
                                <button
                                    className="px-4 py-2 bg-gray-200 rounded-lg"
                                    onClick={() => setSelectedReservation(null)}
                                    disabled={accepting}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    className="px-4 py-2 bg-theme-orange text-white rounded-lg"
                                    onClick={() => handleAccept(selectedReservation)}
                                    disabled={accepting}
                                >
                                    {accepting ? 'กำลังรับ...' : 'รับงาน'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
