// "use client";
// import React from "react";
// import Navbar from "../components/navbar";

// /* -------------------------------- Types -------------------------------- */
// // ชนิดข้อมูลที่ใช้ใน UI (ทำให้ message/date/time เป็น optional)
// type NotificationType = "inform" | "comfirmation";

// export type Notification = {
//   id: string;
//   type: NotificationType;
//   title: string;
//   message?: string;
//   /** dd/MM/yyyy */
//   date?: string;
//   /** HH:mm (24h) */
//   time?: string;
// };

// // ชนิดข้อมูลจาก API (ตามตัวอย่างที่ให้มา)
// type ApiNotification = {
//   id: number;
//   user_id?: number;
//   reservation_id?: number;
//   title: string;
//   type: NotificationType;
// };

// type NotificationBlockProps = Pick<
//   Notification,
//   "title" | "message" | "date" | "time"
// >;

// /* -------------------------------- Utils -------------------------------- */
// function formatDateThai(dateStr: string): string {
//   if (!dateStr) return "";
//   const [d, m, y] = dateStr.split("/").map(Number);
//   const dt = new Date(y ?? 0, (m ?? 1) - 1, d ?? 1);
//   return new Intl.DateTimeFormat("th-TH", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   }).format(dt);
// }

// /** แปลงข้อมูลจาก API -> รูปแบบที่ UI ใช้ */
// function normalizeFromApi(item: ApiNotification): Notification {
//   return {
//     id: String(item.id),
//     type: item.type,
//     title: item.title ?? "",
//     // // API ที่ให้มาไม่มี message/date/time จึงปล่อยว่างไว้
//     // // ถ้าภายหลัง API มี field เพิ่ม สามารถ map มาใส่ได้ที่นี่
//     // message: undefined,
//     // date: undefined,
//     // time: undefined,
//   };
// }

// /* ------------------------------ Components ----------------------------- */
// function HeaderNotification() {
//   return (
//     <div className="flex flex-col items-center">
//       <p className="text-[32px] font-bold drop-shadow mt-10">การแจ้งเตือน</p>
//     </div>
//   );
// }

// function NotificationBlock({ title, message, date, time }: NotificationBlockProps) {
//   const hasDateTime = Boolean(date && time);
//   return (
//     <div
//       className="bg-white/80 w-full shadow-sm ring-1 ring-black/5 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow"
//       role="article"
//       aria-label={title}
//     >
//       <div className="flex items-center justify-between">
//         {/* ลบ line-clamp-1 ออก เพื่อให้ตัดบรรทัดอัตโนมัติ */}
//         <p className="text-base font-base text-gray-800 break-words">
//           {title}
//         </p>

//         {hasDateTime && (
//           <div className="flex items-center gap-3 text-sm text-gray-500">
//             <div className="flex items-center">
//               <span aria-label="วันที่">{formatDateThai(date!)}</span>
//             </div>
//             <span aria-label="เวลา">{time}</span>
//           </div>
//         )}
//       </div>

//       {message && <p className="text-gray-700 text-sm leading-snug">{message}</p>}
//     </div>
//   );
// }


// /* ------------------------------- Page ---------------------------------- */
// export default function Background() {
//   const [allNotis, setAllNotis] = React.useState<Notification[]>([]);
//   const [loading, setLoading] = React.useState(true);
//   const [error, setError] = React.useState<string | null>(null);

//   // ดึงข้อมูลจาก /api/notifications/my
//   React.useEffect(() => {
//     const ac = new AbortController();

//     async function load() {
//       try {
//         setLoading(true);
//         setError(null);

//         const res = await fetch("/api/notifications/my", {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//           cache: "no-store",
//           signal: ac.signal,
//         });

//         if (!res.ok) {
//           throw new Error(`โหลดข้อมูลไม่สำเร็จ (${res.status})`);
//         }

//         const data: unknown = await res.json();

//         if (!Array.isArray(data)) {
//           throw new Error("รูปแบบข้อมูลจาก API ไม่ใช่ array");
//         }

//         // แปลงเป็นรูปแบบที่ UI ใช้
//         const normalized = (data as ApiNotification[]).map(normalizeFromApi);
//         setAllNotis(normalized);
//       } catch (err: any) {
//         if (err.name !== "AbortError") {
//           setError(err?.message || "เกิดข้อผิดพลาด");
//         }
//       } finally {
//         setLoading(false);
//       }
//     }

//     load();
//     return () => ac.abort();
//   }, []);

//   // เลือกเฉพาะ type = 'inform' และเรียงใหม่ล่าสุดอยู่บนสุด
//   const informOnly = React.useMemo(() => {
//     return allNotis
//       .filter((n) => n.type === "inform")
//       // ไม่มี date/time จาก API: เรียงตาม id (desc) เป็น fallback
//       .sort((a, b) => Number(b.id) - Number(a.id));
//   }, [allNotis]);

//   return (
//     <div className="relative min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center overflow-y-auto">
//       <HeaderNotification />

//       <main className="w-full max-w-2xl mx-auto p-4 space-y-4" aria-live="polite">
//         {loading && (
//           <div className="text-center text-sm text-gray-600 py-6">กำลังโหลดการแจ้งเตือน…</div>
//         )}

//         {error && (
//           <div className="text-center text-sm text-red-600 py-6">ผิดพลาด: {error}</div>
//         )}

//         {!loading &&
//           !error &&
//           informOnly.map((n) => (
//             <NotificationBlock
//               key={n.id}
//               title={n.title}
//               message={n.message}
//               date={n.date}
//               time={n.time}
//             />
//           ))}

//         {!loading && !error && informOnly.length === 0 && (
//           <div className="text-center text-sm text-gray-600 py-6">
//             ไม่มีการแจ้งเตือนแบบ inform
//           </div>
//         )}
//       </main>

//       <Navbar />
//     </div>
//   );
// }
"use client";
import React from "react";
import Navbar from "../components/navbar";

/* -------------------------------- Types -------------------------------- */
// ชนิดข้อมูลที่ใช้ใน UI (ทำให้ message/date/time เป็น optional)
type NotificationType = "inform" | "comfirmation";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  /** dd/MM/yyyy */
  date?: string;
  /** HH:mm (24h) */
  time?: string;
};

// ชนิดข้อมูลจาก API (ตามตัวอย่างที่ให้มา)
type ApiNotification = {
  id: number;
  user_id?: number;
  reservation_id?: number;
  title: string;
  type: NotificationType;
};

type NotificationBlockProps = Pick<
  Notification,
  "title" | "message" | "date" | "time"
>;

/* -------------------------------- Utils -------------------------------- */
function formatDateThai(dateStr: string): string {
  if (!dateStr) return "";
  const [d, m, y] = dateStr.split("/").map(Number);
  const dt = new Date(y ?? 0, (m ?? 1) - 1, d ?? 1);
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dt);
}

/** แปลงข้อมูลจาก API -> รูปแบบที่ UI ใช้ */
function normalizeFromApi(item: ApiNotification): Notification {
  return {
    id: String(item.id),
    type: item.type,
    title: item.title ?? "",
    // API ที่ให้มาไม่มี message/date/time จึงปล่อยว่างไว้
  };
}

/* ------------------------------ Components ----------------------------- */
function HeaderNotification() {
  return (
    <div className="flex flex-col items-center">
      <p className="text-[32px] font-bold drop-shadow mt-10">การแจ้งเตือน</p>
    </div>
  );
}

function NotificationBlock({ title, message, date, time }: NotificationBlockProps) {
  const hasDateTime = Boolean(date && time);
  return (
    <div
      className="bg-white/80 w-full shadow-sm ring-1 ring-black/5 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow"
      role="article"
      aria-label={title}
    >
      <div className="flex items-center justify-between">
        {/* ลบ line-clamp-1 ออก เพื่อให้ตัดบรรทัดอัตโนมัติ */}
        <p className="text-base font-base text-gray-800 break-words">
          {title}
        </p>

        {hasDateTime && (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center">
              <span aria-label="วันที่">{formatDateThai(date!)}</span>
            </div>
            <span aria-label="เวลา">{time}</span>
          </div>
        )}
      </div>

      {message && <p className="text-gray-700 text-sm leading-snug">{message}</p>}
    </div>
  );
}

/* ------------------------------- Page ---------------------------------- */
export default function Background() {
  const [allNotis, setAllNotis] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // ดึงข้อมูลจาก /api/notifications/my
  React.useEffect(() => {
    const ac = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/notifications/my", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          signal: ac.signal,
        });

        if (!res.ok) {
          throw new Error(`โหลดข้อมูลไม่สำเร็จ (${res.status})`);
        }

        const data: unknown = await res.json();

        // ถ้า API ไม่ได้ส่งเป็น array (เช่น ส่ง null/obj/string) ให้ถือว่า "ไม่มีแจ้งเตือน"
        if (!Array.isArray(data)) {
          setAllNotis([]);
          return;
        }

        // แปลงเป็นรูปแบบที่ UI ใช้
        const normalized = (data as ApiNotification[]).map(normalizeFromApi);
        setAllNotis(normalized);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setError(err?.message || "เกิดข้อผิดพลาด");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => ac.abort();
  }, []);

  // เลือกเฉพาะ type = 'inform' และเรียงใหม่ล่าสุดอยู่บนสุด
  const informOnly = React.useMemo(() => {
    return allNotis
      .filter((n) => n.type === "inform")
      // ไม่มี date/time จาก API: เรียงตาม id (desc) เป็น fallback
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [allNotis]);

  return (
    <div className="relative min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center overflow-y-auto">
      <HeaderNotification />

      <main className="w-full max-w-2xl mx-auto p-4 space-y-4" aria-live="polite">
        {loading && (
          <div className="text-center text-sm text-gray-600 py-6">
            กำลังโหลดการแจ้งเตือน…
          </div>
        )}

        {error && (
          <div className="text-center text-sm text-red-600 py-6">
            ผิดพลาด: {error}
          </div>
        )}

        {!loading && !error && informOnly.length > 0 && (
          informOnly.map((n) => (
            <NotificationBlock
              key={n.id}
              title={n.title}
              message={n.message}
              date={n.date}
              time={n.time}
            />
          ))
        )}

        {/* ถ้าไม่มีอะไรให้แสดง (รวมถึงกรณี API ไม่ส่ง array มา) ให้บอก "ไม่มีแจ้งเตือน" */}
        {!loading && !error && informOnly.length === 0 && (
          <div className="text-center text-base text-gray-600 py-3">
            ไม่มีแจ้งเตือน
          </div>
        )}
      </main>

      <Navbar />
    </div>
  );
}
