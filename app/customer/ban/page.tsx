"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { checkBannedFromProfile, markBannedLocal } from "@/lib/ban";

export default function BanNotificationPage() {
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("ผู้ใช้");
  const [checking, setChecking] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // หาเส้นทาง home ตาม role จาก path ปัจจุบัน
  const homePath = pathname.startsWith("/driver")
    ? "/driver/home"
    : "/customer/home";

  // โหลดชื่อ user
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("/api/User/profile", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        if (res.data?.name) setUserName(res.data.name);
      } catch (err) {
        console.error("โหลดข้อมูลโปรไฟล์ไม่สำเร็จ:", err);
      }
    })();
  }, []);

  // เช็คว่ายังโดนแบนอยู่ไหม → ถ้าพ้นแบนให้กลับหน้า home
  const checkUnban = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      setChecking(true);
      const { ok, banned } = await checkBannedFromProfile(token);
      if (ok && !banned) {
        markBannedLocal(false); // ล้าง flag
        router.replace(homePath); // เด้งกลับหน้า home ตาม role
      }
    } catch (e) {
      // เงียบๆ พอ ไม่ต้องรบกวนผู้ใช้
      console.debug("checkUnban failed:", e);
    } finally {
      setChecking(false);
    }
  }, [homePath, router]);

  // เช็คครั้งแรก + โฟกัสแท็บ + โพลทุก 20 วิ
  useEffect(() => {
    checkUnban(); // ครั้งแรกเมื่อเข้าหน้า
    const onFocus = () => checkUnban();
    window.addEventListener("focus", onFocus);
    const t = setInterval(checkUnban, 20000);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(t);
    };
  }, [checkUnban]);

  // ส่งคำร้อง
  const handleSubmit = async () => {
    if (message.trim() === "") {
      setError("กรุณาเขียนข้อความก่อน");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("กรุณาเข้าสู่ระบบก่อนส่งคำร้อง");
        return;
      }
      await axios.post(
        "/api/report",
        { detail: `[BAN_APPEAL] ${message}`, trip_id: null },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setShowPopup(true);
      setMessage("");
      setError("");
    } catch (err: any) {
      console.error("Error:", err.response?.data || err.message);
      if (err.response?.status === 401) setError("Token หมดอายุหรือไม่ถูกต้อง");
      else if (err.response?.status === 400)
        setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      else setError("เกิดข้อผิดพลาดในการส่งคำร้อง");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#C5DEDA] flex flex-col">
      {/* เนื้อหา */}
      <div className="flex flex-col items-center px-6 pt-14 flex-1">
        <h1 className="text-[32px] text-black font-semibold mb-4 text-center">
          คุณถูกระงับการใช้งาน
        </h1>
        <img
          src="/alarm sign.svg"
          alt="Warning"
          className="w-44 h-44 object-contain mb-4"
        />

        <div className="text-center mb-8 px-4">
          {/* <p className="text-[#B55C32] text-[14px] leading-relaxed">สวัสดีคุณ {userName}</p> */}
          <p className="text-[#B55C32] text-[15px] leading-relaxed">
            ระบบตรวจพบพฤติกรรมที่ละเมิดเงื่อนไขการใช้งาน
          </p>
          <p className="text-[#B55C32] text-[15px] leading-relaxed">
            โปรดกรอกคำร้องขอปลดแบนด้านล่าง
          </p>
        </div>

        <div className="w-full max-w-md mb-2">
          <textarea
            placeholder="ระบุเหตุผลหรือคำชี้แจง..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full min-h-[300px] bg-white border-0 rounded-2xl shadow-sm text-gray-700 placeholder:text-gray-400 resize-none text-base p-4 focus:outline-none focus:ring-2 focus:ring-[#B55C32]"
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
        )}
      </div>

      {/* ปุ่มส่ง */}
      <div className="w-full h-[120px] bg-white flex items-center justify-center shadow-inner px-6 rounded-tl-[20px] rounded-tr-[20px] border-t border-gray-300">
        <button
          onClick={handleSubmit}
          className="w-full h-12 bg-[#E6A88A] hover:bg-[#B55C32] transition-colors inline-flex items-center justify-center"
          style={{
            boxSizing: "border-box",
            color: "#191919",
            border: "2px solid #B55C32",
            borderRadius: 25,
            fontSize: "20px",
          }}
        >
          ส่งคำร้อง
        </button>
      </div>

      {/* popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-2xl shadow-lg p-6 w-80 text-center"
          >
            <h2 className="text-[20px] font-bold text-[#B55C32] mb-2">
              ส่งแล้ว ✅
            </h2>
            <p className="text-gray-700 text-[16px]">
              ระบบได้รับคำร้องของคุณแล้ว
            </p>

            <button
              className="w-full h-10 mt-4 bg-[#E6A88A] hover:bg-[#B55C32] text-black font-semibold rounded-xl transition-colors"
              onClick={() => setShowPopup(false)}
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
