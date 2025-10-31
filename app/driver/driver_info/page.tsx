"use client";
import React from "react";
import axios from "axios";
import { BackButton } from "@/app/components/share_component";

type Vehicle = {
  vehicleType: string;
  model: string;
  exterior: string;
  passengers: string;
  previewUrl: string | null;
};

const EMPTY_VEHICLE: Vehicle = {
  vehicleType: "",
  model: "",
  exterior: "",
  passengers: "",
  previewUrl: null,
};

/* ===================== Types ===================== */
type VehicleType = "car" | "suv" | "motorcycle";
type VehicleTypeWithEmpty = "" | VehicleType;

const VEHICLE_TYPES: VehicleType[] = ["car", "suv", "motorcycle"];
const MAX = 3; 

export type Vehicle = {
  id?: number | string;
  vehicleType: VehicleTypeWithEmpty;
  model: string;            // model_vehicle
  exterior: string;         // description
  licensePlate: string;     // license_plate
  seats: string;            // แสดงใน input
  previewUrl: string | null;// พาธรูปจาก server (relative) หรือ blob URL
  file?: File | null;       // ไฟล์จริงที่ผู้ใช้อัปโหลด (ส่งขึ้นเซิร์ฟเวอร์)
  readonlyFromApi: boolean; // true ถ้ามาจาก API → ล็อก select + รูปดูอย่างเดียว
};

const EMPTY_VEHICLE = (): Vehicle => ({
  id: undefined,
  vehicleType: "",
  model: "",
  exterior: "",
  licensePlate: "",
  seats: "",
  previewUrl: null,
  file: null,
  readonlyFromApi: false,
});

/* Optional: profile (for header name/email) */
interface ProfileData {
  name?: string;
  email?: string;
}

/* API response shape for vehicle */
interface ApiVehicle {
  id?: number | string;
  driver_id?: number;
  vehicle_type?: string;
  model_vehicle?: string;
  model?: string;
  license_plate?: string;
  seats?: number;
  description?: string;
  exterior?: string;
  is_active?: boolean;
  driving_license_url?: string; // ex: "uploads/licenses/xxx.png"
  image_url?: string;
}

/* ===== helpers: sort by numeric id ===== */
function idNum(v: { id?: number | string }) {
  return v?.id != null && !Number.isNaN(Number(v.id))
    ? Number(v.id)
    : Number.POSITIVE_INFINITY;
}
function sortById<T extends { id?: number | string }>(arr: T[]) {
  return [...arr].sort((a, b) => idNum(a) - idNum(b));
}
const labelByType: Record<VehicleType, string> = {
  car: "รถยนต์",
  suv: "รถยนต์ขนาดใหญ่",
  motorcycle: "รถจักรยานยนต์",
};

/* ===================== Toast (success/error/info) ===================== */
type ToastType = "success" | "error" | "info";
function Toast({
  open,
  type = "success",
  title,
  message,
  onClose,
  autoHideMs = 1600,
}: {
  open: boolean;
  type?: ToastType;
  title: string;
  message?: string;
  onClose?: () => void;
  autoHideMs?: number;
}) {
  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), autoHideMs);
    return () => clearTimeout(t);
  }, [open, autoHideMs, onClose]);

  if (!open) return null;

  const circleClass =
    type === "success"
      ? "bg-green-100 border-green-200"
      : type === "error"
      ? "bg-red-100 border-red-200"
      : "bg-blue-100 border-blue-200";

  const icon =
    type === "success" ? (
      <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ) : type === "error" ? (
      <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 8h.01M11 12h1v4h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );

  return (
    <div className="bg-[#C5D4E8] min-h-screen w-full flex flex-col items-center pb-[140px]">
      <Header />
      <DriverInfo />
      <ButtonSave />
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-col items-center">
      <BackButton />
      <p className="text-[32px] font-semibold text-center text-shadow-lg mt-10.5">
        ข้อมูลคนขับ <br /> และยานพาหนะ
      </p>
    </div>
  );
}

function DriverInfo() {
  return (
    <div className="flex flex-col justify-center items-center">
      <p>เตา อั่งโล่</p>
      <p>6XXXXXXX@kmitl.ac.th</p>

      {/* Vehicles Carousel */}
      <div className="mt-6">
        <VehiclesCarousel />
      </div>
    </div>
  );
}

function VehiclesCarousel() {
  const CARD_W = 313;
  const MAX = 3;

  const [vehicles, setVehicles] = React.useState<Vehicle[]>([{ ...EMPTY_VEHICLE }]);
  const [index, setIndex] = React.useState(0);

  // touch handling
  const startXRef = React.useRef<number | null>(null);
  const deltaXRef = React.useRef<number>(0);

  const onTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    deltaXRef.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current == null) return;
    deltaXRef.current = e.touches[0].clientX - startXRef.current;
  };
  const onTouchEnd = () => {
    const threshold = 50;
    const dx = deltaXRef.current;

    if (dx > threshold) {
      // swipe right
      if (index === vehicles.length - 1 && vehicles.length < MAX) {
        setVehicles((v) => [...v, { ...EMPTY_VEHICLE }]);
        setIndex((i) => i + 1);
      } else {
        setIndex((i) => Math.max(0, i - 1));
      }
    }
    if (dx < -threshold) {
      // swipe left
      setIndex((i) => Math.min(vehicles.length - 1, i + 1));
    }

    startXRef.current = null;
    deltaXRef.current = 0;
  };

  const updateVehicle = <K extends keyof Vehicle>(idx: number, key: K, value: Vehicle[K]) => {
    setVehicles((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const setPreviewFor = (idx: number, url: string | null) => updateVehicle(idx, "previewUrl", url);

  const addVehicle = () => {
    if (vehicles.length >= MAX) return;
    setVehicles((v) => [...v, { ...EMPTY_VEHICLE }]);
    setIndex(vehicles.length);
  };

  const deleteVehicle = (idx: number) => {
    if (vehicles.length === 1) return; // never delete last one

    // cleanup preview URL
    const url = vehicles[idx]?.previewUrl;
    if (url) URL.revokeObjectURL(url);

    setVehicles((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      // adjust index after removing: if we removed an earlier card, shift left
      setIndex((cur) => {
        const shifted = cur > idx ? cur - 1 : cur;
        return Math.min(shifted, next.length - 1);
      });
      return next;
    });
  };

  const canAdd = vehicles.length < MAX;

  return (
    <div className="w-[313px] select-none">
      {/* Header row: position + add button */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-700">
          ยานพาหนะ {index + 1} / {MAX}
        </span>
        {canAdd && (
          <button
            type="button"
            onClick={addVehicle}
            className="text-sm px-3 py-1 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
          >
            + เพิ่ม
          </button>
        )}
      </div>

      {/* Swipe area */}
      <div
        className="overflow-hidden rounded-2xl"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-300"
          style={{
            transform: `translateX(-${index * CARD_W}px)`,
            width: `${vehicles.length * CARD_W}px`,
          }}
        >
          {vehicles.map((v, i) => (
            <div key={i} className="shrink-0 w-[313px] px-0">
              <VehicleCard
                index={i}
                total={vehicles.length}
                vehicle={v}
                onChange={(key, value) => updateVehicle(i, key, value as any)}
                onPreviewChange={(url) => setPreviewFor(i, url)}
                onDelete={() => deleteVehicle(i)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {Array.from({ length: vehicles.length }).map((_, i) => (
          <button
            key={i}
            aria-label={`ไปยังยานพาหนะ ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === index ? "w-5 bg-gray-700" : "w-2.5 bg-gray-400/60"
            }`}
          />
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-2 text-center">
        ปัดขวาเพื่อเพิ่มยานพาหนะ (สูงสุด 3 คัน)
      </p>
    </div>
  );
}

function VehicleCard({
  index,
  total,
  vehicle,
  onChange,
  onPreviewChange,
  onDelete,
}: {
  index: number;
  total: number;
  vehicle: Vehicle;
  onChange: <K extends keyof Vehicle>(key: K, value: Vehicle[K]) => void;
  onPreviewChange: (url: string | null) => void;
  onDelete: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const openPicker = () => inputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      e.target.value = "";
      return;
    }
    if (vehicle.previewUrl) URL.revokeObjectURL(vehicle.previewUrl);
    onPreviewChange(URL.createObjectURL(file));
  };

  React.useEffect(() => {
    return () => {
      if (vehicle.previewUrl) URL.revokeObjectURL(vehicle.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canDelete = total > 1;

  return (
    <div className="flex flex-col items-center">
      {/* top bar: index + delete */}
      <div className="w-[313px] flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">คันที่ {index + 1}</span>
        <button
          type="button"
          onClick={onDelete}
          disabled={!canDelete}
          className={`text-sm px-3 py-1 rounded-lg border shadow-sm transition ${
            canDelete
              ? "bg-white border-gray-200 hover:bg-red-50 hover:border-red-300 text-red-600"
              : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          ลบคันนี้
        </button>
      </div>

      {/* Vehicle type */}
      <div className="w-77">
        <label className="mb-1 block text-sm text-gray-700">ประเภทยานพาหนะ</label>
        <div className="relative">
          <select
            value={vehicle.vehicleType}
            onChange={(e) => onChange("vehicleType", e.target.value)}
            className="w-full h-11 rounded-xl bg-white border border-gray-200 shadow-sm pl-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="" disabled>
              เลือกประเภทยานพาหนะ
            </option>
            <option value="car">รถยนต์</option>
            <option value="motorcycle">รถจักรยานยนต์</option>
            {/* <option value="truck">รถบรรทุก</option>
            <option value="other">อื่นๆ</option> */}
          </select>
        </div>
      </div>

      {/* Image uploader */}
      <div className="mt-4">
        <button
          type="button"
          onClick={openPicker}
          className="group relative w-[313px] h-[180px] rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden outline-none ring-0 focus:ring-2 focus:ring-blue-400 transition"
          aria-label="อัปโหลดรูปใบขับขี่"
        >
          {vehicle.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vehicle.previewUrl}
              alt="รูปใบขับขี่"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-gray-500">
              รูปใบขับขี่
            </span>
          )}
          <span className="absolute bottom-2 right-2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white group-active:scale-95 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="opacity-80">
              <path
                d="M9 4h6l1.2 2H20a 2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.8L9 4Zm3 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                fill="currentColor"
              />
            </svg>
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileChange}
          className="hidden"
        />
      </div>

      {/* Inputs */}
      <div className="mt-4 space-y-3 w-[313px]">
        <Field
          label="รุ่น"
          placeholder="เช่น Civic, Camry"
          value={vehicle.model}
          onChange={(v) => onChange("model", v)}
        />
        <Field
          label="ลักษณะภายนอก"
          placeholder="สี, สติกเกอร์, ฯลฯ"
          value={vehicle.exterior}
          onChange={(v) => onChange("exterior", v)}
        />
        <Field
          label="จำนวนผู้โดยสาร"
          type="number"
          placeholder="เช่น 4"
          value={vehicle.passengers}
          onChange={(v) => onChange("passengers", v)}
          min={0}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  min?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        className="w-full h-11 rounded-xl bg-white border border-gray-200 shadow-sm px-4 text-sm outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}

function ButtonSave(){
  return (
        <div className="w-full bottom-0">
            <div className="h-[120px] w-full flex flex-col items-center justify-center">
                <button className="bg-[#E6A88A] h-[60px] w-80 text-black px-10 py-3 rounded-full hover:opacity-95 active:scale-[0.98] focus:outline-none focus:ring-0 cursor-pointer shadow-md text-center text-2xl font-medium border border-[#B55C32]">
                    บันทึก
                </button>
            </div>
        </div>
    );
}
export default Background;
export { Header };
