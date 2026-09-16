import { type HttpClientInterface } from "@/lib/http";
import type { ProductListDto } from "./product.interface";
import { createProductHttpClient } from "@/lib/app/app-http-client";

export class ProductExternalAPI {
  constructor(
    private readonly httpClient: HttpClientInterface = createProductHttpClient()
  ) {}

  async getAll(): Promise<ProductListDto> {
    return await this.httpClient.get<ProductListDto>("/products").request();
  }
}
