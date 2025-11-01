"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import {
  checkBannedFromProfile,
  markBannedLocal,
  readBannedLocal,
} from "@/lib/ban";

/** เฝ้าระวังสถานะแบนในสโคปที่กำหนด
 * @param redirectTo  หน้าแบนปลายทาง (เช่น "/customer/ban" หรือ "/driver/ban")
 * @param scopePrefix จำกัดสโคปการทำงาน (เช่น "/customer" หรือ "/driver")
 */
export default function BanWatcher({
  redirectTo,
  scopePrefix,
}: {
  redirectTo: string;
  scopePrefix: string; // "/customer" หรือ "/driver"
}) {
  const router = useRouter();
  const pathname = usePathname();
  const redirecting = useRef(false);

  const inScope =
    pathname === scopePrefix || pathname.startsWith(scopePrefix + "/");

  const onBanPage = pathname.startsWith(redirectTo);

  const gotoBan = () => {
    if (redirecting.current || onBanPage) return;
    redirecting.current = true;
    router.replace(redirectTo);
  };

  useEffect(() => {
    console.log("🟢 BanWatcher running on", pathname);
    if (!inScope) return; // อยู่นอกสโคป ไม่ต้องทำงาน
    let stop = false;

    // 0) โหลดครั้งแรก: ถ้ามี flag แล้ว ให้เด้งทันที
    if (readBannedLocal()) gotoBan();

    // 1) โฟกัสแท็บ: เช็กโปรไฟล์ (เฉพาะตอนมี token)
    const onFocus = async () => {
      if (!localStorage.getItem("token")) return;
      try {
        const { ok, banned } = await checkBannedFromProfile();
        if (!ok) return;
        markBannedLocal(banned); // ยิงอีเวนต์ ban:changed ภายในแท็บด้วย
        if (banned) gotoBan();
      } catch {}
    };
    window.addEventListener("focus", onFocus);

    // 2) โพลทุก ~45s (เฉพาะตอนแท็บแอคทีฟ และมี token)
    async function tick() {
      try {
        if (
          document.visibilityState === "visible" &&
          localStorage.getItem("token")
        ) {
          const { ok, banned } = await checkBannedFromProfile();
          if (ok) {
            markBannedLocal(banned);
            if (banned) gotoBan();
          }
        }
      } catch {}
      if (!stop) setTimeout(tick, 45000);
    }
    tick();

    // 3) sync ข้ามแท็บ (storage event จะยิงเฉพาะแท็บอื่น)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "is_banned" && readBannedLocal()) gotoBan();
    };
    window.addEventListener("storage", onStorage);

    // 4) เด้งทันทีในแท็บปัจจุบัน เมื่อ markBannedLocal() ถูกเรียก
    const onBanChanged = () => {
      if (readBannedLocal()) gotoBan();
    };
    window.addEventListener("ban:changed", onBanChanged);

    // 5) ดัก error จากทุก API — ถ้าเริ่มโดนบล็อกก็เด้งทันที
    const id = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        const status = err?.response?.status;
        if ((status === 423 || status === 403) && inScope && !onBanPage) {
          markBannedLocal(true);
          gotoBan();
        }
        return Promise.reject(err);
      }
    );

    return () => {
      stop = true;
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("ban:changed", onBanChanged);
      axios.interceptors.response.eject(id);
      redirecting.current = false;
    };
  }, [inScope, onBanPage, pathname, redirectTo, router]);

  return null;
}
