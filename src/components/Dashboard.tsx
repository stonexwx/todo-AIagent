import React, { useState, useEffect } from 'react';
import StatisticsCard from './common/StatisticsCard';
import QuadrantStats from './common/QuadrantStats';
import BaseButton from './common/BaseButton';
import BaseCard from './common/BaseCard';
import BaseCalendar from "./common/BaseCalendar";

import Message from "./common/Message";
import BaseForm from "./common/BaseForm";
import BaseModal from "./common/BaseModal";
import BaseInput from "./common/BaseInput";
import BaseTextArea from "./common/BaseTextArea";
import BaseSelect from "./common/BaseSelect";
import { FireIcon, CheckCircleIcon, ClockIcon } from "@/assets/custom-icons";
import dayjs from "dayjs";

import { invoke } from "@tauri-apps/api/core";

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
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month" | "year">(
    "week"
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [form] = BaseForm.useForm();

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
      Message.success("任务已创建");

      setModalVisible(false);
    } catch (error) {
      console.error("保存任务时出错:", error);
      Message.error("保存任务失败，请稍后重试");
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
        Message.error("数据加载失败");

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

    switch (activeTab) {
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

  // 获取统计数据
  const getStats = () => {
    const filteredTasks = getFilteredTasks();
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(
      (task) => task.status === "completed"
    ).length;
    const pending = filteredTasks.filter(
      (task) => task.status === "pending"
    ).length;
    const cancelled = filteredTasks.filter(
      (task) => task.status === "cancelled"
    ).length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    const quadrant1 = filteredTasks.filter(
      (task) => task.quadrant === 1
    ).length;
    const quadrant2 = filteredTasks.filter(
      (task) => task.quadrant === 2
    ).length;
    const quadrant3 = filteredTasks.filter(
      (task) => task.quadrant === 3
    ).length;
    const quadrant4 = filteredTasks.filter(
      (task) => task.quadrant === 4
    ).length;

    return {
      total,
      completed,
      pending,
      cancelled,
      completionRate,
      quadrant1,
      quadrant2,
      quadrant3,
      quadrant4,
    };
  };

  // 获取日历标记数据
  const getMarkedDates = () => {
    return tasks.reduce((acc, task) => {
      const dateStr = dayjs(task.createdAt).format("YYYY-MM-DD");
      return { ...acc, [dateStr]: task.status };
    }, {});
  };

  // 处理日期选择
  const handleDateChange = (date: dayjs.Dayjs) => {
    setSelectedDate(date);
  };

  const stats = getStats();

  // 渲染任务日历
  const getCalendarData = (value: dayjs.Dayjs) => {
    const dateStr = value.format("YYYY-MM-DD");
    const dayTasks = tasks.filter((task) => {
      const taskDate = dayjs(task.createdAt).format("YYYY-MM-DD");
      return taskDate === dateStr;
    });

    return dayTasks;
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
              variant="surface"
              className="hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div
                    className={`text-medium ${
                      task.status === "completed" ? "line-through" : ""
                    } ${task.status === "cancelled" ? "text-gray-500" : ""}`}
                  >
                    {task.title}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {dayjs(task.createdAt).format("YYYY-MM-DD HH:mm")}
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

  return (
    <div className="dashboard-container p-6">
      <div className="flex gap-4 mb-6">
        {["day", "week", "month", "year"].map((tab) => (
          <BaseButton
            key={tab}
            variant={activeTab === tab ? "primary" : "secondary"}
            size="md"
            onClick={() => setActiveTab(tab as typeof activeTab)}
          >
            {{ day: "日", week: "周", month: "月", year: "年" }[tab]}
          </BaseButton>
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

      {/* 四象限统计 */}
      <BaseCard variant="surface" className="mb-6">
        <QuadrantStats
          quadrantCounts={[
            stats.quadrant1,
            stats.quadrant2,
            stats.quadrant3,
            stats.quadrant4,
          ]}
        />
      </BaseCard>

      {/* 最近任务列表 */}
      {renderRecentTasks()}

      {/* 任务日历 */}
      <BaseCard variant="surface" className="mb-6">
        <BaseCalendar
          currentDate={selectedDate}
          markedDates={getMarkedDates()}
          onDateClick={handleDateChange}
          tasks={tasks.map((task) => ({
            date: task.createdAt,
            status: task.status,
          }))}
        />
      </BaseCard>

      {/* 任务创建模态框 */}
      <BaseModal
        title="新建任务"
        visible={modalVisible}
        onOk={handleSaveTask}
        onCancel={() => setModalVisible(false)}
      >
        <BaseForm form={form} layout="vertical">
          <BaseForm.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: "请输入任务标题" }]}
          >
            <BaseInput placeholder="请输入任务标题" />
          </BaseForm.Item>

          <BaseForm.Item name="description" label="任务描述">
            <BaseTextArea rows={4} placeholder="请输入任务描述" />
          </BaseForm.Item>

          <BaseForm.Item
            name="quadrant"
            label="所属象限"
            rules={[{ required: true, message: "请选择所属象限" }]}
          >
            <BaseSelect>
              <BaseSelect.Option value={1}>
                第一象限：重要且紧急
              </BaseSelect.Option>
              <BaseSelect.Option value={2}>
                第二象限：重要但不紧急
              </BaseSelect.Option>
              <BaseSelect.Option value={3}>
                第三象限：紧急但不重要
              </BaseSelect.Option>
              <BaseSelect.Option value={4}>
                第四象限：既不重要也不紧急
              </BaseSelect.Option>
            </BaseSelect>
          </BaseForm.Item>

          <BaseForm.Item name="tags" label="标签">
            <BaseInput placeholder="多个标签用逗号分隔" />
          </BaseForm.Item>
        </BaseForm>
      </BaseModal>
      <BaseButton
        data-testid="create-task-button"
        variant="primary"
        onClick={openTaskModal}
      >
        新建任务
      </BaseButton>
    </div>
  );
};


export default Dashboard;