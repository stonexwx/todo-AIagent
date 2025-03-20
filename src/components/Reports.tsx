import React, { useState, useEffect } from 'react';
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import dayjs from "dayjs";
import { message } from "antd";

// 假设我们有一个任务类型定义
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

// 报告类型
type ReportType = "daily" | "weekly" | "monthly" | "yearly" | "custom";

// 报告格式
type ReportFormat = "text" | "chart";



const Reports: React.FC = () => {
  // 状态管理
  const [reportType, setReportType] = useState<ReportType>('weekly');
  const [reportFormat, setReportFormat] = useState<ReportFormat>('text');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [reportContent, setReportContent] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [aiModel, setAiModel] = useState<string>('gpt-3.5-turbo');

  // 初始化日期范围
  useEffect(() => {
    const today = dayjs();
    switch (reportType) {
      case 'daily':
        setDateRange([today, today]);
        break;
      case 'weekly':
        setDateRange([today.subtract(6, 'day'), today]);
        break;
      case 'monthly':
        setDateRange([today.subtract(29, 'day'), today]);
        break;
      case 'yearly':
        setDateRange([today.subtract(364, 'day'), today]);
        break;
      default:
        setDateRange(null);
    }
  }, [reportType]);

  // 从本地存储获取API密钥
  useEffect(() => {
    const storedApiKey = localStorage.getItem('openai_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    
    const storedModel = localStorage.getItem('ai_model');
    if (storedModel) {
      setAiModel(storedModel);
    }
  }, []);

  // 从Tauri后端获取任务数据
  const fetchTasks = async () => {
    try {
      // 使用Tauri的invoke API调用后端命令获取任务数据
      const tasks = await invoke<Task[]>('get_tasks');
      
      // 返回任务数据
      return tasks;
    } catch (error) {
      // 处理调用错误
      console.error('获取任务数据时出错:', error);
      message.error('无法从后端获取任务数据，请稍后重试');
      
      // 在开发环境中返回模拟数据作为后备
      if (process.env.NODE_ENV === 'development') {
        console.warn('使用模拟数据作为后备');
        return [
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
      }
      
      return [];
    }
  };

  // 生成报告
  const generateReport = async () => {
    if (!dateRange) {
      message.error('请选择日期范围');
      return;
    }

    if (!apiKey) {
      message.error('请在设置中配置OpenAI API密钥');
      return;
    }

    setLoading(true);
    try {
      // 获取任务数据
      const tasks = await fetchTasks();
      
      // 根据日期范围过滤任务
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      
      const filteredTasks = tasks.filter((task: Task) => {
        const createdDate = dayjs(task.createdAt);
        return createdDate.isAfter(startDate) && createdDate.isBefore(endDate);
      });

      if (filteredTasks.length === 0) {
        message.info('所选时间范围内没有任务记录');
        setLoading(false);
        return;
      }

      // 准备发送给AI的提示
      const prompt = generatePromptForAI(filteredTasks, reportType);
      
      // 调用OpenAI API
      const response = await callOpenAI(prompt);
      
      setReportContent(response);
    } catch (error) {
      console.error('生成报告时出错:', error);
      message.error('生成报告失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 生成AI提示
  const generatePromptForAI = (tasks: Task[], type: ReportType): string => {
    const quadrantNames = ['重要且紧急', '重要但不紧急', '紧急但不重要', '既不重要也不紧急'];
    
    let taskSummary = tasks.map(task => {
      return `- 任务: ${task.title}\n  描述: ${task.description}\n  象限: ${quadrantNames[task.quadrant - 1]}\n  状态: ${task.status === 'completed' ? '已完成' : task.status === 'pending' ? '进行中' : '已取消'}\n  创建时间: ${dayjs(task.createdAt).format('YYYY-MM-DD HH:mm')}${task.completedAt ? `\n  完成时间: ${dayjs(task.completedAt).format('YYYY-MM-DD HH:mm')}` : ''}`;
    }).join('\n\n');

    let timeFrame;
    switch (type) {
      case 'daily': timeFrame = '日'; break;
      case 'weekly': timeFrame = '周'; break;
      case 'monthly': timeFrame = '月'; break;
      case 'yearly': timeFrame = '年'; break;
      default: timeFrame = '自定义时间段';
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

  // 调用OpenAI API
  const callOpenAI = async (prompt: string): Promise<string> => {
    try {
      // 调用后端的generate_report API
      const response = await invoke<string>('generate_report', {
        api_key: apiKey,
        model: aiModel,
        prompt: prompt
      });
      
      return response;
    } catch (error) {
      console.error('调用OpenAI API时出错:', error);
      throw error;
    }
  };

  // 下载报告
  const downloadReport = () => {
    if (!reportContent) {
      message.error('请先生成报告');
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([reportContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    
    const reportDate = dateRange ? 
      `${dateRange[0].format('YYYYMMDD')}-${dateRange[1].format('YYYYMMDD')}` : 
      dayjs().format('YYYYMMDD');
      
    element.download = `工作报告_${reportType}_${reportDate}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // 日期范围变化处理
  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange(null);
    }
  };

  // 报告类型变化处理
  const handleReportTypeChange = (value: ReportType) => {
    setReportType(value);
  };

  // 报告格式变化处理
  const handleFormatChange = (e: RadioChangeEvent) => {
    setReportFormat(e.target.value as ReportFormat);
  };

  // API密钥变化处理
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setApiKey(value);
    localStorage.setItem('openai_api_key', value);
  };

  // AI模型变化处理
  const handleModelChange = (value: string) => {
    setAiModel(value);
    localStorage.setItem('ai_model', value);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>工作报告生成</Title>
      
      <Tabs defaultActiveKey="generate">
        <TabPane tab="生成报告" key="generate">
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <Radio.Group value={reportType} onChange={(e) => handleReportTypeChange(e.target.value)}>
                <Radio.Button value="daily">日报</Radio.Button>
                <Radio.Button value="weekly">周报</Radio.Button>
                <Radio.Button value="monthly">月报</Radio.Button>
                <Radio.Button value="yearly">年报</Radio.Button>
                <Radio.Button value="custom">自定义</Radio.Button>
              </Radio.Group>
            </div>
            
            {reportType === 'custom' && (
              <div style={{ marginBottom: '20px' }}>
                <RangePicker 
                  value={dateRange} 
                  onChange={handleDateRangeChange} 
                  style={{ width: '100%' }}
                />
              </div>
            )}
            
            <div style={{ marginBottom: '20px' }}>
              <Radio.Group value={reportFormat} onChange={handleFormatChange} style={{ marginBottom: '10px' }}>
                <Radio value="text">文本报告</Radio>
                <Radio value="chart">图表报告</Radio>
              </Radio.Group>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <Input.Password 
                placeholder="OpenAI API密钥" 
                value={apiKey} 
                onChange={handleApiKeyChange}
                style={{ marginBottom: '10px' }}
              />
              <Select
                value={aiModel}
                onChange={handleModelChange}
                style={{ width: '100%' }}
                options={[
                  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
                  { value: 'gpt-4', label: 'GPT-4' },
                  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' }
                ]}
              />
            </div>
            
            <Button 
              type="primary" 
              onClick={generateReport} 
              loading={loading}
              style={{ marginBottom: '20px' }}
            >
              生成报告
            </Button>
            
            {reportContent && (
              <div>
                <div 
                  style={{ 
                    border: '1px solid #d9d9d9', 
                    borderRadius: '4px', 
                    padding: '16px',
                    marginBottom: '20px',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '500px',
                    overflow: 'auto',
                    backgroundColor: '#f5f5f5'
                  }}
                >
                  {loading ? <Spin /> : <div dangerouslySetInnerHTML={{ __html: reportContent.replace(/\n/g, '<br>') }} />}
                </div>
                <Button type="default" onClick={downloadReport}>
                  下载报告
                </Button>
              </div>
            )}
          </div>
        </TabPane>
        
        <TabPane tab="设置" key="settings">
          <div style={{ marginTop: '20px' }}>
            <Title level={4}>API设置</Title>
            <div style={{ marginBottom: '20px' }}>
              <Input.Password 
                placeholder="OpenAI API密钥" 
                value={apiKey} 
                onChange={handleApiKeyChange}
                style={{ marginBottom: '10px' }}
              />
              <p style={{ fontSize: '12px', color: '#888' }}>API密钥将安全地存储在您的浏览器本地存储中</p>
            </div>
            
            <Title level={4}>AI模型设置</Title>
            <div style={{ marginBottom: '20px' }}>
              <Select
                value={aiModel}
                onChange={handleModelChange}
                style={{ width: '100%' }}
                options={[
                  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (更快、更经济)' },
                  { value: 'gpt-4', label: 'GPT-4 (更智能、更全面)' },
                  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (最新版本)' }
                ]}
              />
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Reports;