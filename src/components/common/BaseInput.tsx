import React from 'react';

interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const BaseInput: React.FC<InputProps> = ({ placeholder, value, onChange, className }) => {
  return (
    <input
      className={`base-input ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};

export default BaseInput;