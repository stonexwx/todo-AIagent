import React from "react";
import clsx from "clsx";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "primary" | "secondary" | "success" | "warning" | "danger";
  loading?: boolean;
}

const BaseSpinner: React.FC<SpinnerProps> = ({
  size = "md",
  className,
  color = "primary",
  loading = true,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  };

  const colorClasses = {
    primary: "border-primary/30 border-t-primary",
    secondary: "border-secondary/30 border-t-secondary",
    success: "border-green-600/30 border-t-green-600",
    warning: "border-yellow-500/30 border-t-yellow-500",
    danger: "border-red-600/30 border-t-red-600",
  };

  if (!loading) return null;

  return (
    <div
      className={clsx(
        "inline-block rounded-full animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      style={{ borderStyle: "solid" }}
      role="status"
      aria-label="加载中"
    >
      <span className="sr-only">加载中...</span>
    </div>
  );
};

export default BaseSpinner;
