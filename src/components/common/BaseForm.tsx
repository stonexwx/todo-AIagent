import React, { useRef } from "react";

export interface FormInstance {
  getFieldValue: (field: string) => any;
  setFieldsValue: (values: any) => void;
  resetFields: () => void;
  validateFields: () => Promise<any>;
}

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  layout?: "horizontal" | "vertical";
  loading?: boolean;
  error?: string;
  form?: FormInstance;
}

export interface FormItemProps {
  name?: string;
  label?: string;
  rules?: Array<{ required?: boolean; message?: string }>;
  children?: React.ReactNode;
}

// 扩展React.FC类型，添加静态属性
export interface BaseFormComponent extends React.FC<FormProps> {
  useForm: () => [FormInstance];
  Item: React.FC<FormItemProps>;
}

const FormItem: React.FC<FormItemProps> = ({
  name,
  label,
  rules,
  children,
}) => {
  return (
    <div className="form-item">
      {label && <label className="form-label">{label}</label>}
      <div className="form-control">{children}</div>
      {rules?.map(
        (rule, index) =>
          rule.required && (
            <div key={index} className="form-error">
              {rule.message}
            </div>
          )
      )}
    </div>
  );
};

const BaseForm: BaseFormComponent = ({
  layout = "vertical",
  loading,
  error,
  form,
  children,
  ...props
}) => {
  return (
    <form className={`base-form ${layout}-form`} {...props}>
      {error && <div className="form-error-alert">{error}</div>}
      {children}
      {loading && <div className="form-loading-overlay" />}
    </form>
  );
};

const useForm = (): [FormInstance] => {
  const formRef = useRef<FormInstance>({
    getFieldValue: (field: string) => {
      // 简单实现，实际项目中可能需要更复杂的逻辑
      return "";
    },
    setFieldsValue: (values: any) => {
      // 简单实现
    },
    resetFields: () => {
      // 简单实现
    },
    validateFields: async () => {
      // 简单实现
      return {};
    },
  });

  return [formRef.current];
};

// 添加静态方法和子组件
BaseForm.useForm = useForm;
BaseForm.Item = FormItem;

export default BaseForm;
