interface HeaderProps {
    role: number;
}

export default function RoleBar({ role }: HeaderProps) {
    return (
        <div className="flex">
            <div className="border-2 w-35 p-2 pl-4 rounded-3xl border-theme-orange flex-start">
                {role === 0 && (
                    <h3 className="text-lg">
                        <img src="/role_customer.svg" alt="Passenger" className="inline-block w-6 h-6 mr-2" />
                        ผู้โดยสาร
                    </h3>
                )}
                {role === 1 && (
                    <h3 className="text-lg">
                        <img src="/role_driver.svg" alt="Driver" className="inline-block w-6 h-6 mr-2" />
                        คนขับ
                    </h3>
                )}
                
            </div>
<img src="/role_swap.svg" alt="" />

        </div>
    );
}
