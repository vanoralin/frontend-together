"use client";

import { useEffect, useRef, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import {
  checkBannedFromProfile,
  markBannedLocal,
  readBannedLocal,
} from "@/lib/ban";

type Props = {
  /** หน้าแบนปลายทาง เช่น "/customer/ban" หรือ "/driver/ban" */
  redirectTo: string;
  /** จำกัดสโคปการทำงาน เช่น "/customer" หรือ "/driver" */
  scopePrefix: string;
  /** (ทางเลือก) รายการ path ที่ไม่อยากให้ BanWatcher ทำงาน */
  excludePaths?: string[]; // default: ["/login", "/register", "/ban"]
};

export default function BanWatcher({
  redirectTo,
  scopePrefix,
  excludePaths,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const redirecting = useRef(false);

  // อยู่ในสโคปไหม
  const inScope =
    pathname === scopePrefix || pathname.startsWith(scopePrefix + "/");

  // รายการเส้นทางที่ต้อง “งดทำงาน”
  const excluded = useMemo(() => {
    const base = ["/login", "/register", "/ban"];
    const extra = excludePaths ?? [];
    // ให้รองรับทั้ง "/customer/login" และ "/login" แบบ relative
    const fulls = [...base, ...extra].map((p) =>
      p.startsWith(scopePrefix)
        ? p
        : scopePrefix + (p.startsWith("/") ? p : "/" + p)
    );
    // ตรงหน้า ban ปลายทางก็ถือว่า exclude ด้วย
    if (!fulls.includes(redirectTo)) fulls.push(redirectTo);
    return fulls;
  }, [excludePaths, redirectTo, scopePrefix]);

  const isExcludedPage = excluded.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  const onBanPage = pathname.startsWith(redirectTo);

  const gotoBan = () => {
    if (redirecting.current || onBanPage || isExcludedPage) return;
    redirecting.current = true;
    router.replace(redirectTo);
  };

  useEffect(() => {
    // บันทึกดีบั๊กสั้น ๆ
    console.log("🟢 BanWatcher:", {
      path: pathname,
      inScope,
      isExcludedPage,
      hasToken: !!localStorage.getItem("token"),
    });

    // อยู่นอกสโคปหรืออยู่หน้า login/register/ban → ไม่ทำงานเลย
    if (!inScope || isExcludedPage) return;

    let stop = false;

    const hasToken = () => !!localStorage.getItem("token");

    // 0) โหลดครั้งแรก: เด้งเฉพาะเมื่อ "มี token" และเคยถูก mark เป็นแบน
    if (hasToken() && readBannedLocal()) gotoBan();

    // 1) เช็กเมื่อแท็บโฟกัส (เฉพาะตอนมี token)
    const onFocus = async () => {
      if (!hasToken()) return;
      try {
        const { ok, banned } = await checkBannedFromProfile();
        if (!ok) return;
        markBannedLocal(banned);
        if (banned) gotoBan();
      } catch {}
    };
    window.addEventListener("focus", onFocus);

    // 2) โพลทุก ~45s (เฉพาะตอนแท็บแอคทีฟ และมี token)
    const tick = async () => {
      try {
        if (document.visibilityState === "visible" && hasToken()) {
          const { ok, banned } = await checkBannedFromProfile();
          if (ok) {
            markBannedLocal(banned);
            if (banned) gotoBan();
          }
        }
      } catch {}
      if (!stop) setTimeout(tick, 45000);
    };
    tick();

    // 3) sync ข้ามแท็บ
    const onStorage = (e: StorageEvent) => {
      if (e.key === "is_banned" && readBannedLocal()) gotoBan();
      if (e.key === "token" && !e.newValue) {
        // token ถูกลบในแท็บอื่น → ยุติการเฝ้าระวัง (จะไม่ยิงโปรไฟล์ทิ้ง)
      }
    };
    window.addEventListener("storage", onStorage);

    // 4) เด้งทันทีในแท็บปัจจุบันเมื่อ markBannedLocal ถูกเรียก
    const onBanChanged = () => {
      if (readBannedLocal()) gotoBan();
    };
    window.addEventListener("ban:changed", onBanChanged);

    // 5) Interceptor: ถ้า API ใด ๆ โดน 423/403 ให้เด้ง (แต่ “งด” จับ endpoint auth)
    const id = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        const status = err?.response?.status;
        const url: string | undefined = err?.config?.url;

        // ถ้าเป็น endpoint เข้าสู่ระบบ/โปรไฟล์ที่ใช้ตอน login ก็ไม่ต้องเด้ง (กัน false positive)
        const isAuthLike =
          url?.includes("/auth/") ||
          url?.includes("/User/login") ||
          url?.includes("/User/google") ||
          url?.includes("/google");

        if (
          !isAuthLike &&
          (status === 423 || status === 403) &&
          inScope &&
          !onBanPage
        ) {
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
  }, [inScope, isExcludedPage, onBanPage, pathname, redirectTo, router]);

  return null;
}
