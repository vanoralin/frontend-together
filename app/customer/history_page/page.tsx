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
  distance_km: number;
  capacity: number;
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
  amount: number;
  boarding_time?: string;  // ISO เริ่ม
  dropoff_time?: string;   // ISO จบ
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
  pax: number;
  date: string; // DD/MM/YYYY
  status: Status;

  // เวลาไทยสำหรับโชว์
  startTimeHM?: string;
  endTimeHM?: string;
  durationText?: string;

  // เพิ่มสำหรับ popup
  distanceKm?: number;
  reviewScore?: number;
  reviewComment?: string;
  driver?: ApiTrip["driver"];
  driverVehicle?: ApiTrip["driver_vehicle"];
  boardingTimeISO?: string;
  dropoffTimeISO?: string;
}

/** -------- Labels & Styles -------- */
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

/** เวลาไทย (ปี ค.ศ., เลขอารบิก) */
const toBangkokDate = (iso?: string) => {
  if (!iso) return "";
  try {
    const dt = new Date(iso);
    const parts = new Intl.DateTimeFormat("th-TH-u-nu-latn-ca-gregory", {
      timeZone: "Asia/Bangkok",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).formatToParts(dt);
    const dd = parts.find(p => p.type === "day")?.value ?? "";
    const mm = parts.find(p => p.type === "month")?.value ?? "";
    const yyyy = parts.find(p => p.type === "year")?.value ?? "";
    return dd && mm && yyyy ? `${dd}/${mm}/${yyyy}` : "";
  } catch { return ""; }
};

const toBangkokTimeHM = (iso?: string) => {
  if (!iso) return "";
  try {
    const dt = new Date(iso);
    const parts = new Intl.DateTimeFormat("th-TH-u-nu-latn-ca-gregory", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(dt);
    const hh = parts.find(p => p.type === "hour")?.value ?? "";
    const mm = parts.find(p => p.type === "minute")?.value ?? "";
    return hh && mm ? `${hh}:${mm}` : "";
  } catch { return ""; }
};

/** diff นาทีจาก HH:MM (ตามที่แสดงจริงบน UI) */
const hmToMinutes = (s?: string) => {
  if (!s) return undefined;
  const [h, m] = s.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return undefined;
  return h * 60 + m;
};

const diffMinutesHM = (startHM?: string, endHM?: string) => {
  const s = hmToMinutes(startHM);
  const e = hmToMinutes(endHM);
  if (s == null || e == null) return undefined;
  let d = e - s;
  if (d < 0) d += 24 * 60; // ข้ามเที่ยงคืน
  return d;
};

const diffMinutesISO = (startISO?: string, endISO?: string) => {
  if (!startISO || !endISO) return undefined;
  const s = new Date(startISO).getTime();
  const e = new Date(endISO).getTime();
  if (!isFinite(s) || !isFinite(e)) return undefined;
  const deltaMs = e - s;
  if (deltaMs < 0) return undefined;
  return Math.round(deltaMs / 60000);
};

const formatDuration = (mins?: number) => {
  if (mins == null) return undefined;
  if (mins < 60) return `${mins} นาที`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} ชม.` : `${h} ชม. ${m} นาที`;
};

/** แสดงระยะทางแบบใกล้รูปตัวอย่าง: >=1 ปัดเป็นจำนวนเต็ม, <1 แสดงทศนิยม 2 ตำแหน่ง */
const formatKmTight = (km?: number) => {
  if (km == null || !isFinite(km)) return "—";
  if (km >= 1) return `${Math.round(km)}Km`;     // ไม่มีช่องว่างตามภาพ
  return `${km.toFixed(2)}Km`;
};

/** ค่าเฉลี่ยรีวิว + คอมเมนต์แรกที่ไม่ว่าง */
const averageScore = (arr?: {score:number, comment?:string}[]) => {
  if (!arr || arr.length === 0) return undefined;
  const sum = arr.reduce((s, r) => s + (Number(r.score) || 0), 0);
  return Math.round((sum / arr.length) * 10) / 10; // 1 ตำแหน่ง
};
const firstNonEmptyComment = (arr?: {score:number, comment?:string}[]) =>
  arr?.map(r => (r.comment || "").trim()).find(Boolean);

/** map API -> UI */
const money2 = (n: number) => (isFinite(n) ? n.toFixed(2) : "0.00");

const mapTripToHistoryItem = (t: ApiTrip): HistoryItem => {
  const status: Status["type"] =
    t.status === "completed" || t.status === "cancelled" || t.status === "cancelled_with_penalty"
      ? t.status
      : "unknown";

  const startHM = toBangkokTimeHM(t.boarding_time);
  const endHM   = toBangkokTimeHM(t.dropoff_time);

  const minsHM  = diffMinutesHM(startHM, endHM);
  const minsISO = diffMinutesISO(t.boarding_time, t.dropoff_time);
  const durationText = formatDuration(minsHM ?? minsISO);

  const avgScore = averageScore(t.reviews);
  const comment  = firstNonEmptyComment(t.reviews) || "ไม่มี";

  return {
    from: t.pickup_location?.name || "-",
    to: t.dropoff_location?.name || "-",
    fare: t.amount ?? 0,
    pax: typeof t.capacity === "number" && t.capacity > 0 ? t.capacity : 1,
    date: toBangkokDate(t.boarding_time) || toBangkokDate(t.dropoff_time) || "",
    status: { type: status },

    startTimeHM: startHM,
    endTimeHM: endHM,
    durationText,

    distanceKm: t.distance_km,
    reviewScore: avgScore,
    reviewComment: comment,

    driver: t.driver,
    driverVehicle: t.driver_vehicle,
    boardingTimeISO: t.boarding_time,
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
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  // Fetch
  useEffect(() => {
    let aborted = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/User/history", {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const trips: ApiTrip[] = json?.trips || [/* สำหรับลอง layout ใส่ตัวอย่างหนึ่งตัวได้ */];
        const mapped = trips.map(mapTripToHistoryItem);
        if (!aborted) setItems(mapped);
      } catch (err: any) {
        if (!aborted) setError(err?.message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => { aborted = true; };
  }, []);

  const openPopup = (item: HistoryItem) => { setSelected(item); setOpen(true); };
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

      {items.map((item, idx) => (
        <Block_history key={idx} item={item} onClick={() => openPopup(item)} />
      ))}

      {open && selected && (
        <PopupOverlay onClose={closePopup}>
          <Popup_detail item={selected} onClose={closePopup} />
        </PopupOverlay>
      )}

      <Navbar />
    </div>
  );
}

/** Header */
function Header_history({ onClose }: { onClose?: () => void }) {
  const clickable = Boolean(onClose);
  return (
    <div
      className={`flex flex-col items-center h-16 justify-center w-full relative z-[10000] ${clickable ? "cursor-pointer" : ""}`}
      onClick={onClose}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(e) => { if (clickable && (e.key === "Enter" || e.key === " ")) onClose?.(); }}
      aria-label={clickable ? "ปิดหน้าต่าง" : undefined}
    >
      <BackButton />
      <h1 className="text-[32px] font-bold text-shadow-lg mt-18">ประวัติการเดินทาง</h1>
    </div>
  );
}

/** การ์ดพื้นฐาน (list) */
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
      <div className="h-[151px] w-[366px] bg-white rounded-[30px] shadow-md mt-5 p-3 relative">
        <div className="flex mt-1 mb-1">
          <div className="flex flex-col items-center">
            <img src="/icon_pin.svg" alt="start" className="h-[25px] w-[25px] mt-1" />
            <div className="h-6 w-px bg-gray-500" />
            <img src="/icon_pin.svg" alt="end" className="h-[25px] w-[25px]" />
          </div>

          <div className="ml-2 flex flex-col justify-between">
            {/* บรรทัดบน: ต้นทาง + ค่าโดยสาร */}
            <div className="flex items-center">
              <div className="h-[33px] w-[219px] bg-[rgba(139,139,139,0.15)] rounded-2xl flex items-center px-3">
                <p className="ml-1 truncate" title={item.from}>{item.from}</p>
              </div>
              <div className="h-[33px] w-[90px] bg-[rgba(181,91,50,0.8)] rounded-[15px] flex justify-center items-center ml-1.5">
                <img src="/coin.svg" alt="coin" className="h-5 w-5 mr-1" />
                <p className="text-[17px]">{money2(item.fare)}</p>
              </div>
            </div>

            {/* บรรทัดล่าง: ปลายทาง + จำนวนคน */}
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

        <div className="flex mt-2 mb-2 items-center justify-between">
          <div className="flex items-center">
            <img src="/calendar.svg" className="h-5 w-5 ml-1" alt="calendar" />
            <p className="ml-2 text-sm text-gray-500">
              {item.date || "—"}
            </p>
          </div>

          <span
            className={`text-base ${statusClass} text-right pr-6`}
            aria-label={`สถานะ: ${statusLabel}`}
            title={statusLabel}
          >
            {statusLabel}
          </span>
        </div>
      </div>
    </Wrapper>
  );
}

function Block_history({ item, onClick }: { item: HistoryItem; onClick?: () => void }) {
  return <HistoryCard item={item} onClick={onClick} />;
}

/* ---------------- Bottom Sheet Overlay ---------------- */
function PopupOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const [snapIndex, setSnapIndex] = useState(0);
  const [heightRatio, setHeightRatio] = useState<number>(SNAP_POINTS[0]);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const startRatioRef = useRef<number>(SNAP_POINTS[0]);

  useEffect(() => { setHeightRatio(SNAP_POINTS[snapIndex]); }, [snapIndex]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onDragStart = (clientY: number) => { draggingRef.current = true; startYRef.current = clientY; startRatioRef.current = heightRatio; };
  const onDragMoveCommon = (clientY: number) => {
    if (!draggingRef.current) return;
    const vh = window.innerHeight || 1;
    const deltaY = startYRef.current - clientY;
    const deltaRatio = deltaY / vh;
    const next = clamp(startRatioRef.current + deltaRatio, 0.25, 0.9);
    setHeightRatio(next);
  };
  const onDragEnd = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    let best = 0; let bestDist = Infinity;
    SNAP_POINTS.forEach((p, i) => { const d = Math.abs(p - heightRatio); if (d < bestDist) { bestDist = d; best = i; } });
    setSnapIndex(best);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onDragStart(e.clientY);
    const onMove = (ev: MouseEvent) => onDragMoveCommon(ev.clientY);
    const onUp = () => { onDragEnd(); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
  const onTouchStart = (e: React.TouchEvent) => onDragStart(e.touches[0].clientY);
  const onTouchMove  = (e: React.TouchEvent) => onDragMoveCommon(e.touches[0].clientY);
  const onTouchEnd   = () => onDragEnd();

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center" role="dialog" aria-modal="true">
      <button aria-label="ปิดหน้าต่าง" onClick={onClose} className="absolute inset-0 bg-[#000000]/20" tabIndex={-1} />
      <div
        className="relative z-10 w-full max-w-[390px] mx-auto rounded-t-[30px] bg-[#EFEFEF] shadow-xl border-t border-[#D9D9D9] transition-[height] duration-200 ease-out overflow-hidden bottom-0"
        style={{ height: `min(calc(${heightRatio * 100}vh), 560px)` }}
      >
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
        <button type="button" onClick={onClose} className="absolute top-3 right-3" aria-label="ปิดหน้าต่าง" title="ปิด" />
        <div className="h-[calc(100%-44px)] overflow-y-auto px-3 pb-6">{children}</div>
      </div>
    </div>
  );
}

/** Popup detail — จัด layout ให้ใกล้รูป: ซ้าย "เวลา", ขวา "ระยะเวลา", ถัดไป "ระยะทาง" | "คะแนนรีวิว", แล้ว "รีวิว" */
function Popup_detail({ item }: { item: HistoryItem; onClose?: () => void }) {
  const timeRange = useMemo(() => {
    if (!item.startTimeHM && !item.endTimeHM) return "—";
    return `${item.startTimeHM ?? "—"} - ${item.endTimeHM ?? "—"}`;
  }, [item.startTimeHM, item.endTimeHM]);

  const distanceTight = useMemo(() => formatKmTight(item.distanceKm), [item.distanceKm]);

  return (
    <div className="w-full bg-transparent flex flex-col items-center relative">
      {/* การ์ดเดียวกับที่คลิก */}
      <div className="flex justify-center">
        <HistoryCard item={item} />
      </div>

      {/* โปรไฟล์คนขับ */}
      <div className="flex justify-center w-full">
        <Profile_driver
          name={item.driver?.name}
          avatarUrl={item.driver?.profile_picture}
          vehicleType={item.driverVehicle?.vehicle_type}
          model={item.driverVehicle?.model_vehicle}
          license={item.driverVehicle?.license_plate}
        />
      </div>

      {/* เส้นคั่น + หัวข้อ */}
      <div className="flex items-center mt-4 px-4 w-full max-w-[390px]">
        <div className="flex-grow border-t-2 border-[#8B8B8B]" />
        <p className="mx-3 text-base whitespace-nowrap">รายละเอียดการเดินทาง</p>
        <div className="flex-grow border-t-2 border-[#8B8B8B]" />
      </div>

      {/* การ์ดรายละเอียดตามภาพตัวอย่าง */}
      <div className="w-[363px] h-auto bg-white rounded-[30px] shadow-md mt-4 p-6">
        <div className="space-y-4 text-sm">
          {/* แถว 1: เวลา | ระยะเวลา */}
          <div className="flex">
            <div className="w-1/2 ml-3">
              <p className="text-gray-500">เวลา</p>
              <p>{timeRange}</p>
            </div>
            <div className="w-1/2">
              <p className="text-gray-500">ระยะเวลา</p>
              <p>{item.durationText || "—"}</p>
            </div>
          </div>

          {/* แถว 2: ระยะทาง | คะแนนรีวิว */}
          <div className="flex items-center">
            <div className="w-1/2 ml-3">
              <p className="text-gray-500">ระยะทาง</p>
              <p>{distanceTight}</p>
            </div>
            <div className="w-1/2">
              <p className="text-gray-500">คะแนนรีวิว</p>
              <StarRatingDisplay value={typeof item.reviewScore === "number" ? item.reviewScore : 0} size={18} />
            </div>
          </div>

          {/* แถว 3: รีวิว */}
          <div className="">
            <p className="text-gray-500 ml-3">รีวิว</p>
            <div className="mt-1 w-full bg-gray-100 rounded-lg p-2 text-gray-600 min-h-9">
              <p className="ml-2">{item.reviewComment || "ไม่มี"}</p>
            </div>
          </div>
        </div>
      </div>

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
}: {
  name?: string;
  avatarUrl?: string;
  vehicleType?: string;
  model?: string;
  license?: string;
}) {
  return (
    <div className="h-[105px] w-[363px] bg-white rounded-[30px] shadow-md mt-4 flex items-center px-4">
      <img
        src={avatarUrl && avatarUrl.length > 0 ? avatarUrl : "/user.svg"}
        alt="driver"
        className="h-16 w-16 rounded-full object-cover mb-3.5"
      />
      <div className="ml-5 flex flex-col self-start mt-4 w-[140px]">
        <p className="text-base truncate" title={name || "ไม่ระบุ"}>{name || "ไม่ระบุ"}</p>
        <p className="text-base mt-1.5 truncate" title="คนขับ">คนขับ</p>
      </div>
      <div className="ml-8 flex flex-col text-left self-start mt-4 w-[140px]">
        <p className="text-base truncate" title={model || "ยานพาหนะไม่ระบุ"}>
          {[model].filter(Boolean).join(", ") || "ยานพาหนะไม่ระบุ"}
        </p>
        <p className="text-base mt-1.5 truncate" title={license || "ทะเบียนไม่ระบุ"}>
          {license || "ทะเบียนไม่ระบุ"}
        </p>
      </div>
    </div>
  );
}

/** ดาวแบบ “ถมเต็มเฉพาะจำนวนเต็ม” (avg 4.5 จะได้ 4 ดาวเต็ม + 1 ว่าง เหมือนภาพ) */
function StarRatingDisplay({ value, outOf = 5, size = 18 }: { value: number; outOf?: number; size?: number }) {
  const filled = Math.floor(Math.max(0, Math.min(outOf, value)));
  const empty = outOf - filled;
  const filledArr = Array.from({ length: filled }, (_, i) => i);
  const emptyArr = Array.from({ length: empty }, (_, i) => i);
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
