import React from "react";

declare module "./BaseModal.tsx" {
  export interface BaseModalProps {
    title: string;
    visible: boolean;
    onConfirm: () => void;
    onClose: () => void;
    children: React.ReactNode;
    width?: string | number;
    confirmText?: string;
    cancelText?: string;
    className?: string;
    maskClosable?: boolean;
    onOk?: () => void;
    onCancel?: () => void;
  }

  const BaseModal: React.FC<BaseModalProps>;
  export default BaseModal;
}
