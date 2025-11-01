'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { BackButton, Header } from '@/app/components/share_component';
import { CardTrip } from '@/app/components/trip_components';

interface Passenger {
    id: number;
    name: string;
    email: string;
}

interface Driver {
    id: number;
    name: string;
    email: string;
}

interface Vehicle {
    model_vehicle?: string;
    license_plate?: string;
    vehicle_type?: string;
}

interface Location {
    id: number;
    name: string;
}

interface Reservation {
    id: number;
    status: string;
    trip_type?: 'normal' | 'instant';
    scheduled_start_time: string;
    seats: number;
    amount: number;
    passenger?: Passenger;
    driver?: Driver;
    vehicle?: Vehicle;
    pickup_location?: Location;
    dropoff_location?: Location;
}

export default function HistoryPage() {
    const [trips, setTrips] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'pending_driver_confirmation' | 'confirmed'>('confirmed');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get<Reservation[]>('/api/reservations/history');
                const data = Array.isArray(res.data) ? res.data : [];

                // กรองเฉพาะ status ที่สนใจ
                const filtered = data.filter(trip =>
                    ['pending_driver_confirmation', 'confirmed'].includes(trip.status)
                );
                setTrips(filtered);
            } catch (err) {
                console.error('Error fetching history:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending_driver_confirmation':
                return 'รอคนขับยืนยัน';
            case 'confirmed':
                return 'ยืนยันแล้ว';
            case 'completed':
                return 'เดินทางเสร็จสิ้น';
            default:
                return status;
        }
    };

    // กรอง trips ตาม filterStatus
    const filteredTrips = trips.filter(trip => trip.status === filterStatus);

    return (
        <div className="bg-theme-customer min-h-screen flex flex-col">
            {/* ส่วน header และแท็บ */}

            <div className="sticky top-0 z-10 bg-theme-customer pb-3">
                <BackButton />
                <h1 className="text-2xl font-medium text-center pt-12 pb-6">รายการจอง</h1>

                <div className="flex gap-2 px-4">
                    <button
                        className={`px-3 py-1 rounded ${filterStatus === 'confirmed' ? 'bg-theme-orange text-white' : 'bg-white text-theme-gray'}`}
                        onClick={() => setFilterStatus('confirmed')}
                    >
                        ยืนยันแล้ว
                    </button>
                    <button
                        className={`px-3 py-1 rounded ${filterStatus === 'pending_driver_confirmation' ? 'bg-theme-orange text-white' : 'bg-white text-theme-gray'}`}
                        onClick={() => setFilterStatus('pending_driver_confirmation')}
                    >
                        รอคนขับยืนยัน
                    </button>
                </div>
            </div>

            {/* ส่วนของรายการทริป (ให้พื้นที่เต็มที่ + scroll ได้แน่นอน) */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                {loading ? (
                    <p>กำลังโหลด...</p>
                ) : filteredTrips.length === 0 ? (
                    <p className="text-gray-500">ไม่มีรายการจองในสถานะนี้</p>
                ) : (
                    filteredTrips.map(trip => (
                        <CardTrip
                            key={trip.id}
                            datetime={trip.scheduled_start_time}
                            pickup={trip.pickup_location?.name ?? '-'}
                            dropoff={trip.dropoff_location?.name ?? '-'}
                            vehicle={trip.vehicle?.vehicle_type ?? '-'}
                            model_vehicle={trip.vehicle?.model_vehicle ?? '-'}
                            license_plate={trip.vehicle?.license_plate ?? '-'}
                            people={trip.seats}
                            status={getStatusLabel(trip.status)}
                            role="customer"
                            tripType={trip.trip_type}
                            mode="status"
                            price={trip.amount}
                            href={`../trip/${trip.id}`}
                        />
                    ))
                )}
            </div>
        </div>

    );

}
