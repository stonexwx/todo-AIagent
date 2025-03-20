import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import dayjs from "dayjs";
import BaseDateCell from "../BaseDateCell";

describe("BaseDateCell", () => {
  test("正确显示日期", () => {
    render(<BaseDateCell date={dayjs("2024-03-15")} />);
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  test("高亮当天日期", () => {
    render(<BaseDateCell date={dayjs()} />);
    expect(screen.getByText(dayjs().date().toString())).toHaveClass(
      "bg-primary"
    );
  });

  test("显示任务状态标记", () => {
    const { rerender } = render(
      <BaseDateCell date={dayjs()} status="completed" />
    );
    expect(screen.getByRole("presentation")).toHaveClass("bg-success-500");

    rerender(<BaseDateCell date={dayjs()} status="pending" />);
    expect(screen.getByRole("presentation")).toHaveClass("bg-warning-500");
  });

  test("点击事件触发", () => {
    const handleClick = jest.fn();
    render(<BaseDateCell date={dayjs()} onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
