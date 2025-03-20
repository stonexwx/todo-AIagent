import React from "react";
import clsx from "clsx";

type CardVariant =
  | "default"
  | "surface"
  | "primary"
  | "success"
  | "warning"
  | "info";

type CardSize = "sm" | "md" | "lg";

interface BaseCardProps {
  title?: string;
  variant?: CardVariant;
  size?: CardSize;
  className?: string;
  children: React.ReactNode;
  hoverEffect?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const BaseCard: React.FC<BaseCardProps> = ({
  title,
  variant = "surface",
  size = "md",
  className,
  children,
  hoverEffect = false,
  onClick,
}) => {
  return (
    <div
      className={clsx(
        "border rounded-lg transition-all duration-300 ease-[var(--ease-out)]",
        {
          "bg-[var(--surface-200)] border-[var(--surface-300)]":
            variant === "surface",
          "bg-color-primary text-white": variant === "primary",
          "bg-color-success text-white": variant === "success",
          "bg-color-warning text-black": variant === "warning",
          "bg-color-info text-white": variant === "info",
        },
        {
          "p-2 text-xs": size === "sm",
          "p-4 text-base": size === "md",
          "p-6 text-lg": size === "lg",
        },
        {
          "transition-shadow hover:shadow-lg": hoverEffect,
        },
        className
      )}
    >
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
      )}
      <div className="card-content">{children}</div>
    </div>
  );
};

export default BaseCard;
