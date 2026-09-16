import { describe, expect, it, vi } from "vitest";
import type { ProductListType } from "@/service/product/product.interface";
import { ProductService } from "./product.service";

const result: ProductListType = {
  products: [],
  total: 0,
  skip: 0,
  limit: 10
};

describe("상품 서비스", () => {
  it("BFF 조회 결과를 성공 튜플로 반환한다", async () => {
    const getAll = vi.fn().mockResolvedValue(result);
    const service = new ProductService({ getAll });

    const [data, error] = await service.getProducts();

    expect(getAll).toHaveBeenCalledOnce();
    expect(data).toEqual(result);
    expect(error).toBeNull();
  });

  it("조회 실패는 에러 응답으로 치환한다", async () => {
    const getAll = vi.fn().mockRejectedValue(new Error("network"));
    const service = new ProductService({ getAll });

    const [data, error] = await service.getProducts();

    expect(data).toBeNull();
    expect(error?.message).toBe("network");
  });
});
