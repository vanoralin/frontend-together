"use client";
import React from "react";
import Navbar from "../components/navbar";

// --- Types ---
type NotificationType = "inform";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  /** dd/MM/yyyy */
  date: string;
  /** HH:mm (24h) */
  time: string;
};

type NotificationBlockProps = Pick<
  Notification,
  "title" | "message" | "date" | "time"
>;

// --- Mock data ---
const NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "inform",
    title: "การชำระเงินสำเร็จ",
    message: "คำสั่งซื้อ #A1049 ได้รับการชำระเงินแล้ว",
    date: "05/09/2025",
    time: "18:11",
  },
  {
    id: "2",
    type: "inform",
    title: "อัปเดตระบบ",
    message: "ระบบจะปิดปรับปรุงในวันที่ 2 พ.ย. เวลา 01:00–02:00 น.",
    date: "02/11/2025",
    time: "00:15",
  },
  {
    id: "3",
    type: "inform",
    title: "ตั๋วสนับสนุน",
    message: "ทีมงานตอบกลับคำร้องของคุณแล้ว",
    date: "31/10/2025",
    time: "21:45",
  },
];

// --- Utils ---
/** Parse dd/MM/yyyy HH:mm (24h) to Date safely */
function parseThaiDate(date: string, time: string): Date {
  const [d, m, y] = date.split("/").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  // new Date(year, monthIndex, day, hours, minutes)
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0);
}

function formatDateThai(dateStr: string): string {
  const [d, m, y] = dateStr.split("/").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dt);
}

// --- Component ---
function HeaderNotification() {
  return (
    <div className="flex flex-col items-center">
      <p className="text-[32px] font-bold drop-shadow mt-10">การแจ้งเตือน</p>
    </div>
  );
}

function NotificationBlock({ title, message, date, time }: NotificationBlockProps) {
  return (
    <div className="bg-white/80 w-full shadow-sm ring-1 ring-black/5 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow" role="article" aria-label={title}>
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-gray-800 line-clamp-1">{title}</p>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <div className="flex items-center">
            <span aria-label="วันที่">{formatDateThai(date)}</span>
          </div>
          <span aria-label="เวลา">{time}</span>
        </div>
      </div>
      <p className="text-gray-700 text-sm leading-snug">{message}</p>
    </div>
  );
}

export default function Background() {
  // เลือกเฉพาะ type = 'inform' และเรียงใหม่ล่าสุดอยู่บนสุด
  const informOnly = React.useMemo(() => {
    return NOTIFICATIONS.filter((n) => n.type === "inform").sort((a, b) => {
      const da = parseThaiDate(a.date, a.time).getTime();
      const db = parseThaiDate(b.date, b.time).getTime();
      return db - da; // desc
    });
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center overflow-y-auto">
      <HeaderNotification />

      <main className="w-full max-w-2xl mx-auto p-4 space-y-4" aria-live="polite">
        {informOnly.map((n) => (
          <NotificationBlock
            key={n.id}
            title={n.title}
            message={n.message}
            date={n.date}
            time={n.time}
          />
        ))}

        {informOnly.length === 0 && (
          <div className="text-center text-sm text-gray-600 py-6">ไม่มีการแจ้งเตือนแบบ inform</div>
        )}
      </main>

      <Navbar />
    </div>
  );
}
