"use client";

import Link from "next/link";

type Gender = "male" | "female";

interface ProfileWalletProps {
  username: string;
  gender: Gender;
  coin: number;
}

interface HistoryBlockProps {
  type: "topup" | "withdraw";
  date: string;            // "YYYY-MM-DD HH:mm"
  success: "success" | "cancel";
  amount: number;
}

function Background() {
const historyData: HistoryBlockProps[] = [
    { type: "topup", date: "2024-08-24 22:01", success: "success", amount: 50 },
    { type: "withdraw", date: "2024-08-20 14:30", success: "cancel", amount: 20 },
    { type: "topup", date: "2024-08-15 09:15", success: "success", amount: 100 },
    { type: "withdraw", date: "2024-08-10 18:45", success: "success", amount: 30 },
    { type: "topup", date: "2024-08-05 12:00", success: "success", amount: 200 },
    { type: "withdraw", date: "2024-07-30 16:20", success: "success", amount: 10 },
    { type: "topup", date: "2024-07-25 08:10", success: "cancel", amount: 150 },
    { type: "withdraw", date: "2024-07-20 19:55", success: "success", amount: 40 },
    { type: "topup", date: "2024-07-15 11:30", success: "success", amount: 80 },
    { type: "withdraw", date: "2024-07-10 21:05", success: "cancel", amount: 25 },
];

  return (
    <div className="min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center">
      <Header_wallet />
      <Profile_wallet username="เตา อั่งโล่" gender="female" coin={50} />
      <Topup />
      <History history={historyData} />
    </div>
  );
}

function Header_wallet() {
  return (
    <div className="flex flex-col items-center mt-8">
      <p className="text-[32px] font-bold text-shadow-md">กระเป๋าเงิน</p>
    </div>
  );
}

function Profile_wallet({ username, gender, coin }: ProfileWalletProps) {
  return (
    <div className="h-[162px] w-[366px] bg-white rounded-[30px] shadow-md mt-8 p-4 flex items-center">
      <img src="/user.svg" alt="icon" className="h-[110px] w-[110px] rounded-full object-cover ml-3" />
      <div className="flex flex-col ml-6">
        <div className="flex items-center">
          <p className="text-2xl font-medium">{username}</p>
          <img src={gender === "male" ? "/male.svg" : "/female.svg"} alt={gender} className="h-7 w-7 ml-2" />
        </div>
        <div className="mt-3 h-[51px] w-[145px] bg-[rgba(181,91,50,0.8)] rounded-[20px] flex justify-center items-center">
          <img src="/coin.svg" alt="icon" className="h-6 w-6 mr-2" />
          <p className="text-2xl">{coin.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

function Topup() {
  return (
    <div>
        <Link href="/customer/wallet/topup">
            <div className="h-[51px] w-[366px] bg-white rounded-[30px] shadow-md mt-5 flex justify-center items-center">
                <p className="text-center text-2xl font-medium">เติมเงิน</p>
            </div>
        </Link>
    </div>
  );
}

function History({ history }: { history: HistoryBlockProps[] }) {
  return (
    <div className="w-[366px] mt-10">
      <p className="text-2xl font-bold text-shadow-md">ประวัติรายการ</p>
      <Block_history history={history} />
    </div>
  );
}

/* helper: แปลง "YYYY-MM-DD HH:mm" => "24 ส.ค. 2568, 22.01" */
function formatThaiDate(input: string) {
  const d = new Date(input.replace(" ", "T"));
  if (isNaN(d.getTime())) return input;
  const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  const dd = d.getDate();
  const mm = months[d.getMonth()];
  const yyyy = d.getFullYear() + 543;
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd} ${mm} ${yyyy}, ${hh}.${min}`;
}

function Block_history({ history }: { history: HistoryBlockProps[] }) {
  return (
    <div className="w-[366px] h-[370px] bg-white mt-5 rounded-t-[20px] overflow-y-auto shadow-sm ring-1 ring-[#D6E7E2]">
      {history.length === 0 ? (
        <div className="p-6 text-xl text-center text-gray-900">ยังไม่มีประวัติรายการ</div>
      ) : (
        <div className="flex flex-col">
          {history.map((item, idx) => {
            const isSuccess = item.success === "success";
            const labelType = item.type === "topup" ? "เติมเงิน" : "ถอนเงิน";
            const labelStatus = isSuccess ? "สำเร็จ" : "ยกเลิก";

            return (
              <div
                key={idx}
                className="px-4 py-3 border-b-[2px] border-[#CFE3DE]"
              >
                {/* แถวบน: ชื่อรายการซ้าย / จำนวนเงินขวา */}
                <div className="flex items-start justify-between">
                  <p className="text-xl font-semibold">{labelType}</p>
                  <p className="text-xl font-bold">{item.type === "withdraw" ? "-" : ""}฿{item.amount.toFixed(2)}</p>
                </div>

                {/* แถวล่าง: สถานะ (สี) | วันที่ (เทา) */}
                <div className="mt-1 text-sm flex items-center">
                  <span className={isSuccess ? "text-green-600" : "text-red-600"}>
                    {labelStatus}
                  </span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-gray-500">{formatThaiDate(item.date)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Background;
export { Header_wallet, Profile_wallet, Topup, History, Block_history };
