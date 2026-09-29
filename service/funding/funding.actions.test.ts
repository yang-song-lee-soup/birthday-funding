import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/error";
import type { ProductDto } from "../product/product.interface";

const { insertFunding } = vi.hoisted(() => ({
  insertFunding: vi.fn()
}));

vi.mock("./funding.repository", () => ({
  insertFunding
}));

import { addFundingAction } from "./funding.actions";

const product = { id: 1, title: "상품" } as ProductDto;

const fundingRow = {
  id: 10,
  product_id: 1,
  user_id: "user-1",
  description: null,
  category: null,
  price: null,
  discount_percentage: null,
  rating: null,
  brand: null,
  images: null,
  thumbnail: null,
  created_at: "2026-01-01T00:00:00.000Z"
};

describe("addFundingAction", () => {
  beforeEach(() => {
    insertFunding.mockReset();
  });

  it("userId가 없으면 USER_NOT_FOUND 튜플을 반환한다", async () => {
    const [data, error] = await addFundingAction({
      userId: undefined,
      product
    });

    expect(data).toBeNull();
    expect(error).toEqual({
      service: "funding",
      error: "USER_NOT_FOUND",
      status: 403,
      message: "유저 정보가 없습니다."
    });
    expect(insertFunding).not.toHaveBeenCalled();
  });

  it("product가 없으면 PRODUCT_NOT_FOUND 튜플을 반환한다", async () => {
    const [data, error] = await addFundingAction({
      userId: "user-1",
      product: null
    });

    expect(data).toBeNull();
    expect(error).toEqual({
      service: "funding",
      error: "PRODUCT_NOT_FOUND",
      status: 400,
      message: "상품 정보가 없습니다."
    });
    expect(insertFunding).not.toHaveBeenCalled();
  });

  it("성공하면 funding row와 null 튜플을 반환한다", async () => {
    insertFunding.mockResolvedValue(fundingRow);

    const [data, error] = await addFundingAction({
      userId: "user-1",
      product
    });

    expect(insertFunding).toHaveBeenCalledWith({
      userId: "user-1",
      product
    });
    expect(data).toEqual(fundingRow);
    expect(error).toBeNull();
  });

  it("insertFunding 실패는 extractError 튜플로 반환한다", async () => {
    insertFunding.mockRejectedValue(
      new AppError({
        service: "funding",
        error: "ADD_FUNDING_FAILED",
        status: 500,
        message: "펀딩 추가에 실패했습니다."
      })
    );

    const [data, error] = await addFundingAction({
      userId: "user-1",
      product
    });

    expect(data).toBeNull();
    expect(error).toEqual({
      service: "funding",
      error: "ADD_FUNDING_FAILED",
      status: 500,
      message: "펀딩 추가에 실패했습니다."
    });
  });
});
