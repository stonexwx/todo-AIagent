import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, List, Tag, Button, Modal, Form, Input, Select, DatePicker, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { invoke } from '@tauri-apps/api/core';

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

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const QuadrantTasks: React.FC = () => {
  // 状态管理
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();

  // 从后端获取任务数据
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // 调用Tauri后端API获取任务数据
        const tasks = await invoke<Task[]>('get_tasks');
        setTasks(tasks);
      } catch (error) {
        console.error('获取任务数据时出错:', error);
        message.error('无法从后端获取任务数据，请稍后重试');
        // 在开发环境中使用模拟数据作为后备
        if (process.env.NODE_ENV === 'development') {
          const mockTasks: Task[] = [
            {
              id: '1',
              title: '完成项目报告',
              description: '编写第一季度项目进展报告',
              quadrant: 1,
              createdAt: '2023-01-01T10:00:00Z',
              completedAt: '2023-01-02T15:30:00Z',
              status: 'completed',
              tags: ['工作', '文档']
            },
            {
              id: '2',
              title: '学习React新特性',
              description: '学习React 18的新功能和API',
              quadrant: 2,
              createdAt: '2023-01-03T09:00:00Z',
              status: 'pending',
              tags: ['学习', '技术']
            }
          ];
          setTasks(mockTasks);
        }
      }
    };

    fetchTasks();
  }, []);

  // 按象限分组任务
  const getTasksByQuadrant = (quadrant: number) => {
    return tasks.filter(task => task.quadrant === quadrant);
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

  // 保存任务
  const handleSaveTask = async () => {
    try {
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
        message.success('任务已更新');
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
        message.success('任务已创建');
      }
      
      setModalVisible(false);
    } catch (error) {
      console.error('保存任务时出错:', error);
      message.error('保存任务失败，请稍后重试');
    }
  };

  // 删除任务
  const handleDeleteTask = (taskId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      onOk: async () => {
        try {
          await invoke('delete_task', { id: taskId });
          
          // 重新获取任务列表
          const updatedTasks = await invoke<Task[]>('get_tasks');
          setTasks(updatedTasks);
          message.success('任务已删除');
        } catch (error) {
          console.error('删除任务时出错:', error);
          message.error('删除任务失败，请稍后重试');
        }
      }
    });
  };

  // 完成任务
  const handleCompleteTask = async (taskId: string) => {
    try {
      await invoke('complete_task', { id: taskId });
      
      // 重新获取任务列表
      const updatedTasks = await invoke<Task[]>('get_tasks');
      setTasks(updatedTasks);
      message.success('任务已完成');
    } catch (error) {
      console.error('完成任务时出错:', error);
      message.error('完成任务失败，请稍后重试');
    }
  };

  // 渲染任务列表
  const renderTaskList = (quadrant: number, title: string) => {
    const quadrantTasks = getTasksByQuadrant(quadrant);
    
    return (
      <Card 
        title={<Title level={4}>{title}</Title>}
        extra={<Button type="text" icon={<PlusOutlined />} onClick={() => openTaskModal({ quadrant } as any)} />}
        style={{ height: '100%' }}
      >
        <List
          dataSource={quadrantTasks}
          renderItem={task => (
            <List.Item
              actions={[
                task.status === 'pending' ? (
                  <Button 
                    type="text" 
                    icon={<CheckOutlined />} 
                    onClick={() => handleCompleteTask(task.id)}
                  />
                ) : null,
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => openTaskModal(task)}
                />,
                <Button 
                  type="text" 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleDeleteTask(task.id)}
                />
              ].filter(Boolean)}
            >
              <List.Item.Meta
                title={
                  <div>
                    <Text 
                      style={{
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                        color: task.status === 'cancelled' ? '#999' : 'inherit'
                      }}
                    >
                      {task.title}
                    </Text>
                    {task.tags?.map(tag => (
                      <Tag key={tag} color="blue" style={{ marginLeft: 8 }}>{tag}</Tag>
                    ))}
                  </div>
                }
                description={
                  <div>
                    <div>{task.description}</div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                      创建: {dayjs(task.createdAt).format('YYYY-MM-DD HH:mm')}
                      {task.completedAt && (
                        <span style={{ marginLeft: 8 }}>
                          完成: {dayjs(task.completedAt).format('YYYY-MM-DD HH:mm')}
                        </span>
                      )}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>四象限任务管理</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          {renderTaskList(1, '重要且紧急')}
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          {renderTaskList(2, '重要但不紧急')}
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          {renderTaskList(3, '紧急但不重要')}
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          {renderTaskList(4, '既不重要也不紧急')}
        </Col>
      </Row>

      <Modal
        title={editingTask ? '编辑任务' : '新建任务'}
        open={modalVisible}
        onOk={handleSaveTask}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="任务描述"
          >
            <TextArea rows={4} placeholder="请输入任务描述" />
          </Form.Item>
          
          <Form.Item
            name="quadrant"
            label="所属象限"
            rules={[{ required: true, message: '请选择所属象限' }]}
          >
            <Select>
              <Option value={1}>第一象限：重要且紧急</Option>
              <Option value={2}>第二象限：重要但不紧急</Option>
              <Option value={3}>第三象限：紧急但不重要</Option>
              <Option value={4}>第四象限：既不重要也不紧急</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="任务状态"
            rules={[{ required: true, message: '请选择任务状态' }]}
          >
            <Select>
              <Option value="pending">进行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="标签"
          >
            <Input placeholder="多个标签用逗号分隔" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuadrantTasks;