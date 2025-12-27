"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import dynamic from "next/dynamic";
import { Plus, ChevronDown, Calendar as CalendarIcon2 } from "lucide-react";
import NavBar from "@/app/driver/components/navbar";
import CalendarComponent from "@/app/components/Calendar";
import { BackButton2 } from "@/app/components/BackButton2";
import { format } from "date-fns";
import type { Map as LeafletMap } from "leaflet";

/* ========= Map (SSR off) ========= */
const MapSelectComponent = dynamic(() => import("@/app/components/MapSelectComponent"), { ssr: false });

/* ========= Axios ========= */
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/* ========= Types/Utils ========= */
type Loc = { id: number; name: string; lat: number; lng: number };
type LocationType = Loc;

const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function toLocArray(data: any[]): Loc[] {
  if (!Array.isArray(data)) return [];
  const out: Loc[] = [];
  for (const it of data) {
    const id = Number(it.id ?? it.location_id);
    const name = String(it.name ?? it.label ?? it.title ?? (Number.isFinite(id) ? `สถานที่ #${id}` : "สถานที่"));
    const lat = Number(it.lat ?? it.latitude ?? it.lat_deg ?? it.y);
    const lng = Number(it.lng ?? it.longitude ?? it.lon ?? it.long ?? it.x);
    if (Number.isFinite(id) && Number.isFinite(lat) && Number.isFinite(lng)) out.push({ id, name, lat, lng });
  }
  return out;
}

/* ========= Icons ========= */
const CalendarIcon = () => (
  <svg className="w-5 h-5 text-[#B55C32]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 4H18V2H16V4H8V2H6V4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM5 7V6H19V7H5Z" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-5 h-5 text-[#B55C32]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L12 13V7H12.5V12.2L17,14.7L16.2,16.2Z" />
  </svg>
);
const ProfileIcon = () => (
  <img src="/icon_nav_profile.svg" alt="profile" className="w-5 h-5" style={{ filter: "brightness(0)" }} />
);

/* ================== LocationBox ================== */
function LocationBox({
  value,
  onClear,
  showLine = false,
}: {
  value: string;
  onClear?: () => void;
  showLine?: boolean;
}) {
  return (
    <div className="relative w-full flex items-center">
      <div className="relative z-20 flex-shrink-0 mr-2">
        <img src="/location.png" alt="location" className="w-7 h-7 object-contain" />
      </div>
      {showLine && <div className="absolute left-[13px] top-[30px] bottom-[-25px] border-l-2 border-black z-0" />}
      <div className="relative z-10 flex items-center justify-between bg-[#8B8B8B]/10 rounded-full px-4 py-2 w-full">
        <span className="text-black text-base ml-1 truncate">{value || "-"}</span>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-gray-500 hover:text-red-500 text-3xl flex items-center justify-center w-8 h-8"
            aria-label="clear"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

/* ========= Reusable UI ========= */
function LocationRow({
  value,
  onRemove,
  showLine = false,
}: {
  value: string;
  onRemove?: () => void;
  showLine?: boolean;
}) {
  return (
    <div className="relative w-full flex items-center">
      <div className="relative z-20 flex-shrink-0 mr-2">
        <img src="/location.png" alt="location" className="w-7 h-7 object-contain" />
      </div>
      {showLine && <div className="absolute left-[13px] top-[30px] bottom-[-25px] border-l-2 border-black z-0" />}
      <div className="relative z-10 flex items-center justify-between bg-[#8B8B8B]/10 rounded-full px-4 py-2 w-full ">
        <span className="text-black text-base ml-1 truncate">{value}</span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-gray-500 hover:text-red-500 text-3xl font-light flex items-center justify-center w-8 h-8"
            aria-label="remove"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

/* --- VehiclePicker --- */
type RawVehicle = Record<string, any>;
type VehicleItem = { id: number; label: string; vehicle_type?: string; capacity: number | null };

function VehiclePicker({
  items,
  selectedId,
  setSelectedId,
}: {
  items: VehicleItem[];
  selectedId: number | null;
  setSelectedId: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const sel = items.find((v) => v.id === selectedId);
  const selectedLabel = sel?.label || "เลือกยานพาหนะของคุณ";
  return (
    <div className="relative w-full">
      <button
        className="w-full justify-between bg-gray-100 border border-gray-100 text-[#191919] font-light rounded-3xl px-4 py-2 flex items-center disabled:opacity-60"
        onClick={() => setOpen(!open)}
        disabled={items.length === 0}
      >
        <span>{selectedLabel}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute w-full mt-2 bg-white border rounded shadow-lg z-50 max-h-60 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">ยังไม่มีรถที่ลงทะเบียน</div>
          ) : (
            items.map((v) => (
              <button
                key={v.id}
                className={`w-full text-left px-4 py-2 hover:bg-[#E6A88A] ${
                  selectedId === v.id ? "bg-[#B55C32] text-white font-light" : "text-gray-700 font-light"
                }`}
                onClick={() => {
                  setSelectedId(v.id);
                  setOpen(false);
                }}
              >
                {v.label}
              </button>
            ))
          )}
        </div>
      )}
      {sel?.capacity != null && <p className="text-xs text-[#6b7280] mt-1">ความจุสูงสุด: {sel.capacity} คน</p>}
    </div>
  );
}

function vehicleToItem(v: RawVehicle): VehicleItem | null {
  const id = Number(v.id ?? v.vehicle_id ?? v.vehicleId);
  if (!Number.isFinite(id)) return null;
  const capRaw =
    v.seat_count ??
    v.seats ??
    v.capacity ??
    v.max_seats ??
    v.maxPassengers ??
    v.max_passengers ??
    v.available_seats;
  const capacity = Number(capRaw);
  const brand = v.brand || v.make || v.manufacturer;
  const model = v.model || v.series;
  const type = v.vehicle_type || v.type || v.category;
  const plate = v.license_plate || v.plate || v.registration_no;

  const parts: string[] = [];
  if (plate) parts.push(String(plate));
  if (brand || model) parts.push([brand, model].filter(Boolean).join(" "));
  if (!plate && !brand && !model && type) parts.push(String(type));
  if (Number.isFinite(capacity)) parts.push(`ที่นั่ง ${capacity}`);

  return {
    id,
    label: parts.filter(Boolean).join(" • ") || `ยานพาหนะ #${id}`,
    vehicle_type: type,
    capacity: Number.isFinite(capacity) ? Number(capacity) : null,
  };
}

const VEHICLE_TYPE_MAP: Record<string, string> = {
  จักรยานยนต์: "motorcycle",
  รถยนต์: "car",
  รถยนต์ขนาดใหญ่: "suv",
};

async function fetchDriverVehicles(typeTh?: string): Promise<VehicleItem[]> {
  const params = typeTh && VEHICLE_TYPE_MAP[typeTh] ? { vehicle_type: VEHICLE_TYPE_MAP[typeTh] } : undefined;
  const r = await api.get<RawVehicle[]>("/driver/vehicles", { params });
  if (!Array.isArray(r.data)) return [];
  return r.data.map(vehicleToItem).filter((x): x is VehicleItem => !!x);
}

/* ========= Misc ========= */
function pickApiMessage(err: any) {
  const d = err?.response?.data;
  if (!d) return err?.message || "เกิดข้อผิดพลาด";
  return (
    d.message ||
    d.error ||
    (Array.isArray(d.errors) && d.errors.map((e: any) => e.message || e.msg || e.field).join("\n")) ||
    JSON.stringify(d)
  );
}

/* --- Simple Calendar --- */
function SimpleCalendar({
  selectedDate,
  setSelectedDate,
}: {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}) {
  const [show, setShow] = useState(false);
  const selectDate = (day: number) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    setSelectedDate(newDate);
    setShow(false);
  };
  const prevMonth = () => {
    const prev = new Date(selectedDate);
    prev.setMonth(prev.getMonth() - 1);
    setSelectedDate(prev);
  };
  const nextMonth = () => {
    const next = new Date(selectedDate);
    next.setMonth(next.getMonth() + 1);
    setSelectedDate(next);
  };

  return (
    <div className="relative flex items-center space-x-2 px-3 py-2 rounded-md">
      <button onClick={() => setShow(!show)} className="flex items-center bg-gray-100 rounded-full px-4 py-2 font-light">
        <span>{format(selectedDate, "dd/MM/yyyy")}</span>
        <CalendarIcon />
      </button>
      {show && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-90 max-w-sm">
            <div className="flex justify-between mb-2">
              <button onClick={prevMonth}>{"<"}</button>
              <span>{format(selectedDate, "MMMM yyyy")}</span>
              <button onClick={nextMonth}>{">"}</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2 ">
              {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => (
                <div key={d} className="text-gray-500">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: 31 }, (_, i) => (
                <button
                  key={i}
                  className={`p-2 rounded-lg hover:bg-blue-100 ${
                    selectedDate.getDate() === i + 1 ? "bg-[#B55C32] text-white font-light" : "text-gray-700 font-light"
                  }`}
                  onClick={() => selectDate(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button className="mt-2 px-4 py-2 bg-[#B55C32] text-white rounded-md " onClick={() => setShow(false)}>
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- TimePicker --- */
function TimePicker({
  selectedTime,
  setSelectedTime,
}: {
  selectedTime: string;
  setSelectedTime: (t: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];
  const times = hours.flatMap((h) => minutes.map((m) => `${h}:${m}`));

  return (
    <div className="relative flex items-center">
      <button className="flex items-center bg-gray-100 rounded-full px-4 py-2 font-light" onClick={() => setOpen(!open)}>
        <span className="mr-2">{selectedTime}</span>
        <ClockIcon />
      </button>
      {open && (
        <div className="absolute top-full mt-2 bg-white border rounded shadow-lg z-50 max-h-60 overflow-y-auto">
          {times.map((t) => (
            <button
              key={t}
              className={`w-full text-left px-4 py-2 hover:bg-[#E6A88A] ${
                selectedTime === t ? "bg-[#B55C32] text-white font-light" : "text-gray-700 font-light"
              }`}
              onClick={() => {
                setSelectedTime(t);
                setOpen(false);
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ======================== MAIN ======================== */
export default function CreateTripOnlyPickup() {
  const router = useRouter();
  const mapRef = useRef<LeafletMap | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  /* สถานที่ */
  const [locList, setLocList] = useState<Loc[]>([
    { id: 1, name: "ฝั่งตรงข้ามเกกี 4", lat: 13.727, lng: 100.532 },
    { id: 2, name: "หน้าตึก ECC", lat: 13.7367, lng: 100.5232 },
    { id: 3, name: "หน้าคณะวิศวะ", lat: 13.7355, lng: 100.529 },
    { id: 4, name: "อาคารเรียนรวม", lat: 13.7349, lng: 100.526 },
    { id: 5, name: "สนามกีฬา", lat: 13.7337, lng: 100.5215 },
  ]);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<any[]>("/locations");
        const norm = toLocArray(res.data);
        if (norm.length > 0) setLocList(norm);
        else setErrorBanner("โหลดจุดรับไม่สำเร็จ ใช้รายการเริ่มต้นแทน");
      } catch {
        setErrorBanner("โหลดจุดรับไม่สำเร็จ ใช้รายการเริ่มต้นแทน");
      }
    })();
  }, []);

  // locations สำหรับ MapSelectComponent
  const locations: LocationType[] = useMemo(() => locList, [locList]);

  /* เลือกจุดรับหลายจุด (โหมดปกติ/แพ็กเกจ หน้า 1/3) */
  const [pickupIds, setPickupIds] = useState<number[]>([]);
  const pickupNames = useMemo(
    () => pickupIds.map((id) => locList.find((l) => l.id === id)?.name || "").filter(Boolean),
    [pickupIds, locList]
  );
  const removePickupAt = (index: number) => setPickupIds((p) => p.filter((_, i) => i !== index));
  const removePickupById = (id: number) => setPickupIds((p) => p.filter((x) => x !== id));
  const togglePickupId = (id: number) =>
    setPickupIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  /* แพ็กเกจ: จุดส่งเดี่ยว */
  const [dropoffId, setDropoffId] = useState<number | null>(null);

  /* UI อื่น ๆ */
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("12:00");

  const [vehicleItems, setVehicleItems] = useState<VehicleItem[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [passengerCount, setPassengerCount] = useState(2);
  const [selected, setSelected] = useState<Date[]>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState("08:00");
  const [openTime, setOpenTime] = useState(false);
  const [page, setPage] =
    useState<"type" | "create" | "map" | "package" | "package1" | "package2" | "confirm">("type");
  const [query, setQuery] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [mapMode, setMapMode] = useState<"pickup" | "dropoff">("pickup");

  /* โหลดรถ */
  useEffect(() => {
    (async () => {
      try {
        const items = await fetchDriverVehicles();
        setVehicleItems(items);
        setSelectedVehicleId(items[0]?.id ?? null);
      } catch {
        setVehicleItems([]);
        setSelectedVehicleId(null);
        setErrorBanner("โหลดยานพาหนะไม่สำเร็จ");
      }
    })();
  }, []);
  const selectedVehicle = useMemo(
    () => vehicleItems.find((v) => v.id === selectedVehicleId) || null,
    [vehicleItems, selectedVehicleId]
  );
  useEffect(() => {
    if (selectedVehicle?.capacity != null) {
      setPassengerCount((prev) => Math.max(1, Math.min(prev, selectedVehicle.capacity!)));
    }
  }, [selectedVehicleId, selectedVehicle?.capacity]);

  /* วันที่โชว์ช่วง */
  useEffect(() => {
    if (selected.length > 0) {
      const s = [...selected].sort((a, b) => a.getTime() - b.getTime());
      const th = (d: Date) =>
        `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}/${d.getFullYear() + 543}`;
      setStartDate(th(s[0]));
      setEndDate(th(s[s.length - 1]));
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  }, [selected]);

  useEffect(() => {
    if (page !== "package2") {
      setOpenTime(false);
      return;
    }
    const close = () => setOpenTime(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [page]);

  /* Helpers */
  function toApiDateTime(date: Date, hhmm: string) {
    const [hh, mm] = hhmm.split(":");
    const d = new Date(date);
    d.setHours(Number(hh), Number(mm), 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    // +07:00 สำหรับไทย
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}:00+07:00`;
  }
  function assertCapacityOrThrow() {
    const cap = selectedVehicle?.capacity;
    if (cap != null && passengerCount > cap) {
      throw new Error(`จำนวนคนนั่ง (${passengerCount}) เกินความจุที่นั่งของยานพาหนะ (${cap})`);
    }
  }
  const getSelectedVehicleType = () => selectedVehicle?.vehicle_type || null;

  async function safePostCreate(body: any) {
    try {
      setIsSubmitting(true);
      await api.post("/trips/create", body);
    } catch (e: any) {
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        alert("กรุณาเข้าสู่ระบบใหม่");
        router.push("/login");
      }
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function createOneTimeTrip() {
    if (!selectedVehicleId) throw new Error("กรุณาเลือกยานพาหนะที่ลงทะเบียน");
    if (!pickupIds.length) throw new Error("กรุณาเลือกจุดรับอย่างน้อย 1 จุด");
    assertCapacityOrThrow();
    const vtype = getSelectedVehicleType();
    if (!vtype) throw new Error("ยานพาหนะที่เลือกไม่มีประเภท (vehicle_type) โปรดแก้ข้อมูลรถ");
    const body = {
      available_seats: passengerCount,
      location_ids: pickupIds,
      path_name: "เส้นทางของฉัน",
      scheduled_start_time: toApiDateTime(selectedDate, selectedTime),
      vehicle_id: selectedVehicleId,
      vehicle_type: vtype,
    };
    await safePostCreate(body);
  }

  async function createPackageTrip() {
    if (!selectedVehicleId) throw new Error("กรุณาเลือกยานพาหนะที่ลงทะเบียน");
    if (pickupIds.length === 0 || dropoffId == null) throw new Error("ยังไม่เลือกจุดรับ/ส่ง");
    if (selected.length === 0) throw new Error("ยังไม่เลือกวันที่");
    assertCapacityOrThrow();
    const vtype = getSelectedVehicleType();
    if (!vtype) throw new Error("ยานพาหนะที่เลือกไม่มีประเภท (vehicle_type) โปรดแก้ข้อมูลรถ");

    const locationIdsBase = (pid: number) => [pid, dropoffId!];

    const payloads = selected
      .sort((a, b) => a.getTime() - b.getTime())
      .flatMap((d) =>
        pickupIds.map((pid, idx) => ({
          available_seats: passengerCount,
          location_ids: locationIdsBase(pid),
          path_name: `แพ็กเกจ-${toISODate(d)}-${idx + 1}`,
          scheduled_start_time: toApiDateTime(d, selectedStartTime),
          vehicle_id: selectedVehicleId,
          vehicle_type: vtype,
        }))
      );

    const results: { ok: boolean; msg?: string }[] = [];
    for (const b of payloads) {
      try {
        await safePostCreate(b);
        results.push({ ok: true });
      } catch (e: any) {
        results.push({ ok: false, msg: pickApiMessage(e) });
      }
    }
    const ok = results.filter((r) => r.ok).length;
    const fail = results.length - ok;
    if (fail > 0) {
      alert(
        `สร้างสำเร็จ ${ok} รายการ, ล้มเหลว ${fail} รายการ\n` +
          results
            .map((r, i) => (r.ok ? `` : `#${i + 1}: ${r.msg}`))
            .filter(Boolean)
            .join("\n")
      );
      if (ok === 0) throw new Error("ไม่มีรายการที่สำเร็จ");
    }
  }

  /* ---------- Pages ---------- */
  const renderTypePage = () => (
    <div className="bg-[#ffffff] min-h-screen w-full flex flex-col items-center pb-[140px] relative">
      <div className="w-full flex items-center justify-start px-6 mt-6">
        <BackButton2 />
      </div>
      {errorBanner && (
        <div className="mx-6 mt-3 w-full max-w-md rounded-lg bg-yellow-50 text-yellow-800 text-sm px-3 py-2">
          {errorBanner}
        </div>
      )}
      <div className="flex flex-col mt-20 items-start w-80">
        <h1 className="text-4xl font-semibold text-[#191919] mb-2">สร้างทริป</h1>
        <p className="text-base font-regular text-[#191919] leading-relaxed">
          เพื่อออกเดินทางไปยังที่ที่คุณต้องการได้ง่าย ๆ
        </p>
      </div>
      <div className="w-full px-6 mt-8 space-y-5">
        <button
          className="w-full bg-[#C5D4E8] rounded-2xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 active:shadow-md"
          onClick={() => setPage("create")}
        >
          <div className="text-left">
            <h2 className="text-xl font-semibold text-[#191919] mb-1">สร้างทริปแบบปกติ</h2>
            <p className="text-sm font-regular text-[#191919]">เดินทางเพียงครั้งเดียว</p>
          </div>
        </button>
        <button
          className="w-full bg-[#C5D4E8] rounded-2xl p-6 flex items_center justify-between shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 active:shadow-md"
          onClick={() => setPage("package")}
        >
          <div className="text-left">
            <h2 className="text-xl font-semibold text-[#191919] mb-1">สร้างทริปแบบขาประจำ</h2>
            <p className="text-sm font-regular text-[#191919] leading-relaxed">
              เลือกวันและเวลาที่ต้องการเดินทางเป็นประจำ
            </p>
          </div>
        </button>
      </div>
      <div className="flex justify-center items-end h-[320px] mt-8">
        <img src="/homeBK.png" alt="Booking illustration" className="w-full max-w-[280px] h-auto object-contain" />
      </div>
    </div>
  );

  /* ---------- หน้าสร้างทริปปกติ ---------- */
  const renderCreatePage = () => {
    const SHOW_INLINE = 3;
    const tooMany = pickupNames.length > SHOW_INLINE;
    const cap = selectedVehicle?.capacity ?? Infinity;

    return (
      <div className="bg-[#C5D4E8] min-h-screen w-full flex flex-col">
        <div className="w-full flex items-center justify-start px-6 mt-6">
          <BackButton2 onBack={() => setPage("type")} />
        </div>
        <div className="flex flex-col items-center px-6 mb-10 mt-6">
          <h1 className="text-4xl font-regular text-[#191919]">สร้างทริปปกติ</h1>
        </div>

        {/* จุดรับหลายจุด */}
        <div className="mx-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-regular text-center mb-6 text-[#191919]">
              เลือกจุดรับส่ง (เพิ่มได้หลายจุด)
            </h2>
            <div className="space-y-3 relative font-light">
              {pickupNames.slice(0, 3).map((name, idx) => (
                <LocationRow
                  key={`${name}-${idx}`}
                  value={name}
                  showLine={idx < Math.min(3, pickupNames.length) - 1}
                  onRemove={() => removePickupAt(idx)}
                />
              ))}

              {tooMany && (
                <details className="bg-[#8B8B8B]/10 rounded-2xl">
                  <summary className="list-none cursor-pointer px-4 py-3 rounded-2xl flex items-center justify-between">
                    <span className="text-[#191919] font-regular">
                      จุดรับทั้งหมด ({pickupNames.length})
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </summary>
                  <div className="px-4 pb-4 space-y-3">
                    {pickupNames.slice(3).map((name, i) => (
                      <LocationRow
                        key={`${name}-more-${i}`}
                        value={name}
                        onRemove={() => removePickupAt(3 + i)}
                      />
                    ))}
                  </div>
                </details>
              )}

              <div className="flex items-center space-x-3 pt-2">
                <div className="w-4 h-4 bg-black rounded-full flex-shrink-0" />
                <button
                  className="flex-1 bg-gray-100 rounded-3xl px-4 py-3 flex items-center justify-between text-gray-700 hover:bg-gray-200"
                  onClick={() => setPage("map")}
                >
                  <span>เลือก “จุดรับ” จากแผนที่</span>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Date/Time/Vehicle/Passenger */}
        <div className="mx-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#191919] font-light">วันที่</span>
              <SimpleCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#191919] font-light">เวลาออกเดินทาง</span>
              <TimePicker selectedTime={selectedTime} setSelectedTime={setSelectedTime} />
            </div>

            <div className="pt-2">
              <span className="text-[#191919] font-light">ยานพาหนะ</span>
              <div className="mt-2">
                <VehiclePicker
                  items={vehicleItems}
                  selectedId={selectedVehicleId}
                  setSelectedId={setSelectedVehicleId}
                />
              </div>
              {vehicleItems.length === 0 && (
                <p className="text-xs text-red-600 mt-2">
                  ยังไม่มีรถที่ลงทะเบียน – โปรดเพิ่มรถก่อนจองทริป
                </p>
              )}
            </div>

            <div className="flex items-center justify_between pt-2">
              <span className="text-[#191919] font-light">จำนวนคนนั่ง</span>
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <ProfileIcon />
                <span className="text-[#191919] font-light ml-2">{passengerCount}</span>
                <div className="ml-2 flex flex-col">
                  <button
                    className="h-4 w-4 p-0 flex items-center justify-center disabled:opacity-40"
                    onClick={() => setPassengerCount((n) => Math.min(n + 1, cap))}
                    disabled={passengerCount >= cap}
                    aria-label="increase"
                  >
                    <img src="/arrow-up.png" alt="up" className="h-3 w-3" />
                  </button>
                  <button
                    className="h-4 w-4 p-0 flex items-center justify-center"
                    onClick={() => setPassengerCount((n) => Math.max(1, n - 1))}
                    aria-label="decrease"
                  >
                    <img src="/arrow-down.png" alt="down" className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
            {selectedVehicle?.capacity != null && passengerCount >= selectedVehicle.capacity && (
              <p className="text-xs text-[#b45309]">ถึงจำนวนสูงสุดของยานพาหนะแล้ว</p>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            <button
              className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text_black font-light py-3 rounded-3xl hover:bg-[#d9956f] transition-colors duration-200 disabled:opacity-50"
              onClick={async () => {
                try {
                  await createOneTimeTrip();
                  router.push("/driver/home?created=1");
                } catch (e: any) {
                  alert(pickApiMessage(e));
                }
              }}
              disabled={isSubmitting || pickupIds.length === 0 || !selectedVehicleId}
            >
              {isSubmitting ? "กำลังสร้าง..." : "ยืนยัน"}
            </button>
          </div>
        </div>

        <div className="fixed bottom-0 w-full">
          <NavBar />
        </div>
        <div className="h-20" />
      </div>
    );
  };

  /* ---------- หน้าแผนที่ ---------- */
  const renderMapPage = () => {
    const filtered = query.trim()
      ? locations.filter((m) => (m.name ?? "").toLowerCase().includes(query.trim().toLowerCase()))
      : locations;

    const onPick = (id: number | string) => togglePickupId(Number(id));
    const flyTo = (loc: LocationType) => {
      mapRef.current?.flyTo([loc.lat, loc.lng], 16, { duration: 1 });
    };

    return (
      <div className="bg-[#C5D4E8] min-h-screen w-full flex flex-col items-center pb-[140px] relative">
        <div className="w-full flex flex-col items-center px-6 mt-2">
          <div className="w-full max-w-md flex items-center mt-2">
            <BackButton2 onBack={() => setPage("create")} />
          </div>

          <div className="w-full max-w-md h-[700px] border-[1px] border-[#8B8B8B] rounded-2xl overflow-hidden relative bg-white mt-20">
            {/* Overlay ค้นหา + รายการ */}
            <div className="absolute top-5 left-3 right-3 z-[1200] pointer-events-auto">
              <div className="flex items-center bg-white/95 rounded-full px-4 py-2 shadow">
                <img src="/icon_search.svg" alt="search" className="w-4 h-4 mr-2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ค้นหาสถานที่ / จุดรับ"
                  className="flex-1 outline-none text-sm text-[#191919] bg-transparent"
                />
              </div>

              {pickupIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {pickupIds.map((id) => {
                    const n = locList.find((l) => l.id === id)?.name ?? `ID ${id}`;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center bg_white rounded-full border px-3 py-1 text-xs shadow"
                      >
                        {n}
                        <button
                          className="ml-2 text-gray-500 hover:text-red-600"
                          onClick={() => removePickupById(id)}
                          aria-label="remove-pick"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="mt-2">
                <div className="inline-block bg-black/70 text-white font-light text-xs px-3 py-1 rounded-full">
                  เลือกแล้ว: <span className="font-medium">{pickupIds.length}</span> จุดรับ
                </div>
              </div>

              {query.trim() && (
                <div className="mt-2 max-h-52 overflow-auto bg-white rounded-xl shadow border">
                  {filtered.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">ไม่พบสถานที่</div>
                  ) : (
                    filtered.slice(0, 12).map((m) => {
                      const isSel = pickupIds.includes(Number(m.id));
                      return (
                        <button
                          key={String(m.id)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex justify_between"
                          onClick={() => {
                            onPick(m.id);
                            flyTo(m);
                          }}
                        >
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* แผนที่ (Leaflet) */}
            <MapSelectComponent
              locations={locations}
              mapRef={mapRef}
              onMarkerSelect={(loc) => {
                if (!loc) return;
                togglePickupId(Number(loc.id));
              }}
            />

            {/* แถบล่าง */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/95 p-3 space-y-2 border-t">
              <div className="text-sm text-[#191919]">แตะหมุดเพื่อเลือก/ยกเลิก “จุดรับ”</div>
              <button
                className="w-full mt-1 bg-[#B55C32] text-white font-light py-2.5 rounded-2xl shadow hover:bg-[#944724]"
                onClick={() => setPage("create")}
              >
                ใช้จุดรับที่เลือกแล้ว
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ---------- หน้าแพ็กเกจ ---------- */
  const renderPackagePage = () => (
    <div className="min-h-screen w/full flex flex-col justify-between bg-gradient-to-b from-[#FFFFFF] to-[#C5D4E8]">
      <div>
        <div className="w-full flex items-center justify-start px-6 mt-2">
          <BackButton2 onBack={() => setPage("type")} />
        </div>
        <div className="flex flex-col items-center text-center mt-16 px-10 py-10">
          <h1 className="text-5xl font-regular text-[#191919] mb-6">สร้างทริปแบบ ขาประจำ</h1>
          <img src="/home_package.png" alt="Home Package" className="w-32 h-20 mb-8" />
          <p className="text-base font-light text-[#191919]">
            เลือกวันและสถานที่ที่ต้องการ
            <br />
            ล่วงหน้าใน 4 สัปดาห์
          </p>
        </div>
      </div>
      <div>
        <div className="text-center text-sm font-light text-[#B55C32] mb-4">หมายเหตุ: จุดรับและเวลา จะเหมือนเดิมทุกครั้ง</div>
        <div className="bg-white rounded-t-2xl shadow-inner px-6 pt-4 pb-6">
          <button
            className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl shadow-md hover:bg-[#d9956f] transition-colors duration-200"
            onClick={() => setPage("package1")}
          >
            สร้างแพ็คเกจทริปขาประจำ
          </button>
        </div>
      </div>
    </div>
  );

  /* ---------- หน้าแพ็กเกจ 1/3: เลือกจุดรับส่ง + แผนที่ ---------- */
  const renderPackage1Page = () => {
    const SHOW_INLINE = 3;
    const tooMany = pickupNames.length > SHOW_INLINE;

    return (
      <div className="bg-[#C5D4E8] min-h-screen w-full flex flex-col items-center pb-[140px]">
        <div className="w-full flex flex-col items-center px-6 mt-2">
          <div className="w-full max-w-md flex items-center mt-2">
            <BackButton2 onBack={() => setPage("package")} />
          </div>
          <div className="flex-1 text-center py-6">
            <h1 className="text-lg text-black font-light">การสร้างทริปขาประจำ หน้า 1/3</h1>
            <p className="text-xl font-regular text-black">เลือกจุดรับ-ส่ง</p>
          </div>

          <div className="mx-4 mb-6 w-full max-w-md">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-regular text-center mb-6 text-[#191919]">
                เลือกจุดรับส่ง (เพิ่มได้หลายจุด)
              </h2>

              <div className="space-y-3 relative font-light">
                {pickupNames.slice(0, SHOW_INLINE).map((name, idx) => (
                  <LocationRow
                    key={`${name}-${idx}`}
                    value={name}
                    showLine={idx < Math.min(SHOW_INLINE, pickupNames.length) - 1}
                    onRemove={() => removePickupAt(idx)}
                  />
                ))}

                {tooMany && (
                  <details className="bg-[#8B8B8B]/10 rounded-2xl">
                    <summary className="list-none cursor-pointer px-4 py-3 rounded-2xl flex items-center justify-between">
                      <span className="text-[#191919] font-regular">
                        จุดรับทั้งหมด ({pickupNames.length})
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </summary>
                    <div className="px-4 pb-4 space-y-3">
                      {pickupNames.slice(SHOW_INLINE).map((name, i) => (
                        <LocationRow
                          key={`${name}-more-${i}`}
                          value={name}
                          onRemove={() => removePickupAt(SHOW_INLINE + i)}
                        />
                      ))}
                    </div>
                  </details>
                )}

                <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 rounded-full px-4 py-2">
                  <img src="/location.png" className="w-4 h-4" />
                  <span>แตะหมุดบนแผนที่ด้านล่างเพื่อเลือกจุดรับ/ส่ง</span>
                </div>
              </div>
            </div>
          </div>

          {/* แผนที่ */}
          <div className="w-full max-w-md h-[450px] border-[1px] border-[#8B8B8B] rounded-2xl overflow-hidden relative bg-white">
            <MapSelectComponent
              locations={locations}
              mapRef={mapRef}
              onMarkerSelect={(loc) => {
                if (!loc) return;

                if (dropoffId == null) {
                  setDropoffId(Number(loc.id));
                } else {
                  togglePickupId(Number(loc.id));
                }
              }}
            />

            <div className="absolute top-3 left-3 bg-black/70 text-white font-light text-xs px-3 py-1 rounded-full">
              {dropoffId == null ? "เลือกจุดรับส่ง" : "เลือกจุดรับ (เพิ่มได้หลายจุด)"}
            </div>
          </div>

          <div className="mt-4 w-full max-w-md">
            <button
              className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl hover:bg-[#d9956f] transition-colors duration-200 disabled:opacity-50"
              onClick={() => setPage("package2")}
              disabled={pickupIds.length === 0 || dropoffId == null}
            >
              ขั้นตอนถัดไป
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ---------- หน้าแพ็กเกจ 2/3---------- */
  const renderPackage2Page = () => {
    const timeOptions = [
      "05:00","05:30","06:00","06:30","07:00","07:30","08:00","08:30","09:00","09:30",
      "10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30",
      "15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
    ];
    const cap = selectedVehicle?.capacity ?? Infinity;

    return (
      <div className="bg-[#C5D4E8] min-h-screen w-full flex flex-col items-center pb-20 px-1.5">
        <div className="flex flex-col items-center mt-8 w-full max-w-3xl px-4 mx-auto">
          <div className="w-full flex items-center mb-4">
            <BackButton2 onBack={() => setPage("package1")} />
          </div>

          <div className="text-center mt-1 mb-6">
            <h1 className="text-lg font-light text-black">การสร้างทริปขาประจำ หน้า 2/3</h1>
            <h1 className="text-xl font-regular text-black">เลือกวันที่และเวลาที่ต้องการ</h1>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <p className="text-sm font-light text-black">ตั้งแต่</p>
            <div className="px-3 py-2 bg-white rounded-2xl shadow text-sm font-light shadow-md shadow-black/50">
              {startDate ?? "--/--/----"}
            </div>
            <p className="text-sm font-light text_black">ถึง</p>
            <div className="px-3 py-2 bg-white rounded-2xl shadow text-sm font-light shadow-md shadow_black/50">
              {endDate ?? "--/--/----"}
            </div>
          </div>

          <div className="font-light w-full bg-white rounded-2xl shadow p-4 mb-6 shadow-md shadow-black/50">
            <CalendarComponent selected={selected} setSelected={setSelected} />
            <p className="text-l font-light text-center text-[#B55C32]">
              จิ้มที่วันที่เพื่อเลือก - จิ้มอีกครั้งเพื่อยกเลิก
            </p>
          </div>

          <div className="w-full bg-white rounded-2xl shadow p-6 mb-6 text-center shadow-md shadow-black/50">
            <p className="text-black font-light mb-2">คุณเลือกไปแล้ว</p>
            <div className="flex justify-center items-center gap-2 text-[#B55C32] text-2xl font-light">
              <CalendarIcon2 className="h-8 w-8" />
              {selected.length} วัน
            </div>

            <div className="mt-6">
              <p className="text-black font-light mb-2">เวลาออกเดินทาง</p>

              <div className="relative inline-block select-none" onClick={(e) => e.stopPropagation()}>
                <div
                  className="flex items-center bg-[#8B8B8B]/10 px-3 py-2 rounded-full cursor-pointer border border-[#ddd]"
                  onClick={() => setOpenTime((v) => !v)}
                >
                  <ClockIcon />
                  <span className="ml-2 text-[#191919] font-light text-base">
                    {selectedStartTime}
                  </span>
                </div>
                {openTime && (
                  <div className="absolute left-0 top-full mt-2 bg-white border rounded-l shadow-xl max-h-48 overflow-y-auto z-50 w-32">
                    {timeOptions.map((t) => (
                      <div
                        key={t}
                        className={`px-3 py-2 cursor-pointer text-sm ${
                          t === selectedStartTime
                            ? "bg-[#B55C32] text-white font-light"
                            : "hover:bg-[#E6A88A] text-[#191919] font-light"
                        }`}
                        onClick={() => {
                          setSelectedStartTime(t);
                          setOpenTime(false);
                        }}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 w-full">
                <span className="text-[#191919] font-light">ยานพาหนะ</span>
                <div className="mt-2">
                  <VehiclePicker
                    items={vehicleItems}
                    selectedId={selectedVehicleId}
                    setSelectedId={setSelectedVehicleId}
                  />
                </div>
                {vehicleItems.length === 0 && (
                  <p className="text-xs text-red-600 mt-2">
                    ยังไม่มีรถที่ลงทะเบียน – โปรดเพิ่มรถก่อนจองทริป
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <span className="text-[#191919] font-light">จำนวนคนนั่ง</span>
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                  <ProfileIcon />
                  <span className="text-[#191919] font-light ml-2">{passengerCount}</span>
                  <div className="ml-2 flex flex-col">
                    <button
                      className="h-4 w-4 p-0 flex items-center justify-center disabled:opacity-40"
                      onClick={() => setPassengerCount((n) => Math.min(n + 1, cap))}
                      disabled={passengerCount >= cap}
                      aria-label="increase"
                    >
                      <img src="/arrow-up.png" alt="up" className="h-3 w-3" />
                    </button>
                    <button
                      className="h-4 w-4 p-0 flex items_center justify-center"
                      onClick={() => setPassengerCount((n) => Math.max(1, n - 1))}
                      aria-label="decrease"
                    >
                      <img src="/arrow-down.png" alt="down" className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
              {selectedVehicle?.capacity != null && passengerCount >= selectedVehicle.capacity && (
                <p className="text-xs text-[#b45309] mt-1">ถึงจำนวนสูงสุดของยานพาหนะแล้ว</p>
              )}
            </div>
          </div>

          <div className="mt-4 w-full max-w-3xl px-2">
            <button
              className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl hover:bg-[#d9956f] transition-colors duration-200 disabled:opacity-50"
              onClick={() => setPage("confirm")}
              disabled={isSubmitting || selected.length === 0 || !selectedVehicleId}
            >
              ต่อไป
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ---------- หน้าแพ็กเกจ 3/3: Confirm ---------- */
  const renderConfirmPage = () => {
    const sel = selectedVehicle;
    const selLabel = sel?.label || "—";
    const cap = sel?.capacity ?? Infinity;

    const pickupItems = pickupIds
      .map((id) => locList.find((l) => l.id === id)?.name)
      .filter((n): n is string => Boolean(n));

    const dropoffName = locList.find((l) => l.id === (dropoffId ?? -1))?.name || "-";

    return (
      <div className="bg-[#C5D4E8] min-h-screen w-full flex flex-col items-center pb-20 px-6">
        <div className="w-full max-w-md flex items-center mt-4">
          <BackButton2 onBack={() => setPage("package2")} />
        </div>

        <div className="flex-1 text-center mt-4 py-5">
          <h1 className="text-lg text-black font-light">การสร้างทริปขาประจำ หน้า 3/3</h1>
          <p className="text-xl font-normal text-black mt-2">ยืนยันการสร้าง</p>
          <p className="text-xl font-light text-[#B55C32] mt-2">กรุณาตรวจสอบรายการเดินทาง</p>
        </div>

        <div className="w-full max-w-md bg-white font-light rounded-2xl p-4 shadow-md shadow-black/50 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#191919]">จุดรับทั้งหมด</span>
            <span className="text-[#6b7280] text-sm">{pickupItems.length} จุด</span>
          </div>

          <div className="flex flex-col gap-3 relative">
            {pickupItems.length === 0 ? (
              <LocationBox value="-" />
            ) : (
              pickupItems.map((name, idx) => (
                <LocationBox
                  key={`${name}-${idx}`}
                  value={name}
                  showLine={idx < pickupItems.length - 1 || true}
                />
              ))
            )}

            {/* จุดส่ง (ต่อท้าย) */}
            <LocationBox value={dropoffName} />
          </div>
        </div>

        {/* ปฏิทินแสดงวันที่ที่เลือก */}
        <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-6 font-light">
          <div className="pointer-events-none select-none">
            <CalendarComponent selected={selected} setSelected={() => {}} />
          </div>
          <p className="text-sm text-center text-[#B55C32] mt-2">วันที่ที่เลือกจะถูกสร้างตามนี้</p>
        </div>

        {/* สรุปจำนวนวัน/เวลา/รถ */}
        <div className="w-full max-w-md bg-white rounded-2xl p-6 mb-6 text-center shadow-md shadow-black/50 font-light">
          <p className="text-black mb-2">คุณเลือกไปแล้ว</p>
          <div className="flex justify-center items-center gap-2 text-[#B55C32] text-2xl">
            <CalendarIcon2 className="h-8 w-8" />
            {selected.length} วัน
          </div>
          <div className="mt-4 text-sm text-[#191919] space-y-1">
            <div>เวลาออกเดินทาง: <span className="font-medium">{selectedStartTime}</span></div>
            <div>ยานพาหนะ: <span className="font-medium">{selLabel}</span></div>
            <div>จำนวนคนนั่ง: <span className="font-medium">{passengerCount}</span> (สูงสุด {cap === Infinity ? "-" : cap})</div>
          </div>
        </div>

        {/* ปุ่มยืนยัน */}
        <button
          onClick={() => setShowPopup(true)}
          className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl hover:bg-[#d9956f] transition-colors duration-200 disabled:opacity-50"
          disabled={
            isSubmitting ||
            !(pickupIds.length > 0 && typeof dropoffId === "number" && selected.length > 0 && selectedVehicleId)
          }
        >
          {isSubmitting ? "กำลังสร้าง..." : "ยืนยัน"}
        </button>

        {/* Popup ยืนยัน */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg w-[80%] max-w-[350px] p-6 text-center overflow-y-auto max-h-[90vh]">
              <p className="text-[#191919] text-m font-semibold mb-2">เมื่อสร้างแล้วจะไม่สามารถแก้ไขได้</p>
              <p className="text-[#191919] text-sm font-light mb-4">แน่ใจหรือไม่ว่าต้องการทำรายการนี้</p>
              <div className="flex justify-between mt-5">
                <button
                  onClick={() => setShowPopup(false)}
                  className="flex-1 bg-white border border-[#B55C32] text-[#191919] py-2 rounded-3xl mr-2"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={async () => {
                    try {
                      if (sel?.capacity != null && passengerCount > sel.capacity) {
                        alert(`จำนวนคนนั่ง (${passengerCount}) เกินความจุที่นั่งของยานพาหนะ (${sel.capacity})`);
                        return;
                      }
                      setShowPopup(false);
                      await createPackageTrip();
                      router.push("/driver/home?created=1");
                    } catch (e: any) {
                      alert(pickApiMessage(e));
                    }
                  }}
                  className="flex-1 bg-[#E6A88A] border border-[#B55C32] text-[#191919] py-2 rounded-3xl ml-2"
                >
                  ตกลง
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ---------- Switcher ---------- */
  return (
    <>
      {page === "type" && renderTypePage()}
      {page === "create" && renderCreatePage()}
      {page === "map" && renderMapPage()}
      {page === "package" && renderPackagePage()}
      {page === "package1" && renderPackage1Page()}
      {page === "package2" && renderPackage2Page()}
      {page === "confirm" && renderConfirmPage()}
    </>
  );
}
