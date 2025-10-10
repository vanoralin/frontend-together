'use client';
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
    const [activeIndex, setActiveIndex] = useState(0);
    const router = useRouter();
    const pathname = usePathname();

    const navItemsLeft = [
        {
            label: "หน้าแรก",
            href: "/driver/home",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.5 21V9L12.5 3L20.5 9V21H14.5V14H10.5V21H4.5Z" />
                </svg>
            )
        },
        {
            label: "แผนที่",
            href: "/driver/map",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.5 21L9.5 18.9L4.85 20.7C4.51667 20.8333 4.20833 20.796 3.925 20.588C3.64167 20.38 3.5 20.1007 3.5 19.75V5.75C3.5 5.53333 3.56267 5.34167 3.688 5.175C3.81333 5.00833 3.984 4.88333 4.2 4.8L9.5 3L15.5 5.1L20.15 3.3C20.4833 3.16667 20.7917 3.20433 21.075 3.413C21.3583 3.62167 21.5 3.90067 21.5 4.25V18.25C21.5 18.4667 21.4377 18.6583 21.313 18.825C21.1883 18.9917 21.0173 19.1167 20.8 19.2L15.5 21ZM14.5 18.55V6.85L10.5 5.45V17.15L14.5 18.55Z" />
                </svg>
            )
        }
    ]
    const navItemsRight = [
        {
            label: "แจ้งเตือน",
            href: "/driver/notification",
            icon: (

                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> <path d="M17.1907 13.3324C17.1259 13.2543 17.0622 13.1762 16.9997 13.1008C16.1403 12.0613 15.6204 11.434 15.6204 8.49141C15.6204 6.96797 15.2559 5.71797 14.5376 4.78047C14.0079 4.08789 13.2919 3.5625 12.3481 3.17422C12.336 3.16746 12.3251 3.1586 12.3161 3.14805C11.9766 2.01133 11.0477 1.25 10.0001 1.25C8.95242 1.25 8.0239 2.01133 7.68445 3.14687C7.67541 3.15706 7.66471 3.16564 7.65281 3.17227C5.45047 4.07891 4.38015 5.81836 4.38015 8.49023C4.38015 11.434 3.86101 12.0613 3.00086 13.0996C2.93836 13.175 2.87468 13.2516 2.80984 13.3313C2.64234 13.5333 2.53622 13.779 2.50403 14.0394C2.47184 14.2999 2.51493 14.5641 2.6282 14.8008C2.86922 15.3086 3.38289 15.6238 3.96922 15.6238H16.0352C16.6188 15.6238 17.129 15.309 17.3708 14.8035C17.4845 14.5668 17.528 14.3023 17.4961 14.0416C17.4642 13.7809 17.3582 13.5348 17.1907 13.3324ZM10.0001 18.75C10.5645 18.7495 11.1184 18.5963 11.6028 18.3066C12.0872 18.0168 12.4842 17.6014 12.7516 17.1043C12.7642 17.0805 12.7705 17.0538 12.7697 17.0269C12.7689 16.9999 12.7612 16.9736 12.7473 16.9506C12.7334 16.9275 12.7137 16.9084 12.6903 16.8952C12.6668 16.8819 12.6403 16.875 12.6134 16.875H7.38758C7.36059 16.8749 7.33405 16.8818 7.31052 16.895C7.28699 16.9082 7.26729 16.9273 7.25333 16.9504C7.23936 16.9735 7.23162 16.9998 7.23084 17.0268C7.23007 17.0537 7.23629 17.0804 7.2489 17.1043C7.5163 17.6013 7.91322 18.0167 8.39758 18.3065C8.88194 18.5962 9.43567 18.7495 10.0001 18.75Z" /> </svg>
            )
        },
        {
            label: "โปรไฟล์",
            href: "/driver/profile",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M8 7C8 5.93913 8.42143 4.92172 9.17157 4.17157C9.92172 3.42143 10.9391 3 12 3C13.0609 3 14.0783 3.42143 14.8284 4.17157C15.5786 4.92172 16 5.93913 16 7C16 8.06087 15.5786 9.07828 14.8284 9.82843C14.0783 10.5786 13.0609 11 12 11C10.9391 11 9.92172 10.5786 9.17157 9.82843C8.42143 9.07828 8 8.06087 8 7ZM8 13C6.67392 13 5.40215 13.5268 4.46447 14.4645C3.52678 15.4021 3 16.6739 3 18C3 18.7956 3.31607 19.5587 3.87868 20.1213C4.44129 20.6839 5.20435 21 6 21H18C18.7956 21 19.5587 20.6839 20.1213 20.1213C20.6839 19.5587 21 18.7956 21 18C21 16.6739 20.4732 15.4021 19.5355 14.4645C18.5979 13.5268 17.3261 13 16 13H8Z" />
                </svg>
            )
        },
    ];
    const isActive = (href: string) => pathname === href;
    return (
        <>
            {/* Navbar */}
            <nav className="bg-white shadow-md fixed w-[390px] bottom-0 flex justify-between items-center px-6 h-16 z-40">
                {/* Left items */}
                <div className="flex space-x-8">
                    {navItemsLeft.map((item, index) => (
                        <button
                            key={index}
                            className="flex flex-col items-center hover:cursor-pointer"
                            onClick={() => router.push(item.href)}
                        >
                            {React.cloneElement(item.icon, {
                                className: `w-6 h-6 ${isActive(item.href) ? "text-theme-orange" : "text-theme-gray"}`
                            })}
                            <p className={`text-xs ${isActive(item.href) ? "text-theme-orange" : "text-theme-gray"}`}>
                                {item.label}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Right items */}
                <div className="flex space-x-8">
                    {navItemsRight.map((item, index) => (
                        <button
                            key={index}
                            className="flex flex-col items-center hover:cursor-pointer"
                            onClick={() => router.push(item.href)}
                        >
                            {React.cloneElement(item.icon, {
                                className: `w-6 h-6 ${isActive(item.href) ? "text-theme-orange" : "text-theme-gray"}`
                            })}
                            <p className={`text-xs ${isActive(item.href) ? "text-theme-orange" : "text-theme-gray"}`}>
                                {item.label}
                            </p>
                        </button>
                    ))}
                </div>
            </nav>

            {/* ปุ่ม + ตรงกลาง */}
            <button
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-theme-orange text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg z-50"
                onClick={() => router.push("/create")}
            >
                <img src="/icon_plus.svg" alt="เพิ่ม" className="w-10 h-10" />
            </button>
        </>
    );
}
