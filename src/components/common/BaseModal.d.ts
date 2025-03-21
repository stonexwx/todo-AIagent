import React from "react";

declare module "./BaseModal.tsx" {
  export interface BaseModalProps {
    title: string;
    visible: boolean;
    onConfirm: () => void;
    onClose: () => void;
    children: React.ReactNode;
  }

  const BaseModal: React.FC<BaseModalProps>;
  export default BaseModal;
}
