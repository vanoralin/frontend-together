"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";

function Background() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();

  const tripId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params?.id[0]
      : search?.get("id");

  const [trip, setTrip] = useState<any>(null);

  useEffect(() => {
    if (!tripId) return;
    fetch(`/api/trips/view/${tripId}`)
      .then((res) => res.json())
      .then((data) => setTrip(data))
      .catch((err) => console.error(err));
  }, [tripId]);

  return (
    <div className="relative bg-gradient-to-b from-white to-[#C5DEDA] min-h-screen w-full pb-[120px]">
      <Header />
      {trip && (
        <>
          <InfoTrip trip={trip} />
          <InfoDriver trip={trip} />
          {/* ✅ ส่วนใหม่ */}
          <RatingStar />
          <ReviewDriver />
          <ReportTrip />
          <FinishTrip tripId={trip?.id} onDone={() => router.push("/customer/home")} />
        </>
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-row">
      <BackButton />
      <p className="text-[42px] font-bold text-shadow-lg items-center mt-20 ml-6">
        การเดินทาง<br />เสร็จสิ้น
      </p>
      <div className="flex items-center ml-auto mr-8 mt-20">
        <img
          src="/holdphone.png"
          alt="การเดินทางเสร็จสิ้น"
          className="h-[115px] w-[85px]"
        />
      </div>
    </div>
  );
}

function InfoTrip({ trip }: { trip: any }) {
  const start = trip?.path?.locations?.[0]?.name || "จุดเริ่มต้นไม่ระบุ";
  const end =
    trip?.path?.locations?.[trip?.path?.locations?.length - 1]?.name ||
    "จุดหมายไม่ระบุ";
  const price = trip?.amount ? `${trip.amount.toFixed(2)} บาท` : "-";

  return (
    <div>
      <div className="flex flex-row justify-around mt-3">
        <p className="-ml-2.5 text-xl">ข้อมูลการเดินทาง</p>
        <div className="flex flex-row items-center gap-4">
          <img src="/coin.svg" alt="coin" className="h-[30px] w-[30px]" />
          <p className="text-xl">{price}</p>
        </div>
      </div>

      <div className="flex mt-3 ml-6">
        <div className="flex flex-col items-center">
          <img
            src="/icon_pin.svg"
            alt="icon"
            className="h-[25px] w-[25px] object-cover mt-1"
          />
          <div className="h-7 border-l-2"></div>
          <img
            src="/icon_pin.svg"
            alt="icon"
            className="h-[25px] w-[25px] object-cover"
          />
        </div>

        <div className="ml-5 flex flex-col justify-between">
          <div className="flex items-center">
            <div className="h-[33px] w-[270px] bg-[#FFFFFF] rounded-2xl flex items-center px-3 shadow-md">
              <p className="ml-1 truncate">{start}</p>
            </div>
          </div>
          <div className="flex items-center mt-5">
            <div className="h-[33px] w-[270px] bg-[#FFFFFF] rounded-2xl flex items-center px-3 shadow-md">
              <p className="ml-1 truncate">{end}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoDriver({ trip }: { trip: any }) {
  const driver = trip.driver;
  const vehicle = trip.driver_vehicle;

  const translateType = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "car":
        return "รถยนต์";
      case "motorcycle":
        return "มอเตอร์ไซค์";
      case "suv":
        return "รถใหญ่";
      default:
        return "";
    }
  };

  const vehicleType = translateType(vehicle?.vehicle_type);
  const model = vehicle?.model_vehicle || "-";
  const plate = vehicle?.license_plate || "-";
  const driverName = driver?.name || "-";

  return (
<div className="mt-6">
  <div className="flex flex-row">
    <p className="text-xl ml-6.5">ข้อมูลคนขับ</p>
  </div>

  <div className="flex flex-row items-start mt-3 m-5 bg-white border-2 border-gray-400 p-2 rounded-2xl h-auto shadow-md">
    <div>
      {/* รถ + ป้ายทะเบียน */}
      <div className="flex">
        <p className="text-lg w-[110px] text-right">
          {vehicleType ? `${vehicleType} :` : "รถยนต์ :"}
        </p>
        <div>
          <p className="text-lg ml-2">{model}</p>
          <p className="text-lg ml-2">{plate}</p>
        </div>
      </div>

      {/* คนขับ */}
      <div className="flex mt-1">
        <p className="text-lg w-[110px] text-right">คนขับ :</p>
        <p className="text-lg text-orange-800 ml-2">{driverName}</p>
      </div>
    </div>
  </div>
</div>

  );
}

/* ⭐️ ให้คะแนน */
function RatingStar() {
  const [rating, setRating] = useState(0);

  const handleClick = (star: number) => {
    if (rating === star) setRating(0);
    else setRating(star);
  };

  return (
    <div>
      <p className="text-xl font-medium text-center">ให้คะแนนคนขับ</p>
      <div className="flex flex-row justify-center mt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <img
            key={star}
            src={star <= rating ? "/star_filled.svg" : "/star.svg"}
            alt="star"
            className="h-[40px] w-[40px] mx-1 cursor-pointer"
            onClick={() => handleClick(star)}
          />
        ))}
      </div>
    </div>
  );
}

/* ✍️ รีวิวคนขับ */
function ReviewDriver() {
  return (
    <div className="flex flex-col mt-6 w-full">
      <p className="text-xl mb-3 ml-6">รีวิวคนขับ</p>
      <div className="flex justify-center">
        <textarea
          id="review-textarea"
          className="w-11/12 h-24 rounded-[15px] border-2 border-gray-300 p-4 shadow-md bg-white placeholder-gray-400"
          placeholder="ข้อความรีวิวคนขับ"
        />
      </div>
    </div>
  );
}

/* 🚩 รายงานทริป */
function ReportTrip() {
  const [showInput, setShowInput] = useState(false);

  return (
    <div className="flex flex-col mt-2 w-full px-4.5">
      <label className="flex items-center cursor-pointer gap-3">
        <input
          type="checkbox"
          checked={showInput}
          onChange={() => setShowInput(!showInput)}
          className="w-4 h-4 border-2 border-gray-400 rounded-[10px] accent-[#B57452]"
        />
        <span className="text-lg mb-1">ต้องการรายงานทริปหรือไม่</span>
      </label>

      {showInput && (
        <textarea
          id="report-textarea"
          className="w-full h-24 rounded-[15px] border-2 border-gray-300 p-4 shadow-md bg-white placeholder-gray-400 mt-2"
          placeholder="กรอกรายละเอียดการรายงาน"
        />
      )}
    </div>
  );
}

/* 🎉 Success Popup (ไม่ใช่ alert) */
function SuccessPopup({
  open,
  title = "บันทึกเสร็จแล้ว",
  onClose,
}: {
  open: boolean;
  title?: string;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-xl p-6 w-[300px] text-center">
        <p className="text-xl font-semibold">{title}</p>
        <button
          onClick={onClose}
          className="mt-4 bg-[#E6A88A] px-6 py-2 rounded-full border border-[#B55C32] hover:opacity-95 active:scale-[0.98]"
        >
          ตกลง
        </button>
      </div>
    </div>
  );
}

/* 🔐 Helper: เอา AuthToken จาก localStorage/cookie */
function getAuthToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const ls =
    localStorage.getItem("AuthToken") || localStorage.getItem("authToken");
  if (ls) return ls;
  const cookie = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("AuthToken=") || c.startsWith("authToken="));
  if (cookie) return cookie.split("=")[1];
  return undefined;
}

/* 💾 ปุ่มบันทึก: POST ทั้ง 2 API + แสดง popup แล้วพาไป /customer/home */
function FinishTrip({
  tripId,
  onDone,
}: {
  tripId?: number | string;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorPopup, setErrorPopup] = useState<string | null>(null);

  const handleSubmit = async () => {
    // นับรูปดาวที่ถูกเลือก (filled)
    const stars = Array.from(
      document.querySelectorAll<HTMLImageElement>('img[alt="star"]')
    );
    const rating = stars.filter((s) => s.src.includes("star_filled.svg")).length;

    const review =
      (document.getElementById("review-textarea") as HTMLTextAreaElement | null)
        ?.value || "";
    const report =
      (document.getElementById("report-textarea") as HTMLTextAreaElement | null)
        ?.value || "";

    if (!tripId) {
      setErrorPopup("ไม่พบรหัสทริป");
      return;
    }

    setBusy(true);
    try {
      // 1) ส่งเรตติ้ง/รีวิว
      const ratingRes = await fetch(`/api/trips/${tripId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: review,
          score: rating, // แปลงดาวเป็นตัวเลข
        }),
      });
      if (!ratingRes.ok) throw new Error(`Rating HTTP ${ratingRes.status}`);

      // 2) ถ้ามีรายงาน → ส่ง /api/report พร้อม AuthToken
      if (report.trim().length > 0) {
        const token = getAuthToken();
        if (!token) {
          throw new Error("ต้องมี AuthToken เพื่อส่งรายงาน");
        }
        const reportRes = await fetch(`/api/report`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            detail: report,
            trip_id: Number(tripId),
          }),
        });
        if (!reportRes.ok) throw new Error(`Report HTTP ${reportRes.status}`);
      }

      // สำเร็จ → แสดง popup แล้วกลับหน้า /customer/home
      setOpen(true);
      setTimeout(() => {
        setOpen(false);
        onDone();
      }, 1200);
    } catch (e: any) {
      console.error(e);
      setErrorPopup(e?.message || "บันทึกล้มเหลว");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="absolute w-full bottom-0">
        <div className="h-[120px] w-full shadow-md flex flex-col items-center justify-center">
          <button
            onClick={handleSubmit}
            disabled={busy}
            className="bg-[#E6A88A] h-[60px] w-80 text-black px-10 py-3 rounded-full hover:opacity-95 active:scale-[0.98] focus:outline-none focus:ring-0 cursor-pointer shadow-md text-center text-2xl font-medium border border-[#B55C32] disabled:opacity-60"
          >
            {busy ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>

      {/* success popup */}
      <SuccessPopup open={open} onClose={() => { setOpen(false); onDone(); }} />

      {/* error popup */}
      <SuccessPopup
        open={!!errorPopup}
        title={errorPopup || ""}
        onClose={() => setErrorPopup(null)}
      />
    </>
  );
}

export default Background;
