"use client";

import { useEffect, useRef, useState } from "react";
import { BackButton } from "@/app/components/share_component";
import Navbar from "../components/navbar";

/** -------- Types & Demo Data -------- */
interface Status {
  type: "completed" | "cancelled" | "cancelled_with_penalty";
}

interface HistoryItem {
  from: string;
  to: string;
  fare: number;
  pax: number;
  date: string; // e.g., "12/12/2023"
  status: Status; // ✅ เพิ่มสถานะเข้าไปใน item
}

/** label ภาษาไทย + style ของ badge ตามสถานะ */
const STATUS_LABELS: Record<Status["type"], string> = {
  completed: "สำเร็จ",
  cancelled: "ยกเลิก",
  cancelled_with_penalty: "ยกเลิก (ปรับ)",
};

const STATUS_STYLES: Record<Status["type"], string> = {
  completed: "text-emerald-700",
  cancelled: "text-rose-600",
  cancelled_with_penalty: "text-rose-600",
};

const historyItems: HistoryItem[] = [
  { from: "ฝั่งตรงข้ามเกกี4", to: "หน้าตึก ECC", fare: 100, pax: 3, date: "12/12/2023", status: { type: "completed" } },
  { from: "สนามกีฬา", to: "หอพัก A", fare: 75, pax: 1, date: "05/01/2024", status: { type: "cancelled" } },
  { from: "คณะ IT", to: "คณะวิศวะ", fare: 55, pax: 2, date: "13/01/2024", status: { type: "completed" } },
  { from: "อาคารเรียนรวม", to: "ประตูหน้า", fare: 40, pax: 1, date: "20/02/2024", status: { type: "cancelled_with_penalty" } },
  { from: "คณะวิทย์", to: "ตึก ECC", fare: 90, pax: 4, date: "03/03/2024", status: { type: "completed" } },
  { from: "ฝั่งตรงข้ามเกกี4", to: "หน้าตึก ECC", fare: 100, pax: 3, date: "12/12/2023", status: { type: "completed" } },
  { from: "สนามกีฬา", to: "หอพัก A", fare: 75, pax: 1, date: "05/01/2024", status: { type: "cancelled_with_penalty" } },
  { from: "คณะ IT", to: "คณะวิศวะ", fare: 55, pax: 2, date: "13/01/2024", status: { type: "completed" } },
  { from: "อาคารเรียนรวม", to: "ประตูหน้า", fare: 40, pax: 1, date: "20/02/2024", status: { type: "cancelled" } },
  { from: "คณะวิทย์", to: "ตึก ECC", fare: 90, pax: 4, date: "03/03/2024", status: { type: "completed" } },
];

/* ---------------- Utils ---------------- */
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

// ปรับสัดส่วนให้เตี้ยลง
const SNAP_POINTS = [0.3, 0.55] as const; // เคยเป็น [0.33, 0.66]

/* ---------------- Page ---------------- */
function Background() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<HistoryItem | null>(null);

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

  const openPopup = (item: HistoryItem) => {
    setSelected(item);
    setOpen(true);
  };

  const closePopup = () => {
    setOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center">
      <Header_history onClose={open ? closePopup : undefined} />
      <div className="mt-5"></div>

      {/* การ์ดประวัติ (คลิกแล้วเปิด popup พร้อมส่ง item) */}
      {historyItems.map((item, idx) => (
        <Block_history key={idx} item={item} onClick={() => openPopup(item)} />
      ))}

      {/* Popup Overlay (bottom sheet snap) */}
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
function HistoryCard({
  item,
  onClick,
}: {
  item: HistoryItem;
  onClick?: () => void;
}) {
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
      <div className="h-[141px] w-[366px] bg-white rounded-[30px] shadow-md  mt-5 p-3 relative">
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
                <p className="ml-1">{item.from}</p>
              </div>
              <div className="h-[33px] w-[90px] bg-[rgba(181,91,50,0.8)] rounded-[15px] flex justify-center items-center ml-1.5">
                <img src="/coin.svg" alt="coin" className="h-5 w-5 mr-1" />
                <p className="text-[17px]">{item.fare.toFixed(2)}</p>
              </div>
            </div>

            {/* แถวล่าง: to + pax */}
            <div className="flex items-center mt-5">
              <div className="h-[33px] w-[219px] bg-[rgba(139,139,139,0.15)] rounded-2xl flex items-center px-3">
                <p className="ml-1">{item.to}</p>
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
          <p className="ml-2 text-sm text-gray-500">{item.date}</p>
        </div>

        {/* Badge/Label สถานะ มุมขวาล่าง */}
        <div className="absolute bottom-2 right-5">
          <span
            className={`text-base ${statusClass}`}
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

/** การ์ดใน list */
function Block_history({
  item,
  onClick,
}: {
  item: HistoryItem;
  onClick?: () => void;
}) {
  return <HistoryCard item={item} onClick={onClick} />;
}

/* ---------------- Bottom Sheet Overlay (ลดความสูง + behavior เดิม) ---------------- */
function PopupOverlay({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
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
    const next = clamp(startRatioRef.current + deltaRatio, 0.25, 0.9); // ยก min ขึ้นเล็กน้อยกันค้าง
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
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop (กลับไปสีอ่อนแบบเดิม) */}
      <button
        aria-label="ปิดหน้าต่าง"
        onClick={onClose}
        className="absolute inset-0  bg-[#C5DEDA]/20"
        tabIndex={-1}
      />

      {/* Bottom sheet panel */}
      <div
        className="relative z-10 w-full max-w-[390px] mx-auto rounded-t-[30px] bg-[#EFEFEF]
                   shadow-xl border-t border-[#D9D9D9]
                   transition-[height] duration-200 ease-out overflow-hidden bottom-0"
        style={{
          height: `min(calc(${heightRatio * 100}vh), 560px)`, // เคยเป็น 700px → 560px
        }}
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
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3"
          aria-label="ปิดหน้าต่าง"
          title="ปิด"
        />

        {/* เนื้อหาเลื่อนภายใน */}
        <div className="h-[calc(100%-44px)] overflow-y-auto px-3 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/** เนื้อหา popup — แบบเดิม แต่รูปรถแสดงด้านในเสมอ (ไม่ sticky) */
function Popup_detail({
  item,
  onClose,
}: {
  item: HistoryItem;
  onClose?: () => void;
}) {
  const showDetail = item.status.type === "completed"; // แสดงรายละเอียดเฉพาะงานสำเร็จ

  return (
    <div className="w-full bg-transparent flex flex-col items-center relative">
      {/* การ์ดเดียวกับที่คลิก */}
      <div className="flex justify-center">
        <HistoryCard item={item} />
      </div>

      {/* โปรไฟล์คนขับ: แสดงเสมอ */}
      <div className="flex justify-center w-full">
        <Profile_driver />
      </div>

      {/* รายละเอียด: เฉพาะ completed */}
      {showDetail && (
        <>
          {/* เส้นคั่น + หัวข้อ */}
          <div className="flex items-center mt-4 px-4 w-full max-w-[390px]">
            <div className="flex-grow border-t-2 border-[#8B8B8B]"></div>
            <p className="mx-3 text-base whitespace-nowrap">รายละเอียดการเดินทาง</p>
            <div className="flex-grow border-t-2 border-[#8B8B8B]"></div>
          </div>

          <div className="flex justify-center w-full">
            <Detail />
          </div>
        </>
      )}

      {/* รูปรถ: อยู่ล่างสุดของเนื้อหาเสมอ */}
      <div className="flex justify-center w-full">
        <img
          src="/car_popup_detail.svg"
          alt="รถ"
          className="mt-3 w-[155px]"
        />
      </div>
    </div>
  );
}

function Profile_driver() {
  return (
    <div className="h-[105px] w-[363px] bg-white rounded-[30px] shadow-md mt-4 flex items-center px-4">
      <img
        src="/user.svg"
        alt="icon"
        className="h-16 w-16 rounded-full object-cover mb-3.5"
      />

      <div className="ml-5 flex flex-col self-start mt-4">
        <p className="text-base">
          โรส แมรี่
          <img
            src="/female.svg"
            alt="icon"
            className="h-4 w-4 inline-block ml-2 mb-1"
          />
        </p>
        <p className="text-base mt-1.5">คนขับ</p>
      </div>

      <div className="ml-auto flex flex-col text-left self-start mt-4">
        <p className="text-base">Toyota Camry, ดำ</p>
        <p className="text-base mt-1.5">
          4ขอ 3500 <br />
          ประจวบคีรีขันธ์
        </p>
      </div>
    </div>
  );
}

function Detail() {
  return (
    <div className="w-[363px] h-auto bg-white rounded-[30px] shadow-md mt-4 p-6">
      <div className="space-y-4 text-sm">
        {/* เวลา และ ระยะเวลา */}
        <div className="flex">
          <div className="w-1/2 ml-3">
            <p className="text-gray-500">เวลา</p>
            <p>10:12 - 10:45</p>
          </div>
          <div className="w-1/2 pr-6">
            <p className="text-gray-500">ระยะเวลา</p>
            <p>33 นาที</p>
          </div>
        </div>

        {/* ระยะทาง และ คะแนนรีวิว */}
        <div className="flex items-center">
          <div className="w-1/2 ml-3">
            <p className="text-gray-500">ระยะทาง</p>
            <p>12 Km</p>
          </div>
          <div className="w-1/2 pr-6">
            <p className="text-gray-500">คะแนนรีวิว</p>
            <div>
              <StarRatingDisplay value={4} size={18} />
            </div>
          </div>
        </div>

        {/* รีวิว */}
        <div>
          <p className="text-gray-500 ml-3">รีวิว</p>
          <div className="mt-1 w-full bg-gray-100 rounded-lg p-2 text-gray-600">
            <p className="ml-2">
              “อ่านแล้วรู้สึกอินมากเลยครับ เห็นความตั้งใจและความพยายาม… ✨✌️”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StarRatingDisplay({
  value,
  outOf = 5,
  size = 18,
}: {
  value: number;     // จำนวนดาวที่ได้ (เช่น 4)
  outOf?: number;    // จำนวนดาวทั้งหมด (ปกติ 5)
  size?: number;     // ขนาดกว้าง/สูงของดาว (px)
}) {
  const filled = Math.max(0, Math.min(outOf, Math.floor(value)));
  const empty = outOf - filled;

  const filledArr: number[] = Array.from({ length: filled }, (_, i) => i);
  const emptyArr: number[]  = Array.from({ length: empty },  (_, i) => i);

  return (
    <div className="flex items-center">
      {filledArr.map((i: number) => (
        <img
          key={`f-${i}`}
          src="/star_filled.svg"
          alt="filled star"
          style={{ width: size, height: size }}
          className="mx-0.5"
        />
      ))}
      {emptyArr.map((i: number) => (
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
