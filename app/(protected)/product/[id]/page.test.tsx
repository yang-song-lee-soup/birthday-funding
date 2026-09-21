// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getProduct, showToastMessage } = vi.hoisted(() => ({
  getProduct: vi.fn(),
  showToastMessage: vi.fn()
}));
vi.mock("../product.service", () => ({
  ProductService: class {
    getProduct = getProduct;
  }
}));
vi.mock("@/providers/ToastMessageProvider", () => ({
  useToastMessageContext: () => ({ showToastMessage })
}));

import ProductDetailPage from "./page";
import type { Product } from "@/service/product/product.interface";

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

async function renderPage(id = "1") {
  const ui = await ProductDetailPage({
    params: Promise.resolve({ id })
  } as Parameters<typeof ProductDetailPage>[0]);
  await act(async () => root.render(ui));
}

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  getProduct.mockReset();
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

describe("상품 상세 페이지", () => {
    it("상품 정보를 보여준다", async () => {
    getProduct.mockResolvedValue([product, null]);
    await renderPage();

    expect(getProduct).toHaveBeenCalledWith(1);
    expect(host.textContent).toContain("Essence Mascara Lash Princess");
    expect(host.textContent).toContain("9,990원");
    expect(host.textContent).toContain("Essence");
    expect(host.textContent).toContain("beauty");
    expect(host.textContent).toContain("5");
    expect(host.querySelector('a[href="/product"]')).not.toBeNull();
  });

  it("조회 실패는 토스트로 표시한다", async () => {
    getProduct.mockResolvedValue([
      null,
      { message: "상품 조회에 실패했습니다." }
    ]);
    await renderPage();

    expect(showToastMessage).toHaveBeenCalledWith({
      type: "error",
      message: "상품 조회에 실패했습니다."
    });
  });
});
