// 为基础组件添加类型声明

import React from 'react';

// BaseForm 类型扩展
declare module './BaseForm' {
  interface FormInstance {
    getFieldValue: (field: string) => any;
    setFieldsValue: (values: any) => void;
    resetFields: () => void;
    validateFields: () => Promise<any>;
  }

  interface FormItemProps {
    name?: string;
    label?: string;
    rules?: Array<{ required?: boolean; message?: string }>;
    children?: React.ReactNode;
  }

  interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    layout?: "horizontal" | "vertical";
    loading?: boolean;
    error?: string;
    form?: FormInstance;
  }

  interface BaseFormComponent extends React.FC<FormProps> {
    useForm: () => [FormInstance];
    Item: React.FC<FormItemProps>;
  }

  const BaseForm: BaseFormComponent;
  export default BaseForm;
}

// Message 类型扩展
declare module './Message' {
  type MessageType = 'success' | 'warning' | 'error' | 'info';

  interface MessageProps {
    type: MessageType;
    content: string;
    duration?: number;
    onClose?: () => void;
    className?: string;
  }

  interface MessageComponent extends React.FC<MessageProps> {
    success: (content: string, duration?: number) => void;
    warning: (content: string, duration?: number) => void;
    error: (content: string, duration?: number) => void;
    info: (content: string, duration?: number) => void;
  }

  const Message: MessageComponent;
  export default Message;
}

// BaseSelect 类型扩展
declare module './BaseSelect' {
  interface OptionProps {
    value: string | number;
    children: React.ReactNode;
  }

  interface SelectProps {
    options?: Array<{ value: string | number; label: string }>;
    value?: string | number;
    onChange?: (value: string | number) => void;
    placeholder?: string;
    className?: string;
    children?: React.ReactNode;
  }

  interface BaseSelectComponent extends React.FC<SelectProps> {
    Option: React.FC<OptionProps>;
  }

  const BaseSelect: BaseSelectComponent;
  export default BaseSelect;
}