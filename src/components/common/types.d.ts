// 为基础组件添加类型声明

import React from 'react';

// 引入BaseForm组件的接口
import {
  FormInstance,
  FormProps,
  FormItemProps,
  BaseFormComponent,
} from "./BaseForm";

// BaseForm 类型扩展
declare module "./BaseForm" {
  // 在模块扩展中不使用import和export关键字
  interface FormInstanceType extends FormInstance {}
  interface FormPropsType extends FormProps {}
  interface FormItemPropsType extends FormItemProps {}
  interface BaseFormComponentType extends BaseFormComponent {}
}

// Message 类型定义
type MessageType = "success" | "warning" | "error" | "info";

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

// Message 类型扩展
declare module "./Message" {
  // 修改变量名以避免与Message.tsx中的Message冲突
  const MessageUI: MessageComponent;
}

// BaseSelect 类型定义
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

// BaseSelect 类型扩展
declare module "./BaseSelect" {
  const BaseSelect: BaseSelectComponent;
}