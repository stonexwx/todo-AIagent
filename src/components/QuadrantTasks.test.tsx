import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import QuadrantTasks from "./QuadrantTasks";
import { invoke } from "@tauri-apps/api/core";

jest.mock("@tauri-apps/api/core", () => ({
  invoke: jest.fn(),
}));

describe("QuadrantTasks", () => {
  const mockTasks = [
    {
      id: "1",
      title: "紧急任务",
      description: "测试描述",
      quadrant: 1,
      createdAt: "2023-01-01",
      status: "pending",
    },
    {
      id: "2",
      title: "重要任务",
      description: "已完成任务",
      quadrant: 2,
      createdAt: "2023-01-02",
      completedAt: "2023-01-03",
      status: "completed",
    },
  ];

  beforeEach(() => {
    (invoke as jest.Mock).mockReset();
  });

  test("正确渲染四个象限标题", async () => {
    (invoke as jest.Mock).mockResolvedValue([]);

    render(<QuadrantTasks />);

    await waitFor(() => {
      expect(screen.getByText("重要且紧急")).toBeInTheDocument();
      expect(screen.getByText("重要但不紧急")).toBeInTheDocument();
      expect(screen.getByText("紧急但不重要")).toBeInTheDocument();
      expect(screen.getByText("既不重要也不紧急")).toBeInTheDocument();
    });
  });

  test("显示从API获取的任务数据", async () => {
    (invoke as jest.Mock).mockResolvedValue(mockTasks);

    render(<QuadrantTasks />);

    await waitFor(() => {
      expect(screen.getByText("紧急任务")).toBeInTheDocument();
      expect(screen.getByText("重要任务")).toBeInTheDocument();
    });
  });

  test("新建任务表单提交", async () => {
    (invoke as jest.Mock).mockResolvedValue([]);

    render(<QuadrantTasks />);

    fireEvent.click(screen.getAllByRole("button", { name: /\+/ })[0]);

    fireEvent.change(screen.getByLabelText("标题"), {
      target: { value: "新任务" },
    });
    fireEvent.change(screen.getByLabelText("描述"), {
      target: { value: "新描述" },
    });
    fireEvent.click(screen.getByText("保存任务"));

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith("create_task", expect.anything());
    });
  });

  test("完成任务功能", async () => {
    (invoke as jest.Mock).mockResolvedValue(mockTasks);

    render(<QuadrantTasks />);

    await waitFor(() => screen.getByText("紧急任务"));
    fireEvent.click(screen.getAllByRole("button", { name: /完成任务/ })[0]);

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith("complete_task", { id: "1" });
    });
  });

  test("删除任务确认流程", async () => {
    window.confirm = jest.fn(() => true);
    (invoke as jest.Mock).mockResolvedValue(mockTasks);

    render(<QuadrantTasks />);

    await waitFor(() => screen.getByText("紧急任务"));
    fireEvent.click(screen.getAllByRole("button", { name: /删除任务/ })[0]);

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith("delete_task", { id: "1" });
    });
  });

  test("显示API错误信息", async () => {
    (invoke as jest.Mock).mockRejectedValue(new Error("API错误"));

    render(<QuadrantTasks />);

    await waitFor(() => {
      expect(
        screen.getByText("无法从后端获取任务数据，请稍后重试")
      ).toBeInTheDocument();
    });
  });
});
