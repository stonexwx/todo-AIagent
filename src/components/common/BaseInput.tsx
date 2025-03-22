import React from 'react';

interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
}

const BaseInput: React.FC<InputProps> = ({
  placeholder,
  value,
  onChange,
  className,
  type,
}) => {
  return (
    <input
      className={`base-input ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      type={type}
    />
  );
};

export default BaseInput;