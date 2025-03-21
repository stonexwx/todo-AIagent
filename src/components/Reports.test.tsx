import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Reports from "./Reports";
import dayjs from "dayjs";

// 引入统一mock模块
import { invoke, mockSuccessResponse, mockErrorResponse } from "@/mocks/api";
import { setupBrowserMocks } from "@/mocks/browser";
import { message } from "./common/Message";


  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

beforeEach(() => {
  setupBrowserMocks();
  invoke.mockReset();
  (message.error as jest.Mock).mockReset();
  (message.success as jest.Mock).mockReset();
});

describe("Reports Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Storage.prototype, "getItem");
  });

  it("renders reports component correctly", () => {
    render(<Reports />);
    expect(screen.getByText("工作报告生成")).toBeInTheDocument();
    expect(screen.getByText("生成报告")).toBeInTheDocument();
    expect(screen.getByText("设置")).toBeInTheDocument();
  });

  it("switches report type correctly", () => {
    render(<Reports />);
    const dailyButton = screen.getByText("日报");
    const weeklyButton = screen.getByText("周报");

    fireEvent.click(dailyButton);
    expect(dailyButton).toHaveClass("ant-radio-button-wrapper-checked");

    fireEvent.click(weeklyButton);
    expect(weeklyButton).toHaveClass("ant-radio-button-wrapper-checked");
  });

  it("handles custom date range selection", () => {
    render(<Reports />);
    const customButton = screen.getByText("自定义");
    fireEvent.click(customButton);

    const rangePicker = screen.getByRole("textbox", { name: /时间范围/i });
    expect(rangePicker).toBeInTheDocument();
  });

  it("validates API key before generating report", async () => {
    render(<Reports />);
    const generateButton = screen.getByText("生成报告");

    fireEvent.click(generateButton);
    expect(message.error).toHaveBeenCalledWith("请在设置中配置OpenAI API密钥");
  });

  it("generates report successfully", async () => {
    // Mock localStorage API key
    Storage.prototype.getItem = jest.fn().mockReturnValue("test-api-key");

    // Mock successful task fetch
    const mockTasks = [
      {
        id: "1",
        title: "测试任务",
        description: "测试描述",
        quadrant: 1,
        createdAt: "2024-01-01T10:00:00Z",
        status: "completed",
      },
    ];

    (invoke as jest.Mock).mockResolvedValueOnce(mockTasks);
    (invoke as jest.Mock).mockResolvedValueOnce("生成的报告内容");

    render(<Reports />);
    const generateButton = screen.getByText("生成报告");

    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText("生成的报告内容")).toBeInTheDocument();
    });
  });

  it("handles report generation error", async () => {
    Storage.prototype.getItem = jest.fn().mockReturnValue("test-api-key");
    (invoke as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(<Reports />);
    const generateButton = screen.getByText("生成报告");

    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("生成报告失败，请稍后重试");
    });
  });

  it("allows downloading generated report", async () => {
    Storage.prototype.getItem = jest.fn().mockReturnValue("test-api-key");
    (invoke as jest.Mock).mockResolvedValueOnce([]);
    (invoke as jest.Mock).mockResolvedValueOnce("报告内容");

    render(<Reports />);

    // 模拟生成报告
    const generateButton = screen.getByText("生成报告");
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      const downloadButton = screen.getByText("下载报告");
      expect(downloadButton).toBeInTheDocument();
    });
  });
});
