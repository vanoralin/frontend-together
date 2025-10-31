"use client";
import React from "react";
import axios from "axios";
import { BackButton } from "@/app/components/share_component";

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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative z-[1001] w-[320px] rounded-2xl bg-white shadow-xl border border-gray-200 p-6 text-center">
        {type === "success" && (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <span className="absolute top-2 left-6 w-2 h-6 rounded-full bg-indigo-400 rotate-12 opacity-70" />
            <span className="absolute top-4 right-10 w-2 h-5 rounded-full bg-fuchsia-400 -rotate-12 opacity-70" />
            <span className="absolute top-12 left-10 w-1.5 h-4 rounded-full bg-amber-400 rotate-45 opacity-70" />
            <span className="absolute top-10 right-6 w-1.5 h-6 rounded-full bg-teal-400 -rotate-45 opacity-70" />
          </div>
        )}
        <div className={`mx-auto mb-4 w-20 h-20 rounded-full border ${circleClass} flex items-center justify-center text-green-600`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {message ? (
          <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{message}</p>
        ) : null}
        <button
          onClick={onClose}
          className="mt-5 inline-flex items-center justify-center px-4 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium shadow-sm active:scale-[0.98]"
        >
          ปิด
        </button>
      </div>
    </div>
  );
}

/* ===================== Confirm Dialog ===================== */
function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative z-[1001] w-[340px] rounded-2xl bg-white shadow-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        {message ? <p className="mt-2 text-sm text-gray-600">{message}</p> : null}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== Page ===================== */
function Background() {
  return (
    <div className="relative bg-[#C5D4E8] min-h-screen w-full flex flex-col items-center">
      <Header />
      <DriverInfo />
      {/* ปุ่มบันทึกย้ายไปแสดงแบบมีเงื่อนไขใน Carousel */}
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
  const [profile, setProfile] = React.useState<ProfileData | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get<ProfileData>("/api/User/profile", {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
        if (!mounted) return;
        // บางโปรเจ็กต์ Axios อาจให้ res.data เป็น unknown → cast ป้องกัน TS2345
        setProfile((res.data as ProfileData) ?? null);
      } catch {
        if (!mounted) setProfile(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center">
      <p>{profile?.name ?? "-"}</p>
      <p>{profile?.email ?? "-"}</p>

      <div className="mt-6">
        <VehiclesCarousel />
      </div>
    </div>
  );
}

/* ===================== Vehicles ===================== */
function VehiclesCarousel() {
  const CARD_W = 313;

  const [vehicles, setVehicles] = React.useState<Vehicle[]>([EMPTY_VEHICLE()]);
  const [index, setIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deletingIndex, setDeletingIndex] = React.useState<number | null>(null);
  const [saving, setSaving] = React.useState(false);

  // toast
  const [toast, setToast] = React.useState<{
    type: ToastType;
    title: string;
    message?: string;
    open: boolean;
  }>({ type: "success", title: "", message: "", open: false });
  const showToast = (t: ToastType, title: string, message?: string) =>
    setToast({ type: t, title, message, open: true });

  // confirm delete
  const [confirm, setConfirm] = React.useState<{ open: boolean; idx: number | null }>({
    open: false,
    idx: null,
  });

  // โหลดข้อมูลทุกประเภท
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const perType = await Promise.all(
          (["car", "suv", "motorcycle"] as VehicleType[]).map(async (t) => {
            try {
              const res = await axios.get<ApiVehicle>(`/api/driver/vehicles`, {
                params: { vehicle_type: t },
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
              });
              const raw = res.data;
              const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
              return arr.map(apiVehicleToUi).filter(Boolean) as Vehicle[];
            } catch (err: any) {
              if (err?.response?.status === 404) return [] as Vehicle[];
              return [] as Vehicle[];
            }
          })
        );

        if (!mounted) return;

        const fetched = perType.flat();
        if (fetched.length > 0) {
          const sorted = sortById(fetched).slice(0, MAX);
          setVehicles(sorted);
          setIndex(0);
        } else {
          setVehicles([EMPTY_VEHICLE()]);
          setIndex(0);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "เกิดข้อผิดพลาดในการดึงข้อมูลยานพาหนะ");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /* ---------- ตรวจครบถ้วนทุกช่องในครั้งเดียว ---------- */
  function validateVehicle(v: Vehicle) {
    const msgs: string[] = [];

    if (!v.vehicleType) msgs.push("โปรดเลือกประเภทยานพาหนะ");
    if (!v.model || !v.model.trim()) msgs.push("โปรดกรอกรุ่นยานพาหนะ");
    if (!v.licensePlate || !v.licensePlate.trim()) msgs.push("โปรดกรอกป้ายทะเบียนรถ");

    const seatsNum = Number(v.seats);
    if (!v.seats || Number.isNaN(seatsNum)) {
      msgs.push("โปรดใส่จำนวนผู้โดยสารเป็นตัวเลข");
    } else if (!Number.isInteger(seatsNum) || seatsNum < 0) {
      msgs.push("จำนวนผู้โดยสารต้องเป็นจำนวนเต็มที่ไม่ติดลบ");
    }

    if (!v.readonlyFromApi && !v.file) {
      msgs.push("โปรดอัปโหลดรูปใบขับขี่/ยานพาหนะ");
    }

    return { ok: msgs.length === 0, messages: msgs };
  }

  // บันทึก “การ์ดที่กำลังแสดงอยู่”
  React.useEffect(() => {
    const handler = async () => {
      const v = vehicles[index];
      if (!v) return;

      if (v.readonlyFromApi) {
        showToast("info", "ข้อมูลคันนี้บันทึกไว้แล้ว");
        return;
      }

      // ✅ ใช้ตัวตรวจใหม่: รวมทุกข้อผิดพลาดในครั้งเดียว
      const { ok, messages } = validateVehicle(v);
      if (!ok) {
        const body = messages.join("\n");
        showToast("error", "กรอกข้อมูลไม่ครบ", body);
        return;
      }

      setSaving(true);
      try {
        const fd = new FormData();
        fd.append("vehicle_type", v.vehicleType);
        fd.append("model_vehicle", v.model);
        fd.append("license_plate", v.licensePlate);
        fd.append("seats", String(parseInt(v.seats, 10)));
        if (v.exterior) fd.append("description", v.exterior);
        fd.append("driving_license", v.file!);

        const res = await axios.post<ApiVehicle>("/api/driver/addVehicle", fd, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });

        const saved = apiVehicleToUi(res.data);

        setVehicles((prev) => {
          const next = [...prev];
          const old = next[index];
          if (old?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(old.previewUrl);
          next[index] = { ...saved, readonlyFromApi: true, file: null };
          const sorted = sortById(next).slice(0, MAX);
          const newPos = sorted.findIndex((x) => x.id === saved.id);
          setIndex(newPos >= 0 ? newPos : 0);
          return sorted;
        });

        showToast("success", "บันทึกเรียบร้อย", "เพิ่มยานพาหนะสำเร็จ");
      } catch (err: any) {
        console.error("[save-vehicle] error:", err);
        showToast("error", "บันทึกไม่สำเร็จ", err?.response?.data?.message ?? "ลองใหม่อีกครั้ง");
      } finally {
        setSaving(false);
      }
    };

    window.addEventListener("save-vehicle", handler as EventListener);
    return () => window.removeEventListener("save-vehicle", handler as EventListener);
  }, [vehicles, index]);

  // gestures
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
    if (dx > threshold) setIndex((i) => Math.max(0, i - 1));
    if (dx < -threshold) setIndex((i) => Math.min(vehicles.length - 1, i + 1));
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
    setVehicles((prev) => {
      if (prev.length >= MAX) return prev;
      const next = [...prev, EMPTY_VEHICLE()];
      setIndex(next.length - 1);
      return next;
    });
  };

  // กดปุ่ม "ลบคันนี้" → เปิดยืนยัน
  const requestDelete = (idx: number) => {
    setConfirm({ open: true, idx });
  };

  // ยืนยันลบ
  const performDelete = async (idx: number) => {
    const v = vehicles[idx];
    try {
      setDeletingIndex(idx);

      if (v.readonlyFromApi && v.id != null) {
        await axios.delete(`/api/driver/vehicles/${v.id}`, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (v.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(v.previewUrl);

      setVehicles((prev) => {
        const next = prev.filter((_, i) => i !== idx);
        const sorted = sortById(next);
        setIndex((cur) => Math.min(cur > idx ? cur - 1 : cur, sorted.length - 1));
        return sorted.length > 0 ? sorted : [EMPTY_VEHICLE()];
      });

      showToast("success", "ลบเรียบร้อย");
    } catch (err: any) {
      console.error("[deleteVehicle] error:", err);
      showToast("error", "ลบไม่สำเร็จ", err?.response?.data?.message ?? "ลองใหม่อีกครั้ง");
    } finally {
      setDeletingIndex(null);
      setConfirm({ open: false, idx: null });
    }
  };

  const canAdd = vehicles.length < MAX;

  // การ์ดปัจจุบัน + เงื่อนไขโชว์ปุ่มบันทึก (ต้องไม่ใช่ของ API)
  const current = vehicles[index];
  const showSave = !!current && !current.readonlyFromApi;

  return (
    <div className="w-[313px] select-none relative">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-700">
          ยานพาหนะ {index + 1} / {vehicles.length} (รวมสูงสุด {MAX})
        </span>
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="text-xs text-gray-500">กำลังโหลด...</span>
          ) : error ? (
            <span className="text-xs text-red-600">{error}</span>
          ) : null}
          {canAdd && !loading && (
            <button
              type="button"
              onClick={addVehicle}
              className="text-sm px-3 py-1 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
            >
              + เพิ่ม
            </button>
          )}
        </div>
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
          style={{ transform: `translateX(-${index * CARD_W}px)`, width: `${vehicles.length * CARD_W}px` }}
        >
          {vehicles.map((v, i) => (
            <div key={`card-${v.id ?? i}`} className="shrink-0 w-[313px] px-0">
              <VehicleCard
                index={i}
                total={vehicles.length}
                vehicle={v}
                onChange={(key, value) => updateVehicle(i, key, value as any)}
                onPreviewChange={(url) => setPreviewFor(i, url)}
                onDelete={() => requestDelete(i)}
                canDelete={vehicles.length > 1}
                deleting={deletingIndex === i}
              />
            </div>
          ))}
        </div>
      </div>

      {/* dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {vehicles.map((_, i) => (
          <button
            key={i}
            aria-label={`ไปยังยานพาหนะ ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2.5 rounded-full transition-all ${i === index ? "w-5 bg-gray-700" : "w-2.5 bg-gray-400/60"}`}
          />
        ))}
      </div>

      {saving && <p className="text-xs text-gray-600 mt-2 text-center">กำลังบันทึกคันที่ {index + 1} ...</p>}

      <p className="text-xs text-gray-500 mt-2 text-center">
        ปัดซ้าย/ขวาเพื่อสลับการ์ด • แตะ “+ เพิ่ม” เพื่อเพิ่ม (รวมสูงสุด {MAX} คัน)
      </p>

      {/* ✅ ปุ่มบันทึกจะแสดงเฉพาะตอนเพิ่มคันใหม่ (ไม่ readonlyFromApi) */}
      {showSave && <ButtonSave />}

      {/* Toast */}
      <Toast
        open={toast.open}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirm.open}
        title="ต้องการลบยานพาหนะนี้ใช่หรือไม่?"
        message="การลบจะไม่สามารถย้อนกลับได้"
        confirmText="ลบ"
        cancelText="ยกเลิก"
        onCancel={() => setConfirm({ open: false, idx: null })}
        onConfirm={() => (confirm.idx != null ? performDelete(confirm.idx) : null)}
      />
    </div>
  );
}

/* ===================== Vehicle Card ===================== */
function VehicleCard({
  index,
  total,
  vehicle,
  onChange,
  onPreviewChange,
  onDelete,
  canDelete,
  deleting,
}: {
  index: number;
  total: number;
  vehicle: Vehicle;
  onChange: <K extends keyof Vehicle>(key: K, value: Vehicle[K]) => void;
  onPreviewChange: (url: string | null) => void;
  onDelete: () => void;
  canDelete: boolean;
  deleting: boolean;
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
    if (vehicle.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(vehicle.previewUrl);
    const blobUrl = URL.createObjectURL(file);
    onPreviewChange(blobUrl);
    onChange("file", file);
  };

  React.useEffect(() => {
    return () => {
      if (vehicle.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(vehicle.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canEditType = !vehicle.readonlyFromApi; // คันจาก API จะล็อก dropdown

  // รูปจาก API → ใช้พาธผ่าน proxy, รูปอัปโหลดใหม่ → blob:
  const serverImgSrc =
    vehicle.readonlyFromApi && vehicle.previewUrl
      ? `/${vehicle.previewUrl.replace(/^\/+/, "")}`
      : null;

  return (
    <div className="flex flex-col items-center">
      {/* top bar */}
      <div className="w-[313px] flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">
          คันที่ {index + 1} / {total}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDelete}
            disabled={!canDelete || deleting}
            className={`text-xs px-3 py-1 rounded-lg border shadow-sm transition
              ${(!canDelete || deleting)
                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white border-gray-200 hover:bg-red-50 hover:border-red-300 text-red-600"}`}
          >
            {deleting ? "กำลังลบ..." : "ลบคันนี้"}
          </button>
        </div>
      </div>

      {/* Vehicle type (dropdown แบบเดิม) */}
      <div className="w-77">
        <label className="mb-1 block text-sm text-gray-700">ประเภทยานพาหนะ</label>
        <select
          value={vehicle.vehicleType}
          disabled={!canEditType}
          onChange={(e) => onChange("vehicleType", e.target.value as VehicleTypeWithEmpty)}
          className={`w-full h-11 rounded-xl border shadow-sm pl-4 pr-10 text-sm
                      ${canEditType ? "bg-white border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none"
                                     : "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"}`}
        >
          <option value="">เลือกประเภทยานพาหนะ</option>
          {VEHICLE_TYPES.map((t) => (
            <option key={t} value={t}>{labelByType[t]}</option>
          ))}
        </select>
      </div>

      {/* Image */}
      <div className="mt-4">
        {vehicle.readonlyFromApi ? (
          <div
            className="relative w-[313px] h-[180px] rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden"
            aria-label="รูปยานพาหนะ"
          >
            {serverImgSrc ? (
              <img
                src={serverImgSrc}
                alt="รูปยานพาหนะ"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                }}
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-gray-500">
                ไม่มีรูป
              </span>
            )}
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={openPicker}
              className="group relative w-[313px] h-[180px] rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden outline-none ring-0 focus:ring-2 focus:ring-blue-400 transition"
              aria-label="อัปโหลดรูปยานพาหนะ"
            >
              {vehicle.previewUrl ? (
                <img
                  src={vehicle.previewUrl}
                  alt="รูปยานพาหนะ"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-gray-500">
                  อัปโหลดรูปยานพาหนะ
                </span>
              )}
              <span className="absolute bottom-2 right-2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white group-active:scale-95 transition">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="opacity-80">
                  <path d="M9 4h6l1.2 2H20a 2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.8L9 4Zm3 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="currentColor" />
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
          </>
        )}
      </div>

      {/* Inputs */}
      <div className="mt-4 space-y-3 w-[313px]">
        <Field
          label="รุ่น"
          placeholder="เช่น Honda PCX 160"
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
          label="ป้ายทะเบียนรถ"
          placeholder="เช่น XY-9876"
          value={vehicle.licensePlate}
          onChange={(v) => onChange("licensePlate", v)}
        />
        <Field
          label="จำนวนผู้โดยสาร"
          type="number"
          placeholder="เช่น 2"
          value={vehicle.seats}
          onChange={(v) => onChange("seats", v)}
          min={0}
        />
      </div>
    </div>
  );
}

/* ===================== Shared UI ===================== */
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
}: {
  label: string;
  value: string | number;
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

/* ===================== Save Button (only button) ===================== */
function ButtonSave() {
  const [saving, setSaving] = React.useState(false);

  return (
    <div className="w-full bottom-0">
      <div className="h-[120px] w-full flex flex-col items-center justify-center">
        <button
          onClick={async () => {
            try {
              setSaving(true);
              window.dispatchEvent(new CustomEvent("save-vehicle"));
            } finally {
              setSaving(false);
            }
          }}
          className="bg-[#E6A88A] h-[60px] w-80 text-black px-10 py-3 rounded-full hover:opacity-95 active:scale-[0.98] focus:outline-none focus:ring-0 cursor-pointer shadow-md text-center text-2xl font-medium border border-[#B55C32]"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </div>
  );
}

/* ===================== Utilities ===================== */
function apiVehicleToUi(av: ApiVehicle): Vehicle {
  const rawType = String(av?.vehicle_type || "").toLowerCase() as VehicleType;
  const vehicleType: VehicleTypeWithEmpty =
    (["car", "suv", "motorcycle"] as const).includes(rawType) ? rawType : "";

  return {
    id: av?.id,
    vehicleType,
    model: av?.model_vehicle ?? av?.model ?? "",
    exterior: av?.description ?? av?.exterior ?? "",
    licensePlate: av?.license_plate ?? "",
    seats: av?.seats != null ? String(av.seats) : "",
    // เก็บเป็น relative path เพื่อใช้ผ่าน proxy: <img src={`/${path}`} />
    previewUrl: av?.driving_license_url ?? av?.image_url ?? null,
    file: null,
    readonlyFromApi: true,
  };
}

export default Background;
export { Header };