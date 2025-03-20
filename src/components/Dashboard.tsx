import React, { useState } from 'react';
import { useTaskData } from '../hooks/useTaskData';
import StatisticsCard from './common/StatisticsCard';
import QuadrantStats from './common/QuadrantStats';
import {
  DashboardIcon,
  CalendarIcon,
  ChartIcon,
  DocumentIcon,
} from "../assets/custom-icons";
import dayjs from "dayjs";
import { invoke } from "@tauri-apps/api/core";
import BaseButton from './common/BaseButton';
import BaseCard from './common/BaseCard';

// 任务类型定义
interface Task {
  id: string;
  title: string;
  description: string;
  quadrant: number; // 1-4 表示四象限
  createdAt: string;
  completedAt?: string;
  status: "pending" | "completed" | "cancelled";
  tags?: string[];
}



const Dashboard: React.FC = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month" | "year">("week");
  const { tasks, loading, getFilteredTasks, getStats } = useTaskData(activeTab);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  // 打开任务创建模态框
  const openTaskModal = () => {
    form.resetFields();
    form.setFieldsValue({
      quadrant: 1,
      status: "pending",
    });
    setModalVisible(true);
  };

  // 保存任务
  const handleSaveTask = async () => {
    try {
      const values = await form.validateFields();
      const { title, description, quadrant, tags } = values;

      const tagsArray = tags
        ? tags.split(",").map((tag: string) => tag.trim())
        : [];

      // 创建新任务
      await invoke("create_task", {
        title,
        description,
        quadrant,
        tags: tagsArray,
      });

      // 重新获取任务列表
      const updatedTasks = await invoke<Task[]>("get_tasks");
      setTasks(updatedTasks);
      message.success("任务已创建");

      setModalVisible(false);
    } catch (error) {
      console.error("保存任务时出错:", error);
      message.error("保存任务失败，请稍后重试");
    }
  };

  // 从后端获取任务数据
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        // 调用Tauri后端API获取任务数据
        const tasks = await invoke<Task[]>("get_tasks");
        setTasks(tasks);
      } catch (error) {
        console.error("获取任务数据时出错:", error);
        message.error({
  content: '数据加载失败',
  description: '请检查网络连接后重试',
  duration: 3
});

        // 在开发环境中使用模拟数据作为后备
        if (process.env.NODE_ENV === "development") {
          const mockTasks: Task[] = [
            {
              id: "1",
              title: "完成项目报告",
              description: "编写第一季度项目进展报告",
              quadrant: 1,
              createdAt: "2023-01-01T10:00:00Z",
              completedAt: "2023-01-02T15:30:00Z",
              status: "completed",
              tags: ["工作", "文档"],
            },
            {
              id: "2",
              title: "学习React新特性",
              description: "学习React 18的新功能和API",
              quadrant: 2,
              createdAt: "2023-01-03T09:00:00Z",
              status: "pending",
              tags: ["学习", "技术"],
            },
            {
              id: "3",
              title: "回复邮件",
              description: "回复客户关于产品功能的咨询邮件",
              quadrant: 3,
              createdAt: "2023-01-04T11:00:00Z",
              completedAt: "2023-01-04T11:30:00Z",
              status: "completed",
              tags: ["工作", "沟通"],
            },
            {
              id: "4",
              title: "浏览社交媒体",
              description: "查看Twitter和LinkedIn上的最新动态",
              quadrant: 4,
              createdAt: "2023-01-05T20:00:00Z",
              status: "cancelled",
              tags: ["休闲"],
            },
            {
              id: "5",
              title: "准备客户演示",
              description: "为下周的客户会议准备产品演示",
              quadrant: 1,
              createdAt: "2023-01-06T14:00:00Z",
              status: "pending",
              tags: ["工作", "演示"],
            },
            {
              id: "6",
              title: "健身锻炼",
              description: "进行30分钟的有氧运动和力量训练",
              quadrant: 2,
              createdAt: "2023-01-07T18:00:00Z",
              completedAt: "2023-01-07T19:00:00Z",
              status: "completed",
              tags: ["健康"],
            },
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
      case "day":
        startDate = now.startOf("day");
        break;
      case "week":
        startDate = now.subtract(6, "day").startOf("day");
        break;
      case "month":
        startDate = now.subtract(29, "day").startOf("day");
        break;
      case "year":
        startDate = now.subtract(364, "day").startOf("day");
        break;
      default:
        startDate = now.subtract(6, "day").startOf("day");
    }

    return tasks.filter((task) => {
      const taskDate = dayjs(task.createdAt);
      return taskDate.isAfter(startDate) || taskDate.isSame(startDate);
    });
  };

  const stats = getStats(getFilteredTasks());

  // 渲染任务日历
  const getCalendarData = (value: dayjs.Dayjs) => {
    const dateStr = value.format("YYYY-MM-DD");
    const dayTasks = tasks.filter((task) => {
      const taskDate = dayjs(task.createdAt).format("YYYY-MM-DD");
      return taskDate === dateStr;
    });

    return dayTasks;
  };

  const [selectedDate, setSelectedDate] = useState(dayjs());

  const handleDateChange = (date: dayjs.Dayjs) => {
    setSelectedDate(date);
  };

  const getMarkedDates = () => {
    return tasks.reduce((acc, task) => {
      const dateStr = dayjs(task.createdAt).format('YYYY-MM-DD');
      return { ...acc, [dateStr]: task.status };
    }, {});
  };

  // 切换时间范围

  // 渲染最近任务列表
  const renderRecentTasks = () => {
    const recentTasks = [...tasks]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  
    return (
      <BaseCard title="最近任务" variant="surface" className="mb-6">
        <div className="grid gap-4">
          {recentTasks.map((task) => (
            <BaseCard
              key={task.id}
              variant="ghost"
              className="hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className={`text-medium ${
                    task.status === 'completed' ? 'line-through' : ''
                  } ${task.status === 'cancelled' ? 'text-gray-500' : ''}`}>
                    {task.title}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {dayjs(task.createdAt).format('YYYY-MM-DD HH:mm')}
                  </div>
                </div>
                <div className="flex gap-2">
                  {task.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </BaseCard>
          ))}
        </div>
      </BaseCard>
    );
  };

  const stats = getStats();

  return (
    <div className="dashboard-container surface-100">
      {/* 时间范围切换 */}
      <div className="flex gap-4 mb-6 timeframe-tabs">
        {['day', 'week', 'month', 'year'].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab as typeof activeTab)}
          >
            {{ day: '日', week: '周', month: '月', year: '年' }[tab]}
          </button>
        ))}
      </div>

      {/* 统计卡片网格 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatisticsCard
          title="总任务数"
          value={stats.total}
          icon={<FireIcon />}
          color="#1890ff"
        />
        <StatisticsCard
          title="完成率"
          value={`${stats.completionRate}%`}
          icon={<CheckCircleIcon />}
          color="#3f8600"
        />
        <StatisticsCard
          title="进行中"
          value={stats.pending}
          icon={<ClockIcon />}
          color="#faad14"
        />
        <StatisticsCard
          title="已取消"
          value={stats.cancelled}
          icon={<ClockIcon />}
          color="#cf1322"
        />
      </div>
      <QuadrantStats quadrantCounts={[
        stats.quadrant1,
        stats.quadrant2,
        stats.quadrant3,
        stats.quadrant4
      ]} />

      {/* 最近任务列表 */}
      <div className="task-list surface-100 p-4 radius-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4">最近任务</h3>
        <div className="flex flex-col gap-3">
          {filteredTasks.slice(0, 5).map((task) => (
            <div key={task.id} className="task-card surface-200 p-3 radius-md hover:surface-300 transition">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium mb-1">{task.title}</h4>
                  <p className="text-secondary text-sm">{task.description}</p>
                </div>
                <span className={`status-badge ${task.status}`}>
                  {{ completed: '完成', pending: '进行中', cancelled: '取消' }[task.status]}
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                {task.tags?.map((tag) => (
                  <span key={tag} className="tag surface-400 text-xs px-2 py-1 radius-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Col xs={24} sm={12} md={6} lg={6} xl={6}>
        <Card className="stats-card">
          <Statistic
            title="已完成"
            value={stats.completed}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: "#3f8600" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6} lg={6} xl={6}>
        <Card className="stats-card">
          <Statistic
            title="进行中"
            value={stats.pending}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: "#1890ff" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6} lg={6} xl={6}>
        <Card className="stats-card">
          <Statistic
            title="完成率"
            value={stats.completionRate}
            suffix="%"
            precision={0}
            valueStyle={{ color: "#3f8600" }}
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
                valueStyle={{ color: "#cf1322" }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="重要但不紧急"
                value={stats.quadrant2}
                valueStyle={{ color: "#1890ff" }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="紧急但不重要"
                value={stats.quadrant3}
                valueStyle={{ color: "#faad14" }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="既不重要也不紧急"
                value={stats.quadrant4}
                valueStyle={{ color: "#52c41a" }}
              />
            </Col>
          </Row>
        </Card>
      </Col>
      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
        <Card title="最近任务">{renderRecentTasks()}</Card>
      </Col>
    </Row>

    <Row style={{ marginTop: 16 }}>
      <Col span={24} className="chart-column">
        <Card title="任务日历">
          <BaseCalendar
            currentDate={selectedDate}
            markedDates={getMarkedDates()}
            onDateClick={handleDateChange}
            className="min-h-[500px] rounded-xl"
          />
        </Card>
      </Col>
    </Row>
    <Modal
      title={"新建任务"}
      open={modalVisible}
      onOk={handleSaveTask}
      onCancel={() => setModalVisible(false)}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="任务标题"
          rules={[{ required: true, message: "请输入任务标题" }]}
        >
          <Input placeholder="请输入任务标题" />
        </Form.Item>

        <Form.Item name="description" label="任务描述">
          <TextArea rows={4} placeholder="请输入任务描述" />
        </Form.Item>

        <Form.Item
          name="quadrant"
          label="所属象限"
          rules={[{ required: true, message: "请选择所属象限" }]}
        >
          <Select>
            <Option value={1}>第一象限：重要且紧急</Option>
            <Option value={2}>第二象限：重要但不紧急</Option>
            <Option value={3}>第三象限：紧急但不重要</Option>
            <Option value={4}>第四象限：既不重要也不紧急</Option>
          </Select>
        </Form.Item>

        <Form.Item name="tags" label="标签">
          <Input placeholder="多个标签用逗号分隔" />
        </Form.Item>
      </Form>
    </Modal>
  </div>
);

export default Dashboard;


// 新增日历组件导入
import BaseCalendar from './common/BaseCalendar';

// 移除旧的日历状态和逻辑
const CalendarSection = () => (
  <BaseCard title="任务日历" variant="surface" className="mb-6">
    <BaseCalendar
      selectedDate={selectedDate}
      onDateChange={(date) => setSelectedDate(date)}
      markedDates={tasks.map(task => dayjs(task.createdAt).format('YYYY-MM-DD'))}
      className="min-h-[400px]"
    />
  </BaseCard>
);

// 更新主布局结构
return (
  <div className="dashboard-container p-6">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <StatsGrid stats={stats} />
        <CalendarSection />
      </div>
      <div className="lg:col-span-1">
        {renderRecentTasks()}
      </div>
    </div>
  </div>
);