"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BackButton } from "@/app/components/share_component";
import Navbar from "../components/navbar";

/** -------- API Types -------- */
interface ApiTrip {
  trip_id: number;
  status: "completed" | "cancelled" | "cancelled_with_penalty" | string;
  pickup_location: { name: string; lat: number; lng: number };
  dropoff_location: { name: string; lat: number; lng: number };
  distance_km: number; // may be float
  capacity: number; // seats booked or available — depends on backend
  driver: {
    id: number;
    name: string;
    email: string;
    profile_picture?: string;
  };
  driver_vehicle?: {
    driver_id: number;
    vehicle_type?: string;
    model_vehicle?: string;
    license_plate?: string;
    seats?: number;
    description?: string;
  };
  amount: number; // fare
  dropoff_time?: string; // ISO string
  reviews?: { score: number; comment?: string }[];
}

/** -------- UI Types -------- */
interface Status {
  type: "completed" | "cancelled" | "cancelled_with_penalty" | "unknown";
}

interface HistoryItem {
  from: string;
  to: string;
  fare: number;
  pax: number; // best-effort: map from capacity if provided, else 1
  date: string; // "DD/MM/YYYY"
  status: Status;
  // extra for popup
  distanceKm?: number;
  reviewScore?: number;
  reviewComment?: string;
  driver?: ApiTrip["driver"];
  driverVehicle?: ApiTrip["driver_vehicle"];
  dropoffTimeISO?: string;
}

/** label ภาษาไทย + style ของ badge ตามสถานะ */
const STATUS_LABELS: Record<Status["type"], string> = {
  completed: "สำเร็จ",
  cancelled: "ยกเลิก",
  cancelled_with_penalty: "ยกเลิก (ปรับ)",
  unknown: "—",
};

const STATUS_STYLES: Record<Status["type"], string> = {
  completed: "text-emerald-700",
  cancelled: "text-rose-600",
  cancelled_with_penalty: "text-rose-600",
  unknown: "text-gray-500",
};

/* ---------------- Utils ---------------- */
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const SNAP_POINTS = [0.3, 0.55] as const;

// Format DD/MM/YYYY in Asia/Bangkok
const toBangkokDate = (iso?: string) => {
  if (!iso) return "";
  try {
    const dt = new Date(iso);
    // Convert to Bangkok by using Intl.DateTimeFormat
    const f = new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return f.format(dt);
  } catch {
    return "";
  }
};

const toBangkokTimeHM = (iso?: string) => {
  if (!iso) return "";
  try {
    const dt = new Date(iso);
    const f = new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return f.format(dt);
  } catch {
    return "";
  }
};

const money2 = (n: number) => (isFinite(n) ? n.toFixed(2) : "0.00");

const mapTripToHistoryItem = (t: ApiTrip): HistoryItem => {
  const status: Status["type"] =
    t.status === "completed" || t.status === "cancelled" || t.status === "cancelled_with_penalty"
      ? t.status
      : "unknown";

  const reviewScore = t.reviews && t.reviews.length
    ? Math.round((t.reviews.reduce((s, r) => s + (r.score || 0), 0) / t.reviews.length) * 10) / 10
    : undefined;

  const reviewComment = t.reviews && t.reviews.length ? t.reviews[0]?.comment : undefined;

  return {
    from: t.pickup_location?.name || "-",
    to: t.dropoff_location?.name || "-",
    fare: t.amount ?? 0,
    pax: typeof t.capacity === "number" && t.capacity > 0 ? t.capacity : 1,
    date: toBangkokDate(t.dropoff_time) || "",
    status: { type: status },
    distanceKm: t.distance_km,
    reviewScore,
    reviewComment,
    driver: t.driver,
    driverVehicle: t.driver_vehicle,
    dropoffTimeISO: t.dropoff_time,
  };
};

/* ---------------- Page ---------------- */
function Background() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ปิดด้วย ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ล็อก scroll ของ body ตอนเปิด popup
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Fetch history from API
  useEffect(() => {
    let aborted = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/User/history", {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
          // credentials: "include", // uncomment if your API needs cookies
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const trips: ApiTrip[] = json?.trips || [];
        const mapped = trips.map(mapTripToHistoryItem);
        if (!aborted) setItems(mapped);
      } catch (err: any) {
        if (!aborted) setError(err?.message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  const openPopup = (item: HistoryItem) => {
    setSelected(item);
    setOpen(true);
  };

  const closePopup = () => setOpen(false);

  return (
    <div className="min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center pb-20">
      <Header_history onClose={open ? closePopup : undefined} />
      <div className="mt-5" />

      {loading && (
        <div className="w-[366px] animate-pulse text-gray-600">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[141px] w-[366px] bg-white/70 rounded-[30px] shadow-sm mt-5" />
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 w-[366px] bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-3">
          เกิดข้อผิดพลาด: {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="mt-10 text-gray-600">ยังไม่มีประวัติการเดินทาง</div>
      )}

      {/* การ์ดประวัติ */}
      {items.map((item, idx) => (
        <Block_history key={idx} item={item} onClick={() => openPopup(item)} />
      ))}

      {/* Popup Overlay */}
      {open && selected && (
        <PopupOverlay onClose={closePopup}>
          <Popup_detail item={selected} onClose={closePopup} />
        </PopupOverlay>
      )}

      <Navbar />
    </div>
  );
}

/** Header สูงคงที่ 64px (h-16) และอยู่เหนือ overlay */
function Header_history({ onClose }: { onClose?: () => void }) {
  const clickable = Boolean(onClose);
  return (
    <div
      className={`flex flex-col items-center h-16 justify-center w-full relative z-[10000] ${
        clickable ? "cursor-pointer" : ""
      }`}
      onClick={onClose}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (clickable && (e.key === "Enter" || e.key === " ")) onClose?.();
      }}
      aria-label={clickable ? "ปิดหน้าต่าง" : undefined}
    >
      <BackButton />
      <h1 className="text-[32px] font-bold text-shadow-lg mt-18">ประวัติการเดินทาง</h1>
    </div>
  );
}

/** การ์ดพื้นฐาน */
function HistoryCard({ item, onClick }: { item: HistoryItem; onClick?: () => void }) {
  const Wrapper: any = onClick ? "button" : "div";
  const statusClass = STATUS_STYLES[item.status.type];
  const statusLabel = STATUS_LABELS[item.status.type];

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`${onClick ? "block text-left focus:outline-none cursor-pointer" : ""}`}
      aria-label={onClick ? "ดูรายละเอียดการเดินทาง" : undefined}
    >
      <div className="h-[141px] w-[366px] bg-white rounded-[30px] shadow-md mt-5 p-3 relative">
        <div className="flex mt-1 mb-1">
          <div className="flex flex-col items-center">
            <img src="/icon_pin.svg" alt="start" className="h-[25px] w-[25px] mt-1" />
            <div className="h-6 w-px bg-gray-500" />
            <img src="/icon_pin.svg" alt="end" className="h-[25px] w-[25px]" />
          </div>

          <div className="ml-2 flex flex-col justify-between">
            {/* แถวบน: from + fare */}
            <div className="flex items-center">
              <div className="h-[33px] w-[219px] bg-[rgba(139,139,139,0.15)] rounded-2xl flex items-center px-3">
                <p className="ml-1 truncate" title={item.from}>{item.from}</p>
              </div>
              <div className="h-[33px] w-[90px] bg-[rgba(181,91,50,0.8)] rounded-[15px] flex justify-center items-center ml-1.5">
                <img src="/coin.svg" alt="coin" className="h-5 w-5 mr-1" />
                <p className="text-[17px]">{money2(item.fare)}</p>
              </div>
            </div>

            {/* แถวล่าง: to + pax */}
            <div className="flex items-center mt-5">
              <div className="h-[33px] w-[219px] bg-[rgba(139,139,139,0.15)] rounded-2xl flex items-center px-3">
                <p className="ml-1 truncate" title={item.to}>{item.to}</p>
              </div>
              <div className="h-[33px] w-[90px] bg-white rounded-[15px] border border-gray-600 flex justify-center items-center ml-1.5">
                <p className="text-[17px]">{item.pax}</p>
                <img src="/human.svg" alt="human" className="h-5 w-5 ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* วันที่ */}
        <div className="flex mt-2 mb-2">
          <img src="/calendar.svg" className="h-5 w-5 ml-1" alt="calendar" />
          <p className="ml-2 text-sm text-gray-500">{item.date || "—"}</p>
        </div>

        {/* Badge/Label สถานะ มุมขวาล่าง */}
        <div className="absolute bottom-2 right-5">
          <span className={`text-base ${statusClass}`} aria-label={`สถานะ: ${statusLabel}`} title={statusLabel}>
            {statusLabel}
          </span>
        </div>
      </div>
    </Wrapper>
  );
}

/** การ์ดใน list */
function Block_history({ item, onClick }: { item: HistoryItem; onClick?: () => void }) {
  return <HistoryCard item={item} onClick={onClick} />;
}

/* ---------------- Bottom Sheet Overlay ---------------- */
function PopupOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const [snapIndex, setSnapIndex] = useState(0); // 0 = เตี้ย, 1 = กลาง
  const [heightRatio, setHeightRatio] = useState<number>(SNAP_POINTS[0]);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const startRatioRef = useRef<number>(SNAP_POINTS[0]);

  // sync เมื่อเปลี่ยน snap
  useEffect(() => {
    setHeightRatio(SNAP_POINTS[snapIndex]);
  }, [snapIndex]);

  // ปิดด้วย Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onDragStart = (clientY: number) => {
    draggingRef.current = true;
    startYRef.current = clientY;
    startRatioRef.current = heightRatio;
  };
  const onDragMoveCommon = (clientY: number) => {
    if (!draggingRef.current) return;
    const vh = window.innerHeight || 1;
    const deltaY = startYRef.current - clientY; // ขึ้น = บวก
    const deltaRatio = deltaY / vh;
    const next = clamp(startRatioRef.current + deltaRatio, 0.25, 0.9);
    setHeightRatio(next);
  };
  const onDragEnd = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    // snap ไปจุดที่ใกล้ที่สุด
    let best = 0;
    let bestDist = Infinity;
    SNAP_POINTS.forEach((p, i) => {
      const d = Math.abs(p - heightRatio);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setSnapIndex(best);
  };

  // เมาส์
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onDragStart(e.clientY);
    const onMove = (ev: MouseEvent) => onDragMoveCommon(ev.clientY);
    const onUp = () => {
      onDragEnd();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ทัช
  const onTouchStart = (e: React.TouchEvent) => onDragStart(e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => onDragMoveCommon(e.touches[0].clientY);
  const onTouchEnd = () => onDragEnd();

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <button aria-label="ปิดหน้าต่าง" onClick={onClose} className="absolute inset-0 bg-[#000000]/20" tabIndex={-1} />

      {/* Bottom sheet panel */}
      <div
        className="relative z-10 w-full max-w-[390px] mx-auto rounded-t-[30px] bg-[#EFEFEF] shadow-xl border-t border-[#D9D9D9] transition-[height] duration-200 ease-out overflow-hidden bottom-0"
        style={{ height: `min(calc(${heightRatio * 100}vh), 560px)` }}
      >
        {/* Drag handle */}
        <div
          className="w-full pt-3 pb-2 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: "none" }}
          aria-label="ลากเพื่อขยายหรือย่อ"
        >
          <div className="mx-auto h-1.5 w-12 rounded-full bg-[#C9C9C9]" />
        </div>

        {/* ปุ่มปิด */}
        <button type="button" onClick={onClose} className="absolute top-3 right-3" aria-label="ปิดหน้าต่าง" title="ปิด" />

        {/* เนื้อหาเลื่อนภายใน */}
        <div className="h-[calc(100%-44px)] overflow-y-auto px-3 pb-6">{children}</div>
      </div>
    </div>
  );
}

/** เนื้อหา popup — ข้อมูลจาก API */
function Popup_detail({ item, onClose }: { item: HistoryItem; onClose?: () => void }) {
  const showDetail = item.status.type === "completed";
  const timeHM = useMemo(() => toBangkokTimeHM(item.dropoffTimeISO), [item.dropoffTimeISO]);

  return (
    <div className="w-full bg-transparent flex flex-col items-center relative">
      {/* การ์ดเดียวกับที่คลิก */}
      <div className="flex justify-center">
        <HistoryCard item={item} />
      </div>

      {/* โปรไฟล์คนขับ: แสดงเสมอ */}
      <div className="flex justify-center w-full">
        <Profile_driver
          name={item.driver?.name}
          avatarUrl={item.driver?.profile_picture}
          vehicleType={item.driverVehicle?.vehicle_type}
          model={item.driverVehicle?.model_vehicle}
          license={item.driverVehicle?.license_plate}
          // seats={item.driverVehicle?.seats}
        />
      </div>

      {/* รายละเอียด: เฉพาะ completed */}
      {showDetail && (
        <>
          {/* เส้นคั่น + หัวข้อ */}
          <div className="flex items-center mt-4 px-4 w-full max-w-[390px]">
            <div className="flex-grow border-t-2 border-[#8B8B8B]" />
            <p className="mx-3 text-base whitespace-nowrap">รายละเอียดการเดินทาง</p>
            <div className="flex-grow border-t-2 border-[#8B8B8B]" />
          </div>

          <div className="flex justify-center w-full">
            <Detail
              distanceKm={item.distanceKm}
              timeHM={timeHM}
              reviewScore={item.reviewScore}
              reviewComment={item.reviewComment}
            />
          </div>
        </>
      )}

      {/* รูปรถ */}
      <div className="flex justify-center w-full">
        <img src="/car_popup_detail.svg" alt="รถ" className="mt-3 w-[155px]" />
      </div>
    </div>
  );
}

function Profile_driver({
  name,
  avatarUrl,
  vehicleType,
  model,
  license,
  // seats,
}: {
  name?: string;
  avatarUrl?: string;
  vehicleType?: string;
  model?: string;
  license?: string;
  // seats?: number;
}) {
  return (
    <div className="h-[105px] w-[363px] bg-white rounded-[30px] shadow-md mt-4 flex items-center px-4">
  <img
    src={avatarUrl && avatarUrl.length > 0 ? avatarUrl : "/user.svg"}
    alt="driver"
    className="h-16 w-16 rounded-full object-cover mb-3.5"
  />

  <div className="ml-5 flex flex-col self-start mt-4 w-[140px]">
    <p className="text-base truncate" title={name || "ไม่ระบุ"}>
      {name || "ไม่ระบุ"}
    </p>
    <p className="text-base mt-1.5 truncate" title="คนขับ">
      คนขับ
    </p>
  </div>

  <div className="ml-8 flex flex-col text-left self-start mt-4 w-[140px]">
    <p className="text-base truncate" title={model || "ยานพาหนะไม่ระบุ"}>
      {[model].filter(Boolean).join(", ") || "ยานพาหนะไม่ระบุ"}
    </p>
    <p
      className="text-base mt-1.5 truncate"
      title={license || "ทะเบียนไม่ระบุ"}
    >
      {license || "ทะเบียนไม่ระบุ"}
    </p>
  </div>
</div>

  );
}

function Detail({
  distanceKm,
  timeHM,
  reviewScore,
  reviewComment,
}: {
  distanceKm?: number;
  timeHM?: string; // ใช้เวลาถึง (ปลายทาง)
  reviewScore?: number;
  reviewComment?: string;
}) {
  return (
    <div className="w-[363px] h-auto bg-white rounded-[30px] shadow-md mt-4 p-6">
      <div className="space-y-4 text-sm">
        {/* เวลา และ ระยะเวลา */}
        <div className="flex">
          <div className="w-1/2 ml-3">
            <p className="text-gray-500">เวลาถึง</p>
            <p>{timeHM || "—"}</p>
          </div>
          <div className="w-1/2 pr-6">
            <p className="text-gray-500">ระยะเวลา</p>
            <p>—</p>{/* ไม่มี start_time ใน API */}
          </div>
        </div>

        {/* ระยะทาง และ คะแนนรีวิว */}
        <div className="flex items-center">
          <div className="w-1/2 ml-3">
            <p className="text-gray-500">ระยะทาง</p>
            <p>{typeof distanceKm === "number" ? `${distanceKm.toFixed(2)} Km` : "—"}</p>
          </div>
          <div className="w-1/2 pr-6">
            <p className="text-gray-500">คะแนนรีวิว</p>
            <div>
              <StarRatingDisplay value={typeof reviewScore === "number" ? reviewScore : 0} size={18} />
            </div>
          </div>
        </div>

        {/* รีวิว */}
        <div>
          <p className="text-gray-500 ml-3">รีวิว</p>
          <div className="mt-1 w-full bg-gray-100 rounded-lg p-2 text-gray-600 min-h-9">
            <p className="ml-2">{reviewComment || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StarRatingDisplay({ value, outOf = 5, size = 18 }: { value: number; outOf?: number; size?: number }) {
  const safe = Math.max(0, Math.min(outOf, Math.floor(value)));
  const filledArr = Array.from({ length: safe }, (_, i) => i);
  const emptyArr = Array.from({ length: outOf - safe }, (_, i) => i);

  return (
    <div className="flex items-center">
      {filledArr.map((i) => (
        <img key={`f-${i}`} src="/star_filled.svg" alt="filled star" style={{ width: size, height: size }} className="mx-0.5" />
      ))}
      {emptyArr.map((i) => (
        <img key={`e-${i}`} src="/star.svg" alt="empty star" style={{ width: size, height: size }} className="mx-0.5" />
      ))}
    </div>
  );
}

export default Background;
export { Popup_detail, Block_history, Header_history, StarRatingDisplay };
