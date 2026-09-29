import { type HttpClientInterface } from "@/lib/http";
import type { ProductDto, ProductListDto } from "./product.interface";
import { createProductHttpClient } from "@/lib/app/app-http-client";

export class ProductExternalAPI {
  constructor(
    private readonly httpClient: HttpClientInterface = createProductHttpClient()
  ) {}

  getAll() {
    return this.httpClient.get<ProductListDto>("/products");
  }

  search(query: string) {
    return this.httpClient.get<ProductListDto>("/products/search", {
      query: { q: query }
    });
  }

  getByCategory(category: string) {
    return this.httpClient.get<ProductListDto>(
      `/products/category/${category}`
    );
  }

  getById(id: number) {
    return this.httpClient.get<ProductDto>(`/products/${id}`);
  }
}
