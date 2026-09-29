import { createAppHttpClient } from "@/lib/app/app-http-client";
import type { HttpClientInterface } from "@/lib/http";
import type { ProductListType } from "./product.interface";

export class ProductBffAPI {
  constructor(
    private readonly httpClient: HttpClientInterface = createAppHttpClient()
  ) {}

  getAll() {
    return this.httpClient.get<{ data: ProductListType }>("/api/product");
  }
}
