import React from "react";
type FormProps = React.FormHTMLAttributes<HTMLFormElement> & {
  layout?: "horizontal" | "vertical";
  loading?: boolean;
  error?: string;
};

const BaseForm: React.FC<FormProps> = ({
  layout = "vertical",
  loading,
  error,
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

export default BaseForm;
