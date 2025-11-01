// lib/ban.ts
import axios from "axios";

export const isBannedFromName = (name?: string) =>
  String(name ?? "").trim().toUpperCase().startsWith("[BANNED]");

export async function checkBannedFromProfile(token?: string) {
  const tk = token ?? localStorage.getItem("token");
  if (!tk) return { ok: false, banned: false };
  const res = await axios.get("/api/User/profile", {
    headers: { Authorization: `Bearer ${tk}` },
    withCredentials: true,
  });
  console.log("🟢 Profile Response:", res.data);
  const nameVal = String(res.data?.name ?? "");
  const banned = nameVal.startsWith("[BANNED]");
  return { ok: true, banned };
}

export function markBannedLocal(banned: boolean) {
  if (banned) localStorage.setItem("is_banned", "1");
  else localStorage.removeItem("is_banned");

  // ✅ ยิงอีเวนต์ custom ที่แท็บปัจจุบันฟังอยู่
  window.dispatchEvent(new Event("ban:changed"));
}

export const readBannedLocal = () => localStorage.getItem("is_banned") === "1";
