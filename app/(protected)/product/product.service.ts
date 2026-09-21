import { toResult } from "@/lib/app/app-result";
import type {
  ProductDto,
  ProductListType
} from "@/service/product/product.interface";

export class ProductService {
  constructor(
    private readonly productApi: {
      getAll(): Promise<ProductListType>;
      search(query: string): Promise<ProductListType>;
      getByCategory(category: string): Promise<ProductListType>;
      getById(id: number): Promise<ProductDto>;
    }
  ) {}

  getProducts() {
    return toResult(this.productApi.getAll());
  }

  searchProducts(query: string) {
    return toResult(this.productApi.search(query));
  }

  getProductsByCategory(category: string) {
    return toResult(this.productApi.getByCategory(category));
  }

  getProduct(id: number) {
    return toResult(this.productApi.getById(id));
  }
}
