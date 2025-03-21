import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { Tabs, Tab, TabPanel } from "../BaseTabs";

describe("BaseTabs 组件", () => {
  const TestComponent = ({ defaultTab }: { defaultTab?: string }) => (
    <Tabs defaultActiveTab={defaultTab}>
      <Tab tabId="tab1" key="tab1" aria-label="Tab 1">
        Tab 1
      </Tab>
      <Tab tabId="tab2" key="tab2" aria-label="Tab 2">
        Tab 2
      </Tab>
      <Tab tabId="tab3" key="tab3" aria-label="Tab 3">
        Tab 3
      </Tab>
      <TabPanel id="tab1">Panel 1 Content</TabPanel>
      <TabPanel id="tab2">Panel 2 Content</TabPanel>
      <TabPanel id="tab3">Panel 3 Content</TabPanel>
    </Tabs>
  );

  test("默认选中第一个tab", () => {
    render(<TestComponent />);
    expect(screen.getByRole("tab", { name: "Tab 1" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel 1");
  });

  test("点击切换tab", () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByText("Tab 2"));
    expect(screen.getByRole("tab", { name: "Tab 2" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel 2");
  });

  describe("键盘导航", () => {
    const setup = () => {
      render(<TestComponent />);
      const tab1 = screen.getByText("Tab 1");
      tab1.focus();
      return { tab1 };
    };

    test("右箭头切换焦点", () => {
      const { tab1 } = setup();
      fireEvent.keyDown(tab1, { key: "ArrowRight" });
      expect(screen.getByText("Tab 2")).toHaveFocus();
    });

    test("左箭头循环切换", () => {
      const { tab1 } = setup();
      fireEvent.keyDown(tab1, { key: "ArrowLeft" });
      expect(screen.getByText("Tab 2")).toHaveFocus();
    });

    test("Home键跳转首项", () => {
      setup();
      fireEvent.keyDown(screen.getByText("Tab 2"), { key: "Home" });
      expect(screen.getByText("Tab 1")).toHaveFocus();
    });

    test("End键跳转末项", () => {
      setup();
      fireEvent.keyDown(screen.getByText("Tab 1"), { key: "End" });
      expect(screen.getByText("Tab 2")).toHaveFocus();
    });
  });

  test("样式渲染验证", () => {
    const { container } = render(
      <Tabs variant="ghost" size="lg">
        <Tab tabId="tab1">Ghost Tab</Tab>
      </Tabs>
    );
    expect(container.firstChild).toHaveClass("bg-surface-100");
    expect(screen.getByRole("tab")).toHaveClass("py-2");
  });

  test("无障碍属性配置", () => {
    render(<TestComponent />);
    expect(screen.getByRole("tablist")).toHaveAttribute(
      "aria-label",
      "导航标签"
    );
    expect(screen.getByRole("tab", { name: "Tab 1" })).toHaveAttribute(
      "aria-controls",
      "panel-tab1"
    );
  });
});
