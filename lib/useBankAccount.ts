// hooks/useBankAccount.ts
"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export type BankAccount = {
  bank_account_name: string;
  bank_account_number: string;
  bank_code: string;
  bank_name: string;
  message?: string; // e.g. "No bank account linked yet"
};

export function useBankAccount() {
  const [data, setData] = useState<BankAccount | null>(null);
  const [hasLinked, setHasLinked] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) throw new Error("unauthorized");

        const res = await axios.get<BankAccount>("/api/driver/bank-account", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        if (!alive) return;

        const d = res.data || ({} as BankAccount);
        setData(d);

        // กฎง่าย ๆ: ถ้ามีเลขบัญชี (ไม่ใช่ ""/null) ถือว่า "ผูกแล้ว"
        const linked = !!String(d.bank_account_number || "").trim();
        setHasLinked(linked);

        // (ออปชัน) cache ลง localStorage ให้หน้าอื่นใช้เร็ว ๆ
        localStorage.setItem("has_linked_bank", linked ? "1" : "0");
        localStorage.setItem("bank_code", d.bank_code || "");
        localStorage.setItem("bank_name", d.bank_name || "");
        localStorage.setItem("bank_account_name", d.bank_account_name || "");
        localStorage.setItem("bank_account_number", d.bank_account_number || "");
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.message || e?.message || "fetch failed");
        setHasLinked(false);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { data, hasLinked, loading, error };
}
