'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
    role: number;
}

export default function RoleBar({ role: initialRole }: HeaderProps) {
    const [role, setRole] = useState(initialRole);
    const router = useRouter();

    const toggleRole = () => {
        const newRole = role === 0 ? 1 : 0; // 0 = passenger, 1 = driver
        setRole(newRole);

        // redirect ตาม role
        if (newRole === 0) {
            router.push("/customer"); // ผู้โดยสาร
        } else {
            router.push("/driver"); // คนขับ
        }
    };

    return (
        <div className="flex gap-2 items-center">
            <div className="border-2 p-1 px-4 rounded-3xl border-theme-orange bg-white flex items-center">
                {role === 0 && (
                    <h3 className="flex items-center">
                        <img src="/role_customer.svg" alt="Passenger" className="w-6 h-6 mr-2" />
                        ผู้โดยสาร
                    </h3>
                )}
                {role === 1 && (
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
