import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductService } from "./product.service";
import type { ProductListResponse } from "./product.interface";

function jsonResponse(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init
  });
}

describe("상품 서비스", () => {
  const fetchMock = vi.fn();
  const result: ProductListResponse = {
    products: [],
    total: 0,
    skip: 0,
    limit: 10
  };

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("상품 목록을 조회하면 데이터와 함께 성공 튜플을 반환한다", async () => {
    fetchMock.mockResolvedValue(jsonResponse(result));
    const service = new ProductService();

    const [data, error] = await service.getProducts();

    const url = fetchMock.mock.calls[0][0] as URL;
    expect(url.pathname).toBe(ProductEndpoint.bff.list);
    expect(data).toEqual(result);
    expect(error).toBeNull();
  });

  it("HTTP 실패는 AppError JSON으로 치환해 실패 튜플을 반환한다", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          service: "http",
          error: "HTTP_ERROR",
          status: 502,
          message: "네이버 쇼핑 조회에 실패했습니다."
        },
        { status: 502, statusText: "Bad Gateway" }
      )
    );
    const service = new ProductService();

    const [data, error] = await service.getProducts();

    expect(data).toBeNull();
    expect(error).toEqual({
      service: "http",
      error: "HTTP_ERROR",
      status: 502,
      message: "네이버 쇼핑 조회에 실패했습니다."
    });
  });

  it("네트워크 예외는 INTERNAL_ERROR로 추출한다", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    const service = new ProductService();

    const [data, error] = await service.getProducts();

    expect(data).toBeNull();
    expect(error).toEqual({
      service: "unknown",
      status: 500,
      message: "network",
      error: "INTERNAL_ERROR"
    });
  });
});
