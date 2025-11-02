"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import { useRouter } from "next/navigation";

/* ===================== Config / Flags ===================== */
const DEBUG = true;

/* ===================== Types ===================== */
type ApiNotificationType = "inform" | "confirmation";

interface ApiNotification {
  id: number;
  user_id?: number;
  reservation_id?: number | string;
  title: string;
  message?: string;
  type: ApiNotificationType;
  created_at?: string;
}

type UiType = "inform" | "confirmation";

interface NotificationData {
  id: string;
  reservation_id?: number;
  type: UiType;
  title: string;
  message?: string;
  date?: string;
  time?: string;
}

/* ===================== Utils ===================== */
const pad2 = (n: number) => String(n).padStart(2, "0");

function isoToDateTimeThai(iso?: string): { date?: string; time?: string } {
  if (!iso) return {};
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return {};
  return {
    date: `${pad2(dt.getDate())}/${pad2(
      dt.getMonth() + 1
    )}/${dt.getFullYear()}`,
    time: `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`,
  };
}

function normalizeFromApi(item: ApiNotification): NotificationData {
  const base = isoToDateTimeThai(item.created_at);
  const rid =
    item.reservation_id == null
      ? undefined
      : Number.isNaN(Number(item.reservation_id))
      ? undefined
      : Number(item.reservation_id);
  return {
    id: String(item.id),
    reservation_id: rid,
    type: item.type,
    title: item.title ?? "",
    message: item.message,
    date: base.date,
    time: base.time,
  };
}

/** อ่าน AuthToken จาก localStorage (ถ้าใช้ชื่อคีย์อื่น เปลี่ยนตรงนี้) */
function getAuthToken(): string | null {
  try {
    return (
      localStorage.getItem("AuthToken") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      null
    );
  } catch {
    return null;
  }
}

/** ดึง trips ออกจาก response ได้ทั้ง array ตรง ๆ, object เดี่ยว, หรือ { trips: [...] } */
function extractTripsArray(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw; // array ตรง ๆ
  if (raw?.id && raw?.reservations) return [raw]; // object trip เดี่ยว
  if (raw?.trips && Array.isArray(raw.trips)) return raw.trips; // { trips: [] }
  if (raw?.data?.trips && Array.isArray(raw.data.trips)) return raw.data.trips; // { data: { trips: [] } }
  if (raw?.data && Array.isArray(raw.data)) return raw.data; // { data: [] }
  return [];
}

/** สร้าง map: reservation_id -> trip.id จาก trips(view) ที่มี reservations ภายใน */
function buildReservationToTripMapFromTrips(
  trips: any[]
): Record<number, number> {
  const map: Record<number, number> = {};
  for (const t of trips) {
    const tripId = Number(t?.id);
    const reservations: any[] = Array.isArray(t?.reservations)
      ? t.reservations
      : [];
    if (!Number.isNaN(tripId)) {
      for (const r of reservations) {
        const rid = Number(r?.id);
        if (!Number.isNaN(rid)) {
          map[rid] = tripId;
        }
      }
    }
  }
  return map;
}

/* ===================== API URL helpers ===================== */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ""; // ex: http://localhost:3000
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""; // ex: /customer
const NOTI_URL = API_BASE
  ? `${API_BASE}${BASE_PATH}/api/notifications/my`
  : `${BASE_PATH}/api/notifications/my`;
const TRIPS_URL = API_BASE
  ? `${API_BASE}${BASE_PATH}/api/trips/view`
  : `${BASE_PATH}/api/trips/view`;

/* ===================== Components ===================== */
function Header_notification() {
  return (
    <div className="flex flex-col items-center">
      <p className="text-[32px] font-bold text-gray-900 mt-8">การแจ้งเตือน</p>
    </div>
  );
}

function NotificationItem({
  data,
  isRead,
  onGoToTrip,
}: {
  data: NotificationData;
  isRead: boolean;
  onGoToTrip: (n: NotificationData) => void;
}) {
  return (
    <div className="group relative w-full rounded-2xl bg-white/80 shadow-sm ring-1 ring-black/5 p-4 flex flex-col gap-2 hover:shadow transition-shadow">
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-black break-words">{data.title}</p>
        </div>
        {data.message && (
          <p className="text-base font-medium text-gray-900 leading-snug break-words">
            {data.message}
          </p>
        )}
      </div>

      {data.type === "confirmation" && (
        <div className="mt-2 flex justify-end">
          <button
            className={
              "px-3 py-1.5 text-sm rounded-xl transition-colors " +
              (isRead
                ? "bg-black text-white" // ⬅️ เปลี่ยนเป็นสีดำเมื่ออ่านแล้ว
                : "bg-emerald-600 text-white hover:bg-emerald-700")
            }
            onClick={() => onGoToTrip(data)}
          >
            ไปที่ทริป
          </button>
        </div>
      )}
    </div>
  );
}

/* ===================== Page ===================== */
export default function Background() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errorList, setErrorList] = useState<string | null>(null);

  const [trips, setTrips] = useState<any[]>([]);
  const [tripByReservation, setTripByReservation] = useState<
    Record<number, number>
  >({});
  const [readSet, setReadSet] = useState<Set<string>>(new Set());

  // โหลด notifications
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingList(true);
        setErrorList(null);

        const res = await fetch(NOTI_URL, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (${res.status})`);
        const raw = await res.json();
        if (!Array.isArray(raw))
          throw new Error("รูปแบบข้อมูลจาก API ไม่ใช่ array");

        const normalized = (raw as ApiNotification[])
          .filter((n) => n.type === "inform" || n.type === "confirmation")
          .map(normalizeFromApi)
          .sort((a, b) => Number(b.id) - Number(a.id));

        if (!cancelled) setNotifications(normalized);
      } catch (e: any) {
        if (!cancelled) setErrorList(e?.message || "เกิดข้อผิดพลาด");
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // โหลด trips/view (ต้องใส่ Authorization) + สร้างแผนที่ reservation -> trip
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = getAuthToken();
        const headers: HeadersInit = token
          ? { Authorization: `Bearer ${token}` }
          : {};
        const res = await fetch(TRIPS_URL, {
          method: "GET",
          headers,
          cache: "no-store",
        });
        const raw = await res.json().catch(() => null);
        if (DEBUG) console.log("wxmujmibx: raw trips/view =", raw);

        const arr = extractTripsArray(raw);
        const map = buildReservationToTripMapFromTrips(arr);

        if (!cancelled) {
          setTrips(arr);
          setTripByReservation(map);
          if (DEBUG) {
            console.log("wxmujmibx: total trips =", arr.length);
            console.log("wxmujmibx: built map reservation->trip =", map);
          }
        }
      } catch (err) {
        if (DEBUG) console.error("wxmujmibx: load trips/view failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ไปหน้า trip จาก reservation_id + log ก่อน navigate
  const goToTrip = async (n: NotificationData) => {
    const rid = n.reservation_id;
    if (!rid) {
      alert("ไม่พบ reservation_id ของรายการนี้");
      if (DEBUG)
        console.warn("wxmujmibx: no reservation_id in notification", n);
      return;
    }

    if (DEBUG) {
      console.log("wxmujmibx: clicked notification =", n);
      console.log("wxmujmibx: reservation_id =", rid);
      console.log("wxmujmibx: current map =", tripByReservation);
    }

    // หา tripId จาก map ที่สร้างจาก trips.view
    let tripId = tripByReservation[rid];

    // ถ้ายังไม่เจอ ลองค้นใน trips ที่แคชไว้ (ป้องกัน map พลาด)
    if (!tripId) {
      const foundTrip = trips.find(
        (t) =>
          Array.isArray(t?.reservations) &&
          t.reservations.some((r: any) => Number(r?.id) === Number(rid))
      );
      if (foundTrip?.id != null && !Number.isNaN(Number(foundTrip.id))) {
        tripId = Number(foundTrip.id);
      }
      if (DEBUG)
        console.log(
          "wxmujmibx: find in trips state ->",
          foundTrip,
          "tripId:",
          tripId
        );
    }

    // ถ้ายังไม่เจออีก แสดงผลและจบ
    if (!tripId) {
      console.warn("wxmujmibx: ❌ ไม่พบทริปของรายการนี้", {
        rid,
        map: tripByReservation,
        sampleTrip: trips[0],
      });
      alert("ไม่พบทริปของรายการนี้");
      return;
    }

    // log ให้เห็นแน่ ๆ ก่อน navigate
    console.log(
      "%cwxmujmibx%c Trip ID:",
      "color:#10b981;font-weight:700",
      "color:inherit",
      tripId,
      "| Reservation ID:",
      rid
    );

    // เปลี่ยนสีปุ่มเป็น “ดำ” = อ่านแล้ว
    setReadSet((prev) => new Set(prev).add(n.id));

    // ไปหน้า /driver/trip/[id]
    router.push(`/driver/trip/${tripId}`);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#C5D4E8] flex flex-col items-center overflow-y-scroll">
      <Header_notification />
      <div className="w-full max-w-md mx-auto p-4 pb-24 space-y-3">
        {loadingList && (
          <div className="text-center text-sm text-gray-600 py-6">
            กำลังโหลดการแจ้งเตือน…
          </div>
        )}

        {errorList && (
          <div className="text-center text-sm text-red-600 py-6">
            ผิดพลาด: {errorList}
          </div>
        )}

        {!loadingList && !errorList && notifications.length === 0 && (
          <div className="text-center text-sm text-gray-600 py-6">
            ยังไม่มีการแจ้งเตือน
          </div>
        )}

        {!loadingList &&
          !errorList &&
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              data={n}
              isRead={readSet.has(n.id)}
              onGoToTrip={goToTrip}
            />
          ))}
      </div>

      <div className="fixed bottom-0 inset-x-0">
        <Navbar />
      </div>
    </div>
  );
}
