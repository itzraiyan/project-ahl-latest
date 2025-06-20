
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-gray-800 border border-gray-600 rounded-lg", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-gray-100",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600 hover:text-white p-0 opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-gray-300 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-sky-500/20 [&:has([aria-selected])]:bg-sky-500/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal text-gray-100 hover:bg-gray-600 hover:text-white aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-sky-500 text-white hover:bg-sky-600 hover:text-white focus:bg-sky-500 focus:text-white",
        day_today: "bg-gray-600 text-gray-100 font-semibold",
        day_outside:
          "day-outside text-gray-500 opacity-50 aria-selected:bg-sky-500/20 aria-selected:text-gray-400 aria-selected:opacity-60",
        day_disabled: "text-gray-600 opacity-30",
        day_range_middle:
          "aria-selected:bg-sky-500/20 aria-selected:text-gray-100",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4 text-gray-100" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4 text-gray-100" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
