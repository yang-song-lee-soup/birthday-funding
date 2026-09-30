// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/providers/AuthProvider", () => ({
  useAuthContext: () => ({ userInfo: { displayName: "사용자" } }),
}));

import MyPage from "./page";

describe("MyPage", () => {
  it("상품을 담으러 상품 페이지로 이동할 수 있다", () => {
    const html = renderToStaticMarkup(<MyPage />);

    expect(html).toContain('href="/product"');
    expect(html).toContain("상품 담기");
  });
});
