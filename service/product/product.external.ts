import { type HttpClientInterface } from "@/lib/http";
import type { ProductDto, ProductListDto } from "./product.interface";
import { createProductHttpClient } from "@/lib/app/app-http-client";

export class ProductExternalAPI {
  constructor(
    private readonly httpClient: HttpClientInterface = createProductHttpClient()
  ) {}

  async getAll(): Promise<ProductListDto> {
    return this.httpClient.get<ProductListDto>("/products").request();
  }

  async search(query: string): Promise<ProductListDto> {
    return this.httpClient
      .get<ProductListDto>("/products/search", { query: { q: query } })
      .request();
  }

  async getByCategory(category: string): Promise<ProductListDto> {
    return this.httpClient
      .get<ProductListDto>(`/products/category/${category}`)
      .request();
  }

  async getById(id: number): Promise<ProductDto> {
    return this.httpClient.get<ProductDto>(`/products/${id}`).request();
  }
}
