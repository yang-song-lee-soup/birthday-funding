import { ProductListResponse } from "@/app/service/product/product.interface";
import { HttpFetch, HttpService } from "@/lib/http";

export class ProductExternalAPI {
  private readonly http = HttpFetch({ service: HttpService.PRODUCT });

  list() {
    return this.http.get<ProductListResponse>("/products").request();
  }
}
