// TripHome.tsx
import { PinName } from "../../components/trip_components";

interface TripHome {
    name: string;
}

export default function TripHome() {
    return (
        <div className="text-start border-2 p-4 rounded-3xl border-theme-orange flex flex-col gap-4">
            <div className="">
                <p>คนขับมารับคุณแล้ว</p>
                <p>คาดว่าจะไปถึงจุดหมายตอน 08:30</p>
            </div>

            <PinName location="เกสี่" />
        </div>
    );
}
