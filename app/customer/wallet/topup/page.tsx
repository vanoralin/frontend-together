"use client";
import React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BackButton } from "@/app/components/share_component";

/* ============== Types ============== */
type TopupResponse = {
  message: string;
  qr_code: string;         // base64
  transaction_id: number | string;
};

interface ProfileData {
  balance: number;
}

/* ============== API Callers ============== */
async function postTopup(amount: number) {
  const res = await axios.post<TopupResponse>(
    "/api/topup",
    { amount: Math.round(amount) },
    {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.data;
}

async function getProfile() {
  const res = await axios.get<ProfileData>("/api/User/profile", {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

/* ============== Utils ============== */
function sanitizeDecimal(input: string) {
  let s = input.replace(/,/g, ".");
  s = s.replace(/[^\d.]/g, "");
  const parts = s.split(".");
  if (parts.length > 2) s = parts[0] + "." + parts.slice(1).join("");
  if (s.startsWith(".")) s = "0" + s;
  return s;
}

/* ============== Page ============== */
function Background() {
  const router = useRouter();
  const [amountInput, setAmountInput] = React.useState("");
  const [currentBalance, setCurrentBalance] = React.useState<number | null>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        setLoadingProfile(true);
        const profile = await getProfile();
        setCurrentBalance(profile.balance ?? 0);
      } catch (e: any) {
        console.error("[/api/User/profile] error", e);
        if (e?.response?.status === 401) {
          router.replace("/customer/login");
          return;
        }
        // กรณีเออร์เรอร์อื่น ๆ แสดง 0 ไปก่อนก็ได้
        setCurrentBalance(0);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [router]);

  return (
    <div className="relative min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center pb-[120px]">
      <Header_topup />

      {loadingProfile ? (
        <div className="w-full max-w-[640px] px-5 mt-6">
          <div className="h-[120px] bg-white/60 rounded-2xl animate-pulse" />
          <div className="h-[180px] bg-white/60 rounded-2xl animate-pulse mt-6" />
        </div>
      ) : (
        <>
          <Detail
            amountInput={amountInput}
            setAmountInput={setAmountInput}
            currentBalance={currentBalance ?? 0}
          />
          <Goto_payment amountInput={amountInput} />
        </>
      )}
    </div>
  );
}

function Header_topup() {
  return (
    <div className="flex flex-col items-center">
      <BackButton />
      <p className="text-[32px] font-bold mt-10.5">เติมเงิน</p>
    </div>
  );
}

function Detail({
  amountInput,
  setAmountInput,
  currentBalance,
}: {
  amountInput: string;
  setAmountInput: React.Dispatch<React.SetStateAction<string>>;
  currentBalance: number;
}) {
  const [selected, setSelected] = React.useState<number | null>(null);
  const amounts = [20, 50, 100, 200];

  const parsedAmount =
    amountInput === "" || amountInput === "." ? 0 : Number(amountInput);
  const afterTopup = currentBalance + (isNaN(parsedAmount) ? 0 : parsedAmount);

  const handleClickAmount = (amount: number) => {
    if (selected === amount) {
      setSelected(null);
      setAmountInput("");
    } else {
      setSelected(amount);
      setAmountInput(String(amount));
    }
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = sanitizeDecimal(e.target.value);
    setAmountInput(cleaned);
    if (cleaned && !cleaned.includes(".")) {
      const n = Number(cleaned);
      setSelected(amounts.includes(n) ? n : null);
    } else {
      setSelected(null);
    }
  };

  return (
    <div className="w-full max-w-[640px] px-5">
      <div className="grid grid-cols-2 gap-6 mt-5">
        <div>
          <p className="text-xl">ยอดเงินปัจจุบัน</p>
          <p className="text-xl font-semibold">฿{currentBalance.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xl">ยอดเงินหลังเติม</p>
          <p className="text-xl font-semibold">฿{afterTopup.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex flex-col mt-8">
        <p className="text-xl">จำนวนเงินที่ต้องการเติม</p>
        <input
          type="text"
          inputMode="decimal"
          pattern="^[0-9]+([.][0-9]*)?$"
          value={amountInput}
          onChange={handleChangeInput}
          className="w-full rounded-[30px] bg-white mt-2 pl-5 py-2 border border-gray-300 focus:outline-none"
          placeholder="กรอกจำนวนเงิน"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        {([20, 50, 100, 200] as const).map((amount) => {
          const isSelected = selected === amount;
          return (
            <button
              key={amount}
              type="button"
              onClick={() => handleClickAmount(amount)}
              className={`w-full h-[51px] rounded-[30px] border transition ${
                isSelected
                  ? "bg-[#E6A88A] border-[#B55C32]"
                  : "bg-white border-transparent"
              } shadow-md`}
            >
              <span className="text-xl">฿{amount}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Goto_payment({ amountInput }: { amountInput: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const parsed =
    amountInput === "" || amountInput === "." ? 0 : Number(amountInput);
  const canProceed = !isNaN(parsed) && parsed > 0;

  const handleTopup = async () => {
    if (!canProceed || loading) return;
    try {
      setLoading(true);
      const amountInt = Math.round(Number(parsed));

      const res = await postTopup(amountInt);
      console.log("[/api/Wallet/topup]", res);

      localStorage.setItem("topupAmount", String(amountInt));
      localStorage.setItem("topupMessage", res.message ?? "");
      localStorage.setItem("topupQrBase64", res.qr_code ?? "");
      localStorage.setItem("topupTxId", String(res.transaction_id ?? ""));

      // ไปหน้าแสดง QR
      router.push("/customer/wallet/topup/qr");
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "เกิดข้อผิดพลาดในการสร้าง QR";
      if (e?.response?.status === 401) {
        alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง");
        router.replace("/customer/login");
        return;
      }
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute w-full bottom-0">
      <div className="h-[120px] bg-white rounded-t-2xl shadow-md flex flex-col items-center justify-center">
        {!canProceed && (
          <p className="text-sm text-gray-600 mb-2">
            กรุณากรอกจำนวนเงินให้ถูกต้องเพื่อดำเนินการต่อ
          </p>
        )}
        <div
          onClick={handleTopup}
          className={`h-[60px] w-80 bg-[#E6A88A] border-2 border-[#B55C32] rounded-[30px] shadow-md flex justify-center items-center ${
            canProceed ? "cursor-pointer" : "opacity-60 pointer-events-none"
          }`}
        >
          <p className="text-2xl font-medium">
            {loading ? "กำลังสร้าง QR..." : "เติมเงิน"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Background;
