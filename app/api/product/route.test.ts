import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

function jsonResponse(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init
  });
}

describe("상품 API", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("외부 API 응답을 도메인 모델로 바꿔 data로 감싸 반환한다", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        products: [
          {
            id: 1,
            title: "Essence Mascara Lash Princess",
            description: "볼륨과 길이를 살려주는 마스카라",
            category: "beauty",
            brand: "Essence",
            price: 9.99,
            rating: 4.94,
            stock: 5,
            thumbnail: "https://example.com/mascara.png",
            sku: "RCH45Q1A",
            minimumOrderQuantity: 24
          }
        ],
        total: 194,
        skip: 0,
        limit: 30
      })
    );

    const response = await GET(
      new NextRequest("https://app.example/api/product")
    );
    const body = await response.json();

    const url = fetchMock.mock.calls[0][0] as URL;
    expect(url.href).toBe("https://dummyjson.com/products");
    expect(response.status).toBe(200);
    expect(body).toEqual({
      data: {
        products: [
          {
            id: 1,
            title: "Essence Mascara Lash Princess",
            description: "볼륨과 길이를 살려주는 마스카라",
            category: "beauty",
            brand: "Essence",
            price: 9.99,
            rating: 4.94,
            stock: 5,
            thumbnail: "https://example.com/mascara.png"
          }
        ],
        total: 194,
        skip: 0,
        limit: 30
      }
    });
  });

  it("외부 API 실패를 error JSON과 상태 코드로 반환한다", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { service: "http", error: "HTTP_ERROR", message: "Not Found" },
        { status: 404, statusText: "Not Found" }
      )
    );

    const response = await GET(
      new NextRequest("https://app.example/api/product")
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      error: {
        service: "http",
        error: "HTTP_ERROR",
        status: 404,
        message: "Not Found"
      }
    });
  });

  it("네트워크 예외는 500 INTERNAL_ERROR로 반환한다", async () => {
    fetchMock.mockRejectedValue(new Error("timeout"));

    const response = await GET(
      new NextRequest("https://app.example/api/product")
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: {
        service: "unknown",
        status: 500,
        message: "timeout",
        error: "INTERNAL_ERROR"
      }
    });
  });
});
