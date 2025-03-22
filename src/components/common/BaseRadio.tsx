import React from "react";
import clsx from "clsx";

interface RadioProps {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface RadioButtonProps {
  value: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

interface RadioGroupProps {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  children: React.ReactNode;
}

const Radio: React.FC<RadioProps> = ({
  value,
  onChange,
  checked,
  disabled,
  className,
  children,
}) => {
  return (
    <label
      className={clsx("radio-wrapper", className, disabled && "radio-disabled")}
    >
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="radio-input"
      />
      <span className="radio-label">{children}</span>
    </label>
  );
};

const RadioButton: React.FC<RadioButtonProps> = ({
  value,
  onChange,
  checked,
  disabled,
  children,
}) => {
  return (
    <label
      className={clsx(
        "radio-button",
        disabled && "radio-button-disabled",
        checked && "radio-button-checked"
      )}
    >
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="radio-button-input"
      />
      <span className="radio-button-label">{children}</span>
    </label>
  );
};

const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onChange,
  className,
  children,
}) => {
  // 克隆子元素并传递选中状态
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        checked: child.props.value === value,
        onChange,
      } as Partial<RadioProps> & React.Attributes);
    }
    return child;
  });

  return (
    <div className={clsx("radio-group", className)}>{childrenWithProps}</div>
  );
};

// 扩展Radio组件，添加Button和Group子组件
interface BaseRadioComponent extends React.FC<RadioProps> {
  Button: React.FC<RadioButtonProps>;
  Group: React.FC<RadioGroupProps>;
}

const BaseRadio = Radio as BaseRadioComponent;
BaseRadio.Button = RadioButton;
BaseRadio.Group = RadioGroup;

export default BaseRadio;
