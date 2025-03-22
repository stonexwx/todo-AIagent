import React, { useEffect, useRef } from "react";
import "./BaseModal.scss";

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

const BaseModal: React.FC<BaseModalProps> = ({
  title,
  visible,
  onConfirm,
  onClose,
  children,
  width = "500px",
  confirmText = "确认",
  cancelText = "取消",
  className = "",
  maskClosable = true,
  onOk,
  onCancel,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // 处理ESC键关闭模态框
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && visible) {
        if (onCancel) {
          onCancel();
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [visible, onClose, onCancel]);

  // 处理点击模态框外部关闭
  const handleMaskClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (maskClosable && e.target === e.currentTarget) {
      if (onCancel) {
        onCancel();
      } else {
        onClose();
      }
    }
  };

  // 处理确认按钮点击
  const handleConfirm = () => {
    if (onOk) {
      onOk();
    } else {
      onConfirm();
    }
  };

  // 处理取消按钮点击
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  // 如果不可见，不渲染组件
  if (!visible) return null;

  return (
    <div
      className={`base-modal-mask ${visible ? "visible" : ""}`}
      onClick={handleMaskClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`base-modal ${className}`}
        style={{ width }}
        ref={modalRef}
      >
        <div className="base-modal-header">
          <h3 className="base-modal-title">{title}</h3>
          <button
            className="base-modal-close"
            onClick={handleCancel}
            aria-label="关闭"
          >
            ×
          </button>
        </div>
        <div className="base-modal-content">{children}</div>
        <div className="base-modal-footer">
          <button className="base-modal-btn cancel" onClick={handleCancel}>
            {cancelText}
          </button>
          <button className="base-modal-btn confirm" onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BaseModal;
