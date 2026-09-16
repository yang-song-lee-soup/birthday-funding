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

  it("외부 API 응답을 data로 감싸 반환한다", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 1231, title: "post" }));

    const response = await GET(
      new NextRequest("https://app.example/api/product")
    );
    const body = await response.json();

    const url = fetchMock.mock.calls[0][0] as URL;
    expect(url.href).toBe("https://dummyjson.com/products");
    expect(response.status).toBe(200);
    expect(body).toEqual({ data: { id: 1231, title: "post" } });
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
