import "server-only";

import { createServerClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/lib/supabase/database.types";
import { AppError } from "@/lib/error";
import type { ProductDto } from "../product/product.interface";
import type { FundingRow, InsertFundingInput } from "./funding.interface";

function toFundingInsert(
  userId: string,
  product: ProductDto
): TablesInsert<"funding"> {
  return {
    user_id: userId,
    product_id: product.id,
    description: product.description,
    category: product.category,
    price: product.price,
    discount_percentage: product.discountPercentage,
    rating: product.rating,
    brand: product.brand ?? null,
    images: product.images,
    thumbnail: product.thumbnail
  };
}

/** Supabase `funding` 테이블 접근(DAL). */
export async function insertFunding({
  userId,
  product
}: InsertFundingInput): Promise<FundingRow> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("funding")
    .insert(toFundingInsert(userId, product))
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new AppError({
      service: "funding",
      error: "ADD_FUNDING_FAILED",
      status: 500,
      message: "펀딩 추가에 실패했습니다."
    });
  }

  if (!data) {
    throw new AppError({
      service: "funding",
      error: "ADD_FUNDING_FAILED",
      status: 500,
      message: "펀딩 추가에 실패했습니다."
    });
  }

  return data;
}
