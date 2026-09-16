import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/app/app-error";
import { HttpFetch, HttpService } from "./index";

function jsonResponse(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init
  });
}

describe("HTTP 요청", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("GET 요청에 쿼리를 붙이고 JSON을 반환한다", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ items: [] }));
    const client = HttpFetch({ service: HttpService.APP });

    const result = await client
      .get("/api/product", {
        query: { query: "가방", display: 12, start: undefined, sort: "sim" }
      })
      .request();

    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.href).toBe(
      "http://localhost:3000/api/product?query=%EA%B0%80%EB%B0%A9&display=12&sort=sim"
    );
    expect(init.method).toBe("GET");
    expect(init.body).toBeUndefined();
    expect(new Headers(init.headers).get("Content-Type")).toBe(
      "application/json"
    );
    expect(result).toEqual({ items: [] });
  });

  it("PRODUCT 서비스는 외부 origin으로 요청한다", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ products: [] }));
    const client = HttpFetch({ service: HttpService.PRODUCT });

    await client.get("/products").request();

    const [url] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.href).toBe("https://dummyjson.com/products");
  });

  it("POST 본문을 JSON으로 직렬화한다", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 1 }));
    const client = HttpFetch({ service: HttpService.APP });

    await client.post("/posts", { title: "hello" }).request();

    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.href).toBe("http://localhost:3000/posts");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ title: "hello" }));
  });

  it.each(["put", "patch", "delete"] as const)(
    "%s 메서드로 요청한다",
    async (method) => {
      fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
      const client = HttpFetch({ service: HttpService.APP });

      if (method === "delete") {
        await client.delete("/items/1").request();
      } else {
        await client[method]("/items/1", { name: "x" }).request();
      }

      expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe(
        method.toUpperCase()
      );
    }
  );

  it("기본 헤더와 요청 헤더를 합친다", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));
    const client = HttpFetch({
      service: HttpService.APP,
      headers: { Authorization: "Bearer token" }
    });

    await client.get("/me", { headers: { "X-Request-Id": "abc" } }).request();

    const headers = new Headers(
      (fetchMock.mock.calls[0][1] as RequestInit).headers
    );
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer token");
    expect(headers.get("X-Request-Id")).toBe("abc");
  });

  it("실패 응답은 AppError로 던진다", async () => {
    fetchMock.mockImplementation(() =>
      jsonResponse(
        { service: "http", error: "HTTP_ERROR", message: "Not Found" },
        { status: 404, statusText: "Not Found" }
      )
    );
    const client = HttpFetch({ service: HttpService.APP });

    await expect(client.get("/missing").request()).rejects.toSatisfy(
      (error: unknown) => {
        expect(error).toBeInstanceOf(AppError);
        expect(error).toMatchObject({
          service: "http",
          error: "HTTP_ERROR",
          status: 404,
          message: "Not Found"
        });
        return true;
      }
    );
  });
});
