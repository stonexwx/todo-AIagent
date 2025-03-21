import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Dashboard from './Dashboard';
import { invoke } from '@tauri-apps/api/core';
import dayjs from 'dayjs';
import { message } from './common/Message';

// Mock tauri invoke
jest.mock('@tauri-apps/api/core', () => ({
  invoke: jest.fn(),
}));

// Mock message component
jest.mock('./common/Message', () => ({
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// 测试数据
const mockTasks = [
  {
    id: '1',
    title: '完成项目报告',
    description: '编写第一季度项目进展报告',
    quadrant: 1,
    createdAt: dayjs().subtract(1, 'day').toISOString(),
    completedAt: dayjs().toISOString(),
    status: 'completed',
    tags: ['工作', '文档'],
  },
  {
    id: '2',
    title: '学习React新特性',
    description: '学习React 18的新功能和API',
    quadrant: 2,
    createdAt: dayjs().toISOString(),
    status: 'pending',
    tags: ['学习', '技术'],
  },
];

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 默认mock返回任务列表
    (invoke as jest.Mock).mockResolvedValue(mockTasks);
  });

  it('应该正确渲染Dashboard组件', async () => {
    render(<Dashboard />);
    
    // 等待加载完成
    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('get_tasks');
    });

    // 检查基本UI元素是否存在
    expect(screen.getByText('总任务数')).toBeInTheDocument();
    expect(screen.getByText('完成率')).toBeInTheDocument();
    expect(screen.getByText('进行中')).toBeInTheDocument();
    expect(screen.getByText('已取消')).toBeInTheDocument();
  });

  it('应该正确显示任务统计信息', async () => {
    (invoke as jest.Mock).mockResolvedValue(mockTasks);
    render(<Dashboard />);

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('get_tasks');
    });

    // 检查统计数据是否正确
    await waitFor(async () => {
      const totalTasks = screen.queryAllByText('2');
      expect(totalTasks.length).toBeGreaterThan(0);
      await screen.findByText(/50%/);
      expect(screen.getByText(/50%/)).toBeInTheDocument();
    });
  });

  it('应该能够切换时间范围', async () => {
    (invoke as jest.Mock).mockResolvedValue(mockTasks);
    render(<Dashboard />);

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('get_tasks');
    });

    // 点击日视图按钮
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '日' }));
    });
    expect(screen.getByRole('button', { name: '日' })).toHaveClass('bg-primary');

    // 点击月视图按钮
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '月' }));
    });
    expect(screen.getByRole('button', { name: '月' })).toHaveClass('bg-primary');
  });

  it('应该能够创建新任务', async () => {
    const newTask = {
      id: '3',
      title: '新任务',
      description: '测试任务描述',
      quadrant: 1,
      createdAt: dayjs().toISOString(),
      status: 'pending',
      tags: ['测试'],
    };

    // 模拟创建任务成功
    (invoke as jest.Mock).mockImplementation((cmd, args) => {
      if (cmd === 'create_task') {
        return Promise.resolve();
      }
      if (cmd === 'get_tasks') {
        return Promise.resolve([...mockTasks, newTask]);
      }
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('get_tasks');
    });

    // 打开创建任务模态框
    await act(async () => {
      const addButton = await screen.findByRole('button', { name: /New Task/ });
      fireEvent.click(addButton);
    });

    // 填写表单
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('请输入任务标题'), {
        target: { value: '新任务' },
      });
      fireEvent.change(screen.getByPlaceholderText('请输入任务描述'), {
        target: { value: '测试任务描述' },
      });
    });

    // 提交表单
    await act(async () => {
      fireEvent.click(screen.getByText('确 定'));
    });

    // 验证API调用
    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('create_task', expect.any(Object));
      expect(message.success).toHaveBeenCalledWith('任务已创建');
    });
  });

  it('应该处理加载失败的情况', async () => {
    // 模拟API调用失败
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (invoke as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('get_tasks');
    });

    // 验证错误提示是否显示
    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('数据加载失败');
    });

    consoleErrorSpy.mockRestore();
  });
});