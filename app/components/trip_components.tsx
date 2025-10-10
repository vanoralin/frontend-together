"use client";

interface NumberInCarProps {
    number: number;
}

export function NumberInCar({ number }: NumberInCarProps) {
    return (
        <div className="flex items-center gap-1">
            <img src="/icon_car.svg" alt="" className="h-6" />
            <p>{number}</p>
        </div>
    );
}
interface PinProps {
    location: string;
}

export function PinName({ location }: PinProps) {
    return (
        <div className="flex items-center gap-2">
            <img src="/location.png" alt="pin" className="h-5" />
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

interface LocationInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    iconSrc?: string;
}

export function LocationInput({ value, onChange, placeholder, iconSrc = "/location.png" }: LocationInputProps) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <img src={iconSrc} alt="location" className="h-8 w-6 object-contain" />
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-8 text-base bg-theme-light-gray text-black rounded-[1.35rem] pl-4 pr-12 placeholder-gray-500"
                    placeholder={placeholder}
                />
                {value && (
                    <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                        onClick={() => onChange("")}
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

interface LocationShowBoxProps {
    value: string;
    placeholder: string;
    iconSrc?: string;
}

export function LocationShowBox({
    value,
    placeholder,
    iconSrc = "/location.png",
}: LocationShowBoxProps) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <img
                src={iconSrc}
                alt="location"
                className="h-8 w-6 object-contain"
            />
            <div className="flex-1 relative">
                <div
                    className="w-full h-8 text-base bg-theme-light-gray text-black rounded-[1.35rem] pl-4 pr-3 flex items-center"
                >
                    {value ? (
                        <span>{value}</span>
                    ) : (
                        <span className="text-gray-500">{placeholder}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

interface LocationDirextProps {
    value1: string;
    value2: string;
}

export function LocationDirectionShowBox({ value1, value2 }: LocationDirextProps) {
    return (
        <div className="flex flex-col">
            <LocationShowBox value={value1} placeholder="จุดเริ่มต้น" />
            <LocationShowBox value={value2} placeholder="จุดหมาย" />
        </div>
    );
}


