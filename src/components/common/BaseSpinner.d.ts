import React from "react";

declare module "./BaseSpinner" {
  export interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  }

  const BaseSpinner: React.FC<SpinnerProps>;
  export default BaseSpinner;
}