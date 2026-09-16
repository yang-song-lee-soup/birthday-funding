import { HttpFetch, HttpService, type HttpClientInterface } from "@/lib/http";
import type { ProductListDto } from "./product.dto";
import type { ProductList } from "./product.interface";
import { toProductList } from "./product.mapper";

export class ProductExternalAPI {
  constructor(
    private readonly httpClient: HttpClientInterface = HttpFetch({
      service: HttpService.PRODUCT
    })
  ) {}

  async getAll(): Promise<ProductList> {
    const dto = await this.httpClient
      .get<ProductListDto>("/products")
      .request();

    return toProductList(dto);
  }
}
