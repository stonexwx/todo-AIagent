import React from 'react';
import { Modal as AntModal, ModalProps as AntModalProps } from 'antd';

type ModalProps = AntModalProps & {
  visible?: boolean;
  onCancel?: () => void;
  footer?: React.ReactNode | null;
};

const BaseModal: React.FC<ModalProps> = ({ 
  visible,
  onCancel,
  title,
  footer,
  children,
  ...props
}) => {
  return (
    <AntModal
      open={visible}
      title={title}
      onCancel={onCancel}
      footer={footer}
      className="base-modal"
      {...props}
    >
      {children}
    </AntModal>
  );
};

export default BaseModal;
export type { ModalProps };