import React from "react";

declare module "./BaseInput" {
  export interface InputProps {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
  }

  const BaseInput: React.FC<BaseInputProps>;
  export default BaseInput;
}
