import React from "react";
import BaseCard from "./BaseCard";
import clsx from "clsx";

type TaskStatus = "pending" | "completed" | "cancelled";

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  tags?: string[];
  className?: string;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  status,
  tags,
  className,
  onClick,
}) => {
  return (
    <BaseCard
      variant="surface"
      hoverEffect
      className={clsx("task-card", className)}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium mb-1">{title}</h4>
          <p className="text-secondary text-sm">{description}</p>
        </div>
        <span
          className={clsx("status-badge", {
            "bg-success-100 text-success-800": status === "completed",
            "bg-info-100 text-info-800": status === "pending",
            "bg-neutral-100 text-neutral-800": status === "cancelled",
          })}
        >
          {{ completed: "完成", pending: "进行中", cancelled: "取消" }[status]}
        </span>
      </div>
      {tags && tags.length > 0 && (
        <div className="flex gap-2 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="tag bg-surface-200 text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </BaseCard>
  );
};

export default TaskCard;
