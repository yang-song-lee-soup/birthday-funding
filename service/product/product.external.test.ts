import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductExternalAPI } from "./product.external";

function jsonResponse(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init
  });
}

describe("상품 외부 API", () => {
  const fetchMock = vi.fn();
  const list = { products: [], total: 0, skip: 0, limit: 30 };

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(jsonResponse(list));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function requestedUrl() {
    return (fetchMock.mock.calls[0][0] as URL).href;
  }

  it("목록은 /products로 요청한다", async () => {
    await new ProductExternalAPI().getAll().request();

    expect(requestedUrl()).toBe("https://dummyjson.com/products");
  });

  it("검색은 /products/search?q= 로 요청한다", async () => {
    await new ProductExternalAPI().search("phone").request();

    expect(requestedUrl()).toBe(
      "https://dummyjson.com/products/search?q=phone"
    );
  });

  it("카테고리는 /products/category/{slug} 로 요청한다", async () => {
    await new ProductExternalAPI().getByCategory("smartphones").request();

    expect(requestedUrl()).toBe(
      "https://dummyjson.com/products/category/smartphones"
    );
  });

  it("단건은 /products/{id} 로 요청한다", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 1, title: "phone" }));

    const data = await new ProductExternalAPI().getById(1).request();

    expect(requestedUrl()).toBe("https://dummyjson.com/products/1");
    expect(data).toEqual({ id: 1, title: "phone" });
  });

  it("requestWithResult는 성공 튜플을 반환한다", async () => {
    const [data, error] = await new ProductExternalAPI()
      .getAll()
      .requestWithResult();

    expect(data).toEqual(list);
    expect(error).toBeNull();
  });
});
