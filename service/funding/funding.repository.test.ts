import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductDto } from "../product/product.interface";
const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  single: vi.fn(),
  select: vi.fn(),
  insert: vi.fn(),
  from: vi.fn()
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient
}));

import { insertFunding } from "./funding.repository";

const product: ProductDto = {
  id: 42,
  title: "테스트 상품",
  description: "설명",
  category: "beauty",
  price: 9.99,
  discountPercentage: 12.5,
  rating: 4.86,
  stock: 10,
  tags: [],
  sku: "SKU-1",
  weight: 1,
  dimensions: { width: 1, height: 2, depth: 3 },
  warrantyInformation: "1년",
  shippingInformation: "3일",
  availabilityStatus: "In Stock",
  reviews: [],
  returnPolicy: "30일",
  minimumOrderQuantity: 1,
  meta: {
    createdAt: "2024-01-01",
    updatedAt: "2024-01-02",
    barcode: "123",
    qrCode: "qr"
  },
  thumbnail: "https://example.com/thumb.png",
  images: ["https://example.com/a.png", "https://example.com/b.png"],
  brand: "Brand"
};

const fundingRow = {
  id: 1,
  product_id: 42,
  user_id: "user-1",
  description: product.description,
  category: product.category,
  price: product.price,
  discount_percentage: product.discountPercentage,
  rating: product.rating,
  brand: product.brand ?? null,
  images: product.images,
  thumbnail: product.thumbnail,
  created_at: "2026-01-01T00:00:00.000Z"
};

function mockSupabaseChain() {
  mocks.single.mockReset();
  mocks.select.mockReset();
  mocks.insert.mockReset();
  mocks.from.mockReset();

  mocks.select.mockReturnValue({ single: mocks.single });
  mocks.insert.mockReturnValue({ select: mocks.select });
  mocks.from.mockReturnValue({ insert: mocks.insert });
  mocks.createServerClient.mockResolvedValue({ from: mocks.from });
}

describe("insertFunding", () => {
  beforeEach(() => {
    mockSupabaseChain();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("ProductDto를 funding 테이블 컬럼으로 매핑해 insert한다", async () => {
    mocks.single.mockResolvedValue({ data: fundingRow, error: null });

    const result = await insertFunding({ userId: "user-1", product });

    expect(mocks.from).toHaveBeenCalledWith("funding");
    expect(mocks.insert).toHaveBeenCalledWith({
      user_id: "user-1",
      product_id: 42,
      description: "설명",
      category: "beauty",
      price: 9.99,
      discount_percentage: 12.5,
      rating: 4.86,
      brand: "Brand",
      images: product.images,
      thumbnail: product.thumbnail
    });
    expect(mocks.select).toHaveBeenCalled();
    expect(mocks.single).toHaveBeenCalled();
    expect(result).toEqual(fundingRow);
  });

  it("brand가 없으면 null로 넣는다", async () => {
    mocks.single.mockResolvedValue({
      data: { ...fundingRow, brand: null },
      error: null
    });
    const { brand: _brand, ...productWithoutBrand } = product;

    await insertFunding({ userId: "user-1", product: productWithoutBrand });

    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({ brand: null })
    );
  });

  it("Supabase 오류는 ADD_FUNDING_FAILED AppError로 변환한다", async () => {
    mocks.single.mockResolvedValue({
      data: null,
      error: { message: "RLS", code: "42501" }
    });

    await expect(
      insertFunding({ userId: "user-1", product })
    ).rejects.toMatchObject({
      error: "ADD_FUNDING_FAILED",
      message: "펀딩 추가에 실패했습니다."
    });
  });

  it("insert 결과 data가 없으면 AppError를 던진다", async () => {
    mocks.single.mockResolvedValue({ data: null, error: null });

    await expect(
      insertFunding({ userId: "user-1", product })
    ).rejects.toMatchObject({
      error: "ADD_FUNDING_FAILED"
    });
  });
});
