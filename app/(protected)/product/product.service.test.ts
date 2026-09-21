import { describe, expect, it, vi } from "vitest";
import type { ProductListType } from "@/service/product/product.interface";
import { ProductService } from "./product.service";

const result: ProductListType = {
  products: [],
  total: 0,
  skip: 0,
  limit: 10
};

function createApi(overrides: {
  getAll?: ReturnType<typeof vi.fn>;
  search?: ReturnType<typeof vi.fn>;
  getByCategory?: ReturnType<typeof vi.fn>;
  getById?: ReturnType<typeof vi.fn>;
} = {}) {
  return {
    getAll: overrides.getAll ?? vi.fn(),
    search: overrides.search ?? vi.fn(),
    getByCategory: overrides.getByCategory ?? vi.fn(),
    getById: overrides.getById ?? vi.fn()
  };
}

describe("상품 서비스", () => {
  it("목록 조회 결과를 성공 튜플로 반환한다", async () => {
    const getAll = vi.fn().mockResolvedValue(result);
    const service = new ProductService(createApi({ getAll }));

    const [data, error] = await service.getProducts();

    expect(getAll).toHaveBeenCalledOnce();
    expect(data).toEqual(result);
    expect(error).toBeNull();
  });

  it("검색어는 search로 조회한다", async () => {
    const search = vi.fn().mockResolvedValue(result);
    const service = new ProductService(createApi({ search }));

    const [data, error] = await service.searchProducts("phone");

    expect(search).toHaveBeenCalledWith("phone");
    expect(data).toEqual(result);
    expect(error).toBeNull();
  });

  it("카테고리는 getByCategory로 조회한다", async () => {
    const getByCategory = vi.fn().mockResolvedValue(result);
    const service = new ProductService(createApi({ getByCategory }));

    const [data, error] = await service.getProductsByCategory("smartphones");

    expect(getByCategory).toHaveBeenCalledWith("smartphones");
    expect(data).toEqual(result);
    expect(error).toBeNull();
  });

  it("상품 단건 조회 결과를 성공 튜플로 반환한다", async () => {
    const product = { id: 1, title: "마스카라" };
    const getById = vi.fn().mockResolvedValue(product);
    const service = new ProductService(createApi({ getById }));

    const [data, error] = await service.getProduct(1);

    expect(getById).toHaveBeenCalledWith(1);
    expect(data).toEqual(product);
    expect(error).toBeNull();
  });

  it("조회 실패는 에러 응답으로 치환한다", async () => {
    const getAll = vi.fn().mockRejectedValue(new Error("network"));
    const service = new ProductService(createApi({ getAll }));

    const [data, error] = await service.getProducts();

    expect(data).toBeNull();
    expect(error?.message).toBe("Unknown Error");
  });
});
