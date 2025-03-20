import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import dayjs from 'dayjs';
import { Task } from '../components/Dashboard';

export const useTaskData = (activeTab: 'day' | 'week' | 'month' | 'year') => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const data = await invoke<Task[]>('get_tasks');
        setTasks(data);
        setError('');
      } catch (err) {
        console.error('任务获取失败:', err);
        setError('数据加载失败，请检查网络连接');
        if (process.env.NODE_ENV === 'development') {
          setTasks(require('../mock/tasks.json'));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const getFilteredTasks = () => {
    const now = dayjs();
    let startDate = now.startOf('day');

    switch (activeTab) {
      case 'day': startDate = now.startOf('day'); break;
      case 'week': startDate = now.subtract(6, 'day').startOf('day'); break;
      case 'month': startDate = now.subtract(29, 'day').startOf('day'); break;
      case 'year': startDate = now.subtract(364, 'day').startOf('day'); break;
    }

    return tasks.filter(task => 
      dayjs(task.createdAt).isAfter(startDate) || 
      dayjs(task.createdAt).isSame(startDate)
    );
  };

  const getStats = (filteredTasks: Task[]) => ({
    completed: filteredTasks.filter(t => t.status === 'completed').length,
    pending: filteredTasks.filter(t => t.status === 'pending').length,
    total: filteredTasks.length,
    completionRate: filteredTasks.length > 0 
      ? Math.round((filteredTasks.filter(t => t.status === 'completed').length / filteredTasks.length) * 100)
      : 0,
    quadrantCounts: [1,2,3,4].map(q => 
      filteredTasks.filter(t => t.quadrant === q).length
    )
  });

  return {
    tasks,
    loading,
    error,
    getFilteredTasks,
    getStats
  };
};