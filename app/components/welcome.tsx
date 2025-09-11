import RoleBar from "./user_components";

interface HeaderProps {
    username: string;
    role: number;
}

export default function Welcome({ username, role }: HeaderProps) {
    return (
        <div className="p-10 rounded-3xl bg-radial from-theme-customer to-white shadow-md">
            <div className="text-start mb-6">
                <h3 className="text-2xl text-bold">เดินทางปลอดภัยนะ !</h3>
                <p className="text-xl">{username}</p>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-start">
                    <p>ขณะนี้เข้าใช้งานในโหมด</p>
                    <RoleBar role={role} />
                </div>

                <img src="/home_scooter.svg" alt="home car" className="w-28 h-auto" />
            </div>
        </div>
    );
}
