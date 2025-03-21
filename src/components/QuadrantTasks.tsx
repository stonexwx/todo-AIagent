import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { t } from "i18next";
import BaseCard from "./common/BaseCard";
import BaseButton from "./common/BaseButton";

import {
  PlusIcon,
  EditIcon,
  DeleteIcon,
  CheckIcon,
} from "@/assets/custom-icons";

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

const QuadrantTasks: React.FC = () => {
  // 状态管理
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = useState<{
    getFieldValue: (field: string) => any;
    setFieldsValue: (values: any) => void;
    resetFields: () => void;
    validateFields: () => Promise<any>;
  }>(() => ({
    getFieldValue: () => "",
    setFieldsValue: () => {},
    resetFields: () => {},
    validateFields: async () => ({}),
  }));

  // 从后端获取任务数据
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // 调用Tauri后端API获取任务数据
        const tasks = await invoke<Task[]>("get_tasks");
        setTasks(tasks);
      } catch (error) {
        console.error("获取任务数据时出错:", error);
        showMessage("无法从后端获取任务数据，请稍后重试", "error");
      }
    };

    fetchTasks();
  }, []);

  // 按象限分组任务
  const getTasksByQuadrant = (quadrant: number) => {
    return tasks.filter((task) => task.quadrant === quadrant);
  };

  // 获取状态名称
  const getStatusName = (status: string) => {
    switch (status) {
      case "pending":
        return "进行中";
      case "completed":
        return "已完成";
      case "cancelled":
        return "已取消";
      default:
        return "未知";
    }
  };

  // 获取状态样式类名
  const getStatusClassName = (status: string) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
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
        tags: task.tags?.join(", "),
      });
    } else {
      setEditingTask(null);
      form.resetFields();
      form.setFieldsValue({
        quadrant: 1,
        status: "pending",
      });
    }
    setModalVisible(true);
  };

  // 显示消息提示
  const showMessage = (content: string, type: "success" | "error") => {
    const messageElement = document.createElement("div");
    messageElement.className = `message message-${type}`;
    messageElement.textContent = content;
    document.body.appendChild(messageElement);

    setTimeout(() => {
      messageElement.classList.add("message-fade-out");
      setTimeout(() => document.body.removeChild(messageElement), 300);
    }, 3000);
  };

  // 保存任务
  const handleSaveTask = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      setModalVisible(true);
      const { title, description, quadrant, status, tags } = values;

      const tagsArray = tags
        ? tags.split(",").map((tag: string) => tag.trim())
        : [];

      if (editingTask) {
        // 更新任务
        await invoke("update_task", {
          id: editingTask.id,
          title,
          description,
          quadrant,
          status,
          tags: tagsArray,
        });

        // 重新获取任务列表
        const updatedTasks = await invoke<Task[]>("get_tasks");
        setTasks(updatedTasks);
        showMessage("任务已更新", "success");
      } else {
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
        showMessage("任务已创建", "success");
      }

      setModalVisible(false);
    } catch (error) {
      console.error("保存任务时出错:", error);
      showMessage("保存任务失败，请稍后重试", "error");
    }
  };

  // 删除任务
  const handleDeleteTask = async (taskId: string) => {
    if (confirm("确定要删除这个任务吗？")) {
      try {
        await invoke("delete_task", { id: taskId });

        // 重新获取任务列表
        const updatedTasks = await invoke<Task[]>("get_tasks");
        setTasks(updatedTasks);
        showMessage("任务已删除", "success");
      } catch (error) {
        console.error("删除任务时出错:", error);
        showMessage("删除任务失败，请稍后重试", "error");
      }
    }
  };

  // 完成任务
  const handleCompleteTask = async (taskId: string) => {
    try {
      await invoke("complete_task", { id: taskId });

      // 重新获取任务列表
      const updatedTasks = await invoke<Task[]>("get_tasks");
      setTasks(updatedTasks);
      showMessage("任务已完成", "success");
    } catch (error) {
      console.error("完成任务时出错:", error);
      showMessage("完成任务失败，请稍后重试", "error");
    }
  };

  // 渲染任务列表
  const renderTaskList = (quadrant: number, title: string) => {
    const quadrantTasks = getTasksByQuadrant(quadrant);

    return (
      <BaseCard title={title}>
        <div className="flex justify-end mb-4">
          <BaseButton
            variant="primary"
            onClick={() => openTaskModal({ quadrant } as any)}
          >
            <PlusIcon />
          </BaseButton>
        </div>
        <div className="task-list">
          {quadrantTasks.map((task) => (
            <div key={task.id} className="task-item">
              <div className="task-content">
                <h3 className="task-title">{task.title}</h3>
                <p className="task-description">{task.description}</p>
                <div className="task-tags">
                  {task.tags?.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="task-meta">
                <span className={`badge ${getStatusClassName(task.status)}`}>
                  {getStatusName(task.status)}
                </span>
                <div className="task-actions">
                  {task.status === "pending" && (
                    <BaseButton
                      variant="primary"
                      onClick={() => handleCompleteTask(task.id)}
                      aria-label="完成任务"
                    >
                      <CheckIcon />
                    </BaseButton>
                  )}
                  <BaseButton
                    variant="primary"
                    onClick={() => openTaskModal(task)}
                    aria-label={t("actions.edit_task")}
                  >
                    <EditIcon />
                  </BaseButton>
                  <BaseButton
                    variant="primary"
                    onClick={() => handleDeleteTask(task.id)}
                    aria-label="删除任务"
                  >
                    <DeleteIcon />
                  </BaseButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </BaseCard>
    );
  };

  return (
    <div className="quadrant-container">
      <div className="quadrant-grid">
        {[1, 2, 3, 4].map((quadrant) =>
          renderTaskList(quadrant, `象限 ${quadrant}`)
        )}
      </div>
      {modalVisible && (
        <div className="modal">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveTask();
            }}
          >
            <div className="form-group">
              <label htmlFor="title">标题</label>
              <input
                id="title"
                value={form.getFieldValue("title")}
                onChange={(e) => form.setFieldsValue({ title: e.target.value })}
                placeholder="请输入任务标题"
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">描述</label>
              <textarea
                id="description"
                value={form.getFieldValue("description")}
                onChange={(e) =>
                  form.setFieldsValue({ description: e.target.value })
                }
                placeholder="请输入任务描述"
              />
            </div>
            <div className="form-group">
              <label htmlFor="quadrant">象限</label>
              <select
                id="quadrant"
                value={form.getFieldValue("quadrant")}
                onChange={(e) =>
                  form.setFieldsValue({ quadrant: parseInt(e.target.value) })
                }
              >
                {[1, 2, 3, 4].map((q) => (
                  <option key={q} value={q}>
                    象限 {q}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="tags">标签</label>
              <input
                id="tags"
                value={form.getFieldValue("tags")}
                onChange={(e) => form.setFieldsValue({ tags: e.target.value })}
                placeholder="使用逗号分隔多个标签"
              />
            </div>
            <div className="form-actions">
              <BaseButton
                variant="secondary"
                onClick={() => setModalVisible(false)}
              >
                取消
              </BaseButton>
              <BaseButton
                variant="primary"
                onClick={handleSaveTask}
                disabled={saving}
              >
                {saving ? "保存中..." : "保存"}
              </BaseButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default QuadrantTasks;
