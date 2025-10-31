"use client";
import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { enUS } from "date-fns/locale";

export default function CalendarComponent({
  selected,
  setSelected,
}: {
  selected: Date[];
  setSelected: (days: Date[]) => void;
}) {
  const today = new Date();

  return (
    <div className="flex justify-center w-full ">
      <DayPicker
        mode="multiple"
        selected={selected}
        onSelect={(days) => setSelected(days ?? [])}
        locale={enUS}
        modifiers={{ today }}
        modifiersClassNames={{
          selected: "bg-[#B55C32] text-white rounded-full",
          today: "bg-[#FFFFFF] text-[#B55C32]",
        }}
        className="text-l [&_.rdp-caption_label]:font-light"
        weekStartsOn={0}
        captionLayout="dropdown"
        fromYear={2020}
        toYear={2030}
      />
    </div>
  );
}
