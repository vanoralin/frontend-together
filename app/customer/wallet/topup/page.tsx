// ยังไม่เสร็จ
"use client";

function Background() {
    return (
        <div className="min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center">
            <Header_topup />
            <Detail />
        </div>
    );
}

function Header_topup(){
    return (
        <div className="flex flex-col items-center mt-8">
            <p className="text-[32px] font-bold text-shadow-md">เติมเงิน</p>
        </div>
    );
}

function Detail() {
    return (
<div className="mt-6 px-8">
  <div className="grid grid-cols-2 gap-y-3">
    {/* แถวหัวข้อ */}
    <p className="text-xl text-left">ยอดเงินปัจจุบัน</p>
    <p className="text-xl text-left">ยอดเงินหลังเติม</p>

    {/* แถวตัวเลข (ใส่เลขไปเลย) */}
    <p className="text-xl font-semibold text-left">฿20.00</p>
    <p className="text-xl font-semibold text-left">฿70.00</p>
  </div>
</div>

    );
}

export default Background;
export { Header_topup , Detail };