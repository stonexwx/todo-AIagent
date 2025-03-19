import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { Layout, Menu, ConfigProvider, theme } from "antd";
import { 
  DashboardOutlined, 
  AppstoreOutlined, 
  FileTextOutlined, 
  SettingOutlined 
} from "@ant-design/icons";
import Dashboard from "./components/Dashboard";
import QuadrantTasks from "./components/QuadrantTasks";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import "./App.css";

const { Header, Content, Sider } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1");
  
  // 从本地存储加载深色模式设置
  useEffect(() => {
    const storedDarkMode = localStorage.getItem('dark_mode');
    if (storedDarkMode) {
      setDarkMode(storedDarkMode === 'true');
    }
  }, []);

  // 监听路径变化，更新选中的菜单项
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/" || path === "/dashboard") {
      setSelectedKey("1");
    } else if (path === "/tasks") {
      setSelectedKey("2");
    } else if (path === "/reports") {
      setSelectedKey("3");
    } else if (path === "/settings") {
      setSelectedKey("4");
    }
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Router>
        <Layout style={{ minHeight: "100vh" }}>
          <Sider 
            collapsible 
            collapsed={collapsed} 
            onCollapse={(value) => setCollapsed(value)}
            breakpoint="lg"
            collapsedWidth="80"
          >
            <div className="logo" style={{ 
              height: "32px", 
              margin: "16px", 
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontWeight: "bold"
            }}>
              {!collapsed ? "四象限TODO" : "TODO"}
            </div>
            <Menu 
              theme="dark" 
              mode="inline" 
              selectedKeys={[selectedKey]}
              className="main-menu"
              items={[
                {
                  key: "1",
                  icon: <DashboardOutlined />,
                  label: <Link to="/dashboard">数据看板</Link>,
                },
                {
                  key: "2",
                  icon: <AppstoreOutlined />,
                  label: <Link to="/tasks">四象限任务</Link>,
                },
                {
                  key: "3",
                  icon: <FileTextOutlined />,
                  label: <Link to="/reports">工作报告</Link>,
                },
                {
                  key: "4",
                  icon: <SettingOutlined />,
                  label: <Link to="/settings">设置</Link>,
                },
              ]}
            />
          </Sider>
          <Layout>
            <Header style={{ padding: 0, background: darkMode ? "#141414" : "#fff" }} />
            <Content style={{ margin: "0 16px" }}>
              <div style={{ padding: 24, minHeight: 360 }}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tasks" element={<QuadrantTasks />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </div>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
