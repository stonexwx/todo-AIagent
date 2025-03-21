import React, { useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "@/assets/custom-icons";
import BaseButton from "./BaseButton";
import BaseDateCell from "./BaseDateCell";

type CalendarProps = {
  currentDate: dayjs.Dayjs;
  markedDates?: Record<string, "completed" | "pending" | "cancelled">;
  tasks?: Array<{
    date: string;
    status: "completed" | "pending" | "cancelled";
  }>;
  onDateClick?: (date: dayjs.Dayjs) => void;
};

const BaseCalendar: React.FC<CalendarProps> = ({
  currentDate,
  markedDates,
  tasks = [],
  onDateClick,
}) => {
  const [displayMonth, setDisplayMonth] = useState(currentDate);

  // 生成月份切换按钮
  const MonthSwitcher = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-surface-100">
      <BaseButton
        variant="secondary"
        size="sm"
        className="!p-2 rounded-full"
        onClick={() =>
          setDisplayMonth((prev) => prev.clone().subtract(1, "month"))
        }
        aria-label="前一个月"
      >
        <ChevronLeft className="w-5 h-5" />
      </BaseButton>
      <span className="font-medium text-primary">
        {displayMonth.format("YYYY年MM月")}
      </span>
      <BaseButton
        variant="secondary"
        size="sm"
        className="!p-2 rounded-full"
        onClick={() => setDisplayMonth((prev) => prev.clone().add(1, "month"))}
        aria-label="后一个月"
      >
        <ChevronRight className="w-5 h-5" />
      </BaseButton>
    </div>
  );

  // 生成日期面板
  const DateGrid = () => {
    const startOfMonth = displayMonth.startOf("month");
    const daysInMonth = displayMonth.daysInMonth();
    const startDay = startOfMonth.day();

    return (
      <div className="grid grid-cols-7 gap-px bg-surface-200">
        {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
          <div
            key={day}
            className="h-10 bg-surface-100 flex items-center justify-center text-sm text-secondary"
          >
            {day}
          </div>
        ))}
        {[...Array(startDay)].map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {[...Array(daysInMonth)].map((_, i) => {
          const date = startOfMonth.add(i, "day");
          const dateStr = date.format("YYYY-MM-DD");
          const taskStatus =
            markedDates?.[dateStr] ||
            tasks.find((t) => dayjs(t.date).isSame(date, "day"))?.status;

          return (
            <BaseDateCell
              key={i}
              date={date}
              status={taskStatus}
              onClick={() => onDateClick?.(date)}
            />
          );
        })}
      </div>
    );
  };
  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-surface-200 transition-all duration-300">
      <MonthSwitcher />
      <DateGrid />
    </div>
  );
};

export default BaseCalendar;
