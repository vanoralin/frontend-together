"use client";

function Page_choose_new_driver() {
    return (
        <div className="min-h-screen w-full bg-theme-customer flex flex-col items-center">
            <ChooseNewDriver_Header />
            <Profile_driver />
            <Profile_driver />
            <Profile_driver />
            <Profile_driver />
            <Profile_driver />
            <Profile_driver />
            <Profile_driver />
            <Profile_driver />
        </div>
    );
}

function ChooseNewDriver_Header() {
    return (
        <div className="flex flex-col items-center font-playpen">
            <h1 className="text-2xl font-bold mt-10">เลือกคนขับคนใหม่</h1>
            <p className="mt-6">หากไม่เลือกภายใน 5 นาที</p>
            <p>ระบบจะทำการสุ่มคนขับคนใหม่ให้</p>
        </div>
    );
}

function Profile_driver() {
    return (
        <div className="h-[105px] w-[363px] bg-white rounded-[30px] shadow-md mt-7 flex items-center px-4">
            <img
                src="/user.svg"
                alt="icon"
                className="h-16 w-16 rounded-full object-cover"
            />

            <div className="ml-5 flex flex-col self-start mt-5">
                <p className="text-base">
                    โรส แมรี่
                    <img
                        src="/female.svg"
                        alt="icon"
                        className="h-4 w-4 inline-block ml-2 mb-1"
                    />
                </p>
                <p className="text-base mt-2">คนขับ</p>
            </div>

            <div className="ml-auto flex flex-col text-left self-start mt-5">
                <p className="text-base">Toyota Camry, ดำ</p>
                <p className="text-base mt-2">
                    4ขอ 3500 <br />
                    ประจวบคีรีขันธ์
                </p>
            </div>
        </div>
    );
}

export default Page_choose_new_driver;
