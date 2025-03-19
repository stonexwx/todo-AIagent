import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Tabs, List, Tag, Calendar, Badge, message, Button, Modal, Form, Input, Select } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, FireOutlined, PlusOutlined } from '@ant-design/icons';
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
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const Dashboard: React.FC = () => {
  // 状态管理
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  // 打开任务创建模态框
  const openTaskModal = () => {
    form.resetFields();
    form.setFieldsValue({
      quadrant: 1,
      status: 'pending'
    });
    setModalVisible(true);
  };

  // 保存任务
  const handleSaveTask = async () => {
    try {
      const values = await form.validateFields();
      const { title, description, quadrant, tags } = values;
      
      const tagsArray = tags ? tags.split(',').map((tag: string) => tag.trim()) : [];
      
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
      
      setModalVisible(false);
    } catch (error) {
      console.error('保存任务时出错:', error);
      message.error('保存任务失败，请稍后重试');
    }
  };

  // 从后端获取任务数据
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
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
            },
            {
              id: '3',
              title: '回复邮件',
              description: '回复客户关于产品功能的咨询邮件',
              quadrant: 3,
              createdAt: '2023-01-04T11:00:00Z',
              completedAt: '2023-01-04T11:30:00Z',
              status: 'completed',
              tags: ['工作', '沟通']
            },
            {
              id: '4',
              title: '浏览社交媒体',
              description: '查看Twitter和LinkedIn上的最新动态',
              quadrant: 4,
              createdAt: '2023-01-05T20:00:00Z',
              status: 'cancelled',
              tags: ['休闲']
            },
            {
              id: '5',
              title: '准备客户演示',
              description: '为下周的客户会议准备产品演示',
              quadrant: 1,
              createdAt: '2023-01-06T14:00:00Z',
              status: 'pending',
              tags: ['工作', '演示']
            },
            {
              id: '6',
              title: '健身锻炼',
              description: '进行30分钟的有氧运动和力量训练',
              quadrant: 2,
              createdAt: '2023-01-07T18:00:00Z',
              completedAt: '2023-01-07T19:00:00Z',
              status: 'completed',
              tags: ['健康']
            }
          ];
          
          setTasks(mockTasks);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // 根据时间范围过滤任务
  const getFilteredTasks = () => {
    const now = dayjs();
    let startDate;

    switch (timeFrame) {
      case 'day':
        startDate = now.startOf('day');
        break;
      case 'week':
        startDate = now.subtract(6, 'day').startOf('day');
        break;
      case 'month':
        startDate = now.subtract(29, 'day').startOf('day');
        break;
      case 'year':
        startDate = now.subtract(364, 'day').startOf('day');
        break;
      default:
        startDate = now.subtract(6, 'day').startOf('day');
    }

    return tasks.filter(task => {
      const taskDate = dayjs(task.createdAt);
      return taskDate.isAfter(startDate) || taskDate.isSame(startDate);
    });
  };

  // 获取统计数据
  const getStats = () => {
    const filteredTasks = getFilteredTasks();
    
    const completed = filteredTasks.filter(task => task.status === 'completed').length;
    const pending = filteredTasks.filter(task => task.status === 'pending').length;
    const cancelled = filteredTasks.filter(task => task.status === 'cancelled').length;
    const total = filteredTasks.length;
    
    const quadrant1 = filteredTasks.filter(task => task.quadrant === 1).length;
    const quadrant2 = filteredTasks.filter(task => task.quadrant === 2).length;
    const quadrant3 = filteredTasks.filter(task => task.quadrant === 3).length;
    const quadrant4 = filteredTasks.filter(task => task.quadrant === 4).length;
    
    return {
      completed,
      pending,
      cancelled,
      total,
      quadrant1,
      quadrant2,
      quadrant3,
      quadrant4,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  // 渲染任务日历
  const getCalendarData = (value: dayjs.Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayTasks = tasks.filter(task => {
      const taskDate = dayjs(task.createdAt).format('YYYY-MM-DD');
      return taskDate === dateStr;
    });
    
    return dayTasks;
  };

  const dateCellRender = (value: dayjs.Dayjs) => {
    const listData = getCalendarData(value);
    
    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {listData.map(item => (
          <li key={item.id} style={{ 
            textOverflow: 'ellipsis', 
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            fontSize: '12px',
            color: item.status === 'completed' ? '#52c41a' : 
                  item.status === 'cancelled' ? '#f5222d' : '#1890ff'
          }}>
            <Badge 
              status={item.status === 'completed' ? 'success' : 
                     item.status === 'cancelled' ? 'error' : 'processing'} 
              text={item.title} 
            />
          </li>
        ))}
      </ul>
    );
  };

  // 切换时间范围
  const handleTimeFrameChange = (key: string) => {
    setTimeFrame(key as 'day' | 'week' | 'month' | 'year');
  };

  // 渲染最近任务列表
  const renderRecentTasks = () => {
    const recentTasks = [...tasks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    return (
      <List
        itemLayout="horizontal"
        dataSource={recentTasks}
        renderItem={task => (
          <List.Item>
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
                  <div>象限: {[
                    '重要且紧急', 
                    '重要但不紧急', 
                    '紧急但不重要', 
                    '既不重要也不紧急'
                  ][task.quadrant - 1]}</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                    创建: {dayjs(task.createdAt).format('YYYY-MM-DD HH:mm')}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  const stats = getStats();

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>数据看板</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={openTaskModal}
        >
          快速添加任务
        </Button>
      </div>
      
      <Tabs defaultActiveKey="week" onChange={handleTimeFrameChange}>
        <TabPane tab="日" key="day" />
        <TabPane tab="周" key="week" />
        <TabPane tab="月" key="month" />
        <TabPane tab="年" key="year" />
      </Tabs>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic 
              title="总任务数" 
              value={stats.total} 
              prefix={<FireOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic 
              title="已完成" 
              value={stats.completed} 
              prefix={<CheckCircleOutlined />} 
              valueStyle={{ color: '#3f8600' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic 
              title="进行中" 
              value={stats.pending} 
              prefix={<ClockCircleOutlined />} 
              valueStyle={{ color: '#1890ff' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic 
              title="完成率" 
              value={stats.completionRate} 
              suffix="%" 
              precision={0} 
              valueStyle={{ color: '#3f8600' }} 
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card title="四象限分布">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic 
                  title="重要且紧急" 
                  value={stats.quadrant1} 
                  valueStyle={{ color: '#cf1322' }} 
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="重要但不紧急" 
                  value={stats.quadrant2} 
                  valueStyle={{ color: '#1890ff' }} 
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="紧急但不重要" 
                  value={stats.quadrant3} 
                  valueStyle={{ color: '#faad14' }} 
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="既不重要也不紧急" 
                  value={stats.quadrant4} 
                  valueStyle={{ color: '#52c41a' }} 
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card title="最近任务">
            {renderRecentTasks()}
          </Card>
        </Col>
      </Row>
      
      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="任务日历">
            <Calendar fullscreen={false} dateCellRender={dateCellRender} />
          </Card>
        </Col>
      </Row>
      <Modal
        title={'新建任务'}
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

export default Dashboard;