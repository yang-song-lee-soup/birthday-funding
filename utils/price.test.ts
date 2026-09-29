import { describe, expect, it } from "vitest";
import { formatPrice } from "./price";

describe("formatPrice", () => {
  it("달러 값을 원화 표시 문자열로 바꾼다", () => {
    expect(formatPrice(9.99)).toBe("9,990원");
  });
});
