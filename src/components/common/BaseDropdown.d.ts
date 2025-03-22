import React from "react";

declare module "./BaseDropdown" {
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

  interface BaseDropdownComponent extends React.FC<DropdownProps> {
    Option: React.FC<OptionProps>;
  }

  const BaseDropdown: BaseDropdownComponent;
  export default BaseDropdown;
}
