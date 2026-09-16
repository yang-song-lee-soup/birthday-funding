import { describe, expect, it } from "vitest";
import { toProduct, toProductList } from "./product.utils";
import { ProductDto } from "./product.interface";

const dto: ProductDto = {
  id: 1,
  title: "Essence Mascara Lash Princess",
  description: "볼륨과 길이를 살려주는 마스카라",
  category: "beauty",
  price: 9.99,
  discountPercentage: 7.17,
  rating: 4.94,
  stock: 5,
  tags: ["beauty", "mascara"],
  brand: "Essence",
  sku: "RCH45Q1A",
  weight: 2,
  dimensions: { width: 23.17, height: 14.43, depth: 28.01 },
  warrantyInformation: "1 month warranty",
  shippingInformation: "Ships in 1 month",
  availabilityStatus: "Low Stock",
  reviews: [
    {
      rating: 5,
      comment: "Very satisfied!",
      date: "2024-05-23T08:56:21.618Z",
      reviewerName: "Scarlett Wright",
      reviewerEmail: "scarlett.wright@x.dummyjson.com"
    }
  ],
  returnPolicy: "30 days return policy",
  minimumOrderQuantity: 24,
  meta: {
    createdAt: "2024-05-23T08:56:21.618Z",
    updatedAt: "2024-05-23T08:56:21.618Z",
    barcode: "9164035109868",
    qrCode: "https://example.com/qr.png"
  },
  thumbnail: "https://example.com/mascara.png",
  images: ["https://example.com/mascara.png"]
};

describe("상품 매퍼", () => {
  it("외부 응답에서 도메인이 쓰는 필드만 남긴다", () => {
    expect(toProduct(dto)).toEqual({
      id: 1,
      title: "Essence Mascara Lash Princess",
      description: "볼륨과 길이를 살려주는 마스카라",
      category: "beauty",
      brand: "Essence",
      price: 9.99,
      rating: 4.94,
      stock: 5,
      thumbnail: "https://example.com/mascara.png"
    });
  });

  it("brand가 없으면 undefined로 둔다", () => {
    const { brand: _brand, ...withoutBrand } = dto;

    expect(toProduct(withoutBrand).brand).toBeUndefined();
  });

  it("목록의 페이지 정보와 각 상품을 함께 변환한다", () => {
    const list = toProductList({
      products: [dto],
      total: 194,
      skip: 0,
      limit: 30
    });

    expect(list.total).toBe(194);
    expect(list.skip).toBe(0);
    expect(list.limit).toBe(30);
    expect(list.products).toEqual([toProduct(dto)]);
  });
});
