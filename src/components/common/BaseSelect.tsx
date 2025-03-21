import React from 'react';

interface SelectProps {
  options: Array<{ value: string | number; label: string }>;
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  className?: string;
}

const BaseSelect: React.FC<SelectProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  className 
}) => {
  return (
    <select
      className={`base-select ${className}`}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default BaseSelect;