import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductListType } from "@/service/product/product.interface";

const { getAll, search, getByCategory, getById } = vi.hoisted(() => ({
  getAll: vi.fn(),
  search: vi.fn(),
  getByCategory: vi.fn(),
  getById: vi.fn()
}));

vi.mock("@/service/product/product.external", () => ({
  ProductExternalAPI: class {
    getAll = getAll;
    search = search;
    getByCategory = getByCategory;
    getById = getById;
  }
}));

import { ProductPageService } from "./product.page.service";

const result: ProductListType = {
  products: [],
  total: 0,
  skip: 0,
  limit: 10
};

function resultBuilder<T>(value: T) {
  return {
    requestWithResult: vi.fn().mockResolvedValue([value, null] as const)
  };
}

function errorBuilder(error: { message: string }) {
  return {
    requestWithResult: vi.fn().mockResolvedValue([null, error] as const)
  };
}

describe("상품 페이지 서비스", () => {
  beforeEach(() => {
    getAll.mockReset();
    search.mockReset();
    getByCategory.mockReset();
    getById.mockReset();
  });

  it("목록 조회는 getAll의 requestWithResult를 반환한다", async () => {
    const builder = resultBuilder(result);
    getAll.mockReturnValue(builder);

    const [data, error] = await new ProductPageService().getProducts();

    expect(getAll).toHaveBeenCalledOnce();
    expect(builder.requestWithResult).toHaveBeenCalledOnce();
    expect(data).toEqual(result);
    expect(error).toBeNull();
  });

  it("검색은 search에 검색어를 넘긴다", async () => {
    const builder = resultBuilder(result);
    search.mockReturnValue(builder);

    const [data, error] = await new ProductPageService().searchProducts("phone");

    expect(search).toHaveBeenCalledWith("phone");
    expect(builder.requestWithResult).toHaveBeenCalledOnce();
    expect(data).toEqual(result);
    expect(error).toBeNull();
  });

  it("카테고리 조회는 getByCategory에 슬러그를 넘긴다", async () => {
    const builder = resultBuilder(result);
    getByCategory.mockReturnValue(builder);

    const [data, error] = await new ProductPageService().getProductsByCategory(
      "smartphones"
    );

    expect(getByCategory).toHaveBeenCalledWith("smartphones");
    expect(data).toEqual(result);
    expect(error).toBeNull();
  });

  it("단건 조회는 getById에 id를 넘긴다", async () => {
    const product = { id: 1, title: "마스카라" };
    const builder = resultBuilder(product);
    getById.mockReturnValue(builder);

    const [data, error] = await new ProductPageService().getProduct(1);

    expect(getById).toHaveBeenCalledWith(1);
    expect(data).toEqual(product);
    expect(error).toBeNull();
  });

  it("실패 튜플을 그대로 반환한다", async () => {
    getAll.mockReturnValue(errorBuilder({ message: "상품 조회에 실패했습니다." }));

    const [data, error] = await new ProductPageService().getProducts();

    expect(data).toBeNull();
    expect(error?.message).toBe("상품 조회에 실패했습니다.");
  });
});
