import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import clsx from 'clsx';

type MessageType = 'success' | 'warning' | 'error' | 'info';

interface MessageProps {
  type: MessageType;
  content: string;
  duration?: number;
  onClose?: () => void;
  className?: string;
}

type MessageConfigProps = {
  type: MessageType;
  content: string;
  duration?: number;
  onClose?: () => void;
  className?: string;
}

const Message: React.FC<MessageProps> = ({
  type = 'info',
  content,
  duration = 3000,
  onClose,
  className,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const messageContent = (
    <div
      className={clsx(
        'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
        'px-4 py-2 rounded-md shadow-md',
        'animate-slide-down',
        {
          'bg-green-100 text-green-800 border border-green-200': type === 'success',
          'bg-yellow-100 text-yellow-800 border border-yellow-200': type === 'warning',
          'bg-red-100 text-red-800 border border-red-200': type === 'error',
          'bg-blue-100 text-blue-800 border border-blue-200': type === 'info',
        },
        className
      )}
      role="alert"
    >
      {content}
    </div>
  );

  return createPortal(messageContent, document.body);
};

// 创建一个消息管理器
const messageInstances = new Set<{ close: () => void }>();

const showMessage = (config: MessageConfigProps) => {
  const messageContainer = document.createElement('div');
  document.body.appendChild(messageContainer);
  const root = createRoot(messageContainer);

  const close = () => {
    const instance = { close };
    messageInstances.delete(instance);
    root.unmount();
    document.body.removeChild(messageContainer);
  };

  const instance = { close };
  messageInstances.add(instance);

  const MessageComponent = (
    <Message
      {...config}
      onClose={() => {
        config.onClose?.();
        close();
      }}
    />
  );

  if (process.env.NODE_ENV === 'test') {
    const { act } = require('@testing-library/react');
    act(() => {
      root.render(MessageComponent);
    });
  } else {
    root.render(MessageComponent);
  }
  return close;
};

// 导出不同类型的消息方法
export const message = {
  success: (content: string, duration?: number) =>
    showMessage({ type: 'success', content, duration }),
  warning: (content: string, duration?: number) =>
    showMessage({ type: 'warning', content, duration }),
  error: (content: string, duration?: number) =>
    showMessage({ type: 'error', content, duration }),
  info: (content: string, duration?: number) =>
    showMessage({ type: 'info', content, duration }),
};

// 添加静态方法到Message组件
Message.success = (content: string, duration?: number) =>
  showMessage({ type: 'success', content, duration });
Message.warning = (content: string, duration?: number) =>
  showMessage({ type: 'warning', content, duration });
Message.error = (content: string, duration?: number) =>
  showMessage({ type: 'error', content, duration });
Message.info = (content: string, duration?: number) =>
  showMessage({ type: 'info', content, duration });

export default Message;