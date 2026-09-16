import { toResult } from "@/lib/app/app-result";
import type { ProductListType } from "@/service/product/product.interface";

export class ProductService {
  constructor(
    private readonly productApi: { getAll(): Promise<ProductListType> }
  ) {}

  getProducts() {
    return toResult(this.productApi.getAll());
  }
}
