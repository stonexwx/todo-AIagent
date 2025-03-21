import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import dayjs from "dayjs";
import BaseCalendar from "../BaseCalendar";

describe("BaseCalendar", () => {
  test("正确显示当前月份", () => {
    const currentDate = dayjs("2024-03-15");
    render(<BaseCalendar currentDate={currentDate} />);
    expect(screen.getByText("2024年03月")).toBeInTheDocument();
  });

  test("月份切换功能", async () => {
    const fixedDate = dayjs("2025-03-01");
    render(<BaseCalendar currentDate={fixedDate} />);

    const prevButton = screen.getByRole("button", { name: /前一个月/i });
    const nextButton = screen.getByRole("button", { name: /后一个月/i });

    // 测试下月按钮
    await act(async () => {
      fireEvent.click(nextButton);
    });
    await waitFor(() => {
      expect(screen.getByText(/2025年04月/)).toBeInTheDocument();
    });

    // 测试上月按钮
    await act(async () => {
      fireEvent.click(prevButton);
    });
    await waitFor(() => {
      expect(screen.getByText(/2025年\\d{1,2}月/)).toBeInTheDocument();
    });
  });

  test("渲染正确的日期数量", async () => {
    const currentDate = dayjs("2024-03-01");
    render(<BaseCalendar currentDate={currentDate} />);

    await waitFor(() => {
      const dateCells = screen.getAllByRole("button", { name: /^\d+$/ });
      expect(dateCells.length).toBe(31);
    });
  });
});
