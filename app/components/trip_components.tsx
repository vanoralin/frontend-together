interface PinProps {
    location: string;
}

export function PinName({ location }: PinProps) {
    return (
        <div className="flex items-center gap-1">
            <img src="/icon_pin.svg" alt="pin" className="w-4 h-4" />
            <p>{location}</p>
        </div>
    );
}

interface PinDirectionProps {
    location1?: string;
    location2?: string;
}

export function PinDirection({ location1, location2 }: PinDirectionProps) {
    return (
        <div className="flex items-center gap-2">
            <span>จุดรับ:</span>
            <PinName location={location1 ?? "-"} />
            <span>จุดส่ง:</span>
            <PinName location={location2 ?? "-"} />
        </div>
    );
}
