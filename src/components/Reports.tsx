import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import dayjs from "dayjs";
import BaseRadio from "./common/BaseRadio";
import BaseDropdown from "./common/BaseDropdown";
import BaseSpinner from "./common/BaseSpinner";
import BaseButton from "./common/BaseButton";
import BaseCard from "./common/BaseCard";
import BaseInput from "./common/BaseInput";
import BaseDateCell from "./common/BaseDateCell";
import { message } from "./common/Message";
import { Tabs as BaseTabs, Tab, TabPanel } from "./common/BaseTabs";
import {
  FireIcon,
  ChartPieIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@/assets/custom-icons";

interface Task {
  id: string;
  title: string;
  description: string;
  quadrant: number;
  createdAt: string;
  completedAt?: string;
  status: "pending" | "completed" | "cancelled";
  tags?: string[];
}

type ReportType = "daily" | "weekly" | "monthly" | "yearly" | "custom";
type ReportFormat = "text" | "chart";

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>("weekly");
  const [reportFormat, setReportFormat] = useState<ReportFormat>("text");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [reportContent, setReportContent] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [aiModel, setAiModel] = useState<string>("gpt-3.5-turbo");

  useEffect(() => {
    const today = dayjs();
    switch (reportType) {
      case "daily":
        setDateRange([today, today]);
        break;
      case "weekly":
        setDateRange([today.subtract(6, "day"), today]);
        break;
      case "monthly":
        setDateRange([today.subtract(29, "day"), today]);
        break;
      case "yearly":
        setDateRange([today.subtract(364, "day"), today]);
        break;
      default:
        setDateRange(null);
    }
  }, [reportType]);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("openai_api_key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }

    const storedModel = localStorage.getItem("ai_model");
    if (storedModel) {
      setAiModel(storedModel);
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const tasks = await invoke<Task[]>("get_tasks");
      return tasks;
    } catch (error) {
      console.error("获取任务数据时出错:", error);
      message.error("无法从后端获取任务数据，请稍后重试");

      if (process.env.NODE_ENV === "development") {
        console.warn("使用模拟数据作为后备");
        return [
          {
            id: "1",
            title: "完成项目报告",
            description: "编写第一季度项目进展报告",
            quadrant: 1,
            createdAt: "2023-01-01T10:00:00Z",
            completedAt: "2023-01-02T15:30:00Z",
            status: "completed" as const,
            tags: ["工作", "文档"],
          },
          {
            id: "2",
            title: "学习React新特性",
            description: "学习React 18的新功能和API",
            quadrant: 2,
            createdAt: "2023-01-03T09:00:00Z",
            status: "pending" as const,
            tags: ["学习", "技术"],
          },
        ] as Task[];
      }
      return [];
    }
  };

  const generateReport = async () => {
    if (!dateRange) {
      message.error("请选择日期范围");
      return;
    }

    if (!apiKey) {
      message.error("请在设置中配置OpenAI API密钥");
      return;
    }

    setLoading(true);
    try {
      const tasks = await fetchTasks();
      const startDate = dateRange[0].startOf("day");
      const endDate = dateRange[1].endOf("day");

      const filteredTasks = (tasks as Task[]).filter((task) => {
        const createdDate = dayjs(task.createdAt);
        return createdDate.isAfter(startDate) && createdDate.isBefore(endDate);
      });

      if (filteredTasks.length === 0) {
        message.info("所选时间范围内没有任务记录");
        setLoading(false);
        return;
      }

      const prompt = generatePromptForAI(filteredTasks, reportType);
      const response = await callOpenAI(prompt);
      setReportContent(response);
    } catch (error) {
      console.error("生成报告时出错:", error);
      message.error("生成报告失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const generatePromptForAI = (tasks: Task[], type: ReportType): string => {
    const quadrantNames = [
      "重要且紧急",
      "重要但不紧急",
      "紧急但不重要",
      "既不重要也不紧急",
    ];

    let taskSummary = tasks
      .map((task) => {
        return `- 任务: ${task.title}\n  描述: ${task.description}\n  象限: ${
          quadrantNames[task.quadrant - 1]
        }\n  状态: ${
          task.status === "completed"
            ? "已完成"
            : task.status === "pending"
            ? "进行中"
            : "已取消"
        }\n  创建时间: ${dayjs(task.createdAt).format("YYYY-MM-DD HH:mm")}${
          task.completedAt
            ? `\n  完成时间: ${dayjs(task.completedAt).format(
                "YYYY-MM-DD HH:mm"
              )}`
            : ""
        }`;
      })
      .join("\n\n");

    let timeFrame;
    switch (type) {
      case "daily":
        timeFrame = "日";
        break;
      case "weekly":
        timeFrame = "周";
        break;
      case "monthly":
        timeFrame = "月";
        break;
      case "yearly":
        timeFrame = "年";
        break;
      default:
        timeFrame = "自定义时间段";
    }

    return `请根据以下任务列表，生成一份详细的${timeFrame}工作报告。报告应包括：

1. 总体工作概述
2. 按四象限分类的任务完成情况
3. 工作效率分析
4. 时间管理建议
5. 下一阶段工作重点建议

任务列表：
${taskSummary}

请用中文撰写，语言专业简洁，格式清晰。`;
  };

  const callOpenAI = async (prompt: string): Promise<string> => {
    try {
      const response = await invoke<string>("generate_report", {
        api_key: apiKey,
        model: aiModel,
        prompt: prompt,
      });
      return response;
    } catch (error) {
      console.error("调用OpenAI API时出错:", error);
      throw error;
    }
  };

  const downloadReport = () => {
    if (!reportContent) {
      message.error("请先生成报告");
      return;
    }

    const element = document.createElement("a");
    const file = new Blob([reportContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);

    const reportDate = dateRange
      ? `${dateRange[0].format("YYYYMMDD")}-${dateRange[1].format("YYYYMMDD")}`
      : dayjs().format("YYYYMMDD");

    element.download = `工作报告_${reportDate}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="p-4">
      <BaseCard
        title="工作报告生成"
        icon={<ChartPieIcon className="w-6 h-6" />}
      >
        <BaseTabs defaultActiveTab="1">
          <Tab tabId="1" aria-label="报告生成">
            <span>
              <FireIcon className="inline-block w-4 h-4 mr-2" />
              报告生成
            </span>
          </Tab>
          <Tab tabId="2" aria-label="设置">
            <span>
              <ClockIcon className="inline-block w-4 h-4 mr-2" />
              设置
            </span>
          </Tab>
          <TabPanel id="1">
            <div className="space-y-4">
              <div>
                <BaseRadio.Group
                  value={reportType}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setReportType(e.target.value as ReportType)
                  }
                  className="mb-4"
                >
                  <BaseRadio.Button value="daily">日报</BaseRadio.Button>
                  <BaseRadio.Button value="weekly">周报</BaseRadio.Button>
                  <BaseRadio.Button value="monthly">月报</BaseRadio.Button>
                  <BaseRadio.Button value="yearly">年报</BaseRadio.Button>
                  <BaseRadio.Button value="custom">自定义</BaseRadio.Button>
                </BaseRadio.Group>

                {reportType === "custom" && (
                  <div className="mt-2">
                    <div className="flex gap-2">
                      <BaseDateCell
                        date={dayjs()}
                        value={startDate}
                        onChange={setStartDate}
                        maxDate={endDate || dayjs()}
                        placeholder="开始日期"
                      />
                      <BaseDateCell
                        date={dayjs()}
                        value={endDate}
                        onChange={setEndDate}
                        minDate={startDate}
                        placeholder="结束日期"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <BaseRadio.Group
                  value={reportFormat}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setReportFormat(e.target.value as ReportFormat)
                  }
                  className="mb-4"
                >
                  <BaseRadio.Button value="text">文本格式</BaseRadio.Button>
                  <BaseRadio.Button value="chart">图表格式</BaseRadio.Button>
                </BaseRadio.Group>
              </div>

              <div className="flex space-x-2">
                <BaseButton
                  onClick={generateReport}
                  loading={loading}
                  icon={<ClockIcon className="w-4 h-4" />}
                >
                  生成报告
                </BaseButton>
                {reportContent && (
                  <BaseButton
                    onClick={downloadReport}
                    icon={<CheckCircleIcon className="w-4 h-4" />}
                  >
                    下载报告
                  </BaseButton>
                )}
              </div>

              {loading && (
                <div className="flex justify-center items-center py-4">
                  <BaseSpinner />
                </div>
              )}

              {reportContent && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                  {reportContent}
                </div>
              )}
            </div>
          </TabPanel>
          <TabPanel id="2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OpenAI API Key
                </label>
                <BaseInput
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    localStorage.setItem("openai_api_key", e.target.value);
                  }}
                  placeholder="请输入您的OpenAI API密钥"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI 模型
                </label>
                <BaseDropdown
                  value={aiModel}
                  onChange={(value: string | number) => {
                    setAiModel(value.toString());
                    localStorage.setItem("ai_model", value.toString());
                  }}
                  className="w-full"
                >
                  <BaseDropdown.Option value="gpt-3.5-turbo">
                    GPT-3.5-Turbo
                  </BaseDropdown.Option>
                  <BaseDropdown.Option value="gpt-4">GPT-4</BaseDropdown.Option>
                </BaseDropdown>
              </div>
            </div>
          </TabPanel>
        </BaseTabs>
      </BaseCard>
    </div>
  );
};

export default Reports;
