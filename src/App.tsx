import "./App.scss";
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import QuadrantTasks from "./components/QuadrantTasks";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import Menu from "./components/common/Menu";
import "./App.css";
import "./styles/components.css";

// 自定义图标组件
const DashboardIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 4h6v8H4V4zm10 0h6v6h-6V4zM4 16h6v4H4v-4zm10 2h6v2h-6v-2z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const TasksIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 3h18v18H3V3zm4 4h4v4H7V7zm0 6h4v4H7v-4zm6-6h4v4h-4V7zm0 6h4v4h-4v-4z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const ReportsIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1v6h6M8 14h8m-8 4h8m-8-8h2"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const SettingsIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

// 在App组件中添加导航逻辑
const App = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "看板",
      icon: <DashboardIcon />,
      action: () => navigate("/"),
    },
    {
      label: "任务",
      icon: <TasksIcon />,
      action: () => navigate("/tasks"),
    },
    {
      label: "报告",
      icon: <ReportsIcon />,
      action: () => navigate("/reports"),
    },
    {
      label: "设置",
      icon: <SettingsIcon />,
      action: () => navigate("/settings"),
    },
  ];

  return (
    <Router>
      <div className="app-container">
        <nav className="main-nav">
          <Menu items={menuItems} variant="surface" className="nav-menu" />
        </nav>
      </div>
    </Router>
  );
};

export default App;
