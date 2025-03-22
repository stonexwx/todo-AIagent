import React from "react";
import clsx from "clsx";

export interface DropdownProps {
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  children: React.ReactNode;
}

export interface OptionProps {
  value: string | number;
  children: React.ReactNode;
  disabled?: boolean;
}

const Option: React.FC<OptionProps> = ({ value, children, disabled }) => {
  return (
    <option value={value} disabled={disabled}>
      {children}
    </option>
  );
};

const BaseDropdown: React.FC<DropdownProps> = ({
  value,
  onChange,
  placeholder,
  className,
  children,
}) => {
  return (
    <select
      className={clsx(
        "px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors",
        className
      )}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
};

// 扩展Dropdown组件，添加Option子组件
interface BaseDropdownComponent extends React.FC<DropdownProps> {
  Option: React.FC<OptionProps>;
}

const EnhancedDropdown = BaseDropdown as BaseDropdownComponent;
EnhancedDropdown.Option = Option;

export default EnhancedDropdown;
