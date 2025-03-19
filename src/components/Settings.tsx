import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Switch, Select, Typography, message, Space, Divider } from 'antd';
import { SaveOutlined, ApiOutlined, GithubOutlined } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/core';
import { Task } from '../../../src-tauri/src/models';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = () => {
  // 状态管理
  const [openaiApiKey, setOpenaiApiKey] = useState<string>('');
  const [aiModel, setAiModel] = useState<string>('gpt-3.5-turbo');
  const [gitlabToken, setGitlabToken] = useState<string>('');
  const [gitlabUrl, setGitlabUrl] = useState<string>('https://gitlab.com');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('zh-CN');
  const [saving, setSaving] = useState<boolean>(false);

  // 从本地存储加载设置
  useEffect(() => {
    const storedApiKey = localStorage.getItem('openai_api_key');
    if (storedApiKey) {
      setOpenaiApiKey(storedApiKey);
    }

    const storedModel = localStorage.getItem('ai_model');
    if (storedModel) {
      setAiModel(storedModel);
    }

    const storedGitlabToken = localStorage.getItem('gitlab_token');
    if (storedGitlabToken) {
      setGitlabToken(storedGitlabToken);
    }

    const storedGitlabUrl = localStorage.getItem('gitlab_url');
    if (storedGitlabUrl) {
      setGitlabUrl(storedGitlabUrl);
    }

    const storedDarkMode = localStorage.getItem('dark_mode');
    if (storedDarkMode) {
      setDarkMode(storedDarkMode === 'true');
    }

    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, []);

  // 保存设置
  const saveSettings = () => {
    setSaving(true);

    try {
      // 保存到本地存储
      localStorage.setItem('openai_api_key', openaiApiKey);
      localStorage.setItem('ai_model', aiModel);
      localStorage.setItem('gitlab_token', gitlabToken);
      localStorage.setItem('gitlab_url', gitlabUrl);
      localStorage.setItem('dark_mode', darkMode.toString());
      localStorage.setItem('language', language);

      message.success('设置已保存');
    } catch (error) {
      console.error('保存设置时出错:', error);
      message.error('保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  // 测试GitLab连接
  const testGitlabConnection = async () => {
    if (!gitlabToken || !gitlabUrl) {
      message.error('请先填写GitLab令牌和URL');
      return;
    }

    try {
      // 导入GitLab项目ID输入框
      const projectId = prompt('请输入GitLab项目ID');
      if (!projectId) {
        return;
      }

      // 调用后端API导入GitLab issues
      const tasks = await invoke<Task[]>('import_gitlab_issues', {
        token: gitlabToken,
        gitlab_url: gitlabUrl,
        project_id: projectId
      });

      message.success(`成功导入 ${tasks.length} 个任务`);
    } catch (error) {
      console.error('导入GitLab任务时出错:', error);
      message.error(`导入失败: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>应用设置</Title>

      <Card style={{ marginBottom: 16 }}>
        <Title level={4}>
          <ApiOutlined /> AI集成设置
        </Title>
        <Form layout="vertical">
          <Form.Item
            label="OpenAI API密钥"
            extra="您的API密钥将安全地存储在本地，不会发送到任何服务器。"
          >
            <Input.Password
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              placeholder="请输入您的OpenAI API密钥"
            />
          </Form.Item>

          <Form.Item label="默认AI模型">
            <Select
              value={aiModel}
              onChange={(value) => setAiModel(value)}
              style={{ width: '100%' }}
            >
              <Option value="gpt-3.5-turbo">GPT-3.5 Turbo (更快，成本更低)</Option>
              <Option value="gpt-4">GPT-4 (更智能，成本更高)</Option>
              <Option value="gpt-4-turbo">GPT-4 Turbo (最新版本)</Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Title level={4}>
          <GithubOutlined /> GitLab集成
        </Title>
        <Form layout="vertical">
          <Form.Item label="GitLab URL">
            <Input
              value={gitlabUrl}
              onChange={(e) => setGitlabUrl(e.target.value)}
              placeholder="例如: https://gitlab.com"
            />
          </Form.Item>

          <Form.Item
            label="GitLab 个人访问令牌"
            extra="需要具有API访问权限的令牌，用于导入GitLab TODO内容。"
          >
            <Input.Password
              value={gitlabToken}
              onChange={(e) => setGitlabToken(e.target.value)}
              placeholder="请输入您的GitLab个人访问令牌"
            />
          </Form.Item>

          <Button onClick={testGitlabConnection}>测试连接</Button>
        </Form>
      </Card>

      <Card>
        <Title level={4}>应用设置</Title>
        <Form layout="vertical">
          <Form.Item label="界面语言">
            <Select
              value={language}
              onChange={(value) => setLanguage(value)}
              style={{ width: '100%' }}
            >
              <Option value="zh-CN">简体中文</Option>
              <Option value="en-US">English</Option>
            </Select>
          </Form.Item>

          <Form.Item label="深色模式">
            <Switch
              checked={darkMode}
              onChange={(checked) => setDarkMode(checked)}
            />
          </Form.Item>

          <Divider />

          <Form.Item>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={saveSettings}
              loading={saving}
            >
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;