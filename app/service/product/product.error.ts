import { AppError } from "@/lib/error";

export const ProductErrorCode = {
  QUERY_REQUIRED: "QUERY_REQUIRED",
  NAVER_CREDENTIALS_MISSING: "NAVER_CREDENTIALS_MISSING",
  NAVER_SHOP_UNAVAILABLE: "NAVER_SHOP_UNAVAILABLE",
  NAVER_SHOP_FAILED: "NAVER_SHOP_FAILED",
} as const;

export type ProductErrorCode =
  (typeof ProductErrorCode)[keyof typeof ProductErrorCode];

export class ProductServiceError extends AppError {
  constructor(code: ProductErrorCode, status: number, message: string) {
    super({ service: "product", code, status, message });
    this.name = "ProductServiceError";
  }
}
