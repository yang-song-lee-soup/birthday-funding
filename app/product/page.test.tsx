// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getAll } = vi.hoisted(() => ({ getAll: vi.fn() }));
vi.mock("@/app/service/product/product.service", () => ({
  ProductService: class {
    getAll = getAll;
  }
}));

import ProductPage from "./page";
import type { Product } from "@/app/service/product/product.interface";

const product: Product = {
  id: "1",
  title: "생일 케이크",
  image: "https://example.com/cake.png",
  price: 20000,
  mallName: "네이버",
  category: "식품",
  link: "https://example.com/cake"
};

async function renderPage(searchParams: Record<string, string> = {}) {
  const ui = await ProductPage({
    searchParams: Promise.resolve(searchParams)
  } as Parameters<typeof ProductPage>[0]);
  await act(async () => root.render(ui));
}

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  getAll.mockReset();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

describe("상품 페이지", () => {
  it("검색어가 없으면 안내 문구를 보여준다", async () => {
    getAll.mockResolvedValue([{ items: [] }, null]);
    await renderPage();

    expect(getAll).toHaveBeenCalledWith({ query: "", display: 12 });
    expect(host.textContent).toContain(
      "검색어를 입력해 네이버 쇼핑 상품을 찾아보세요."
    );
  });

  it("검색 결과를 목록으로 보여준다", async () => {
    getAll.mockResolvedValue([{ items: [product] }, null]);
    await renderPage({ query: "케이크" });

    expect(host.querySelector("input")?.defaultValue).toBe("케이크");
    expect(host.textContent).toContain("생일 케이크");
    expect(host.textContent).toContain("20,000원");
    expect(
      host.querySelector('a[href="https://example.com/cake"]')
    ).not.toBeNull();
  });

  it("검색 결과가 없으면 빈 목록 안내를 보여준다", async () => {
    getAll.mockResolvedValue([{ items: [] }, null]);
    await renderPage({ query: "없는상품" });

    expect(host.textContent).toContain("검색된 상품이 없습니다.");
  });

  it("서비스 오류 메시지를 표시한다", async () => {
    getAll.mockResolvedValue([
      null,
      { message: "네이버 쇼핑 조회에 실패했습니다." }
    ]);
    await renderPage({ query: "케이크" });

    const error = host.querySelector("p.text-red-500");
    expect(error?.textContent).toBe("네이버 쇼핑 조회에 실패했습니다.");
    expect(host.textContent).not.toContain("생일 케이크");
  });

  it("선택한 카테고리 링크를 활성화한다", async () => {
    getAll.mockResolvedValue([{ items: [] }, null]);
    await renderPage({ query: "전자기기", category: "전자기기" });

    const active = [...host.querySelectorAll("a")].find((el) =>
      el.textContent?.includes("전자기기")
    );
    expect(active?.className).toContain("bg-yellow-100");
    expect(active?.getAttribute("href")).toBe(
      "/product?query=%EC%A0%84%EC%9E%90%EA%B8%B0%EA%B8%B0&category=%EC%A0%84%EC%9E%90%EA%B8%B0%EA%B8%B0"
    );
  });
});
