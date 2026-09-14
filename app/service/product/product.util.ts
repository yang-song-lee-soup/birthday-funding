import type {
  NaverShopItem,
  Product,
  ProductSearchParams,
} from "./product.interface";
import { getSearchParams } from "@/lib/parse";
import { ProductErrorCode, ProductServiceError } from "./product.error";

export function mapNaverItemToProduct(item: NaverShopItem): Product {
  return {
    id: item.productId,
    title: stripHtml(item.title),
    image: item.image,
    price: Number(item.lprice) || 0,
    mallName: item.mallName || "네이버",
    category: [item.category1, item.category2].filter(Boolean).join(" > "),
    link: item.link,
  };
}

export function assertProductQuery(query?: string) {
  if (!query) {
    throw new ProductServiceError(
      ProductErrorCode.QUERY_REQUIRED,
      400,
      "검색어(query)는 필수입니다.",
    );
  }
}

export function parseProductSearchParams(
  searchParams: URLSearchParams,
): ProductSearchParams {
  return getSearchParams<ProductSearchParams>(searchParams);
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "");
}
