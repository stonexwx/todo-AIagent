import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { message } from '../Message';

const renderMessage = (type: string, content: string, duration?: number) => {
  act(() => {
    switch (type) {
      case 'success':
        message.success(content, duration);
        break;
      case 'error':
        message.error(content, duration);
        break;
      case 'warning':
        message.warning(content, duration);
        break;
      case 'info':
        message.info(content, duration);
        break;
    }
  });
};

describe('Message Component', () => {
  beforeEach(() => {
    // 清理DOM中的所有消息
    document.body.innerHTML = '';
  });

  it('should render success message with correct styles', () => {
    renderMessage('success', 'Success message');
    expect(screen.getByRole('alert')).toHaveClass('bg-green-100');
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('should render error message with correct styles', () => {
    renderMessage('error', 'Error message');
    expect(screen.getByRole('alert')).toHaveClass('bg-red-100');
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should render warning message with correct styles', () => {
    renderMessage('warning', 'Warning message');
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-100');
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('should render info message with correct styles', () => {
    renderMessage('info', 'Info message');
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-100');
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('should auto close after duration', async () => {
    jest.useFakeTimers();
    renderMessage('info', 'Auto close message', 1000);
    expect(screen.getByText('Auto close message')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.queryByText('Auto close message')).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  it('should support multiple messages', () => {
    act(() => {
      message.success('First message');
      message.error('Second message');
      message.warning('Third message');
    });

    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
    expect(screen.getByText('Third message')).toBeInTheDocument();
  });

  it('should return close function', () => {
    let close: () => void;
    act(() => {
      close = message.info('Closeable message');
    });
    expect(screen.getByText('Closeable message')).toBeInTheDocument();

    act(() => {
      close();
    });

    expect(screen.queryByText('Closeable message')).not.toBeInTheDocument();
  });
});