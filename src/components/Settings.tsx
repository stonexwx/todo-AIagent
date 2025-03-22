import React, { useState, useEffect } from "react";

import { SaveIcon, ApiIcon, GitHubIcon } from "@/assets/custom-icons";
import { invoke } from "@tauri-apps/api/core";
import { message } from "./common/Message";
import BaseButton from "./common/BaseButton";
import BaseCard from "./common/BaseCard";
import BaseInput from "./common/BaseInput";

// 本地定义Task接口，与后端保持一致
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

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = () => {
  // 状态管理
  const [openaiApiKey, setOpenaiApiKey] = useState<string>("");
  const [aiModel, setAiModel] = useState<string>("gpt-3.5-turbo");
  const [gitlabToken, setGitlabToken] = useState<string>("");
  const [gitlabUrl, setGitlabUrl] = useState<string>("https://gitlab.com");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("zh-CN");
  const [saving, setSaving] = useState<boolean>(false);

  // 从本地存储加载设置
  useEffect(() => {
    const storedApiKey = localStorage.getItem("openai_api_key");
    if (storedApiKey) {
      setOpenaiApiKey(storedApiKey);
    }

    const storedModel = localStorage.getItem("ai_model");
    if (storedModel) {
      setAiModel(storedModel);
    }

    const storedGitlabToken = localStorage.getItem("gitlab_token");
    if (storedGitlabToken) {
      setGitlabToken(storedGitlabToken);
    }

    const storedGitlabUrl = localStorage.getItem("gitlab_url");
    if (storedGitlabUrl) {
      setGitlabUrl(storedGitlabUrl);
    }

    const storedDarkMode = localStorage.getItem("dark_mode");
    if (storedDarkMode) {
      setDarkMode(storedDarkMode === "true");
    }

    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, []);

  // 保存设置
  const saveSettings = () => {
    setSaving(true);

    try {
      // 输入验证
      if (!/^sk-[A-Za-z0-9]{48}$/.test(openaiApiKey)) {
        throw new Error("OpenAI API密钥格式不正确");
      }
      if (!/^https?:\/\/.+/.test(gitlabUrl)) {
        throw new Error("GitLab URL必须以http://或https://开头");
      }

      // 安全存储（后续可替换为加密存储）
      localStorage.setItem("openai_api_key", btoa(openaiApiKey));
      localStorage.setItem("ai_model", aiModel);
      localStorage.setItem("gitlab_token", btoa(gitlabToken));
      localStorage.setItem("gitlab_url", gitlabUrl);
      localStorage.setItem("dark_mode", darkMode.toString());
      localStorage.setItem("language", language);

      message.success("设置已安全保存", 2);
    } catch (error) {
      console.error("保存设置时出错:", error);
      message.error(error instanceof Error ? error.message : "保存设置失败", 3);
    } finally {
      setSaving(false);
    }
  };

  // 测试GitLab连接
  const testGitlabConnection = async () => {
    if (!gitlabToken || !gitlabUrl) {
      message.error("请先填写GitLab令牌和URL");
      return;
    }

    try {
      // 导入GitLab项目ID输入框
      const projectId = prompt("请输入GitLab项目ID");
      if (!projectId || !/^\d+$/.test(projectId)) {
        message.error("项目ID必须是数字");
        return;
      }

      // 调用后端API导入GitLab issues
      const tasks = await invoke<Task[]>("import_gitlab_issues", {
        token: gitlabToken,
        gitlab_url: gitlabUrl,
        project_id: projectId,
      });

      message.success(`成功导入 ${tasks.length} 个任务`);
    } catch (error) {
      console.error("导入GitLab任务时出错:", error);
      message.error(`导入失败: ${error}`);
    }
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

  return (
    <div className="settings-container">
      <h2 className="settings-title">应用设置</h2>
      <BaseCard variant="surface" size="lg" className="settings-card">
        <div className="card-header">
          <ApiIcon /> <h4>AI集成设置</h4>
        </div>
        <form className="form">
          <div className="form-item">
            <label className="form-label">OpenAI API密钥</label>
            <input
              type="password"
              className="form-input"
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              placeholder="请输入您的OpenAI API密钥"
            />
            <span className="form-extra">
              您的API密钥将安全地存储在本地，不会发送到任何服务器。
            </span>
          </div>

          <div className="form-item">
            <label className="form-label">默认AI模型</label>
            <select
              className="form-select"
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
            >
              <option value="gpt-3.5-turbo">
                GPT-3.5 Turbo (更快，成本更低)
              </option>
              <option value="gpt-4">GPT-4 (更智能，成本更高)</option>
              <option value="gpt-4-turbo">GPT-4 Turbo (最新版本)</option>
            </select>
          </div>
        </form>
      </BaseCard>
      <BaseCard variant="surface" size="lg" className="settings-card">
        <div className="card-header">
          <GitHubIcon /> <h4>GitLab集成</h4>
        </div>
        <form className="form">
          <div className="form-item">
            <label className="form-label">GitLab URL</label>
            <input
              type="text"
              className="form-input"
              value={gitlabUrl}
              onChange={(e) => setGitlabUrl(e.target.value)}
              placeholder="例如: https://gitlab.com"
            />
          </div>

          <div className="form-item">
            <label className="form-label">GitLab 个人访问令牌</label>
            <input
              type="password"
              className="form-input"
              value={gitlabToken}
              onChange={(e) => setGitlabToken(e.target.value)}
              placeholder="请输入您的GitLab个人访问令牌"
            />
            <span className="form-extra">
              需要具有API访问权限的令牌，用于导入GitLab TODO内容。
            </span>
          </div>

          <button
            className="button button-secondary"
            onClick={testGitlabConnection}
          >
            测试连接
          </button>
        </form>
      </BaseCard>
      <BaseCard variant="surface" size="lg" className="settings-card">
        <div className="card-header">
          <h4>应用设置</h4>
        </div>
        <form className="form">
          <div className="form-item">
            <label className="form-label">界面语言</label>
            <select
              className="form-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
            </select>
          </div>

          <div className="form-item">
            <label className="form-label">深色模式</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </form>
      </BaseCard>
      {/* 保存按钮 */}
      <BaseButton variant="primary" onClick={saveSettings} disabled={saving}>
        <SaveIcon className="w-4 h-4 mr-2" />
        {saving ? "保存中..." : "保存设置"}
      </BaseButton>
      {/* GitLab连接卡片 */}
      <BaseCard title="GitLab 集成" variant="surface" className="mb-6">
        <div className="space-y-4">
          <BaseInput
            className="input-with-icon"
            placeholder="GitLab访问令牌"
            value={gitlabToken}
            onChange={(e) => setGitlabToken(e.target.value)}
          />
        </div>
      </BaseCard>
      {/* AI配置卡片 */}
      <BaseCard title="AI 配置" variant="surface" className="mb-6">
        <div className="space-y-4">
          <BaseInput
            className="input-with-icon"
            placeholder="OpenAI API密钥"
            type="password"
            value={openaiApiKey}
            onChange={(e) => setOpenaiApiKey(e.target.value)}
          />
        </div>
      </BaseCard>
    </div>
  );
};

export default Settings;
