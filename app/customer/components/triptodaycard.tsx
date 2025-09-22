export default function TripTodayCard() {
    return (
        <div className="bg-white rounded-xl shadow-md p-4 mt-2">
            <h3 className="text-md font-bold text-gray-800 flex justify-between items-center">
                คนขับรับคุณมาแล้ว
                <span className="text-sm text-gray-500">08:30</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">หน้าตึก ECC</p>

            {/* Progress */}
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <span>ออกเดินทาง</span>
                <span>ใกล้ถึงแล้ว</span>
                <span>จุดรับ</span>
                <span>จุดหมาย</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mt-1">
                <div className="h-2 bg-orange-500 rounded-full w-2/3"></div>
            </div>

            <p className="text-xs text-gray-400 mt-2">กดเพื่อดูรายละเอียด</p>
        </div>
    );
}
