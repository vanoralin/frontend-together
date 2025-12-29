"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaMotorcycle, FaCar } from "react-icons/fa";
import CalendarComponent from "@/app/components/Calendar";
import axios from "axios";
import { BackButton2 } from "@/app/components/BackButton2";
import { ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import L from "leaflet";

/* ================== Axios (ผ่านพร็อกซี /api) ================== */
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/* ==================  MapSelectComponent ================== */
const MapSelectComponent = dynamic(
  () => import("@/app/components/MapSelectComponent"),
  { ssr: false }
);

/* ================== Types ================== */
type UserProfile = { id: number; name: string; email: string; role: string; balance: number };
type LocationItem = { id: number; name: string; lat: number; lng: number };
type EstimateRes = {
  base_fare?: number;
  rate_per_km?: number;
  distance_km?: number;
  estimated_price?: number | string;
  seats?: number;
  vehicle_type?: string;
  message?: string;
};
type BookRes = {
  message?: string;
  reservation?: {
    id?: number;
    trip_id?: number;
  };
};

/* ================== Helpers ================== */
const vehicleToApi = (v: "จักรยานยนต์" | "รถยนต์" | "รถยนต์ขนาดใหญ่") => {
  if (v === "จักรยานยนต์") return "motorcycle";
  if (v === "รถยนต์ขนาดใหญ่") return "suv";
  return "car";
};

/** แปลง DD/MM/YYYY (พ.ศ.) + HH:mm -> ISO local +07:00 (ไม่มีมิลลิวินาที) */
const toApiLocalISO = (thaiDDMMYYYY: string, hhmm: string) => {
  const [d, m, by] = thaiDDMMYYYY.split("/").map(Number);
  const gy = by - 543;
  const [hh, mm] = hhmm.split(":");
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${gy}-${pad(m)}-${pad(d)}T${pad(+hh)}:${pad(+mm)}:00+07:00`;
};
/** แปลง Date + เวลา (HH:mm) -> ISO local +07:00 (ไม่มีมิลลิวินาที) */
const toApiLocalISOFromDate = (date: Date, hhmm: string) => {
  const pad = (x: number) => String(x).padStart(2, "0");
  const [hh, mm] = hhmm.split(":");
  const gy = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  return `${gy}-${m}-${d}T${pad(+hh)}:${pad(+mm)}:00+07:00`;
};
/** ดึงข้อความตอบกลับจาก API แบบปลอดภัย */
function getApiMessage(d: unknown, fallback = ""): string {
  if (d == null) return fallback;
  if (typeof d === "string") return d || fallback;
  if (typeof d === "object") {
    const o = d as Record<string, unknown>;
    for (const k of ["message", "msg", "status", "detail", "title", "error"]) {
      const v = o[k];
      if (typeof v === "string" && v.trim()) return v;
    }
  }
  return fallback;
}
/** สุ่มไอดีสำหรับ Idempotency-Key (กันกดซ้ำ) */
const rid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

/* ================== VehiclePicker ================== */
function VehiclePicker({
  selectedVehicle,
  setSelectedVehicle,
  disabled = false,
}: {
  selectedVehicle: string;
  setSelectedVehicle: (v: string) => void;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  const vehicles = ["จักรยานยนต์", "รถยนต์", "รถยนต์ขนาดใหญ่"];

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    disabled ? <div className="pointer-events-none select-none">{children}</div> : <>{children}</>;

  return (
    <div className="relative w-full">
      <Wrapper>
        <button
          className="w-full justify-between bg-gray-100 border border-gray-100 text-[#191919] rounded-3xl px-4 py-2 flex items-center"
          onClick={() => !disabled && setShow(!show)}
        >
          <span>{selectedVehicle || "เลือกยานพาหนะของคุณ"}</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {show && (
          <div className="absolute w-full mt-2 bg-white border rounded shadow-lg z-50 max-h-60 overflow-y-auto ">
            {vehicles.map(v => (
              <button
                key={v}
                className={`w-full text-left font-light px-4 py-2 hover:bg-blue-100 ${selectedVehicle === v ? "bg-blue-500 text-white" : "text-gray-700 "
                  }`}
                onClick={() => {
                  setSelectedVehicle(v);
                  setShow(false);
                }}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </Wrapper>
    </div>
  );
}

/* ================== Utils ================== */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(1 - a), Math.sqrt(a));
  return R * c;
}

/* ================== Small UI ================== */
function LocationBox({
  value,
  onClear,
  showLine = false
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
      <div className="relative z-10 flex items-center justify-between bg-[#8B8B8B]/10 rounded-full px-4 py-2 w-full ">
        <span className="text-black text-base ml-1 truncate">{value || "-"}</span>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-gray-500 hover:text-red-500 text-3xl font-light flex items-center justify-center w-8 h-8"
            aria-label="clear"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

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
      <button
        className="flex items-center bg-gray-100 rounded-full px-4 py-2"
        onClick={() => setOpen(!open)}
      >
        <span className="mr-2">{selectedTime}</span>
        <svg className="w-5 h-5 text-[#b55c32]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L12 13V7H12.5V12.2L17,14.7L16.2,16.2Z" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full mt-2 bg-white border rounded shadow-lg z-50 max-h-60 overflow-y-auto">
          {times.map((t) => (
            <button
              key={t}
              className={`w-full text-left px-4 py-2 hover:bg-[#E6A88A] ${selectedTime === t ? "bg-[#B55C32] text-white" : "text-gray-700"
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

/* ================== Main Component ================== */
export default function BookingMain() {
  const router = useRouter();
  const mapRef = useRef<L.Map | null>(null);

  type PageType =
    | "type"
    | "location"
    | "rideDetail"
    | "confirm"
    | "package"
    | "package1"
    | "package2"
    | "package3";
  const [page, setPage] = useState<PageType>("type");

  /* -------- Data from API -------- */
  const [me, setMe] = useState<UserProfile | null>(null);
  const [locs, setLocs] = useState<LocationItem[]>([]);
  const [pickupId, setPickupId] = useState<number | "">("");
  const [dropoffId, setDropoffId] = useState<number | "">("");

  const pickupName = useMemo(
    () => (typeof pickupId === "number" ? locs.find((l) => l.id === pickupId)?.name : "") || "",
    [pickupId, locs]
  );
  const dropoffName = useMemo(
    () => (typeof dropoffId === "number" ? locs.find((l) => l.id === dropoffId)?.name : "") || "",
    [dropoffId, locs]
  );

  const pickupLabel = typeof pickupId === "number" ? pickupName : "";
  const dropoffLabel = typeof dropoffId === "number" ? dropoffName : "";

  /* -------- Error / Popup -------- */
  const [showErr, setShowErr] = useState(false);
  const [errTitle, setErrTitle] = useState<string>("");
  const [errMsg, setErrMsg] = useState<string>("");
  const [showPopup, setShowPopup] = useState(false);

  /* -------- Success Popup -------- */
  const [showOk, setShowOk] = useState(false);
  const [okTitle, setOkTitle] = useState<string>("ทำรายการสำเร็จ");
  const [okMsg, setOkMsg] = useState<string>("");

  /* -------- เลือกจากแผนที่ -------- */
  const [mapMode, setMapMode] = useState<"pickup" | "dropoff">("pickup");

  /* -------- Ride (one-time) -------- */
  const [passengerCount, setPassengerCount] = useState(2);
  const [selectedVehicle, setSelectedVehicle] =
    useState<"จักรยานยนต์" | "รถยนต์" | "รถยนต์ขนาดใหญ่">("รถยนต์");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" })
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedTime, setSelectedTime] = useState("12:00");

  const [estim, setEstim] = useState<EstimateRes | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  /* -------- Package -------- */
  const [selectedPackage, setSelectedPackage] = useState<"bike" | "car" | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  // ราคาแพ็กเกจ (demo)
  const pkgBasePrice = selectedPackage === "bike" ? 650 : selectedPackage === "car" ? 1000 : 0;
  const pkgPrice = pkgBasePrice;

  /* -------- Helpers -------- */
  const canEstimate =
    typeof pickupId === "number" &&
    typeof dropoffId === "number" &&
    passengerCount > 0 &&
    !!selectedVehicle;

  /* -------- Init: profile + locations -------- */
  useEffect(() => {
    (async () => {
      try {
        const [p, l] = await Promise.all([
          api.get<UserProfile>("/User/profile"),
          api.get<LocationItem[]>("/locations"),
        ]);
        setMe(p.data);
        setLocs(l.data || []);
        if (l.data?.length) {
          setPickupId(l.data[0].id);
          setDropoffId(l.data[1]?.id ?? l.data[0].id);
        }
      } catch (e: any) {
        setErr(getApiMessage(e?.response?.data, e?.message || "โหลดข้อมูลไม่สำเร็จ"));
      }
    })();
  }, []);

  // sync ชื่อกล่องกับสถานที่จาก API
  const [location1, setLocation1] = useState("เลือกจุดรับ");
  const [location2, setLocation2] = useState("เลือกจุดส่ง");
  useEffect(() => setLocation1(pickupName || location1), [pickupName]);
  useEffect(() => setLocation2(dropoffName || location2), [dropoffName]);

  /* -------- ปฏิทิน (one-time) -------- */
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else setCurrentMonth(currentMonth - 1);
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else setCurrentMonth(currentMonth + 1);
  };
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDateX = new Date(firstDay);
    startDateX.setDate(startDateX.getDate() - firstDay.getDay());
    const days: any[] = [];
    const today = new Date();
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDateX);
      date.setDate(startDateX.getDate() + i);
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      const buddhistYear = year + 543;
      const isCurrentMonth = month === currentMonth;
      const isToday = date.toDateString() === today.toDateString();
      const dateString = `${day.toString().padStart(2, "0")}/${(month + 1)
        .toString()
        .padStart(2, "0")}/${buddhistYear}`;
      const isSelected = selectedDate === dateString;
      days.push({
        date,
        day,
        month,
        year,
        buddhistYear,
        dateString,
        isCurrentMonth,
        isToday,
        isSelected,
      });
    }
    return days;
  };
  const getThaiMonthName = (month: number) =>
    [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
    ][month];

  /* -------- เลือกจากแผนที่: หา location ที่ใกล้ที่สุด -------- */
  function selectNearest(lat: number, lng: number, mode: "pickup" | "dropoff") {
    if (!locs.length) return;
    let best = locs[0], bestD = haversine(lat, lng, best.lat, best.lng);
    for (const l of locs) {
      const d = haversine(lat, lng, l.lat, l.lng);
      if (d < bestD) { best = l; bestD = d; }
    }
    if (mode === "pickup") setPickupId(best.id);
    else setDropoffId(best.id);
  }

  /* -------- Actions: estimate + book (one-time) -------- */
  const doEstimate = async () => {
    setErr("");
    setEstim(null);
    if (!canEstimate) return setErr("กรุณาเลือกจุดรับ-ส่ง และจำนวนที่นั่ง");
    setLoading(true);
    try {
      const res = await api.post<EstimateRes>("/trips/estimate", {
        pickup_location_id: pickupId,
        dropoff_location_id: dropoffId,
        seats_required: passengerCount,
        vehicle_type: vehicleToApi(selectedVehicle),
        trip_type: "normal",
      });
      setEstim(res.data);
    } catch (e: any) {
      setErr(getApiMessage(e?.response?.data, e?.message || "คำนวณราคาไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
  };

  const doBook = async () => {
    setErr("");
    if (!canEstimate) return setErr("ข้อมูลไม่ครบ");
    setLoading(true);
    try {
      const res = await api.post<BookRes>(
        "/trips/book",
        {
          pickup_location_id: pickupId,
          dropoff_location_id: dropoffId,
          seats_required: passengerCount,
          vehicle_type: vehicleToApi(selectedVehicle),
          desired_departure_time: toApiLocalISO(selectedDate, selectedTime),
        },
        { headers: { "Idempotency-Key": `book-${rid()}` } }
      );
      const msg = getApiMessage(res?.data, "จองสำเร็จ");
      const tid = res?.data?.reservation?.trip_id ?? res?.data?.reservation?.id;

      setShowPopup(false);

      try {
        const p = await api.get<UserProfile>("/User/profile");
        setMe(p.data);
      } catch {/* ignore */ }

      setOkTitle("จองสำเร็จ");
      setShowOk(true);
    } catch (e: any) {
      const code = e?.response?.status;
      let title = "เกิดข้อผิดพลาด";
      let m = getApiMessage(e?.response?.data) || e?.message || "จองไม่สำเร็จ";
      if (code === 404) { title = "ไม่พบทริปที่เหมาะสม"; m = "ขออภัย ไม่พบทริปที่ตรงกับเงื่อนไขของคุณในช่วงเวลานี้"; }
      else if (code === 409) { title = "ไม่สามารถจองได้"; m = "ทริปไม่พร้อมหรือยอดเงินไม่พอ กรุณาลองใหม่หรือเติมเงิน"; }
      else if (code === 401 || code === 403) {
        title = "ต้องเข้าสู่ระบบ";
        m = "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่";
      }
      setErrTitle(title); setErrMsg(String(m)); setShowPopup(false); setShowErr(true);
    } finally { setLoading(false); }
  };

  /* -------- Package derived state: start/end text -------- */
  useEffect(() => {
    if (!selectedDates.length) { setStartDate(null); setEndDate(null); return; }
    const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    const toTH = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear() + 543}`;
    setStartDate(toTH(sorted[0]));
    setEndDate(toTH(sorted[sorted.length - 1]));
  }, [selectedDates]);

  /* -------- ซื้อแพ็กเกจ (หักเงินทันทีบน backend) -------- */
  const doRequestPackage = async () => {
    if (typeof pickupId !== "number" || typeof dropoffId !== "number") {
      setErrTitle("ข้อมูลไม่ครบ"); setErrMsg("กรุณาเลือกจุดรับและจุดส่ง"); setShowErr(true); return;
    }
    if (!selectedPackage) { setErrTitle("ข้อมูลไม่ครบ"); setErrMsg("กรุณาเลือกประเภทแพ็กเกจ"); setShowErr(true); return; }
    if (!selectedDates.length) { setErrTitle("ข้อมูลไม่ครบ"); setErrMsg("กรุณาเลือกวันที่อย่างน้อย 1 วัน"); setShowErr(true); return; }

    setLoading(true);
    try {
      // === payload ตามที่ backend ต้องการ ===
      const Dates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime()).map((d) => d.getDate());
      const time = `${selectedTime.padStart(5, "0")}:00`;
      const vehicle_type = selectedPackage === "bike" ? "motorcycle" : "car";

      const payload = {
        time,
        Dates,
        pickup_location_id: pickupId,
        dropoff_location_id: dropoffId,
        vehicle_type,
      };

      await api.post("/daily-packages/requests", payload, {
        headers: { "Idempotency-Key": `pkg-${rid()}` },
      });

      // รีเฟรชยอดเงิน (backend หักเงินแล้ว)
      try {
        const p = await api.get<UserProfile>("/User/profile");
        setMe(p.data);
      } catch {/* ignore */ }

      setShowPopup(false);
      setOkTitle("ซื้อแพ็กเกจสำเร็จ");
      setOkMsg(`ทำรายการสำเร็จ และหักเงินในกระเป๋าแล้ว`);
      setShowOk(true);
    } catch (e: any) {
      setErrTitle("ซื้อแพ็กเกจไม่สำเร็จ");
      setErrMsg(getApiMessage(e?.response?.data, e?.message || "โปรดลองใหม่อีกครั้ง"));
      setShowErr(true);
    } finally {
      setLoading(false);
    }
  };

  /* ================= Pages ================= */

  const renderTypePage = () => (
    <div className="bg-[#ffffff] min-h-screen w-full flex flex-col items-center pb-[140px] relative">
      <div className="w-full flex items-center justify-start px-6 mt-6" style={{ cursor: "pointer" }}>
        <BackButton2 />
      </div>
      <div className="flex flex-col mt-20 items-start w-80">
        <h1 className="text-4xl font-semibold text-[#191919] mb-2">จองทริป</h1>
        <p className="text-base font-regular text-[#191919] leading-relaxed">เพื่อออกเดินทางไปยังที่ที่คุณต้องการได้ง่าย ๆ</p>
      </div>
      <div className="w-full px-6 mt-8 space-y-5">
        <button
          className="w-full bg-[#C5DEDA] rounded-2xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 active:shadow-md"
          onClick={() => setPage("location")}
        >
          <div className="text-left">
            <h2 className="text-xl font-semibold text-[#191919] mb-1">จองทริปแบบปกติ</h2>
            <p className="text-sm font-regular text-[#191919]">เดินทางเพียงครั้งเดียว</p>
          </div>
        </button>
        <button
          className="w-full bg-[#C5DEDA] rounded-2xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 active:shadow-md"
          onClick={() => setPage("package")}
        >
          <div className="text-left">
            <h2 className="text-xl font-semibold text-[#191919] mb-1">จองทริปแบบขาประจำ</h2>
            <p className="text-sm font-regular text-[#191919] leading-relaxed">เลือกวันและเวลาที่ต้องการเดินทางเป็นประจำ</p>
          </div>
        </button>
      </div>
      <div className="flex justify-center items-end h-[320px] mt-8">
        <img src="/homeBK.png" alt="Booking illustration" className="w-full max-w-[280px] h-auto object-contain" />
      </div>
    </div>
  );

  /* ---------- เลือกจุดรับ–ส่งจากแผนที่ ---------- */
  const renderLocationPage = () => (
    <div className="bg-[#C5DEDA] min-h-screen w-full flex flex-col items-center pb-[140px]">
      <div className="w-full flex flex-col items-center px-6 mt-2">
        <div className="w-full max-w-md flex items-center mt-2" style={{ cursor: "pointer" }}>
          <BackButton2 onBack={() => setPage("type")} />
        </div>
        <div className="flex-1 text-center py-6">
          <h1 className="text-lg text-black font-light">การจองทริปใหม่ หน้า 1/3</h1>
          <p className="text-xl font-regular text-black">เลือกจุดรับส่ง</p>
        </div>

        {/* ชื่อจุดปัจจุบัน */}
        <div className="w-full max-w-md bg-white font-light rounded-2xl p-4 shadow-md shadow-black/50 mb-3">
          <div className="flex flex-col gap-3 relative">
            <LocationBox
              value={pickupLabel}
              onClear={() => {
                setPickupId("");
                setLocation1("");
              }}
              showLine
            />
            <LocationBox
              value={dropoffLabel}
              onClear={() => {
                setDropoffId("");
                setLocation2("");
              }}
            />
          </div>
        </div>

        {/* ปุ่มสลับโหมดคลิก */}
        <div className="w-full max-w-md flex gap-3 mb-3">
          <button
            className={`flex-1 rounded-full px-4 py-2 border ${mapMode === "pickup" ? "bg-[#B55C32] text-white font-light border-[#B55C32]" : "bg-white text-[#191919] font-light border-[#8B8B8B]"
              }`}
            onClick={() => setMapMode("pickup")}
          >
            เลือกจุดรับ
          </button>
          <button
            className={`flex-1 rounded-full px-4 py-2 border ${mapMode === "dropoff" ? "bg-[#B55C32] text-white font-light border-[#B55C32]" : "bg-white text-[#191919] font-light border-[#8B8B8B]"
              }`}
            onClick={() => setMapMode("dropoff")}
          >
            เลือกจุดส่ง
          </button>
        </div>

        {/* แผนที่ */}
        <div className="w-full max-w-md h-[450px] border-[1px] border-[#8B8B8B] rounded-2xl overflow-hidden relative">
          <MapSelectComponent
            locations={locs}
            mapRef={mapRef}
            onMarkerSelect={(loc) => {
              // loc: { id, name, lat, lng } จาก MapSelectComponent
              if (!loc) return;
              if (mapMode === "pickup") setPickupId(Number(loc.id));
              else setDropoffId(Number(loc.id));
              mapRef.current?.flyTo([loc.lat, loc.lng], 16, { duration: 1 });
            }}
            page={null}
          />
          <div className="absolute top-3 left-3 bg-black/70 text-white font-light text-xs px-3 py-1 rounded-full">
            คลิกเพื่อเลือก: {mapMode === "pickup" ? "จุดรับ" : "จุดส่ง"}
          </div>
        </div>

        <div className="mt-4 w-full max-w-md">
          <button
            className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl hover:bg-[#d9956f] transition-colors duration-200 disabled:opacity-50"
            onClick={() => setPage("rideDetail")}
            disabled={!(typeof pickupId === "number" && typeof dropoffId === "number")}
          >
            ขั้นตอนถัดไป
          </button>
        </div>
      </div>
    </div>
  );

  /* ---------- รายละเอียดการเดินทาง (one-time) ---------- */
  const renderRideDetailPage = () => (
    <div className="bg-[#C5DEDA] min-h-screen w-full flex flex-col items-center pb-20 px-6">
      <div className="w-full max-w-md flex items-center mt-4" style={{ cursor: "pointer" }}>
        <BackButton2 onBack={() => setPage("location")} />
      </div>
      <div className="flex-1 text-center py-9">
        <h1 className="text-lg text-black font-light">การจองทริปใหม่ หน้า 2/3</h1>
        <p className="text-xl font-regular text-black">รายละเอียดการเดินทาง</p>
      </div>

      {/* Location Box */}
      <div className="w-full max-w-md bg-white font-light rounded-2xl p-4 shadow-md shadow-black/50 mb-4">
        <div className="flex flex-col gap-4 relative">
          <LocationBox value={pickupLabel} showLine />
          <LocationBox value={dropoffLabel} />
        </div>
      </div>

      {/* Ride Details */}
      <div className="w-full max-w-md bg-white font-light rounded-2xl p-4 shadow-md shadow-black/50 mb-4">
        {/* วันที่ */}
        <div className="px-3">
          <div className="flex items-center mb-4 relative">
            <span className="text-[#191919] font-light text-base mr-3">วันที่</span>
            <div
              className="flex items-center bg-[#8B8B8B]/10 px-3 py-1 rounded-full cursor-pointer"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <span className="text-[#191919] font-light text-base mr-2">{selectedDate}</span>
              <svg className="w-5 h-5 text-[#b55c32]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c-1.1 0-2-.9-2-2zm0 16H5V8h14v11z" />
              </svg>
            </div>

            {showDatePicker && (
              <div className="absolute z-50 mt-10 bg-white border rounded shadow-md p-5">
                <div className="flex justify-between items-center mb-2">
                  <button onClick={handlePrevMonth}>{"<"}</button>
                  <span className="font-light">
                    {getThaiMonthName(currentMonth)} {currentYear + 543}
                  </span>
                  <button onClick={handleNextMonth}>{">"}</button>
                </div>
                <div className="grid grid-cols-7 text-center mb-1">
                  {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => (
                    <div key={d} className="font-light">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center font-light">
                  {generateCalendarDays().map((day) => (
                    <div
                      key={day.date.toString()}
                      className={`p-1 rounded cursor-pointer ${day.isSelected ? "bg-[#b55c32] text-white" : ""
                        } ${day.isCurrentMonth ? "" : "text-gray-400"}`}
                      onClick={() => {
                        setSelectedDate(day.dateString);
                        setShowDatePicker(false);
                      }}
                    >
                      {day.day}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* เวลาเดียวตาม API */}
          <p className="text-[#191919] font-light text-base mb-1">เวลา ที่สามารถรอรับได้</p>
          <div className="flex items-center justify-center mb-4">
            <TimePicker selectedTime={selectedTime} setSelectedTime={setSelectedTime} />
          </div>

          {/* จำนวนคนนั่ง */}
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <p className="text-[#191919] text-base font-light">จำนวนคนนั่ง</p>
              <div className="flex items-center bg-[#F9F9F9] border border-[#191919] rounded-full px-4 py-1">
                <img
                  src="/icon_nav_profile.svg"
                  alt="profile"
                  className="w-4 h-4 object-contain"
                  style={{ filter: "brightness(0) invert(0%)" }}
                />
                <span className="text-[#191919] text-l font-light mx-3">
                  {passengerCount}
                </span>
                <div className="flex flex-col">
                  <button
                    onClick={() =>
                      passengerCount < 6 && setPassengerCount(passengerCount + 1)
                    }
                    className="text-[#191919] text-lg leading-none"
                  >
                    <img src="/arrow-up.png" alt="arrow-up" className="w-3 h-3 object-contain" />
                  </button>
                  <button
                    onClick={() =>
                      passengerCount > 1 && setPassengerCount(passengerCount - 1)
                    }
                    className="text-[#191919] text-lg leading-none"
                  >
                    <img
                      src="/arrow-down.png"
                      alt="arrow-down"
                      className="w-3 h-3 object-contain"
                    />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[#8b8b8b] font-light text-xs mt-0 w-45">
              หากต้องการขนสัมภาระขนาดใหญ่ กรุณาเพิ่มจำนวนคนอีก 1
            </p>
          </div>

          {/* ประเภทรถ */}
          <div className="space-y-2">
            <p className="text-[#191919] text-base font-light">เลือกประเภทพาหนะ</p>
            {["จักรยานยนต์", "รถยนต์", "รถยนต์ขนาดใหญ่"].map((v) => {
              let maxPassengers = v === "จักรยานยนต์" ? 1 : v === "รถยนต์ขนาดใหญ่" ? 6 : 4;
              const disabled = passengerCount > maxPassengers;
              return (
                <button
                  key={v}
                  onClick={() => !disabled && setSelectedVehicle(v as any)}
                  className={`w-full flex justify-between items-center bg-[#FFFFFF] px-4 py-2 rounded-full font-light ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedVehicle === v ? "border-[#b55c32] bg-[#b55c32]" : "border-gray-400 bg-white"
                        }`}
                    >
                      {selectedVehicle === v && (
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                          <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-base ${selectedVehicle === v ? "text-[#191919] font-light" : "text-[#8b8b8b]"}`}>
                      {v}
                    </span>
                  </div>
                  <span className="text-[#8b8b8b] text-sm font-light flex items-center gap-1">
                    {v === "จักรยานยนต์" ? "1" : v === "รถยนต์ขนาดใหญ่" ? "1–6" : "1–4"}
                    <img src="/icon_nav_profile.svg" alt="profile" className="w-4 h-4 object-contain" style={{ filter: "brightness(0) invert(50%)" }} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ค่าเดินทาง + เงินกระเป๋า */}
      <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-5 flex justify-between items-start">
        <div>
          <p className="text-[#191919] text-base font-light mb-5">ค่าเดินทาง</p>
          <div className="flex items-center gap-2">
            <img src="/coin.svg" alt="coin" className="w-8 h-8 object-contain" />
            <p className="text-[#191919] text-xl font-light">
              {estim ? `${estim.estimated_price} บาท` : "—"}
            </p>
          </div>
          <button
            onClick={doEstimate}
            className="mt-3 bg-white border-2 border-[#B55C32] rounded-full px-4 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
            disabled={loading || !canEstimate}
          >
            {loading ? "กำลังคำนวณ..." : "คำนวณราคา"}
          </button>
          {estim?.message && <div className="text-xs text-gray-500 mt-2">{String(estim.message)}</div>}
        </div>

        <div className="text-right self-start">
          <p className="text-[#8b8b8b] text-sm font-light whitespace-nowrap">ยอดในกระเป๋าเงิน</p>
          <div className="flex items-center justify-end gap-1">
            <img src="/coin.svg" alt="coin" className="w-4 h-4 object-contain" />
            <p className="text-[#8b8b8b] text-base font-light">{me ? `${me.balance} บาท` : "-"}</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mt-4">
        <button
          onClick={() => setPage("confirm")}
          className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl hover:bg-[#d9956f] transition-colors duration-200 disabled:opacity-50"
          disabled={!estim}
        >
          ขั้นตอนถัดไป
        </button>
      </div>
    </div>
  );

  /* ---------- หน้ายืนยัน (one-time) ---------- */
  const renderConfirmPage = () => (
    <div className="bg-[#C5DEDA] min-h-screen w-full flex flex-col items-center pb-[140px] px-6">
      <div className="w-full max-w-md flex items-center mt-4" style={{ cursor: "pointer" }}>
        <BackButton2 onBack={() => setPage("rideDetail")} />
      </div>
      <div className="flex-1 text-center py-9">
        <h1 className="text-lg text-black font-light">การจองทริปใหม่ หน้า 3/3</h1>
        <p className="text-xl font-regular text-black">ยืนยันการจอง</p>
      </div>

      <div className="w-full max-w-md bg-white font-light rounded-2xl p-4 shadow-md shadow-black/50 mb-4">
        <div className="flex flex-col gap-4 relative">
          <LocationBox value={pickupLabel} showLine />
          <LocationBox value={dropoffLabel} />
        </div>
      </div>

      <div className="w-full max-w-md bg-white font-light rounded-2xl p-4 shadow-md shadow-black/50 mb-4">
        <div className="px-3">
          <div className="flex items-center gap-3 mb-3">
            <p className="text-[#191919] font-light text-base">วันที่</p>
            <div className="bg-[#8B8B8B]/10 rounded-full px-3 py-1 text-black font-light">
              {selectedDate}
            </div>
          </div>

          <p className="text-[#191919] font-light mt-3">เวลาออกเดินทาง</p>
          <div className="flex justify-center items-center gap-8 mt-2">
            <div className="text-center">
              <div className="bg-[#8B8B8B]/10 px-3 py-1 rounded-full inline-block">
                {selectedTime}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-5 mt-5 w-full max-w-md">
            <div>
              <p className="text-[#191919] text-base font-light">จำนวนคนนั่ง</p>
              <p className="text-[#8b8b8b] text-xs font-light">
                หากต้องการขนสัมภาระขนาดใหญ่ กรุณาเพิ่มจำนวนคนอีก 1
              </p>
            </div>
            <div className="flex items-center bg-[#FFFFFF] border border-[#191919] rounded-full px-4 py-1">
              <img
                src="/icon_nav_profile.svg"
                alt="profile"
                className="w-4 h-4 object-contain"
                style={{ filter: "brightness(0) invert(0%)" }}
              />
              <span className="text-[#191919] text-l font-light mx-2">{passengerCount}</span>
            </div>
          </div>

          <p className="text-[#191919] text-base font-light mb-2 w-full max-w-md">ประเภทพาหนะ</p>
          <div className="flex justify-between items-center w-full max-w-md p-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-[#B55C32] bg-[#B55C32]">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[#B55C32] font-light">{selectedVehicle}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#8b8b8b] text-sm">
                {selectedVehicle === "จักรยานยนต์" ? "1" : selectedVehicle === "รถยนต์ขนาดใหญ่" ? "1–6" : "1–4"}
              </span>
              <img src="/icon_nav_profile.svg" alt="icon" className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ค่าเดินทาง + เงินกระเป๋า */}
      <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-5 flex justify-between items-start">
        <div>
          <p className="text-[#191919] text-base font-light mb-5">ค่าเดินทาง</p>
          <div className="flex items-center gap-2">
            <img src="/coin.svg" alt="coin" className="w-8 h-8 object-contain" />
            <p className="text-[#191919] text-xl font-light">
              {estim ? `${estim.estimated_price} บาท` : "—"}
            </p>
          </div>
        </div>
        <div className="text-right self-start">
          <p className="text-[#8b8b8b] text-sm font-light">ยอดในกระเป๋าเงิน</p>
          <div className="flex items-center justify-end gap-1">
            <img src="/coin.svg" alt="coin" className="w-4 h-4 object-contain" />
            <p className="text-[#8b8b8b] text-base font-light">{me ? `${me.balance} บาท` : "-"}</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mt-4">
        <button
          onClick={() => setShowPopup(true)}
          className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl hover:bg-[#d9956f] transition-colors duration-200"
          disabled={!estim}
        >
          ยืนยันการจอง
        </button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-[80%] max-w-[350px] p-6 text-center">
            <div className="mb-4">
              <div className="w-[80%] mx-auto bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-5">
                <p className="text-[#191919] text-base font-regular mb-2">ค่าเดินทาง</p>
                <div className="flex justify-center items-center gap-2 mb-4">
                  <img src="/coin.svg" alt="coin" className="w-6 h-6 object-contain" />
                  <p className="text-[#191919] font-light text-lg">
                    {estim ? `${estim.estimated_price} บาท` : "-"}
                  </p>
                </div>
              </div>
              <p className="text-[#191919] text-m font-regular mb-4">
                เมื่อจองแล้วจะไม่สามารถแก้ไขได้<br />และเงินในกระเป๋าจะถูกหักทันที
              </p>
              <p className="text-[#191919] text-sm font-light">แน่ใจหรือไม่ว่าต้องการทำรายการจองนี้</p>
            </div>
            <div className="flex justify-between mt-5">
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 bg-white border border-[#B5B5B5] text-[#191919] py-2 rounded-3xl mr-2"
              >
                ยกเลิก
              </button>
              <button
                onClick={doBook}
                className="flex-1 bg-[#E6A88A] border border-[#B55C32] text-[#191919] py-2 rounded-3xl ml-2"
                disabled={loading}
              >
                {loading ? "กำลังทำรายการ..." : "ตกลง"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showErr && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-[80%] max-w-[350px] p-6 text-center">
            <p className="text-[#191919] text-lg font-semibold mb-2">
              {errTitle || "เกิดข้อผิดพลาด"}
            </p>
            <p className="text-[#191919] text-sm font-light mb-5 whitespace-pre-wrap">{errMsg}</p>

            <div className="flex justify-between">
              <button
                onClick={() => setShowErr(false)}
                className="flex-1 bg-white border border-[#B5B5B5] text-[#191919] py-2 rounded-3xl mr-2"
              >
                ปิด
              </button>
              <button
                onClick={() => { setShowErr(false); }}
                className="flex-1 bg-[#E6A88A] border border-[#B55C32] text-[#191919] py-2 rounded-3xl ml-2"
              >
                ลองอีกครั้ง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === SUCCESS POPUP (one-time) === */}
      {showOk && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-[80%] max-w-[350px] p-6 text-center">
            <p className="text-[#191919] text-lg font-semibold mb-2">
              {okTitle || "ทำรายการสำเร็จ"}
            </p>
            <p className="text-[#191919] text-sm font-light mb-5 whitespace-pre-wrap">
              {okMsg}
            </p>

            <div className="flex justify-between">
              <button
                onClick={() => setShowOk(false)}
                className="flex-1 bg-white border border-[#B5B5B5] text-[#191919] py-2 rounded-3xl mr-2"
              >
                ปิด
              </button>
              <button
                onClick={() => {
                  setShowOk(false);
                  router.replace("/customer/home");
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

  /* ---------- หน้าแพ็กเกจ (เลือกประเภท) ---------- */
  const renderPackagePage = () => (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-[#FFFFFF] to-[#C5DEDA]">
      <div className="w-full flex items-center justify-start px-6 mt-6" style={{ cursor: "pointer" }}>
        <BackButton2 onBack={() => setPage("type")} />
      </div>
      <div className="flex flex-col items-center text-center mt-16 px-10 py-10">
        <h1 className="text-5xl font-regular text-[#191919] mb-4">จองทริปแบบ ขาประจำ</h1>
        <img src="/home_package.png" alt="Home Package" className="w-30 h-20 mb-6" />
        <p className="text-base font-light text-[#191919]">จ่าย 1 ครั้ง เดินทางกี่ครั้งก็ได้<br />ภายใน 4 สัปดาห์</p>
      </div>
      <div className="flex flex-col gap-6 -mt-2">
        <div className="flex flex-col gap-6 mt-6">
          {["bike", "car"].map((v) => {
            const Icon = v === "bike" ? FaMotorcycle : FaCar;
            const title = v === "bike" ? "จักรยานยนต์" : "รถยนต์";
            const price = v === "bike" ? "650 บาท/4 สัปดาห์" : "1000 บาท/4 สัปดาห์";
            const selected = (v === "bike" && selectedPackage === "bike") || (v === "car" && selectedPackage === "car");
            return (
              <div key={v} className="flex items-center justify-center gap-1">
                <div onClick={() => setSelectedPackage(v as any)} className="cursor-pointer mx-6 -mr-1">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center border-[#B55C32] ${selected ? "bg-[#B55C32]" : "bg-white"}`}>
                    {selected && (<svg className="w-3 h-3" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
                  </div>
                </div>
                <div onClick={() => setSelectedPackage(v as any)} className={`bg-white rounded-xl shadow-md px-6 py-4 w-[280px] mx-auto flex flex-col items-center text-center cursor-pointer transition-all duration-200 ${selected ? "border-2 border-[#B55C32]" : "border border-transparent"}`}>
                  <div className="flex items-center gap-2 justify-center">
                    <p className="text-sm font-light text-[#191919]">เดินทางด้วย</p>
                    <Icon className="text-xl text-[#B55C32]" />
                    <p className="text-sm font-light text-[#191919]">{title}</p>
                  </div>
                  <div className="flex items-center gap-2 justify-center mt-1">
                    <img src="/coin.svg" alt="coin" className="w-4 h-4" />
                    <p className="text-sm font-light text-[#191919]">เริ่มต้น {price}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex-grow" />
      <div className="text-center text-sm font-light text-[#B55C32] mb-4">หมายเหตุ: จุดรับ/ส่ง และเวลา จะเหมือนเดิมทุกครั้ง</div>
      <div className="bg-white rounded-t-2xl shadow-inner px-6 pt-4 pb-6">
        <div className="flex items-center gap-2 justify-center mb-3 -mt-1">
          <p className="text-sm font-light text-[#191919]">ยอดในกระเป๋าเงิน</p>
          <img src="/coin.svg" alt="coin" className="w-4 h-4" />
          <p className="text-sm font-light text-[#191919]">{me ? `${me.balance} บาท` : "-"}</p>
        </div>
        <button className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl shadow-md hover:bg-[#d9956f] transition-colors duration-200" onClick={() => setPage("package1")}>
          ซื้อแพ็คเกจทริปขาประจำ
        </button>
      </div>
    </div>
  );

  /* ---------- หน้าแพ็กเกจ 1/3: เลือกจุดรับส่ง + แผนที่ ---------- */
  const renderPackage1Page = () => (
    <div className="bg-[#C5DEDA] min-h-screen w-full flex flex-col items-center pb-[140px]">
      <div className="w-full flex flex-col items-center px-6 mt-2">
        <div className="w-full max-w-md flex items-center mt-2">
          <BackButton2 onBack={() => setPage("package")} />
        </div>

        <div className="text-center py-6">
          <h1 className="text-lg text-black font-light">การจองทริปขาประจำ หน้า 1/3</h1>
          <p className="text-xl font-regular text-black">เลือกจุดรับส่ง</p>
        </div>

        {/* จุดรับ–ส่ง */}
        <div className="w-full max-w-md bg-white font-light rounded-2xl p-4 shadow-md shadow-black/50 mb-3">
          <div className="flex flex-col gap-3 relative">
            <LocationBox
              value={pickupLabel}
              onClear={() => {
                setPickupId("");
                setLocation1("");
              }}
              showLine
            />
            <LocationBox
              value={dropoffLabel}
              onClear={() => {
                setDropoffId("");
                setLocation2("");
              }}
            />
          </div>
        </div>

        {/* ปุ่มสลับโหมดคลิก */}
        <div className="w-full max-w-md flex gap-3 mb-3">
          <button
            className={`flex-1 rounded-full px-4 py-2 border ${mapMode === "pickup" ? "bg-[#B55C32] text-white font-light border-[#B55C32]" : "bg-white text-[#191919] font-light border-[#8B8B8B]"
              }`}
            onClick={() => setMapMode("pickup")}
          >
            เลือกจุดรับ
          </button>
          <button
            className={`flex-1 rounded-full px-4 py-2 border ${mapMode === "dropoff" ? "bg-[#B55C32] text-white font-light border-[#B55C32]" : "bg-white text-[#191919] font-light border-[#8B8B8B]"
              }`}
            onClick={() => setMapMode("dropoff")}
          >
            เลือกจุดส่ง
          </button>
        </div>

        {/* แผนที่ */}
        <div className="w-full max-w-md h-[450px] border-[1px] border-[#8B8B8B] rounded-2xl overflow-hidden relative">
          <MapSelectComponent
            locations={locs}
            mapRef={mapRef}
            onMarkerSelect={(loc) => {
              if (!loc) return;
              if (mapMode === "pickup") setPickupId(Number(loc.id));
              else setDropoffId(Number(loc.id));
              mapRef.current?.flyTo([loc.lat, loc.lng], 16, { duration: 1 });
            }}
            page={null}
          />
          <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
            คลิกเพื่อเลือก: {mapMode === "pickup" ? "จุดรับ" : "จุดส่ง"}
          </div>
        </div>

        <div className="mt-4 w-full max-w-md">
          <button
            className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl"
            onClick={() => setPage("package2")}
          >
            ขั้นตอนถัดไป
          </button>
        </div>
      </div>
    </div>
  );

  /* ---------- หน้าแพ็กเกจ 2/3: เลือกวัน + เวลา + จำนวนคนนั่ง + ประเภทรถ ---------- */
  const renderPackage2Page = () => (
    <div className="bg-[#C5DEDA] min-h-screen w-full flex flex-col items-center pb-[140px]">
      <div className="w-full flex flex-col items-center px-6 mt-10">
        <div className="w-full max-w-md flex items-center mt-2" style={{ cursor: "pointer" }}>
          <BackButton2 onBack={() => setPage("package1")} />
        </div>
        <div className="text-center mt-1 mb-6">
          <h1 className="text-lg text-black font-light">การจองทริปขาประจำ หน้า 2/3</h1>
          <p className="text-xl font-regular text-black">เลือกวันที่และเวลาที่ต้องการ</p>
        </div>

        {/* ช่วงวันที่ */}
        <div className="flex items-center gap-4 mb-6 ">
          <p className="text-sm font-light text-black">ตั้งแต่</p>
          <div className="px-3 py-2 bg-white rounded-2xl shadow text-sm font-light shadow-md shadow-black/50">
            {startDate ?? "--/--/----"}
          </div>
          <p className="text-sm font-light text-black">ถึง</p>
          <div className="px-3 py-2 bg-white rounded-2xl shadow text-sm font-light shadow-md shadow-black/50">
            {endDate ?? "--/--/----"}
          </div>
        </div>

        {/* ปฏิทิน */}
        <div className="font-light w-full bg-white rounded-2xl shadow p-4 mb-6 shadow-md shadow-black/50">
          <CalendarComponent selected={selectedDates} setSelected={setSelectedDates} />
          <p className="text-l font-light text-center text-[#B55C32]">
            จิ้มที่วันที่เพื่อเลือก - จิ้มอีกครั้งเพื่อยกเลิก
          </p>
        </div>

        {/* สรุป + เวลา + จำนวนคนนั่ง + ยานพาหนะ */}
        <div className="w-full bg-white rounded-2xl shadow p-6 mb-6 text-center shadow-md shadow-black/5 font-light">
          <p className="text-black font-light mb-2">คุณเลือกไปแล้ว</p>
          <div className="flex justify-center items-center gap-2 text-[#B55C32] text-2xl font-light">
            {selectedDates.length} วัน
          </div>

          <div className="mt-6">
            <p className="text-black font-light mb-2">เวลาออกเดินทาง</p>
            <div className="flex items-center justify-center mb-2">
              <TimePicker selectedTime={selectedTime} setSelectedTime={setSelectedTime} />
            </div>
          </div>

          {/* จำนวนคนนั่ง */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-[#191919] font-light">จำนวนคนนั่ง</span>
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <img
                src="/icon_nav_profile.svg"
                alt="profile"
                className="w-4 h-4 object-contain"
                style={{ filter: "brightness(0) invert(0%)" }}
              />
              <span className="text-[#191919] font-light ml-2">{passengerCount}</span>
              <div className="ml-2 flex flex-col">
                <button
                  className="h-4 w-4 p-0 flex items-center justify-center disabled:opacity-40"
                  onClick={() => setPassengerCount((n) => Math.min(n + 1, 6))}
                  disabled={passengerCount >= 6}
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

          {/* Vehicle Picker */}
          <div className="pt-4 w-full">
            <span className="text-[#191919] font-light">ยานพาหนะ</span>
            <div className="mt-2">
              <VehiclePicker
                selectedVehicle={selectedVehicle}
                setSelectedVehicle={setSelectedVehicle}
              />
            </div>
          </div>
        </div>

        {/* ค่าแพ็คเกจ (อัปเดตตามประเภทแพ็กเกจ) */}
        <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-5 flex justify-between items-center">
          <div>
            <p className="text-[#191919] text-base font-light mb-2">ค่าแพ็คเกจ</p>
            <div className="flex items-center gap-2">
              <img src="/coin.svg" alt="coin" className="w-8 h-8 object-contain" />
              <p className="text-[#191919] text-xl font-light">
                {pkgPrice ? `${pkgPrice} บาท` : "กรุณาเลือกแพ็กเกจ"}
              </p>
            </div>
          </div>
          <div className="text-right self-start">
            <p className="text-[#8b8b8b] text-sm font-light">ยอดในกระเป๋าเงิน</p>
            <div className="flex items-center justify-end gap-1">
              <img src="/coin.svg" alt="coin" className="w-4 h-4 object-contain" />
              <p className="text-[#8b8b8b] text-base font-light">{me ? `${me.balance} บาท` : "-"}</p>
            </div>
          </div>
        </div>

        <button
          className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl hover:bg-[#d9956f] transition-colors duration-200 disabled:opacity-50"
          onClick={() => setPage("package3")}
          disabled={!selectedPackage || !selectedDates.length}
        >
          ขั้นตอนถัดไป
        </button>
      </div>
    </div>
  );

  /* ---------- หน้าแพ็กเกจ 3/3: ยืนยัน + ยิง LOOP /trips/book (READ-ONLY calendar & vehicle) ---------- */
  const renderPackage3Page = () => (
    <div className="bg-[#C5DEDA] min-h-screen w-full flex flex-col items-center pb-[140px]">
      <div className="w-full flex flex-col items-center px-6 mt-10">
        <div className="w-full max-w-md flex items-center mt-2">
          <BackButton2 onBack={() => setPage("package2")} />
        </div>
        <div className="text-center mt-1 mb-5">
          <h1 className="text-lg text-black font-light">การจองทริปขาประจำ หน้า 3/3</h1>
          <p className="text-xl font-regular text-black">ยืนยันการจอง</p>
          <p className="text-xl font-light text-[#B55C32] mt-2">กรุณาตรวจสอบรายการเดินทาง</p>
        </div>

        <div className="w-full max-w-md bg-[#ffffff] font-light rounded-2xl p-4 shadow-md shadow-black/50 mb-4">
          <div className="flex flex-col gap-4 relative">
            <LocationBox value={pickupLabel} showLine />
            <LocationBox value={dropoffLabel} />
          </div>
        </div>

        {/* ปฏิทิน READ-ONLY */}
        <div className="font-light w-full bg-white rounded-2xl shadow p-4 mb-6 shadow-md shadow-black/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-black font-light">วันที่ที่เลือกไว้</p>
          </div>
          <div className="pointer-events-none select-none">
            <CalendarComponent selected={selectedDates} setSelected={() => { /* read-only */ }} />
          </div>
        </div>

        {/* สรุป + ยานพาหนะ READ-ONLY + จำนวนคนนั่ง */}
        <div className="w-full max-w-md bg-white rounded-2xl p-6 mb-6 text-center shadow-md shadow-black/50 font-light">
          <p className="text-black font-light mb-2">คุณเลือกไปแล้ว</p>
          <div className="flex justify-center items-center gap-2 text-[#B55C32] text-2xl font-light">
            {selectedDates.length} วัน
          </div>
          <div className="pt-4 w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#191919] font-light">ยานพาหนะ</span>
              <span className="text-[#191919] font-light">{selectedVehicle}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#191919] font-light">จำนวนคนนั่ง</span>
              <span className="text-[#191919] font-light">{passengerCount}</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-5 flex justify-between items-center">
          <div>
            <p className="text-[#191919] text-base font-light mb-2">ค่าแพ็คเกจ</p>
            <div className="flex items-center gap-2">
              <img src="/coin.svg" alt="coin" className="w-8 h-8 object-contain" />
              <p className="text-[#191919] text-xl font-light">
                {pkgPrice ? `${pkgPrice} บาท` : "กรุณาเลือกแพ็กเกจ"}
              </p>
            </div>
          </div>
          <div className="text-right self-start">
            <p className="text-[#8b8b8b] text-sm font-light">ยอดในกระเป๋าเงิน</p>
            <div className="flex items-center justify-end gap-1">
              <img src="/coin.svg" alt="coin" className="w-4 h-4 object-contain" />
              <p className="text-[#8b8b8b] text-base font-light">{me ? `${me.balance} บาท` : "-"}</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md">
          <button
            onClick={() => setShowPopup(true)}
            className="w-full bg-[#E6A88A] border-2 border-[#B55C32] text-black font-light py-3 rounded-3xl hover:bg-[#d9956f] transition-colors duration-200 disabled:opacity-50"
            disabled={!selectedPackage || !selectedDates.length || typeof pickupId !== "number" || typeof dropoffId !== "number"}
          >
            ยืนยันและจ่ายค่าเดินทาง
          </button>
        </div>

        {showPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg w-[80%] max-w-[350px] p-6 text-center">
              <div className="w-[80%] mx-auto bg-white rounded-2xl p-4 shadow-md shadow-black/50 mb-5">
                <p className="text-[#191919] text-base font-regular mb-2">ค่าแพ็กเกจ</p>
                <div className="flex justify-center items-center gap-2 mb-4">
                  <img src="/coin.svg" alt="coin" className="w-6 h-6 object-contain" />
                  <p className="text-[#191919] font-light text-lg">{pkgPrice ? `${pkgPrice} บาท` : "-"}</p>
                </div>
              </div>
              <p className="text-[#191919] text-m font-regular mb-4">
                เมื่อยืนยันแล้วจะไม่สามารถแก้ไขได้<br />และเงินในกระเป๋าจะ<strong>ถูกหักทันที</strong>
              </p>
              <p className="text-[#191919] text-sm font-light mb-4">แน่ใจหรือไม่ว่าต้องการทำรายการจองนี้</p>
              <div className="flex justify-between mt-5">
                <button
                  onClick={() => setShowPopup(false)}
                  className="flex-1 bg-white border border-[#B5B5B5] text-[#191919] py-2 rounded-3xl mr-2"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={doRequestPackage}
                  className="flex-1 bg-[#E6A88A] border border-[#B55C32] text-[#191919] py-2 rounded-3xl ml-2"
                  disabled={loading}
                >
                  {loading ? "กำลังทำรายการ..." : "ตกลง"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS/ERROR POPUPS ใช้ชุดเดียวกับหน้าทั่วไป */}
        {showErr && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg w-[80%] max-w-[350px] p-6 text-center">
              <p className="text-[#191919] text-lg font-semibold mb-2">
                {errTitle || "เกิดข้อผิดพลาด"}
              </p>
              <p className="text-[#191919] text-sm font-light mb-5 whitespace-pre-wrap">{errMsg}</p>

              <div className="flex justify-between">
                <button
                  onClick={() => setShowErr(false)}
                  className="flex-1 bg-white border border-[#B5B5B5] text-[#191919] py-2 rounded-3xl mr-2"
                >
                  ปิด
                </button>
                <button
                  onClick={() => { setShowErr(false); }}
                  className="flex-1 bg-[#E6A88A] border border-[#B55C32] text-[#191919] py-2 rounded-3xl ml-2"
                >
                  ลองอีกครั้ง
                </button>
              </div>
            </div>
          </div>
        )}

        {showOk && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg w-[80%] max-w-[350px] p-6 text-center">
              <p className="text-[#191919] text-lg font-semibold mb-2">
                {okTitle || "ทำรายการสำเร็จ"}
              </p>
              <p className="text-[#191919] text-sm font-light mb-5 whitespace-pre-wrap">
                {okMsg}
              </p>

              <div className="flex justify-between">
                <button
                  onClick={() => setShowOk(false)}
                  className="flex-1 bg-white border border-[#B5B5B5] text-[#191919] py-2 rounded-3xl mr-2"
                >
                  ปิด
                </button>
                <button
                  onClick={() => {
                    setShowOk(false);
                    router.replace("/customer/home");
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
    </div>
  );

  return (
    <>
      {page === "type" && renderTypePage()}
      {page === "package" && renderPackagePage()}
      {page === "package1" && renderPackage1Page()}
      {page === "package2" && renderPackage2Page()}
      {page === "package3" && renderPackage3Page()}
      {page === "location" && renderLocationPage()}
      {page === "rideDetail" && renderRideDetailPage()}
      {page === "confirm" && renderConfirmPage()}
    </>
  );
}