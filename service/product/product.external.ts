import { HttpFetch, HttpService, type HttpClientInterface } from "@/lib/http";
import type { ProductList, ProductListDto } from "./product.interface";
import { toProductList } from "./product.utils";

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
