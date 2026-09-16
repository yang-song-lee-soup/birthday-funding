import { toResult } from "@/lib/app/app-result";
import type { ProductList } from "@/service/product/product.interface";

export class ProductService {
  constructor(
    private readonly productApi: { getAll(): Promise<ProductList> }
  ) {}

  getProducts() {
    return toResult(this.productApi.getAll());
  }
}
