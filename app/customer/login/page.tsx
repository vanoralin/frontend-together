// src/page/login.jsx
"use client";

import React, { useEffect } from "react";

export default function LoginPage() {
    const titleSize = 62; // หัวข้อ ไม่เปลี่ยน
    // กำหนดขนาดตัวอักษรสำหรับส่วนอื่น ๆ (ปรับค่าตามต้องการ)
    const labelSize = '16px';
    const inputFontSize = '16px';
    const buttonFontSize = '16px';
    const smallTextSize = '13px';

    useEffect(() => {
        const id = 'google-font-mitr';
        if (!document.getElementById(id)) {
            const link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Mitr:wght@300;400;500;700&display=swap';
            document.head.appendChild(link);
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
            {/* Frame ขนาดตรงกับ Figma 390 x 844 */}
            <div
                className="relative overflow-hidden rounded-2xl"
                style={{
                    width: 390,
                    height: 844,
                    backgroundColor: '#EAFCFC',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    fontFamily: "'Mitr', sans-serif"
                }}
            >
                <div className="px-8 pt-8 flex flex-col items-center h-full relative z-10">
                    <h1 style={{ fontSize: titleSize, color: '#191919'}}>
                        ไปด้วยกันนะ
                    </h1>

                    <div className="w-full mt-16">
                        <label
                            className="block text-[#191919] mb-2"
                            style={{ fontSize: labelSize }}
                        >
                            อีเมล (@kmitl.ac.th)
                        </label>
                        <div className="relative mb-6">
                            <img src="/email.svg" alt="" aria-hidden="true" className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" />
                            <input
                                type="email"
                                className="w-full h-12 bg-white shadow-sm pl-4 pr-10 outline-none"
                                style={{
                                    border: '2px solid #D9D9D9',
                                    borderRadius: 20,
                                    fontSize: inputFontSize
                                }}
                                placeholder=""
                            />
                        </div>
                        
                        <label
                            className="block text-[#191919] mb-2"
                            style={{ fontSize: labelSize }}
                        >
                            รหัสผ่าน
                        </label>
                        <div className="relative mb-8">
                            <img src="/password.svg" alt="" aria-hidden="true" className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" />
                            <input
                                type="password"
                                className="w-full h-12 bg-white shadow-sm pl-4 pr-10 outline-none"
                                style={{
                                    border: '2px solid #D9D9D9',
                                    borderRadius: 20,
                                    fontSize: inputFontSize
                                }}
                                placeholder=""
                            />
                        </div>

                        <div className="flex justify-center mb-6">
                            <button
                                className="inline-flex items-center justify-center h-12 bg-[#E6A88A] hover:bg-[#B55C32] transition-colors px-6 "
                                style={{
                                    boxSizing: 'border-box',
                                    color: '#191919',
                                    border: '2px solid #B55C32',
                                    borderRadius: 25,
                                    fontSize: buttonFontSize
                                }}
                            >
                                เข้าสู่ระบบ
                            </button>
                        </div>

                        <div className="text-center text-[#191919] mb-6">หรือ</div>

                        <button className="w-full h-12 bg-white border border-gray-200 rounded-2xl mb-8 font-medium flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors">
                            
                            <span>เข้าสู่ระบบด้วย google</span>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        </button>

                        <div className="text-center text-[#191919]" style={{ fontSize: smallTextSize }}>
                            ยังไม่ได้เป็นสมาชิก? <a href="/register" className="text-[#E6A78A]" style={{ fontSize: smallTextSize }}>ลงทะเบียน</a>
                        </div>
                    </div>
                </div>

                <img
                    src="/login.svg"
                    alt=""
                    aria-hidden="true"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-none z-0 w-full max-w-[420px]"
                    style={{ userSelect: 'none' }}
                />
            </div>
        </div>
    );
}