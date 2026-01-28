import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Spinner, { FullPageSpinner } from "./Spinner";

describe("Spinner", () => {
  it("renders with default medium size", () => {
    render(<Spinner />);
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeTruthy();
    expect(spinner?.className).toContain("h-8");
    expect(spinner?.className).toContain("w-8");
  });

  it("renders with small size", () => {
    render(<Spinner size="sm" />);
    const spinner = document.querySelector(".animate-spin");
    expect(spinner?.className).toContain("h-4");
    expect(spinner?.className).toContain("w-4");
  });

  it("renders with large size", () => {
    render(<Spinner size="lg" />);
    const spinner = document.querySelector(".animate-spin");
    expect(spinner?.className).toContain("h-12");
    expect(spinner?.className).toContain("w-12");
  });

  it("applies custom className", () => {
    render(<Spinner className="custom-class" />);
    const spinner = document.querySelector(".animate-spin");
    expect(spinner?.className).toContain("custom-class");
  });
});

describe("FullPageSpinner", () => {
  it("renders centered in viewport", () => {
    const { container } = render(<FullPageSpinner />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
    expect(container.querySelector(".min-h-\\[50vh\\]")).toBeTruthy();
  });
});
