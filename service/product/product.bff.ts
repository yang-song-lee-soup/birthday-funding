import { createAppHttpClient } from "@/lib/app/app-http-client";
import type { HttpClientInterface } from "@/lib/http";
import type { ProductList } from "./product.interface";

export class ProductBffAPI {
  constructor(
    private readonly httpClient: HttpClientInterface = createAppHttpClient()
  ) {}

  async getAll(): Promise<ProductList> {
    const { data } = await this.httpClient
      .get<{ data: ProductList }>("/api/product")
      .request();

    return data;
  }
}
