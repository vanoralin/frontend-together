import RoleBar from "./user_components";

interface HeaderProps {
    username: string;
    userRole?: string; // ให้ optional
    pageRole: string;
}

export default function Welcome({ username, userRole, pageRole = 'user' }: HeaderProps) {
    const color = pageRole === 'user' ? "theme-customer" : "theme-driver";

    return (
        <div className="relative pt-20 p-10 rounded-b-3xl bg-radial from-color to-white shadow-md">
            <div className="text-start">
                <div className="mb-6">
                    <h3 className="text-2xl font-medium">เดินทางปลอดภัยนะ !</h3>
                    <p className="text-xl">{username}</p>
                </div>

                <div>
                    <p className="text-theme-orange font-medium mb-1">ขณะนี้เข้าใช้งานในโหมด</p>
                    <RoleBar userRole={userRole} pageRole={pageRole} />
                </div>
            </div>

            <img
                src="/home_scooter.svg"
                alt="home car"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 w-30 h-auto"
            />
        </div>
    );
}
