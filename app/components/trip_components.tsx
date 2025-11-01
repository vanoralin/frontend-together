"use client";
import Link from "next/link";
import { LocationType } from "./MapSelectComponent";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";


//ไอคอนรถพร้อมจำนวนคน
interface NumberInCarProps {
    number: number;
}

export function NumberInCar({ number }: NumberInCarProps) {
    return (
        <div className="flex items-center gap-1">
            <img src="/icon_car.svg" alt="" className="h-6" />
            <p>{number}</p>
        </div>
    );
}

//ไอคอนหมุด + ชื่อสถานที่ ใช้ในแมพ
interface PinProps {
    location: string;
}

export function PinName({ location }: PinProps) {
    return (
        <div className="flex items-center gap-2">
            <img src="/location.png" alt="pin" className="h-5" />
            <p>{location}</p>
        </div>
    );
}

interface PinPathProps {
    from: string;
    to: string;
}

export function PinPath({ from, to }: PinPathProps) {
    return (
        <div className="flex items-center gap-2">
            <img src="/location.png" alt="pin" className="h-5" />
            <p className="font-semibold">{from} ➜ {to}</p>
        </div>
    );
}

interface VehicleTypeProps {
    type: "car" | "suv" | "motorcycle" | string;
    className?: string;
}

export function VehicleType({ type, className }: VehicleTypeProps) {
    let iconSrc = "";
    let label = "";

    if (type === "car") {
        iconSrc = "/icon_car.svg";
        label = "รถยนต์";
    } else if (type === "suv") {
        iconSrc = "/icon_car.svg";
        label = "รถยนต์ขนาดใหญ่";
    } else if (type === "motorcycle") {
        iconSrc = "/icon_motorcycle.svg";
        label = "จักรยานยนต์";
    }
    else {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <img src={iconSrc} alt={type} className="h-5" />
            {label && <p className={`${className || "text-xs"}`}>{label}</p>}
        </div>
    );
}



interface LocationSearchInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    iconSrc?: string;
    onSearch?: () => void;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
}


export function LocationSearchInput({
    value,
    onChange,
    placeholder,
    iconSrc = "/icon_search.svg",
    onSearch,
    onFocus,
    onBlur,
}: LocationSearchInputProps) {
    return (
        <div className="w-90 relative items-center">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-10 text-base bg-white text-black rounded-[1.35rem] pl-10 pr-10 placeholder-theme-gray"
                onKeyDown={(e) => {
                    if (e.key === "Enter" && onSearch) {
                        onSearch();
                    }
                }}
                onFocus={onFocus}
                onBlur={onBlur}
            />

            {/* ไอคอนค้นหา */}
            {!value && onSearch && (
                <button
                    type="button"
                    onClick={onSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center"
                >
                    <img
                        src={iconSrc}
                        alt="search"
                        className="h-5 w-5 object-contain"
                    />
                </button>
            )}

            {/* ปุ่ม clear */}
            {value && (
                <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                    onClick={() => onChange("")}
                >
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
}



interface LocationInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    iconSrc?: string;
}

export function LocationInput({ value, onChange, placeholder, iconSrc = "/location.png" }: LocationInputProps) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <img src={iconSrc} alt="location" className="h-8 w-6 object-contain" />
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-8 text-base bg-theme-light-gray text-black rounded-[1.35rem] pl-4 pr-12 placeholder-gray-500"
                    placeholder={placeholder}
                />
                {value && (
                    <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                        onClick={() => onChange("")}
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

//format แสดงหมุดพร้อมชื่อสถานที่
interface LocationShowBoxProps {
    value: string;
    iconSrc?: string;
}

export function LocationShowBox({
    value,
    iconSrc = "/location.png",
}: LocationShowBoxProps) {
    return (
        <div className="flex items-center gap-3">
            <img
                src={iconSrc}
                alt="location"
                className="h-6 w-6 object-contain" // ปรับขนาดให้พอดีกับ text
            />
            <div className="flex-1">
                <div
                    className="w-full text-base bg-theme-light-gray text-black rounded-[1.35rem] pl-4 pr-3 flex items-center h-8"
                >
                    <span>{value}</span>
                </div>
            </div>
        </div>
    );
}


interface LocationDirectionShowBoxProps {
    pickup: LocationType | null;
    dropoff: LocationType | null;
    selecting: "pickup" | "dropoff" | null;
    onSelect?: (type: "pickup" | "dropoff") => void;
}

export function LocationDirectionShowBox({
    pickup,
    dropoff,
    selecting,
    onSelect,
}: LocationDirectionShowBoxProps) {
    return (
        <div className="flex flex-col gap-2">
            <div
                onClick={() => onSelect?.("pickup")}
                className={`cursor-pointer flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50
                    ${selecting === "pickup" ? "border-theme-orange bg-theme-second-orange" : "border-gray-300"}`}
            >
                <LocationShowBox value={pickup ? pickup.name : "เลือกจุดรับ"} />
                {/* <span className="text-gray-400 text-sm ml-2">เลือก</span> */}
            </div>

            <div
                onClick={() => onSelect?.("dropoff")}
                className={`cursor-pointer flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50
                    ${selecting === "dropoff" ? "border-theme-orange bg-theme-second-orange" : "border-gray-300"}`}
            >
                <LocationShowBox value={dropoff ? dropoff.name : "เลือกจุดปลายทาง"} />
                {/* <span className="text-gray-400 text-sm ml-2">เลือก</span> */}
            </div>
        </div>
    );
}

//Card Trip for trip list (normal/instant)

interface CardTripProps {
    datetime: string; // ISO string
    people?: number;
    pickup: string;
    dropoff: string;
    vehicle: string;
    status?: string;
    license_plate?: string;
    model_vehicle?: string;
    currentPassengers?: number;
    mode?: 'status' | 'link' | 'instant' | 'start' | 'today-cus'; // default: status
    href?: string;
    role?: 'driver' | 'customer';
    tripType?: 'normal' | 'instant' | 'customer';
    price?: number;
    onClick?: () => void;
    showText?: string;
}

// Card Trip Component
export function CardTrip({
    datetime,
    people,
    pickup,
    dropoff,
    vehicle,
    status,
    license_plate,
    model_vehicle,
    currentPassengers,
    mode = 'status',
    href,
    role,
    tripType = 'normal',
    price,
    onClick,
    showText
}: CardTripProps) {
    const isInstant = tripType === 'instant';
    const isToday = mode === 'today-cus';

    const tripTypeLabels: Record<string, string> = {
        'normal': 'ทริปปกติ',
        'instant': 'ทริปด่วน',
    };
    const tripTypeLabel = tripTypeLabels[tripType] || tripType;

    // แปลง ISO เป็นเวลาไทย UTC+7
    const d = new Date(datetime);
    const tzOffset = 7;
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

    const displayDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    const displayTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    const content = (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl shadow-md p-4 mb-4 hover:shadow-lg transition-all duration-200 active:scale-[0.98] cursor-pointer`}
        >
            <div className="space-y-2 text-sm">
                {showText && <p className="text-lg border-b-1 border-gray-300 pb-2 mb-2">{showText}</p>}
                <div className="flex justify-between">

                    <PinPath from={pickup} to={dropoff} />

                    {/* แสดงผู้โดยสารปัจจุบันหรือจำนวนคน */}
                    <span className="text-theme-gray text-sm font-light flex items-center gap-1">
                        {isInstant ? 1 : people}
                        <img
                            src="/icon_nav_profile.svg"
                            alt="profile"
                            className="w-4 h-4 object-contain"
                            style={{ filter: "brightness(0) invert(50%)" }}
                        />
                    </span>
                </div>



                <div className="flex items-center mb-2 text-sm gap-2">
                    {isInstant ? (
                        <span>คำขอหมดอายุใน: {displayDate} {displayTime}</span>
                    ) : (
                        <>
                            <span>วันที่ {displayDate}</span>
                            <span>เวลา {displayTime}</span>
                        </>
                    )}

                    {/* แสดงราคา ถ้ามี */}
                    {role === 'customer' && !isToday && (
                        <div className="flex items-center gap-1 ml-auto">
                            <img src="/coin.svg" alt="coin" className="w-4 h-4 object-contain" />
                            <div className="text-xs text-gray-800 font-semibold mt-1">{price}</div>
                        </div>
                    )}
                </div>

                {/* ข้อมูลรถ */}
                <div className="flex justify-between items-center mt-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <VehicleType type={vehicle} />
                        </div>

                        {model_vehicle && license_plate && !isToday && (
                            <div className="text-sm text-theme-gray mt-1">
                                <p>รุ่นรถ: {model_vehicle}</p>
                                <p>ทะเบียน: {license_plate}</p>
                            </div>
                        )}
                    </div>

                    {/* Status / Instant / Link */}
                    {mode === 'status' ? (
                        <span
                            className={`border text-xs px-3 py-1 rounded-full ${status === 'หาคนขับได้แล้ว'
                                ? 'border-orange-500 text-orange-500'
                                : 'border-gray-400 text-gray-500'
                                }`}
                        >
                            {tripTypeLabel}
                        </span>
                    ) : mode === 'instant' ? (
                        <span className="bg-theme-orange text-white text-xs px-3 py-1 rounded-full">
                            รับงาน
                        </span>
                    ) : mode === 'start' ? (
                        <span className="bg-theme-green text-white text-xs px-3 py-1 rounded-full">
                            เริ่มเดินทาง
                        </span>
                    ) : (
                        <span className="bg-theme-light-gray text-theme-gray text-xs px-3 py-1 rounded-full">
                            ดูรายละเอียด
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    // ถ้ามี href และไม่มี onClick ใช้ Link
    return href && !onClick ? <Link href={href}>{content}</Link> : content;
}

interface TripListCardProps {
    title: string;
    image: string;
    bgColor: string;
    href: string;
}

export function TripListCard({ title, image, bgColor, href }: TripListCardProps) {
    return <Link href={href} className="block h-full w-full">
        <div className={`flex-1 rounded-xl shadow-md p-4 bg-gradient-to-b ${bgColor} flex flex-col items-center justify-center`}>
            <img src={image} alt={title} className=" h-16 mb-2" />
            <p className="text-sm font-medium text-theme-black">{title}</p>
        </div>
    </Link>
}

//Estimate box and user balance
interface EstimateResponse {
    base_fare: number;
    distance_km: string;
    estimated_price: string;
    message: string;
    rate_per_km: number;
    seats: number;
    vehicle_type: string;
}

interface UserProfile {
    balance: number;
    email: string;
    id: number;
    name: string;
    role: string;
}

interface TripEstimateBoxProps {
    pickup_location_id: number;
    dropoff_location_id: number;
    seats_required: number;
    vehicle_type: string;
    trip_type: 'normal' | 'instant';
}

export function TripEstimateBox({
    pickup_location_id,
    dropoff_location_id,
    seats_required,
    vehicle_type,
    trip_type
}: TripEstimateBoxProps) {
    const [estimate, setEstimate] = useState<EstimateResponse | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                //เรียก API ค่าโดยสาร
                const estimateRes = await fetch("/api/trips/estimate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        pickup_location_id,
                        dropoff_location_id,
                        seats_required,
                        vehicle_type,
                        trip_type
                    }),
                });

                const estimateData = await estimateRes.json();
                setEstimate(estimateData);

                //เรียก API โปรไฟล์ผู้ใช้
                const profileRes = await fetch("/api/user/profile");
                const profileData = await profileRes.json();
                setUser(profileData);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [pickup_location_id, dropoff_location_id, seats_required, vehicle_type]);

    if (loading) {
        return (
            <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-md flex justify-center items-center">
                <p className="text-gray-500 text-sm">กำลังโหลด...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-md flex justify-between items-start">
            <div>
                <p className="text-theme-black font-light mb-5">ค่าเดินทาง</p>
                <div className="flex items-center gap-2">
                    <img src="/coin.svg" alt="coin" className="w-8 h-8 object-contain" />
                    <p className="text-theme-black text-xl font-light">
                        {estimate ? `${estimate.estimated_price} บาท` : "-"}
                    </p>
                </div>
            </div>

            <div className="text-right self-start">
                <p className="text-theme-gray text-sm font-light">ยอดในกระเป๋าเงิน</p>
                <div className="flex items-center justify-end gap-1">
                    <img src="/coin.svg" alt="coin" className="w-4 h-4 object-contain" />
                    <p className="text-theme-gray font-light">
                        {user ? `${user.balance} บาท` : "-"}
                    </p>
                </div>
            </div>
        </div>
    );
}

