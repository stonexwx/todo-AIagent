import React from "react";
import dayjs from "dayjs";

declare module "./BaseDateCell" {
  export interface DateCellProps {
    date: dayjs.Dayjs;
    status?: "completed" | "pending" | "cancelled";
    onClick?: () => void;
    value?: dayjs.Dayjs | null;
    onChange?: (date: dayjs.Dayjs | null) => void;
    minDate?: dayjs.Dayjs | null;
    maxDate?: dayjs.Dayjs;
    placeholder?: string;
  }

  const BaseDateCell: React.FC<DateCellProps>;
  export default BaseDateCell;
}