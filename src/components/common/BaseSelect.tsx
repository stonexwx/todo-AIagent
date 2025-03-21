import React from 'react';

interface SelectProps {
  options?: Array<{ value: string | number; label: string }>;
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
}

interface OptionProps {
  value: string | number;
  children: React.ReactNode;
}

const Option: React.FC<OptionProps> = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};

// 声明Option子组件的类型

const BaseSelect: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  className,
  children,
}) => {
  return (
    <select
      className={`base-select ${className || ""}`}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      {children}
    </select>
  );
};

// 使用类型断言将BaseSelect转换为带有Option子组件的组件
type BaseSelectComponent = React.FC<SelectProps> & {
  Option: React.FC<OptionProps>;
};

// 添加Option子组件
(BaseSelect as BaseSelectComponent).Option = Option;
