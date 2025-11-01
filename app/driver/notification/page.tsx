"use client";
import React, { useState } from "react";
import { BackButton } from "@/app/components/share_component";
import Navbar from "../components/navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

// =====================
// Types
// =====================
// แบบแจ้งเตือน 2 แบบ: แจ้งข้อมูล (inform) และให้คนขับยืนยัน (confirm)

type NotificationType = "inform" | "confirm";

interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;        // หัวข้อสั้น ๆ
  message: string;      // เนื้อหา
  // ใช้สตริงที่ฟอร์แมตรูปแบบแล้ว เพื่อลดปัญหา hydration mismatch จากเวลา/ไทม์โซน
  date: string;         // dd/MM/yyyy
  time: string;         // HH:mm
}

// =====================
// Mock data (ฟอร์แมตแล้วล่วงหน้า ไม่ใช้ Date.now/locale ในการเรนเดอร์)
// =====================
const notificationsSeed: NotificationData[] = [
  {
    id: "n1",
    type: "inform",
    title: "อัปเดตระบบ",
    message: "ระบบจะปิดปรับปรุงวันที่ 05/09/2025 เวลา 18:11–19:00 น.",
    date: "05/09/2025",
    time: "18:11",
  },
  {
    id: "n2",
    type: "confirm",
    title: "ยืนยันรับงานลูกค้า",
    message: "งานหมายเลข #A1049: รับ–ส่งจาก KMITL ไป Siam Paragon",
    date: "05/09/2025",
    time: "18:25",
  },
];

// =====================
// Modal
// =====================
function ConfirmModal({
  open,
  title,
  message,
  onApprove,
  onReject,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      {/* modal card */}
      <div className="relative z-10 w-[90%] max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/10">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600 leading-relaxed">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="px-3 py-2 text-sm rounded-xl ring-1 ring-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onReject}
          >
            ปฏิเสธ
          </button>
          <button
            className="px-3 py-2 text-sm rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={onApprove}
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================
// Notification item
// =====================
function NotificationItem({ data, onConfirmClick }: {
  data: NotificationData;
  onConfirmClick: (n: NotificationData) => void;
}) {
  return (
    <div className="group relative w-full rounded-2xl bg-white/80 shadow-sm ring-1 ring-black/5 p-4 flex flex-col gap-2 hover:shadow transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{data.title}</p>
          <p className="mt-0.5 text-base font-medium text-gray-900 leading-snug">
            {data.message}
          </p>
        </div>
        {/* วันที่ & เวลา บรรทัดเดียวกัน */}
        <div className="shrink-0 text-right text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {/* ไม่ใช้ไอคอน ปล่อยเป็นข้อความล้วน */}
              <span>{data.date}</span>
            </div>
            <span>{data.time}</span>
          </div>
        </div>
      </div>

      {/* Action area สำหรับ type = confirm เท่านั้น */}
      {data.type === "confirm" && (
        <div className="mt-2 flex justify-end gap-2">
          <button
            className="px-3 py-1.5 text-sm rounded-xl ring-1 ring-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => onConfirmClick(data)}
          >
            ยืนยัน/ปฏิเสธ
          </button>
        </div>
      )}
    </div>
  );
}

// =====================
// Header
// =====================
function Header_notification() {
  return (
    <div className="flex flex-col items-center">
      {/* <BackButton /> */}
      <p className="text-[32px] font-bold text-gray-900 mt-8">การแจ้งเตือน</p>
    </div>
  );
}

// =====================
// Page
// =====================
export default function Background() {
  const [notifications, setNotifications] = useState<NotificationData[]>(notificationsSeed);
  const [modalOpen, setModalOpen] = useState(false);
  const [pending, setPending] = useState<NotificationData | null>(null);

  const openConfirm = (n: NotificationData) => {
    setPending(n);
    setModalOpen(true);
  };

  const closeConfirm = () => {
    setModalOpen(false);
    setPending(null);
  };

  const approve = async () => {
    // TODO: เรียก API ของคุณด้วย axios ตามจริง
    // await axios.post("/api/confirm", { id: pending?.id, action: "approve" });
    closeConfirm();
  };

  const reject = async () => {
    // TODO: เรียก API ของคุณด้วย axios ตามจริง
    // await axios.post("/api/confirm", { id: pending?.id, action: "reject" });
    closeConfirm();
  };

  return (
    <div className="relative min-h-screen w-full bg-[#C5D4E8] flex flex-col items-center overflow-y-scroll">
      <Header_notification />

      <div className="w-full max-w-md mx-auto p-4 pb-24 space-y-3">
        {notifications.map((n) => (
          <NotificationItem key={n.id} data={n} onConfirmClick={openConfirm} />
        ))}
      </div>

      <div className="fixed bottom-0 inset-x-0">
        <Navbar />
      </div>

      <ConfirmModal
        open={modalOpen}
        title={pending?.title || "ยืนยันการทำรายการ"}
        message={pending?.message || "คุณต้องการยืนยันรายการนี้หรือไม่?"}
        onApprove={approve}
        onReject={reject}
        onClose={closeConfirm}
      />
    </div>
  );
}
