'use client';
import dynamic from "next/dynamic";
import { LocationSearchInput } from "@/app/components/trip_components";
import { useState, useEffect, useMemo, useRef } from "react";
import Navbar from "../components/navbar";
import axios from "axios";
import L, { Map as LeafletMap } from "leaflet";

// const MapComponent = dynamic(() => import("../../components/MapComponent"), { ssr: false });
const MapSelectComponent = dynamic(
    () => import("../../components/MapSelectComponent"),
    { ssr: false }
);

export default function TripMapPage() {
    const [start, setStart] = useState("");
    const [locations, setLocations] = useState<{ id?: number; name: string; lat: number; lng: number;[key: string]: any }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);

    const mapRef = useRef<LeafletMap | null>(null);

    interface Location {
        id?: number;
        name: string;
        lat: number;
        lng: number;
        [key: string]: any;
    }

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await axios.get<Location[]>("/api/locations");
                setLocations(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLocations();
    }, []);

    const filteredLocations = useMemo(() => {
        if (!start) return [];
        return locations.filter((loc) => loc.name.toLowerCase().includes(start.toLowerCase()));
    }, [locations, start]);

    const dropdownLocations = start ? filteredLocations : [];

    //ฟังก์ชันเลื่อนไป marker
    const flyToLocation = (loc: { lat: number; lng: number }) => {
        if (mapRef.current) {
            mapRef.current.flyTo([loc.lat, loc.lng], 16, { duration: 1.2 }); // zoom=16, duration=1.2s
        }
    };

    return (
        <div className="relative w-full h-screen bg-theme-customer">
            <div className="fixed top-10 z-10 w-80 px-4 py-2">
                <div className="relative">
                    <LocationSearchInput
                        value={start}
                        onChange={(val) => { setStart(val); setShowDropdown(!!val); }}
                        placeholder="ค้นหาหมุด"
                        onFocus={() => setShowDropdown(!!start)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
                    />

                    {showDropdown && dropdownLocations.length > 0 && (
                        <ul className="absolute z-20 w-full bg-white rounded-lg shadow-md mt-1 max-h-60 overflow-auto border border-gray-200">
                            {dropdownLocations.map((loc) => (
                                <li
                                    key={loc.id ?? loc.name}
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                                    onMouseDown={() => {
                                        setStart(loc.name);
                                        setShowDropdown(false);
                                        flyToLocation(loc);
                                    }}
                                >
                                    {loc.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-600 text-lg">กำลังโหลดแผนที่...</p>
                </div>
            ) : (
                <MapSelectComponent locations={dropdownLocations.length ? dropdownLocations : locations} mapRef={mapRef} page={'map'} />
            )}

            <Navbar />
        </div>
    );
}
