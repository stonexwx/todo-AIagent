import React from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "success" | "warning" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
}

const BaseButton: React.FC<BaseButtonProps> = ({
  variant = "primary",
  size = "md",
  className,
  children,
  onClick,
  disabled = false,
  "aria-label": ariaLabel,
}) => {
  return (
    <button
      className={clsx(
        "rounded-md transition-colors duration-200",
        {
          "bg-primary text-white hover:bg-primary/90": variant === "primary",
          "bg-secondary text-gray-800 hover:bg-secondary/80":
            variant === "secondary",
          "bg-green-600 text-white hover:bg-green-700": variant === "success",
          "bg-yellow-500 text-black hover:bg-yellow-600": variant === "warning",
          "bg-red-600 text-white hover:bg-red-700": variant === "danger",
        },
        {
          "px-2 py-1 text-sm": size === "sm",
          "px-4 py-2 text-base": size === "md",
          "px-6 py-3 text-lg": size === "lg",
        },
        "disabled:bg-surface-100 disabled:text-surface-400 disabled:cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default BaseButton;
