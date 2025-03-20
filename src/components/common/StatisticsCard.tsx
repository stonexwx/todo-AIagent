import React from "react";
import BaseCard from "./BaseCard";
import { Statistic } from "antd";

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  className?: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  icon,
  color = "#1890ff",
  className,
}) => {
  return (
    <BaseCard className={`p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full"
          style={{ backgroundColor: color + "20" }}
        >
          {React.cloneElement(icon as React.ReactElement, {
            style: { color, fontSize: "18px" },
          })}
        </div>
        <Statistic
          title={title}
          value={value}
          valueStyle={{ color }}
          className="m-0"
        />
      </div>
    </BaseCard>
  );
};

export default StatisticsCard;
