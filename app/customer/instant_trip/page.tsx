"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { LocationType } from "../../components/MapSelectComponent";
import { LocationShowBox, TripEstimateBox } from "../../components/trip_components";
import { Header, BackButton } from "@/app/components/share_component";
import L from "leaflet";

const MapSelectComponent = dynamic(
    () => import("../../components/MapSelectComponent"),
    { ssr: false }
);

// Props ของ Search Bar
interface LocationSearchBarProps {
    label: string;
    locations: LocationType[];
    value: string;
    onChange: (val: string) => void;
    onSelect: (loc: LocationType | null) => boolean; 
    mapRef: React.RefObject<L.Map | null>;
}

// Search bar component
function LocationSearchBar({ label, locations, value, onChange, onSelect, mapRef }: LocationSearchBarProps) {
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredLocations = useMemo(() => {
        if (!value) return [];
        return locations.filter(loc => loc.name.toLowerCase().includes(value.toLowerCase()));
    }, [locations, value]);

    const handleSelect = (loc: LocationType) => {
        const success = onSelect(loc);
        if (!success) return;         
        setShowDropdown(false);
        mapRef.current?.flyTo([loc.lat, loc.lng], 16, { duration: 1 });
    };


    const handleClear = () => {
        onChange('');
        onSelect(null); 
    };

    return (
        <div className="flex items-center gap-2">
            <img src="/location.png" alt="pin" className="h-7" />
            <div className="relative w-full">
                <input
                    type="text"
                    placeholder={label}
                    value={value}
                    onChange={e => { onChange(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    className="w-full border rounded-full px-4 py-2 shadow-sm focus:outline-none pr-10"
                />
                {value && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                        ×
                    </button>
                )}

                {showDropdown && filteredLocations.length > 0 && (
                    <ul className="absolute z-20 w-full bg-white rounded-lg shadow-md mt-1 max-h-60 overflow-auto border border-gray-200">
                        {filteredLocations.map(loc => (
                            <li
                                key={loc.id ?? loc.name}
                                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                                onMouseDown={() => handleSelect(loc)}
                            >
                                {loc.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>

    );
}

// Main page
export default function DriverPage() {
    const router = useRouter();
    const [locations, setLocations] = useState<LocationType[]>([]);
    const [loading, setLoading] = useState(true);

    const [pickup, setPickup] = useState<LocationType | null>(null);
    const [dropoff, setDropoff] = useState<LocationType | null>(null);

    const [pickupSearch, setPickupSearch] = useState("");
    const [dropoffSearch, setDropoffSearch] = useState("");

    const [showDetail, setShowDetail] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState("รถยนต์");

    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await axios.get<LocationType[]>("/api/locations");
                setLocations(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLocations();
    }, []);

    const handleSelectLocation = (loc: LocationType | null, type: "pickup" | "dropoff"): boolean => {
        if (!loc) {
            if (type === "pickup") { setPickup(null); setPickupSearch(''); }
            else { setDropoff(null); setDropoffSearch(''); }
            return true;
        }

        if (type === "pickup" && dropoff?.id === loc.id) {
            alert("จุดขึ้นรถไม่สามารถซ้ำกับจุดลงรถได้");
            return false;
        }
        if (type === "dropoff" && pickup?.id === loc.id) {
            alert("จุดลงรถไม่สามารถซ้ำกับจุดขึ้นรถได้");
            return false;
        }

        if (type === "pickup") { setPickup(loc); setPickupSearch(loc.name); }
        else { setDropoff(loc); setDropoffSearch(loc.name); }

        mapRef.current?.flyTo([loc.lat, loc.lng], 16, { duration: 1 });
        return true;
    };


    const handleNext = () => {
        if (pickup && dropoff) setShowDetail(true);
        else alert("กรุณาเลือกต้นทางและปลายทางก่อน");
    };

    const handleSubmit = async () => {
        if (!pickup || !dropoff) return alert("กรุณาเลือกต้นทางและปลายทาง");

        let vehicle_type = "car";
        if (selectedVehicle === "จักรยานยนต์") vehicle_type = "motorcycle";
        else if (selectedVehicle === "รถยนต์ขนาดใหญ่") vehicle_type = "suv";

        const payload = {
            pickup_location_id: pickup.id,
            dropoff_location_id: dropoff.id,
            vehicle_type,
        };

        try {
            const res = await axios.post("/api/instant-trips", payload, {
                headers: { "Content-Type": "application/json" },
            });
            console.log("Response:", res.data);
            alert("สร้างทริปสำเร็จ!");
            router.push("/customer/home");
        } catch (err: any) {
            console.error("Error:", err.response?.data || err.message);
            alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        }
    };

    // หน้าเลือกจุด
    if (!showDetail) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
                <BackButton />
                <h1 className="text-2xl font-medium text-center pt-12">หารถด่วน</h1>
                <main className="flex flex-col mx-4 gap-4 mt-6">

                    <div className="flex flex-col gap-2">
                        <LocationSearchBar
                            label="ค้นหาจุดขึ้นรถ"
                            locations={locations}
                            value={pickupSearch}
                            onChange={setPickupSearch}
                            onSelect={(loc) => handleSelectLocation(loc, "pickup")} // handleSelectLocation now returns true/false
                            mapRef={mapRef}
                        />
                        <LocationSearchBar
                            label="ค้นหาจุดลงรถ"
                            locations={locations}
                            value={dropoffSearch}      
                            onChange={setDropoffSearch}
                            onSelect={(loc) => handleSelectLocation(loc, "dropoff")}
                            mapRef={mapRef}
                        />
                    </div>

                    <div className="h-130 w-full rounded-xl overflow-hidden mt-2">
                        {loading ? (
                            <div className="flex items-center justify-center h-full text-gray-600">
                                กำลังโหลดแผนที่...
                            </div>
                        ) : (
                            <MapSelectComponent
                                locations={locations}
                                mapRef={mapRef}
                                onMarkerSelect={(loc) => {
                                    // เมื่อเลือกหมุด ให้ตรงกับ pickup หรือ dropoff
                                    if (!pickup) handleSelectLocation(loc, "pickup");
                                    else if (!dropoff) handleSelectLocation(loc, "dropoff");
                                }}
                            />
                        )}
                    </div>

                    <button
                        onClick={handleNext}
                        className="w-full bg-theme-second-orange border-2 border-theme-orange text-theme-black py-3 rounded-3xl shadow-md hover:bg-[#d9956f] transition-colors duration-200 "
                    >
                        ถัดไป
                    </button>
                </main>
            </div>
        );
    }

    // หน้า detail
    return (
        <div className="bg-[#C5DEDA] min-h-screen w-full flex flex-col items-center pb-20 px-6 gap-4">
                <BackButton onClick={() => setShowDetail(false)}/>
                <h1 className="text-2xl font-medium text-center pt-12">หารถด่วน</h1>

            <div className="bg-white shadow-md rounded-2xl p-4 space-y-3 mt-6 w-full max-w-md">
                <LocationShowBox value={pickup?.name || ""} />
                <LocationShowBox value={dropoff?.name || ""} />
            </div>

            <div className="w-full max-w-md bg-white font-light rounded-2xl p-4 shadow-md">
                <h3 className="text-theme-black">เลือกพาหนะ</h3>
                <div className="space-y-2 mt-4 w-full max-w-md">
                    {["จักรยานยนต์", "รถยนต์", "รถยนต์ขนาดใหญ่"].map((v) => {
                        let passengerRange = "";
                        if (v === "จักรยานยนต์") passengerRange = "1 คน";
                        else if (v === "รถยนต์") passengerRange = "1–4 คน";
                        else if (v === "รถยนต์ขนาดใหญ่") passengerRange = "1–6 คน";

                        return (
                            <button
                                key={v}
                                onClick={() => setSelectedVehicle(v)}
                                className={`w-full flex justify-between items-center bg-white px-4 py-2 rounded-full font-light
                    hover:bg-gray-100 ${selectedVehicle === v ? "border-2 border-theme-orange" : "border border-gray-300"}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center 
                            ${selectedVehicle === v ? "border-theme-orange bg-theme-orange" : "border-gray-400 bg-white"}`}
                                    >
                                        {selectedVehicle === v && (
                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                                                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className={`text-base ${selectedVehicle === v ? "text-[#191919]" : "text-[#8b8b8b]"}`}>
                                        {v}
                                    </span>
                                </div>
                                <span className="text-[#8b8b8b] text-sm font-light flex items-center gap-1">
                                    {passengerRange}
                                    <img
                                        src="/icon_nav_profile.svg"
                                        alt="profile"
                                        className="w-4 h-4 object-contain"
                                        style={{ filter: "brightness(0) invert(50%)" }}
                                    />
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
            <TripEstimateBox
                pickup_location_id={pickup?.id ?? 0}
                dropoff_location_id={dropoff?.id ?? 0}
                seats_required={1}
                vehicle_type={
                    selectedVehicle === "จักรยานยนต์"
                        ? "motorcycle"
                        : selectedVehicle === "รถยนต์"
                            ? "car"
                            : "suv"
                }
                trip_type="instant"
            />
            <p className="font-light"> ระบบจะทำการหาคนขับให้คุณภายใน 30 นาทีนับจากที่เรียกรถ หากไม่สามารถหาให้ได้ จะทำการยกเลิกอัตโนมัติ</p>
            <div className="w-full max-w-md mt-6">
                <button
                    onClick={handleSubmit}
                    className="w-full bg-theme-second-orange border-2 border-theme-orange text-theme-black py-3 rounded-3xl shadow-md hover:bg-[#d9956f] transition-colors duration-200"
                >
                    เรียกรถเลย
                </button>
            </div>


        </div>
    );
}
