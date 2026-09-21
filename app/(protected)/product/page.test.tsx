// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getProducts, searchProducts, getProductsByCategory, showToastMessage } =
  vi.hoisted(() => ({
    getProducts: vi.fn(),
    searchProducts: vi.fn(),
    getProductsByCategory: vi.fn(),
    showToastMessage: vi.fn()
  }));
vi.mock("./product.service", () => ({
  ProductService: class {
    getProducts = getProducts;
    searchProducts = searchProducts;
    getProductsByCategory = getProductsByCategory;
  }
}));
vi.mock("@/providers/ToastMessageProvider", () => ({
  useToastMessageContext: () => ({ showToastMessage })
}));

import ProductPage from "./page";
import type {
  Product,
  ProductListType
} from "@/service/product/product.interface";

const product: Product = {
  id: 1,
  title: "Essence Mascara Lash Princess",
  description: "볼륨과 길이를 살려주는 마스카라",
  category: "beauty",
  brand: "Essence",
  price: 9.99,
  rating: 4.94,
  stock: 5,
  thumbnail: "https://example.com/mascara.png"
};

function listResponse(products: Product[]): ProductListType {
  return { products, total: products.length, skip: 0, limit: 30 };
}

async function renderPage(searchParams: Record<string, string> = {}) {
  const ui = await ProductPage({
    searchParams: Promise.resolve(searchParams)
  } as Parameters<typeof ProductPage>[0]);
  await act(async () => root.render(ui));
}

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  getProducts.mockReset();
  searchProducts.mockReset();
  getProductsByCategory.mockReset();
  showToastMessage.mockReset();
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
  it("조회한 상품을 목록으로 보여준다", async () => {
    getProducts.mockResolvedValue([listResponse([product]), null]);
    await renderPage();

    expect(host.textContent).toContain("Essence Mascara Lash Princess");
    expect(host.textContent).toContain("beauty");
    expect(host.textContent).toContain("9,990원");
    expect(
      host.querySelector('img[src="https://example.com/mascara.png"]')
    ).not.toBeNull();
    expect(host.querySelector('a[href="/product/1"]')).not.toBeNull();
  });

  it("상품이 없으면 빈 목록 안내를 보여준다", async () => {
    getProducts.mockResolvedValue([listResponse([]), null]);
    await renderPage();

    expect(host.textContent).toContain("검색된 상품이 없습니다.");
  });

  it("서비스 오류는 토스트로 표시한다", async () => {
    getProducts.mockResolvedValue([
      null,
      { message: "상품 조회에 실패했습니다." }
    ]);
    await renderPage();

    expect(showToastMessage).toHaveBeenCalledWith({
      type: "error",
      message: "상품 조회에 실패했습니다."
    });
    expect(host.textContent).not.toContain("Essence Mascara Lash Princess");
  });

  it("검색어를 입력창에 유지한다", async () => {
    searchProducts.mockResolvedValue([listResponse([]), null]);
    await renderPage({ query: "마스카라" });

    expect(searchProducts).toHaveBeenCalledWith("마스카라");
    expect(getProducts).not.toHaveBeenCalled();
    expect(host.querySelector("input")?.defaultValue).toBe("마스카라");

    const electronics = [...host.querySelectorAll("a")].find((el) =>
      el.textContent?.includes("전자기기")
    );
    expect(electronics?.getAttribute("href")).toBe(
      "/product?category=smartphones"
    );
  });

  it("선택한 카테고리로 조회하고 탭을 활성화한다", async () => {
    getProductsByCategory.mockResolvedValue([listResponse([]), null]);
    await renderPage({ category: "smartphones" });

    expect(getProductsByCategory).toHaveBeenCalledWith("smartphones");
    expect(getProducts).not.toHaveBeenCalled();

    const active = [...host.querySelectorAll("a")].find((el) =>
      el.textContent?.includes("전자기기")
    );
    expect(active?.className).toContain("bg-kakao");
    expect(active?.getAttribute("href")).toBe(
      "/product?category=smartphones"
    );
  });
});
