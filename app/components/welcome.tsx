import RoleBar from "./role_bar";

interface HeaderProps {
    username: string;
    role: number;
}

export default function Welcome({ username, role }: HeaderProps) {
    return (
        <div>
            <div className="text-start mb-6">
                <h3 className="text-2xl">เดินทางปลอดภัยนะ ! hehehehe</h3>
                <p className="text-xl">{username}</p>
            </div>

            <div className="flex">
                <div className="text-start">
                    <p>ขณะนี้เข้าใช้งานในโหมด</p>
                    <RoleBar role={role} />
                </div>

                <img src="/home_car.png" alt="" />
            </div>

        </div>
    );
}
