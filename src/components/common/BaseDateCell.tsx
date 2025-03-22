import React from "react";
import dayjs from "dayjs";

type DateCellProps = {
  date: dayjs.Dayjs;
  status?: "completed" | "pending" | "cancelled";
  onClick?: () => void;
  value?: dayjs.Dayjs | null;
  onChange?: (date: dayjs.Dayjs | null) => void;
  minDate?: dayjs.Dayjs | null;
  maxDate?: dayjs.Dayjs;
  placeholder?: string;
};

const BaseDateCell: React.FC<DateCellProps> = ({ date, status, onClick }) => (
  <div
    role="button"
    className="relative h-14 bg-surface-100 hover:bg-surface-50 transition-colors cursor-pointer"
    onClick={onClick}
  >
    <div className="flex flex-col items-center p-1">
      <span
        className={`text-sm ${
          date.isSame(dayjs(), "day")
            ? "bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center"
            : ""
        }`}
      >
        {date.date()}
      </span>
      {status && (
        <div
          role="presentation"
          className={`w-2 h-2 rounded-full mt-1 ${
            {
              completed: "bg-success-500",
              pending: "bg-warning-500",
              cancelled: "bg-neutral-500",
            }[status]
          }`}
        />
      )}
    </div>
  </div>
);

export default BaseDateCell;
