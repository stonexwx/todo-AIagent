import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { invoke } from '@tauri-apps/api/core';
import { t } from 'i18next';

// 自定义图标组件
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 任务类型定义
interface Task {
  id: string;
  title: string;
  description: string;
  quadrant: number; // 1-4 表示四象限
  createdAt: string;
  completedAt?: string;
  status: 'pending' | 'completed' | 'cancelled';
  tags?: string[];
}

const QuadrantTasks: React.FC = () => {
  // 状态管理
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = useState<{
    getFieldValue: (field: string) => any;
    setFieldsValue: (values: any) => void;
    resetFields: () => void;
    validateFields: () => Promise<any>;
  }>(() => ({
    getFieldValue: () => '',
    setFieldsValue: () => {},
    resetFields: () => {},
    validateFields: async () => ({}),
  }));

  const [saving, setSaving] = useState(false);

  // 从后端获取任务数据
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // 调用Tauri后端API获取任务数据
        const tasks = await invoke<Task[]>('get_tasks');
        setTasks(tasks);
      } catch (error) {
        console.error('获取任务数据时出错:', error);
        showMessage('无法从后端获取任务数据，请稍后重试', 'error');
      }
    };

    fetchTasks();
  }, []);

  // 按象限分组任务
  const getTasksByQuadrant = (quadrant: number) => {
    return tasks.filter(task => task.quadrant === quadrant);
  };

  // 获取状态名称
  const getStatusName = (status: string) => {
    switch (status) {
      case 'pending':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return '未知';
    }
  };

  // 获取状态样式类名
  const getStatusClassName = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  // 打开任务编辑模态框
  const openTaskModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        quadrant: task.quadrant,
        status: task.status,
        tags: task.tags?.join(', ')
      });
    } else {
      setEditingTask(null);
      form.resetFields();
      form.setFieldsValue({
        quadrant: 1,
        status: 'pending'
      });
    }
    setModalVisible(true);
  };

  // 显示消息提示
  const showMessage = (content: string, type: 'success' | 'error') => {
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = content;
    document.body.appendChild(messageElement);

    setTimeout(() => {
      messageElement.classList.add('message-fade-out');
      setTimeout(() => document.body.removeChild(messageElement), 300);
    }, 3000);
  };

  const [saving, setSaving] = useState(false);

  // 保存任务
  const handleSaveTask = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      const { title, description, quadrant, status, tags } = values;
      
      const tagsArray = tags ? tags.split(',').map((tag: string) => tag.trim()) : [];
      
      if (editingTask) {
        // 更新任务
        await invoke('update_task', {
          id: editingTask.id,
          title,
          description,
          quadrant,
          status,
          tags: tagsArray
        });
        
        // 重新获取任务列表
        const updatedTasks = await invoke<Task[]>('get_tasks');
        setTasks(updatedTasks);
        showMessage('任务已更新', 'success');
      } else {
        // 创建新任务
        await invoke('create_task', {
          title,
          description,
          quadrant,
          tags: tagsArray
        });
        
        // 重新获取任务列表
        const updatedTasks = await invoke<Task[]>('get_tasks');
        setTasks(updatedTasks);
        showMessage('任务已创建', 'success');
      }
      
      setModalVisible(false);
    } catch (error) {
      console.error('保存任务时出错:', error);
      showMessage('保存任务失败，请稍后重试', 'error');
    }
  };

  // 删除任务
  const handleDeleteTask = async (taskId: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      try {
        await invoke('delete_task', { id: taskId });
        
        // 重新获取任务列表
        const updatedTasks = await invoke<Task[]>('get_tasks');
        setTasks(updatedTasks);
        showMessage('任务已删除', 'success');
      } catch (error) {
        console.error('删除任务时出错:', error);
        showMessage('删除任务失败，请稍后重试', 'error');
      }
    }
  };

  // 完成任务
  const handleCompleteTask = async (taskId: string) => {
    try {
      await invoke('complete_task', { id: taskId });
      
      // 重新获取任务列表
      const updatedTasks = await invoke<Task[]>('get_tasks');
      setTasks(updatedTasks);
      showMessage('任务已完成', 'success');
    } catch (error) {
      console.error('完成任务时出错:', error);
      showMessage('完成任务失败，请稍后重试', 'error');
    }
  };

  // 渲染任务列表
  const renderTaskList = (quadrant: number, title: string) => {
    const quadrantTasks = getTasksByQuadrant(quadrant);
    
    return (
      <div className="task-card">
        <div className="card-header">
          <h4 className="card-title">{title}</h4>
          <button 
            className="button button-icon" 
            onClick={() => openTaskModal({ quadrant } as any)}
          >
            <PlusIcon />
          </button>
        </div>
        <div className="task-list">
          {quadrantTasks.map(task => (
            <div key={task.id} className="task-item">
              <div className="task-content">
                <h3 className="task-title">{task.title}</h3>
                <p className="task-description">{task.description}</p>
                <div className="task-tags">
                  {task.tags?.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="task-meta">
                <span className={`badge ${getStatusClassName(task.status)}`}>
                  {getStatusName(task.status)}
                </span>
                <div className="task-actions">
                  {task.status === 'pending' && (
                    <button
                      className="button button-icon"
                      onClick={() => handleCompleteTask(task.id)}
                      title={t("actions.complete_task")}
                    >
                      <CheckIcon />
                    </button>
                  )}
                  <button
                    className="button button-icon"
                    onClick={() => openTaskModal(task)}
                    title={t("actions.edit_task")}
                  >
                    <EditIcon />
                  </button>
                  <button
                    className="button button-icon"
                    onClick={() => handleDeleteTask(task.id)}
                    title={t("actions.delete_task")}
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="task-grid-container">
      <div className="grid">
        <div className="col">
          <div className="row">
            {renderTaskList(1, '重要且紧急')}
          </div>
          <div className="row">
            {renderTaskList(3, '紧急但不重要')}
          </div>
        </div>
        <div className="col">
          <div className="row">
            {renderTaskList(2, '重要但不紧急')}
          </div>
          <div className="row">
            {renderTaskList(4, '既不重要也不紧急')}
          </div>
        </div>
      </div>

      {modalVisible && (
        <div className="modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingTask ? '编辑任务' : '新建任务'}</h2>
              <button
                className="modal-close"
                onClick={() => setModalVisible(false)}
              >
                ×
              </button>
            </div>
            <form className="form" onSubmit={e => { e.preventDefault(); handleSaveTask(); }}>
              <div className="form-item">
                <label className="form-label">{t("form.title")}</label>
                <input
                  className="form-input"
                  value={form.getFieldValue('title') || ''}
                  onChange={e => form.setFieldsValue({ title: e.target.value })}
                  placeholder={t("form.title_placeholder")}
                  required
                />
              </div>

              <div className="form-item">
                <label className="form-label">{t("form.description")}</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={form.getFieldValue('description') || ''}
                  onChange={e => form.setFieldsValue({ description: e.target.value })}
                  placeholder={t("form.description_placeholder")}
                />
              </div>

              <div className="form-item">
                <label className="form-label">{t("form.quadrant")}</label>
                <select
                  className="form-select"
                  value={form.getFieldValue('quadrant') || 1}
                  onChange={e => form.setFieldsValue({ quadrant: Number(e.target.value) })}
                  required
                >
                  <option value={1}>{t("quadrant.urgent_important")}</option>
                  <option value={2}>{t("quadrant.important_not_urgent")}</option>
                  <option value={3}>{t("quadrant.urgent_not_important")}</option>
                  <option value={4}>{t("quadrant.not_urgent_not_important")}</option>
                </select>
              </div>

              <div className="form-item">
                <label className="form-label">任务状态</label>
                <select
                  className="form-select"
                  value={form.getFieldValue('status') || 'pending'}
                  onChange={e => form.setFieldsValue({ status: e.target.value })}
                  required
                >
                  <option value="pending">{t("status.pending")}</option>
                  <option value="completed">{t("status.completed")}</option>
                  <option value="cancelled">{t("status.cancelled")}</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setModalVisible(false)}
                >
                  {t("actions.cancel")}
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={saving}
                >
                  {t("actions.save_task")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };
};

export default QuadrantTasks;