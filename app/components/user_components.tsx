'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RoleBarProps {
    userRole?: string;      // role จริงของ user ('user' หรือ 'driver')
    pageRole?: string;      // role ของหน้า ณ ตอนนี้ ('user' หรือ 'driver')
}

export default function RoleBar({ userRole = "user", pageRole = "user" }: RoleBarProps) {
    const [currentRole, setCurrentRole] = useState<string>(pageRole);
    const router = useRouter();

    const toggleRole = () => {
        if (currentRole === "user") {
            // ถ้า userRole เป็น driver → switch ไปหน้า driver
            if (userRole === "driver") {
                setCurrentRole("driver");
                router.push("/driver/home");
            } else {
                // user ปกติ → ยังไม่มี driver account → ไปลงทะเบียน
                router.push("/driver/register");
            }
        } else {
            // ถ้า currentRole เป็น driver → สลับกลับ user
            setCurrentRole("user");
            router.push("/customer/home");
        }
    };

    return (
        <div className="flex gap-2 items-center">
            <div className="border-2 p-1 px-4 rounded-3xl border-theme-orange bg-white flex items-center">
                {currentRole === "user" ? (
                    <h3 className="flex items-center">
                        <img src="/role_customer.svg" alt="Passenger" className="w-6 h-6 mr-2" />
                        ผู้โดยสาร
                    </h3>
                ) : (
                    <h3 className="flex items-center">
                        <img src="/role_driver.svg" alt="Driver" className="w-6 h-6 mr-2" />
                        คนขับ
                    </h3>
                )}
            </div>

            <button onClick={toggleRole}>
                <img src="/role_swap.svg" alt="swap role" className="w-8 hover:cursor-pointer" />
            </button>
        </div>
    );
}
