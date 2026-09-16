import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductAPI } from "./product.bff";
import type { ProductList } from "./product.interface";

describe("상품 BFF API", () => {
  const fetchMock = vi.fn();
  const list: ProductList = { products: [], total: 0, skip: 0, limit: 30 };

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("앱의 상품 목록 경로로 요청하고 data를 벗겨 반환한다", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: list }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    const data = await new ProductAPI().getAll();

    const url = fetchMock.mock.calls[0][0] as URL;
    expect(url.href).toBe("http://localhost:3000/api/product");
    expect(data).toEqual(list);
  });
});
