import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import BaseButton from "../BaseButton";

describe("BaseButton", () => {
  test("渲染主要按钮", () => {
    render(<BaseButton variant="primary">测试按钮</BaseButton>);
    expect(screen.getByText("测试按钮")).toHaveClass("bg-primary");
  });

  test("点击事件触发", () => {
    const handleClick = jest.fn();
    render(<BaseButton onClick={handleClick}>点击测试</BaseButton>);
    fireEvent.click(screen.getByText("点击测试"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("禁用状态样式", () => {
    render(<BaseButton disabled>禁用按钮</BaseButton>);
    expect(screen.getByText("禁用按钮")).toBeDisabled();
    expect(screen.getByText("禁用按钮")).toHaveClass("disabled:bg-surface-100");
  });
});
