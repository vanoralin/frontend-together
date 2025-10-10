import RoleBar from "./user_components";

interface HeaderProps {
    username: string;
    role: number;
}

export default function Welcome({ username, role }: HeaderProps) {
    role = role ?? 0; // default to passenger if role is undefined
    const color = role === 0 ? "theme-customer" : "theme-driver";
    return (
        <div className="relative mt-10 p-10 rounded-b-3xl bg-radial from-color to-white shadow-md">
            <div className="text-start">
                <div className="mb-6">
                    <h3 className="text-2xl font-medium">เดินทางปลอดภัยนะ !</h3>
                    <p className="text-xl">{username}</p>
                </div>

                <div>
                    <p className="text-theme-orange font-medium mb-1">ขณะนี้เข้าใช้งานในโหมด</p>
                    <RoleBar role={role} />
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
