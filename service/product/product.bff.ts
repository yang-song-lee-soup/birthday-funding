import { ProductListResponse } from "@/app/service/product/product.interface";
import { AppService } from "@/lib/app/app-service";

export class ProductAPI extends AppService {
  protected async getAll() {
    return await this.httpClient
      .get<ProductListResponse>("/api/product")
      .request();
  }
}
