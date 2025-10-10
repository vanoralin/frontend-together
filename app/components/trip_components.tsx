"use client";

//ไอคอนรถพร้อมจำนวนคน
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

//ไอคอนหมุด + ชื่อสถานที่ ใช้ในแมพ
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


interface LocationSearchInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    iconSrc?: string;
    onSearch?: () => void;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
}


export function LocationSearchInput({
    value,
    onChange,
    placeholder,
    iconSrc = "/icon_search.svg",
    onSearch,
    onFocus,
    onBlur,
}: LocationSearchInputProps) {
    return (
        <div className="w-90 relative items-center">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-10 text-base bg-white text-black rounded-[1.35rem] pl-10 pr-10 placeholder-theme-gray"
                onKeyDown={(e) => {
                    if (e.key === "Enter" && onSearch) {
                        onSearch();
                    }
                }}
                onFocus={onFocus}
                onBlur={onBlur}
            />

            {/* ไอคอนค้นหา */}
            {!value && onSearch && (
                <button
                    type="button"
                    onClick={onSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center"
                >
                    <img
                        src={iconSrc}
                        alt="search"
                        className="h-5 w-5 object-contain"
                    />
                </button>
            )}

            {/* ปุ่ม clear */}
            {value && (
                <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                    onClick={() => onChange("")}
                >
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            )}
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

//format แสดงหมุดพร้อมชื่อสถานที่
interface LocationShowBoxProps {
    value: string;
    iconSrc?: string;
}

export function LocationShowBox({
    value,
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

                    <span>{value}</span>

                </div>
            </div>
        </div>
    );
}

//แสดง format สถานที่ 2 จุด
interface LocationDirextProps {
    value1: string;
    value2: string;
}

export function LocationDirectionShowBox({ value1, value2 }: LocationDirextProps) {
    return (
        <div className="flex flex-col">
            <LocationShowBox value={value1} />
            <LocationShowBox value={value2} />
        </div>
    );
}


