"use client";

import { useEffect, useRef, useState } from "react";
import { BackButton } from "@/app/components/share_component";
import Navbar from "../components/navbar";

/** -------- Types & API Shapes -------- */
interface Review {
  name?: string;
  index?: number;
  rating: number; // 1..5
  comment?: string;
}

interface HistoryItem {
  fare: number;
  pax: number;
  date: string; // DD/MM/YYYY (เวลาไทย)
  startTime: string; // HH:MM (24-hr, เวลาไทย)
  endTime: string;   // HH:MM (24-hr, เวลาไทย)
  stops: string[];   // stops[0] = start, stops[last] = end
  reviews?: Review[];
}

// ----- API response -----
interface ApiLocation { name: string; lat: number; lng: number }
interface ApiReservation { id: number; passenger_id: number; seats: number; status: string; amount: number }
interface ApiDriver { id: number; name: string; email: string; profile_picture?: string }
interface ApiDriverVehicle { driver_id: number; vehicle_type: string; model_vehicle: string; license_plate: string; seats: number; description?: string }
interface ApiTrip {
  trip_id: number;
  status: string;
  path_locations: ApiLocation[];
  capacity: number;
  driver: ApiDriver;
  driver_vehicle: ApiDriverVehicle;
  amount: number; // fare per trip
  reservations: ApiReservation[];
  reviews?: { score: number; comment?: string }[];
  distance_km: number;
  duration_sec: number; // duration in seconds
  scheduled_start_time: string; // ISO string (คาดว่าเป็น UTC มี Z)
}
interface ApiHistoryResponse { message: string; trips: ApiTrip[] }

/* ---------------- Utils ---------------- */
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const SNAP_POINTS = [0.33, 0.66] as const;

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function diffMinutes(start: string, end: string): number {
  const s = timeToMinutes(start);
  let e = timeToMinutes(end);
  if (e < s) e += 24 * 60; // cross-midnight support
  return e - s;
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} นาที`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} ชม.` : `${h} ชม. ${m} นาที`;
}

/** ---------- Thai Timezone Formatters (ไม่บวก 7 ชั่วโมงเอง) ---------- */
/** ใช้ปฏิทินเกรกอเรียนและเลขอารบิกเพื่อเลี่ยง พ.ศ./เลขไทย */
const DATE_FMT_TH = new Intl.DateTimeFormat("th-TH-u-nu-latn-ca-gregory", {
  timeZone: "Asia/Bangkok",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const TIME_FMT_TH = new Intl.DateTimeFormat("th-TH-u-nu-latn-ca-gregory", {
  timeZone: "Asia/Bangkok",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// ถ้าต้องการสตริง "DD/MM/YYYY" (เวลาไทย)
function formatDateDMYThai(d: Date) {
  return DATE_FMT_TH.format(d);
}

// ถ้าต้องการสตริง "HH:MM" (เวลาไทย)
function formatHHMMThai(d: Date) {
  return TIME_FMT_TH.format(d);
}

/** ---------- Transform API trip -> HistoryItem (เวลาไทย) ---------- */
function mapTripToHistoryItem(t: ApiTrip): HistoryItem {
  const start = new Date(t.scheduled_start_time); // ควรเป็น UTC (มี Z)
  const end = new Date(start.getTime() + (t.duration_sec || 0) * 1000);

  // ปัดวินาที-มิลลิวินาทีให้เหลือนาที (ปัดลง)
  const startRounded = new Date(Math.floor(start.getTime() / 60000) * 60000);
  const endRounded   = new Date(Math.floor(end.getTime() / 60000) * 60000);

  const pax = (t.reservations || []).reduce((acc, r) => acc + (r.seats || 0), 0);
  const stops = (t.path_locations || []).map((p) => p.name).filter(Boolean);

  // reviews -> HistoryItem.reviews
  const reviews: Review[] | undefined = Array.isArray(t.reviews)
    ? t.reviews.map((rv, i) => ({ index: i + 1, rating: rv.score, comment: rv.comment }))
    : undefined;

  return {
    fare: Number.isFinite(t.amount) ? Number(t.amount) : 0,
    pax,
    date: formatDateDMYThai(startRounded),     // ✅ เวลาไทย
    startTime: formatHHMMThai(startRounded),   // ✅ เวลาไทย
    endTime: formatHHMMThai(endRounded),       // ✅ เวลาไทย
    stops: stops.length > 0 ? stops : ["-"],
    reviews,
  };
}

function resolveToken(): string | null {
  if (typeof document === "undefined") return null;
  const cookieStr = document.cookie || "";
  if (!cookieStr) return null;
  const pairs = cookieStr.split(";");
  for (const raw of pairs) {
    const [rawName, ...rest] = raw.trim().split("=");
    const name = rawName?.trim();
    const value = rest.join("=");
    if (!name) continue;
    if (name === "AuthToken") {
      try { return decodeURIComponent(value); } catch { return value; }
    }
  }
  return null;
}

/* ---------------- Page ---------------- */
function Background() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  useEffect(() => {
    let aborted = false;
    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const token = resolveToken();
        if (!token) throw new Error("ไม่พบ token ใน cookies");

        const res = await fetch("/api/driver/history", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`เรียก API ไม่สำเร็จ (${res.status}) ${text || ""}`);
        }

        const json: ApiHistoryResponse = await res.json();
        const trips = Array.isArray(json?.trips) ? json.trips : [];
        const mapped = trips.map(mapTripToHistoryItem);
        if (!aborted) setItems(mapped);
      } catch (e: any) {
        if (!aborted) setError(e?.message || "เกิดข้อผิดพลาด");
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    fetchHistory();
    return () => { aborted = true; };
  }, []);

  const openPopup = (item: HistoryItem) => { setSelected(item); setOpen(true); };
  const closePopup = () => setOpen(false);

  return (
    <div className="min-h-screen w-full bg-[#C5D4E8] flex flex-col items-center pb-20">
      <Header_history onClose={open ? closePopup : undefined} />
      <div className="mt-5" />

      {loading && (
        <div className="w-[366px] animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[141px] w-[366px] bg-white/70 rounded-[30px] shadow-sm mt-5" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="w-[366px] bg-red-50 border border-red-200 text-red-700 rounded-2xl p-3 mt-4">
          <p className="font-medium">โหลดข้อมูลไม่สำเร็จ</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="w-[366px] bg-white rounded-[30px] shadow-md mt-5 p-4 text-center text-gray-600">
          ไม่พบทริปที่ผ่านมา
        </div>
      )}

      {!loading && !error && items.map((item, idx) => (
        <Block_history key={idx} item={item} onClick={() => openPopup(item)} />
      ))}

      {open && selected && (
        <PopupOverlay onClose={closePopup}>
          <Popup_detail item={selected} />
        </PopupOverlay>
      )}

      <Navbar />
    </div>
  );
}

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

/** การ์ดพื้นฐานใน list */
function HistoryCard({ item, onClick }: { item: HistoryItem; onClick?: () => void; }) {
  const start = item.stops[0];
  const end   = item.stops[item.stops.length - 1];

  const Wrapper: any = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`${onClick ? "block text-left focus:outline-none cursor-pointer" : ""}`}
      aria-label={onClick ? "ดูรายละเอียดการเดินทาง" : undefined}
    >
      <div className="h-[141px] w-[366px] bg-white rounded-[30px] shadow-md mt-5 p-3">
        <div className="flex mt-1 mb-1">
          {/* คอลัมน์ไอคอน + เส้นเชื่อม */}
          <div className="relative flex flex-col items-center">
            <img src="/icon_pin.svg" alt="start" className="h-[25px] w-[25px] mt-1" />
            <div className="h-6 w-px bg-gray-500" />
            <img src="/icon_pin.svg" alt="end" className="h-[25px] w-[25px]" />
          </div>

          <div className="ml-2 flex flex-col justify-between">
            {/* แถวบน: start + fare */}
            <div className="flex items-center">
              <div className="h-[33px] w-[219px] bg-[rgba(139,139,139,0.15)] rounded-2xl flex items-center px-3">
                <p className="ml-1 truncate">{start}</p>
              </div>
              <div className="h-[33px] w-[90px] bg-[rgba(181,91,50,0.8)] rounded-[15px] flex justify-center items-center ml-1.5">
                <img src="/coin.svg" alt="coin" className="h-5 w-5 mr-1" />
                <p className="text-[17px]">{item.fare.toFixed(2)}</p>
              </div>
            </div>

            {/* แถวล่าง: end + pax */}
            <div className="flex items-center mt-5">
              <div className="h-[33px] w-[219px] bg-[rgba(139,139,139,0.15)] rounded-2xl flex items-center px-3">
                <p className="ml-1 truncate">{end}</p>
              </div>
              <div className="h-[33px] w-[90px] bg-white rounded-[15px] border border-gray-600 flex justify-center items-center ml-1.5">
                <p className="text-[17px]">{item.pax}</p>
                <img src="/human.svg" alt="human" className="h-5 w-5 ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* วันที่ + เวลา */}
        <div className="flex mt-2 mb-1 items-center">
          <img src="/calendar.svg" className="h-5 w-5 ml-1" alt="calendar" />
          <p className="ml-2 text-sm text-gray-500">
            {item.date}
          </p>
        </div>
      </div>
    </Wrapper>
  );
}

function Block_history({ item, onClick }: { item: HistoryItem; onClick?: () => void; }) {
  return <HistoryCard item={item} onClick={onClick} />;
}

/* ---------------- Bottom Sheet Overlay ---------------- */
function PopupOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode; }) {
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
    const next = clamp(startRatioRef.current + deltaRatio, 0.2, 0.98);
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
    e.preventDefault(); onDragStart(e.clientY);
    const onMove = (ev: MouseEvent) => onDragMoveCommon(ev.clientY);
    const onUp = () => { onDragEnd(); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
  const onTouchStart = (e: React.TouchEvent) => onDragStart(e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => onDragMoveCommon(e.touches[0].clientY);
  const onTouchEnd = () => onDragEnd();

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center" role="dialog" aria-modal="true">
      <button aria-label="ปิดหน้าต่าง" onClick={onClose} className="absolute inset-0 bg-[#000000]/20" tabIndex={-1} />
      <div
        className="relative z-10 w-full max-w-[390px] mx-auto rounded-t-[30px] bg-[#EFEFEF] shadow-xl border-t border-[#D9D9D9] transition-[height] duration-200 ease-out overflow-hidden bottom-0"
        style={{ height: `min(calc(${heightRatio * 100}vh), 700px)` }}
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

        {/* เนื้อหา */}
        <div className="h-[calc(100%-44px)] overflow-y-auto px-3 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/** ---------- การ์ด: จุดรับส่งทั้งหมด ---------- */
function StopsCard({ item }: { item: HistoryItem }) {
  const stops = item.stops;

  return (
    <div className="W-[363px] w-[363px] bg-white rounded-[30px] shadow-md mt-4 p-4">
      <p className="text-center text-xl font-semibold">จุดรับส่งทั้งหมด</p>

      <div className="mt-3 space-y-2.5">
        {stops.map((s, i) => {
          const isLast = i === stops.length - 1;
          return (
            <div key={`${s}-${i}`} className="relative pl-6">
              {/* ไอคอนจุด */}
              <img
                src="/icon_pin.svg"
                alt=""
                className="h-[18px] w-[18px] shrink-0 absolute left-0 top-[4px] z-10"
              />

              {/* เส้นเชื่อมระหว่างจุด */}
              {!isLast && (
                <div className="absolute left-[9px] top-[22px] bottom-[-10px] w-px bg-gray-500" />
              )}

              {/* กล่องชื่อจุด */}
              <div className="ml-2 h-[30px] flex-1 bg-[rgba(139,139,139,0.15)] rounded-2xl flex items-center px-3">
                <p className="ml-1 truncate">{s}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** ---------- เวลา + ระยะเวลารวม ---------- */
function TripMeta({ item }: { item: HistoryItem }) {
  const mins = diffMinutes(item.startTime, item.endTime);
  const duration = formatDuration(mins);

  return (
    <div className="w-[363px] bg-white rounded-[30px] shadow-md mt-4 p-4">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-gray-500 text-sm ml-2">เวลา</p>
          <p className="ml-2">
            {item.startTime} - {item.endTime}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-sm ml-2">ระยะเวลารวม</p>
          <p className="ml-2">{duration}</p>
        </div>
      </div>
    </div>
  );
}

/** ---------- ความคิดเห็นที่ได้รับ ---------- */
function FeedbackCard({ item }: { item: HistoryItem }) {
  const reviews = item.reviews ?? [];
  const hasReviews = reviews.length > 0;

  return (
    <div className="w-[363px] bg-white rounded-[30px] shadow-md mt-4 p-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-600 text-sm ml-2">ความคิดเห็นที่ได้รับ</p>
      </div>

      {!hasReviews ? (
        <div className="h-auto w-full bg-[#EFEFEF] rounded-full mt-2 px-3 py-2">
          <p className="text-base">ไม่มี</p>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {reviews.map((r, idx) => {
            const label = r.name ?? `ผู้โดยสารคนที่ ${r.index ?? idx + 1}`;
            return (
              <div
                key={`${label}-${idx}`}
                className="rounded-[18px] bg-[#EFEFEF] px-3 py-2 flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <StarRatingDisplay value={r.rating} size={18} />
                </div>
                {r.comment && (
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">
                    {r.comment}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** ---------- Popup Detail ---------- */
function Popup_detail({ item }: { item: HistoryItem; onClose?: () => void; }) {
  return (
    <div className="w-full bg-transparent flex flex-col items-center relative">
      <HistoryCard item={item} />

      {/* เส้นคั่น + หัวข้อ */}
      <div className="flex items-center mt-4 px-4 w-full max-w-[390px]">
        <div className="flex-grow border-t-2 border-[#8B8B8B]" />
        <p className="mx-3 text-base whitespace-nowrap">รายละเอียดการเดินทาง</p>
        <div className="flex-grow border-t-2 border-[#8B8B8B]" />
      </div>

      <StopsCard item={item} />
      <TripMeta item={item} />
      <FeedbackCard item={item} />

      <div className="flex justify-center w-full">
        <img src="/car_popup_detail.svg" alt="Map" className="mt-3 w-[155px]" />
      </div>
    </div>
  );
}

/** ---- ดาวรูปภาพแบบแสดงผล ---- */
function StarRatingDisplay({ value, outOf = 5, size = 18 }: { value: number; outOf?: number; size?: number; }) {
  const clamped = Math.max(0, Math.min(outOf, value));
  const filled = Math.floor(clamped);
  const empty = outOf - filled;
  const filledArr: number[] = Array.from({ length: filled }, (_, i) => i);
  const emptyArr: number[] = Array.from({ length: empty }, (_, i) => i);

  return (
    <div className="flex items-center">
      {filledArr.map((i) => (
        <img
          key={`f-${i}`}
          src="/star_filled.svg"
          alt="filled star"
          style={{ width: size, height: size }}
          className="mx-0.5"
        />
      ))}
      {emptyArr.map((i) => (
        <img
          key={`e-${i}`}
          src="/star.svg"
          alt="empty star"
          style={{ width: size, height: size }}
          className="mx-0.5"
        />
      ))}
    </div>
  );
}

export default Background;
export { Popup_detail, Block_history, Header_history, StarRatingDisplay };
