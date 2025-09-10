"use client";

import { useEffect, useState } from "react";

/** -------- Types & Demo Data -------- */
interface HistoryItem {
  from: string;
  to: string;
  fare: number;
  pax: number;
  date: string; // e.g., "12/12/2023"
}

const historyItems: HistoryItem[] = [
  { from: "ฝั่งตรงข้ามเกกี4", to: "หน้าตึก ECC", fare: 100, pax: 3, date: "12/12/2023" },
  { from: "สนามกีฬา", to: "หอพัก A", fare: 75, pax: 1, date: "05/01/2024" },
  { from: "คณะ IT", to: "คณะวิศวะ", fare: 55, pax: 2, date: "13/01/2024" },
  { from: "อาคารเรียนรวม", to: "ประตูหน้า", fare: 40, pax: 1, date: "20/02/2024" },
  { from: "คณะวิทย์", to: "ตึก ECC", fare: 90, pax: 4, date: "03/03/2024" },
  { from: "ฝั่งตรงข้ามเกกี4", to: "หน้าตึก ECC", fare: 100, pax: 3, date: "12/12/2023" },
  { from: "สนามกีฬา", to: "หอพัก A", fare: 75, pax: 1, date: "05/01/2024" },
  { from: "คณะ IT", to: "คณะวิศวะ", fare: 55, pax: 2, date: "13/01/2024" },
  { from: "อาคารเรียนรวม", to: "ประตูหน้า", fare: 40, pax: 1, date: "20/02/2024" },
  { from: "คณะวิทย์", to: "ตึก ECC", fare: 90, pax: 4, date: "03/03/2024" },
  
];

function Background() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  // ปิดด้วยปุ่ม ESC + ล็อก scroll ตอนเปิด popup
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

      {/* การ์ดประวัติ (คลิกแล้วเปิด popup พร้อมส่ง item) */}
      {historyItems.map((item, idx) => (
        <Block_history key={idx} item={item} onClick={() => openPopup(item)} />
      ))}

      {/* Popup Overlay */}
      {open && selected && (
        <PopupOverlay onClose={closePopup}>
          <Popup_detail item={selected} onClose={closePopup} />
        </PopupOverlay>
      )}
    </div>
  );
}

/** Header สูงคงที่ 64px (h-16) และอยู่เหนือ overlay
 *  ถ้ามี onClose → คลิกหัวข้อเพื่อปิด popup ได้
 */
function Header_history({ onClose }: { onClose?: () => void }) {
  const clickable = Boolean(onClose);
  return (
    <div
      className={`flex flex-col items-center mt-8 h-16 justify-center w-full relative z-[10000] ${
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
      <h1 className="text-[32px] font-bold text-shadow-md">ประวัติการเดินทาง</h1>
    </div>
  );
}

/** การ์ดพื้นฐาน: ใช้ได้ทั้งใน list และใน popup (ถ้า onClick มี → ทำเป็นปุ่ม) */
function HistoryCard({
  item,
  onClick,
}: {
  item: HistoryItem;
  onClick?: () => void;
}) {
  const Wrapper: any = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`${
        onClick ? "block text-left focus:outline-none cursor-pointer" : ""
      }`}
      aria-label={onClick ? "ดูรายละเอียดการเดินทาง" : undefined}
    >
      <div className="h-[139px] w-[366px] bg-white rounded-[30px] shadow-md mt-5 p-3">
        <div className="flex mt-1 mb-1">
          <div className="flex flex-col items-center">
            <img
              src="/icon_pin.svg"
              alt="icon"
              className="h-[25px] w-[25px] object-cover mt-1"
            />
            <div className="h-7 border-l-2 border-dashed border-gray-400"></div>
            <img src="/icon_pin.svg" alt="icon" className="h-[25px] w-[25px] object-cover" />
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

/** Overlay + Backdrop (กดพื้นหลังแล้วปิด popup ได้), พื้นหลัง #8A9694 เต็มจอ */
function PopupOverlay({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop ครอบทั้งจอเป็นสี #8A9694 */}
      <div
        className="absolute inset-0 bg-[#8A9694]/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel: เริ่มใต้หัวข้อ (เว้น h-16 ~ 64px) */}
      <div className="relative z-10 w-[390px] h-[702px] mt-20">
        {children}
      </div>
    </div>
  );
}

/** เนื้อหา popup + ปุ่มปิดภายใน (โชว์การ์ดเดียวกับที่คลิก) */
function Popup_detail({
  item,
  onClose,
}: {
  item: HistoryItem;
  onClose?: () => void;
}) {
  return (
    <div className="w-[390px] h-[702px] bg-[#EFEFEF] rounded-t-[50px] border-b-[5px] border-[#D9D9D9] flex flex-col items-center overflow-y-auto relative">
      {/* ปุ่ม Close อยู่ใน popup เอง */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4"
        aria-label="ปิดหน้าต่าง"
        title="ปิด"
      >
        <img src="/x.svg" alt="Close" className="h-[35px] w-[35px]" />
      </button>

      {/* โชว์การ์ดเดียวกับที่คลิกจากหน้าหลัก */}
      <div className="mt-12">
        <HistoryCard item={item} />
      </div>

      {/* เส้นคั่น + หัวข้อ */}
      <div className="flex items-center mt-6">
        <div className="flex-grow border-t-2 border-[#8B8B8B] w-[90px]"></div>
        <p className="mx-3 text-base whitespace-nowrap">รายละเอียดการเดินทาง</p>
        <div className="flex-grow border-t-2 border-[#8B8B8B] w-[90px]"></div>
      </div>

      <div>
        <Profile_driver />
      </div>
      <div>
        <Detail />
      </div>
      <img src="/car_popup_detail.svg" alt="Map" className="mt-3 mb-3" />
    </div>
  );
}

function Profile_driver() {
  return (
    <div className="h-[105px] w-[363px] bg-white rounded-[30px] shadow-md mt-6 flex items-center px-4">
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
    <div className="w-[363px] h-[400px] bg-white rounded-[30px] shadow-md mt-6 p-6">
      <h2 className="text-lg font-semibold">รายละเอียดการเดินทาง</h2>
      <p className="mt-2">ข้อมูลเพิ่มเติมเกี่ยวกับการเดินทาง</p>
    </div>
  );
}

export default Background;
export { Popup_detail, Block_history, Header_history };
