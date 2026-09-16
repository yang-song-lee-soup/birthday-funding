import { HttpFetch, HttpService, type HttpClientInterface } from "@/lib/http";
import type { ProductListDto } from "./product.interface";

export class ProductExternalAPI {
  constructor(
    private readonly httpClient: HttpClientInterface = HttpFetch({
      service: HttpService.PRODUCT
    })
  ) {}

  async getAll(): Promise<ProductListDto> {
    return await this.httpClient.get<ProductListDto>("/products").request();
  }
}
