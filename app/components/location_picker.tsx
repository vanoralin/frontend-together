"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import L from "leaflet";
import { LocationType } from "./MapSelectComponent";

const MapSelectComponent = dynamic(() => import("./MapSelectComponent"), { ssr: false });

interface LocationPickerProps {
    onSelect: (pickup: LocationType | null, dropoff: LocationType | null) => void;
}

export default function LocationPicker({ onSelect }: LocationPickerProps) {
    const [locations, setLocations] = useState<LocationType[]>([]);
    const [pickup, setPickup] = useState<LocationType | null>(null);
    const [dropoff, setDropoff] = useState<LocationType | null>(null);

    const [pickupSearch, setPickupSearch] = useState("");
    const [dropoffSearch, setDropoffSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await axios.get<LocationType[]>("/api/locations");
                setLocations(res.data);
            } catch (err) {
                console.error("Error loading locations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLocations();
    }, []);

    // ✅ callback อัปเดตค่า id กลับไปให้หน้า parent ทุกครั้งที่เลือก
    useEffect(() => {
        onSelect(pickup, dropoff);
    }, [pickup, dropoff]);

    const handleSelect = (loc: LocationType | null, type: "pickup" | "dropoff") => {
        if (!loc) {
            if (type === "pickup") setPickup(null);
            else setDropoff(null);
            return;
        }
        if (type === "pickup" && loc.id === dropoff?.id) {
            alert("จุดขึ้นรถไม่สามารถซ้ำกับจุดลงรถได้");
            return;
        }
        if (type === "dropoff" && loc.id === pickup?.id) {
            alert("จุดลงรถไม่สามารถซ้ำกับจุดขึ้นรถได้");
            return;
        }

        if (type === "pickup") {
            setPickup(loc);
            setPickupSearch(loc.name);
        } else {
            setDropoff(loc);
            setDropoffSearch(loc.name);
        }

        mapRef.current?.flyTo([loc.lat, loc.lng], 16, { duration: 1 });
    };

    return (
        <div className="flex flex-col gap-3">
            <LocationSearchBox
                label="ค้นหาจุดขึ้นรถ"
                locations={locations}
                value={pickupSearch}
                onChange={setPickupSearch}
                onSelect={(loc) => handleSelect(loc, "pickup")}
                mapRef={mapRef}
            />

            <LocationSearchBox
                label="ค้นหาจุดลงรถ"
                locations={locations}
                value={dropoffSearch}
                onChange={setDropoffSearch}
                onSelect={(loc) => handleSelect(loc, "dropoff")}
                mapRef={mapRef}
            />

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
                            if (!pickup) handleSelect(loc, "pickup");
                            else if (!dropoff) handleSelect(loc, "dropoff");
                        }}
                    />
                )}
            </div>
        </div>
    );
}

// 🔸 ตัวค้นหา location (แยกภายใน component เดียวกัน)
interface LocationSearchBoxProps {
    label: string;
    locations: LocationType[];
    value: string;
    onChange: (val: string) => void;
    onSelect: (loc: LocationType | null) => void;
    mapRef: React.RefObject<L.Map | null>;
}

function LocationSearchBox({ label, locations, value, onChange, onSelect, mapRef }: LocationSearchBoxProps) {
    const [showDropdown, setShowDropdown] = useState(false);

    const filtered = useMemo(() => {
        if (!value) return [];
        return locations.filter((l) => l.name.toLowerCase().includes(value.toLowerCase()));
    }, [locations, value]);

    const handleSelect = (loc: LocationType) => {
        onSelect(loc);
        setShowDropdown(false);
        mapRef.current?.flyTo([loc.lat, loc.lng], 16, { duration: 1 });
    };

    const handleClear = () => {
        onChange("");
        onSelect(null);
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                placeholder={label}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                className="w-full border rounded-full px-4 py-2 shadow-sm focus:outline-none"
            />
            {value && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl"
                >
                    ×
                </button>
            )}

            {showDropdown && filtered.length > 0 && (
                <ul className="absolute z-20 w-full bg-white rounded-lg shadow-md mt-1 max-h-60 overflow-auto border border-gray-200">
                    {filtered.map((loc) => (
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
    );
}
