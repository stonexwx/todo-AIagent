import React from 'react';

interface TextAreaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
}

const BaseTextArea: React.FC<TextAreaProps> = ({ 
  placeholder, 
  value, 
  onChange, 
  className,
  rows = 4
}) => {
  return (
    <textarea
      className={`base-textarea ${className || ''}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
    />
  );
};

export default BaseTextArea;