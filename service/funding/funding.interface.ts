import type { Tables } from "@/lib/supabase/database.types";
import type { ProductDto } from "../product/product.interface";

export type FundingRow = Tables<"funding">;

export type InsertFundingInput = {
  userId: string;
  product: ProductDto;
};

export type AddFundingParams = {
  userId: string | null | undefined;
  product: ProductDto | null;
};
