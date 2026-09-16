import { toResult } from "@/lib/app/app-result";
import type { PublicInterface } from "@/lib/types";
import { ProductAPI } from "@/service/product/product.bff";

export class ProductService {
  constructor(
    private readonly productApi: PublicInterface<ProductAPI> = new ProductAPI()
  ) {}

  getProducts() {
    return toResult(this.productApi.getAll());
  }
}
